---
name: quarkus-security
description: Quarkusセキュリティのベストプラクティス：認証、認可、JWT/OIDC、RBAC、入力バリデーション、CSRF、シークレット管理、依存関係セキュリティ。
origin: ECC
---

# Quarkus セキュリティレビュー

認証、認可、入力バリデーションによるQuarkusアプリケーションのセキュリティベストプラクティス。

## いつアクティブにするか

- 認証の追加（JWT、OIDC、Basic Auth）
- @RolesAllowedまたはSecurityIdentityによる認可の実装
- ユーザー入力のバリデーション（Bean Validation、カスタムバリデータ）
- CORSまたはセキュリティヘッダーの構成
- シークレット管理（Vault、環境変数、構成ソース）
- レート制限またはブルートフォース保護の追加
- 依存関係のCVEスキャン
- MicroProfile JWTまたはSmallRye JWTの使用

## 認証

### JWT認証

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

構成（application.properties）:
```properties
mp.jwt.verify.publickey.location=publicKey.pem
mp.jwt.verify.issuer=https://auth.example.com

# OIDC
quarkus.oidc.auth-server-url=https://auth.example.com/realms/myrealm
quarkus.oidc.client-id=backend-service
quarkus.oidc.credentials.secret=${OIDC_SECRET}
```

### カスタム認証フィルター

```java
@Provider
@Priority(Priorities.AUTHENTICATION)
public class CustomAuthFilter implements ContainerRequestFilter {
  
  @Inject
  SecurityIdentity identity;

  @Override
  public void filter(ContainerRequestContext requestContext) {
    String authHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);
    
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      String token = authHeader.substring(7);
      if (!validateToken(token)) {
        requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED).build());
      }
    }
  }

  private boolean validateToken(String token) {
    // トークンバリデーションロジック
    return true;
  }
}
```

## 認可

### ロールベースアクセス制御

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
    // オーナーシップチェック
    if (!securityIdentity.hasRole("ADMIN") && 
        !isOwner(id, securityIdentity.getPrincipal().getName())) {
      return Response.status(Response.Status.FORBIDDEN).build();
    }
    return Response.ok(userService.findById(id)).build();
  }

  private boolean isOwner(Long userId, String username) {
    return userService.isOwner(userId, username);
  }
}
```

### プログラマティックセキュリティ

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

## 入力バリデーション

### Bean Validation

```java
// BAD: バリデーションなし
@POST
public Response createUser(UserDto dto) {
  return Response.ok(userService.create(dto)).build();
}

// GOOD: バリデーション付きDTO
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

### カスタムバリデータ

```java
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UsernameValidator.class)
public @interface ValidUsername {
  String message() default "Invalid username format";
  Class<?>[] groups() default {};
  Class<? extends Payload>[] payload() default {};
}

public class UsernameValidator implements ConstraintValidator<ValidUsername, String> {
  @Override
  public boolean isValid(String value, ConstraintValidatorContext context) {
    if (value == null) return false;
    return value.matches("^[a-zA-Z0-9_-]{3,20}$");
  }
}
```

## SQLインジェクション防止

### Panache Active Record（デフォルトで安全）

```java
// GOOD: Panacheによるパラメータ化クエリ
List<User> users = User.list("email = ?1 and active = ?2", email, true);

Optional<User> user = User.find("username", username).firstResultOptional();

// GOOD: 名前付きパラメータ
List<User> users = User.list("email = :email and age > :minAge", 
    Parameters.with("email", email).and("minAge", 18));
```

### ネイティブクエリ（パラメータを使用）

```java
// BAD: 文字列連結
@Query(value = "SELECT * FROM users WHERE name = '" + name + "'", nativeQuery = true)

// GOOD: パラメータ化ネイティブクエリ
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

## パスワードハッシュ

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

## CORS構成

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

## シークレット管理

```properties
# application.properties — ここにシークレットを置かない

# 環境変数を使用
quarkus.datasource.username=${DB_USER}
quarkus.datasource.password=${DB_PASSWORD}
quarkus.oidc.credentials.secret=${OIDC_CLIENT_SECRET}

# またはVaultを使用
quarkus.vault.url=https://vault.example.com
quarkus.vault.authentication.kubernetes.role=my-role
```

## レート制限

```java
@ApplicationScoped
public class RateLimitFilter implements ContainerRequestFilter {
  private final Map<String, RateLimiter> limiters = new ConcurrentHashMap<>();

  @Override
  public void filter(ContainerRequestContext requestContext) {
    String clientId = getClientIdentifier(requestContext);
    RateLimiter limiter = limiters.computeIfAbsent(clientId, 
        k -> RateLimiter.create(100.0)); // 1秒あたり100リクエスト

    if (!limiter.tryAcquire()) {
      requestContext.abortWith(
          Response.status(429)
              .entity(Map.of("error", "Too many requests"))
              .build()
      );
    }
  }

  private String getClientIdentifier(ContainerRequestContext ctx) {
    // IP、APIキー、またはユーザーIDを使用
    return ctx.getHeaderString("X-Forwarded-For");
  }
}
```

## セキュリティヘッダー

```java
@Provider
public class SecurityHeadersFilter implements ContainerResponseFilter {
  
  @Override
  public void filter(ContainerRequestContext request, ContainerResponseContext response) {
    MultivaluedMap<String, Object> headers = response.getHeaders();
    
    // クリックジャッキング防止
    headers.putSingle("X-Frame-Options", "DENY");
    
    // XSS保護
    headers.putSingle("X-Content-Type-Options", "nosniff");
    headers.putSingle("X-XSS-Protection", "1; mode=block");
    
    // HSTS
    headers.putSingle("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    
    // CSP
    headers.putSingle("Content-Security-Policy", 
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
  }
}
```

## 監査ロギング

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

## 依存関係セキュリティスキャン

```bash
# Maven
mvn org.owasp:dependency-check-maven:check

# Gradle
./gradlew dependencyCheckAnalyze

# Quarkusエクステンション確認
quarkus extension list --installable
```

## ベストプラクティス

- 本番環境では常にHTTPSを使用
- ステートレス認証にJWTまたはOIDCを有効化
- 宣言的認可に`@RolesAllowed`を使用
- Bean Validationですべての入力をバリデーション
- BCryptでパスワードをハッシュ（平文禁止）
- シークレットはVaultまたは環境変数に保存
- SQLインジェクション防止にパラメータ化クエリを使用
- すべてのレスポンスにセキュリティヘッダーを追加
- パブリックエンドポイントにレート制限を実装
- 機密操作を監査
- 依存関係を最新に保ちCVEをスキャン
- プログラマティックチェックにSecurityIdentityを使用
- 適切なCORSポリシーを設定
- 認証・認可パスをテスト
