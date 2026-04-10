> 此文件基于 [common/patterns.md](../common/patterns.md) 扩展，包含特定于 Web 的模式。

# Web 模式

## 组件组合

### 复合组件

当相关的 UI 共享状态和交互语义时，使用复合组件：

```tsx
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">...</Tabs.Content>
  <Tabs.Content value="settings">...</Tabs.Content>
</Tabs>
```

* 父组件拥有状态
* 子组件通过上下文消费状态
* 对于复杂的小部件，优先使用此模式而非属性透传

### 渲染属性 / 插槽

* 当行为共享但标记必须变化时，使用渲染属性或插槽模式
* 将键盘处理、ARIA 和焦点逻辑保持在无头层

### 容器 / 展示型组件分离

* 容器组件负责数据加载和副作用
* 展示型组件接收属性并渲染 UI
* 展示型组件应保持纯净

## 状态管理

分别处理以下关注点：

| 关注点 | 工具 |
|---------|---------|
| 服务器状态 | TanStack Query、SWR、tRPC |
| 客户端状态 | Zustand、Jotai、signals |
| URL 状态 | 搜索参数、路由片段 |
| 表单状态 | React Hook Form 或等效工具 |

* 不要将服务器状态复制到客户端存储中
* 推导值，而非存储冗余的计算状态

## URL 作为状态

将可共享的状态持久化到 URL 中：

* 过滤器
* 排序顺序
* 分页
* 活动标签页
* 搜索查询

## 数据获取

### 陈旧数据优先重新验证

* 立即返回缓存数据
* 在后台重新验证
* 优先使用现有库，而非手动实现

### 乐观更新

* 快照当前状态
* 应用乐观更新
* 失败时回滚
* 回滚时发出可见的错误反馈

### 并行加载

* 并行获取独立数据
* 避免父子请求瀑布流
* 在合理的情况下预取可能的下一个路由或状态
