---
name: quarkus-patterns
description: Quarkus 3.x LTSアーキテクチャパターン、Camelメッセージング、RESTful API設計、CDIサービス、Panacheデータアクセス、非同期処理。イベント駆動アーキテクチャを持つJava Quarkusバックエンド作業に使用。
origin: ECC
---

# Quarkus 開発パターン

Apache Camelを使用したクラウドネイティブなイベント駆動サービスのためのQuarkus 3.xアーキテクチャとAPIパターン。

## いつアクティブにするか

- JAX-RSまたはRESTEasy ReactiveでREST APIを構築する
- リソース → サービス → リポジトリレイヤーを構造化する
- Apache CamelとRabbitMQでイベント駆動パターンを実装する
- Hibernate Panache、キャッシング、またはリアクティブストリームを構成する
- バリデーション、例外マッピング、またはページネーションを追加する
- dev/staging/production環境のプロファイルを設定する（YAML構成）
- LogContextとLogback/Logstashエンコーダーでカスタムロギング
- CompletableFutureで非同期操作を行う
- 条件付きフロー処理を実装する
- GraalVMネイティブコンパイルで作業する

## 複数依存関係を持つサービスレイヤー（Lombok）

```java
@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class As2ProcessingService {

    private final InvoiceFlowValidator invoiceFlowValidator;
    private final EventService eventService;
    private final DocumentJobService documentJobService;
    private final BusinessRulesPublisher businessRulesPublisher;
    private final FileStorageService fileStorageService;

    public void processFile(Path filePath) throws Exception {
        LogContext logContext = CustomLog.getCurrentContext();
        try (SafeAutoCloseable ignored = CustomLog.startScope(logContext)) {
            
            String structureIdPartner = logContext.get(As2Constants.STRUCTURE_ID);
            
            // 条件付きフローロジック
            boolean isChorusFlow = Boolean.parseBoolean(logContext.get(As2Constants.CHORUS_FLOW));
            log.info("Is CHORUS_FLOW message: {}", isChorusFlow);
            
            ValidationFlowConfig validationFlowConfig = isChorusFlow
                    ? ValidationFlowConfig.xsdOnly()
                    : ValidationFlowConfig.allValidations();
            
            InvoiceValidationResult invoiceValidationResult = this.invoiceFlowValidator
                    .validateFlowWithConfig(filePath, validationFlowConfig, 
                        EInvoiceSyntaxFormat.UBL, logContext);
            
            FlowProfile flowProfile = isChorusFlow ?
                    FlowProfile.EXTENDED_CTC_FR :
                    this.invoiceFlowValidator.computeFlowProfile(invoiceValidationResult, 
                        invoiceValidationResult.getInvoiceDetails().invoiceFormat().getProfile());
            
            log.info("Invoice validation completed. Message is valid");
            
            // CompletableFuture非同期操作
            try(InputStream inputStream = Files.newInputStream(filePath)) {
                CompletableFuture<StoredDocumentInfo> documentInfoCompletableFuture = 
                    fileStorageService.uploadOriginalFile(inputStream, 
                        invoiceValidationResult.getSize(), logContext, 
                        invoiceValidationResult.getInvoiceFormat());
                
                StoredDocumentInfo documentInfo = documentInfoCompletableFuture.join();
                log.info("File uploaded successfully: {}", documentInfo.getPath());
                
                if (StringUtils.isBlank(documentInfo.getPath())) {
                    String errorMsg = "File path is empty after upload";
                    log.error(errorMsg);
                    this.eventService.createErrorEvent(documentInfo, "FILE_UPLOAD_FAILED", errorMsg);
                    throw new As2ServerProcessingException(errorMsg);
                }
                
                this.eventService.createSuccessEvent(documentInfo, "PERSISTENCE_BLOB_EVENT_TYPE");
                
                BusinessRulesPayload payload = this.documentJobService.createDocumentAndJobEntities(
                    documentInfo, originalFileName, structureIdPartner, 
                    flowProfile, invoiceValidationResult.getDocumentHash());
                
                // 非同期Camelパブリッシング
                businessRulesPublisher.publishAsync(payload);
                this.eventService.createSuccessEvent(payload, "BUSINESS_RULES_MESSAGE_SENT");
            }
        }
    }
}
```

**主要パターン:**
- Lombokによるコンストラクタインジェクション用の`@RequiredArgsConstructor`
- Logbackロギング用の`@Slf4j`
- try-with-resourcesによるスコープ付きLogContext
- ランタイムパラメータに基づく条件付きフローロジック
- 非同期操作用の`.join()`付きCompletableFuture
- 成功/エラーシナリオのイベントトラッキング
- 非同期Camelメッセージパブリッシング

