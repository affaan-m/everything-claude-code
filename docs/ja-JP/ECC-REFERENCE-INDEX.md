# ECC 参照インデックス

読むべき人: 必要なファイルだけ素早く開きたい人  
読むタイミング: 全体像を掴んだあと、具体的な目的別に辿りたいとき  
3行要約:
- このファイルは ECC 日本語ガイド群の入口。
- 「何をしたいか」から読むべきファイルへ飛べる。
- 詳細を全部読む前に、必要な面だけ絞るための索引。

## 主要ドキュメント

- [ECC 詳細ガイド](./ECC-GUIDE.md)
  - ECC の全体像
  - 最小導入手順
  - Codex / Claude 差分
  - 最初に何を入れるべきか
- [ECC コマンドリファレンス](./ECC-COMMANDS-REFERENCE.md)
  - slash command 全件
  - 目的、使う場面、例、対応 skill / agent
- [ECC スキルカタログ](./ECC-SKILLS-CATALOG.md)
  - skill 全件
  - カテゴリ別の整理
  - どういう依頼で起動すべきか
- [ECC 付録](./ECC-APPENDIX.md)
  - agents 一覧
  - 既定 6 MCP
  - rules / hooks / install profiles
  - 最小構成と full の切り分け

## 目的別の読み方

### ECC が何者かを知りたい

1. [ECC 詳細ガイド](./ECC-GUIDE.md)
2. [ECC 付録](./ECC-APPENDIX.md)

### 最初に何を入れるべきかを知りたい

1. [ECC 詳細ガイド](./ECC-GUIDE.md)
2. [ECC 付録](./ECC-APPENDIX.md)

### slash command の使い方だけ知りたい

1. [ECC コマンドリファレンス](./ECC-COMMANDS-REFERENCE.md)

### Codex では何に読み替えればよいか知りたい

1. [ECC 詳細ガイド](./ECC-GUIDE.md)
2. [ECC コマンドリファレンス](./ECC-COMMANDS-REFERENCE.md)

### どんな skill があるかを一覧したい

1. [ECC スキルカタログ](./ECC-SKILLS-CATALOG.md)

### どの agent が何を担当するか知りたい

1. [ECC 付録](./ECC-APPENDIX.md)

### MCP が何をするか知りたい

1. [ECC 付録](./ECC-APPENDIX.md)

## すぐ使う場合の最短ルート

### 新機能を始める

1. [ECC 詳細ガイド](./ECC-GUIDE.md)
2. [ECC コマンドリファレンス](./ECC-COMMANDS-REFERENCE.md) の `plan` `tdd` `code-review` `verify`
3. [ECC スキルカタログ](./ECC-SKILLS-CATALOG.md) の `tdd-workflow` `verification-loop` `security-review`

### 壊れたビルドを直す

1. [ECC コマンドリファレンス](./ECC-COMMANDS-REFERENCE.md) の build 系
2. [ECC 付録](./ECC-APPENDIX.md) の build resolver agents

### ドキュメントや API を調べる

1. [ECC コマンドリファレンス](./ECC-COMMANDS-REFERENCE.md) の `docs`
2. [ECC スキルカタログ](./ECC-SKILLS-CATALOG.md) の `documentation-lookup` `search-first` `deep-research`
3. [ECC 付録](./ECC-APPENDIX.md) の MCP 章

### セッションをまたいで使う

1. [ECC コマンドリファレンス](./ECC-COMMANDS-REFERENCE.md) の session / learning 系
2. [ECC 付録](./ECC-APPENDIX.md) の hooks / memory / profile 章

## このガイド群の設計方針

- 概要を先に、全件一覧は後に置く
- Codex / Claude の差分は都度短く書く
- `full` 前提ではなく、最小構成から始める
- skill / command は全件載せるが、1 項目あたりは短く保つ
- スクラッチバッドを圧迫しないよう、索引ファイルを独立させる
