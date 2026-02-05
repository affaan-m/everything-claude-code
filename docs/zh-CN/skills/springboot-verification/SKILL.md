---
name: springboot-verification
description: Verification loop for Spring Boot projects: build, static analysis, tests with coverage, security scans, and diff review before release or PR.
---

# Spring Boot 验证循环

在提交 PR 前、重大变更后以及部署前运行。

## 阶段 1：构建

```bash
mvn -T 4 clean verify -DskipTests
# or
./gradlew clean assemble -x test
```

如果构建失败，停止并修复。

## 阶段 2：静态分析

Maven（常用插件）：

```bash
mvn -T 4 spotbugs:check pmd:check checkstyle:check
```

Gradle（如果已配置）：

```bash
./gradlew checkstyleMain pmdMain spotbugsMain
```

## 阶段 3：测试 + 覆盖率

```bash
mvn -T 4 test
mvn jacoco:report   # verify 80%+ coverage
# or
./gradlew test jacocoTestReport
```

报告：

* 总测试数，通过/失败
* 覆盖率百分比（行/分支）

## 阶段 4：安全扫描

```bash
# Dependency CVEs
mvn org.owasp:dependency-check-maven:check
# or
./gradlew dependencyCheckAnalyze

# Secrets (git)
git secrets --scan  # if configured
```

## 阶段 5：代码检查/格式化（可选关卡）

```bash
mvn spotless:apply   # if using Spotless plugin
./gradlew spotlessApply
```

## 阶段 6：差异审查

```bash
git diff --stat
git diff
```

检查清单：

* 没有遗留调试日志（`System.out`、`log.debug` 没有防护）
* 有意义的错误信息和 HTTP 状态码
* 在需要的地方有事务和验证
* 配置变更已记录

## 输出模板

```
VERIFICATION REPORT
===================
Build:     [PASS/FAIL]
Static:    [PASS/FAIL] (spotbugs/pmd/checkstyle)
Tests:     [PASS/FAIL] (X/Y passed, Z% coverage)
Security:  [PASS/FAIL] (CVE findings: N)
Diff:      [X files changed]

Overall:   [READY / NOT READY]

Issues to Fix:
1. ...
2. ...
```

## 持续模式

* 在重大变更时或长时间会话中每 30–60 分钟重新运行各阶段
* 保持短循环：`mvn -T 4 test` + spotbugs 以获取快速反馈

**记住**：快速反馈胜过意外惊喜。保持关卡严格——将警告视为生产系统中的缺陷。
