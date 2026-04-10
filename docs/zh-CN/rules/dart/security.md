---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
  - "**/AndroidManifest.xml"
  - "**/Info.plist"
---

# Dart/Flutter 安全

> 本文档在 [common/security.md](../common/security.md) 的基础上，补充了 Dart、Flutter 及移动端特有的内容。

## 密钥管理

* 切勿在 Dart 源代码中硬编码 API 密钥、令牌或凭据
* 对于编译时配置，使用 `--dart-define` 或 `--dart-define-from-file`（这些值并非真正保密——对于服务端密钥，请使用后端代理）
* 使用 `flutter_dotenv` 或等效方案，并将 `.env` 文件列在 `.gitignore` 中
* 将运行时密钥存储在平台安全存储中：`flutter_secure_storage`（iOS 上为 Keychain，Android 上为 EncryptedSharedPreferences）

```dart
// BAD
const apiKey = 'sk-abc123...';

// GOOD — compile-time config (not secret, just configurable)
const apiKey = String.fromEnvironment('API_KEY');

// GOOD — runtime secret from secure storage
final token = await secureStorage.read(key: 'auth_token');
```

## 网络安全

* 强制使用 HTTPS——生产环境中禁止出现 `http://` 调用
* 配置 Android 的 `network_security_config.xml` 以阻止明文流量
* 在 `Info.plist` 中设置 `NSAppTransportSecurity` 以禁止任意加载
* 为所有 HTTP 客户端设置请求超时——切勿使用默认值
* 对于高安全性的端点，考虑使用证书锁定

```dart
// Dio with timeout and HTTPS enforcement
final dio = Dio(BaseOptions(
  baseUrl: 'https://api.example.com',
  connectTimeout: const Duration(seconds: 10),
  receiveTimeout: const Duration(seconds: 30),
));
```

## 输入验证

* 在发送到 API 或存储之前，验证并清理所有用户输入
* 切勿将未清理的输入传递给 SQL 查询——请使用参数化查询（sqflite、drift）
* 在导航前清理深度链接 URL——验证其协议、主机和路径参数
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

* 仅将令牌、个人身份信息（PII）和凭据存储在 `flutter_secure_storage` 中
* 切勿以明文形式将敏感数据写入 `SharedPreferences` 或本地文件
* 登出时清除认证状态：令牌、缓存的用户数据、Cookie
* 对于敏感操作，使用生物特征认证（`local_auth`）
* 避免记录敏感数据——不要使用 `print(token)` 或 `debugPrint(password)`

## Android 特有

* 在 `AndroidManifest.xml` 中仅声明必需的权限
* 仅在必要时导出 Android 组件（`Activity`、`Service`、`BroadcastReceiver`）；在不需要的地方添加 `android:exported="false"`
* 检查 Intent 过滤器——导出的组件若带有隐式 Intent 过滤器，则任何应用均可访问
* 对于显示敏感数据的屏幕，使用 `FLAG_SECURE`（可防止截图）

```xml
<!-- AndroidManifest.xml — restrict exported components -->
<activity android:name=".MainActivity" android:exported="true">
    <!-- Only the launcher activity needs exported=true -->
</activity>
<activity android:name=".SensitiveActivity" android:exported="false" />
```

## iOS 特有

* 在 `Info.plist` 中仅声明必需的用途描述（`NSCameraUsageDescription` 等）
* 将密钥存储在 Keychain 中——`flutter_secure_storage` 在 iOS 上使用 Keychain
* 使用应用传输安全（ATS）——禁止任意加载
* 为敏感文件启用数据保护权利

## WebView 安全

* 使用 `webview_flutter` v4+（`WebViewController` / `WebViewWidget`）——传统的 `WebView` 组件已被移除
* 除非明确需要，否则禁用 JavaScript（`JavaScriptMode.disabled`）
* 在加载前验证 URL——切勿从深度链接加载任意 URL
* 除非绝对必要且经过仔细沙箱处理，否则切勿将 Dart 回调暴露给 JavaScript
* 使用 `NavigationDelegate.onNavigationRequest` 来拦截和验证导航请求

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

* 在发布版本中启用混淆：`flutter build apk --obfuscate --split-debug-info=./debug-info/`
* 将 `--split-debug-info` 的输出排除在版本控制之外（仅用于崩溃符号化）
* 确保 ProGuard/R8 规则不会无意中暴露序列化的类
* 在发布前运行 `flutter analyze` 并处理所有警告
