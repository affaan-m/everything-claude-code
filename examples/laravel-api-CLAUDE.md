# Laravel API — Project CLAUDE.md

> Real-world example for a Laravel API with PostgreSQL, Redis, and queues.
> Copy this to your project root and customize for your service.

## Project Overview

**Stack:** PHP 8.2+, Laravel 11.x, PostgreSQL, Redis, Horizon, PHPUnit/Pest, Docker Compose

**Architecture:** Modular Laravel app with controllers -> services -> actions, Eloquent ORM, queues for async work, Form Requests for validation, and API Resources for consistent JSON responses.

## Critical Rules

### PHP Conventions

- `declare(strict_types=1)` in all PHP files
- Use typed properties and return types everywhere
- Prefer `final` classes for services and actions
- No `dd()` or `dump()` in committed code
- Formatting via Laravel Pint (PSR-12)

### API Response Envelope

All API responses use a consistent envelope:

```json
{
  "success": true,
  "data": {"...": "..."},
  "error": null,
  "meta": {"page": 1, "per_page": 25, "total": 120}
}
```

### Database

- Migrations committed to git
- Use Eloquent or query builder (no raw SQL unless parameterized)
- Index any column used in `where` or `orderBy`
- Avoid mutating model instances in services; prefer create/update through repositories or query builders

### Authentication

- API auth via Sanctum
- Use policies for model-level authorization
- Enforce auth in controllers and services

### Validation

- Use Form Requests for validation
- Transform input to DTOs for business logic
- Never trust request payloads for derived fields

### Error Handling

- Throw domain exceptions in services
- Map exceptions to HTTP responses in `app/Exceptions/Handler.php`
- Never expose internal errors to clients

### Code Style

- No emojis in code or comments
- Max line length: 120 characters
- Controllers are thin; services and actions hold business logic

## File Structure

```
app/
  Actions/
  Console/
  Events/
  Exceptions/
  Http/
    Controllers/
    Middleware/
    Requests/
    Resources/
  Jobs/
  Models/
  Policies/
  Providers/
  Services/
  Support/
config/
database/
  factories/
  migrations/
  seeders/
routes/
  api.php
  web.php
```

## Key Patterns

### Service Layer

```php
final class CreateOrderAction
{
    public function __construct(private OrderRepository $orders) {}

    public function handle(CreateOrderData $data): Order
    {
        return $this->orders->create($data);
    }
}

final class OrderService
{
    public function __construct(private CreateOrderAction $createOrder) {}

    public function placeOrder(CreateOrderData $data): Order
    {
        return $this->createOrder->handle($data);
    }
}
```

### Controller Pattern

```php
final class OrdersController extends Controller
{
    public function __construct(private OrderService $service) {}

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->service->placeOrder($request->toDto());

        return response()->json([
            'success' => true,
            'data' => OrderResource::make($order),
            'error' => null,
            'meta' => null,
        ], 201);
    }
}
```

### Policy Pattern

```php
final class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $order->user_id === $user->id;
    }
}
```

### Form Request + DTO

```php
final class StoreOrderRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.sku' => ['required', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    public function toDto(): CreateOrderData
    {
        return new CreateOrderData(
            customerId: (int) $this->input('customer_id'),
            items: $this->input('items'),
        );
    }
}
```

### API Resource

```php
final class OrderResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'total' => $this->total,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
```

### Queue Job

```php
final class SendOrderConfirmation implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    public function __construct(private int $orderId) {}

    public function handle(OrderRepository $orders, Mailer $mailer): void
    {
        $order = $orders->findOrFail($this->orderId);
        $mailer->sendOrderConfirmation($order);
    }
}
```

### Test Pattern (Pest)

```php
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('customer can place order', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/orders', [
        'customer_id' => 1,
        'items' => [['sku' => 'sku-1', 'quantity' => 2]],
    ]);

    $response->assertCreated();
    $this->assertDatabaseHas('orders', ['user_id' => $user->id]);
});
```

### Test Pattern (PHPUnit)

```php
final class OrdersControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_place_order(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'customer_id' => 1,
            'items' => [['sku' => 'sku-1', 'quantity' => 2]],
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('orders', ['user_id' => $user->id]);
    }
}
```
