---
name: quarkus-tdd
description: Quarkus 3.x LTS向けテスト駆動開発。JUnit 5、Mockito、REST Assured、Camelテスト、JaCoCoを使用。機能追加、バグ修正、イベント駆動サービスのリファクタリングに使用。
origin: ECC
---

# Quarkus TDDワークフロー

80%以上のカバレッジ（ユニット＋統合）を目指すQuarkus 3.xサービスのTDDガイダンス。Apache Camelによるイベント駆動アーキテクチャに最適化。

## いつ使用するか

- 新機能またはRESTエンドポイント
- バグ修正またはリファクタリング
- データアクセスロジック、セキュリティルール、またはリアクティブストリームの追加
- Apache Camelルートとイベントハンドラーのテスト
- RabbitMQによるイベント駆動サービスのテスト
- 条件付きフローロジックのテスト
- CompletableFuture非同期操作のバリデーション
- LogContext伝播のテスト

## ワークフロー

1. まずテストを書く（失敗するはず）
2. テストを通過する最小限のコードを実装
3. テストがグリーンの状態でリファクタリング
4. JaCoCoでカバレッジを強制（80%以上が目標）

## @Nestedによるユニットテスト構成

包括的で読みやすいテストのための構造化アプローチ:

```java
@ExtendWith(MockitoExtension.class)
@DisplayName("As2ProcessingService Unit Tests")
class As2ProcessingServiceTest {
  
  @Mock
  private InvoiceFlowValidator invoiceFlowValidator;
  
  @Mock
  private EventService eventService;
  
  @Mock
  private DocumentJobService documentJobService;
  
  @Mock
  private BusinessRulesPublisher businessRulesPublisher;
  
  @Mock
  private FileStorageService fileStorageService;
  
  @InjectMocks
  private As2ProcessingService as2ProcessingService;
  
  private Path testFilePath;
  private LogContext testLogContext;
  private InvoiceValidationResult validationResult;
  private StoredDocumentInfo documentInfo;

  @BeforeEach
  void setUp() {
    // ARRANGE - 共通テストデータ
    testFilePath = Path.of("/tmp/test-invoice.xml");
    
    testLogContext = new LogContext();
    testLogContext.put(As2Constants.STRUCTURE_ID, "STRUCT-001");
    testLogContext.put(As2Constants.FILE_NAME, "invoice.xml");
    testLogContext.put(As2Constants.AS2_FROM, "PARTNER-001");
    
    validationResult = new InvoiceValidationResult();
    validationResult.setValid(true);
    validationResult.setSize(1024L);
    validationResult.setDocumentHash("abc123");
    
    documentInfo = new StoredDocumentInfo();
    documentInfo.setPath("s3://bucket/path/invoice.xml");
    documentInfo.setSize(1024L);
  }

  @Nested
  @DisplayName("Tests for processFile")
  class ProcessFile {
    
    @Test
    @DisplayName("Should successfully process non-CHORUS file with all validations")
    void givenNonChorusFile_whenProcessFile_thenAllValidationsApplied() throws Exception {
      // ARRANGE
      testLogContext.put(As2Constants.CHORUS_FLOW, "false");
      CustomLog.setCurrentContext(testLogContext);
      
      when(invoiceFlowValidator.validateFlowWithConfig(
          eq(testFilePath), 
          eq(ValidationFlowConfig.allValidations()),
          eq(EInvoiceSyntaxFormat.UBL),
          any(LogContext.class)))
          .thenReturn(validationResult);
      
      when(invoiceFlowValidator.computeFlowProfile(any(), any()))
          .thenReturn(FlowProfile.BASIC);
      
      when(fileStorageService.uploadOriginalFile(any(), anyLong(), any(), any()))
          .thenReturn(CompletableFuture.completedFuture(documentInfo));
      
      when(documentJobService.createDocumentAndJobEntities(any(), any(), any(), any(), any()))
          .thenReturn(new BusinessRulesPayload());
      
      // ACT
      assertDoesNotThrow(() -> as2ProcessingService.processFile(testFilePath));
      
      // ASSERT
      verify(invoiceFlowValidator).validateFlowWithConfig(
          eq(testFilePath),
          eq(ValidationFlowConfig.allValidations()),
          eq(EInvoiceSyntaxFormat.UBL),
          any(LogContext.class));
      
      verify(eventService).createSuccessEvent(any(StoredDocumentInfo.class), 
          eq("PERSISTENCE_BLOB_EVENT_TYPE"));
      verify(businessRulesPublisher).publishAsync(any(BusinessRulesPayload.class));
    }

    @Test
    @DisplayName("Should create error event when file upload fails")
    void givenUploadFailure_whenProcessFile_thenErrorEventCreated() throws Exception {
      // ARRANGE
      testLogContext.put(As2Constants.CHORUS_FLOW, "false");
      CustomLog.setCurrentContext(testLogContext);
      
      when(invoiceFlowValidator.validateFlowWithConfig(any(), any(), any(), any()))
          .thenReturn(validationResult);
      
      when(invoiceFlowValidator.computeFlowProfile(any(), any()))
          .thenReturn(FlowProfile.BASIC);
      
      documentInfo.setPath(""); // 空パスでエラーをトリガー
      when(fileStorageService.uploadOriginalFile(any(), anyLong(), any(), any()))
          .thenReturn(CompletableFuture.completedFuture(documentInfo));
      
      // ACT & ASSERT
      As2ServerProcessingException exception = assertThrows(
          As2ServerProcessingException.class,
          () -> as2ProcessingService.processFile(testFilePath)
      );
      
      assertThat(exception.getMessage())
          .contains("File path is empty after upload");
      
      verify(businessRulesPublisher, never()).publishAsync(any());
    }
  }
}
```

