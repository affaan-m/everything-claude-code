# Gitワークフロー

## コミットメッセージのフォーマット

```
<type>: <description>

<optional body>
```

種類: feat, fix, refactor, docs, test, chore, perf, ci

注意: 帰属表示は ~/.claude/settings.json でグローバルに無効化されています。

## プルリクエストワークフロー

PR作成時:
1. コミット履歴全体を分析（最新コミットだけでなく）
2. `git diff [base-branch]...HEAD` ですべての変更を確認
3. 包括的なPRサマリーを作成
4. TODOを含むテスト計画を記載
5. 新しいブランチの場合は `-u` フラグでプッシュ

## 機能実装ワークフロー

1. **まず計画**
   - **planner** エージェントで実装計画を作成
   - 依存関係とリスクを特定
   - フェーズに分割

2. **TDDアプローチ**
   - **tdd-guide** エージェントを使用
   - まずテストを書く（RED）
   - テストが通るように実装（GREEN）
   - リファクタリング（IMPROVE）
   - カバレッジ80%以上を確認

3. **コードレビュー**
   - コードを書いた直後に **code-reviewer** エージェントを使用
   - CRITICALおよびHIGHの問題に対処
   - 可能であればMEDIUMの問題も修正

4. **コミット＆プッシュ**
   - 詳細なコミットメッセージを記述
   - Conventional Commitsフォーマットに従う
