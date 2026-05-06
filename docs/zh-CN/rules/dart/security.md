---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
  - "**/AndroidManifest.xml"
  - "**/Info.plist"
---

# Dart/Flutter 安全

> 本文档在 [common/security.md](../common/security.md) 基础上扩展了 Dart、Flutter 及移动端特定内容。

## 密钥管理

* 切勿在 Dart 源码中硬编码 API 密钥、令牌或凭据
* 使用 `--dart-define` 或 `--dart-define-from-file` 进行编译时配置（值并非真正保密——服务端密钥应通过后端代理获取）
* 使用 `flutter_dotenv` 或等效方案，并将 `.env` 文件列入 `.gitignore`
* 将运行时密钥存储在平台安全存储中：`flutter_secure_storage`（iOS 使用 Keychain，Android 使用 EncryptedSharedPreferences）

```dart
// BAD
const apiKey = 'sk-abc123...';

// GOOD — compile-time config (not secret, just configurable)
const apiKey = String.fromEnvironment('API_KEY');

// GOOD — runtime secret from secure storage
final token = await secureStorage.read(key: 'auth_token');
```

## 网络安全

* 强制使用 HTTPS——生产环境中禁止 `http://` 调用
* 配置 Android `network_security_config.xml` 以阻止明文流量
* 在 `NSAppTransportSecurity` 中设置 `Info.plist` 禁止任意网络请求
* 为所有 HTTP 客户端设置请求超时——切勿使用默认值
* 对高安全等级端点考虑证书绑定

```dart
// Dio with timeout and HTTPS enforcement
final dio = Dio(BaseOptions(
  baseUrl: 'https://api.example.com',
  connectTimeout: const Duration(seconds: 10),
  receiveTimeout: const Duration(seconds: 30),
));
```

## 输入验证

* 在发送至 API 或存储前验证并清理所有用户输入
* 切勿将未清理的输入传入 SQL 查询——使用参数化查询（sqflite、drift）
* 在导航前清理深度链接 URL——验证 scheme、host 和路径参数
* 使用 `Uri.tryParse` 并在导航前进行验证

```dart
// BAD — SQL injection
await db.rawQuery("SELECT * FROM users WHERE email = '$userInput'");

// GOOD — parameterized
await db.query('users', where: 'email = ?', whereArgs: [userInput]);

// BAD — unvalidated deep link
final uri = Uri.parse(incomingLink);
context.go(uri.path); // could navigate to any route

// GOOD — validated deep link
final uri = Uri.tryParse(incomingLink);
if (uri != null && uri.host == 'myapp.com' && _allowedPaths.contains(uri.path)) {
  context.go(uri.path);
}
```

## 数据保护

* 仅将令牌、个人身份信息和凭据存储在 `flutter_secure_storage` 中
* 切勿将敏感数据以明文写入 `SharedPreferences` 或本地文件
* 登出时清除认证状态：令牌、缓存用户数据、Cookie
* 对敏感操作使用生物识别认证（`local_auth`）
* 避免记录敏感数据——禁止使用 `print(token)` 或 `debugPrint(password)`

## Android 特定

* 仅在 `AndroidManifest.xml` 中声明必要权限
* 仅在必要时导出 Android 组件（`Activity`、`Service`、`BroadcastReceiver`）；非必要组件添加 `android:exported="false"`
* 审查 intent 过滤器——带有隐式 intent 过滤器的导出组件可被任意应用访问
* 对显示敏感数据的屏幕使用 `FLAG_SECURE`（防止截屏）

```xml
<!-- AndroidManifest.xml — restrict exported components -->
<activity android:name=".MainActivity" android:exported="true">
    <!-- Only the launcher activity needs exported=true -->
</activity>
<activity android:name=".SensitiveActivity" android:exported="false" />
```

## iOS 特定

* 仅在 `Info.plist` 中声明必要使用说明（`NSCameraUsageDescription` 等）
* 将密钥存储在 Keychain 中——`flutter_secure_storage` 在 iOS 上使用 Keychain
* 使用 App Transport Security (ATS)——禁止任意网络请求
* 为敏感文件启用数据保护授权

## WebView 安全

* 使用 `webview_flutter` v4+（`WebViewController` / `WebViewWidget`）——旧版 `WebView` 组件已移除
* 除非明确需要，否则禁用 JavaScript（`JavaScriptMode.disabled`）
* 在加载前验证 URL——切勿从深度链接加载任意 URL
* 除非绝对必要且经过严格沙箱隔离，否则切勿向 JavaScript 暴露 Dart 回调
* 使用 `NavigationDelegate.onNavigationRequest` 拦截并验证导航请求

```dart
// webview_flutter v4+ API (WebViewController + WebViewWidget)
final controller = WebViewController()
  ..setJavaScriptMode(JavaScriptMode.disabled) // disabled unless required
  ..setNavigationDelegate(
    NavigationDelegate(
      onNavigationRequest: (request) {
        final uri = Uri.tryParse(request.url);
        if (uri == null || uri.host != 'trusted.example.com') {
          return NavigationDecision.prevent;
        }
        return NavigationDecision.navigate;
      },
    ),
  );

// In your widget tree:
WebViewWidget(controller: controller)
```

## 混淆与构建安全

* 在发布构建中启用混淆：`flutter build apk --obfuscate --split-debug-info=./debug-info/`
* 将 `--split-debug-info` 输出文件移出版本控制（仅用于崩溃符号化）
* 确保 ProGuard/R8 规则不会意外暴露序列化类
* 运行 `flutter analyze` 并在发布前处理所有警告
