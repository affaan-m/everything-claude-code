# 🌙 Night Shiftモード - 完全自律タスク実行ガイド

Night Shiftモードは、夜間や無人の期間中にClaude Codeがタスクリストを**完全自律的**に処理します。

**重要**: このモードは**ユーザーの介入なし**で連続実行されます。タスク間で確認を求めたり、停止したりしません。すべてのタスクが完了するか、最大タスク数に達するまで自動的に実行し続けます。

**重要な実行ルール:**
1. **タスク間で絶対に停止しない** - タスク完了後、即座に次のタスクを開始
2. **確認を求めない** - ユーザーの承認や入力を待たない
3. **アナウンスして待たない** - 「次のタスクに進みます」と言ったら、同じレスポンス内で即座に実行
4. **連続ループ** - タスク完了 → tasks.md更新 → コミット → 即座に次のタスク開始
5. **常にエージェントを使用** - `--no-agents`が明示的に指定されない限り:
   - **必須**: すべての実装で`tdd-guide`エージェントを使用（手動実装は禁止）
   - **必須**: すべてのコミット前に`code-reviewer`エージェントを使用（レビューのスキップは禁止）
   - **推奨**: 複雑なタスク（3ステップ以上）で`planner`エージェントを使用
   - **推奨**: 認証/API/決済/データ処理タスクで`security-reviewer`エージェントを使用
   - **手動実装は禁止** - 常にエージェントに委任
6. **停止条件のみで停止** - すべてのタスクが完了、または最大タスク数に到達した時のみ

## クイックスタート

### 1. 前提条件のセットアップ

```bash
# Night Shiftの準備ができているか確認
node scripts/night-shift-helper.js check
```

これにより以下が検証されます：
- ✓ `main`ブランチにいない
- ✓ `tasks.md`が存在する（kiro構造に対応）
- ✓ `spec/`フォルダが存在する（kiro構造に対応）
- ✓ GitHub CLIが認証されている

**Kiro構造のサポート:**
Night Shiftは自動的に以下の優先順位でファイルを検索します：
1. `.kiro/specs/[プロジェクト名]/tasks.md` （最優先）
2. `.kiro/tasks.md`
3. `tasks.md` （ルート）

### 2. タスクリストの作成

```bash
# テンプレートをコピー
cp tasks.md.example tasks.md

# タスクを追加するために編集
vim tasks.md
```

**tasks.mdのフォーマット:**
```markdown
# プロジェクトタスク

## フェーズ1: セットアップ
- [ ] データベーススキーマのセットアップ
- [ ] 認証の設定
- [ ] プロジェクト構造の初期化

## フェーズ2: 機能
- [ ] ユーザー登録の実装
- [ ] ログインフローの追加
```

### 3. GitHub Issueの作成（オプションだが推奨）

```bash
# より良いコンテキストのためにIssueを作成
gh issue create --title "データベーススキーマのセットアップ" --body "PostgreSQLスキーマを作成..."
gh issue create --title "認証の設定" --body "JWT認証を追加..."
```

### 4. フィーチャーブランチの作成

```bash
# night-shiftブランチを作成
git checkout -b night-shift-$(date +%Y-%m-%d)
```

### 5. Night Shiftの実行

```bash
# Claude Codeを起動してNight Shiftコマンドを実行
claude

# Claude Code内で:
/night-shift
```

## 仕組み

### 実行フロー（完全自動）

```
┌─────────────────────┐
│  tasks.mdを読む     │
│  次のタスクを探す   │
└──────┬──────────────┘
       │
       v
┌─────────────────────┐
│  GitHub Issueマッチ │
│  コンテキスト収集   │
└──────┬──────────────┘
       │
       v
┌─────────────────────┐
│  TDDサイクル:       │
│  1. テストを書く    │
│  2. コードを書く    │
│  3. リファクタリング│
└──────┬──────────────┘
       │
       v
┌─────────────────────┐
│  テストはパス?      │
└──────┬──────────────┘
       │
       ├─ はい ──> 完了マーク、コミット、プッシュ
       │          │
       │          └──> 自動的に次のタスクへ（確認なし）
       │
       └─ いいえ ──> リトライ（最大3回）またはスキップ
                     │
                     └──> 自動的に次のタスクへ（確認なし）

⚠️ 重要: ループは自動的に継続します。ユーザーへの確認は一切ありません。

**実行パターン:**
```
タスク1完了 → コミット → tasks.md読む → タスク2開始（停止なし）
タスク2完了 → コミット → tasks.md読む → タスク3開始（停止なし）
タスク3完了 → コミット → tasks.md読む → タスク4開始（停止なし）
...すべてのタスクが完了するまで継続
```

**禁止事項:**
- ❌ 「次のタスクに進みます」と言って停止
- ❌ 「続けますか？」と質問
- ❌ タスク完了を報告して待機
- ✅ 正しい動作: タスク完了 → 次のタスクを即座に実行（同じレスポンス内）
```

