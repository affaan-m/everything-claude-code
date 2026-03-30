No,Category,Guideline,Description,Do,Don't,Code Good,Code Bad,Severity,Docs URL
1,Widgets,Use StatelessWidget when possible,Immutable widgets are simpler,StatelessWidget for static UI,StatefulWidget for everything,class MyWidget extends StatelessWidget,class MyWidget extends StatefulWidget (static),Medium,https://api.flutter.dev/flutter/widgets/StatelessWidget-class.html
2,Widgets,Keep widgets small,Single responsibility principle,Extract widgets into smaller pieces,Large build methods,Column(children: [Header() Content()]),500+ line build method,Medium,
3,Widgets,Use const constructors,Compile-time constants for performance,const MyWidget() when possible,Non-const for static widgets,const Text('Hello'),Text('Hello') for literals,High,https://dart.dev/guides/language/language-tour#constant-constructors
4,Widgets,Prefer composition over inheritance,Combine widgets using children,Compose widgets,Extend widget classes,Container(child: MyContent()),class MyContainer extends Container,Medium,
5,State,Use setState correctly,Minimal state in StatefulWidget,setState for UI state changes,setState for business logic,setState(() { _counter++; }),Complex logic in setState,Medium,https://api.flutter.dev/flutter/widgets/State/setState.html
6,State,Avoid setState in build,Never call setState during build,setState in callbacks only,setState in build method,onPressed: () => setState(() {}),build() { setState(); },High,
7,State,Use state management for complex apps,Provider Riverpod BLoC,State management for shared state,setState for global state,Provider.of<MyState>(context),Global setState calls,Medium,
8,State,Prefer Riverpod or Provider,Recommended state solutions,Riverpod for new projects,InheritedWidget manually,ref.watch(myProvider),Custom InheritedWidget,Medium,https://riverpod.dev/
9,State,Dispose resources,Clean up controllers and subscriptions,dispose() for cleanup,Memory leaks from subscriptions,@override void dispose() { controller.dispose(); },No dispose implementation,High,
10,Layout,Use Column and Row,Basic layout widgets,Column Row for linear layouts,Stack for simple layouts,"Column(children: [Text(), Button()])",Stack for vertical list,Medium,https://api.flutter.dev/flutter/widgets/Column-class.html
11,Layout,Use Expanded and Flexible,Control flex behavior,Expanded to fill space,Fixed sizes in flex containers,Expanded(child: Container()),Container(width: 200) in Row,Medium,
12,Layout,Use SizedBox for spacing,Consistent spacing,SizedBox for gaps,Container for spacing only,SizedBox(height: 16),Container(height: 16),Low,
13,Layout,Use LayoutBuilder for responsive,Respond to constraints,LayoutBuilder for adaptive layouts,Fixed sizes for responsive,LayoutBuilder(builder: (context constraints) {}),Container(width: 375),Medium,https://api.flutter.dev/flutter/widgets/LayoutBuilder-class.html
14,Layout,Avoid deep nesting,Keep widget tree shallow,Extract deeply nested widgets,10+ levels of nesting,Extract widget to method or class,Column(Row(Column(Row(...)))),Medium,
15,Lists,Use ListView.builder,Lazy list building,ListView.builder for long lists,ListView with children for large lists,"ListView.builder(itemCount: 100, itemBuilder: ...)",ListView(children: items.map(...).toList()),High,https://api.flutter.dev/flutter/widgets/ListView-class.html
16,Lists,Provide itemExtent when known,Skip measurement,itemExtent for fixed height items,No itemExtent for uniform lists,ListView.builder(itemExtent: 50),ListView.builder without itemExtent,Medium,
17,Lists,Use keys for stateful items,Preserve widget state,Key for stateful list items,No key for dynamic lists,ListTile(key: ValueKey(item.id)),ListTile without key,High,
18,Lists,Use SliverList for custom scroll,Custom scroll effects,CustomScrollView with Slivers,Nested ListViews,CustomScrollView(slivers: [SliverList()]),ListView inside ListView,Medium,https://api.flutter.dev/flutter/widgets/SliverList-class.html
19,Navigation,Use Navigator 2.0 or GoRouter,Declarative routing,go_router for navigation,Navigator.push for complex apps,GoRouter(routes: [...]),Navigator.push everywhere,Medium,https://pub.dev/packages/go_router
20,Navigation,Use named routes,Organized navigation,Named routes for clarity,Anonymous routes,Navigator.pushNamed(context '/home'),Navigator.push(context MaterialPageRoute()),Low,
21,Navigation,Handle back button (PopScope),Android back behavior and predictive back (Android 14+),Use PopScope widget (WillPopScope is deprecated),Use WillPopScope,"PopScope(canPop: false, onPopInvoked: (didPop) => ...)",WillPopScope(onWillPop: ...),High,https://api.flutter.dev/flutter/widgets/PopScope-class.html
22,Navigation,Pass typed arguments,Type-safe route arguments,Typed route arguments,Dynamic arguments,MyRoute(id: '123'),arguments: {'id': '123'},Medium,
23,Async,Use FutureBuilder,Async UI building,FutureBuilder for async data,setState for async,FutureBuilder(future: fetchData()),fetchData().then((d) => setState()),Medium,https://api.flutter.dev/flutter/widgets/FutureBuilder-class.html
24,Async,Use StreamBuilder,Stream UI building,StreamBuilder for streams,Manual stream subscription,StreamBuilder(stream: myStream),stream.listen in initState,Medium,https://api.flutter.dev/flutter/widgets/StreamBuilder-class.html
25,Async,Handle loading and error states,Complete async UI states,ConnectionState checks,Only success state,if (snapshot.connectionState == ConnectionState.waiting),No loading indicator,High,
26,Async,Cancel subscriptions,Clean up stream subscriptions,Cancel in dispose,Memory leaks,subscription.cancel() in dispose,No subscription cleanup,High,
27,Theming,Use ThemeData,Consistent theming,ThemeData for app theme,Hardcoded colors,Theme.of(context).primaryColor,Color(0xFF123456) everywhere,Medium,https://api.flutter.dev/flutter/material/ThemeData-class.html
28,Theming,Use ColorScheme,Material 3 color system,ColorScheme for colors,Individual color properties,colorScheme: ColorScheme.fromSeed(),primaryColor: Colors.blue,Medium,
29,Theming,Access theme via context,Dynamic theme access,Theme.of(context),Static theme reference,Theme.of(context).textTheme.bodyLarge,TextStyle(fontSize: 16),Medium,
30,Theming,Support dark mode,Respect system theme,darkTheme in MaterialApp,Light theme only,"MaterialApp(theme: light, darkTheme: dark)",MaterialApp(theme: light),Medium,
31,Animation,Use implicit animations,Simple animations,AnimatedContainer AnimatedOpacity,Explicit for simple transitions,AnimatedContainer(duration: Duration()),AnimationController for fade,Low,https://api.flutter.dev/flutter/widgets/AnimatedContainer-class.html
32,Animation,Use AnimationController for complex,Fine-grained control,AnimationController with Ticker,Implicit for complex sequences,AnimationController(vsync: this),AnimatedContainer for staggered,Medium,
33,Animation,Dispose AnimationControllers,Clean up animation resources,dispose() for controllers,Memory leaks,controller.dispose() in dispose,No controller disposal,High,
34,Animation,Use Hero for transitions,Shared element transitions,Hero for navigation animations,Manual shared element,Hero(tag: 'image' child: Image()),Custom shared element animation,Low,https://api.flutter.dev/flutter/widgets/Hero-class.html
35,Forms,Use Form widget,Form validation,Form with GlobalKey,Individual validation,Form(key: _formKey child: ...),TextField without Form,Medium,https://api.flutter.dev/flutter/widgets/Form-class.html
36,Forms,Use TextEditingController,Control text input,Controller for text fields,onChanged for all text,final controller = TextEditingController(),onChanged: (v) => setState(),Medium,
37,Forms,Validate on submit,Form validation flow,_formKey.currentState!.validate(),Skip validation,if (_formKey.currentState!.validate()),Submit without validation,High,
38,Forms,Dispose controllers,Clean up text controllers,dispose() for controllers,Memory leaks,controller.dispose() in dispose,No controller disposal,High,
39,Performance,Use const widgets,Reduce rebuilds,const for static widgets,No const for literals,const Icon(Icons.add),Icon(Icons.add),High,
40,Performance,Avoid rebuilding entire tree,Minimal rebuild scope,Isolate changing widgets,setState on parent,Consumer only around changing widget,setState on root widget,High,
41,Performance,Use RepaintBoundary,Isolate repaints,RepaintBoundary for animations,Full screen repaints,RepaintBoundary(child: AnimatedWidget()),Animation without boundary,Medium,https://api.flutter.dev/flutter/widgets/RepaintBoundary-class.html
42,Performance,Profile with DevTools,Measure before optimizing,Flutter DevTools profiling,Guess at performance,DevTools performance tab,Optimize without measuring,Medium,https://docs.flutter.dev/tools/devtools
43,Accessibility,Use Semantics widget,Screen reader support,Semantics for accessibility,Missing accessibility info,Semantics(label: 'Submit button'),GestureDetector without semantics,High,https://api.flutter.dev/flutter/widgets/Semantics-class.html
44,Accessibility,Support large fonts,MediaQuery text scaling,MediaQuery.textScaleFactor,Fixed font sizes,style: Theme.of(context).textTheme,TextStyle(fontSize: 14),High,
45,Accessibility,Test with screen readers,TalkBack and VoiceOver,Test accessibility regularly,Skip accessibility testing,Regular TalkBack testing,No screen reader testing,High,
46,Testing,Use widget tests,Test widget behavior,WidgetTester for UI tests,Unit tests only,testWidgets('...' (tester) async {}),Only test() for UI,Medium,https://docs.flutter.dev/testing
47,Testing,Use integration tests,Full app testing,integration_test package,Manual testing only,IntegrationTestWidgetsFlutterBinding,Manual E2E testing,Medium,
48,Testing,Mock dependencies,Isolate tests,Mockito or mocktail,Real dependencies in tests,when(mock.method()).thenReturn(),Real API calls in tests,Medium,
49,Platform,Use Platform checks,Platform-specific code,Platform.isIOS Platform.isAndroid,Same code for all platforms,if (Platform.isIOS) {},Hardcoded iOS behavior,Medium,
50,Platform,Use kIsWeb for web,Web platform detection,kIsWeb for web checks,Platform for web,if (kIsWeb) {},Platform.isWeb (doesn't exist),Medium,
51,Packages,Use pub.dev packages,Community packages,Popular maintained packages,Custom implementations,cached_network_image,Custom image cache,Medium,https://pub.dev/
52,Packages,Check package quality,Quality before adding,Pub points and popularity,Any package without review,100+ pub points,Unmaintained packages,Medium,
