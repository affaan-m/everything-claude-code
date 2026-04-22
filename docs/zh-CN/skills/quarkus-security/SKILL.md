---
name: quarkus-security
description: Quarkus安全最佳实践：认证、授权、JWT/OIDC、RBAC、输入验证、CSRF、密钥管理和依赖安全。
origin: ECC
---

# Quarkus 安全审查

使用认证、授权和输入验证保护Quarkus应用程序的最佳实践。

## 何时激活

- 添加认证（JWT、OIDC、Basic Auth）
- 使用@RolesAllowed或SecurityIdentity实现授权
- 验证用户输入（Bean Validation、自定义验证器）
- 配置CORS或安全头
- 管理密钥（Vault、环境变量、配置源）
- 添加速率限制或暴力破解保护
- 扫描依赖CVE
- 使用MicroProfile JWT或SmallRye JWT

## 认证

### JWT认证

```java
@Path("/api/protected")
@Authenticated
public class ProtectedResource {
  
  @Inject
  JsonWebToken jwt;

  @Inject
  SecurityIdentity securityIdentity;

  @GET
  public Response getData() {
    String username = jwt.getName();
    Set<String> roles = jwt.getGroups();
    return Response.ok(Map.of(
        "username", username,
        "roles", roles,
        "principal", securityIdentity.getPrincipal().getName()
    )).build();
  }
}
```

配置（application.properties）:
```properties
mp.jwt.verify.publickey.location=publicKey.pem
mp.jwt.verify.issuer=https://auth.example.com

# OIDC
quarkus.oidc.auth-server-url=https://auth.example.com/realms/myrealm
quarkus.oidc.client-id=backend-service
quarkus.oidc.credentials.secret=${OIDC_SECRET}
```

### 自定义认证过滤器

```java
@Provider
@Priority(Priorities.AUTHENTICATION)
public class CustomAuthFilter implements ContainerRequestFilter {
  
  @Inject
  SecurityIdentity identity;

  @Override
  public void filter(ContainerRequestContext requestContext) {
    String authHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);
    
    // 头部缺失或格式错误时立即拒绝
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
      return;
    }
    
    String token = authHeader.substring(7);
    if (!validateToken(token)) {
      requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
    }
  }

  private boolean validateToken(String token) {
    // 令牌验证逻辑
    return true;
  }
}
```

## 授权

### 基于角色的访问控制

```java
@Path("/api/admin")
@RolesAllowed("ADMIN")
public class AdminResource {
  
  @GET
  @Path("/users")
  public List<UserDto> listUsers() {
    return userService.findAll();
  }

  @DELETE
  @Path("/users/{id}")
  @RolesAllowed({"ADMIN", "SUPER_ADMIN"})
  public Response deleteUser(@PathParam("id") Long id) {
    userService.delete(id);
    return Response.noContent().build();
  }
}

@Path("/api/users")
public class UserResource {
  
  @Inject
  SecurityIdentity securityIdentity;

  @GET
  @Path("/{id}")
  @RolesAllowed("USER")
  public Response getUser(@PathParam("id") Long id) {
    // 所有权检查
    if (!securityIdentity.hasRole("ADMIN") && 
        !isOwner(id, securityIdentity.getPrincipal().getName())) {
      return Response.status(Response.Status.FORBIDDEN).build();
    }
    return Response.ok(userService.findById(id)).build();
  }
}
```

### 编程式安全

```java
@ApplicationScoped
public class SecurityService {
  
  @Inject
  SecurityIdentity securityIdentity;

  public boolean canAccessResource(Long resourceId) {
    if (securityIdentity.isAnonymous()) {
      return false;
    }
    
    if (securityIdentity.hasRole("ADMIN")) {
      return true;
    }

    String userId = securityIdentity.getPrincipal().getName();
    return resourceRepository.isOwner(resourceId, userId);
  }
}
```

## 输入验证

### Bean Validation

```java
// BAD: 无验证
@POST
public Response createUser(UserDto dto) {
  return Response.ok(userService.create(dto)).build();
}

// GOOD: 验证DTO
public record CreateUserDto(
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Email String email,
    @NotNull @Min(18) @Max(150) Integer age,
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$") String phone
) {}

@POST
@Path("/users")
public Response createUser(@Valid CreateUserDto dto) {
  User user = userService.create(dto);
  return Response.status(Response.Status.CREATED).entity(user).build();
}
```

## SQL注入防护

### Panache Active Record（默认安全）

```java
// GOOD: Panache参数化查询
List<User> users = User.list("email = ?1 and active = ?2", email, true);

Optional<User> user = User.find("username", username).firstResultOptional();

// GOOD: 命名参数
List<User> users = User.list("email = :email and age > :minAge", 
    Parameters.with("email", email).and("minAge", 18));
```

