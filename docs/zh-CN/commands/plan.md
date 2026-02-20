---
description: 重新阐述需求、评估风险并创建分步实施计划。在接触任何代码之前，等待用户确认。
---

# 计划命令

此命令调用 **planner** 代理，在编写任何代码之前创建一个全面的实施计划。

## 此命令的作用

1. **重新阐述需求** - 明确需要构建什么
2. **识别风险** - 揭示潜在问题和阻碍
3. **创建分步计划** - 将实施分解为多个阶段
4. **等待确认** - 必须获得用户批准才能继续

## 何时使用

在以下情况下使用 `/plan`：

* 开始新功能时
* 进行重大架构变更时
* 处理复杂重构时
* 多个文件/组件将受到影响时
* 需求不明确或存在歧义时

## 工作原理

planner 代理将：

1. **分析请求** 并用清晰的术语重新阐述需求
2. **分解为多个阶段**，每个阶段包含具体、可操作的步骤
3. **识别组件之间的依赖关系**
4. **评估风险和潜在阻碍**
5. **估算复杂度**（高/中/低）
6. **展示计划**并等待您明确的确认

## 使用示例

```
User: /plan I need to add real-time notifications when markets resolve

Agent (planner):
# Implementation Plan: Real-Time Market Resolution Notifications

## Requirements Restatement
- Send notifications to users when markets they're watching resolve
- Support multiple notification channels (in-app, email, webhook)
- Ensure notifications are delivered reliably
- Include market outcome and user's position result

## Implementation Phases

### Phase 1: Database Schema
- Add notifications table with columns: id, user_id, market_id, type, status, created_at
- Add user_notification_preferences table for channel preferences
- Create indexes on user_id and market_id for performance

### Phase 2: Notification Service
- Create notification service in lib/notifications.ts
- Implement notification queue using BullMQ/Redis
- Add retry logic for failed deliveries
- Create notification templates

### Phase 3: Integration Points
- Hook into market resolution logic (when status changes to "resolved")
- Query all users with positions in market
- Enqueue notifications for each user

### Phase 4: Frontend Components
- Create NotificationBell component in header
- Add NotificationList modal
- Implement real-time updates via Supabase subscriptions
- Add notification preferences page

## Dependencies
- Redis (for queue)
- Email service (SendGrid/Resend)
- Supabase real-time subscriptions

## Risks
- HIGH: Email deliverability (SPF/DKIM required)
- MEDIUM: Performance with 1000+ users per market
- MEDIUM: Notification spam if markets resolve frequently
- LOW: Real-time subscription overhead

## Estimated Complexity: MEDIUM
- Backend: 4-6 hours
- Frontend: 3-4 hours
- Testing: 2-3 hours
- Total: 9-13 hours

**WAITING FOR CONFIRMATION**: Proceed with this plan? (yes/no/modify)
```

## 重要说明

**关键**：planner 代理在您明确用“是”、“继续”或类似的肯定性答复确认计划之前，**不会**编写任何代码。

如果您希望修改，请回复：

* "修改：\[您的修改内容]"
* "不同方法：\[替代方案]"
* "跳过阶段 2，先执行阶段 3"

## 与其他命令的集成

计划之后：

* 使用 `/tdd` 以测试驱动开发的方式实施
* 如果出现构建错误，使用 `/build-fix`
* 使用 `/code-review` 审查已完成的实施

## 相关代理

此命令调用位于 `~/.claude/agents/planner.md` 的 `planner` 代理。
