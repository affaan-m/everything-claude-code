| name | description |
|------|-------------|
| cloud-infrastructure-security | クラウドプラットフォームへのデプロイ、インフラ設定、IAMポリシー管理、ロギング/モニタリングの設定、CI/CDパイプラインの実装時に使用するスキルです。ベストプラクティスに沿ったクラウドセキュリティチェックリストを提供します。 |

# クラウド＆インフラセキュリティ Skill

この skill は、クラウドインフラ、CI/CDパイプライン、デプロイ設定がセキュリティのベストプラクティスに従い、業界標準に準拠することを保証します。

## 有効化のタイミング

- クラウドプラットフォーム（AWS、Vercel、Railway、Cloudflare）へのアプリケーションデプロイ時
- IAMロールと権限の設定時
- CI/CDパイプラインの設定時
- Infrastructure as Code（Terraform、CloudFormation）の実装時
- ロギングとモニタリングの設定時
- クラウド環境でのシークレット管理時
- CDNとエッジセキュリティの設定時
- 災害復旧とバックアップ戦略の実装時

## クラウドセキュリティチェックリスト

### 1. IAM＆アクセス制御

#### 最小権限の原則

```yaml
# 正しい例: 最小限の権限
iam_role:
  permissions:
    - s3:GetObject  # 読み取りアクセスのみ
    - s3:ListBucket
  resources:
    - arn:aws:s3:::my-bucket/*  # 特定のバケットのみ

# 間違った例: 過度に広い権限
iam_role:
  permissions:
    - s3:*  # 全てのS3アクション
  resources:
    - "*"  # 全てのリソース
```

#### 多要素認証（MFA）

```bash
# root/管理者アカウントには必ずMFAを有効化
aws iam enable-mfa-device \
  --user-name admin \
  --serial-number arn:aws:iam::123456789:mfa/admin \
  --authentication-code1 123456 \
  --authentication-code2 789012
```

#### 検証手順

- [ ] 本番環境でrootアカウントを使用していない
- [ ] 全ての特権アカウントでMFAが有効
- [ ] サービスアカウントは長期認証情報ではなくロールを使用
- [ ] IAMポリシーが最小権限に従っている
- [ ] 定期的なアクセスレビューを実施
- [ ] 未使用の認証情報をローテーションまたは削除

### 2. シークレット管理

#### クラウドシークレットマネージャー

```typescript
// 正しい例: クラウドシークレットマネージャーを使用
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManager({ region: 'us-east-1' });
const secret = await client.getSecretValue({ SecretId: 'prod/api-key' });
const apiKey = JSON.parse(secret.SecretString).key;

// 間違った例: ハードコードまたは環境変数のみ
const apiKey = process.env.API_KEY; // ローテーションなし、監査なし
```

#### シークレットのローテーション

```bash
# データベース認証情報の自動ローテーションを設定
aws secretsmanager rotate-secret \
  --secret-id prod/db-password \
  --rotation-lambda-arn arn:aws:lambda:region:account:function:rotate \
  --rotation-rules AutomaticallyAfterDays=30
```

#### 検証手順

- [ ] 全てのシークレットがクラウドシークレットマネージャー（AWS Secrets Manager、Vercel Secrets）に保存
- [ ] データベース認証情報の自動ローテーションが有効
- [ ] APIキーを少なくとも四半期ごとにローテーション
- [ ] コード、ログ、エラーメッセージにシークレットが含まれていない
- [ ] シークレットアクセスの監査ログが有効

### 3. ネットワークセキュリティ

#### VPCとファイアウォール設定

```terraform
# 正しい例: 制限されたセキュリティグループ
resource "aws_security_group" "app" {
  name = "app-sg"

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]  # 内部VPCのみ
  }

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # HTTPSアウトバウンドのみ
  }
}

# 間違った例: インターネットに開放
resource "aws_security_group" "bad" {
  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # 全ポート、全IP！
  }
}
```

#### 検証手順

- [ ] データベースが公開アクセス可能でない
- [ ] SSH/RDPポートがVPN/踏み台のみに制限
- [ ] セキュリティグループが最小権限に従っている
- [ ] ネットワークACLが設定済み
- [ ] VPCフローログが有効

### 4. ロギング＆モニタリング

#### CloudWatch/ロギング設定

```typescript
// 正しい例: 包括的なロギング
import { CloudWatchLogsClient, CreateLogStreamCommand } from '@aws-sdk/client-cloudwatch-logs';

const logSecurityEvent = async (event: SecurityEvent) => {
  await cloudwatch.putLogEvents({
    logGroupName: '/aws/security/events',
    logStreamName: 'authentication',
    logEvents: [{
      timestamp: Date.now(),
      message: JSON.stringify({
        type: event.type,
        userId: event.userId,
        ip: event.ip,
        result: event.result,
        // 機密データは絶対にログに出力しない
      })
    }]
  });
};
```

#### 検証手順

- [ ] 全てのサービスでCloudWatch/ロギングが有効
- [ ] 認証失敗の試行がログに記録
- [ ] 管理者アクションが監査される
- [ ] ログ保持期間が設定済み（コンプライアンスのため90日以上）
- [ ] 不審なアクティビティに対するアラートが設定済み
- [ ] ログが一元化され改ざん防止されている

### 5. CI/CDパイプラインセキュリティ

#### セキュアなパイプライン設定