## カスタムロギングコンテキストパターン（Logback）

```java
@ApplicationScoped
public class ProcessingService {
    
    public void processDocument(Document doc) {
        LogContext logContext = CustomLog.getCurrentContext();
        try (SafeAutoCloseable ignored = CustomLog.startScope(logContext)) {
            // すべてのログステートメントにコンテキストを追加
            logContext.put("documentId", doc.getId().toString());
            logContext.put("documentType", doc.getType());
            logContext.put("userId", SecurityContext.getUserId());
            
            log.info("Starting document processing");
            
            // このスコープ内のすべてのログはコンテキストを継承
            processInternal(doc);
            
            log.info("Document processing completed");
        } catch (Exception e) {
            log.error("Document processing failed", e);
            throw e;
        }
    }
}
```

**Logback構成（logback.xml）:**

```xml
<configuration>
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <includeContext>true</includeContext>
            <includeMdc>true</includeMdc>
        </encoder>
    </appender>
    
    <logger name="com.example" level="INFO"/>
    <root level="WARN">
        <appender-ref ref="CONSOLE"/>
    </root>
</configuration>
```

## イベントサービスパターン

```java
@ApplicationScoped
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    
    public void createSuccessEvent(Object payload, String eventType) {
        Event event = new Event();
        event.setType(eventType);
        event.setStatus(EventStatus.SUCCESS);
        event.setPayload(serializePayload(payload));
        event.setTimestamp(Instant.now());
        
        eventRepository.persist(event);
        log.info("Success event created: {}", eventType);
    }
    
    public void createErrorEvent(Object payload, String eventType, String errorMessage) {
        Event event = new Event();
        event.setType(eventType);
        event.setStatus(EventStatus.ERROR);
        event.setErrorMessage(errorMessage);
        event.setPayload(serializePayload(payload));
        event.setTimestamp(Instant.now());
        
        eventRepository.persist(event);
        log.error("Error event created: {} - {}", eventType, errorMessage);
    }
    
    private String serializePayload(Object payload) {
        // JSONシリアライゼーション
        return objectMapper.writeValueAsString(payload);
    }
}
```

## Camelメッセージパブリッシング（RabbitMQ）

```java
@ApplicationScoped
@RequiredArgsConstructor
public class BusinessRulesPublisher {
    private final ProducerTemplate producerTemplate;
    
    @ConfigProperty(name = "camel.rabbitmq.queue.business-rules")
    String businessRulesQueue;
    
    public void publishAsync(BusinessRulesPayload payload) {
        producerTemplate.asyncSendBody(
            "direct:business-rules-publisher", 
            payload
        );
        log.info("Message published to business rules queue: {}", payload.getDocumentId());
    }
    
    public void publishSync(BusinessRulesPayload payload) {
        producerTemplate.sendBody(
            "direct:business-rules-publisher", 
            payload
        );
    }
}
```

**Camelルート構成:**

```java
@ApplicationScoped
public class BusinessRulesRoute extends RouteBuilder {
    
    @ConfigProperty(name = "camel.rabbitmq.queue.business-rules")
    String businessRulesQueue;
    
    @ConfigProperty(name = "rabbitmq.host")
    String rabbitHost;
    
    @ConfigProperty(name = "rabbitmq.port")
    Integer rabbitPort;
    
    @Override
    public void configure() {
        from("direct:business-rules-publisher")
            .routeId("business-rules-publisher")
            .log("Publishing message to RabbitMQ: ${body}")
            .marshal().json(JsonLibrary.Jackson)
            .toF("spring-rabbitmq:%s?hostname=%s&portNumber=%d", 
                businessRulesQueue, rabbitHost, rabbitPort);
    }
}
```

## Camel Directルート（インメモリ）

```java
@ApplicationScoped
public class DocumentProcessingRoute extends RouteBuilder {
    
    @Override
    public void configure() {
        // エラーハンドリング
        onException(ValidationException.class)
            .handled(true)
            .to("direct:validation-error-handler")
            .log("Validation error: ${exception.message}");
        
        // メイン処理ルート
        from("direct:process-document")
            .routeId("document-processing")
            .log("Processing document: ${header.documentId}")
            .bean(DocumentValidator.class, "validate")
            .bean(DocumentTransformer.class, "transform")
            .choice()
                .when(header("documentType").isEqualTo("INVOICE"))
                    .to("direct:process-invoice")
                .when(header("documentType").isEqualTo("CREDIT_NOTE"))
                    .to("direct:process-credit-note")
                .otherwise()
                    .to("direct:process-generic")
            .end();
        
        from("direct:validation-error-handler")
            .bean(EventService.class, "createErrorEvent")
            .log("Validation error handled");
    }
}
```

