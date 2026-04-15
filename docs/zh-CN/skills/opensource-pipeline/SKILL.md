---
name: opensource-pipeline
description: "开源流水线：分叉、清理并打包私有项目，以便安全公开发布。链接3个代理（分叉器、清理器、打包器）。触发词：'/opensource'、'open source this'、'make this public'、'prepare for open source'。"
origin: ECC
---

# 开源流水线技能

通过一个三阶段流水线安全地开源任何项目：**复刻**（剥离密钥）→ **清理**（验证洁净）→ **打包**（CLAUDE.md + setup.sh + README）。

## 何时激活

* 用户说“开源这个项目”或“将其公开”
* 用户希望将私有仓库准备公开发布
* 用户需要在推送到 GitHub 前剥离密钥
* 用户调用 `/opensource fork`、`/opensource verify` 或 `/opensource package`

## 命令

| 命令 | 操作 |
|---------|--------|
| `/opensource fork PROJECT` | 完整流水线：复刻 + 清理 + 打包 |
| `/opensource verify PROJECT` | 在现有仓库上运行清理器 |
| `/opensource package PROJECT` | 生成 CLAUDE.md + setup.sh + README |
| `/opensource list` | 显示所有暂存项目 |
| `/opensource status PROJECT` | 显示暂存项目的报告 |

## 协议

### /opensource fork PROJECT

**完整流水线 — 主要工作流。**

#### 步骤 1：收集参数

解析项目路径。如果 PROJECT 包含 `/`，则将其视为路径（绝对或相对）。否则检查：当前工作目录、`$HOME/PROJECT`，然后询问用户。

```
SOURCE_PATH="<resolved absolute path>"
STAGING_PATH="$HOME/opensource-staging/${PROJECT_NAME}"
```

询问用户：

1. “哪个项目？”（如果未找到）
2. “许可证？（MIT / Apache-2.0 / GPL-3.0 / BSD-3-Clause）”
3. “GitHub 组织或用户名？”（默认：通过 `gh api user -q .login` 检测）
4. “GitHub 仓库名称？”（默认：项目名称）
5. “README 的描述？”（分析项目以提供建议）

#### 步骤 2：创建暂存目录

```bash
mkdir -p $HOME/opensource-staging/
```

#### 步骤 3：运行复刻器代理

启动 `opensource-forker` 代理：

```
Agent(
  description="Fork {PROJECT} for open-source",
  subagent_type="opensource-forker",
  prompt="""
为开源发布 Fork 项目。

源路径: {SOURCE_PATH}
目标路径: {STAGING_PATH}
许可证: {chosen_license}

遵循完整的 forking 协议：
1. 复制文件（排除 .git, node_modules, __pycache__, .venv）
2. 移除所有密钥和凭据
3. 将内部引用替换为占位符
4. 生成 .env.example
5. 清理 git 历史记录
6. 在 {STAGING_PATH}/FORK_REPORT.md 生成 FORK_REPORT.md
"""
)
```

等待完成。读取 `{STAGING_PATH}/FORK_REPORT.md`。

#### 步骤 4：运行清理器代理

启动 `opensource-sanitizer` 代理：

```
Agent(
  description="验证 {PROJECT} 的清理情况",
  subagent_type="opensource-sanitizer",
  prompt="""
验证开源分支的清理情况。

项目：{STAGING_PATH}
源项目（供参考）：{SOURCE_PATH}

运行所有扫描类别：
1. 密钥扫描（关键）
2. 个人身份信息扫描（关键）
3. 内部引用扫描（关键）
4. 危险文件检查（关键）
5. 配置完整性检查（警告）
6. Git 历史审计

在 {STAGING_PATH}/ 内生成 SANITIZATION_REPORT.md 文件，并给出通过/失败的判定。
"""
)
```

等待完成。读取 `{STAGING_PATH}/SANITIZATION_REPORT.md`。

**如果 FAIL：** 向用户展示发现的问题。询问：“修复这些问题并重新扫描，还是中止？”

