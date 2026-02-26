---
name: terraform-patterns
description: Terraform and Infrastructure as Code patterns for cloud resource management, module design, state management, and multi-environment deployment.
origin: ECC
---

# Terraform Patterns

## When to Use

Use this skill when the user is:
- Provisioning cloud infrastructure (AWS, GCP, Azure)
- Writing or refactoring Terraform modules
- Managing Terraform state (remote backends, imports, migrations)
- Setting up multi-environment deployments (dev/staging/prod)
- Implementing IAM policies and security configurations
- Creating CI/CD pipelines for infrastructure changes
- Debugging Terraform plan/apply failures
- Designing module composition and reusable components
- Managing secrets in infrastructure code
- Setting up networking, databases, or compute resources

## How It Works

### Immutable Infrastructure

Never modify resources in place. Replace them with new versions.

```hcl
# WRONG: Mutable instance with provisioners that modify in place
resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"

  provisioner "remote-exec" {
    inline = [
      "sudo apt-get update",
      "sudo apt-get install -y nginx",
    ]
  }
}

# CORRECT: Immutable instance using a pre-built AMI
resource "aws_instance" "app" {
  ami           = var.app_ami_id  # Pre-built with Packer
  instance_type = var.instance_type

  user_data = templatefile("${path.module}/user_data.sh", {
    config_bucket = var.config_bucket
    environment   = var.environment
  })

  lifecycle {
    create_before_destroy = true
  }

  tags = merge(var.common_tags, {
    Name = "${var.project}-${var.environment}-app"
  })
}
```

### State Management

Terraform state is the source of truth. Protect it with remote backends, locking, and encryption.

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "environments/production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
    kms_key_id     = "alias/terraform-state"
  }
}

# State lock table
resource "aws_dynamodb_table" "terraform_lock" {
  name         = "terraform-state-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Purpose = "Terraform state locking"
  }
}
```

### Least Privilege

Every resource should have the minimum permissions required to function.

```hcl
# WRONG: Overly permissive policy
resource "aws_iam_role_policy" "app_policy" {
  role   = aws_iam_role.app.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "*"
      Resource = "*"
    }]
  })
}

