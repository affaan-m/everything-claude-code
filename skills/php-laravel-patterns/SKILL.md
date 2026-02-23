---
name: php-laravel-patterns
description: PHP/Laravel development patterns — Eloquent ORM, service layer, API resources, queues, Sanctum auth, Livewire 3, Artisan commands, and Pest testing for production-grade applications.
---

# PHP/Laravel Development Patterns

## When to Activate

- Building Laravel web applications or APIs
- Designing Eloquent models with relationships and scopes
- Extracting business logic into services, repositories, or action classes
- Building JSON APIs with API Resources and pagination
- Setting up queues, jobs, and batch processing
- Implementing authentication with Laravel Sanctum
- Building reactive UIs with Livewire 3
- Writing tests with Pest PHP

## Core Principles

1. **Thin controllers, thick domain** — controllers delegate to services and actions
2. **Eloquent responsibly** — eager load relationships, use scopes, avoid N+1
3. **Type everything** — strict types, typed properties, return types on all methods
4. **Queue heavy work** — anything over 200ms belongs in a job
5. **Test with Pest** — expressive syntax, factories for data, RefreshDatabase for isolation

## 1. Eloquent ORM

### Model with Casts, Relationships, and Scopes

```php
<?php declare(strict_types=1);
namespace App\Models;
use Illuminate\Database\Eloquent\{Builder, Factories\HasFactory, Model, SoftDeletes};
use Illuminate\Database\Eloquent\Relations\{BelongsTo, BelongsToMany, HasMany};

class Product extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = ['name', 'description', 'price_cents', 'is_active', 'category_id'];

    protected function casts(): array
    {
        return [
            'price_cents' => 'integer', 'is_active' => 'boolean',
            'metadata' => 'array', 'status' => ProductStatus::class,
        ];
    }
    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
    public function orderItems(): HasMany { return $this->hasMany(OrderItem::class); }
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->withPivot('sort_order')->withTimestamps();
    }
    public function scopeActive(Builder $q): Builder { return $q->where('is_active', true); }
    public function scopePriceBetween(Builder $q, int $min, int $max): Builder
    {
        return $q->whereBetween('price_cents', [$min, $max]);
    }
    public function scopeSearch(Builder $q, string $term): Builder
    {
        return $q->where(fn (Builder $s) =>
            $s->where('name', 'LIKE', "%{$term}%")->orWhere('description', 'LIKE', "%{$term}%"));
    }
}

// Composable eager-loaded query
$products = Product::active()->priceBetween(1000, 5000)
    ->with(['category', 'tags'])->withCount('orderItems')
    ->orderByDesc('created_at')->paginate(20);
```

### Factory

```php
<?php declare(strict_types=1);
namespace Database\Factories;
use App\Models\{Product, Category, Tag};
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return ['name' => $this->faker->words(3, true), 'category_id' => Category::factory(),
            'price_cents' => $this->faker->numberBetween(500, 50_000), 'is_active' => true];
    }
    public function inactive(): static { return $this->state(['is_active' => false]); }
    public function withTags(int $n = 3): static
    {
        return $this->afterCreating(fn (Product $p) =>
            $p->tags()->attach(Tag::factory()->count($n)->create()));
    }
}
```

## 2. Service Layer

### DI Binding, Repository, Service, Action

```php
<?php declare(strict_types=1);
// --- ServiceProvider ---
class AppServiceProvider extends \Illuminate\Support\ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(OrderRepositoryInterface::class, EloquentOrderRepository::class);
        $this->app->singleton(OrderService::class);
    }
}

// --- Repository contract + implementation ---
interface OrderRepositoryInterface
{
    public function findById(int $id): ?Order;
    public function paginateForUser(int $userId, int $perPage = 15): LengthAwarePaginator;
    public function create(array $data): Order;
}
class EloquentOrderRepository implements OrderRepositoryInterface
{
    public function findById(int $id): ?Order { return Order::with(['items.product', 'user'])->find($id); }
    public function paginateForUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Order::where('user_id', $userId)->with('items')->latest()->paginate($perPage);
    }
    public function create(array $data): Order { return Order::create($data); }
}

// --- Service ---
class OrderService
{
    public function __construct(private readonly OrderRepositoryInterface $orders) {}
    public function placeOrder(User $user, array $cartItems): Order
    {
        return DB::transaction(function () use ($user, $cartItems) {
            $total = collect($cartItems)->sum(fn ($i) => $i['price_cents'] * $i['quantity']);
            $order = $this->orders->create(['user_id' => $user->id, 'total_cents' => $total, 'currency' => 'USD']);
            $order->items()->createMany($cartItems);
            return $order->load('items');
        });
    }
}

// --- Action (single-purpose) ---
class ShipOrder
{
    public function execute(Order $order, string $tracking): Order
    {
        $order->update(['status' => 'shipped', 'tracking_number' => $tracking, 'shipped_at' => now()]);
        $order->user->notify(new OrderShippedNotification($order));
        return $order->refresh();
    }
}
```

