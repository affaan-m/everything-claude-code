# Everything Claude Code for JoyCode

为 JoyCode IDE 带来 Everything Claude Code (ECC) 工作流。此仓库提供自定义命令、智能体、技能和规则，可以通过单个命令安装到任何 JoyCode 项目中。

## 快速开始

### 方式一：本地安装到当前项目

```bash
# 安装到当前项目的 .joycode 目录
cd /path/to/your/project
.joycode/install.sh
```

这将在您的项目目录中创建 `.joycode/`。

### 方式二：全局安装（适用于所有项目）

```bash
# 全局安装到 ~/.joycode/
cd /path/to/your/project
.joycode/install.sh ~

# 或者从 .joycode 文件夹直接安装
cd /path/to/your/project/.joycode
./install.sh ~
```

这将创建 `~/.joycode/`，适用于所有 JoyCode 项目。

### 方式三：在当前目录快速安装

```bash
# 如果已在包含 .joycode 文件夹的项目目录中
cd .joycode
./install.sh
```

安装程序使用非破坏性复制 - 它不会覆盖您现有的文件。

## 安装模式

### 本地安装

安装到当前项目的 `.joycode` 目录：

```bash
cd /path/to/your/project
.joycode/install.sh
```

这将创建 `/path/to/your/project/.joycode/` 并包含所有 ECC 组件。

### 全局安装

安装到您主目录的 `.joycode` 目录（适用于所有 JoyCode 项目）：

```bash
# 从项目目录安装
.joycode/install.sh ~

# 或直接从 .joycode 文件夹安装
cd .joycode
./install.sh ~
```

这将创建 `~/.joycode/` 并包含所有 ECC 组件。所有 JoyCode 项目都将使用这些全局安装内容。

**注意**：全局安装适用于希望在所有项目之间维护单个 ECC 副本的场景。

## 卸载

卸载程序使用清单文件（`.ecc-manifest`）跟踪已安装的文件，确保安全删除：

```bash
# 从当前目录卸载（如果已经在 .joycode 目录中）
cd .joycode
./uninstall.sh

# 或者从项目根目录卸载
cd /path/to/your/project
.joycode/uninstall.sh

# 从主目录全局卸载
.joycode/uninstall.sh ~

# 卸载前会询问确认
```

### 卸载行为

- **安全删除**：仅删除清单中跟踪的文件（由 ECC 安装的文件）
- **保留用户文件**：您手动添加的任何文件都会被保留
- **非空目录**：包含用户添加文件的目录会被跳过
- **基于清单**：需要 `.ecc-manifest` 文件（在安装时创建）

**注意**：如果找不到清单文件（旧版本安装），卸载程序将询问是否删除整个目录。

## 包含的内容

### 命令

命令是通过 JoyCode 聊天中的 `/` 菜单调用的按需工作流。所有命令都直接复用自项目根目录的 `commands/` 文件夹。

### 智能体

智能体是具有特定工具配置的专门 AI 助手。所有智能体都直接复用自项目根目录的 `agents/` 文件夹。

### 技能

技能是通过聊天中的 `/` 菜单调用的按需工作流。所有技能都直接复用自项目的 `skills/` 文件夹。

### 规则

规则提供始终适用的规则和上下文，塑造智能体处理代码的方式。所有规则都直接复用自项目根目录的 `rules/` 文件夹。

## 使用方法

1. 在聊天中输入 `/` 以打开命令菜单
2. 选择一个命令或技能
3. 智能体将通过具体说明和检查清单指导您完成工作流

## 项目结构

```
.joycode/
├── commands/           # 命令文件（复用自项目根目录）
├── agents/             # 智能体文件（复用自项目根目录）
├── skills/             # 技能文件（复用自 skills/）
├── rules/              # 规则文件（复用自项目根目录）
├── install.sh          # 安装脚本
├── uninstall.sh        # 卸载脚本
└── README.md           # 英文说明文件
```

## 自定义

安装后，所有文件都归您修改。安装程序永远不会覆盖现有文件，因此您的自定义在重新安装时是安全的。

**注意**：安装时会自动将 `install.sh` 和 `uninstall.sh` 脚本复制到目标目录，这样您可以在项目本地直接运行这些命令。

## 推荐的工作流

1. **从计划开始**：使用 `/plan` 命令分解复杂功能
2. **先写测试**：在实现之前调用 `/tdd` 命令
3. **审查您的代码**：编写代码后使用 `/code-review`
4. **检查安全性**：对于身份验证、API 端点或敏感数据处理，再次使用 `/code-review`
5. **修复构建错误**：如果有构建错误，使用 `/build-fix`

## 下一步

- 在 JoyCode 中打开您的项目
- 输入 `/` 以查看可用命令
- 享受 ECC 工作流！