## Camelファイル処理

```java
@ApplicationScoped
public class FileMonitoringRoute extends RouteBuilder {
    
    @ConfigProperty(name = "file.input.directory")
    String inputDirectory;
    
    @ConfigProperty(name = "file.processed.directory")
    String processedDirectory;
    
    @ConfigProperty(name = "file.error.directory")
    String errorDirectory;
    
    @Override
    public void configure() {
        from("file:" + inputDirectory + "?move=" + processedDirectory + 
             "&moveFailed=" + errorDirectory + "&delay=5000")
            .routeId("file-monitor")
            .log("Processing file: ${header.CamelFileName}")
            .to("direct:process-file");
        
        from("direct:process-file")
            .bean(As2ProcessingService.class, "processFile")
            .log("File processing completed");
    }
}
```

## Camel Bean呼び出し

```java
@ApplicationScoped
public class InvoiceRoute extends RouteBuilder {
    
    @Override
    public void configure() {
        from("direct:invoice-validation")
            .bean(InvoiceFlowValidator.class, "validateFlowWithConfig")
            .log("Validation result: ${body}");
        
        from("direct:persist-and-publish")
            .bean(DocumentJobService.class, "createDocumentAndJobEntities")
            .bean(BusinessRulesPublisher.class, "publishAsync")
            .bean(EventService.class, "createSuccessEvent(${body}, 'PUBLISHED')");
    }
}
```

## REST API構造

```java
@Path("/api/documents")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequiredArgsConstructor
public class DocumentResource {
  private final DocumentService documentService;

  @GET
  public Response list(
      @QueryParam("page") @DefaultValue("0") int page,
      @QueryParam("size") @DefaultValue("20") int size) {
    PaginatedList<Document> documents = documentService.list(page, size);
    return Response.ok(documents).build();
  }

  @POST
  public Response create(@Valid CreateDocumentRequest request, @Context UriInfo uriInfo) {
    Document document = documentService.create(request);
    URI location = uriInfo.getAbsolutePathBuilder()
        .path(String.valueOf(document.id))
        .build();
    return Response.created(location).entity(DocumentResponse.from(document)).build();
  }

  @GET
  @Path("/{id}")
  public Response getById(@PathParam("id") Long id) {
    return documentService.findById(id)
        .map(DocumentResponse::from)
        .map(Response::ok)
        .orElse(Response.status(Response.Status.NOT_FOUND))
        .build();
  }
}
```

## リポジトリパターン（Panache Repository）

```java
@ApplicationScoped
public class DocumentRepository implements PanacheRepository<Document> {
  
  public List<Document> findByStatus(DocumentStatus status, int page, int size) {
    return find("status = ?1 order by createdAt desc", status)
        .page(page, size)
        .list();
  }

  public Optional<Document> findByReferenceNumber(String referenceNumber) {
    return find("referenceNumber", referenceNumber).firstResultOptional();
  }
  
  public long countByStatusAndDate(DocumentStatus status, LocalDate date) {
    return count("status = ?1 and createdAt >= ?2", status, date.atStartOfDay());
  }
}
```

## トランザクション付きサービスレイヤー

```java
@ApplicationScoped
@RequiredArgsConstructor
public class DocumentService {
  private final DocumentRepository repo;
  private final EventService eventService;

  @Transactional
  public Document create(CreateDocumentRequest request) {
    Document document = new Document();
    document.setReferenceNumber(request.referenceNumber());
    document.setDescription(request.description());
    document.setStatus(DocumentStatus.PENDING);
    document.setCreatedAt(Instant.now());
    
    repo.persist(document);
    
    eventService.createSuccessEvent(document, "DOCUMENT_CREATED");
    
    return document;
  }

  public Optional<Document> findById(Long id) {
    return repo.findByIdOptional(id);
  }

  public PaginatedList<Document> list(int page, int size) {
    return repo.findAll()
        .page(page, size)
        .list();
  }
}
```

## DTOとバリデーション

