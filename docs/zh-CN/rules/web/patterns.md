> 此文件在 [common/patterns.md](../common/patterns.md) 基础上扩展了 Web 专属模式。

# Web 模式

## 组件组合

### 复合组件

当相关 UI 共享状态和交互语义时，使用复合组件：

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
* 子组件通过上下文消费
* 对于复杂组件，优先使用此模式而非属性透传

### 渲染属性 / 插槽

* 当行为共享但标记必须变化时，使用渲染属性或插槽模式
* 将键盘处理、ARIA 和焦点逻辑保留在无头层

### 容器 / 展示分离

* 容器组件负责数据加载和副作用
* 展示组件接收属性并渲染 UI
* 展示组件应保持纯净

## 状态管理

分别处理以下内容：

| 关注点 | 工具 |
|---------|------|
| 服务端状态 | TanStack Query、SWR、tRPC |
| 客户端状态 | Zustand、Jotai、信号 |
| URL 状态 | 搜索参数、路由段 |
| 表单状态 | React Hook Form 或等效工具 |

* 不要将服务端状态复制到客户端存储中
* 推导值而非存储冗余的计算状态

## URL 即状态

将可共享状态持久化到 URL 中：

* 筛选条件
* 排序顺序
* 分页
* 活动标签
* 搜索查询

## 数据获取

### 过期-重新验证

* 立即返回缓存数据
* 后台重新验证
* 优先使用现有库而非自行实现

### 乐观更新

* 快照当前状态
* 应用乐观更新
* 失败时回滚
* 回滚时发出可见的错误反馈

### 并行加载

* 并行获取独立数据
* 避免父子请求瀑布
* 在合理情况下预取可能的下一个路由或状态
