# プラグインとマーケットプレイス

プラグインは Claude Code に新しいツールと機能を追加します。このガイドではインストール方法のみを説明します - 使用するタイミングと理由については[詳細記事](https://x.com/affaanmustafa/status/2012378465664745795)を参照してください。

---

## マーケットプレイス

マーケットプレイスはインストール可能なプラグインのリポジトリです。

### マーケットプレイスの追加

```bash
# Anthropic 公式マーケットプレイスを追加
claude plugin marketplace add https://github.com/anthropics/claude-plugins-official

# コミュニティマーケットプレイスを追加
claude plugin marketplace add https://github.com/mixedbread-ai/mgrep
```

### おすすめのマーケットプレイス

| マーケットプレイス | ソース |
|-------------|--------|
| claude-plugins-official | `anthropics/claude-plugins-official` |
| claude-code-plugins | `anthropics/claude-code` |
| Mixedbread-Grep | `mixedbread-ai/mgrep` |

---

## プラグインのインストール

```bash
# プラグインブラウザを開く
/plugins

# または直接インストール
claude plugin install typescript-lsp@claude-plugins-official
```

### おすすめのプラグイン

**開発:**
- `typescript-lsp` - TypeScript インテリジェンス
- `pyright-lsp` - Python 型チェック
- `hookify` - 会話形式でフックを作成
- `code-simplifier` - コードのリファクタリング

**コード品質:**
- `code-review` - コードレビュー
- `pr-review-toolkit` - PR自動化
- `security-guidance` - セキュリティチェック

**検索:**
- `mgrep` - 強化された検索（ripgrep より高性能）
- `context7` - ライブドキュメント検索

**ワークフロー:**
- `commit-commands` - Git ワークフロー
- `frontend-design` - UIパターン
- `feature-dev` - 機能開発

---

## クイックセットアップ

```bash
# マーケットプレイスを追加
claude plugin marketplace add https://github.com/anthropics/claude-plugins-official
claude plugin marketplace add https://github.com/mixedbread-ai/mgrep

# /plugins を開いて必要なものをインストール
```

---

## プラグインファイルの場所

```
~/.claude/plugins/
|-- cache/                    # ダウンロード済みプラグイン
|-- installed_plugins.json    # インストール済みリスト
|-- known_marketplaces.json   # 追加済みマーケットプレイス
|-- marketplaces/             # マーケットプレイスデータ
```
