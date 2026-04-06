---
name: ios-architecture
description: "iOS app architecture patterns: MVVM, Clean Architecture, Coordinator navigation, module boundaries, and dependency injection for production Swift apps."
origin: community
---

# iOS Architecture

Architecture patterns for production iOS apps. Covers MVVM with SwiftUI, Clean Architecture layering, navigation coordination, module boundaries, and dependency injection.

## When to Use

Use this skill when:
- Starting a new iOS app or module
- Refactoring from MVC toward a testable architecture
- Deciding how to structure navigation, dependencies, or data flow
- Reviewing architecture decisions in an iOS codebase

## Layered Architecture

```
┌─────────────────────────────┐
│      Presentation           │  SwiftUI Views, ViewModels
├─────────────────────────────┤
│        Domain               │  Use Cases, Entities, Repository protocols
├─────────────────────────────┤
│         Data                │  Repository implementations, Network, Persistence
└─────────────────────────────┘
```

**Key rule:** Domain never imports Presentation or Data. Dependencies point inward.

### Presentation Layer

Views observe ViewModels. ViewModels call use cases. No UIKit/SwiftUI imports in Domain.

```swift
@MainActor
@Observable
final class ProfileViewModel {
    private(set) var state: LoadState<Profile> = .idle
    private let getProfile: GetProfileUseCase

    init(getProfile: GetProfileUseCase) {
        self.getProfile = getProfile
    }

    func load() async {
        state = .loading
        do {
            let profile = try await getProfile.execute()
            state = .loaded(profile)
        } catch {
            state = .failed(error)
        }
    }
}
```

### Domain Layer

Pure Swift. No framework imports. Defines entities, use case protocols, and repository protocols.

```swift
// Entity — plain value type
struct Profile: Sendable, Identifiable {
    let id: String
    let name: String
    let email: String
}

// Repository protocol — defined in domain, implemented in data
protocol ProfileRepository: Sendable {
    func fetch(id: String) async throws -> Profile
    func save(_ profile: Profile) async throws
}

// Use case — single responsibility
struct GetProfileUseCase: Sendable {
    private let repository: any ProfileRepository

    init(repository: any ProfileRepository) {
        self.repository = repository
    }

    func execute() async throws -> Profile {
        try await repository.fetch(id: "current")
    }
}
```

### Data Layer

Implements repository protocols. Owns network clients, persistence, and mapping.

```swift
struct RemoteProfileRepository: ProfileRepository {
    private let client: APIClient

    func fetch(id: String) async throws -> Profile {
        let dto: ProfileDTO = try await client.get("/profiles/\(id)")
        return dto.toDomain()
    }

    func save(_ profile: Profile) async throws {
        try await client.put("/profiles/\(profile.id)", body: ProfileDTO(profile))
    }
}
```

## MVVM with SwiftUI

### ViewModel Pattern

```swift
@MainActor
@Observable
final class ItemListViewModel {
    private(set) var items: [Item] = []
    private(set) var isLoading = false
    private(set) var error: Error?

    private let repository: any ItemRepository

    init(repository: any ItemRepository) {
        self.repository = repository
    }

    func loadItems() async {
        isLoading = true
        error = nil
        do {
            items = try await repository.fetchAll()
        } catch {
            self.error = error
        }
        isLoading = false
    }

    func delete(_ item: Item) async {
        do {
            try await repository.delete(item.id)
            items.removeAll { $0.id == item.id }
        } catch {
            self.error = error
        }
    }
}
```

### View Binding

```swift
struct ItemListView: View {
    @State private var viewModel: ItemListViewModel

    init(repository: any ItemRepository) {
        _viewModel = State(initialValue: ItemListViewModel(repository: repository))
    }

    var body: some View {
        Group {
            switch (viewModel.isLoading, viewModel.error) {
            case (true, _):
                ProgressView()
            case (_, let error?):
                ErrorView(error: error, retry: { Task { await viewModel.loadItems() } })
            default:
                List(viewModel.items) { item in
                    ItemRow(item: item)
                }
            }
        }
        .task { await viewModel.loadItems() }
    }
}
```

## Navigation

### Coordinator Pattern

Centralize navigation logic outside views. Views emit intents; the coordinator decides where to go.

```swift
@MainActor
@Observable
final class AppCoordinator {
    var path = NavigationPath()
    var sheet: Sheet?

    enum Destination: Hashable {
        case profile(id: String)
        case settings
        case detail(Item)
    }

    enum Sheet: Identifiable {
        case compose
        case filter

        var id: Self { self }
    }

    func navigate(to destination: Destination) {
        path.append(destination)
    }

    func present(_ sheet: Sheet) {
        self.sheet = sheet
    }

    func pop() {
        guard !path.isEmpty else { return }
        path.removeLast()
    }
}
```

## Module Boundaries

For large apps, split into SPM packages:

```
App/
├── Package.swift
├── Sources/
│   ├── AppFeature/          # App composition root
│   ├── ProfileFeature/      # Profile UI + ViewModel
│   ├── ProfileDomain/       # Profile entities + use cases
│   ├── ProfileData/         # Profile repository + networking
│   ├── SharedUI/            # Reusable components
│   └── Core/                # Foundation extensions, utilities
```

**Rules:**
- Feature modules depend on their Domain module only
- Domain modules have zero framework dependencies
- Data modules implement Domain protocols
- `AppFeature` is the composition root — assembles dependencies and navigation
- Feature modules never import other feature modules directly

## Dependency Injection

### Composition Root

Wire dependencies at the app entry point:

```swift
@main
struct MyApp: App {
    private let container = DependencyContainer()

    var body: some Scene {
        WindowGroup {
            AppCoordinatorView(coordinator: container.appCoordinator)
        }
    }
}

@MainActor
final class DependencyContainer {
    private lazy var networkClient = URLSessionAPIClient()
    private lazy var profileRepository: any ProfileRepository = RemoteProfileRepository(client: networkClient)
    private lazy var getProfile = GetProfileUseCase(repository: profileRepository)

    lazy var appCoordinator = AppCoordinator()

    func makeProfileViewModel() -> ProfileViewModel {
        ProfileViewModel(getProfile: getProfile)
    }
}
```

## Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Massive ViewController/View | Untestable, unmaintainable | Extract ViewModel, subviews, use cases |
| Singleton services | Hidden dependencies, untestable | Inject protocols via init |
| Network calls in views | Tight coupling, no offline support | Use repository + ViewModel |
| Domain importing UIKit | Layer violation | Keep domain pure Swift |
| God ViewModel | Too many responsibilities | One ViewModel per screen, extract use cases |
| Navigation in ViewModels | Couples VM to presentation framework | Use Coordinator pattern |

## Related Skills

- `swiftui-patterns` — SwiftUI component patterns and state management
- `swift-protocol-di-testing` — Protocol-based DI and mock patterns
- `swift-concurrency-6-2` — Structured concurrency and actor isolation