### 主要テストパターン

1. **@Nestedクラス**: テスト対象メソッドごとにテストをグループ化
2. **@DisplayName**: テストレポート用の読みやすい説明
3. **命名規則**: 明確さのために`givenX_whenY_thenZ`
4. **AAAパターン**: 明示的な`// ARRANGE`、`// ACT`、`// ASSERT`コメント
5. **@BeforeEach**: 重複削減のための共通テストデータセットアップ
6. **assertDoesNotThrow**: 例外をキャッチせずに成功シナリオをテスト
7. **assertThrows**: メッセージバリデーション付きの例外シナリオテスト
8. **包括的カバレッジ**: ハッピーパス、null入力、エッジケース、例外をテスト
9. **インタラクション検証**: Mockitoの`verify()`でメソッドが正しく呼ばれることを確認
10. **Never検証**: エラーシナリオでメソッドが呼ばれないことを`never()`で確認

## Camelルートのテスト

```java
@QuarkusTest
@DisplayName("Business Rules Camel Route Tests")
class BusinessRulesRouteTest {

  @Inject
  CamelContext camelContext;

  @Inject
  ProducerTemplate producerTemplate;

  @InjectMock
  EventService eventService;

  @Test
  @DisplayName("Should successfully publish message to RabbitMQ")
  void givenValidPayload_whenPublish_thenMessageSentToQueue() throws Exception {
    // ARRANGE
    MockEndpoint mockRabbitMQ = camelContext.getEndpoint("mock:rabbitmq", MockEndpoint.class);
    mockRabbitMQ.expectedMessageCount(1);
    
    camelContext.getRouteController().stopRoute("business-rules-publisher");
    AdviceWith.adviceWith(camelContext, "business-rules-publisher", advice -> {
      advice.replaceFromWith("direct:business-rules-publisher");
      advice.weaveByToString(".*spring-rabbitmq.*").replace().to("mock:rabbitmq");
    });
    camelContext.getRouteController().startRoute("business-rules-publisher");
    
    // ACT
    producerTemplate.sendBody("direct:business-rules-publisher", testPayload);
    
    // ASSERT
    mockRabbitMQ.assertIsSatisfied(5000);
  }
}
```

## リソースレイヤーテスト（REST Assured）

