---
name: terraform-patterns
description: Terraform and Infrastructure as Code patterns for cloud resource management, module design, state management, and multi-environment deployment.
origin: ECC
---

# Terraform Patterns

Infrastructure as Code patterns for reliable, repeatable cloud deployments.

## When to Activate

- Provisioning cloud infrastructure
- Designing Terraform modules
- Managing state and environments
- Setting up IaC CI/CD pipelines

## Core Principles

- **Immutable infrastructure**: Replace, don't patch
- **Remote state**: Never commit `.tfstate`
- **Least privilege**: Minimal IAM permissions
- **DRY modules**: Reusable, composable infrastructure

## Module Design

### Input Validation

```hcl
variable "environment" {
  type        = string
  description = "Deployment environment"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "instance_type" {
  type    = string
  default = "t3.medium"

  validation {
    condition     = can(regex("^t3\\.", var.instance_type))
    error_message = "Only t3 instance types are allowed."
  }
}
```

### Module Composition

```hcl
module "vpc" {
  source      = "./modules/vpc"
  environment = var.environment
  cidr_block  = var.vpc_cidr
}

module "database" {
  source      = "./modules/rds"
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
}

module "app" {
  source        = "./modules/ecs"
  environment   = var.environment
  vpc_id        = module.vpc.vpc_id
  subnet_ids    = module.vpc.private_subnet_ids
  db_endpoint   = module.database.endpoint
}
```

## State Management

### Remote State

```hcl
terraform {
  backend "s3" {
    bucket         = "mycompany-terraform-state"
    key            = "services/api/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

### Cross-Stack References

```hcl
data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = "mycompany-terraform-state"
    key    = "networking/vpc/terraform.tfstate"
    region = "us-east-1"
  }
}

resource "aws_instance" "app" {
  subnet_id = data.terraform_remote_state.vpc.outputs.private_subnet_ids[0]
}
```

## Multi-Environment

### Directory Structure

```
infrastructure/
  modules/
    vpc/
    rds/
    ecs/
  environments/
    dev/
      main.tf
      terraform.tfvars
    staging/
      main.tf
      terraform.tfvars
    production/
      main.tf
      terraform.tfvars
```

### Environment-Specific Variables

```hcl
# environments/dev/terraform.tfvars
environment    = "dev"
instance_type  = "t3.small"
instance_count = 1
db_instance    = "db.t3.micro"

# environments/production/terraform.tfvars
environment    = "production"
instance_type  = "t3.xlarge"
instance_count = 3
db_instance    = "db.r6g.large"
```

## Security Patterns

### Secrets Management

```hcl
resource "aws_secretsmanager_secret" "db_password" {
  name = "${var.environment}/database/password"
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = random_password.db.result

  lifecycle {
    ignore_changes = [secret_string]
  }
}

resource "random_password" "db" {
  length  = 32
  special = true
}
```

### S3 Security

```hcl
resource "aws_s3_bucket_public_access_block" "main" {
  bucket = aws_s3_bucket.main.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "main" {
  bucket = aws_s3_bucket.main.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.main.arn
    }
  }
}
```

## Testing

### Validation in CI

```yaml
name: Terraform Validate
on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3

      - name: Format Check
        run: terraform fmt -check -recursive

      - name: Init
        run: terraform init -backend=false

      - name: Validate
        run: terraform validate

      - name: TFLint
        uses: terraform-linters/setup-tflint@v4
      - run: tflint --recursive
```

### Plan on PR

```yaml
      - name: Plan
        run: terraform plan -no-color -out=plan.tfplan
        env:
          AWS_ROLE_ARN: ${{ secrets.TF_ROLE_ARN }}

      - name: Comment Plan
        uses: actions/github-script@v7
        with:
          script: |
            const plan = require('fs').readFileSync('plan.txt', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Terraform Plan\n\`\`\`\n${plan.substring(0, 60000)}\n\`\`\``
            });
```

## Common Commands

```bash
terraform init                    # Initialize
terraform plan                    # Preview changes
terraform apply                   # Apply changes
terraform destroy                 # Tear down
terraform fmt -recursive          # Format all files
terraform validate                # Syntax check
terraform state list              # List managed resources
terraform import                  # Import existing resources
```

**Remember**: Terraform state is your source of truth. Protect it with encryption, locking, and access controls. Always review plans before applying.
