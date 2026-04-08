---
name: quarkus-verification
description: "Quarkus项目验证循环：构建、静态分析、带覆盖率的测试、安全扫描、原生编译以及发布或PR前的diff审查。"
origin: ECC
---

# Quarkus 验证循环

在PR前、重大变更后和部署前运行。

## 何时激活

- 为Quarkus服务打开PR前
- 大规模重构或依赖升级后
- 预发布或生产的部署前验证
- 运行完整的构建 → lint → 测试 → 安全扫描 → 原生编译流水线
- 验证测试覆盖率达到阈值（80%+）
- 测试原生镜像兼容性

## 阶段1: 构建

```bash
# Maven
mvn clean verify -DskipTests

# Gradle
./gradlew clean assemble -x test
```

构建失败时，停止并修复编译错误。

## 阶段2: 静态分析

### Checkstyle、PMD、SpotBugs（Maven）

```bash
mvn checkstyle:check pmd:check spotbugs:check
```

### SonarQube（如已配置）

```bash
mvn sonar:sonar \
  -Dsonar.projectKey=my-quarkus-project \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=${SONAR_TOKEN}
```

### 需要解决的常见问题

- 未使用的导入或变量
- 复杂方法（高圈复杂度）
- 潜在的空指针解引用
- SpotBugs标记的安全问题

## 阶段3: 测试 + 覆盖率

```bash
# 运行所有测试
mvn clean test

# 生成覆盖率报告
mvn jacoco:report

# 强制覆盖率阈值（80%）
mvn jacoco:check

# 或使用Gradle
./gradlew test jacocoTestReport jacocoTestCoverageVerification
```

### 测试类别

#### 单元测试
使用模拟依赖测试服务逻辑:

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
  @Mock UserRepository userRepository;
  @InjectMocks UserService userService;

  @Test
  void createUser_validInput_returnsUser() {
    var dto = new CreateUserDto("Alice", "alice@example.com");
    var expected = new User();
    expected.id = 1L;
    expected.name = dto.name();
    
    when(userRepository.persist(any(User.class))).thenReturn(expected);

    User result = userService.create(dto);

    assertThat(result.name).isEqualTo("Alice");
    verify(userRepository).persist(any(User.class));
  }
}
```

#### 集成测试
使用真实数据库（Testcontainers）测试:

```java
@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
class UserRepositoryIntegrationTest {

  @Inject
  UserRepository userRepository;

  @Test
  @Transactional
  void findByEmail_existingUser_returnsUser() {
    User user = new User();
    user.name = "Alice";
    user.email = "alice@example.com";
    userRepository.persist(user);

    Optional<User> found = userRepository.findByEmail("alice@example.com");

    assertThat(found).isPresent();
    assertThat(found.get().name).isEqualTo("Alice");
  }
}
```

#### API测试
使用REST Assured测试REST端点:

```java
@QuarkusTest
class UserResourceTest {

  @Test
  void createUser_validInput_returns201() {
    given()
        .contentType(ContentType.JSON)
        .body("""
            {"name": "Alice", "email": "alice@example.com"}
            """)
        .when().post("/api/users")
        .then()
        .statusCode(201)
        .body("name", equalTo("Alice"));
  }

  @Test
  void createUser_invalidEmail_returns400() {
    given()
        .contentType(ContentType.JSON)
        .body("""
            {"name": "Alice", "email": "invalid"}
            """)
        .when().post("/api/users")
        .then()
        .statusCode(400);
  }
}
```

### 覆盖率报告

检查`target/site/jacoco/index.html`获取详细覆盖率:
- 总体行覆盖率（目标: 80%+）
- 分支覆盖率（目标: 70%+）
- 识别未覆盖的关键路径

## 阶段4: 安全扫描

### 依赖漏洞（Maven）

```bash
mvn org.owasp:dependency-check-maven:check
```

查看`target/dependency-check-report.html`中的CVE。

### Quarkus安全审计

```bash
# 检查有漏洞的扩展
mvn quarkus:audit

# 列出所有扩展
mvn quarkus:list-extensions
```

### 常见安全检查

- [ ] 所有密钥在环境变量中（不在代码中）
- [ ] 所有端点有输入验证
- [ ] 认证/授权已配置
- [ ] CORS正确配置
- [ ] 安全头已设置
- [ ] 密码使用BCrypt哈希
- [ ] SQL注入保护（参数化查询）
- [ ] 公共端点有速率限制

## 阶段5: 原生编译

测试GraalVM原生镜像兼容性:

```bash
# 构建原生可执行文件
mvn package -Dnative

# 或使用容器
mvn package -Dnative -Dquarkus.native.container-build=true

# 测试原生可执行文件
./target/*-runner

# 运行基本冒烟测试
curl http://localhost:8080/q/health/live
curl http://localhost:8080/q/health/ready
```

### 原生镜像故障排除

常见问题:
- **Reflection**: 为动态类添加反射配置
- **Resources**: 使用`quarkus.native.resources.includes`包含资源
- **JNI**: 使用原生库时注册JNI类

反射配置示例:
```java
@RegisterForReflection(targets = {MyDynamicClass.class})
public class ReflectionConfiguration {}
```

## 阶段6: 健康检查

```bash
# 存活检查
curl http://localhost:8080/q/health/live

# 就绪检查
curl http://localhost:8080/q/health/ready

# 所有健康检查
curl http://localhost:8080/q/health

# 指标（如启用）
curl http://localhost:8080/q/metrics
```

## 验证清单

### 代码质量
- [ ] 构建无警告通过
- [ ] 静态分析干净（无高/中问题）
- [ ] 代码遵循团队规范
- [ ] PR中无注释代码或TODO

### 测试
- [ ] 所有测试通过
- [ ] 代码覆盖率 ≥ 80%
- [ ] 使用真实数据库的集成测试
- [ ] 安全测试通过
- [ ] 性能在可接受范围内

### 安全
- [ ] 无依赖漏洞
- [ ] 认证/授权已测试
- [ ] 输入验证完成
- [ ] 源代码中无密钥
- [ ] 安全头已配置

### 部署
- [ ] 原生编译成功
- [ ] 容器镜像可构建
- [ ] 健康检查正确响应
- [ ] 目标环境配置有效

## 自动化验证脚本

```bash
#!/bin/bash
set -e

echo "=== 阶段1: 构建 ==="
mvn clean verify -DskipTests

echo "=== 阶段2: 静态分析 ==="
mvn checkstyle:check pmd:check spotbugs:check

echo "=== 阶段3: 测试 + 覆盖率 ==="
mvn test jacoco:report jacoco:check

echo "=== 阶段4: 安全扫描 ==="
mvn org.owasp:dependency-check-maven:check

echo "=== 阶段5: 原生编译 ==="
mvn package -Dnative -Dquarkus.native.container-build=true

echo "=== 所有阶段完成 ==="
echo "查看报告:"
echo "  - 覆盖率: target/site/jacoco/index.html"
echo "  - 安全: target/dependency-check-report.html"
echo "  - 原生: target/*-runner"
```

## 最佳实践

- 每次PR前运行验证循环
- 在CI/CD流水线中自动化
- 立即修复问题，不积累技术债务
- 保持覆盖率在80%以上
- 定期更新依赖
- 定期测试原生编译
- 监控性能趋势
- 记录破坏性变更
- 审查安全扫描结果
- 验证每个环境的配置
