---
name: laravel-tdd
description: Test-driven development for Laravel with PHPUnit and Pest, factories, database testing, fakes, and coverage targets.
origin: ECC
---

# Laravel TDD Workflow

Test-driven development for Laravel applications using PHPUnit and Pest with 80%+ coverage (unit + feature).

## When to Activate

- New features or endpoints in Laravel
- Bug fixes or refactors
- Testing Eloquent models, policies, jobs, and notifications

## Red-Green-Refactor Cycle

1) Write a failing test
2) Implement the minimal change to pass
3) Refactor while keeping tests green

## PHPUnit Example

```php
final class ProjectControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_project(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/projects', [
            'name' => 'New Project',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('projects', ['name' => 'New Project']);
    }
}
```

## Pest Example

```php
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('owner can create project', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/projects', [
        'name' => 'New Project',
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('projects', ['name' => 'New Project']);
});
```

## Factories and States

- Use factories for test data
- Define states for edge cases (archived, admin, trial)

```php
$user = User::factory()->state(['role' => 'admin'])->create();
```

## Database Testing

- Use `RefreshDatabase` for clean state
- Keep tests isolated and deterministic
- Prefer `assertDatabaseHas` over manual queries

## Fakes for Side Effects

- `Bus::fake()` for jobs
- `Queue::fake()` for queued work
- `Mail::fake()` and `Notification::fake()` for notifications
- `Event::fake()` for domain events

## HTTP and External Services

- Use `Http::fake()` to isolate external APIs
- Assert outbound payloads with `Http::assertSent()`

## Coverage Targets

- Enforce 80%+ coverage for unit + feature tests
- Use `phpdbg` or `XDEBUG_MODE=coverage` in CI

## Test Commands

- `php artisan test`
- `vendor/bin/phpunit`
- `vendor/bin/pest`