### GitHub Issueへのタスクマッチング

Night Shiftはファジーマッチングを使用してタスクとIssueをリンクします：

```javascript
タスク:  "データベーススキーマのセットアップ"
Issue:   "#15 - Database Schema Setup"
マッチ:  85% 単語の重複
結果:    "Fixes #15"付きでコミット
```

### TDDサイクルの例

タスク: `- [ ] ユーザー登録の追加`

**1. テストを書く**
```javascript
// tests/auth.test.js
describe('User Registration', () => {
  it('新しいユーザーアカウントを作成する', async () => {
    const user = await register({ email: 'test@example.com', password: 'pass123' });
    expect(user.id).toBeDefined();
  });
});
```

**2. コードを書く**
```javascript
// src/auth.js
async function register({ email, password }) {
  // テストをパスするための最小実装
  const user = await db.users.create({ email, password });
  return user;
}
```

**3. リファクタリング**
```javascript
// src/auth.js - 改善版
async function register({ email, password }) {
  validateEmail(email);
  const hashedPassword = await hash(password);
  const user = await db.users.create({ email, password: hashedPassword });
  await sendWelcomeEmail(user.email);
  return user;
}
```

## 進捗の監視

### いつでもステータス確認

```bash
# 進捗レポートを表示
node scripts/night-shift-helper.js progress
```

出力:
```
🌙 Night Shift Progress Report
══════════════════════════════════════════════════
Total Tasks:     15
Completed:       8 ✓
Failed:          1 ✗
Remaining:       6
Progress:        53%
══════════════════════════════════════════════════

📋 Next Task: ユーザー登録の実装
🔗 Matched Issue: #23 - User Registration Flow
```

### Gitヒストリーを表示

```bash
# すべてのNight Shiftコミットを確認
git log --oneline --grep="feat(auto)"
```

### 現在のタスクを確認

```bash
# Night Shiftが実行中の場合、現在のタスクを確認
cat CURRENT_TASK.md
```

## コマンドオプション

### 基本的な使用方法
```bash
/night-shift
```

### ドライラン（プレビューのみ）
```bash
/night-shift --dry-run
```

### 制限付き実行
```bash
# 5タスクのみ完了して停止
/night-shift --max-tasks 5
```

### PR作成をスキップ
```bash
# 最後にPRを作成しない
/night-shift --skip-pr
```

### カスタムブランチ
```bash
/night-shift --branch feature/auto-implementation
```

### エージェント使用（推奨）
```bash
# すべてのエージェントを使用して最高品質
/night-shift --quality-mode thorough

# 高速モード - TDDのみ
/night-shift --quality-mode fast

# 標準モード - TDD + コードレビュー
/night-shift --quality-mode standard
```

### エージェントなし
```bash
# エージェントなしで手動実装
/night-shift --no-agents
```

## 完全自律実行モード

**デフォルト動作: ユーザー介入なしの完全自律実行**

Night Shiftは停止や確認なしで連続実行します：
- 未チェックタスクを順次処理
- 各完了後、自動的に次のタスクへ進む
- 停止条件: すべてのタスク完了、最大タスク数到達、回復不能エラーのみ
- タスク間でユーザーに確認を求めることは**絶対にありません**

## エージェント駆動モード（デフォルト）

**重要: `--no-agents`が明示的に指定されない限り、Night Shiftはエージェント駆動モードで動作**

### 標準品質モード（デフォルト）

すべてのタスクは以下の**必須**エージェントワークフローに従います：

