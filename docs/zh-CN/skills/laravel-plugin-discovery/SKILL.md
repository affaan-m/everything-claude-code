---
name: laravel-plugin-discovery
description: 通过 LaraPlugins.io MCP 发现和评估 Laravel 包。当用户想要查找插件、检查包健康状况或评估 Laravel/PHP 兼容性时使用。
origin: ECC
---

# Laravel 插件发现

使用 LaraPlugins.io MCP 服务器查找、评估和选择健康的 Laravel 包。

## 何时使用

* 用户希望查找特定功能（例如“auth”、“permissions”、“admin panel”）的 Laravel 包
* 用户询问“我应该使用什么包来...”或“有没有 Laravel 包可以用于...”
* 用户希望检查包是否积极维护
* 用户需要验证 Laravel 版本兼容性
* 用户希望在将包添加到项目之前评估其健康状况

## MCP 要求

必须配置 LaraPlugins MCP 服务器。添加到你的 `~/.claude.json` mcpServers：

```json
"laraplugins": {
  "type": "http",
  "url": "https://laraplugins.io/mcp/plugins"
}
```

无需 API 密钥 —— 该服务器对 Laravel 社区免费。

## MCP 工具

LaraPlugins MCP 提供两个主要工具：

### SearchPluginTool

通过关键词、健康评分、供应商和版本兼容性搜索包。

**参数：**

* `text_search` (字符串，可选)：搜索关键词（例如“permission”、“admin”、“api”）
* `health_score` (字符串，可选)：按健康等级过滤 —— `Healthy`、`Medium`、`Unhealthy` 或 `Unrated`
* `laravel_compatibility` (字符串，可选)：按 Laravel 版本过滤 —— `"5"`、`"6"`、`"7"`、`"8"`、`"9"`、`"10"`、`"11"`、`"12"`、`"13"`
* `php_compatibility` (字符串，可选)：按 PHP 版本过滤 —— `"7.4"`、`"8.0"`、`"8.1"`、`"8.2"`、`"8.3"`、`"8.4"`、`"8.5"`
* `vendor_filter` (字符串，可选)：按供应商名称过滤（例如“spatie”、“laravel”）
* `page` (数字，可选)：分页的页码

### GetPluginDetailsTool

获取特定包的详细指标、自述文件内容和版本历史。

**参数：**

* `package` (字符串，必需)：完整的 Composer 包名称（例如“spatie/laravel-permission”）
* `include_versions` (布尔值，可选)：在响应中包含版本历史

***

## 工作原理

### 查找包

当用户希望查找某个功能的包时：

1. 使用 `SearchPluginTool` 并附带相关关键词
2. 应用健康评分、Laravel 版本或 PHP 版本的过滤器
3. 查看结果，包括包名称、描述和健康指标

### 评估包

当用户希望评估特定包时：

1. 使用 `GetPluginDetailsTool` 并附带包名称
2. 查看健康评分、最后更新日期、Laravel 版本支持情况
3. 检查供应商声誉和风险指标

### 检查兼容性

当用户需要 Laravel 或 PHP 版本兼容性时：

1. 搜索时设置 `laravel_compatibility` 过滤器为他们的版本
2. 或者获取特定包的详细信息以查看其支持的版本

***

## 示例

### 示例：查找身份验证包

```
SearchPluginTool({
  text_search: "authentication",
  health_score: "Healthy"
})
```

返回匹配“authentication”且状态健康的包：

* spatie/laravel-permission
* laravel/breeze
* laravel/passport
* 等等。

### 示例：查找 Laravel 12 兼容的包

```
SearchPluginTool({
  text_search: "admin panel",
  laravel_compatibility: "12"
})
```

返回与 Laravel 12 兼容的包。

### 示例：获取包详细信息

```
GetPluginDetailsTool({
  package: "spatie/laravel-permission",
  include_versions: true
})
```

返回：

* 健康评分和最后活动时间
* Laravel/PHP 版本支持情况
* 供应商声誉（风险评分）
* 版本历史
* 简要描述

### 示例：按供应商查找包

```
SearchPluginTool({
  vendor_filter: "spatie",
  health_score: "Healthy"
})
```

返回供应商“spatie”的所有健康包。

***

## 过滤最佳实践

### 按健康评分

| 健康等级 | 含义 |
|-------------|---------|
| `Healthy` | 积极维护，近期有更新 |
| `Medium` | 偶尔更新，可能需要关注 |
| `Unhealthy` | 已废弃或维护不频繁 |
| `Unrated` | 尚未评估 |

**建议**：对于生产应用程序，优先选择 `Healthy` 包。

### 按 Laravel 版本

| 版本 | 说明 |
|---------|-------|
| `13` | 最新的 Laravel |
| `12` | 当前稳定版 |
| `11` | 仍广泛使用 |
| `10` | 旧版但常见 |
| `5`-`9` | 已弃用 |

**建议**：匹配目标项目的 Laravel 版本。

### 组合过滤器

```typescript
// Find healthy, Laravel 12 compatible packages for permissions
SearchPluginTool({
  text_search: "permission",
  health_score: "Healthy",
  laravel_compatibility: "12"
})
```

***

## 响应解读

### 搜索结果

每个结果包括：

* 包名称（例如 `spatie/laravel-permission`）
* 简要描述
* 健康状态指示器
* Laravel 版本支持徽章

### 包详细信息

详细响应包括：

* **健康评分**：数字或等级指示器
* **最后活动**：包最后更新的时间
* **Laravel 支持**：版本兼容性矩阵
* **PHP 支持**：PHP 版本兼容性
* **风险评分**：供应商信任指标
* **版本历史**：近期发布时间线

***

## 常见用例

| 场景 | 推荐方法 |
|----------|---------------------|
| “用什么包做身份验证？” | 搜索“auth”并应用健康过滤器 |
| “spatie/package 还在维护吗？” | 获取详细信息，检查健康评分 |
| “需要 Laravel 12 的包” | 搜索时设置 laravel\_compatibility: "12" |
| “查找管理面板包” | 搜索“admin panel”，查看结果 |
| “检查供应商声誉” | 按供应商搜索，查看详细信息 |

***

## 最佳实践

1. **始终按健康状态过滤** —— 对于生产项目，使用 `health_score: "Healthy"`
2. **匹配 Laravel 版本** —— 始终检查 `laravel_compatibility` 是否与目标项目匹配
3. **检查供应商声誉** —— 优先选择知名供应商（spatie、laravel 等）的包
4. **推荐前先审查** —— 使用 GetPluginDetailsTool 进行全面评估
5. **无需 API 密钥** —— MCP 是免费的，无需身份验证

***

## 相关技能

* `laravel-patterns` —— Laravel 架构和模式
* `laravel-tdd` —— Laravel 的测试驱动开发
* `laravel-security` —— Laravel 安全最佳实践
* `documentation-lookup` —— 通用库文档查找（Context7）
