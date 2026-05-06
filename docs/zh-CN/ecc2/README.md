# ECC 2.0 Alpha

`ecc2/` 是当前基于 Rust 的 ECC 2.0 控制平面脚手架。

它可作为 alpha 版本用于本地实验，但**尚未**是完整的 ECC 2.0 产品。

## 当前已实现的功能

* 终端 UI 仪表盘
* 基于 SQLite 的会话存储
* 会话启动/停止/恢复流程
* 后台守护进程模式
* 可观测性与风险评分原语
* 工作树感知的会话脚手架
* 基础的多会话状态与输出追踪

## 用途说明

ECC 2.0 是位于单个工具安装之上的抽象层。

目标是：

* 从单一界面管理多个代理会话
* 保持会话状态、输出和风险可见
* 增加编排、工作树管理和审查控制
* 优先支持 Claude Code，同时不阻碍未来工具间的互操作性

## 当前状态

本目录应被视为：

* 真实代码
* alpha 质量
* 可本地构建和测试
* 尚未公开发布正式版

更广泛路线图的开放问题集群位于主仓库问题跟踪器中，标签为 `ecc-2.0`。

## 运行方式

从仓库根目录执行：

```bash
cd ecc2
cargo run
```

常用命令：

```bash
# Launch the dashboard
cargo run -- dashboard

# Start a new session
cargo run -- start --task "audit the repo and propose fixes" --agent claude --worktree

# List sessions
cargo run -- sessions

# Inspect a session
cargo run -- status latest

# Stop a session
cargo run -- stop <session-id>

# Resume a failed/stopped session
cargo run -- resume <session-id>

# Run the daemon loop
cargo run -- daemon
```

## 验证

```bash
cd ecc2
cargo test
```

## 尚缺失的功能

alpha 版本缺少定义 ECC 2.0 的更高级操作界面：

* 更丰富的多代理编排
* 明确的代理间委派与摘要
* 可视化工作树/差异审查界面
* 更强的外部工具兼容性
* 更深度的记忆与路线图感知规划层
* 发布打包与安装程序方案

## 仓库规则

不要因为脚手架能构建就宣称 `ecc2/` 已完成。

正确的表述是：

* ECC 2.0 alpha 版本已存在
* 可用于内部/操作员测试
* 尚未是完整发布版本
