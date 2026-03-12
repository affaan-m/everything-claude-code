---
name: laravel-patterns
description: Laravel architecture patterns, routing/controllers, Eloquent ORM, service layers, queues, events, caching, and API resources for production apps.
origin: ECC
---

# Laravel Development Patterns

Production-grade Laravel architecture patterns for scalable, maintainable applications.

## When to Activate

- Building Laravel web applications or APIs
- Structuring controllers, services, and domain logic
- Working with Eloquent models and relationships
- Designing APIs with resources and pagination
- Adding queues, events, caching, and background jobs

## Project Structure

### Recommended Layout

```
app/
├── Actions/            # Single-purpose use cases
├── Console/
├── Events/
├── Exceptions/
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Requests/       # Form request validation
│   └── Resources/      # API resources
├── Jobs/
├── Models/
├── Policies/
├── Providers/
├── Services/           # Coordinating domain services
└── Support/
config/
database/
├── factories/
├── migrations/
└── seeders/
resources/
├── views/
└── lang/
routes/
├── api.php
├── web.php
└── console.php
```

### Controllers -> Services -> Actions

Keep controllers thin. Put orchestration in services and single-purpose logic in actions.

```php
final class CreateOrderAction
{
    public function __construct(private OrderRepository $orders) {}

    public function handle(CreateOrderData $data): Order
    {
        return $this->orders->create($data);
    }
}

final class OrdersController extends Controller
{
    public function __construct(private CreateOrderAction $createOrder) {}

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->createOrder->handle($request->toDto());

        return response()->json(OrderResource::make($order));
    }
}
```

## Routing and Controllers

Prefer route-model binding and resource controllers for clarity.

```php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('projects', ProjectController::class);
});
```

## Eloquent Model Patterns

### Model Configuration

```php
final class Project extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'owner_id', 'status'];

    protected $casts = [
        'status' => ProjectStatus::class,
        'archived_at' => 'datetime',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('archived_at');
    }
}
```

### Query Objects for Complex Filters

```php
final class ProjectQuery
{
    public function __construct(private Builder $query) {}

    public function ownedBy(int $userId): self
    {
        return new self($this->query->where('owner_id', $userId));
    }

    public function active(): self
    {
        return new self($this->query->whereNull('archived_at'));
    }

    public function builder(): Builder
    {
        return $this->query;
    }
}
```

## Form Requests and Validation

Keep validation in form requests and transform inputs to DTOs.

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

## API Resources

Keep API responses consistent with resources and pagination.

```php
return ProjectResource::collection(
    Project::query()->active()->paginate(25)
);
```

## Events, Jobs, and Queues

- Emit domain events for side effects (emails, analytics)
- Use queued jobs for slow work (reports, exports, webhooks)
- Prefer idempotent handlers with retries and backoff

## Caching

- Cache read-heavy endpoints and expensive queries
- Invalidate caches on model events (created/updated/deleted)
- Use tags when caching related data for easy invalidation

## Configuration and Environments

- Keep secrets in `.env` and config in `config/*.php`
- Use per-environment config overrides and `config:cache` in production