## 3. API Resources

### JsonResource, ResourceCollection, Pagination

```php
<?php declare(strict_types=1);
namespace App\Http\Resources;
use Illuminate\Http\{Request, Resources\Json\JsonResource, Resources\Json\ResourceCollection};

class OrderResource extends JsonResource  /** @mixin \App\Models\Order */
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'status' => $this->status->value,
            'total' => $this->total_cents / 100, 'currency' => $this->currency,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'user' => new UserResource($this->whenLoaded('user')),
            'shipped_at' => $this->when($this->shipped_at, fn () => $this->shipped_at->toIso8601String()),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}

class OrderCollection extends ResourceCollection
{
    public $collects = OrderResource::class;
    public function toArray(Request $request): array { return ['data' => $this->collection]; }
    public function paginationInformation(Request $request, array $paginated): array
    {
        return ['meta' => ['current_page' => $paginated['current_page'],
            'last_page' => $paginated['last_page'], 'per_page' => $paginated['per_page'],
            'total' => $paginated['total']]];
    }
}

// Controller usage
public function index(Request $request): OrderCollection
{
    return new OrderCollection(
        Order::where('user_id', $request->user()->id)->with('items.product')->latest()->paginate(20));
}
```

## 4. Queues & Jobs

### Job Class with handle()

```php
<?php declare(strict_types=1);
namespace App\Jobs;
use App\Models\Order;
use App\Services\PaymentGateway;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\{InteractsWithQueue, SerializesModels, Middleware\WithoutOverlapping};
use Illuminate\{Bus\Queueable, Foundation\Bus\Dispatchable};

class ProcessPayment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    public int $tries = 3;  public int $backoff = 60;  public int $timeout = 120;
    public function __construct(private readonly Order $order) {}
    public function middleware(): array { return [new WithoutOverlapping($this->order->id)]; }
    public function handle(PaymentGateway $gateway): void
    {
        $result = $gateway->charge(amount: $this->order->total_cents, currency: $this->order->currency);
        $this->order->update(['status' => $result->success ? 'paid' : 'failed',
            'payment_ref' => $result->transactionId]);
    }
    public function failed(\Throwable $e): void
    {
        $this->order->update(['status' => 'payment_failed']);
        logger()->error('Payment failed', ['order' => $this->order->id, 'error' => $e->getMessage()]);
    }
}
```

### Dispatching, Batching, Horizon

```php
<?php
use App\Jobs\{ProcessPayment, SendInvoice, UpdateInventory};
use Illuminate\Support\Facades\Bus;

ProcessPayment::dispatch($order);                                // immediate
ProcessPayment::dispatch($order)->delay(now()->addMinutes(5));   // delayed

Bus::batch([new ProcessPayment($order), new SendInvoice($order), new UpdateInventory($order)])
    ->then(fn ($b) => logger()->info("Batch {$b->id} done"))
    ->catch(fn ($b, $e) => logger()->error("Batch failed: {$e->getMessage()}"))
    ->onQueue('orders')->dispatch();

// config/horizon.php — supervisor config
return ['environments' => [
    'production' => ['supervisor-1' => ['maxProcesses' => 10, 'balanceMaxShift' => 1,
        'queue' => ['default', 'orders', 'notifications']]],
    'local' => ['supervisor-1' => ['maxProcesses' => 3,
        'queue' => ['default', 'orders', 'notifications']]],
]];
```

## 5. Sanctum Authentication

