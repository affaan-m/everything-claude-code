---
name: springboot-security
description: Java Spring Boot 服务中关于身份验证/授权、验证、CSRF、密钥、标头、速率限制和依赖安全的 Spring Security 最佳实践。
---

# Spring Boot 安全审查

在添加身份验证、处理输入、创建端点或处理密钥时使用。

## 身份验证

* 优先使用无状态 JWT 或带有撤销列表的不透明令牌
* 对于会话，使用 `httpOnly`、`Secure`、`SameSite=Strict` cookie
* 使用 `OncePerRequestFilter` 或资源服务器验证令牌

```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
  private final JwtService jwtService;

  public JwtAuthFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain chain) throws ServletException, IOException {
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (header != null && header.startsWith("Bearer ")) {
      String token = header.substring(7);
      Authentication auth = jwtService.authenticate(token);
      SecurityContextHolder.getContext().setAuthentication(auth);
    }
    chain.doFilter(request, response);
  }
}
```

## 授权

* 启用方法安全：`@EnableMethodSecurity`
* 使用 `@PreAuthorize("hasRole('ADMIN')")` 或 `@PreAuthorize("@authz.canEdit(#id)")`
* 默认拒绝；仅公开必需的 scope

## 输入验证

* 在控制器上使用带有 `@Valid` 的 Bean 验证
* 在 DTO 上应用约束：`@NotBlank`、`@Email`、`@Size`、自定义验证器
* 在渲染之前使用白名单清理任何 HTML

## SQL 注入预防

* 使用 Spring Data 存储库或参数化查询
* 对于原生查询，使用 `:param` 绑定；切勿拼接字符串

## CSRF 保护

* 对于浏览器会话应用程序，保持 CSRF 启用；在表单/头中包含令牌
* 对于使用 Bearer 令牌的纯 API，禁用 CSRF 并依赖无状态身份验证

```java
http
  .csrf(csrf -> csrf.disable())
  .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
```

## 密钥管理

* 源代码中不包含密钥；从环境变量或 vault 加载
* 保持 `application.yml` 不包含凭据；使用占位符
* 定期轮换令牌和数据库凭据

## 安全头

```java
http
  .headers(headers -> headers
    .contentSecurityPolicy(csp -> csp
      .policyDirectives("default-src 'self'"))
    .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
    .xssProtection(Customizer.withDefaults())
    .referrerPolicy(rp -> rp.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER)));
```

## 速率限制

* 在昂贵的端点上应用 Bucket4j 或网关级限制
* 记录突发流量并告警；返回 429 并提供重试提示

## 依赖项安全

* 在 CI 中运行 OWASP Dependency Check / Snyk
* 保持 Spring Boot 和 Spring Security 在受支持的版本
* 对已知 CVE 使构建失败

## 日志记录和 PII

* 切勿记录密钥、令牌、密码或完整的 PAN 数据
* 擦除敏感字段；使用结构化 JSON 日志记录

## 文件上传

* 验证大小、内容类型和扩展名
* 存储在 Web 根目录之外；如果需要则进行扫描

## 发布前检查清单

* \[ ] 身份验证令牌已验证并正确过期
* \[ ] 每个敏感路径都有授权守卫
* \[ ] 所有输入都已验证和清理
* \[ ] 没有字符串拼接的 SQL
* \[ ] CSRF 策略适用于应用程序类型
* \[ ] 密钥已外部化；未提交任何密钥
* \[ ] 安全头已配置
* \[ ] API 有速率限制
* \[ ] 依赖项已扫描并保持最新
* \[ ] 日志不包含敏感数据

**记住**：默认拒绝、验证输入、最小权限、优先采用安全配置。
