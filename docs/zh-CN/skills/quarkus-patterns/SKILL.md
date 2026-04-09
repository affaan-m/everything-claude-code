---
name: quarkus-patterns
description: Quarkus 3.x LTS架构模式，Camel消息传递、RESTful API设计、CDI服务、Panache数据访问和异步处理。用于具有事件驱动架构的Java Quarkus后端工作。
origin: ECC
---

# Quarkus 开发模式

使用Apache Camel的云原生事件驱动服务的Quarkus 3.x架构和API模式。

## 何时激活

- 使用JAX-RS或RESTEasy Reactive构建REST API
- 构建资源 → 服务 → 仓库层结构
- 使用Apache Camel和RabbitMQ实现事件驱动模式
- 配置Hibernate Panache、缓存或响应式流
- 添加验证、异常映射或分页
- 为开发/预发布/生产环境设置配置文件（YAML配置）
- 使用LogContext和Logback/Logstash编码器进行自定义日志记录
- 使用CompletableFuture进行异步操作
- 实现条件流处理
- 使用GraalVM原生编译

## 多依赖服务层（Lombok）

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
            
            // 条件流逻辑
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
            
            // CompletableFuture异步操作
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
                
                // 异步Camel发布
                businessRulesPublisher.publishAsync(payload);
                this.eventService.createSuccessEvent(payload, "BUSINESS_RULES_MESSAGE_SENT");
            }
        }
    }
}
```

**关键模式:**
- 通过Lombok的`@RequiredArgsConstructor`进行构造函数注入
- 通过`@Slf4j`进行Logback日志记录
- 使用try-with-resources的作用域LogContext
- 基于运行时参数的条件流逻辑
- 使用`.join()`的CompletableFuture异步操作
- 成功/错误场景的事件跟踪
- 异步Camel消息发布

## 自定义日志上下文模式（Logback）

```java
@ApplicationScoped
public class ProcessingService {
    
    public void processDocument(Document doc) {
        LogContext logContext = CustomLog.getCurrentContext();
        try (SafeAutoCloseable ignored = CustomLog.startScope(logContext)) {
            // 向所有日志语句添加上下文
            logContext.put("documentId", doc.getId().toString());
            logContext.put("documentType", doc.getType());
            logContext.put("userId", SecurityContext.getUserId());
            
            log.info("Starting document processing");
            
            // 此作用域内的所有日志都继承上下文
            processInternal(doc);
            
            log.info("Document processing completed");
        } catch (Exception e) {
            log.error("Document processing failed", e);
            throw e;
        }
    }
}
```

**Logback配置（logback.xml）:**

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

## 事件服务模式

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
        // JSON序列化
        return objectMapper.writeValueAsString(payload);
    }
}
```

## Camel消息发布（RabbitMQ）

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

**Camel路由配置:**

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

## Camel Direct路由（内存中）

```java
@ApplicationScoped
public class DocumentProcessingRoute extends RouteBuilder {
    
    @Override
    public void configure() {
        // 错误处理
        onException(ValidationException.class)
            .handled(true)
            .to("direct:validation-error-handler")
            .log("Validation error: ${exception.message}");
        
        // 主处理路由
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

## Camel文件处理

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

## REST API结构

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
    List<Document> documents = documentService.list(page, size);
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

## 仓库模式（Panache Repository）

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

## 带事务的服务层

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
}
```

## DTO和验证

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

## 异常映射

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

## CompletableFuture异步操作

```java
@Slf4j
@ApplicationScoped
@RequiredArgsConstructor
public class FileStorageService {
    private final S3Client s3Client;
    private final ExecutorService executorService;
    
    @ConfigProperty(name = "storage.bucket-name") String bucketName;
    
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

## 缓存

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

## YAML配置

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

# Camel配置
camel:
  rabbitmq:
    queue:
      business-rules: business-rules-queue
      invoice-processing: invoice-processing-queue
```

## 健康检查

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

## 依赖（Maven）

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
    <!-- Quarkus核心 -->
    <dependency>
        <groupId>io.quarkus</groupId>
        <artifactId>quarkus-arc</artifactId>
    </dependency>
    <dependency>
        <groupId>io.quarkus</groupId>
        <artifactId>quarkus-config-yaml</artifactId>
    </dependency>
    
    <!-- Camel扩展 -->
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
    
    <!-- 日志 -->
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

## 最佳实践

### 架构
- 使用Lombok的`@RequiredArgsConstructor`进行构造函数注入
- 保持服务层精简，将复杂逻辑委托给专门的类
- 使用Camel路由进行消息路由和集成模式
- 数据访问优先使用Panache Repository模式

### 事件驱动
- 始终使用EventService跟踪操作（成功/错误事件）
- 使用Camel的`direct:`端点进行内存路由
- 使用`spring-rabbitmq`组件进行RabbitMQ集成
- 使用`ProducerTemplate.asyncSendBody()`实现异步发布

### 日志
- 使用Logstash编码器的Logback进行结构化日志
- 使用`SafeAutoCloseable`在服务调用间传播LogContext
- 向LogContext添加上下文信息以进行请求追踪
- 使用`@Slf4j`代替手动日志实例化

### 异步操作
- 使用CompletableFuture进行非阻塞I/O操作
- 需要等待完成时调用`.join()`
- 正确处理CompletableFuture的异常
- 为追踪目的向异步操作传递LogContext

### 配置
- 使用YAML配置（`quarkus-config-yaml`）
- dev/test/prod环境的配置文件感知配置
- 将敏感配置外部化到环境变量
- 使用`@ConfigProperty`进行类型安全的配置注入

### 验证
- 在资源层使用`@Valid`进行验证
- 在DTO上使用Bean Validation注解
- 使用`@Provider`将异常映射到适当的HTTP响应

### 事务
- 在修改数据的服务方法上使用`@Transactional`
- 保持事务短小且聚焦
- 避免在事务内调用异步操作

### 测试
- 使用`camel-quarkus-junit5`进行路由测试
- 使用AssertJ进行断言
- 模拟所有外部依赖
- 彻底测试条件流逻辑

### Quarkus特定
- 保持最新的LTS版本（3.x）
- 使用Quarkus开发模式进行热重载
- 添加健康检查以确保生产就绪
- 定期测试原生编译兼容性