### SPA Cookie Setup, Token Controller, Routes

```php
<?php
// config/sanctum.php — stateful domains for cookie-based SPA auth
return ['stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:3000'))];
// config/cors.php
return ['paths' => ['api/*', 'sanctum/csrf-cookie'], 'supports_credentials' => true];
// bootstrap/app.php (Laravel 11+)
->withMiddleware(fn (Middleware $mw) => $mw->statefulApi())
```

```php
<?php declare(strict_types=1);
namespace App\Http\Controllers\Auth;
use App\Models\User;
use Illuminate\Http\{JsonResponse, Request};
use Illuminate\Support\Facades\Hash;

class TokenController
{
    public function store(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email', 'password' => 'required',
            'device_name' => 'required|string']);
        $user = User::where('email', $request->email)->first();
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }
        return response()->json([
            'token' => $user->createToken($request->device_name, ['orders:read', 'orders:write'])->plainTextToken]);
    }
    public function destroy(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Token revoked']);
    }
}

// --- routes/api.php ---
Route::post('/tokens', [TokenController::class, 'store']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $r) => new UserResource($r->user()));
    Route::delete('/tokens', [TokenController::class, 'destroy']);
    Route::apiResource('orders', OrderController::class);
    Route::get('/reports', ReportController::class)->middleware('ability:reports:read');
});
```

## 6. Livewire 3

### Component Lifecycle, Validation, wire:model.live

```php
<?php declare(strict_types=1);
namespace App\Livewire;
use App\Models\Product;
use Livewire\{Attributes\Validate, Component, WithPagination};

class ProductIndex extends Component
{
    use WithPagination;
    #[Validate('nullable|string|max:100')] public string $search = '';
    public string $sortBy = 'created_at';
    public string $sortDir = 'desc';
    public function updatedSearch(): void { $this->resetPage(); }
    public function sort(string $col): void
    {
        $this->sortDir = $this->sortBy === $col && $this->sortDir === 'asc' ? 'desc' : 'asc';
        $this->sortBy = $col;
    }
    public function render()
    {
        return view('livewire.product-index', ['products' => Product::query()
            ->when($this->search, fn ($q) => $q->search($this->search))
            ->orderBy($this->sortBy, $this->sortDir)->paginate(15)]);
    }
}
```

### Form Object, File Upload, Blade Template

```php
<?php declare(strict_types=1);
namespace App\Livewire\Forms;
use App\Models\Product;
use Livewire\{Attributes\Validate, Form};

class ProductForm extends Form
{
    #[Validate('required|string|max:255')]  public string $name = '';
    #[Validate('required|integer|min:1')]   public int $price_cents = 0;
    #[Validate('nullable|image|max:2048')]  public $image = null;
    public function store(): Product
    {
        $this->validate();
        $data = $this->except(['image']);
        if ($this->image) { $data['image_path'] = $this->image->store('products', 'public'); }
        return Product::create($data);
    }
}

// --- Component ---
namespace App\Livewire;
class CreateProduct extends \Livewire\Component
{
    use \Livewire\WithFileUploads;
    public ProductForm $form;
    public function save(): void
    {
        $product = $this->form->store();
        session()->flash('success', 'Product created.');
        $this->redirectRoute('products.show', $product);
    }
    public function render() { return view('livewire.create-product'); }
}
```

```blade
<form wire:submit="save">
    <input wire:model.live.debounce.300ms="form.name" type="text" />
    @error('form.name') <span>{{ $message }}</span> @enderror
    <input wire:model="form.price_cents" type="number" />
    <input wire:model="form.image" type="file" accept="image/*" />
    @if ($form->image) <img src="{{ $form->image->temporaryUrl() }}" width="200" /> @endif
    <div wire:loading wire:target="form.image">Uploading...</div>
    <button type="submit">Create</button>
</form>
```

## 7. Artisan Commands

### Custom Command and Scheduling

