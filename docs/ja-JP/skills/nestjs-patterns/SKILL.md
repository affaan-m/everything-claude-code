---
name: nestjs-patterns
description: モジュール、コントローラー、プロバイダー、DTO バリデーション、ガード、インターセプター、設定、プロダクショングレードの TypeScript バックエンド向け NestJS アーキテクチャパターン。
origin: ECC
---

# NestJS 開発パターン

モジュラーな TypeScript バックエンド向けのプロダクショングレード NestJS パターン。

## 起動タイミング

- NestJS API またはサービスの構築
- モジュール、コントローラー、プロバイダーの構造化
- DTO バリデーション、ガード、インターセプター、例外フィルターの追加
- 環境対応の設定とデータベース統合の構成
- NestJS のユニットや HTTP エンドポイントのテスト

## プロジェクト構造

```text
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/
│   ├── configuration.ts
│   └── validation.ts
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   ├── guards/
│   │   └── strategies/
│   └── users/
│       ├── dto/
│       ├── entities/
│       ├── users.controller.ts
│       ├── users.module.ts
│       └── users.service.ts
└── prisma/ または database/
```

- ドメインコードは機能モジュール内に保つ。
- 横断的なフィルター、デコレーター、ガード、インターセプターは `common/` に配置。
- DTO は所有するモジュールの近くに保つ。

## ブートストラップとグローバルバリデーション

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

- 公開 API では常に `whitelist` と `forbidNonWhitelisted` を有効化。
- ルートごとにバリデーション設定を繰り返さず、1 つのグローバルバリデーションパイプを優先。

## モジュール、コントローラー、プロバイダー

```ts
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getById(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) {}

  async create(dto: CreateUserDto) {
    return this.usersRepo.create(dto);
  }
}
```

- コントローラーは薄く保つ：HTTP 入力をパース、プロバイダーを呼び出し、レスポンス DTO を返す。
- ビジネスロジックはコントローラーではなくインジェクタブルサービスに置く。
- 他のモジュールが本当に必要とするプロバイダーのみをエクスポート。

## DTO とバリデーション

```ts
export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(2, 80)
  name!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
```

- 全てのリクエスト DTO を `class-validator` で検証。
- ORM エンティティを直接返すのではなく、専用のレスポンス DTO またはシリアライザーを使う。
- パスワードハッシュ、トークン、監査カラムなどの内部フィールドを漏らさない。

## 認証、ガード、リクエストコンテキスト

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('admin/report')
getAdminReport(@Req() req: AuthenticatedRequest) {
  return this.reportService.getForUser(req.user.id);
}
```

- 認証ストラテジーとガードは、真に共有されている場合を除きモジュールローカルに保つ。
- 粗いアクセスルールはガードにエンコードし、リソース固有の認可はサービスで実施。
- 認証済みリクエストオブジェクトには明示的なリクエスト型を優先。

## 例外フィルターとエラー形状

```ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();

    if (exception instanceof HttpException) {
      return response.status(exception.getStatus()).json({
        path: request.url,
        error: exception.getResponse(),
      });
    }

    return response.status(500).json({
      path: request.url,
      error: 'Internal server error',
    });
  }
}
```

- API 全体で一貫した 1 つのエラーエンベロープを保つ。
- 予期されるクライアントエラーにはフレームワーク例外をスロー、予期しない失敗はログして中央でラップ。

## 設定と環境バリデーション

```ts
ConfigModule.forRoot({
  isGlobal: true,
  load: [configuration],
  validate: validateEnv,
});
```

- 最初のリクエストで遅延ではなく、ブート時に env を検証。
- 設定アクセスを型付きヘルパーや設定サービスの裏に保つ。
- 機能コード全体で分岐するのではなく、設定ファクトリーで dev/staging/prod の関心事を分ける。

## 永続化とトランザクション

- リポジトリ / ORM コードをドメイン言語を話すプロバイダーの裏に保つ。
- Prisma または TypeORM については、作業単位を所有するサービスでトランザクショナルワークフローを分離。
- コントローラーに多段書き込みを直接調整させない。

## テスト

```ts
describe('UsersController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });
});
```

- 依存をモックしてプロバイダーを分離してユニットテスト。
- ガード、バリデーションパイプ、例外フィルターにリクエストレベルのテストを追加。
- 本番で使用するのと同じグローバルパイプ/フィルターをテストでも再利用。

## プロダクションデフォルト

- 構造化ログとリクエスト相関 ID を有効化。
- 部分起動するのではなく、不正な env/config で終了。
- DB/キャッシュクライアントには明示的なヘルスチェック付きの非同期プロバイダー初期化を優先。
- バックグラウンドジョブとイベントコンシューマーは HTTP コントローラー内ではなく独自のモジュールに保つ。
- 公開エンドポイントではレート制限、認証、監査ログを明示的に。
