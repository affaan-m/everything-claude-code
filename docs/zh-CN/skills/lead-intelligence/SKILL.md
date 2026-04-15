---
name: lead-intelligence
description: AI原生线索智能与触达管道。通过代理驱动的信号评分、相互排名、暖路径发现、来源衍生语音建模以及跨电子邮件、LinkedIn和X的渠道特定触达，取代Apollo、Clay和ZoomInfo。当用户希望寻找、筛选并触达高价值联系人时使用。
origin: ECC
---

# 线索智能

通过社交图谱分析和暖路径发现，寻找、评分并触达高价值联系人的智能体驱动线索智能管道。

## 何时激活

* 用户希望在特定行业寻找线索或潜在客户
* 为合作、销售或融资建立外联名单
* 研究应联系谁以及联系的最佳路径
* 用户提及"寻找线索"、"外联名单"、"我应该联系谁"、"暖介绍"
* 需要根据相关性对联系人列表进行评分或排序
* 希望映射共同联系以寻找暖介绍路径

## 工具要求

### 必需

* **Exa MCP** — 用于人员、公司和信号的深度网络搜索 (`web_search_exa`)
* **X API** — 关注者/关注图谱、共同联系分析、近期活动 (`X_BEARER_TOKEN`，以及写入上下文凭证，例如 `X_CONSUMER_KEY`、`X_CONSUMER_SECRET`、`X_ACCESS_TOKEN`、`X_ACCESS_TOKEN_SECRET`)

### 可选（增强结果）

* **LinkedIn** — 如果可用则使用直接 API，否则使用浏览器控制进行搜索、资料检查和草拟
* **Apollo/Clay API** — 如果用户有访问权限，用于丰富信息交叉参考
* **GitHub MCP** — 用于以开发者为中心的线索资格认定
* **Apple Mail / Mail.app** — 草拟冷邮件或暖邮件，但不自动发送
* **浏览器控制** — 当 API 覆盖缺失或受限时，用于 LinkedIn 和 X

## 管道概述

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│ 1. 信号     │────>│ 2. 互惠      │────>│ 3. 暖路径       │────>│ 4. 丰富      │────>│ 5. 外联        │
│    评分     │     │    排名      │     │    发现        │     │              │     │    草稿        │
└─────────────┘     └──────────────┘     └─────────────────┘     └──────────────┘     └─────────────────┘
```

## 外联前的语调

不要根据通用的销售文案草拟外联内容。

当用户的语调重要时，首先运行 `brand-voice`。复用其 `VOICE PROFILE`，而不是在此技能内临时重新推导风格。

如果实时 X 访问可用，在草拟前拉取最近的原创帖子。如果不可用，则使用提供的示例或可用的最佳仓库/网站材料。

## 阶段 1：信号评分

在目标垂直领域搜索高信号人员。根据以下因素为每个人分配权重：

| 信号 | 权重 | 来源 |
|--------|--------|--------|
| 职位/头衔匹配度 | 30% | Exa, LinkedIn |
| 行业匹配度 | 25% | Exa 公司搜索 |
| 近期相关活动 | 20% | X API 搜索, Exa |
| 关注者数量/影响力 | 10% | X API |
| 地理位置接近度 | 10% | Exa, LinkedIn |
| 与您内容的互动 | 5% | X API 互动 |

### 信号搜索方法

```python
# Step 1: Define target parameters
target_verticals = ["prediction markets", "AI tooling", "developer tools"]
target_roles = ["founder", "CEO", "CTO", "VP Engineering", "investor", "partner"]
target_locations = ["San Francisco", "New York", "London", "remote"]

# Step 2: Exa deep search for people
for vertical in target_verticals:
    results = web_search_exa(
        query=f"{vertical} {role} founder CEO",
        category="company",
        numResults=20
    )
    # Score each result

