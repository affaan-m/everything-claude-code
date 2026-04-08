---
name: quarkus-verification
description: "Quarkusプロジェクトの検証ループ: ビルド、静的解析、カバレッジ付きテスト、セキュリティスキャン、ネイティブコンパイル、リリースまたはPR前のdiffレビュー。"
origin: ECC
---

# Quarkus 検証ループ

PR前、大きな変更後、デプロイ前に実行。

## いつアクティブにするか

- Quarkusサービスのプルリクエストを開く前
- 大規模なリファクタリングまたは依存関係アップグレード後
- ステージングまたは本番のデプロイ前検証
- 完全なビルド → lint → テスト → セキュリティスキャン → ネイティブコンパイルパイプラインの実行
- テストカバレッジが閾値を満たしていることの検証（80%以上）
- ネイティブイメージ互換性のテスト

## フェーズ1: ビルド

```bash
# Maven
mvn clean verify -DskipTests

# Gradle
./gradlew clean assemble -x test
```

ビルドが失敗した場合、停止してコンパイルエラーを修正。

## フェーズ2: 静的解析

### Checkstyle、PMD、SpotBugs（Maven）

```bash
mvn checkstyle:check pmd:check spotbugs:check
```

### SonarQube（構成されている場合）

```bash
mvn sonar:sonar \
  -Dsonar.projectKey=my-quarkus-project \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=${SONAR_TOKEN}
```

### 対処すべき一般的な問題

- 未使用のimportまたは変数
- 複雑なメソッド（高い循環的複雑度）
- 潜在的なnullポインター参照
- SpotBugsが検出したセキュリティ問題

## フェーズ3: テスト + カバレッジ

```bash
# すべてのテストを実行
mvn clean test

# カバレッジレポートを生成
mvn jacoco:report

# カバレッジ閾値を強制（80%）
mvn jacoco:check

# またはGradleで
./gradlew test jacocoTestReport jacocoTestCoverageVerification
```

### テストカテゴリ

#### ユニットテスト
モック化された依存関係でサービスロジックをテスト:

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

#### 統合テスト
実データベース（Testcontainers）でテスト:

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

#### APIテスト
REST AssuredでRESTエンドポイントをテスト:

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

### カバレッジレポート

詳細カバレッジは`target/site/jacoco/index.html`を確認:
- 全体行カバレッジ（目標: 80%以上）
- ブランチカバレッジ（目標: 70%以上）
- カバーされていない重要パスを特定

## フェーズ4: セキュリティスキャン

### 依存関係脆弱性（Maven）

```bash
mvn org.owasp:dependency-check-maven:check
```

CVEについて`target/dependency-check-report.html`を確認。

### Quarkusセキュリティ監査

```bash
# 脆弱なエクステンションを確認
mvn quarkus:audit

# すべてのエクステンションをリスト
mvn quarkus:list-extensions
```

### 一般的なセキュリティチェック

- [ ] すべてのシークレットが環境変数に（コード内ではなく）
- [ ] すべてのエンドポイントで入力バリデーション
- [ ] 認証/認可が構成済み
- [ ] CORSが適切に構成済み
- [ ] セキュリティヘッダーが設定済み
- [ ] パスワードがBCryptでハッシュ済み
- [ ] SQLインジェクション保護（パラメータ化クエリ）
- [ ] パブリックエンドポイントでレート制限

## フェーズ5: ネイティブコンパイル

GraalVMネイティブイメージ互換性をテスト:

```bash
# ネイティブ実行可能ファイルをビルド
mvn package -Dnative

# またはコンテナで
mvn package -Dnative -Dquarkus.native.container-build=true

# ネイティブ実行可能ファイルをテスト
./target/*-runner

# 基本的なスモークテストを実行
curl http://localhost:8080/q/health/live
curl http://localhost:8080/q/health/ready
```

### ネイティブイメージトラブルシューティング

一般的な問題:
- **Reflection**: 動的クラス用のreflection構成を追加
- **Resources**: `quarkus.native.resources.includes`でリソースを含める
- **JNI**: ネイティブライブラリ使用時にJNIクラスを登録

例のreflection構成:
```java
@RegisterForReflection(targets = {MyDynamicClass.class})
public class ReflectionConfiguration {}
```

## フェーズ6: ヘルスチェック

```bash
# Liveness
curl http://localhost:8080/q/health/live

# Readiness
curl http://localhost:8080/q/health/ready

# すべてのヘルスチェック
curl http://localhost:8080/q/health

# メトリクス（有効な場合）
curl http://localhost:8080/q/metrics
```

## 検証チェックリスト

### コード品質
- [ ] ビルドが警告なしで通過
- [ ] 静的解析クリーン（高/中の問題なし）
- [ ] コードがチーム規約に従う
- [ ] PRにコメントアウトされたコードやTODOがない

### テスト
- [ ] すべてのテストが通過
- [ ] コードカバレッジ ≥ 80%
- [ ] 実データベースとの統合テスト
- [ ] セキュリティテストが通過
- [ ] パフォーマンスが許容範囲内

### セキュリティ
- [ ] 依存関係脆弱性なし
- [ ] 認証/認可がテスト済み
- [ ] 入力バリデーション完了
- [ ] ソースコードにシークレットなし
- [ ] セキュリティヘッダーが構成済み

### デプロイメント
- [ ] ネイティブコンパイル成功
- [ ] コンテナイメージがビルド可能
- [ ] ヘルスチェックが正しく応答
- [ ] ターゲット環境で構成が有効

## 自動検証スクリプト

```bash
#!/bin/bash
set -e

echo "=== フェーズ1: ビルド ==="
mvn clean verify -DskipTests

echo "=== フェーズ2: 静的解析 ==="
mvn checkstyle:check pmd:check spotbugs:check

echo "=== フェーズ3: テスト + カバレッジ ==="
mvn test jacoco:report jacoco:check

echo "=== フェーズ4: セキュリティスキャン ==="
mvn org.owasp:dependency-check-maven:check

echo "=== フェーズ5: ネイティブコンパイル ==="
mvn package -Dnative -Dquarkus.native.container-build=true

echo "=== 全フェーズ完了 ==="
echo "レポートを確認:"
echo "  - カバレッジ: target/site/jacoco/index.html"
echo "  - セキュリティ: target/dependency-check-report.html"
echo "  - ネイティブ: target/*-runner"
```

## ベストプラクティス

- すべてのPR前に検証ループを実行
- CI/CDパイプラインで自動化
- 問題を即座に修正し、技術的負債を蓄積しない
- カバレッジを80%以上に維持
- 依存関係を定期的に更新
- ネイティブコンパイルを定期的にテスト
- パフォーマンストレンドを監視
- 破壊的変更を文書化
- セキュリティスキャン結果をレビュー
- 各環境の構成を検証
