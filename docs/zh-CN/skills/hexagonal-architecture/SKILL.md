---
name: hexagonal-architecture
description: 设计、实现和重构端口与适配器系统，具有清晰的领域边界、依赖反转和可测试的用例编排，涵盖TypeScript、Java、Kotlin和Go服务。
origin: ECC
---

# 六边形架构

六边形架构（端口与适配器）使业务逻辑独立于框架、传输和持久化细节。核心应用依赖于抽象端口，适配器在边缘实现这些端口。

## 何时使用

* 构建新功能时，长期可维护性和可测试性很重要。
* 重构分层或框架繁重的代码，其中领域逻辑与 I/O 关注点混杂。
* 支持同一用例的多个接口（HTTP、CLI、队列工作器、定时任务）。
* 替换基础设施（数据库、外部 API、消息总线）而无需重写业务规则。

当请求涉及边界、以领域为中心的设计、重构紧密耦合的服务，或将应用逻辑与特定库解耦时，使用此技能。

## 核心概念

* **领域模型**：业务规则和实体/值对象。无框架导入。
* **用例（应用层）**：编排领域行为和工作流步骤。
* **入站端口**：描述应用能做什么的契约（命令/查询/用例接口）。
* **出站端口**：应用所需依赖项的契约（存储库、网关、事件发布器、时钟、UUID 等）。
* **适配器**：端口的基础设施和交付实现（HTTP 控制器、数据库存储库、队列消费者、SDK 包装器）。
* **组合根**：具体适配器绑定到用例的单一装配位置。

出站端口接口通常位于应用层（或仅在抽象真正是领域级别时位于领域层），而基础设施适配器实现它们。

依赖方向始终向内：

* 适配器 -> 应用/领域
* 应用 -> 端口接口（入站/出站契约）
* 领域 -> 仅领域抽象（无框架或基础设施依赖）
* 领域 -> 无外部依赖

## 工作原理

### 步骤 1：建模用例边界

定义具有清晰输入和输出 DTO 的单一用例。将传输细节（Express `req`、GraphQL `context`、作业负载包装器）保持在此边界之外。

### 步骤 2：首先定义出站端口

将每个副作用识别为端口：

* 持久化（`UserRepositoryPort`）
* 外部调用（`BillingGatewayPort`）
* 横切关注点（`LoggerPort`、`ClockPort`）

端口应建模能力，而非技术。

### 步骤 3：通过纯编排实现用例

用例类/函数通过构造函数/参数接收端口。它验证应用级不变量，协调领域规则，并返回纯数据结构。

### 步骤 4：在边缘构建适配器

* 入站适配器将协议输入转换为用例输入。
* 出站适配器将应用契约映射到具体 API/ORM/查询构建器。
* 映射保持在适配器中，而非用例内部。

### 步骤 5：在组合根中装配所有内容

实例化适配器，然后将其注入用例。保持此装配集中，以避免隐藏的服务定位器行为。

### 步骤 6：按边界测试

* 使用虚假端口对用例进行单元测试。
* 使用真实基础设施依赖对适配器进行集成测试。
* 通过入站适配器对面向用户的流程进行端到端测试。

## 架构图

```mermaid
flowchart LR
  Client["Client (HTTP/CLI/Worker)"] --> InboundAdapter["Inbound Adapter"]
  InboundAdapter -->|"calls"| UseCase["UseCase (Application Layer)"]
  UseCase -->|"uses"| OutboundPort["OutboundPort (Interface)"]
  OutboundAdapter["Outbound Adapter"] -->|"implements"| OutboundPort
  OutboundAdapter --> ExternalSystem["DB/API/Queue"]
  UseCase --> DomainModel["DomainModel"]
```

## 建议的模块布局

使用具有明确边界的特性优先组织：

```text
src/
  features/
    orders/
      domain/
        Order.ts
        OrderPolicy.ts
      application/
        ports/
          inbound/
            CreateOrder.ts
          outbound/
            OrderRepositoryPort.ts
            PaymentGatewayPort.ts
        use-cases/
          CreateOrderUseCase.ts
      adapters/
        inbound/
          http/
            createOrderRoute.ts
        outbound/
          postgres/
            PostgresOrderRepository.ts
          stripe/
            StripePaymentGateway.ts
      composition/
        ordersContainer.ts
```

## TypeScript 示例

### 端口定义

```typescript
export interface OrderRepositoryPort {
  save(order: Order): Promise<void>;
  findById(orderId: string): Promise<Order | null>;
}

export interface PaymentGatewayPort {
  authorize(input: { orderId: string; amountCents: number }): Promise<{ authorizationId: string }>;
}
```

### 用例

```typescript
type CreateOrderInput = {
  orderId: string;
  amountCents: number;
};

type CreateOrderOutput = {
  orderId: string;
  authorizationId: string;
};

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepositoryPort,
    private readonly paymentGateway: PaymentGatewayPort
  ) {}

  async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    const order = Order.create({ id: input.orderId, amountCents: input.amountCents });

    const auth = await this.paymentGateway.authorize({
      orderId: order.id,
      amountCents: order.amountCents,
    });

    // markAuthorized returns a new Order instance; it does not mutate in place.
    const authorizedOrder = order.markAuthorized(auth.authorizationId);
    await this.orderRepository.save(authorizedOrder);

    return {
      orderId: order.id,
      authorizationId: auth.authorizationId,
    };
  }
}
```

