---
name: quarkus-tdd
description: 使用JUnit 5、Mockito、REST Assured、Camel测试和JaCoCo的Quarkus 3.x LTS测试驱动开发。用于添加功能、修复错误或重构事件驱动服务。
origin: ECC
---

# Quarkus TDD工作流

面向80%以上覆盖率（单元+集成）的Quarkus 3.x服务TDD指南。针对Apache Camel的事件驱动架构优化。

## 何时使用

- 新功能或REST端点
- Bug修复或重构
- 添加数据访问逻辑、安全规则或响应式流
- 测试Apache Camel路由和事件处理器
- 测试RabbitMQ事件驱动服务
- 测试条件流逻辑
- 验证CompletableFuture异步操作
- 测试LogContext传播

## 工作流

1. 先写测试（应该失败）
2. 实现通过测试的最少代码
3. 测试通过后重构
4. 使用JaCoCo强制覆盖率（80%以上目标）

## 使用@Nested组织的单元测试

全面、可读测试的结构化方法:

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
    // ARRANGE - 公共测试数据
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
      
      documentInfo.setPath(""); // 空路径触发错误
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

### 关键测试模式

1. **@Nested类**: 按被测方法分组测试
2. **@DisplayName**: 为测试报告提供可读描述
3. **命名约定**: 使用`givenX_whenY_thenZ`确保清晰
4. **AAA模式**: 明确的`// ARRANGE`、`// ACT`、`// ASSERT`注释
5. **@BeforeEach**: 通用测试数据设置以减少重复
6. **assertDoesNotThrow**: 不捕获异常的成功场景测试
7. **assertThrows**: 带消息验证的异常场景测试
8. **全面覆盖**: 测试正常路径、null输入、边界情况、异常
9. **验证交互**: 使用Mockito的`verify()`确保方法被正确调用
10. **Never验证**: 使用`never()`确保错误场景中方法未被调用

## 测试Camel路由

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

## 资源层测试（REST Assured）

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

## JaCoCo覆盖率

### Maven配置

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

运行带覆盖率的测试:
```bash
mvn clean test
mvn jacoco:report
mvn jacoco:check

# 报告位于: target/site/jacoco/index.html
```

## 测试依赖

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

## 最佳实践

### 测试组织
- 使用`@Nested`类按被测方法分组
- 使用`@DisplayName`提供可读的测试描述
- 遵循`givenX_whenY_thenZ`命名约定

### 测试结构
- 遵循带明确注释的AAA模式（`// ARRANGE`、`// ACT`、`// ASSERT`）
- 成功场景使用`assertDoesNotThrow`
- 异常场景使用`assertThrows`并验证消息

### 断言
- 值检查**优先使用AssertJ**（`assertThat`）而非JUnit断言
- 使用流式AssertJ API提高可读性
- 异常: 使用JUnit `assertThrows`捕获，再用AssertJ验证消息
- 成功路径: 使用JUnit `assertDoesNotThrow`

### 事件驱动测试
- 使用`AdviceWith`和`MockEndpoint`测试Camel路由
- 验证消息内容、头部和路由逻辑
- 单独测试错误处理路由
- 单元测试中模拟外部系统（RabbitMQ、S3、数据库）

### Quarkus特定
- 保持最新的LTS版本（Quarkus 3.x）
- 使用Quarkus测试配置文件处理不同场景
- 使用`@InjectMock`代替`@MockBean`（Quarkus特定）

**请记住**: 保持测试快速、隔离和确定性。测试行为而非实现细节。
