---
name: ios-testing
description: "iOS testing workflows: Swift Testing, XCTest, UI tests, snapshot testing, mock patterns, and test architecture for production iOS apps."
origin: community
---

# iOS Testing

Testing patterns for production iOS apps. Covers Swift Testing framework, XCTest migration, UI testing, snapshot patterns, mocking strategies, and test architecture.

## When to Use

Use this skill when:
- Writing tests for iOS features (unit, integration, UI)
- Setting up test infrastructure for a new iOS project
- Migrating from XCTest to Swift Testing
- Deciding how to mock dependencies in Swift
- Reviewing test quality in an iOS codebase

## Swift Testing (Preferred)

Swift Testing (`import Testing`) is the modern test framework. Use it for all new tests.

### Basic Test

```swift
import Testing
@testable import MyApp

@Test("User creation validates email format")
func userCreationValidatesEmail() {
    #expect(throws: ValidationError.invalidEmail) {
        try User(email: "not-an-email")
    }
}
```

### Parameterized Tests

Test multiple inputs with a single function:

```swift
@Test("Password strength validation", arguments: [
    ("abc", false),
    ("Abc123!@", true),
    ("12345678", false),
])
func passwordValidation(password: String, expected: Bool) {
    #expect(PasswordValidator.isStrong(password) == expected)
}
```

### Suites for Grouping

```swift
@Suite("ProfileViewModel")
struct ProfileViewModelTests {
    let sut: ProfileViewModel
    let mockRepository: MockProfileRepository

    init() {
        mockRepository = MockProfileRepository()
        sut = ProfileViewModel(repository: mockRepository)
    }

    @Test("loads profile on init")
    func loadsProfile() async {
        mockRepository.profileToReturn = .sample
        await sut.load()
        #expect(sut.state == .loaded(.sample))
    }

    @Test("shows error on failure")
    func showsError() async {
        mockRepository.errorToThrow = URLError(.notConnectedToInternet)
        await sut.load()
        guard case .failed = sut.state else {
            Issue.record("Expected failed state")
            return
        }
    }
}
```

### Traits

```swift
@Test("Slow network simulation", .timeLimit(.minutes(1)))
func slowNetworkTest() async throws { ... }

@Test("Disabled until API v2 ships", .disabled("Waiting on backend"))
func futureFeatureTest() { ... }

@Test("Requires network", .tags(.integration))
func networkTest() async throws { ... }

extension Tag {
    @Tag static var integration: Self
    @Tag static var snapshot: Self
}
```

## Mocking Strategy

### Protocol-Based Mocks

Define protocols in Domain. Mock them in tests:

```swift
// Production protocol
protocol ProfileRepository: Sendable {
    func fetch(id: String) async throws -> Profile
    func save(_ profile: Profile) async throws
}

// Test mock
final class MockProfileRepository: ProfileRepository, @unchecked Sendable {
    var profileToReturn: Profile?
    var errorToThrow: Error?
    var savedProfiles: [Profile] = []

    func fetch(id: String) async throws -> Profile {
        if let error = errorToThrow { throw error }
        guard let profile = profileToReturn else {
            throw TestError.notConfigured
        }
        return profile
    }

    func save(_ profile: Profile) async throws {
        if let error = errorToThrow { throw error }
        savedProfiles.append(profile)
    }
}
```

### Spy Pattern

Track method calls for verification:

```swift
final class SpyAnalytics: AnalyticsService, @unchecked Sendable {
    var trackedEvents: [(name: String, properties: [String: String])] = []

    func track(_ event: String, properties: [String: String]) {
        trackedEvents.append((event, properties))
    }
}

// In test
@Test("tracks profile view event")
func tracksProfileView() async {
    let spy = SpyAnalytics()
    let viewModel = ProfileViewModel(analytics: spy)
    await viewModel.load()
    #expect(spy.trackedEvents.contains { $0.name == "profile_viewed" })
}
```

## ViewModel Testing

### Async State Transitions

