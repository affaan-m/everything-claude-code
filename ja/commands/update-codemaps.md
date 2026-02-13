# コードマップ更新

コードベースの構造を分析し、アーキテクチャドキュメントを更新：

1. すべてのソースファイルの import、export、依存関係をスキャン
2. 以下の形式でトークン効率の良いコードマップを生成：
   - codemaps/architecture.md - 全体アーキテクチャ
   - codemaps/backend.md - バックエンド構造
   - codemaps/frontend.md - フロントエンド構造
   - codemaps/data.md - データモデルとスキーマ

3. 前回バージョンからの差分パーセンテージを計算
4. 変更が30%を超える場合、更新前にユーザーの承認を求める
5. 各コードマップに鮮度タイムスタンプを追加
6. レポートを .reports/codemap-diff.txt に保存

分析には TypeScript/Node.js を使用。実装の詳細ではなく、高レベルの構造に焦点を当てる。