```java
@QuarkusTest
@DisplayName("DocumentResource API Tests")
class DocumentResourceTest {

  @InjectMock
  DocumentService documentService;

  @Nested
  @DisplayName("Tests for POST /api/documents")
  class CreateDocument {

    @Test
    @DisplayName("Should create document and return 201")
    void givenValidRequest_whenCreate_thenReturns201() {
      // ARRANGE
      Document document = createDocument(1L, "DOC-001");
      when(documentService.create(any())).thenReturn(document);

      // ACT & ASSERT
      given()
          .contentType(ContentType.JSON)
          .body("""
              {
                "referenceNumber": "DOC-001",
                "description": "Test document",
                "validUntil": "2030-01-01T00:00:00Z",
                "categories": ["test"]
              }
              """)
          .when().post("/api/documents")
          .then()
          .statusCode(201)
          .body("referenceNumber", equalTo("DOC-001"));
    }

    @Test
    @DisplayName("Should return 400 for invalid input")
    void givenInvalidRequest_whenCreate_thenReturns400() {
      given()
          .contentType(ContentType.JSON)
          .body("""
              {
                "referenceNumber": "",
                "description": "Test"
              }
              """)
          .when().post("/api/documents")
          .then()
          .statusCode(400);
    }
  }
}
```

## JaCoCoカバレッジ

### Maven構成

```xml
<plugin>
  <groupId>org.jacoco</groupId>
  <artifactId>jacoco-maven-plugin</artifactId>
  <version>0.8.13</version>
  <executions>
    <execution>
      <id>prepare-agent</id>
      <goals><goal>prepare-agent</goal></goals>
    </execution>
    <execution>
      <id>report</id>
      <phase>verify</phase>
      <goals><goal>report</goal></goals>
    </execution>
    <execution>
      <id>check</id>
      <goals><goal>check</goal></goals>
      <configuration>
        <rules>
          <rule>
            <element>BUNDLE</element>
            <limits>
              <limit>
                <counter>LINE</counter>
                <value>COVEREDRATIO</value>
                <minimum>0.80</minimum>
              </limit>
            </limits>
          </rule>
        </rules>
      </configuration>
    </execution>
  </executions>
</plugin>
```

カバレッジ付きテスト実行:
```bash
mvn clean test
mvn jacoco:report
mvn jacoco:check

# レポート: target/site/jacoco/index.html
```

## テスト依存関係

```xml
<dependencies>
    <dependency>
        <groupId>io.quarkus</groupId>
        <artifactId>quarkus-junit5</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>io.quarkus</groupId>
        <artifactId>quarkus-junit5-mockito</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.assertj</groupId>
        <artifactId>assertj-core</artifactId>
        <version>3.24.2</version>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>io.rest-assured</groupId>
        <artifactId>rest-assured</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.apache.camel.quarkus</groupId>
        <artifactId>camel-quarkus-junit5</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## ベストプラクティス

### テスト構成
- テスト対象メソッドごとに`@Nested`クラスでグループ化
- レポートに表示される読みやすい説明に`@DisplayName`を使用
- テストメソッドに`givenX_whenY_thenZ`命名規則を使用

### テスト構造
- 明示的コメント付きAAAパターン（`// ARRANGE`、`// ACT`、`// ASSERT`）
- 成功シナリオに`assertDoesNotThrow`を使用
- メッセージバリデーション付き例外シナリオに`assertThrows`を使用

### アサーション
- JUnitアサーションの代わりに**常にAssertJ**（`assertThat`）を使用
- 読みやすさのためにAssertJのfluent APIを使用
- 例外: `assertThatThrownBy(() -> ...).isInstanceOf(...).hasMessageContaining(...)`

### イベント駆動テスト
- `AdviceWith`と`MockEndpoint`でCamelルートをテスト
- メッセージコンテンツ、ヘッダー、ルーティングロジックを検証
- エラーハンドリングルートを個別にテスト
- ユニットテストで外部システム（RabbitMQ、S3、データベース）をモック

### Quarkus固有
- 最新のLTSバージョン（Quarkus 3.x）を維持
- ネイティブコンパイル互換性を定期的にテスト
- 異なるシナリオにQuarkusテストプロファイルを使用
- `@MockBean`の代わりに`@InjectMock`を使用（Quarkus固有）

**覚えておいてください**: テストは高速、分離、決定的に保ちます。実装の詳細ではなく動作をテストしてください。
