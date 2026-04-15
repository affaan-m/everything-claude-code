---
description: 逐步修复Dart分析器错误和Flutter构建失败。调用dart-build-resolver代理进行最小化、精准的修复。
---

# Flutter 构建与修复

此命令调用 **dart-build-resolver** 代理，以最小的更改增量修复 Dart/Flutter 构建错误。

## 此命令的作用

1. **运行诊断**：执行 `flutter analyze`、`flutter pub get`
2. **解析错误**：按文件分组并按严重性排序
3. **增量修复**：一次修复一个错误
4. **验证每个修复**：每次更改后重新运行分析
5. **报告摘要**：显示已修复和仍存在的问题

## 何时使用

在以下情况使用 `/flutter-build`：

* `flutter analyze` 报告错误
* `flutter build` 在任何平台上失败
* `dart pub get` / `flutter pub get` 因版本冲突而失败
* `build_runner` 无法生成代码
* 拉取更改后导致构建失败

## 运行的诊断命令

```bash
# Analysis
flutter analyze 2>&1

# Dependencies
flutter pub get 2>&1

# Code generation (if project uses build_runner)
dart run build_runner build --delete-conflicting-outputs 2>&1

# Platform builds
flutter build apk 2>&1
flutter build web 2>&1
```

## 示例会话

````text
User: /flutter-build

Agent:
# Flutter 构建问题解决

## 初始诊断

```
$ flutter analyze
Analyzing project...

  error • lib/features/user/data/user_repository_impl.dart:34:16 •
    A value of type 'String?' can't be assigned to a variable of type 'String'. •
    invalid_assignment

  error • lib/features/cart/presentation/cart_page.dart:58:5 •
    The method 'add' isn't defined for the type 'List<Item>'.
    Try correcting the name to the name of an existing method, or defining a method named 'add'. •
    undefined_method

2 errors found.
```

## 修复 1: 空安全

文件: lib/features/user/data/user_repository_impl.dart:34
错误: 类型为 'String?' 的值不能赋值给类型 'String'

更改:
```dart
final id = response.id;
```
为:
```dart
final id = response.id ?? '';
```

```
$ flutter analyze
1 error found.
```

## 修复 2: 不可变列表

文件: lib/features/cart/presentation/cart_page.dart:58
错误: 类型 'List<Item>' 未定义方法 'add'
原因: State 持有一个不可修改的列表；变更需要通过 Cubit 进行

更改:
```dart
state.items.add(item);
```
为:
```dart
context.read<CartCubit>().addItem(item);
// 注意: Cubit 暴露了命名方法 (addItem, removeItem);
// .add(event) 是 BLoC 的事件 API — 不要混用它们。
```

```
$ flutter analyze
No issues found!
```

## 最终验证

```
$ flutter test
All tests passed.
```

## 总结

| 指标 | 数量 |
|--------|-------|
| 已修复的分析错误 | 2 |
| 已修改的文件 | 2 |
| 剩余问题 | 0 |

构建状态: 通过 ✓
````

## 常见修复的错误

| 错误 | 典型修复方法 |
|-------|-------------|
| `A value of type 'X?' can't be assigned to 'X'` | 添加 `?? default` 或空值保护 |
| `The name 'X' isn't defined` | 添加导入或修正拼写错误 |
| `Non-nullable instance field must be initialized` | 添加初始化器或 `late` |
| `Version solving failed` | 调整 pubspec.yaml 中的版本约束 |
| `Missing concrete implementation of 'X'` | 实现缺失的接口方法 |
| `build_runner: Part of X expected` | 删除过时的 `.g.dart` 并重新构建 |

## 修复策略

1. **首先处理分析错误** — 代码必须无错误
2. **其次处理警告分类** — 修复可能导致运行时错误的警告
3. **第三处理 pub 冲突** — 修复依赖项解析问题
4. **一次修复一个** — 验证每次更改
5. **最小化更改** — 不进行重构，仅修复问题

## 停止条件

代理将在以下情况停止并报告：

* 同一错误尝试 3 次后仍然存在
* 修复引入了更多错误
* 需要架构性更改
* 包升级冲突需要用户决策

## 相关命令

* `/flutter-test` — 构建成功后运行测试
* `/flutter-review` — 审查代码质量
* `/verify` — 完整验证循环

## 相关

* 代理：`agents/dart-build-resolver.md`
* 技能：`skills/flutter-dart-code-review/`