### 出站适配器

```typescript
export class PostgresOrderRepository implements OrderRepositoryPort {
  constructor(private readonly db: SqlClient) {}

  async save(order: Order): Promise<void> {
    await this.db.query(
      "insert into orders (id, amount_cents, status, authorization_id) values ($1, $2, $3, $4)",
      [order.id, order.amountCents, order.status, order.authorizationId]
    );
  }

  async findById(orderId: string): Promise<Order | null> {
    const row = await this.db.oneOrNone("select * from orders where id = $1", [orderId]);
    return row ? Order.rehydrate(row) : null;
  }
}
```

### 组合根

```typescript
export const buildCreateOrderUseCase = (deps: { db: SqlClient; stripe: StripeClient }) => {
  const orderRepository = new PostgresOrderRepository(deps.db);
  const paymentGateway = new StripePaymentGateway(deps.stripe);

  return new CreateOrderUseCase(orderRepository, paymentGateway);
};
```

## 多语言映射

跨生态系统使用相同的边界规则；仅语法和装配风格改变。

* **TypeScript/JavaScript**
  * 端口：`application/ports/*` 作为接口/类型。
  * 用例：具有构造函数/参数注入的类/函数。
  * 适配器：`adapters/inbound/*`、`adapters/outbound/*`。
  * 组合：显式工厂/容器模块（无隐藏全局变量）。
* **Java**
  * 包：`domain`、`application.port.in`、`application.port.out`、`application.usecase`、`adapter.in`、`adapter.out`。
  * 端口：`application.port.*` 中的接口。
  * 用例：普通类（Spring `@Service` 是可选的，非必需）。
  * 组合：Spring 配置或手动装配类；保持装配远离领域/用例类。
* **Kotlin**
  * 模块/包镜像 Java 拆分（`domain`、`application.port`、`application.usecase`、`adapter`）。
  * 端口：Kotlin 接口。
  * 用例：具有构造函数注入的类（Koin/Dagger/Spring/手动）。
  * 组合：模块定义或专用组合函数；避免服务定位器模式。
* **Go**
  * 包：`internal/<feature>/domain`、`application`、`ports`、`adapters/inbound`、`adapters/outbound`。
  * 端口：由消费应用包拥有的小接口。
  * 用例：具有接口字段和显式 `New...` 构造函数的结构体。
  * 组合：在 `cmd/<app>/main.go`（或专用装配包）中装配，保持构造函数显式。

## 需避免的反模式

* 领域实体导入 ORM 模型、Web 框架类型或 SDK 客户端。
* 用例直接从 `req`、`res` 或队列元数据读取。
* 从用例直接返回数据库行而无领域/应用映射。
* 让适配器直接相互调用，而非通过用例端口流转。
* 依赖装配分散在许多文件中，带有隐藏的全局单例。

## 迁移指南

1. 选择一个具有频繁变更痛点的垂直切片（单一端点/作业）。
2. 提取具有明确输入/输出类型的用例边界。
3. 围绕现有基础设施调用引入出站端口。
4. 将编排逻辑从控制器/服务移至用例。
5. 保留旧适配器，但使其委托给新用例。
6. 围绕新边界添加测试（单元 + 适配器集成）。
7. 逐一切片重复；避免完全重写。

### 重构现有系统

* **绞杀者模式**：保留当前端点，每次通过新端口/适配器路由一个用例。
* **无大爆炸式重写**：按特性切片迁移，并通过特征化测试保持行为。
* **外观优先**：在替换内部实现之前，将遗留服务包装在出站端口之后。
* **组合冻结**：尽早集中装配，以便新依赖不会泄漏到领域/用例层。
* **切片选择规则**：优先处理高变更率、低影响范围的流程。
* **回滚路径**：为每个迁移切片保留可逆开关或路由切换，直到生产行为得到验证。

## 测试指导（相同的六边形边界）

* **领域测试**：将实体/值对象作为纯业务规则测试（无模拟，无框架设置）。
* **用例单元测试**：使用出站端口的假对象/存根测试编排；断言业务结果和端口交互。
* **出站适配器契约测试**：在端口级别定义共享契约套件，并针对每个适配器实现运行它们。
* **入站适配器测试**：验证协议映射（HTTP/CLI/队列负载到用例输入，以及输出/错误映射回协议）。
* **适配器集成测试**：针对真实基础设施（数据库/API/队列）运行，测试序列化、模式/查询行为、重试和超时。
* **端到端测试**：覆盖通过入站适配器 -> 用例 -> 出站适配器的关键用户旅程。
* **重构安全性**：在提取前添加特征化测试；保持它们直到新边界行为稳定且等效。

## 最佳实践清单

* 领域和用例层仅导入内部类型和端口。
* 每个外部依赖都由出站端口表示。
* 验证发生在边界（入站适配器 + 用例不变量）。
* 使用不可变转换（返回新值/实体，而非修改共享状态）。
* 错误跨边界转换（基础设施错误 -> 应用/领域错误）。
* 组合根是显式且易于审计的。
* 用例可使用端口的简单内存假对象进行测试。
* 重构从具有行为保持测试的一个垂直切片开始。
* 语言/框架特定内容保持在适配器中，绝不在领域规则中。
