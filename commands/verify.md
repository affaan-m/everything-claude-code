# 検証 command

現在のコードベースの状態に対して包括的な検証を実行します。

## 手順

以下の順序で検証を実行します：

1. **ビルドチェック**
   - このプロジェクトのビルド command を実行
   - 失敗した場合、エラーを報告して停止

2. **型チェック**
   - TypeScript/型チェッカーを実行
   - すべてのエラーをファイル:行番号で報告

3. **リントチェック**
   - リンターを実行
   - 警告とエラーを報告

4. **テストスイート**
   - すべてのテストを実行
   - 成功/失敗の数を報告
   - カバレッジパーセンテージを報告

5. **console.log 監査**
   - ソースファイル内の console.log を検索
   - 場所を報告

6. **git ステータス**
   - commit されていない変更を表示
   - 最後の commit 以降に変更されたファイルを表示

## 出力

簡潔な検証レポートを生成：

```
VERIFICATION: [PASS/FAIL]

Build:    [OK/FAIL]
Types:    [OK/X errors]
Lint:     [OK/X issues]
Tests:    [X/Y passed, Z% coverage]
Secrets:  [OK/X found]
Logs:     [OK/X console.logs]

Ready for PR: [YES/NO]
```

重大な問題がある場合は、修正案とともにリスト化します。

## 引数

$ARGUMENTS には以下を指定できます：
- `quick` - ビルド + 型のみ
- `full` - すべてのチェック（デフォルト）
- `pre-commit` - commit に関連するチェック
- `pre-pr` - すべてのチェックに加えてセキュリティスキャン
