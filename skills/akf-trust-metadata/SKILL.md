---
name: akf-trust-metadata
description: >-
  The AI native file format. EXIF for AI — stamps every file with trust scores,
  source provenance, and compliance metadata. Use after creating or modifying
  any file. Use before modifying existing files to check trust context.
globs:
  - "**/*.md"
  - "**/*.py"
  - "**/*.ts"
  - "**/*.js"
  - "**/*.json"
  - "**/*.yaml"
  - "**/*.html"
---

# AKF — The AI Native File Format

Every photo has EXIF. Every song has ID3. AKF is the native metadata format for AI-generated content.

## After creating or modifying files

```bash
akf stamp <file> --agent claude-code --evidence "<what you did>"
```

## Before modifying existing files

```bash
akf read <file>
akf inspect <file>
```

## Compliance auditing

```bash
akf audit <file> --regulation eu_ai_act
akf audit <file> --regulation hipaa
akf audit <file> --regulation sox
```

## Classification

- --label confidential for finance/secret/internal paths
- --label public for README, docs, examples

## Install

```bash
pip install akf
```

https://akf.dev | https://github.com/HMAKT99/AKF