```swift
@Suite("ItemListViewModel")
struct ItemListViewModelTests {
    let sut: ItemListViewModel
    let mockRepo: MockItemRepository

    init() {
        mockRepo = MockItemRepository()
        sut = ItemListViewModel(repository: mockRepo)
    }

    @Test("loading state transitions: idle -> loading -> loaded")
    func loadingTransitions() async {
        mockRepo.itemsToReturn = [.sample]

        #expect(sut.isLoading == false)
        #expect(sut.items.isEmpty)

        await sut.loadItems()

        #expect(sut.isLoading == false)
        #expect(sut.items.count == 1)
    }

    @Test("delete removes item from list")
    func deleteRemovesItem() async {
        let item = Item.sample
        mockRepo.itemsToReturn = [item]
        await sut.loadItems()

        await sut.delete(item)

        #expect(sut.items.isEmpty)
        #expect(mockRepo.deletedIds.contains(item.id))
    }
}
```

## UI Testing

### XCUITest Basics

```swift
import XCTest

final class LoginUITests: XCTestCase {
    let app = XCUIApplication()

    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launchArguments = ["--ui-testing"]
        app.launch()
    }

    func testLoginFlow() throws {
        let emailField = app.textFields["email-field"]
        let passwordField = app.secureTextFields["password-field"]
        let loginButton = app.buttons["login-button"]

        emailField.tap()
        emailField.typeText("user@example.com")

        passwordField.tap()
        passwordField.typeText("password123")

        loginButton.tap()

        let welcomeLabel = app.staticTexts["welcome-label"]
        XCTAssertTrue(welcomeLabel.waitForExistence(timeout: 5))
    }
}
```

### Accessibility Identifiers

Set identifiers in SwiftUI for testability:

```swift
TextField("Email", text: $email)
    .accessibilityIdentifier("email-field")

Button("Log In") { ... }
    .accessibilityIdentifier("login-button")
```

## Snapshot Testing

Use `swift-snapshot-testing` for visual regression:

```swift
import SnapshotTesting
import SwiftUI

@Test("ProfileView renders correctly", .tags(.snapshot))
func profileViewSnapshot() {
    let view = ProfileView(profile: .sample)
    let hostingController = UIHostingController(rootView: view)
    hostingController.view.frame = CGRect(x: 0, y: 0, width: 390, height: 844)

    assertSnapshot(of: hostingController, as: .image)
}
```

## Test Organization

```
Tests/
├── UnitTests/
│   ├── ViewModels/
│   │   ├── ProfileViewModelTests.swift
│   │   └── ItemListViewModelTests.swift
│   ├── UseCases/
│   │   └── GetProfileUseCaseTests.swift
│   └── Mocks/
│       ├── MockProfileRepository.swift
│       └── MockAnalytics.swift
├── IntegrationTests/
│   └── API/
│       └── ProfileAPITests.swift
└── UITests/
    └── Flows/
        └── LoginUITests.swift
```

## Coverage

```bash
# SPM
swift test --enable-code-coverage
xcrun llvm-cov report .build/debug/<package>PackageTests.xctest/Contents/MacOS/<package>PackageTests \
    -instr-profile .build/debug/codecov/default.profdata

# Xcode
xcodebuild test -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 16' \
    -enableCodeCoverage YES
```

Target: 80%+ on domain and ViewModel layers. UI tests cover critical flows, not pixel coverage.

## Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Testing private methods | Brittle, couples to implementation | Test through public API |
| Mocking value types | Unnecessary complexity | Use real values, mock protocols only |
| `sleep()` in async tests | Flaky, slow | Use `#expect` with conditions or `.task` cancellation |
| Shared mutable test state | Tests influence each other | Fresh setup per test via `init()` |
| Testing framework code | Wasted effort | Test your logic, not Apple's |
| No assertions | Test passes vacuously | Every test needs at least one `#expect` |

## Related Skills

- `swift-protocol-di-testing` — Protocol-based DI and mock patterns in depth
- `ios-architecture` — Architecture patterns that enable testability
- `swift-concurrency-6-2` — Testing async/actor code
