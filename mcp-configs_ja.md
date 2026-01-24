# MCP Configs（MCP設定）解説

## MCPとは

**MCP（Model Context Protocol）**は、Claude Codeに外部サービスやツールを統合するためのプロトコルです。GitHub、Supabase、Vercelなどのサービスと直接連携できます。

### 配置場所

```
~/.claude.json  # MCP設定
```

---

## 重要な注意事項

### コンテキストウィンドウへの影響

**MCPを有効にしすぎるとコンテキストウィンドウが激減します。**

| 状態 | コンテキスト |
|------|-------------|
| MCPなし | 200k |
| 多数のMCP有効 | **70k以下になる可能性** |

### 推奨ルール

- 設定には20-30のMCPを持つ
- **プロジェクトごとに有効にするのは10未満**
- **アクティブなツールは80未満**
- `disabledMcpServers`で未使用を無効化

---

## 含まれるMCP一覧

### 開発ツール

| MCP | 説明 | タイプ |
|-----|------|--------|
| **github** | GitHub操作（PR、Issue、リポジトリ） | npx |
| **filesystem** | ファイルシステム操作 | npx |
| **memory** | セッション間の永続メモリ | npx |
| **sequential-thinking** | Chain-of-thought推論 | npx |

### データベース

| MCP | 説明 | タイプ |
|-----|------|--------|
| **supabase** | Supabaseデータベース操作 | npx |
| **clickhouse** | ClickHouse分析クエリ | HTTP |

### デプロイ・インフラ

| MCP | 説明 | タイプ |
|-----|------|--------|
| **vercel** | Vercelデプロイ・プロジェクト | HTTP |
| **railway** | Railwayデプロイ | npx |
| **cloudflare-docs** | Cloudflareドキュメント検索 | HTTP |
| **cloudflare-workers-builds** | Cloudflare Workersビルド | HTTP |
| **cloudflare-workers-bindings** | Cloudflare Workersバインディング | HTTP |
| **cloudflare-observability** | Cloudflareログ・監視 | HTTP |

### ユーティリティ

| MCP | 説明 | タイプ |
|-----|------|--------|
| **firecrawl** | Webスクレイピング・クロール | npx |
| **context7** | ライブドキュメント検索 | npx |
| **magic** | Magic UIコンポーネント | npx |

---

## 設定方法

### 1. ~/.claude.json に追加

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

### 2. 環境変数の設定

プレースホルダーを実際の値に置き換え：

| プレースホルダー | 説明 |
|-----------------|------|
| `YOUR_GITHUB_PAT_HERE` | GitHub Personal Access Token |
| `YOUR_FIRECRAWL_KEY_HERE` | Firecrawl APIキー |
| `YOUR_PROJECT_REF` | Supabaseプロジェクト参照 |

### 3. プロジェクトごとの無効化

プロジェクトの`.claude.json`で無効化：

```json
{
  "disabledMcpServers": ["supabase", "railway"]
}
```

---

## MCP タイプ

### npxタイプ

```json
{
  "command": "npx",
  "args": ["-y", "@package/name"],
  "env": {
    "API_KEY": "..."
  }
}
```

ローカルでコマンドを実行。

### HTTPタイプ

```json
{
  "type": "http",
  "url": "https://mcp.service.com/mcp"
}
```

リモートサービスにHTTPで接続。

---

## カスタマイズ提案

### 1. 使用するMCPのみ設定

すべてのMCPを設定するのではなく、実際に使用するものだけを追加：

- GitHubを使う → `github` を追加
- Supabaseを使う → `supabase` を追加
- Vercelにデプロイ → `vercel` を追加

### 2. プロジェクトタイプ別のMCPセット

#### Webアプリ開発
```json
{
  "mcpServers": {
    "github": {...},
    "vercel": {...},
    "supabase": {...}
  }
}
```

#### インフラ/DevOps
```json
{
  "mcpServers": {
    "github": {...},
    "cloudflare-workers-builds": {...},
    "railway": {...}
  }
}
```

### 3. 新しいMCPの追加

MCPマーケットプレイスから必要なものを追加：

```bash
# MCPを探す
npm search @modelcontextprotocol

# 追加
npx -y @modelcontextprotocol/server-new-service
```

---

## 参考リンク

- [ショートハンドガイド - MCP管理](shorthand-guide_ja.md#2-mcp管理重要)
- [Claude Code Docs - MCP](https://code.claude.com/docs/en/mcp)
- [MCP Servers Registry](https://github.com/modelcontextprotocol/servers)
