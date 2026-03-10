---
slug: build_fastapi_api
title: Build a FastAPI API with health checks
tags: python, fastapi, api, backend
---

# Build a FastAPI API with health checks

## Problem
Need a reusable path for building a small FastAPI service that starts cleanly, exposes a health route, and is easy to verify in automation.

## Steps
- Define the API boundary and request-validation rules up front.
- Create the FastAPI app entrypoint and register a health endpoint.
- Add any required settings loading and dependency wiring.
- Start the service locally and verify the health route responds with success.
- Save the tested service layout and verification command into the skill library.

## Tools Used
- write_file
- terminal_command
- read_file

## Common Failures
- The app starts locally but import paths break in tests or production.
- Settings are loaded at import time and crash the app before routing is available.
- The health endpoint exists but no command verifies it during evaluation.

## Reusable Pattern
Define the contract first, wire a minimal FastAPI app, add a health route, verify it through an automated command, and store the validated scaffold as procedural memory.