1. **複雑なタスクの場合**（自動検出: 3ステップ以上、アーキテクチャ変更）：
   - `planner`エージェントを**必ず使用**
   - 詳細な実装計画を作成
   - 計画をCURRENT_TASK.mdに保存

2. **すべての実装タスク**（必須）：
   - `tdd-guide`エージェントを**必ず使用**
   - エージェントが完全なTDDサイクルを処理
   - 80%以上のテストカバレッジを保証
   - 手動実装は**禁止**

3. **すべてのコミット前**（必須）：
   - `code-reviewer`エージェントを**必ず使用**
   - すべての変更をレビュー
   - コード品質とベストプラクティスを保証

4. **機密タスクの場合**（自動検出: 認証、API、決済、データ処理）：
   - `security-reviewer`エージェントを**必ず使用**
   - セキュリティ脆弱性をチェック
   - 安全なコーディング慣行を検証

**これはオプションではありません。これがデフォルトかつ必須の動作です。**

**エージェントを無効化するには**: `--no-agents`フラグを使用（本番環境では非推奨）
**品質レベルを変更するには**: `--quality-mode`フラグを使用

### 実行制御オプション

```bash
# デフォルト: すべてのタスクを完了まで実行
/night-shift

# 特定数のタスクで停止
/night-shift --max-tasks 5

# インタラクティブモード（非推奨・夜間実行には不向き）
/night-shift --interactive
```

## 安全機能

### 1. ブランチ保護
- `main`または`master`ブランチでは実行**できない**
- 必要に応じて`night-shift-YYYY-MM-DD`ブランチを自動作成

### 2. テスト検証
- コミット前にすべてのテストがパス必須
- 失敗したテストでのコミットは不可
- テスト失敗はリトライロジックをトリガー

### 3. リトライロジック（自動継続）
```
試行1: 失敗 → エラー分析、修正、リトライ
試行2: 失敗 → 別のアプローチ、リトライ
試行3: 失敗 → タスクをスキップ、失敗マーク、自動的に次へ継続
```

**重要**: リトライ失敗後も停止せず、自動的に次のタスクへ進みます。

### 4. コンテキスト管理
- 5タスクごとに自動コンパクト化
- コンテキストオーバーフローを防ぐ
- 実行状態を維持

### 5. 失敗トラッキング
失敗したタスクは`tasks.md`にマークされます：
```markdown
- [ ] 複雑な機能を追加
<!-- FAILED: 依存関係が利用できません -->
```

## ファイル構造

### Kiro構造（推奨）
```
project/
├── .kiro/
│   └── specs/
│       └── [プロジェクト名]/
│           ├── tasks.md          # タスクチェックリスト（権限元）
│           ├── database.md       # DB仕様書
│           ├── api.md            # API仕様書
│           └── frontend.md       # UI仕様書
├── tasks.md.example              # テンプレート
├── CURRENT_TASK.md               # 一時ファイル（自動作成/削除）
├── commands/
│   └── night-shift.md            # コマンドドキュメント
└── scripts/
    └── night-shift-helper.js     # ヘルパーユーティリティ
```

### 標準構造（フォールバック）
```
project/
├── tasks.md                    # タスクチェックリスト（あなたが管理）
├── tasks.md.example            # テンプレート
├── spec/                       # 仕様書（NIGHT SHIFTが読む）
│   ├── database.md
│   ├── api.md
│   └── frontend.md
├── CURRENT_TASK.md             # 一時ファイル（自動作成/削除）
├── commands/
│   └── night-shift.md          # コマンドドキュメント
└── scripts/
    └── night-shift-helper.js   # ヘルパーユーティリティ
```

**自動検出の優先順位:**
1. `.kiro/specs/[プロジェクト]/tasks.md` （kiro構造）
2. `.kiro/tasks.md`
3. `tasks.md` （ルート）

## ベストプラクティス

### 実行前

**⚠️ 重要: Night Shiftは完全自律モードで実行されます**
- 一度開始すると、すべてのタスクが完了するまで自動実行されます
- 途中で介入が必要な場合は、`--max-tasks`で段階的に実行してください
- 長時間の無人実行には、十分なテストとレビューを事前に行ってください

1. **タスクを論理的に順序付け**
   - 依存関係を先に
   - 独立したタスクは任意の順序
   - 複雑なタスクはシンプルなタスクの後
   - 段階的に実行したい場合はフェーズに分割

