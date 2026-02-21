# Makefile — everything-claude-code lifecycle targets
# Usage: make <target>

SHELL := /bin/bash
.DEFAULT_GOAL := help

REPO_ROOT := $(shell pwd)
LOGS_DIR  := $(REPO_ROOT)/logs
VERSION   := $(shell cat VERSION 2>/dev/null | tr -d '[:space:]' || echo "0.0.0")

# ─── Targets ──────────────────────────────────────────────────────────────────

.PHONY: help setup build validate package clean update logs bootstrap

help: ## Show available targets
	@echo ""
	@echo "  everything-claude-code — Makefile targets"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

setup: ## Install dependencies and configure environment
	@bash scripts/check-deps.sh
	@bash scripts/configure-env.sh
	@bash scripts/build.sh --install-only
	@bash scripts/validate.sh

build: ## Build artifacts and package a release bundle
	@bash scripts/build.sh

validate: ## Run the post-install validation suite
	@bash scripts/validate.sh

package: ## Build and package a release bundle (alias for build)
	@bash scripts/build.sh

clean: ## Remove build artifacts (dist/, logs/)
	@echo "Cleaning dist/ and logs/…"
	@rm -rf "$(REPO_ROOT)/dist"
	@rm -rf "$(LOGS_DIR)"
	@echo "✅  Clean complete"

update: ## Pull latest changes and re-run setup
	@echo "Pulling latest changes…"
	@git pull --rebase
	@$(MAKE) setup

logs: ## List recent bootstrap log files
	@if [ -d "$(LOGS_DIR)" ]; then \
	  ls -lt "$(LOGS_DIR)"/*.log 2>/dev/null || echo "No log files found in $(LOGS_DIR)"; \
	else \
	  echo "No logs directory found — run './bootstrap.sh' first"; \
	fi

bootstrap: ## Run the full bootstrap pipeline
	@bash bootstrap.sh
