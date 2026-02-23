---
name: infrastructure-as-code
description: Infrastructure as Code patterns for Terraform, OpenTofu, Pulumi, and CloudFormation — module design, state management, CI/CD integration, drift detection, security hardening, and multi-environment deployment.
---

# Infrastructure as Code Patterns

Manage cloud infrastructure declaratively with reproducible, version-controlled, and auditable configurations.

## When to Activate

- Setting up cloud infrastructure with Terraform, OpenTofu, or Pulumi
- Designing reusable Terraform modules
- Managing state files and backends securely
- Integrating IaC into CI/CD pipelines
- Handling multi-environment (dev/staging/prod) deployments
- Detecting and remediating infrastructure drift
- Reviewing IaC code for security and best practices

## Core Principles

1. **Everything is code** — no manual console changes, no ClickOps
2. **State is sacred** — protect state files with encryption, locking, and access control
3. **Modules are the unit of reuse** — compose infrastructure from versioned modules
4. **Plan before apply** — always review the execution plan in CI before applying
5. **Environments are identical** — same modules, different variables

## Terraform Project Structure

### Standard Layout

```
infrastructure/
├── modules/                     # Reusable modules
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── compute/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── database/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
├── environments/
│   ├── dev/
│   │   ├── main.tf              # Compose modules
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   └── prod/
│       ├── main.tf
│       ├── variables.tf
│       ├── terraform.tfvars
│       └── backend.tf
├── .terraform.lock.hcl          # Provider lock file (commit this)
└── .gitignore
```

### .gitignore for Terraform

```gitignore
# Local .terraform directories
**/.terraform/*

# .tfstate files (never commit state)
*.tfstate
*.tfstate.*

# Crash log files
crash.log
crash.*.log

# Sensitive variable files
*.tfvars
!*.tfvars.example

# Override files
override.tf
override.tf.json
*_override.tf
*_override.tf.json
```

## Module Design

### Networking Module Example

```hcl
# modules/networking/variables.tf
variable "project_name" {
  type        = string
  description = "Project name used for resource naming"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "vpc_cidr" {
  type        = string
  default     = "10.0.0.0/16"
  description = "CIDR block for VPC"
}

variable "availability_zones" {
  type        = list(string)
  description = "List of AZs to use"
}
```

```hcl
# modules/networking/main.tf
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-vpc"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_subnet" "public" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone = var.availability_zones[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name        = "${var.project_name}-${var.environment}-public-${count.index}"
    Environment = var.environment
    Type        = "public"
  }
}

resource "aws_subnet" "private" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + length(var.availability_zones))
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name        = "${var.project_name}-${var.environment}-private-${count.index}"
    Environment = var.environment
    Type        = "private"
  }
}
```

```hcl
# modules/networking/outputs.tf
output "vpc_id" {
  value       = aws_vpc.main.id
  description = "ID of the VPC"
}

output "public_subnet_ids" {
  value       = aws_subnet.public[*].id
  description = "IDs of public subnets"
}

output "private_subnet_ids" {
  value       = aws_subnet.private[*].id
  description = "IDs of private subnets"
}
```

## Environment Composition

```hcl
# environments/prod/main.tf
terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "prod"
      ManagedBy   = "terraform"
    }
  }
}

module "networking" {
  source = "../../modules/networking"

  project_name       = var.project_name
  environment        = "prod"
  vpc_cidr           = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

module "database" {
  source = "../../modules/database"

  project_name      = var.project_name
  environment       = "prod"
  vpc_id            = module.networking.vpc_id
  subnet_ids        = module.networking.private_subnet_ids
  instance_class    = "db.r6g.xlarge"
  multi_az          = true                   # HA for production
  deletion_protection = true
}

module "compute" {
  source = "../../modules/compute"

  project_name   = var.project_name
  environment    = "prod"
  vpc_id         = module.networking.vpc_id
  subnet_ids     = module.networking.private_subnet_ids
  instance_type  = "t3.large"
  min_size       = 3
  max_size       = 10
  database_url   = module.database.connection_string
}
```

## State Management

### Remote Backend (S3 + DynamoDB)

```hcl
# environments/prod/backend.tf
terraform {
  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"       # state locking
    kms_key_id     = "alias/terraform-state" # encryption at rest
  }
}
```

### Bootstrap State Backend