2. **良い仕様書を作成**
   ```
   spec/
   ├── database-schema.md      # DBタスクがこれを参照
   ├── api-endpoints.md        # APIタスクがこれを参照
   └── ui-components.md        # UIタスクがこれを参照
   ```

3. **GitHub Issueをリンク**
   - より多くのコンテキスト = より良い実装
   - Issueは要件と受け入れ基準を提供

4. **保留中の作業をコミット**
   ```bash
   git add .
   git commit -m "Night Shift前に作業を保存"
   ```

### 実行中

1. **定期的に監視**
   ```bash
   # 1時間ごとに進捗を確認
   node scripts/night-shift-helper.js progress
   ```

2. **失敗を確認**
   ```bash
   # FAILEDコメントのためにtasks.mdを表示
   grep -n "FAILED" tasks.md
   ```

3. **コミットをレビュー**
   ```bash
   # 品質が維持されていることを確認
   git log --oneline -10
   ```

### 完了後

1. **PRをレビュー**
   - すべての変更が意味をなすか確認
   - テストカバレッジを確認
   - セキュリティ問題がないことを確認

2. **完全なテストスイートを実行**
   ```bash
   npm test
   npm run test:integration
   npm run test:e2e
   ```

3. **手動テスト**
   - 重要なパスをテスト
   - UI/UXを確認
   - エッジケースをチェック

## エージェントとの統合

Night Shiftは専門エージェントに委任してより高品質な実装が可能です：

### 計画エージェント
- **planner** - 複雑なタスクの詳細な実装計画を作成
  - 使用タイミング: 新機能、アーキテクチャ変更、複雑なリファクタリング
  - 出力: ステップバイステップの実装計画

### 実装エージェント
- **tdd-guide** - テスト駆動開発スペシャリスト（推奨）
  - 使用タイミング: すべての実装タスク
  - 保証: 80%以上のテストカバレッジ、Red-Green-Refactorサイクル
  - 出力: テスト + 実装 + パスするテスト

### 品質保証エージェント
- **code-reviewer** - コード品質とベストプラクティス
  - 使用タイミング: コミット前のすべてのタスク
  - チェック: パターン、エッジケース、保守性
  - 出力: レビューフィードバック + 修正

- **security-reviewer** - セキュリティ脆弱性検出
  - 使用タイミング: 認証、支払い、データ処理、APIエンドポイント
  - チェック: SQLインジェクション、XSS、CSRF、認証問題
  - 出力: セキュリティレポート + 修正

### サポートエージェント
- **build-error-resolver** - ビルドとテストの失敗を修正
  - 使用タイミング: テスト失敗やビルドが壊れた時
  - 修正: コンパイルエラー、テスト失敗、依存関係
  - 出力: 修正されたコード

- **doc-updater** - ドキュメント更新
  - 使用タイミング: 実装後
  - 更新: README、APIドキュメント、インラインコメント
  - 出力: 更新されたドキュメント

## エージェントワークフローの例

```
タスク: "ユーザー認証の追加"

1. 計画（必須 - 複雑なタスク検出）
   ✓ plannerエージェントに必ず委任
   → エージェントがタスクの複雑さを分析
   → エージェントが詳細な実装計画を作成
   → 計画をCURRENT_TASK.mdに保存
   ❌ スキップ禁止 - タスクが複雑

2. 実装（必須 - すべてのタスク）
   ✓ tdd-guideエージェントに必ず委任
   → エージェントがテストを先に書く（RED）
   → エージェントが機能を実装（GREEN）
   → エージェントがコードをリファクタリング（REFACTOR）
   → すべてのテストがパス ✓（80%以上のカバレッジ）
   ❌ 手動実装禁止

3. コードレビュー（必須 - コミット前）
   ✓ code-reviewerエージェントに必ず委任
   → エージェントがすべての変更をレビュー
   → エージェントが改善を提案
   → 修正を適用
   → 必要に応じて再レビュー
   ❌ レビューのスキップ禁止

4. セキュリティレビュー（必須 - 認証タスク検出）
   ✓ security-reviewerエージェントに必ず委任
   → エージェントが認証コードを検出
   → エージェントがパスワードハッシュ、セッション管理を検証
   → エージェントが認証の脆弱性をチェック
   → セキュリティ ✓
   ❌ スキップ禁止 - これは認証コード

5. コミット
   → すべての必須チェックがパス ✓
   → すべてのエージェントが承認 ✓
   → "feat(auto): ユーザー認証の追加 (Fixes #42)" でコミット
   → リモートにプッシュ
```

