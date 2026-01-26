---
name: iterative-retrieval
description: サブagentのcontext問題を解決するための、段階的なcontext取得を精緻化するパターン
---

# 反復的取得パターン

サブagentが作業を開始するまでどのcontextが必要かわからないという、マルチagentワークフローにおける「context問題」を解決します。

## 問題

サブagentは限られたcontextで起動されます。以下のことがわかりません：
- どのファイルに関連コードが含まれているか
- コードベースにどのようなパターンが存在するか
- プロジェクトでどのような用語が使われているか

標準的なアプローチは失敗します：
- **すべてを送る**: contextの制限を超える
- **何も送らない**: agentが重要な情報を欠く
- **必要なものを推測する**: しばしば間違う

## 解決策：反復的取得

contextを段階的に精緻化する4フェーズのループ：

```
┌─────────────────────────────────────────────┐
│                                             │
│   ┌──────────┐      ┌──────────┐            │
│   │ DISPATCH │─────▶│ EVALUATE │            │
│   └──────────┘      └──────────┘            │
│        ▲                  │                 │
│        │                  ▼                 │
│   ┌──────────┐      ┌──────────┐            │
│   │   LOOP   │◀─────│  REFINE  │            │
│   └──────────┘      └──────────┘            │
│                                             │
│        最大3サイクル、その後続行            │
└─────────────────────────────────────────────┘
```

### フェーズ1：DISPATCH

候補ファイルを収集するための初期の広範なクエリ：

```javascript
// ハイレベルな意図から開始
const initialQuery = {
  patterns: ['src/**/*.ts', 'lib/**/*.ts'],
  keywords: ['authentication', 'user', 'session'],
  excludes: ['*.test.ts', '*.spec.ts']
};

// 取得agentにディスパッチ
const candidates = await retrieveFiles(initialQuery);
```

### フェーズ2：EVALUATE

取得したコンテンツの関連性を評価：

```javascript
function evaluateRelevance(files, task) {
  return files.map(file => ({
    path: file.path,
    relevance: scoreRelevance(file.content, task),
    reason: explainRelevance(file.content, task),
    missingContext: identifyGaps(file.content, task)
  }));
}
```

スコアリング基準：
- **高 (0.8-1.0)**: 対象機能を直接実装
- **中 (0.5-0.7)**: 関連するパターンや型を含む
- **低 (0.2-0.4)**: 間接的に関連
- **なし (0-0.2)**: 関連なし、除外

### フェーズ3：REFINE

評価に基づいて検索条件を更新：

```javascript
function refineQuery(evaluation, previousQuery) {
  return {
    // 高関連性ファイルで発見された新しいパターンを追加
    patterns: [...previousQuery.patterns, ...extractPatterns(evaluation)],

    // コードベースで見つかった用語を追加
    keywords: [...previousQuery.keywords, ...extractKeywords(evaluation)],

    // 確認された無関係なパスを除外
    excludes: [...previousQuery.excludes, ...evaluation
      .filter(e => e.relevance < 0.2)
      .map(e => e.path)
    ],

    // 特定のギャップをターゲット
    focusAreas: evaluation
      .flatMap(e => e.missingContext)
      .filter(unique)
  };
}
```

### フェーズ4：LOOP

精緻化された条件で繰り返し（最大3サイクル）：

```javascript
async function iterativeRetrieve(task, maxCycles = 3) {
  let query = createInitialQuery(task);
  let bestContext = [];

  for (let cycle = 0; cycle < maxCycles; cycle++) {
    const candidates = await retrieveFiles(query);
    const evaluation = evaluateRelevance(candidates, task);

    // 十分なcontextがあるか確認
    const highRelevance = evaluation.filter(e => e.relevance >= 0.7);
    if (highRelevance.length >= 3 && !hasCriticalGaps(evaluation)) {
      return highRelevance;
    }

    // 精緻化して続行
    query = refineQuery(evaluation, query);
    bestContext = mergeContext(bestContext, highRelevance);
  }

  return bestContext;
}
```

## 実践例

### 例1：バグ修正のcontext

```
タスク: "認証トークンの有効期限切れバグを修正"

サイクル1:
  DISPATCH: src/**で"token", "auth", "expiry"を検索
  EVALUATE: auth.ts (0.9), tokens.ts (0.8), user.ts (0.3)を発見
  REFINE: "refresh", "jwt"キーワードを追加; user.tsを除外

サイクル2:
  DISPATCH: 精緻化された条件で検索
  EVALUATE: session-manager.ts (0.95), jwt-utils.ts (0.85)を発見
  REFINE: 十分なcontext（高関連性ファイル2つ）

結果: auth.ts, tokens.ts, session-manager.ts, jwt-utils.ts
```

### 例2：機能実装

```
タスク: "APIエンドポイントにレート制限を追加"

サイクル1:
  DISPATCH: routes/**で"rate", "limit", "api"を検索
  EVALUATE: 一致なし - コードベースでは"throttle"という用語を使用
  REFINE: "throttle", "middleware"キーワードを追加

サイクル2:
  DISPATCH: 精緻化された条件で検索
  EVALUATE: throttle.ts (0.9), middleware/index.ts (0.7)を発見
  REFINE: ルーターパターンが必要

サイクル3:
  DISPATCH: "router", "express"パターンを検索
  EVALUATE: router-setup.ts (0.8)を発見
  REFINE: 十分なcontext

結果: throttle.ts, middleware/index.ts, router-setup.ts
```

## agentとの統合

agentプロンプトでの使用：

```markdown
このタスクのcontextを取得する際：
1. 広範なキーワード検索から開始
2. 各ファイルの関連性を評価（0-1スケール）
3. まだ不足しているcontextを特定
4. 検索条件を精緻化して繰り返し（最大3サイクル）
5. 関連性 >= 0.7のファイルを返す
```

## ベストプラクティス

1. **広く始めて、徐々に絞り込む** - 初期クエリを過度に指定しない
2. **コードベースの用語を学ぶ** - 最初のサイクルで命名規則が明らかになることが多い
3. **不足しているものを追跡する** - 明示的なギャップの特定が精緻化を促進
4. **「十分良い」で止める** - 3つの高関連性ファイルは10の平凡なファイルに勝る
5. **自信を持って除外する** - 低関連性ファイルは関連性が高くなることはない

## 関連

- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) - サブagentオーケストレーションセクション
- `continuous-learning` skill - 時間とともに改善されるパターン
- `~/.claude/agents/`のagent定義