```java
public record CreateDocumentRequest(
    @NotBlank @Size(max = 200) String referenceNumber,
    @NotBlank @Size(max = 2000) String description,
    @NotNull @FutureOrPresent Instant validUntil,
    @NotEmpty List<@NotBlank String> categories) {}

public record DocumentResponse(Long id, String referenceNumber, DocumentStatus status) {
  public static DocumentResponse from(Document document) {
    return new DocumentResponse(document.getId(), document.getReferenceNumber(), 
        document.getStatus());
  }
}
```

## 例外マッピング

```java
@Provider
public class ValidationExceptionMapper implements ExceptionMapper<ConstraintViolationException> {
  @Override
  public Response toResponse(ConstraintViolationException exception) {
    String message = exception.getConstraintViolations().stream()
        .map(cv -> cv.getPropertyPath() + ": " + cv.getMessage())
        .collect(Collectors.joining(", "));
    
    return Response.status(Response.Status.BAD_REQUEST)
        .entity(Map.of("error", "validation_error", "message", message))
        .build();
  }
}

@Provider
@Slf4j
public class GenericExceptionMapper implements ExceptionMapper<Exception> {

  @Override
  public Response toResponse(Exception exception) {
    log.error("Unhandled exception", exception);
    return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
        .entity(Map.of("error", "internal_error", "message", "An unexpected error occurred"))
        .build();
  }
}
```

## CompletableFuture非同期操作

```java
@ApplicationScoped
@RequiredArgsConstructor
public class FileStorageService {
    private final S3Client s3Client;
    private final ExecutorService executorService;
    
    public CompletableFuture<StoredDocumentInfo> uploadOriginalFile(
            InputStream inputStream, 
            long size, 
            LogContext logContext,
            InvoiceFormat format) {
        
        return CompletableFuture.supplyAsync(() -> {
            try (SafeAutoCloseable ignored = CustomLog.startScope(logContext)) {
                String path = generateStoragePath(format);
                
                PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(path)
                    .contentLength(size)
                    .build();
                
                s3Client.putObject(request, RequestBody.fromInputStream(inputStream, size));
                
                log.info("File uploaded to S3: {}", path);
                
                return new StoredDocumentInfo(path, size, Instant.now());
            } catch (Exception e) {
                log.error("Failed to upload file to S3", e);
                throw new StorageException("Upload failed", e);
            }
        }, executorService);
    }
}
```

## キャッシング

```java
@ApplicationScoped
@RequiredArgsConstructor
public class DocumentCacheService {
  private final DocumentRepository repo;

  @CacheResult(cacheName = "document-cache")
  public Optional<Document> getById(@CacheKey Long id) {
    return repo.findByIdOptional(id);
  }

  @CacheInvalidate(cacheName = "document-cache")
  public void evict(@CacheKey Long id) {}

  @CacheInvalidateAll(cacheName = "document-cache")
  public void evictAll() {}
}
```

## YAML構成

```yaml
# application.yml
"%dev":
  quarkus:
    datasource:
      jdbc:
        url: jdbc:postgresql://localhost:5432/dev_db
      username: dev_user
      password: dev_pass
    hibernate-orm:
      database:
        generation: drop-and-create
  
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

"%test":
  quarkus:
    datasource:
      jdbc:
        url: jdbc:h2:mem:test
    hibernate-orm:
      database:
        generation: drop-and-create

"%prod":
  quarkus:
    datasource:
      jdbc:
        url: ${DATABASE_URL}
      username: ${DB_USER}
      password: ${DB_PASSWORD}
    hibernate-orm:
      database:
        generation: validate
  
  rabbitmq:
    host: ${RABBITMQ_HOST}
    port: ${RABBITMQ_PORT}
    username: ${RABBITMQ_USER}
    password: ${RABBITMQ_PASSWORD}

# Camel構成
camel:
  rabbitmq:
    queue:
      business-rules: business-rules-queue
      invoice-processing: invoice-processing-queue
```

## ヘルスチェック

```java
@Readiness
@ApplicationScoped
@RequiredArgsConstructor
public class DatabaseHealthCheck implements HealthCheck {
  private final AgroalDataSource dataSource;

  @Override
  public HealthCheckResponse call() {
    try (Connection conn = dataSource.getConnection()) {
      boolean valid = conn.isValid(2);
      return HealthCheckResponse.named("Database connection")
          .status(valid)
          .build();
    } catch (SQLException e) {
      return HealthCheckResponse.down("Database connection");
    }
  }
}

@Liveness
@ApplicationScoped
public class CamelHealthCheck implements HealthCheck {
  @Inject
  CamelContext camelContext;

  @Override
  public HealthCheckResponse call() {
    boolean isStarted = camelContext.getStatus().isStarted();
    return HealthCheckResponse.named("Camel Context")
        .status(isStarted)
        .build();
  }
}
```

