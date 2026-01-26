---
name: postgres-patterns
description: クエリ最適化、スキーマ設計、インデックス作成、セキュリティのためのPostgreSQLデータベースパターン。Supabaseのベストプラクティスに基づく。
---

# PostgreSQLパターン

PostgreSQLベストプラクティスのクイックリファレンス。詳細なガイダンスについては、`database-reviewer` agentを使用してください。

## 有効化するタイミング

- SQLクエリやマイグレーションを書く時
- データベーススキーマを設計する時
- 遅いクエリをトラブルシューティングする時
- Row Level Securityを実装する時
- コネクションプーリングを設定する時

## クイックリファレンス

### インデックスチートシート

| クエリパターン | インデックスタイプ | 例 |
|--------------|------------|---------|
| `WHERE col = value` | B-tree（デフォルト） | `CREATE INDEX idx ON t (col)` |
| `WHERE col > value` | B-tree | `CREATE INDEX idx ON t (col)` |
| `WHERE a = x AND b > y` | 複合 | `CREATE INDEX idx ON t (a, b)` |
| `WHERE jsonb @> '{}'` | GIN | `CREATE INDEX idx ON t USING gin (col)` |
| `WHERE tsv @@ query` | GIN | `CREATE INDEX idx ON t USING gin (col)` |
| 時系列の範囲 | BRIN | `CREATE INDEX idx ON t USING brin (col)` |

### データ型クイックリファレンス

| ユースケース | 正しい型 | 避けるべき型 |
|----------|-------------|-------|
| ID | `bigint` | `int`、ランダムUUID |
| 文字列 | `text` | `varchar(255)` |
| タイムスタンプ | `timestamptz` | `timestamp` |
| 金額 | `numeric(10,2)` | `float` |
| フラグ | `boolean` | `varchar`、`int` |

### 一般的なパターン

**複合インデックスの順序：**
```sql
-- 等価列を先に、次に範囲列
CREATE INDEX idx ON orders (status, created_at);
-- 動作対象: WHERE status = 'pending' AND created_at > '2024-01-01'
```

**カバリングインデックス：**
```sql
CREATE INDEX idx ON users (email) INCLUDE (name, created_at);
-- SELECT email, name, created_atでテーブルルックアップを回避
```

**部分インデックス：**
```sql
CREATE INDEX idx ON users (email) WHERE deleted_at IS NULL;
-- より小さいインデックス、アクティブユーザーのみを含む
```

**RLSポリシー（最適化版）：**
```sql
CREATE POLICY policy ON orders
  USING ((SELECT auth.uid()) = user_id);  -- SELECTでラップ！
```

**UPSERT：**
```sql
INSERT INTO settings (user_id, key, value)
VALUES (123, 'theme', 'dark')
ON CONFLICT (user_id, key)
DO UPDATE SET value = EXCLUDED.value;
```

**カーソルページネーション：**
```sql
SELECT * FROM products WHERE id > $last_id ORDER BY id LIMIT 20;
-- O(1) vs OFFSETはO(n)
```

**キュー処理：**
```sql
UPDATE jobs SET status = 'processing'
WHERE id = (
  SELECT id FROM jobs WHERE status = 'pending'
  ORDER BY created_at LIMIT 1
  FOR UPDATE SKIP LOCKED
) RETURNING *;
```

### アンチパターン検出

```sql
-- インデックスのない外部キーを見つける
SELECT conrelid::regclass, a.attname
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey)
  );

-- 遅いクエリを見つける
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC;

-- テーブルの肥大化をチェック
SELECT relname, n_dead_tup, last_vacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

### 設定テンプレート

```sql
-- 接続制限（RAMに応じて調整）
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET work_mem = '8MB';

-- タイムアウト
ALTER SYSTEM SET idle_in_transaction_session_timeout = '30s';
ALTER SYSTEM SET statement_timeout = '30s';

-- モニタリング
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- セキュリティデフォルト
REVOKE ALL ON SCHEMA public FROM public;

SELECT pg_reload_conf();
```

## 関連

- agent: `database-reviewer` - 完全なデータベースレビューワークフロー
- skill: `clickhouse-io` - ClickHouse分析パターン
- skill: `backend-patterns` - APIとバックエンドパターン

---

*[Supabase Agent Skills](https://github.com/supabase/agent-skills)（MITライセンス）に基づく*