**エージェント使用の要約:**
- ✓ planner: 使用（複雑なタスク）
- ✓ tdd-guide: 使用（必須）
- ✓ code-reviewer: 使用（必須）
- ✓ security-reviewer: 使用（認証タスク検出）
- ✅ 結果: 高品質、テスト済み、レビュー済み、安全な実装

## 品質モード

Night Shiftは3つの品質モードを提供：

### Fast モード
```bash
/night-shift --quality-mode fast
```
- tdd-guideエージェントのみ使用
- 最速の実装
- 基本的なテストカバレッジ

### Standard モード（デフォルト）
```bash
/night-shift --quality-mode standard
```
- tdd-guide + code-reviewerエージェント
- バランスの取れた品質と速度
- 推奨される設定

### Thorough モード
```bash
/night-shift --quality-mode thorough
```
- planner + tdd-guide + code-reviewer + security-reviewerエージェント
- 最高品質の実装
- 重要な機能に推奨

## 他のコマンドとの統合

Night Shiftは実行中に他のコマンドを活用できます：

### `/tdd` - TDDサイクル
```
Night Shiftは実装のために/tddに委任:
- テストを書く
- コードを書く
- リファクタリング
```

### `/compact` - コンテキスト管理
```
5タスクごとに自動実行してコンテキスト管理:
- 完了した作業を要約
- タスク状態を保持
- トークン使用量を削減
```

### `/verify` - 検証
```
コミット前に実装を検証:
- テストスイートを実行
- コード品質をチェック
- 要件が満たされているか確認
```

### `/checkpoint` - 状態保存
```
定期的に進捗を保存:
- 3タスクごと
- リスクの高い操作の前
- 失敗回復時
```

## トラブルシューティング

### 問題: ブランチ保護エラー
```
❌ Error: main/masterブランチではNight Shiftを実行できません
```

**解決策:**
```bash
git checkout -b night-shift-$(date +%Y-%m-%d)
```

### 問題: tasks.mdが見つからない
```
❌ Error: tasks.md not found
```

**解決策:**
```bash
cp tasks.md.example tasks.md
# tasks.mdをあなたのタスクで編集
```

### 問題: GitHub CLIが認証されていない
```
❌ Error fetching GitHub issues
```

**解決策:**
```bash
gh auth login
```

### 問題: テストが継続的に失敗
```
試行3: 失敗 → タスクがスキップされました
```

**何が起きたか:**
- タスクが自律実行には複雑すぎた
- 依存関係が欠落
- 仕様が不明確

**解決策:**
1. FAILEDコメントのために`tasks.md`を確認
2. 失敗理由をレビュー
3. 手動で実装するか仕様を改善
4. 再試行するためにFAILEDコメントを削除

### 問題: タスク間で停止してしまう
```
完了: 5/10タスク
次のタスクに自動的に進みます...
（停止）
```

**原因:**
Night Shiftモードが正しく認識されていない、または実行ルールが守られていない

**解決策:**
1. **コマンド定義を確認**
   ```bash
   cat ~/.claude/commands/night-shift.md | grep "CRITICAL"
   ```
   「CRITICAL AUTONOMOUS EXECUTION RULES」が表示されるか確認

2. **シンボリックリンクを確認**
   ```bash
   ls -la ~/.claude/commands/night-shift.md
   ```
   リポジトリへのリンクになっているか確認

3. **最新版に更新**
   ```bash
   cd ~/everything-claude-code
   git pull origin main
   ```

4. **Claude Codeを再起動**して`/night-shift`を再実行

5. **明示的な指示を追加**
   タスク完了後、「次のタスクを**今すぐ**開始してください。停止しないでください」と明示的に指示

### 問題: コンテキストオーバーフロー
```
⚠️  Context > 180K tokens
```

**解決策:**
- Night Shiftは5タスクごとに自動的に`/compact`を実行
- 必要に応じて手動で`/compact`を実行
- タスクの複雑さを軽減

## 中断からの回復

