No,Category,Guideline,Description,Do,Don't,Code Good,Code Bad,Severity,Docs URL
1,Composable,Pure UI composables,Composable functions should only render UI,Accept state and callbacks,Calling usecase/repo,Pure UI composable,Business logic in UI,High,https://developer.android.com/jetpack/compose/mental-model
2,Composable,Small composables,Each composable has single responsibility,Split into components,Huge composable,Reusable UI,Monolithic UI,Medium,
3,Composable,Stateless by default,Prefer stateless composables,Hoist state,Local mutable state,Stateless UI,Hidden state,High,https://developer.android.com/jetpack/compose/state#state-hoisting
4,State,Single source of truth,UI state comes from one source,StateFlow from VM,Multiple states,Unified UiState,Scattered state,High,https://developer.android.com/topic/architecture/ui-layer
5,State,Model UI State,Use sealed interface/data class,UiState.Loading,Boolean flags,Explicit state,Flag hell,High,
6,State,remember only UI state,remember for UI-only state,"Scroll, animation",Business state,Correct remember,Misuse remember,High,https://developer.android.com/jetpack/compose/state
7,State,rememberSaveable,Persist state across config,rememberSaveable,remember,State survives,State lost,High,https://developer.android.com/jetpack/compose/state#restore-ui-state
8,State,derivedStateOf,Optimize recomposition,derivedStateOf,Recompute always,Optimized,Jank,Medium,https://developer.android.com/jetpack/compose/performance
9,SideEffect,LaunchedEffect keys,Use correct keys,LaunchedEffect(id),LaunchedEffect(Unit),Scoped effect,Infinite loop,High,https://developer.android.com/jetpack/compose/side-effects
10,SideEffect,rememberUpdatedState,Avoid stale lambdas,rememberUpdatedState,Capture directly,Safe callback,Stale state,Medium,https://developer.android.com/jetpack/compose/side-effects
11,SideEffect,DisposableEffect,Clean up resources,onDispose,No cleanup,No leak,Memory leak,High,
12,Architecture,Unidirectional data flow,UI → VM → State,onEvent,Two-way binding,Predictable flow,Hard debug,High,https://developer.android.com/topic/architecture
13,Architecture,No business logic in UI,Logic belongs to VM,Collect state,Call repo,Clean UI,Fat UI,High,
14,Architecture,Expose immutable state,Expose StateFlow,asStateFlow,Mutable exposed,Safe API,State mutation,High,
15,Lifecycle,Lifecycle-aware collect,Use collectAsStateWithLifecycle,Lifecycle aware,collectAsState,No leak,Leak,High,https://developer.android.com/jetpack/compose/lifecycle
16,Navigation,Event-based navigation,VM emits navigation event,"VM: Channel + receiveAsFlow(), V: Collect with Dispatchers.Main.immediate",Nav in UI,Decoupled nav,Using State / SharedFlow for navigation -> event is replayed and navigation fires again (StateFlow),High,https://developer.android.com/jetpack/compose/navigation
17,Navigation,Typed routes,Use sealed routes,sealed class Route,String routes,Type-safe,Runtime crash,Medium,
18,Performance,Stable parameters,Prefer immutable/stable params,@Immutable,Mutable params,Stable recomposition,Extra recomposition,High,https://developer.android.com/jetpack/compose/performance
19,Performance,Use key in Lazy,Provide stable keys,key=id,No key,Stable list,Item jump,High,
20,Performance,Avoid heavy work,No heavy computation in UI,Precompute in VM,Compute in UI,Smooth UI,Jank,High,
21,Performance,Remember expensive objects,remember heavy objects,remember,Recreate each recomposition,Efficient,Wasteful,Medium,
22,Theming,Design system,Centralized theme,Material3 tokens,Hardcoded values,Consistent UI,Inconsistent,High,https://developer.android.com/jetpack/compose/themes
23,Theming,Dark mode support,Theme-based colors,colorScheme,Fixed color,Adaptive UI,Broken dark,Medium,
24,Layout,Prefer Modifier over extra layouts,Use Modifier to adjust layout instead of adding wrapper composables,Use Modifier.padding(),Wrap content with extra Box,Padding via modifier,Box just for padding,High,https://developer.android.com/jetpack/compose/modifiers
25,Layout,Avoid deep layout nesting,Deep layout trees increase measure & layout cost,Keep layout flat,Box ? Column ? Box ? Row,Flat hierarchy,Deep nested tree,High,
26,Layout,Use Row/Column for linear layout,Linear layouts are simpler and more performant,Use Row / Column,Custom layout for simple cases,Row/Column usage,Over-engineered layout,High,
27,Layout,Use Box only for overlapping content,Box should be used only when children overlap,Stack elements,Use Box as Column,Proper overlay,Misused Box,Medium,
28,Layout,Prefer LazyColumn over Column scroll,Lazy layouts are virtualized and efficient,LazyColumn,Column.verticalScroll(),Lazy list,Scrollable Column,High,https://developer.android.com/jetpack/compose/lists
29,Layout,Avoid nested scroll containers,Nested scrolling causes UX & performance issues,Single scroll container,Scroll inside scroll,One scroll per screen,Nested scroll,High,
30,Layout,Avoid fillMaxSize by default,fillMaxSize may break parent constraints,Use exact size,Fill max everywhere,Constraint-aware size,Overfilled layout,Medium,
31,Layout,Avoid intrinsic size unless necessary,Intrinsic measurement is expensive,Explicit sizing,IntrinsicSize.Min,Predictable layout,Expensive measure,High,https://developer.android.com/jetpack/compose/layout/intrinsics
32,Layout,Use Arrangement and Alignment APIs,Declare layout intent explicitly,Use Arrangement / Alignment,Manual spacing hacks,Declarative spacing,Magic spacing,High,
33,Layout,Extract reusable layout patterns,Repeated layouts should be shared,Create layout composable,Copy-paste layouts,Reusable scaffold,Duplicated layout,High,
34,Theming,No hardcoded text style,Use typography,MaterialTheme.typography,Hardcode sp,Scalable,Inconsistent,Medium,
35,Testing,Stateless UI testing,Composable easy to test,Pass state,Hidden state,Testable,Hard test,High,https://developer.android.com/jetpack/compose/testing
36,Testing,Use testTag,Stable UI selectors,Modifier.testTag,Find by text,Stable tests,Flaky tests,Medium,
37,Preview,Multiple previews,Preview multiple states,@Preview,Single preview,Better dev UX,Misleading,Low,https://developer.android.com/jetpack/compose/tooling/preview
38,DI,Inject VM via Hilt,Use hiltViewModel,@HiltViewModel,Manual VM,Clean DI,Coupling,High,https://developer.android.com/training/dependency-injection/hilt-jetpack
39,DI,No DI in UI,Inject in VM,Constructor inject,Inject composable,Proper scope,Wrong scope,High,
40,Accessibility,Content description,Accessible UI,contentDescription,Ignore a11y,Inclusive,A11y fail,Medium,https://developer.android.com/jetpack/compose/accessibility
41,Accessibility,Semantics,Use semantics API,Modifier.semantics,None,Testable a11y,Invisible,Medium,
42,Animation,Compose animation APIs,Use animate*AsState,AnimatedVisibility,Manual anim,Smooth,Jank,Medium,https://developer.android.com/jetpack/compose/animation
43,Animation,Avoid animation logic in VM,Animation is UI concern,Animate in UI,Animate in VM,Correct layering,Mixed concern,Low,
44,Modularization,Feature-based UI modules,UI per feature,:feature:ui,God module,Scalable,Tight coupling,High,https://developer.android.com/topic/modularization
45,Modularization,Public UI contracts,Expose minimal UI API,Interface/Route,Expose impl,Encapsulated,Leaky module,Medium,
46,State,Snapshot state only,Use Compose state,mutableStateOf,Custom observable,Compose aware,Buggy UI,Medium,
47,State,Avoid mutable collections,Immutable list/map,PersistentList,MutableList,Stable UI,Silent bug,High,
48,Lifecycle,RememberCoroutineScope usage,Only for UI jobs,UI coroutine,Long jobs,Scoped job,Leak,Medium,https://developer.android.com/jetpack/compose/side-effects#remembercoroutinescope
49,Interop,Interop View carefully,Use AndroidView,Isolated usage,Mix everywhere,Safe interop,Messy UI,Low,https://developer.android.com/jetpack/compose/interop
50,Interop,Avoid legacy patterns,No LiveData in UI,StateFlow,LiveData,Modern stack,Legacy debt,Medium,
51,Debug,Use layout inspector,Inspect recomposition,Tools,Blind debug,Fast debug,Guessing,Low,https://developer.android.com/studio/debug/layout-inspector
52,Debug,Enable recomposition counts,Track recomposition,Debug flags,Ignore,Performance aware,Hidden jank,Low,