```yaml
# 正しい例: セキュアなGitHub Actionsワークフロー
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read  # 最小限の権限

    steps:
      - uses: actions/checkout@v4

      # シークレットのスキャン
      - name: Secret scanning
        uses: trufflesecurity/trufflehog@main

      # 依存関係の監査
      - name: Audit dependencies
        run: npm audit --audit-level=high

      # 長期トークンではなくOIDCを使用
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/GitHubActionsRole
          aws-region: us-east-1
```

#### サプライチェーンセキュリティ

```json
// package.json - ロックファイルと整合性チェックを使用
{
  "scripts": {
    "install": "npm ci",  // 再現可能なビルドのためciを使用
    "audit": "npm audit --audit-level=moderate",
    "check": "npm outdated"
  }
}
```

#### 検証手順

- [ ] 長期認証情報の代わりにOIDCを使用
- [ ] パイプラインでシークレットスキャンを実施
- [ ] 依存関係の脆弱性スキャンを実施
- [ ] コンテナイメージのスキャン（該当する場合）
- [ ] ブランチ保護ルールが適用済み
- [ ] マージ前にコードレビューが必須
- [ ] 署名付き commit が適用済み

### 6. Cloudflare＆CDNセキュリティ

#### Cloudflareセキュリティ設定

```typescript
// 正しい例: セキュリティヘッダー付きCloudflare Workers
export default {
  async fetch(request: Request): Promise<Response> {
    const response = await fetch(request);

    // セキュリティヘッダーを追加
    const headers = new Headers(response.headers);
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    headers.set('Permissions-Policy', 'geolocation=(), microphone=()');

    return new Response(response.body, {
      status: response.status,
      headers
    });
  }
};
```

#### WAFルール

```bash
# Cloudflare WAFマネージドルールを有効化
# - OWASP Core Ruleset
# - Cloudflare Managed Ruleset
# - レート制限ルール
# - ボット保護
```

#### 検証手順

- [ ] OWASPルール付きWAFが有効
- [ ] レート制限が設定済み
- [ ] ボット保護がアクティブ
- [ ] DDoS保護が有効
- [ ] セキュリティヘッダーが設定済み
- [ ] SSL/TLSストリクトモードが有効

### 7. バックアップ＆災害復旧

#### 自動バックアップ

```terraform
# 正しい例: RDS自動バックアップ
resource "aws_db_instance" "main" {
  allocated_storage     = 20
  engine               = "postgres"

  backup_retention_period = 30  # 30日間保持
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  enabled_cloudwatch_logs_exports = ["postgresql"]

  deletion_protection = true  # 誤削除を防止
}
```

#### 検証手順

- [ ] 毎日の自動バックアップが設定済み
- [ ] バックアップ保持期間がコンプライアンス要件を満たしている
- [ ] ポイントインタイムリカバリが有効
- [ ] 四半期ごとにバックアップテストを実施
- [ ] 災害復旧計画が文書化済み
- [ ] RPOとRTOが定義されテスト済み

## 本番デプロイ前クラウドセキュリティチェックリスト

本番クラウドデプロイの前に必ず確認：

- [ ] **IAM**: rootアカウント未使用、MFA有効、最小権限ポリシー
- [ ] **シークレット**: 全てのシークレットがクラウドシークレットマネージャーにありローテーション済み
- [ ] **ネットワーク**: セキュリティグループが制限済み、パブリックデータベースなし
- [ ] **ロギング**: CloudWatch/ロギングが保持期間設定と共に有効
- [ ] **モニタリング**: 異常に対するアラートが設定済み
- [ ] **CI/CD**: OIDC認証、シークレットスキャン、依存関係監査
- [ ] **CDN/WAF**: OWASPルール付きCloudflare WAFが有効
- [ ] **暗号化**: 保存時と転送時のデータが暗号化済み
- [ ] **バックアップ**: テスト済みリカバリ付き自動バックアップ
- [ ] **コンプライアンス**: GDPR/HIPAA要件を満たしている（該当する場合）
- [ ] **ドキュメント**: インフラが文書化され、ランブックが作成済み
- [ ] **インシデント対応**: セキュリティインシデント計画が策定済み

## よくあるクラウドセキュリティの設定ミス

### S3バケットの露出

```bash
# 間違った例: パブリックバケット
aws s3api put-bucket-acl --bucket my-bucket --acl public-read

# 正しい例: 特定のアクセスを持つプライベートバケット
aws s3api put-bucket-acl --bucket my-bucket --acl private
aws s3api put-bucket-policy --bucket my-bucket --policy file://policy.json
```

### RDSパブリックアクセス

```terraform
# 間違った例
resource "aws_db_instance" "bad" {
  publicly_accessible = true  # 絶対にこうしない！
}

# 正しい例
resource "aws_db_instance" "good" {
  publicly_accessible = false
  vpc_security_group_ids = [aws_security_group.db.id]
}
```

## リソース

- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [CIS AWS Foundations Benchmark](https://www.cisecurity.org/benchmark/amazon_web_services)
- [Cloudflare Security Documentation](https://developers.cloudflare.com/security/)
- [OWASP Cloud Security](https://owasp.org/www-project-cloud-security/)
- [Terraform Security Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/)

**重要**: クラウドの設定ミスはデータ侵害の主要な原因です。1つの公開されたS3バケットや過度に許可されたIAMポリシーがインフラ全体を危険にさらす可能性があります。常に最小権限の原則と多層防御に従ってください。