Night Shiftが中断された場合（クラッシュ、ネットワーク問題など）：

### 1. 状態を確認
```bash
# 最後のタスクは何だったか?
cat CURRENT_TASK.md  # 存在する場合

# 何が完了したか?
node scripts/night-shift-helper.js progress
```

### 2. Gitヒストリーをレビュー
```bash
# 最後のコミットを確認
git log -1

# すべてのNight Shiftコミットを確認
git log --grep="feat(auto)" --oneline
```

### 3. 再開
```bash
# Night Shiftは自動的に次の未チェックタスクを選択
/night-shift
```

システムは**冪等**です - いつでも安全に再開できます。

## 高度な使用法

### カスタムワークフロー

特定のプロジェクトニーズに合わせたカスタムNight Shiftワークフローを作成：

```markdown
# フェーズ付きtasks.md

## フェーズ1: 基盤（Night Shift実行1）
- [ ] データベースのセットアップ
- [ ] 認証の設定

## フェーズ2: 機能（Night Shift実行2）
- [ ] ユーザー登録
- [ ] ユーザーログイン

## フェーズ3: テスト（Night Shift実行3）
- [ ] 統合テスト
- [ ] E2Eテスト
```

各フェーズを個別に実行:
```bash
# フェーズ1
/night-shift --max-tasks 2

# レビュー後、フェーズ2
/night-shift --max-tasks 2

# レビュー後、フェーズ3
/night-shift
```

### 並列Night Shift

大規模プロジェクトの場合、git worktreeを使用して複数のNight Shiftを並列実行：

```bash
# メインworktree: データベースタスク
cd main-worktree
git checkout -b night-shift-db
# tasks.mdをDBタスクのみに編集
/night-shift

# 並列worktree: APIタスク
git worktree add ../api-worktree
cd ../api-worktree
git checkout -b night-shift-api
# tasks.mdをAPIタスクのみに編集
/night-shift
```

### CI/CDとの統合

CIパイプラインにNight Shiftを追加：

```yaml
# .github/workflows/night-shift.yml
name: Night Shift

on:
  schedule:
    - cron: '0 2 * * *'  # 毎日午前2時
  workflow_dispatch:

jobs:
  night-shift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Node.jsのセットアップ
        uses: actions/setup-node@v3
      - name: 前提条件の確認
        run: node scripts/night-shift-helper.js check
      - name: ブランチの作成
        run: git checkout -b night-shift-$(date +%Y-%m-%d)
      - name: Night Shiftの実行
        run: claude -p "/night-shift --max-tasks 10"
      - name: 進捗レポート
        run: node scripts/night-shift-helper.js progress
```

## 例

### 例1: フルスタック機能

**tasks.md:**
```markdown
# ユーザープロフィール機能の追加

- [ ] ユーザープロフィールデータベーステーブルの作成
- [ ] プロフィールAPIエンドポイントの追加
- [ ] プロフィール更新ロジックの実装
- [ ] プロフィールUIコンポーネントの作成
- [ ] プロフィールテストの追加
- [ ] APIドキュメントの更新
```

**GitHub Issues:**
```bash
gh issue create --title "User Profile Database" --body "users_profileテーブルをフィールド付きで作成..."
gh issue create --title "Profile API Endpoints" --body "POST /api/profile, GET /api/profile/:id..."
# ... その他のIssue
```

**Night Shift実行:**
```
✓ タスク1: ユーザープロフィールデータベーステーブルの作成 → コミット: feat(auto): ユーザープロフィールデータベーステーブルの作成 (Fixes #45)
✓ タスク2: プロフィールAPIエンドポイントの追加 → コミット: feat(auto): プロフィールAPIエンドポイントの追加 (Fixes #46)
✓ タスク3: プロフィール更新ロジックの実装 → コミット: feat(auto): プロフィール更新ロジックの実装 (Fixes #47)
✓ タスク4: プロフィールUIコンポーネントの作成 → コミット: feat(auto): プロフィールUIコンポーネントの作成 (Fixes #48)
✓ タスク5: プロフィールテストの追加 → コミット: feat(auto): プロフィールテストの追加 (Fixes #49)
✓ タスク6: APIドキュメントの更新 → コミット: feat(auto): APIドキュメントの更新 (Fixes #50)

PR作成: "Night Shift Report: 2026-01-24"
```

