# ECC 2.0 Alpha

`ecc2/` 是当前基于 Rust 的 ECC 2.0 控制平面脚手架。

它可作为本地实验的 alpha 版本使用，但**尚不是**完整的 ECC 2.0 产品。

## 当前已实现的功能

* 终端 UI 仪表板
* 由 SQLite 支持的会话存储
* 会话启动 / 停止 / 恢复流程
* 后台守护进程模式
* 可观测性和风险评分基础功能
* 工作树感知的会话脚手架
* 基础的多会话状态和输出跟踪

## 用途说明

ECC 2.0 是位于各个工具安装之上的管理层。

其目标是：

* 从一个界面管理多个代理会话
* 保持会话状态、输出和风险的可见性
* 增加编排、工作树管理和审查控制
* 优先支持 Claude Code，同时不阻碍未来工具的互操作性

## 当前状态

此目录应被视为：

* 真实可用的代码
* alpha 质量
* 可在本地构建和测试
* 尚不是公开的正式发布版本

更广泛路线图的公开议题集群位于主仓库的议题跟踪器中，标签为 `ecc-2.0`。

## 运行方法

在仓库根目录下：

```bash
cd ecc2
cargo run
```

有用的命令：

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

此 alpha 版本缺少定义 ECC 2.0 的更高级操作界面：

* 更丰富的多代理编排
* 明确的代理间委托和摘要
* 可视化的工作树 / 差异审查界面
* 更强的外部工具兼容性
* 更深层的记忆和路线图感知规划层
* 发布打包和安装程序方案

## 仓库规则

不要因为脚手架可以构建就将 `ecc2/` 宣传为已完成。

正确的表述是：

* ECC 2.0 alpha 版本存在
* 可用于内部/操作员测试
* 它还不是完整的发布版本
