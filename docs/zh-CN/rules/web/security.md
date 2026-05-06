> 此文件扩展了 [common/security.md](../common/security.md)，增加了 Web 特有的安全内容。

# Web 安全规则

## 内容安全策略

始终配置生产环境的 CSP。

### 基于 Nonce 的 CSP

对脚本使用每个请求的 nonce，而不是 `'unsafe-inline'`。

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.example.com;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
```

根据项目调整来源。不要原封不动地照搬此代码块。

## XSS 防护

* 绝不注入未净化的 HTML
* 除非先进行净化，否则避免使用 `innerHTML` / `dangerouslySetInnerHTML`
* 对动态模板值进行转义
* 在绝对必要时，使用经过验证的本地净化器对用户 HTML 进行净化

## 第三方脚本

* 异步加载
* 从 CDN 提供时使用 SRI
* 每季度审计
* 在可行的情况下，优先为关键依赖项进行自托管

## HTTPS 和标头

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## 表单

* 对改变状态的表单启用 CSRF 保护
* 对提交端点进行速率限制
* 在客户端和服务器端进行验证
* 优先使用蜜罐或轻量级反滥用控制，而非默认的繁重验证码方案
