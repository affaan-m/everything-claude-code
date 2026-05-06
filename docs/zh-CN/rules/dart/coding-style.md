---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
  - "**/analysis_options.yaml"
---

# Dart/Flutter 编码风格

> 本文档在 [common/coding-style.md](../common/coding-style.md) 的基础上扩展了 Dart 和 Flutter 专属内容。

## 格式化

* 所有 `.dart` 文件使用 **dart format** 格式化 — 在 CI 中强制执行（`dart format --set-exit-if-changed .`）
* 行长度：80 个字符（dart format 默认值）
* 多行参数/参数列表末尾添加逗号，以改善差异对比和格式化效果

## 不可变性

* 局部变量优先使用 `final`，编译时常量使用 `const`
* 当所有字段均为 `final` 时，使用 `const` 构造函数
* 从公共 API 返回不可修改的集合（`List.unmodifiable`、`Map.unmodifiable`）
* 在不可变状态类中使用 `copyWith()` 处理状态变更

```dart
// BAD
var count = 0;
List<String> items = ['a', 'b'];

// GOOD
final count = 0;
const items = ['a', 'b'];
```

## 命名规范

遵循 Dart 约定：

* 变量、参数和命名构造函数使用 `camelCase`
* 类、枚举、类型别名和扩展使用 `PascalCase`
* 文件名和库名使用 `snake_case`
* 顶层使用 `const` 声明的常量使用 `SCREAMING_SNAKE_CASE`
* 私有成员以 `_` 为前缀
* 扩展名描述其扩展的类型：`StringExtensions`，而非 `MyHelpers`

## 空安全

* 避免使用 `!`（感叹号运算符）— 优先使用 `?.`、`??`、`if (x != null)` 或 Dart 3 模式匹配；仅在空值属于编程错误且崩溃是正确行为时使用 `!`
* 避免使用 `late`，除非初始化在首次使用前得到保证（优先使用可空类型或构造函数初始化）
* 对于必须始终提供的构造函数参数，使用 `required`

```dart
// BAD — crashes at runtime if user is null
final name = user!.name;

// GOOD — null-aware operators
final name = user?.name ?? 'Unknown';

// GOOD — Dart 3 pattern matching (exhaustive, compiler-checked)
final name = switch (user) {
  User(:final name) => name,
  null => 'Unknown',
};

// GOOD — early-return null guard
String getUserName(User? user) {
  if (user == null) return 'Unknown';
  return user.name; // promoted to non-null after the guard
}
```

## 密封类型与模式匹配（Dart 3+）

使用密封类建模封闭的状态层次结构：

```dart
sealed class AsyncState<T> {
  const AsyncState();
}

final class Loading<T> extends AsyncState<T> {
  const Loading();
}

final class Success<T> extends AsyncState<T> {
  const Success(this.data);
  final T data;
}

final class Failure<T> extends AsyncState<T> {
  const Failure(this.error);
  final Object error;
}
```

始终对密封类型使用穷举的 `switch` — 不使用默认/通配符：

```dart
// BAD
if (state is Loading) { ... }

// GOOD
return switch (state) {
  Loading() => const CircularProgressIndicator(),
  Success(:final data) => DataWidget(data),
  Failure(:final error) => ErrorWidget(error.toString()),
};
```

## 错误处理

* 在 `on` 子句中指定异常类型 — 绝不使用裸 `catch (e)`
* 绝不捕获 `Error` 子类型 — 它们表示编程错误
* 对于可恢复的错误，使用 `Result` 风格类型或密封类
* 避免将异常用于控制流

```dart
// BAD
try {
  await fetchUser();
} catch (e) {
  log(e.toString());
}

// GOOD
try {
  await fetchUser();
} on NetworkException catch (e) {
  log('Network error: ${e.message}');
} on NotFoundException {
  handleNotFound();
}
```

## 异步 / Futures

* 始终 `await` Futures，或显式调用 `unawaited()` 表示有意“发射后不管”
* 如果函数从不 `await` 任何内容，切勿将其标记为 `async`
* 对于并发操作，使用 `Future.wait` / `Future.any`
* 在任何 `await` 之后使用 `BuildContext` 前，检查 `context.mounted`（Flutter 3.7+）

```dart
// BAD — ignoring Future
fetchData(); // fire-and-forget without marking intent

// GOOD
unawaited(fetchData()); // explicit fire-and-forget
await fetchData();      // or properly awaited
```

## 导入

* 全程使用 `package:` 导入 — 跨功能或跨层代码绝不使用相对导入（`../`）
* 顺序：`dart:` → 外部 `package:` → 内部 `package:`（同一包）
* 无未使用的导入 — `dart analyze` 通过 `unused_import` 强制执行此规则

## 代码生成

* 生成的文件（`.g.dart`、`.freezed.dart`、`.gr.dart`）必须提交或统一加入 .gitignore — 每个项目选择一种策略
* 切勿手动编辑生成的文件
* 将生成器注解（`@JsonSerializable`、`@freezed`、`@riverpod` 等）仅保留在规范源文件中