### 例2: バグ修正スプリント

**tasks.md:**
```markdown
# バグ修正 - スプリント15

- [ ] ログインリダイレクトループの修正
- [ ] ダッシュボードのメモリリーク解決
- [ ] APIレート制限の修正
- [ ] タイムゾーン表示バグの修正
```

Night Shiftは各バグをTDDアプローチで処理し、リグレッションがないことを保証。

## FAQ

**Q: タスク完了後に確認を求めずに次のタスクへ進みますか？**
A: **はい、自動的に進みます**。Night Shiftはデフォルトで完全自律モードです。タスク間で確認を求めたり停止したりすることは一切ありません。すべてのタスクが完了するまで、または`--max-tasks`で指定した数に達するまで連続実行します。

**Q: 「次のタスクに進みます」と表示されて停止してしまいます**
A: これはバグです。正しい動作では、「次のタスクに進みます」と表示した後、**同じレスポンス内で即座に次のタスクを開始**する必要があります。停止した場合は、Night Shiftコマンドの定義が正しく読み込まれていない可能性があります。以下を確認してください：
   - コマンドファイルが最新版か確認: `cat ~/.claude/commands/night-shift.md | head -30`
   - シンボリックリンクが正しいか確認: `ls -la ~/.claude/commands/`
   - Claude Codeを再起動して再度`/night-shift`を実行

**Q: エージェントを使わずに手動で実装することはありますか？**
A: **いいえ、ありません**。Night Shiftのデフォルト動作では、**すべての実装でtdd-guideエージェントを使用**し、**すべてのコミット前にcode-reviewerエージェントを使用**します。手動実装は禁止されています。エージェントを無効化するには`--no-agents`フラグが必要ですが、これは本番環境では強く非推奨です。

**Q: エージェントが使われていないことに気づいたらどうすればいいですか？**
A: これは重大なバグです。以下を確認してください：
   1. コマンド定義を確認: `cat ~/.claude/commands/night-shift.md | grep "ALWAYS USE AGENTS"`
   2. 「CRITICAL AUTONOMOUS EXECUTION RULES」に「ALWAYS USE AGENTS」が含まれているか確認
   3. Claude Codeを再起動して再度`/night-shift`を実行
   4. それでもエージェントが使われない場合は、明示的に「tdd-guideエージェントに委任してください」と指示

**Q: 途中で停止させたい場合は？**
A: `--max-tasks N`オプションを使用してください。例：`/night-shift --max-tasks 3`で3タスクのみ実行して停止します。

**Q: Night Shiftは複雑なアーキテクチャ決定を処理できますか？**
A: Night Shiftは明確に定義されたタスクで最もよく機能します。複雑な決定については、次のいずれか：
- より小さく、明確に仕様化されたタスクに分割
- マルチエージェント計画に`/orchestrate`を使用
- 手動で処理し、Night Shift用に複雑なAI作業を保存

**Q: テストが失敗したらどうなりますか？**
A: Night Shiftは異なるアプローチで最大3回リトライします。それでも失敗する場合は、タスクをスキップし、手動レビューのためにtasks.mdでFAILEDとマークします。

**Q: Night Shiftを複数回実行できますか？**
A: はい！冪等です。常に次の未チェックタスクを選択するため、必要なだけ何度でも実行できます。

**Q: マージ競合はどう処理しますか？**
A: Night Shiftは専用ブランチで動作します。実行前に：
```bash
git fetch upstream
git merge upstream/main
# 競合を解決
# その後Night Shiftを実行
```

**Q: コミットメッセージフォーマットをカスタマイズできますか？**
A: 現在、Night Shiftは`feat(auto): <タスク名> (Fixes #<ISSUE>)`というフォーマットを使用します。これはNight Shiftコマンドの実装を編集することでカスタマイズできます。

**Q: コミット前にコードをレビューしたい場合は？**
A: `--dry-run`モードを使用して何が行われるかを確認するか、`--max-tasks 1`を使用して一度に1つのタスクを実行し、それぞれの間に手動レビューを行います。

## 貢献

Night ShiftはEverything Claude Codeコレクションの一部です。改善を歓迎します！

## ライセンス

MITライセンス - 詳細はLICENSEファイルを参照してください。

---

**Happy Night Shifting! 🌙**
