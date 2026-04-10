---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
  - "**/analysis_options.yaml"
---

# Dart/Flutter 编码风格

> 本文档扩展了 [common/coding-style.md](../common/coding-style.md) 中关于 Dart 和 Flutter 的特定内容。

## 格式化

* 对所有 `.dart` 文件使用 **dart format** — 在 CI 中强制执行 (`dart format --set-exit-if-changed .`)
* 行长度：80 个字符 (dart format 默认值)
* 在多行参数/参数列表中使用尾随逗号，以改善差异对比和格式化效果

## 不可变性

* 局部变量优先使用 `final`，编译时常量使用 `const`
* 在所有字段都是 `final` 的地方使用 `const` 构造函数
* 从公共 API 返回不可修改的集合 (`List.unmodifiable`, `Map.unmodifiable`)
* 在不可变状态类中使用 `copyWith()` 进行状态变更

```dart
// BAD
var count = 0;
List<String> items = ['a', 'b'];

// GOOD
final count = 0;
const items = ['a', 'b'];
```

## 命名

遵循 Dart 约定：

* `camelCase` 用于变量、参数和命名构造函数
* `PascalCase` 用于类、枚举、类型定义和扩展
* `snake_case` 用于文件名和库名
* 在顶层使用 `const` 声明的常量使用 `SCREAMING_SNAKE_CASE`
* 私有成员前缀使用 `_`
* 扩展名应描述其扩展的类型：`StringExtensions`，而不是 `MyHelpers`

## 空安全

* 避免使用 `!` (空断言操作符) — 优先使用 `?.`、`??`、`if (x != null)` 或 Dart 3 的模式匹配；仅在空值属于编程错误且崩溃是正确行为时才保留使用 `!`
* 避免使用 `late`，除非能保证在首次使用前完成初始化 (优先使用可空类型或构造函数初始化)
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

## 密封类型和模式匹配 (Dart 3+)

使用密封类来建模封闭的状态层次结构：

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

始终对密封类型使用穷尽的 `switch` — 不使用默认/通配符分支：

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

* 在 `on` 子句中指定异常类型 — 绝不使用裸的 `catch (e)`
* 绝不捕获 `Error` 的子类型 — 它们表示程序错误
* 对可恢复的错误使用 `Result` 风格的类型或密封类
* 避免使用异常进行控制流

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

* 始终对 Futures 使用 `await` 或显式调用 `unawaited()` 以表明是故意“发射后不管”
* 如果一个函数从不 `await` 任何内容，绝不将其标记为 `async`
* 使用 `Future.wait` / `Future.any` 进行并发操作
* 在任何 `await` 之后，使用 `BuildContext` 之前检查 `context.mounted` (Flutter 3.7+)

```dart
// BAD — ignoring Future
fetchData(); // fire-and-forget without marking intent

// GOOD
unawaited(fetchData()); // explicit fire-and-forget
await fetchData();      // or properly awaited
```

## 导入

* 始终使用 `package:` 导入 — 对于跨功能或跨层的代码，绝不使用相对导入 (`../`)
* 导入顺序：`dart:` → 外部 `package:` → 内部 `package:` (同一包内)
* 无未使用的导入 — `dart analyze` 通过 `unused_import` 强制执行此规则

## 代码生成

* 生成的文件 (`.g.dart`, `.freezed.dart`, `.gr.dart`) 必须一致地提交或通过 gitignore 忽略 — 每个项目选择一种策略
* 绝不手动编辑生成的文件
* 仅将生成器注解 (`@JsonSerializable`, `@freezed`, `@riverpod` 等) 保留在规范的源文件上
