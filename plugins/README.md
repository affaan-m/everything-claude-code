# プラグインとマーケットプレイス

プラグインは Claude Code を新しいツールと機能で拡張します。このガイドではインストールのみを扱います - いつ、なぜ使用するかについては[完全な記事](https://x.com/affaanmustafa/status/2012378465664745795)をご覧ください。

---

## マーケットプレイス

マーケットプレイスはインストール可能なプラグインのリポジトリです。

### マーケットプレイスの追加

```bash
# 公式 Anthropic マーケットプレイスを追加
claude plugin marketplace add https://github.com/anthropics/claude-plugins-official

# コミュニティマーケットプレイスを追加
claude plugin marketplace add https://github.com/mixedbread-ai/mgrep
```

### 推奨マーケットプレイス

| マーケットプレイス | ソース |
|------------------|--------|
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

### 推奨プラグイン

**開発:**
- `typescript-lsp` - TypeScript インテリジェンス
- `pyright-lsp` - Python 型チェック
- `hookify` - 会話形式で hook を作成
- `code-simplifier` - コードのリファクタリング

**コード品質:**
- `code-review` - コードレビュー
- `pr-review-toolkit` - PR 自動化
- `security-guidance` - セキュリティチェック

**検索:**
- `mgrep` - 強化された検索（ripgrep より優れている）
- `context7` - ライブドキュメント参照

**ワークフロー:**
- `commit-commands` - Git ワークフロー
- `frontend-design` - UI パターン
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
|-- cache/                    # ダウンロードしたプラグイン
|-- installed_plugins.json    # インストール済みリスト
|-- known_marketplaces.json   # 追加したマーケットプレイス
|-- marketplaces/             # マーケットプレイスデータ
```