# Step 3: X API search for active voices
x_search = search_recent_tweets(
    query="prediction markets OR AI tooling OR developer tools",
    max_results=100
)
# Extract and score unique authors
```

## 阶段 2：共同联系排序

对于每个已评分的目标，分析用户的社交图谱以找到最暖的路径。

### 排序模型

1. 拉取用户的 X 关注列表和 LinkedIn 人脉
2. 对于每个高信号目标，检查是否存在共同联系
3. 应用 `social-graph-ranker` 模型来评分桥梁价值
4. 根据以下因素对共同联系进行排序：

| 因素 | 权重 |
|--------|--------|
| 与目标的连接数量 | 40% — 最高权重，连接最多 = 排名最高 |
| 共同联系当前职位/公司 | 20% — 决策者 vs 个人贡献者 |
| 共同联系所在地 | 15% — 同城 = 介绍更容易 |
| 行业匹配度 | 15% — 相同垂直领域 = 自然介绍 |
| 共同联系的 X 账号 / LinkedIn | 10% — 用于外联的可识别性 |

规范规则：

```text
当用户需要图计算本身、作为独立报告的桥接排名，或显式的衰减模型调优时，使用 social-graph-ranker。
```

在此技能内部，使用相同的加权桥梁模型：

```text
B(m) = Σ_{t ∈ T} w(t) · λ^(d(m,t) - 1)
R(m) = B_ext(m) · (1 + β · engagement(m))
```

解读：

* 第 1 层：高 `R(m)` 和直接桥梁路径 -> 请求暖介绍
* 第 2 层：中等 `R(m)` 和单跳桥梁路径 -> 有条件地请求介绍
* 第 3 层：无可行桥梁 -> 使用相同的线索记录进行直接冷外联

### 输出格式

```

如果用户明确希望将排名引擎独立运行、可视化数学计算或在完整潜在客户工作流之外对网络进行评分，请先以独立方式运行 `social-graph-ranker`，然后将结果反馈到此流程中。
MUTUAL RANKING REPORT
=====================

#1  @mutual_handle (Score: 92)
    Name: Jane Smith
    Role: Partner @ Acme Ventures
    Location: San Francisco
    Connections to targets: 7
    Connected to: @target1, @target2, @target3, @target4, @target5, @target6, @target7
    Best intro path: Jane invested in Target1's company

#2  @mutual_handle2 (Score: 85)
    ...