```hcl
# bootstrap/main.tf — run this once to create the state backend
resource "aws_s3_bucket" "terraform_state" {
  bucket = "mycompany-terraform-state"
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket                  = aws_s3_bucket.terraform_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
```

## CI/CD Integration

### GitHub Actions Pipeline

```yaml
# .github/workflows/terraform.yml
name: Terraform
on:
  pull_request:
    paths: ["infrastructure/**"]
  push:
    branches: [main]
    paths: ["infrastructure/**"]

permissions:
  id-token: write    # OIDC for AWS
  contents: read
  pull-requests: write

env:
  TF_VERSION: "1.10.0"

jobs:
  plan:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [dev, staging, prod]
    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/terraform-ci
          aws-region: us-east-1

      - name: Terraform Init
        working-directory: infrastructure/environments/${{ matrix.environment }}
        run: terraform init -input=false

      - name: Terraform Validate
        working-directory: infrastructure/environments/${{ matrix.environment }}
        run: terraform validate

      - name: Terraform Plan
        working-directory: infrastructure/environments/${{ matrix.environment }}
        run: terraform plan -input=false -out=tfplan

      - name: Post Plan to PR
        if: github.event_name == 'pull_request'
        uses: borchero/terraform-plan-comment@v2
        with:
          working-directory: infrastructure/environments/${{ matrix.environment }}

  apply:
    needs: plan
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: ${{ matrix.environment }}   # each env has its own approval gate
    strategy:
      max-parallel: 1                 # apply sequentially: dev → staging → prod
      matrix:
        environment: [dev, staging, prod]
    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/terraform-ci
          aws-region: us-east-1

      - name: Terraform Init
        working-directory: infrastructure/environments/${{ matrix.environment }}
        run: terraform init -input=false

      - name: Terraform Apply
        working-directory: infrastructure/environments/${{ matrix.environment }}
        run: terraform apply -input=false -auto-approve
```

## Pulumi Alternative

For teams that prefer TypeScript/Python over HCL, [Pulumi](https://www.pulumi.com/) uses general-purpose languages with the same IaC principles (modules, state, CI/CD, drift detection).

## Security Best Practices

### Secrets Management

```hcl
# NEVER do this:
# password = "my-secret-password"

# DO: Use secrets manager references
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "myapp/prod/db-password"
}

resource "aws_rds_instance" "main" {
  password = data.aws_secretsmanager_secret_version.db_password.secret_string
}

# DO: Use variables marked sensitive
variable "db_password" {
  type      = string
  sensitive = true    # prevents display in plan output
}
```

### Least Privilege IAM

```hcl
# CI/CD role with minimal permissions
resource "aws_iam_role" "terraform_ci" {
  name = "terraform-ci"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRoleWithWebIdentity"
      Effect = "Allow"
      Principal = {
        Federated = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"
      }
      Condition = {
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:myorg/myrepo:*"
        }
      }
    }]
  })
}
```

## Drift Detection

```bash
# Manual drift check
terraform plan -detailed-exitcode
# Exit code 0: no changes
# Exit code 1: error
# Exit code 2: drift detected

# Automated drift detection (cron job)
```

```yaml
# .github/workflows/drift-detection.yml
name: Drift Detection
on:
  schedule:
    - cron: "0 6 * * 1-5"    # weekdays at 6 AM UTC

jobs:
  detect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3

      - name: Check for drift
        working-directory: infrastructure/environments/prod
        run: |
          terraform init -input=false
          if ! terraform plan -detailed-exitcode -input=false; then
            echo "::warning::Infrastructure drift detected in production!"
          fi
```

## IaC Checklist

Before applying infrastructure changes:

- [ ] `terraform validate` passes
- [ ] `terraform plan` reviewed — no unexpected destroys or replacements
- [ ] State backend uses encryption and locking
- [ ] Sensitive values marked with `sensitive = true`
- [ ] No secrets hardcoded in `.tf` files or `.tfvars`
- [ ] Provider versions pinned (`~>` not `>=`)
- [ ] Provider lock file (`.terraform.lock.hcl`) committed
- [ ] Modules have `variables.tf`, `outputs.tf`, and `README.md`
- [ ] CI pipeline runs `plan` on PR and `apply` on merge to main
- [ ] Production `apply` requires manual approval
- [ ] Drift detection scheduled and alerting configured
- [ ] Resources tagged with `Environment`, `ManagedBy`, and `Project`