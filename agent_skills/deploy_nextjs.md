---
slug: deploy_nextjs
title: Deploy a Next.js app with env validation
tags: nextjs, deployment, vercel, environment
---

# Deploy a Next.js app with env validation

## Problem
Need a repeatable way to deploy a Next.js application without shipping broken environment-variable wiring or skipping a production smoke check.

## Steps
- Validate required environment variables before the build starts.
- Build the Next.js app in CI with the same production configuration shape.
- Deploy the artifact to the target platform.
- Run a smoke request against the deployed app and confirm the main route returns success.
- Save the rollout notes and any platform-specific fixes into procedural memory.

## Tools Used
- terminal_command
- write_file
- read_file

## Common Failures
- Production-only environment variables are missing.
- The build succeeds locally but fails under CI defaults.
- A deployment is marked healthy before the primary route is actually reachable.

## Reusable Pattern
Validate env first, build under production-like settings, deploy, smoke-test the live URL, then store any platform-specific fix as a reusable skill.