```

## 阶段 3：暖路径发现

对于每个目标，找到最短的介绍链：

```
你 ──[关注]──> 共同联系人A ──[投资于]──> 目标公司
你 ──[关注]──> 共同联系人B ──[共同创立]──> 目标人物
你 ──[相遇于]──> 活动 ──[也参加了]──> 目标人物
```

### 路径类型（按暖度排序）

1. **直接共同联系** — 你们都认识/关注同一个人
2. **投资组合联系** — 共同联系投资于或担任目标公司的顾问
3. **同事/校友** — 共同联系曾在同一家公司工作或就读同一所学校
4. **活动重叠** — 都参加过同一会议/项目
5. **内容互动** — 目标与共同联系的内容互动过，或反之

## 阶段 4：信息丰富

对于每个合格的线索，拉取：

* 全名、当前头衔、公司
* 公司规模、融资阶段、近期新闻
* 近期 X 帖子（最近 30 天）— 主题、语气、兴趣
* 与用户的共同兴趣（共同关注、相似内容）
* 近期公司事件（产品发布、融资轮次、招聘）

### 信息丰富来源

* Exa：公司数据、新闻、博客文章
* X API：近期推文、简介、关注者
* GitHub：开源贡献（针对以开发者为中心的线索）
* LinkedIn（通过浏览器使用）：完整资料、经历、教育背景

## 阶段 5：外联草拟

为每个线索生成个性化的外联内容。草稿应与来源衍生的语调配置文件以及目标渠道相匹配。

### 渠道规则

#### 电子邮件

* 用于最高价值的冷外联、暖介绍、投资者外联和合作请求
* 当本地桌面控制可用时，默认在 Apple Mail / Mail.app 中草拟
* 首先创建草稿，除非用户明确要求，否则不要自动发送
* 主题行应简洁具体，不要耍小聪明

#### LinkedIn

* 当目标在该平台活跃、LinkedIn 上的共同联系图谱背景更强或电子邮件信心不足时使用
* 如果可用，优先使用 API 访问
* 否则使用浏览器控制来检查资料、近期活动并草拟消息
* 保持比电子邮件更短，避免虚假的职业亲切感

#### X

* 用于高背景的操作者、建设者或投资者外联，其中公开发帖行为很重要
* 优先使用 API 访问进行搜索、时间线和互动分析
* 需要时回退到浏览器控制
* 私信和公开回复应比电子邮件简洁得多，并应引用目标时间线中的真实内容

#### 渠道选择启发式方法

按此顺序选择一个主要渠道：

1. 通过电子邮件的暖介绍
2. 直接电子邮件
3. LinkedIn 私信
4. X 私信或回复

仅在存在充分理由且节奏不会显得垃圾邮件时才使用多渠道。

### 暖介绍请求（向共同联系）

目标：

* 一个明确的请求
* 一个具体的理由说明此介绍有意义
* 易于转发的简介（如果需要）

避免：

* 过度解释你的公司
* 堆叠社会证明
* 听起来像融资模板

### 直接冷外联（向目标）

目标：

* 从具体且近期的事情开始
* 解释为何匹配是真实的
* 提出一个低摩擦的请求

避免：

* 泛泛的赞美
* 功能堆砌
* 宽泛的请求，如"希望建立联系"
* 强加的修辞性问题

### 执行模式

对于每个目标，生成：

1. 推荐的渠道
2. 该渠道最佳的理由
3. 消息草稿
4. 可选的跟进草稿
5. 如果电子邮件是所选渠道且 Apple Mail 可用，则创建草稿而不仅仅是返回文本

如果浏览器控制可用：

* LinkedIn：检查目标资料、近期活动和共同联系背景，然后草拟或准备消息
* X：检查最近的帖子或回复，然后草拟私信或公开回复内容

如果桌面自动化可用：

* Apple Mail：创建包含主题、正文和收件人的电子邮件草稿

未经用户明确批准，不要自动发送消息。

### 反模式

* 没有个性化的通用模板
* 解释整个公司的冗长段落
* 一条消息中包含多个请求
* 没有具体细节的虚假熟悉感
* 带有可见合并字段的批量发送消息
* 电子邮件、LinkedIn 和 X 重复使用相同副本
* 平台化的敷衍内容，而非作者的真实语调

## 配置

用户应设置以下环境变量：

```bash
# Required
export X_BEARER_TOKEN="..."
export X_ACCESS_TOKEN="..."
export X_ACCESS_TOKEN_SECRET="..."
export X_CONSUMER_KEY="..."
export X_CONSUMER_SECRET="..."
export EXA_API_KEY="..."

# Optional
export LINKEDIN_COOKIE="..." # For browser-use LinkedIn access
export APOLLO_API_KEY="..."  # For Apollo enrichment
```

## 智能体

此技能在 `agents/` 子目录中包含专门的智能体：

* **signal-scorer** — 根据相关信号搜索和排序潜在客户
* **mutual-mapper** — 映射社交图谱连接并寻找暖路径
* **enrichment-agent** — 拉取详细的资料和公司数据
* **outreach-drafter** — 生成个性化消息

## 使用示例

```
用户：帮我找出预测市场中前20位我应该联系的人

代理工作流程：
1. signal-scorer 在 Exa 和 X 上搜索预测市场领导者
2. mutual-mapper 检查用户的 X 社交图谱以寻找共同联系
3. enrichment-agent 提取公司数据和近期活动信息
4. outreach-drafter 为排名靠前的潜在客户生成个性化消息

输出：包含暖路径、声音档案摘要以及渠道特定外联草稿或应用内草稿的排名列表
```

## 相关技能

* `brand-voice` 用于规范语调捕获
* `connections-optimizer` 用于在外联前进行先审阅的网络修剪和扩展