## 依存関係（Maven）

```xml
<properties>
    <quarkus.platform.version>3.27.0</quarkus.platform.version>
    <lombok.version>1.18.42</lombok.version>
    <assertj-core.version>3.24.2</assertj-core.version>
    <jacoco-maven-plugin.version>0.8.13</jacoco-maven-plugin.version>
    <maven.compiler.release>17</maven.compiler.release>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.quarkus.platform</groupId>
            <artifactId>quarkus-bom</artifactId>
            <version>${quarkus.platform.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <dependency>
            <groupId>org.apache.camel.quarkus</groupId>
            <artifactId>camel-quarkus-bom</artifactId>
            <version>${quarkus.platform.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <!-- Quarkusコア -->
    <dependency>
        <groupId>io.quarkus</groupId>
        <artifactId>quarkus-arc</artifactId>
    </dependency>
    <dependency>
        <groupId>io.quarkus</groupId>
        <artifactId>quarkus-config-yaml</artifactId>
    </dependency>
    
    <!-- Camelエクステンション -->
    <dependency>
        <groupId>org.apache.camel.quarkus</groupId>
        <artifactId>camel-quarkus-spring-rabbitmq</artifactId>
    </dependency>
    <dependency>
        <groupId>org.apache.camel.quarkus</groupId>
        <artifactId>camel-quarkus-direct</artifactId>
    </dependency>
    <dependency>
        <groupId>org.apache.camel.quarkus</groupId>
        <artifactId>camel-quarkus-bean</artifactId>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>${lombok.version}</version>
        <scope>provided</scope>
    </dependency>
    
    <!-- ロギング -->
    <dependency>
        <groupId>io.quarkiverse.logging.logback</groupId>
        <artifactId>quarkus-logging-logback</artifactId>
    </dependency>
    <dependency>
        <groupId>net.logstash.logback</groupId>
        <artifactId>logstash-logback-encoder</artifactId>
    </dependency>
</dependencies>
```

## ベストプラクティス

### アーキテクチャ
- コンストラクタインジェクション用にLombokの`@RequiredArgsConstructor`を使用
- サービスレイヤーは薄く保ち、複雑なロジックは専門クラスに委譲
- メッセージルーティングと統合パターンにCamelルートを使用
- データアクセスにはPanache Repositoryパターンを優先

### イベント駆動
- 常にEventServiceで操作をトラッキング（成功/エラーイベント）
- インメモリルーティングにCamelの`direct:`エンドポイントを使用
- RabbitMQ統合に`spring-rabbitmq`コンポーネントを使用
- `ProducerTemplate.asyncSendBody()`で非同期パブリッシングを実装

### ロギング
- 構造化ロギング用にLogstashエンコーダー付きLogbackを使用
- `SafeAutoCloseable`でサービスコール間でLogContextを伝播
- リクエストトレーシング用にLogContextにコンテキスト情報を追加
- 手動ロガーインスタンス化の代わりに`@Slf4j`を使用

### 非同期操作
- ノンブロッキングI/O操作にCompletableFutureを使用
- 完了を待つ必要がある場合は`.join()`を呼び出す
- CompletableFutureからの例外を適切にハンドリング
- トレーシング用に非同期操作にLogContextを渡す

### 構成
- YAML構成を使用（`quarkus-config-yaml`）
- dev/test/prod環境のプロファイル対応構成
- 機密構成を環境変数に外部化
- 型安全な構成インジェクション用に`@ConfigProperty`を使用

### バリデーション
- リソースレイヤーで`@Valid`によるバリデーション
- DTOにBean Validationアノテーションを使用
- `@Provider`で例外を適切なHTTPレスポンスにマッピング

### トランザクション
- データを変更するサービスメソッドに`@Transactional`を使用
- トランザクションは短く焦点を絞る
- トランザクション内で非同期操作を呼び出さない

### テスト
- ルートテストに`camel-quarkus-junit5`を使用
- アサーションにAssertJを使用
- すべての外部依存関係をモック
- 条件付きフローロジックを徹底的にテスト

### Quarkus固有
- 最新のLTSバージョン（3.x）を維持
- ホットリロード用にQuarkus devモードを使用
- 本番準備のためにヘルスチェックを追加
- ネイティブコンパイル互換性を定期的にテスト