* 如果修复：应用修复，重新运行清理器（最多重试 3 次 — 3 次 FAIL 后，展示所有发现的问题并要求用户手动修复）
* 如果中止：清理暂存目录

**如果 PASS 或 PASS WITH WARNINGS：** 继续步骤 5。

#### 步骤 5：运行打包器代理

启动 `opensource-packager` 代理：

```
Agent(
  description="为开源项目 {PROJECT} 打包",
  subagent_type="opensource-packager",
  prompt="""
为项目生成开源打包文件。

项目: {STAGING_PATH}
许可证: {chosen_license}
项目名称: {PROJECT_NAME}
描述: {description}
GitHub 仓库: {github_repo}

生成:
1. CLAUDE.md (命令、架构、关键文件)
2. setup.sh (一键引导脚本，设为可执行)
3. README.md (或增强现有文件)
4. LICENSE
5. CONTRIBUTING.md
6. .github/ISSUE_TEMPLATE/ (bug_report.md, feature_request.md)
"""
)
```

#### 步骤 6：最终审查

向用户展示：

```
开源分支就绪：{PROJECT_NAME}

位置：{STAGING_PATH}
许可证：{license}
生成的文件：
  - CLAUDE.md
  - setup.sh（可执行文件）
  - README.md
  - LICENSE
  - CONTRIBUTING.md
  - .env.example（{N} 个变量）

清理情况：{sanitization_verdict}

后续步骤：
  1. 审查：cd {STAGING_PATH}
  2. 创建仓库：gh repo create {github_org}/{github_repo} --public
  3. 推送：git remote add origin ... && git push -u origin main

是否继续创建 GitHub 仓库？（是/否/先审查）
```

#### 步骤 7：GitHub 发布（经用户批准后）

```bash
cd "{STAGING_PATH}"
gh repo create "{github_org}/{github_repo}" --public --source=. --push --description "{description}"
```

***

### /opensource verify PROJECT

独立运行清理器。解析路径：如果 PROJECT 包含 `/`，则将其视为路径。否则检查 `$HOME/opensource-staging/PROJECT`，然后 `$HOME/PROJECT`，最后是当前目录。

```
Agent(
  subagent_type="opensource-sanitizer",
  prompt="验证以下内容的清理情况：{resolved_path}。运行全部6个扫描类别并生成SANITIZATION_REPORT.md。"
)
```

***

### /opensource package PROJECT

独立运行打包器。询问“许可证？”和“描述？”，然后：

```
Agent(
  subagent_type="opensource-packager",
  prompt="打包：{resolved_path} ..."
)
```

***

### /opensource list

```bash
ls -d $HOME/opensource-staging/*/
```

显示每个项目及其流水线进度（FORK\_REPORT.md、SANITIZATION\_REPORT.md、CLAUDE.md 的存在情况）。

***

### /opensource status PROJECT

```bash
cat $HOME/opensource-staging/${PROJECT}/SANITIZATION_REPORT.md
cat $HOME/opensource-staging/${PROJECT}/FORK_REPORT.md
```

## 暂存布局

```
$HOME/opensource-staging/
  my-project/
    FORK_REPORT.md           # 来自 forker agent
    SANITIZATION_REPORT.md   # 来自 sanitizer agent
    CLAUDE.md                # 来自 packager agent
    setup.sh                 # 来自 packager agent
    README.md                # 来自 packager agent
    .env.example             # 来自 forker agent
    ...                      # 已清理的项目文件
```

## 反模式

* **绝不**在未经用户批准的情况下推送到 GitHub
* **绝不**跳过清理器 — 它是安全门
* **绝不**在清理器 FAIL 后未修复所有关键问题的情况下继续
* **绝不**在暂存目录中留下 `.env`、`*.pem` 或 `credentials.json`

## 最佳实践

* 对于新版本，始终运行完整流水线（复刻 → 清理 → 打包）
* 暂存目录会一直保留，直到显式清理 — 用它进行审查
* 在发布前，任何手动修复后重新运行清理器
* 将密钥参数化而非删除 — 保持项目功能

## 相关技能

有关清理器使用的密钥检测模式，请参阅 `security-review`。
