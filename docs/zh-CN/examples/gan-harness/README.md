# GAN 风格工具使用示例

展示如何针对不同项目类型使用生成器-评估器工具。

## 快速开始

```bash
# Full-stack web app (uses all three agents)
./scripts/gan-harness.sh "Build a project management app with Kanban boards and team collaboration"

# Frontend design (skip planner, focus on design iterations)
GAN_SKIP_PLANNER=true ./scripts/gan-harness.sh "Create a stunning landing page for a crypto portfolio tracker"

# API-only (no browser testing needed)
GAN_EVAL_MODE=code-only ./scripts/gan-harness.sh "Build a REST API for a recipe sharing platform with search and ratings"

# Tight budget (fewer iterations, lower threshold)
GAN_MAX_ITERATIONS=5 GAN_PASS_THRESHOLD=6.5 ./scripts/gan-harness.sh "Build a todo app with categories and due dates"
```

## 示例：使用命令

```bash
# In Claude Code interactive mode:
/project:gan-build "Build a music streaming dashboard with playlists, visualizer, and social features"

# With options:
/project:gan-build "Build a recipe sharing platform" --max-iterations 10 --pass-threshold 7.5 --eval-mode screenshot
```

## 示例：手动运行三智能体流程

为了获得最大控制权，可以分别运行每个智能体：

```bash
# Step 1: Plan (produces spec.md)
claude -p --model opus "$(cat agents/gan-planner.md)

Your brief: 'Build a retro game maker with sprite editor and level designer'

Write the full spec to gan-harness/spec.md and eval rubric to gan-harness/eval-rubric.md."

# Step 2: Generate (iteration 1)
claude -p --model opus "$(cat agents/gan-generator.md)

Iteration 1. Read gan-harness/spec.md. Build the initial application.
Start dev server on port 3000. Commit as iteration-001."

# Step 3: Evaluate (iteration 1)
claude -p --model opus "$(cat agents/gan-evaluator.md)

Iteration 1. Read gan-harness/eval-rubric.md.
Test http://localhost:3000. Write feedback to gan-harness/feedback/feedback-001.md.
Be ruthlessly strict."

# Step 4: Generate (iteration 2 — reads feedback)
claude -p --model opus "$(cat agents/gan-generator.md)

Iteration 2. Read gan-harness/feedback/feedback-001.md FIRST.
Address every issue. Then read gan-harness/spec.md for remaining features.
Commit as iteration-002."

# Repeat steps 3-4 until satisfied
```

## 示例：自定义评估标准

对于非可视化项目（API、CLI、库），可以自定义评估标准：

```bash
mkdir -p gan-harness
cat > gan-harness/eval-rubric.md << 'EOF'
# API Evaluation Rubric

### Correctness (weight: 0.4)
- Do all endpoints return expected data?
- Are edge cases handled (empty inputs, large payloads)?
- Do error responses have proper status codes?

### Performance (weight: 0.2)
- Response times under 100ms for simple queries?
- Database queries optimized (no N+1)?
- Pagination implemented for list endpoints?

### Security (weight: 0.2)
- Input validation on all endpoints?
- SQL injection prevention?
- Rate limiting implemented?
- Authentication properly enforced?

### Documentation (weight: 0.2)
- OpenAPI spec generated?
- All endpoints documented?
- Example requests/responses provided?
EOF

GAN_SKIP_PLANNER=true GAN_EVAL_MODE=code-only ./scripts/gan-harness.sh "Build a REST API for task management"
```

## 项目类型与推荐设置

| 项目类型 | 评估模式 | 迭代次数 | 阈值 | 预估成本 |
|-------------|-----------|------------|-----------|-----------|
| 全栈 Web 应用 | playwright | 10-15 | 7.0 | $100-200 |
| 落地页 | screenshot | 5-8 | 7.5 | $30-60 |
| REST API | code-only | 5-8 | 7.0 | $30-60 |
| CLI 工具 | code-only | 3-5 | 6.5 | $15-30 |
| 数据仪表盘 | playwright | 8-12 | 7.0 | $60-120 |
| 游戏 | playwright | 10-15 | 7.0 | $100-200 |

## 理解输出结果

每次运行后，请检查：

1. **`gan-harness/build-report.md`** — 包含分数进展的最终摘要
2. **`gan-harness/feedback/`** — 所有评估反馈（有助于理解质量演变过程）
3. **`gan-harness/spec.md`** — 完整规范（如果想继续手动开发，这会很有用）
4. **分数进展** — 应显示稳步提升。出现平台期表明模型已达到其能力上限。

## 提示

1. **从清晰的简报开始** — “用 Y 和 Z 构建 X” 比 “做个酷炫的东西” 效果更好
2. **迭代次数不要低于 5 次** — 前 2-3 次迭代的分数通常低于阈值
3. **UI 项目使用 `playwright` 模式** — 仅截图模式会遗漏交互性错误
4. **查看反馈文件** — 即使最终分数达标，反馈中也包含有价值的见解
5. **迭代优化规范** — 如果结果不理想，改进 `spec.md` 并使用 `--skip-planner` 重新运行