### 原生查询（使用参数）

```java
// BAD: 字符串拼接
@Query(value = "SELECT * FROM users WHERE name = '" + name + "'", nativeQuery = true)

// GOOD: 参数化原生查询
@Entity
public class User extends PanacheEntity {
  public static List<User> findByEmailNative(String email) {
    return getEntityManager()
        .createNativeQuery("SELECT * FROM users WHERE email = :email", User.class)
        .setParameter("email", email)
        .getResultList();
  }
}
```

## 密码哈希

```java
@ApplicationScoped
public class PasswordService {
  
  public String hash(String plainPassword) {
    return BcryptUtil.bcryptHash(plainPassword);
  }

  public boolean verify(String plainPassword, String hashedPassword) {
    return BcryptUtil.matches(plainPassword, hashedPassword);
  }
}
```

## CORS配置

```properties
# application.properties
quarkus.http.cors=true
quarkus.http.cors.origins=https://app.example.com,https://admin.example.com
quarkus.http.cors.methods=GET,POST,PUT,DELETE
quarkus.http.cors.headers=accept,authorization,content-type,x-requested-with
quarkus.http.cors.exposed-headers=Content-Disposition
quarkus.http.cors.access-control-max-age=24H
quarkus.http.cors.access-control-allow-credentials=true
```

## 密钥管理

```properties
# application.properties — 此处不放密钥

# 使用环境变量
quarkus.datasource.username=${DB_USER}
quarkus.datasource.password=${DB_PASSWORD}
quarkus.oidc.credentials.secret=${OIDC_CLIENT_SECRET}

# 或使用Vault
quarkus.vault.url=https://vault.example.com
quarkus.vault.authentication.kubernetes.role=my-role
```

## 速率限制

```java
@ApplicationScoped
public class RateLimitFilter implements ContainerRequestFilter {
  private final Map<String, RateLimiter> limiters = new ConcurrentHashMap<>();

  @Override
  public void filter(ContainerRequestContext requestContext) {
    String clientId = getClientIdentifier(requestContext);
    RateLimiter limiter = limiters.computeIfAbsent(clientId, 
        k -> RateLimiter.create(100.0)); // 每秒100个请求

    if (!limiter.tryAcquire()) {
      requestContext.abortWith(
          Response.status(429)
              .entity(Map.of("error", "Too many requests"))
              .build()
      );
    }
  }
}
```

## 安全头

```java
@Provider
public class SecurityHeadersFilter implements ContainerResponseFilter {
  
  @Override
  public void filter(ContainerRequestContext request, ContainerResponseContext response) {
    MultivaluedMap<String, Object> headers = response.getHeaders();
    
    // 防止点击劫持
    headers.putSingle("X-Frame-Options", "DENY");
    
    // XSS保护
    headers.putSingle("X-Content-Type-Options", "nosniff");
    headers.putSingle("X-XSS-Protection", "1; mode=block");
    
    // HSTS
    headers.putSingle("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    
    // CSP — script-src不要使用'unsafe-inline'，会使XSS保护失效；
    // 请改用nonce或hash
    headers.putSingle("Content-Security-Policy", 
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");
  }
}
```

## 审计日志

```java
@ApplicationScoped
public class AuditService {
  private static final Logger LOG = Logger.getLogger(AuditService.class);

  @Inject
  SecurityIdentity securityIdentity;

  public void logAccess(String resource, String action) {
    String user = securityIdentity.isAnonymous() 
        ? "anonymous" 
        : securityIdentity.getPrincipal().getName();
    
    LOG.infof("AUDIT: user=%s action=%s resource=%s timestamp=%s", 
        user, action, resource, Instant.now());
  }
}
```

## 依赖安全扫描

```bash
# Maven
mvn org.owasp:dependency-check-maven:check

# Gradle
./gradlew dependencyCheckAnalyze

# 检查Quarkus扩展
quarkus extension list --installable
```

## 最佳实践

- 生产环境始终使用HTTPS
- 启用JWT或OIDC进行无状态认证
- 使用`@RolesAllowed`进行声明式授权
- 使用Bean Validation验证所有输入
- 使用BCrypt哈希密码（禁止明文）
- 将密钥存储在Vault或环境变量中
- 使用参数化查询防止SQL注入
- 为所有响应添加安全头
- 为公共端点实现速率限制
- 审计敏感操作
- 保持依赖更新并扫描CVE
- 使用SecurityIdentity进行编程式检查
- 设置适当的CORS策略
- 测试认证和授权路径
