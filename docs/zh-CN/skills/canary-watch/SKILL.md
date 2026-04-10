---
name: canary-watch
description: 使用此技能在部署、合并或依赖项升级后监控已部署的URL是否存在回归问题。
origin: ECC
---

# Canary Watch — 部署后监控

## 何时使用

* 部署到生产或预发布环境后
* 合并有风险的 PR 后
* 当您想验证某个修复是否确实生效时
* 在发布窗口期间进行持续监控
* 依赖项升级后

## 工作原理

监控已部署的 URL 是否存在回归问题。循环运行，直到手动停止或监控窗口到期。

### 监控内容

```
1. HTTP 状态码 — 页面是否返回 200？
2. 控制台错误 — 是否有之前未出现的新错误？
3. 网络请求失败 — 是否有失败的 API 调用、5xx 响应？
4. 性能 — LCP/CLS/INP 指标相较于基线是否有退化？
5. 内容 — 关键元素是否消失？（h1、导航、页脚、行动号召按钮）
6. API 健康状态 — 关键端点是否在 SLA 内响应？
```

### 监控模式

**快速检查**（默认）：单次运行，报告结果

```
/canary-watch https://myapp.com
```

**持续监控**：每隔 N 分钟检查一次，持续 M 小时

```
/canary-watch https://myapp.com --interval 5m --duration 2h
```

**差异模式**：比较预发布环境与生产环境

```
/canary-watch --compare https://staging.myapp.com https://myapp.com
```

### 告警阈值

```yaml
critical:  # immediate alert
  - HTTP status != 200
  - Console error count > 5 (new errors only)
  - LCP > 4s
  - API endpoint returns 5xx

warning:   # flag in report
  - LCP increased > 500ms from baseline
  - CLS > 0.1
  - New console warnings
  - Response time > 2x baseline

info:      # log only
  - Minor performance variance
  - New network requests (third-party scripts added?)
```

### 通知

当超过关键阈值时：

* 桌面通知（macOS/Linux）
* 可选：Slack/Discord webhook
* 记录到 `~/.claude/canary-watch.log`

## 输出

```markdown
## Canary 报告 — myapp.com — 2026-03-23 03:15 PST

### 状态：健康 ✓

| 检查项 | 结果 | 基线 | 差值 |
|-------|--------|----------|-------|
| HTTP | 200 ✓ | 200 | — |
| 控制台错误 | 0 ✓ | 0 | — |
| LCP | 1.8s ✓ | 1.6s | +200ms |
| CLS | 0.01 ✓ | 0.01 | — |
| API /health | 145ms ✓ | 120ms | +25ms |

### 未检测到回归。部署正常。
```

## 集成

可与以下工具配合使用：

* `/browser-qa` 用于部署前验证
* 钩子：在 `git push` 上添加为 PostToolUse 钩子，以便在部署后自动检查
* CI：在 GitHub Actions 的部署步骤后运行