# CORRECT: Scoped permissions
resource "aws_iam_role_policy" "app_policy" {
  role   = aws_iam_role.app.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ReadFromConfigBucket"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:ListBucket"]
        Resource = [
          aws_s3_bucket.config.arn,
          "${aws_s3_bucket.config.arn}/*",
        ]
      },
      {
        Sid      = "WriteToDataBucket"
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.data.arn}/*"
      },
      {
        Sid      = "PublishToSNS"
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = aws_sns_topic.notifications.arn
      },
    ]
  })
}
```

## Examples

### Module Design

#### Input Variables

Define clear, validated input variables with sensible defaults.

```hcl
# modules/vpc/variables.tf

variable "project" {
  description = "Project name used for resource naming and tagging"
  type        = string

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,20}$", var.project))
    error_message = "Project name must be 3-21 lowercase alphanumeric characters or hyphens, starting with a letter."
  }
}

variable "environment" {
  description = "Deployment environment"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"

  validation {
    condition     = can(cidrhost(var.vpc_cidr, 0))
    error_message = "VPC CIDR must be a valid IPv4 CIDR block."
  }
}

variable "availability_zones" {
  description = "List of availability zones for subnet distribution"
  type        = list(string)

  validation {
    condition     = length(var.availability_zones) >= 2
    error_message = "At least 2 availability zones are required for high availability."
  }
}

variable "enable_nat_gateway" {
  description = "Whether to create NAT gateways for private subnet internet access"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Use a single NAT gateway instead of one per AZ (cost savings for non-production)"
  type        = bool
  default     = false
}

variable "common_tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
  default     = {}
}
```

#### Outputs

Expose only the values that downstream modules need.

```hcl
# modules/vpc/outputs.tf

output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "database_subnet_group_name" {
  description = "Name of the database subnet group"
  value       = aws_db_subnet_group.database.name
}

output "vpc_cidr_block" {
  description = "The CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "nat_gateway_ips" {
  description = "Public IPs of NAT gateways (for allowlisting)"
  value       = aws_eip.nat[*].public_ip
}
```

#### Module Composition

Compose small, focused modules into larger infrastructure.

```hcl
# environments/production/main.tf

module "vpc" {
  source = "../../modules/vpc"

  project            = var.project
  environment        = "production"
  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
  enable_nat_gateway = true
  single_nat_gateway = false
  common_tags        = local.common_tags
}

module "database" {
  source = "../../modules/rds"

  project               = var.project
  environment           = "production"
  vpc_id                = module.vpc.vpc_id
  subnet_group_name     = module.vpc.database_subnet_group_name
  allowed_cidr_blocks   = [module.vpc.vpc_cidr_block]
  instance_class        = "db.r6g.xlarge"
  engine_version        = "15.4"
  multi_az              = true
  backup_retention_days = 30
  deletion_protection   = true
  common_tags           = local.common_tags
}

module "ecs_cluster" {
  source = "../../modules/ecs"

  project           = var.project
  environment       = "production"
  vpc_id            = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  public_subnet_ids  = module.vpc.public_subnet_ids

  services = {
    api = {
      image          = "${var.ecr_registry}/api:${var.api_version}"
      cpu            = 512
      memory         = 1024
      desired_count  = 3
      container_port = 8080
      health_check   = "/health"
    }
    worker = {
      image          = "${var.ecr_registry}/worker:${var.worker_version}"
      cpu            = 1024
      memory         = 2048
      desired_count  = 2
      container_port = 8081
      health_check   = "/health"
    }
  }

  common_tags = local.common_tags
}
```

#### Module Versioning

Pin module versions for reproducibility.

```hcl
# Use versioned modules from a registry
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.4.0"

  name = "${var.project}-${var.environment}"
  cidr = var.vpc_cidr
  # ...
}

# Use versioned modules from a Git repository
module "custom_module" {
  source = "git::https://github.com/myorg/terraform-modules.git//modules/ecs?ref=v2.3.1"
  # ...
}

# Use versioned modules from S3
module "internal_module" {
  source = "s3::https://s3-us-east-1.amazonaws.com/myorg-terraform-modules/ecs/v1.2.0.zip"
  # ...
}
```

### State Management

#### Remote State Data Sources

Reference state from other configurations without tight coupling.

```hcl
# Reference networking state from the app configuration
data "terraform_remote_state" "networking" {
  backend = "s3"

  config = {
    bucket = "mycompany-terraform-state"
    key    = "networking/production/terraform.tfstate"
    region = "us-east-1"
  }
}

resource "aws_security_group" "app" {
  vpc_id = data.terraform_remote_state.networking.outputs.vpc_id

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [data.terraform_remote_state.networking.outputs.vpc_cidr_block]
  }

  tags = {
    Name = "${var.project}-app-sg"
  }
}
```

#### State Import

Import existing resources into Terraform management.

```hcl
# import.tf - Terraform 1.5+ import blocks
import {
  to = aws_s3_bucket.existing_bucket
  id = "my-existing-bucket-name"
}

import {
  to = aws_iam_role.existing_role
  id = "existing-role-name"
}

# Generate the configuration
# Run: terraform plan -generate-config-out=generated.tf

# After import, verify with:
# terraform plan (should show no changes)
```

#### Workspace Management

Use workspaces for lightweight environment separation, or separate state files for full isolation.

```hcl
# Using workspaces for environment separation
locals {
  environment = terraform.workspace

  instance_type_map = {
    dev        = "t3.micro"
    staging    = "t3.small"
    production = "t3.medium"
  }

  instance_count_map = {
    dev        = 1
    staging    = 2
    production = 3
  }

  instance_type  = local.instance_type_map[local.environment]
  instance_count = local.instance_count_map[local.environment]
}

resource "aws_instance" "app" {
  count         = local.instance_count
  ami           = var.ami_id
  instance_type = local.instance_type

  tags = {
    Name        = "${var.project}-${local.environment}-app-${count.index}"
    Environment = local.environment
  }
}
```

### Multi-Environment Deployment

#### Directory Structure

```
infrastructure/
  modules/
    vpc/
      main.tf
      variables.tf
      outputs.tf
    rds/
      main.tf
      variables.tf
      outputs.tf
    ecs/
      main.tf
      variables.tf
      outputs.tf
  environments/
    dev/
      main.tf
      variables.tf
      outputs.tf
      terraform.tfvars
      backend.tf
    staging/
      main.tf
      variables.tf
      outputs.tf
      terraform.tfvars
      backend.tf
    production/
      main.tf
      variables.tf
      outputs.tf
      terraform.tfvars
      backend.tf
```

#### Environment-Specific Variables

```hcl
# environments/dev/terraform.tfvars
project     = "myapp"
environment = "dev"
region      = "us-east-1"

vpc_cidr           = "10.10.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b"]

# Cost-optimized for dev
instance_type      = "t3.micro"
desired_count      = 1
enable_nat_gateway = true
single_nat_gateway = true  # Single NAT to save costs

# Database
db_instance_class        = "db.t3.micro"
db_multi_az              = false
db_backup_retention_days = 7
db_deletion_protection   = false
```

```hcl
# environments/production/terraform.tfvars
project     = "myapp"
environment = "production"
region      = "us-east-1"

vpc_cidr           = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

# Production-grade
instance_type      = "t3.large"
desired_count      = 3
enable_nat_gateway = true
single_nat_gateway = false  # One NAT per AZ for HA

# Database
db_instance_class        = "db.r6g.xlarge"
db_multi_az              = true
db_backup_retention_days = 30
db_deletion_protection   = true
```

#### Shared Configuration with Locals

```hcl
# environments/production/locals.tf

locals {
  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
    Repository  = "github.com/myorg/infrastructure"
    Team        = "platform"
  }

  name_prefix = "${var.project}-${var.environment}"

  # Map environment to resource sizing
  is_production = var.environment == "production"

  # Alarm thresholds by environment
  alarm_thresholds = {
    cpu_utilization    = local.is_production ? 70 : 90
    memory_utilization = local.is_production ? 80 : 95
    error_rate         = local.is_production ? 1 : 10
  }
}
```

### Security Patterns

#### Secrets Management with AWS Secrets Manager

```hcl
# Store secrets externally, reference them in Terraform
data "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = "${var.project}/${var.environment}/database"
}

locals {
  db_credentials = jsondecode(data.aws_secretsmanager_secret_version.db_credentials.secret_string)
}

resource "aws_db_instance" "main" {
  identifier     = "${local.name_prefix}-db"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class

  username = local.db_credentials["username"]
  password = local.db_credentials["password"]

  # Never output sensitive values
  lifecycle {
    ignore_changes = [password]
  }
}

# Create secrets for new resources
resource "aws_secretsmanager_secret" "api_key" {
  name                    = "${var.project}/${var.environment}/api-key"
  description             = "API key for external service integration"
  recovery_window_in_days = var.environment == "production" ? 30 : 0

  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "api_key" {
  secret_id     = aws_secretsmanager_secret.api_key.id
  secret_string = jsonencode({
    key        = var.api_key
    created_at = timestamp()
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}
```

#### Encryption at Rest

```hcl
# KMS key for encryption
resource "aws_kms_key" "main" {
  description             = "Encryption key for ${local.name_prefix}"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "EnableRootAccount"
        Effect    = "Allow"
        Principal = { AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root" }
        Action    = "kms:*"
        Resource  = "*"
      },
      {
        Sid       = "AllowServiceUse"
        Effect    = "Allow"
        Principal = { Service = ["rds.amazonaws.com", "s3.amazonaws.com"] }
        Action    = ["kms:Decrypt", "kms:GenerateDataKey*"]
        Resource  = "*"
      },
    ]
  })

  tags = local.common_tags
}

resource "aws_kms_alias" "main" {
  name          = "alias/${local.name_prefix}"
  target_key_id = aws_kms_key.main.key_id
}

# S3 bucket with encryption
resource "aws_s3_bucket" "data" {
  bucket = "${local.name_prefix}-data"
  tags   = local.common_tags
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.main.arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "data" {
  bucket = aws_s3_bucket.data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

### Testing

#### Terraform Validate and Lint

```yaml
# .github/workflows/terraform-validate.yml
name: Terraform Validate

on:
  pull_request:
    paths:
      - 'infrastructure/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [dev, staging, production]

    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.7.0"

      - name: Terraform Format Check
        run: terraform fmt -check -recursive
        working-directory: infrastructure/

      - name: Terraform Init
        run: terraform init -backend=false
        working-directory: infrastructure/environments/${{ matrix.environment }}

      - name: Terraform Validate
        run: terraform validate
        working-directory: infrastructure/environments/${{ matrix.environment }}

      - name: TFLint
        uses: terraform-linters/setup-tflint@v4
        with:
          tflint_version: latest

      - name: Run TFLint
        run: |
          tflint --init
          tflint --recursive --format compact
        working-directory: infrastructure/
```

#### Terratest Integration Tests

```go
// tests/vpc_test.go
package test

import (
    "testing"

    "github.com/gruntwork-io/terratest/modules/aws"
    "github.com/gruntwork-io/terratest/modules/terraform"
    "github.com/stretchr/testify/assert"
)

func TestVPCModule(t *testing.T) {
    t.Parallel()

    terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
        TerraformDir: "../modules/vpc",
        Vars: map[string]interface{}{
            "project":            "test",
            "environment":        "test",
            "vpc_cidr":           "10.99.0.0/16",
            "availability_zones": []string{"us-east-1a", "us-east-1b"},
            "enable_nat_gateway": false,
            "common_tags": map[string]string{
                "Test": "true",
            },
        },
    })

    defer terraform.Destroy(t, terraformOptions)
    terraform.InitAndApply(t, terraformOptions)

    vpcID := terraform.Output(t, terraformOptions, "vpc_id")
    assert.NotEmpty(t, vpcID)

    publicSubnets := terraform.OutputList(t, terraformOptions, "public_subnet_ids")
    assert.Equal(t, 2, len(publicSubnets))

    privateSubnets := terraform.OutputList(t, terraformOptions, "private_subnet_ids")
    assert.Equal(t, 2, len(privateSubnets))

    vpc := aws.GetVpcById(t, vpcID, "us-east-1")
    assert.Equal(t, "10.99.0.0/16", vpc.CidrBlock)
}

func TestVPCModuleValidation(t *testing.T) {
    t.Parallel()

    terraformOptions := &terraform.Options{
        TerraformDir: "../modules/vpc",
        Vars: map[string]interface{}{
            "project":            "INVALID_NAME",
            "environment":        "dev",
            "vpc_cidr":           "10.0.0.0/16",
            "availability_zones": []string{"us-east-1a", "us-east-1b"},
        },
    }

    _, err := terraform.InitAndPlanE(t, terraformOptions)
    assert.Error(t, err, "Should fail validation for invalid project name")
}
```

#### Plan Review

```hcl
# Sentinel policy for plan review (HashiCorp Sentinel or OPA)
# policies/require_tags.sentinel

import "tfplan/v2" as tfplan

mandatory_tags = ["Project", "Environment", "ManagedBy"]

tagged_resource_types = [
  "aws_instance",
  "aws_s3_bucket",
  "aws_db_instance",
  "aws_ecs_service",
  "aws_lambda_function",
]

all_resources = filter tfplan.resource_changes as _, rc {
  rc.mode is "managed" and
  rc.type in tagged_resource_types and
  (rc.change.actions contains "create" or rc.change.actions contains "update")
}

violations = filter all_resources as _, resource {
  any mandatory_tags as tag {
    resource.change.after.tags[tag] is undefined or
    resource.change.after.tags[tag] is ""
  }
}

main = rule {
  length(violations) is 0
}
```

### CI/CD for Infrastructure

#### Plan on PR, Apply on Merge

```yaml
# .github/workflows/terraform-deploy.yml
name: Terraform Deploy

on:
  pull_request:
    paths:
      - 'infrastructure/**'
  push:
    branches: [main]
    paths:
      - 'infrastructure/**'

permissions:
  id-token: write
  contents: read
  pull-requests: write

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      environments: ${{ steps.changes.outputs.environments }}
    steps:
      - uses: actions/checkout@v4
      - id: changes
        run: |
          environments="[]"
          if [ "${{ github.event_name }}" = "pull_request" ]; then
            BASE_SHA="${{ github.event.pull_request.base.sha }}"
            HEAD_SHA="${{ github.event.pull_request.head.sha }}"
          else
            BASE_SHA="${{ github.event.before }}"
            HEAD_SHA="${{ github.sha }}"
          fi
          for env in dev staging production; do
            if git diff --name-only "$BASE_SHA" "$HEAD_SHA" | grep -q "infrastructure/environments/$env/"; then
              environments=$(echo $environments | jq -c ". + [\"$env\"]")
            fi
          done
          echo "environments=$environments" >> "$GITHUB_OUTPUT"

  plan:
    needs: detect-changes
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: ${{ fromJson(needs.detect-changes.outputs.environments) }}

    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/terraform-plan
          aws-region: us-east-1

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.7.0"

      - name: Terraform Init
        run: terraform init
        working-directory: infrastructure/environments/${{ matrix.environment }}

      - name: Terraform Plan
        id: plan
        run: terraform plan -no-color -out=tfplan
        working-directory: infrastructure/environments/${{ matrix.environment }}

      - name: Comment Plan on PR
        uses: actions/github-script@v7
        with:
          script: |
            const plan = `${{ steps.plan.outputs.stdout }}`;
            const truncated = plan.length > 60000
              ? plan.substring(0, 60000) + '\n\n... (truncated)'
              : plan;

            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `### Terraform Plan - ${{ matrix.environment }}\n\`\`\`\n${truncated}\n\`\`\``
            });

  apply:
    needs: detect-changes
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    strategy:
      max-parallel: 1
      matrix:
        environment: ${{ fromJson(needs.detect-changes.outputs.environments) }}
    environment: ${{ matrix.environment }}

    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/terraform-apply
          aws-region: us-east-1

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.7.0"

      - name: Terraform Init
        run: terraform init
        working-directory: infrastructure/environments/${{ matrix.environment }}

      - name: Terraform Apply
        run: terraform apply -auto-approve
        working-directory: infrastructure/environments/${{ matrix.environment }}
```

#### Drift Detection

```yaml
# .github/workflows/drift-detection.yml
name: Terraform Drift Detection

on:
  schedule:
    - cron: '0 8 * * 1-5'  # Weekdays at 8 AM UTC

jobs:
  drift-check:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [dev, staging, production]

    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/terraform-plan
          aws-region: us-east-1

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.7.0"

      - name: Terraform Init
        run: terraform init
        working-directory: infrastructure/environments/${{ matrix.environment }}

      - name: Detect Drift
        id: drift
        run: |
          set +e
          terraform plan -detailed-exitcode -no-color 2>&1 | tee plan.txt
          exit_code=${PIPESTATUS[0]}
          set -e
          if [ $exit_code -eq 1 ]; then
            echo "::error::Terraform plan failed"
            exit 1
          elif [ $exit_code -eq 2 ]; then
            echo "drift_detected=true" >> "$GITHUB_OUTPUT"
          else
            echo "drift_detected=false" >> "$GITHUB_OUTPUT"
          fi
        working-directory: infrastructure/environments/${{ matrix.environment }}

      - name: Alert on Drift
        if: steps.drift.outputs.drift_detected == 'true'
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK_URL }}" \
            -H 'Content-Type: application/json' \
            -d "{\"text\": \"Terraform drift detected in ${{ matrix.environment }} environment. Review required.\"}"
```