```php
<?php declare(strict_types=1);
namespace App\Console\Commands;
use App\Models\Order;
use Illuminate\Console\Command;

class PruneStaleOrders extends Command
{
    protected $signature = 'orders:prune {--days=30} {--dry-run}';
    protected $description = 'Remove unpaid orders older than the retention period';
    public function handle(): int
    {
        $query = Order::where('status', 'pending')
            ->where('created_at', '<', now()->subDays((int) $this->option('days')));
        $count = $query->count();
        if ($count === 0) { $this->info('No stale orders.'); return self::SUCCESS; }
        if ($this->option('dry-run')) { $this->warn("Would delete {$count} orders."); return self::SUCCESS; }
        $this->withProgressBar($query->cursor(), fn (Order $o) => $o->delete());
        $this->newLine();
        $this->info("Deleted {$count} stale orders.");
        return self::SUCCESS;
    }
}

// --- routes/console.php (Laravel 11+) ---
Schedule::command('orders:prune --days=30')->daily()->at('03:00')
    ->withoutOverlapping()->onOneServer()->emailOutputOnFailure('ops@example.com');
Schedule::command('horizon:snapshot')->everyFiveMinutes();
Schedule::job(new CleanTempUploads)->hourly()->environments(['production']);
```

## 8. Testing with Pest

### Feature Tests

```php
<?php declare(strict_types=1);
use App\Models\{Order, User};
uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

describe('Order API', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->actingAs($this->user, 'sanctum');
    });
    it('lists orders for authenticated user', function () {
        Order::factory()->count(3)->create(['user_id' => $this->user->id]);
        Order::factory()->count(2)->create();
        $this->getJson('/api/orders')->assertOk()->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data' => [['id', 'status', 'total']], 'meta' => ['total']]);
    });
    it('creates an order', function () {
        $this->postJson('/api/orders', ['items' => [['product_id' => 1, 'quantity' => 2, 'price_cents' => 1500]]])
            ->assertCreated()->assertJsonPath('data.status', 'pending');
        $this->assertDatabaseHas('orders', ['user_id' => $this->user->id]);
    });
});
```

### Unit Tests and Database Factories

```php
<?php declare(strict_types=1);
use App\{Services\OrderService, Contracts\OrderRepositoryInterface, Models\Order, Models\User};
uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('calculates total from cart items', function () {
    $repo = Mockery::mock(OrderRepositoryInterface::class);
    $repo->shouldReceive('create')->once()->andReturn(new Order(['id' => 1, 'total_cents' => 4500]));
    $order = (new OrderService($repo))->placeOrder(User::factory()->make(),
        [['product_id' => 1, 'quantity' => 3, 'price_cents' => 1500]]);
    expect($order->total_cents)->toBe(4500);
});
it('rolls back on failure', function () {
    $repo = Mockery::mock(OrderRepositoryInterface::class);
    $repo->shouldReceive('create')->andThrow(new \RuntimeException('DB error'));
    expect(fn () => (new OrderService($repo))->placeOrder(User::factory()->make(),
        [['product_id' => 1, 'quantity' => 1, 'price_cents' => 1000]]))->toThrow(\RuntimeException::class);
});
it('filters by status scope', function () {
    Order::factory()->count(2)->create(['status' => 'pending']);
    Order::factory()->shipped()->create();
    expect(Order::where('status', 'pending')->count())->toBe(2)
        ->and(Order::where('status', 'shipped')->count())->toBe(1);
});
it('eager loads without N+1', function () {
    Order::factory()->withItems(5)->count(3)->create();
    $n = 0;
    \DB::listen(function () use (&$n) { $n++; });
    Order::with('items.product')->get();
    expect($n)->toBeLessThanOrEqual(3);
});
```

## 9. Checklist

- [ ] Models declare `$fillable`, `casts()`, and relationships with return types
- [ ] Eager loading (`with()`) used wherever relationships are accessed in loops
- [ ] Business logic lives in services/actions, not controllers or models
- [ ] API responses use JsonResource with conditional attributes (`whenLoaded`)
- [ ] Jobs implement `ShouldQueue`, set `$tries`, `$backoff`, and `failed()`
- [ ] Sanctum guards applied via `auth:sanctum` middleware on API routes
- [ ] Livewire components use Form Objects for validation and data handling
- [ ] Artisan commands return exit codes and support `--dry-run`
- [ ] Pest tests use `RefreshDatabase`, factories, and `expect()` assertions
- [ ] No raw SQL — use Eloquent scopes, query builder, or repository methods