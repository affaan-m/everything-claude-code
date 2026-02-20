# 更新代码地图

分析代码库结构并更新架构文档：

1. 扫描所有源文件的导入、导出和依赖关系

2. 以以下格式生成简洁的代码地图：
   * codemaps/architecture.md - 整体架构
   * codemaps/backend.md - 后端结构
   * codemaps/frontend.md - 前端结构
   * codemaps/data.md - 数据模型和模式

3. 计算与之前版本的差异百分比

4. 如果变更 > 30%，则在更新前请求用户批准

5. 为每个代码地图添加新鲜度时间戳

6. 将报告保存到 .reports/codemap-diff.txt

使用 TypeScript/Node.js 进行分析。专注于高层结构，而非实现细节。
