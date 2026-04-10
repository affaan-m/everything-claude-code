> 此文件在 [common/security.md](../common/security.md) 的基础上扩展了特定于 Web 的安全内容。

# Web 安全规则

## 内容安全策略

始终为生产环境配置 CSP。

### 基于 Nonce 的 CSP

对脚本使用每次请求唯一的 nonce，而不是 `'unsafe-inline'`。

```text
内容安全策略：
  默认来源 'self';
  脚本来源 'self' 'nonce-{RANDOM}' https://cdn.jsdelivr.net;
  样式来源 'self' 'unsafe-inline' https://fonts.googleapis.com;
  图片来源 'self' data: https:;
  字体来源 'self' https://fonts.gstatic.com;
  连接来源 'self' https://*.example.com;
  框架来源 'none';
  对象来源 'none';
  基础URI 'self';
```

根据项目调整来源。不要原封不动地照搬此代码块。

## XSS 防护

* 切勿注入未经净化的 HTML
* 避免使用 `innerHTML` / `dangerouslySetInnerHTML`，除非事先进行了净化
* 对动态模板值进行转义
* 在绝对必要时，使用经过验证的本地净化器对用户 HTML 进行净化

## 第三方脚本

* 异步加载
* 从 CDN 提供服务时使用 SRI
* 每季度进行审计
* 在可行的情况下，对关键依赖项优先选择自托管

## HTTPS 与头部

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## 表单

* 对状态变更的表单实施 CSRF 防护
* 在提交端点实施速率限制
* 在客户端和服务器端都进行验证
* 优先选择蜜罐或轻量级的防滥用控制，而非默认的重度验证码
