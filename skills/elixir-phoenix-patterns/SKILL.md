---
name: elixir-phoenix-patterns
description: Elixir and Phoenix patterns — OTP (GenServer, Supervision), Phoenix Channels, LiveView, Ecto, pipe operator, pattern matching, and ExUnit testing for fault-tolerant real-time applications.
---
# Elixir / Phoenix Development Patterns
Production-grade patterns for fault-tolerant, real-time applications with Elixir and Phoenix.
## When to Activate
- Writing Elixir modules with pattern matching and pipes
- Designing OTP GenServers and supervision trees
- Building real-time features with Phoenix Channels or Presence
- Creating interactive UIs with Phoenix LiveView
- Working with Ecto schemas, changesets, and transactions
- Writing ExUnit tests for controllers, channels, or LiveView
## Core Principles
1. **Let it crash** — supervisors restart failed processes; don't over-defend
2. **Immutable data, explicit state** — data flows through pipes; GenServer owns mutable state
3. **Pattern match everything** — function heads, case, with — replace conditionals with clauses
4. **Small, focused processes** — one GenServer per concern; supervise as a tree
5. **Contracts via behaviours** — define callbacks, implement in modules, swap in tests

---
## 1. Elixir Fundamentals
### Pattern Matching in Function Heads
```elixir
defmodule Greeter do
  def hello(%{name: name, role: :admin}), do: "Welcome back, admin #{name}!"
  def hello(%{name: name}), do: "Hello, #{name}."
  def hello(_), do: "Hello, stranger."
end
```
### Pipe Operator |>
```elixir
def total(items) do
  items
  |> Enum.filter(& &1.in_stock)
  |> Enum.map(& &1.price)
  |> Enum.sum()
  |> apply_tax(0.08)
end
defp apply_tax(subtotal, rate), do: subtotal * (1 + rate)
```
### `with` for Chained Fallible Operations
```elixir
def create_account(params) do
  with {:ok, user}  <- Accounts.register(params),
       {:ok, token} <- Token.generate(user),
       {:ok, _}     <- Mailer.send_welcome(user, token) do
    {:ok, user}
  else
    {:error, %Ecto.Changeset{} = cs} -> {:error, :validation, cs}
    {:error, reason} -> {:error, reason}
  end
end
```
### Immutable Data and Map Updates
```elixir
defmodule Cart do
  defstruct items: [], coupon: nil
  def add_item(%Cart{items: items} = cart, item), do: %{cart | items: [item | items]}
  def apply_coupon(cart, code), do: Map.put(cart, :coupon, code)
  def item_count(%Cart{items: items}), do: length(items)
end
```

---
## 2. OTP -- GenServer
### Basic GenServer (init, call, cast, info)
```elixir
defmodule MyApp.Counter do
  use GenServer
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, Keyword.get(opts, :initial, 0), name: Keyword.get(opts, :name, __MODULE__))
  end
  def increment(pid \\ __MODULE__), do: GenServer.cast(pid, :increment)
  def value(pid \\ __MODULE__), do: GenServer.call(pid, :value)

  @impl true
  def init(initial) when is_integer(initial) do
    Process.send_after(self(), :report, 60_000)
    {:ok, initial}
  end
  @impl true
  def handle_call(:value, _from, count), do: {:reply, count, count}
  @impl true
  def handle_cast(:increment, count), do: {:noreply, count + 1}
  @impl true
  def handle_info(:report, count) do
    IO.puts("Current count: #{count}")
    Process.send_after(self(), :report, 60_000)
    {:noreply, count}
  end
end
```
### Rate Limiter GenServer
```elixir
defmodule MyApp.RateLimiter do
  use GenServer
  @max_requests 100
  @window_ms 60_000
  defstruct requests: %{}, timer_ref: nil
  def start_link(opts), do: GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  def allow?(client_id), do: GenServer.call(__MODULE__, {:check, client_id})

  @impl true
  def init(_opts), do: {:ok, %__MODULE__{timer_ref: Process.send_after(self(), :reset, @window_ms)}}
  @impl true
  def handle_call({:check, client_id}, _from, state) do
    count = Map.get(state.requests, client_id, 0)
    if count < @max_requests do
      {:reply, :ok, %{state | requests: Map.update(state.requests, client_id, 1, &(&1 + 1))}}
    else
      {:reply, {:error, :rate_limited}, state}
    end
  end
  @impl true
  def handle_info(:reset, state) do
    {:noreply, %{state | requests: %{}, timer_ref: Process.send_after(self(), :reset, @window_ms)}}
  end
end
```
### Registry and via_tuple Naming
```elixir
defmodule MyApp.Session do
  use GenServer
  def start_link(user_id), do: GenServer.start_link(__MODULE__, user_id, name: via(user_id))
  def fetch(user_id), do: GenServer.call(via(user_id), :fetch)
  defp via(user_id), do: {:via, Registry, {MyApp.SessionRegistry, user_id}}
  @impl true
  def init(user_id), do: {:ok, %{user_id: user_id, started_at: DateTime.utc_now()}}
  @impl true
  def handle_call(:fetch, _from, state), do: {:reply, state, state}
end
# Children: {Registry, keys: :unique, name: MyApp.SessionRegistry}
```

---
## 3. OTP -- Supervision
### Supervisor Strategies
```elixir
# one_for_one  — restart only the crashed child
# rest_for_one — restart crashed child + all started after it
# one_for_all  — restart every child if one crashes
defmodule MyApp.MainSupervisor do
  use Supervisor
  def start_link(arg), do: Supervisor.start_link(__MODULE__, arg, name: __MODULE__)
  @impl true
  def init(_arg) do
    children = [
      {Registry, keys: :unique, name: MyApp.SessionRegistry},
      {MyApp.RateLimiter, []},
      {MyApp.Counter, initial: 0},
      {MyApp.SessionSupervisor, []}
    ]
    Supervisor.init(children, strategy: :one_for_one)
  end
end
```
### DynamicSupervisor for Dynamic Children
```elixir
defmodule MyApp.SessionSupervisor do
  use DynamicSupervisor
  def start_link(opts), do: DynamicSupervisor.start_link(__MODULE__, opts, name: __MODULE__)
  @impl true
  def init(_opts), do: DynamicSupervisor.init(strategy: :one_for_one, max_children: 200)
  def start_session(user_id), do: DynamicSupervisor.start_child(__MODULE__, {MyApp.Session, user_id})
  def stop_session(user_id) do
    case Registry.lookup(MyApp.SessionRegistry, user_id) do
      [{pid, _}] -> DynamicSupervisor.terminate_child(__MODULE__, pid)
      [] -> {:error, :not_found}
    end
  end
end
```
### Application Module Startup
```elixir
defmodule MyApp.Application do
  use Application
  @impl true
  def start(_type, _args) do
    children = [MyApp.Repo, {Phoenix.PubSub, name: MyApp.PubSub}, MyApp.MainSupervisor, MyAppWeb.Endpoint]
    Supervisor.start_link(children, strategy: :one_for_one, name: MyApp.AppSupervisor)
  end
end
```

---
## 4. Phoenix Channels
### Channel with Auth, Messaging, and Presence
```elixir
defmodule MyAppWeb.RoomChannel do
  use MyAppWeb, :channel
  alias MyAppWeb.Presence
  @impl true
  def join("room:" <> room_id, %{"token" => token}, socket) do
    case MyApp.Accounts.verify_token(token) do
      {:ok, user_id} ->
        send(self(), :after_join)
        {:ok, assign(socket, room_id: room_id, user_id: user_id)}
      {:error, _} -> {:error, %{reason: "unauthorized"}}
    end
  end
  @impl true
  def handle_info(:after_join, socket) do
    Presence.track(socket, socket.assigns.user_id, %{online_at: System.system_time(:second)})
    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end
  @impl true
  def handle_in("new_msg", %{"body" => body}, socket) do
    broadcast!(socket, "new_msg", %{body: body, user_id: socket.assigns.user_id})
    {:noreply, socket}
  end
  @impl true
  def handle_in("typing", _payload, socket) do
    broadcast_from!(socket, "typing", %{user_id: socket.assigns.user_id})
    {:noreply, socket}
  end
end
```
### Client-Side Socket (JavaScript)
```javascript
import { Socket, Presence } from "phoenix";
const socket = new Socket("/socket", { params: { token: window.userToken } });
socket.connect();
const channel = socket.channel(`room:${roomId}`, { token: window.userToken });
let presences = {};
channel.on("presence_state", (s) => { presences = Presence.syncState(presences, s); });
channel.on("presence_diff", (d) => { presences = Presence.syncDiff(presences, d); });
channel.on("new_msg", (msg) => appendMessage(msg));
channel.join()
  .receive("ok", () => console.log("Joined"))
  .receive("error", (r) => console.error("Join failed", r));
```

---
## 5. Phoenix LiveView
### Mount, Events, and Render
```elixir
defmodule MyAppWeb.DashboardLive do
  use MyAppWeb, :live_view
  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket), do: :timer.send_interval(5_000, :refresh)
    {:ok, assign(socket, stats: MyApp.Stats.summary())}
  end
  @impl true
  def handle_event("refresh", _params, socket),
    do: {:noreply, assign(socket, stats: MyApp.Stats.summary())}
  @impl true
  def handle_info(:refresh, socket),
    do: {:noreply, assign(socket, stats: MyApp.Stats.summary())}
  @impl true
  def render(assigns) do
    ~H"""
    <h1>Dashboard</h1>
    <button phx-click="refresh">Refresh</button>
    <.stat_card label="Users" value={@stats.users} />
    <.stat_card label="Revenue" value={@stats.revenue} />
    """
  end
  defp stat_card(assigns) do
    ~H"""
    <div class="stat-card">
      <span><%= @label %></span><span><%= @value %></span>
    </div>
    """
  end
end
```
### Form with Changeset
```elixir
defmodule MyAppWeb.UserFormLive do
  use MyAppWeb, :live_view
  alias MyApp.Accounts
  alias MyApp.Accounts.User
  @impl true
  def mount(_params, _session, socket),
    do: {:ok, assign(socket, form: to_form(Accounts.change_user(%User{})))}
  @impl true
  def handle_event("validate", %{"user" => params}, socket) do
    changeset = %User{} |> Accounts.change_user(params) |> Map.put(:action, :validate)
    {:noreply, assign(socket, form: to_form(changeset))}
  end
  @impl true
  def handle_event("save", %{"user" => params}, socket) do
    case Accounts.create_user(params) do
      {:ok, user} -> {:noreply, socket |> put_flash(:info, "Created!") |> redirect(to: ~p"/users/#{user}")}
      {:error, cs} -> {:noreply, assign(socket, form: to_form(cs))}
    end
  end
  @impl true
  def render(assigns) do
    ~H"""
    <.simple_form for={@form} phx-change="validate" phx-submit="save">
      <.input field={@form[:name]} label="Name" />
      <.input field={@form[:email]} type="email" label="Email" />
      <:actions><.button>Save</.button></:actions>
    </.simple_form>
    """
  end
end
```
### Live Component
```elixir
defmodule MyAppWeb.NotificationComponent do
  use MyAppWeb, :live_component
  @impl true
  def update(assigns, socket), do: {:ok, assign(socket, assigns)}
  @impl true
  def handle_event("dismiss", _params, socket) do
    send(self(), {:dismissed, socket.assigns.id})
    {:noreply, socket}
  end
  @impl true
  def render(assigns) do
    ~H"""
    <div id={@id} class={"notification #{@level}"}>
      <p><%= @message %></p>
      <button phx-click="dismiss" phx-target={@myself}>Dismiss</button>
    </div>
    """
  end
end
```
### JavaScript Hooks (phx-hook)
```javascript
const Hooks = {};
Hooks.InfiniteScroll = {
  mounted() {
    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) this.pushEvent("load-more", {});
    });
    this.observer.observe(this.el);
  },
  destroyed() { this.observer.disconnect(); },
};
export default Hooks;
// app.js: let liveSocket = new LiveSocket("/live", Socket, { hooks: Hooks })
// HEEx:  <div id="sentinel" phx-hook="InfiniteScroll"></div>
```

---
## 6. Ecto
### Schema and Changeset with Validations
```elixir
defmodule MyApp.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset
  schema "users" do
    field :name, :string
    field :email, :string
    field :role, Ecto.Enum, values: [:user, :admin], default: :user
    field :password, :string, virtual: true, redact: true
    field :password_hash, :string, redact: true
    has_many :orders, MyApp.Orders.Order
    belongs_to :organization, MyApp.Organizations.Org
    timestamps()
  end
  def registration_changeset(user, attrs) do
    user
    |> cast(attrs, [:name, :email, :password])
    |> validate_required([:name, :email, :password])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+\.[^\s]+$/)
    |> validate_length(:password, min: 12, max: 72)
    |> unique_constraint(:email) |> hash_password()
  end
  defp hash_password(changeset) do
    case get_change(changeset, :password) do
      nil -> changeset
      pw -> put_change(changeset, :password_hash, Bcrypt.hash_pwd_salt(pw))
    end
  end
end
```
### Ecto.Multi for Transactions
```elixir
def place_order(user, cart_items, payment_method) do
  alias Ecto.Multi
  Multi.new()
  |> Multi.insert(:order, Order.changeset(%Order{}, %{user_id: user.id, status: :pending}))
  |> Multi.run(:line_items, fn repo, %{order: order} ->
    now = DateTime.utc_now()
    items = Enum.map(cart_items, &%{order_id: order.id, product_id: &1.product_id, qty: &1.qty, inserted_at: now, updated_at: now})
    {:ok, elem(repo.insert_all(LineItem, items), 0)}
  end)
  |> Multi.run(:inventory, fn _repo, _ -> Inventory.reserve(cart_items) end)
  |> Multi.run(:payment, fn _repo, %{order: order} -> charge(order, payment_method) end)
  |> Repo.transaction()
  |> case do
    {:ok, %{order: order}} -> {:ok, order}
    {:error, step, reason, _} -> {:error, step, reason}
  end
end
```
### Preloading Associations
```elixir
import Ecto.Query
# Join-preload (single query)
def list_orders_with_items do
  from(o in Order, as: :order)
  |> join(:left, [order: o], li in assoc(o, :line_items), as: :items)
  |> preload([items: li], line_items: li)
  |> Repo.all()
end
# Separate-query preload
def get_order!(id), do: Order |> Repo.get!(id) |> Repo.preload([:user, line_items: :product])
```

---
## 7. Testing
### ExUnit Setup
```elixir
# test/test_helper.exs
ExUnit.start()
Ecto.Adapters.SQL.Sandbox.mode(MyApp.Repo, :manual)
```
### ConnTest for Controllers
```elixir
defmodule MyAppWeb.OrderControllerTest do
  use MyAppWeb.ConnCase, async: true
  import MyApp.AccountsFixtures
  import MyApp.OrdersFixtures
  setup %{conn: conn} do
    user = user_fixture()
    %{conn: log_in_user(conn, user), user: user}
  end
  test "lists orders", %{conn: conn, user: user} do
    order = order_fixture(user_id: user.id)
    conn = get(conn, ~p"/orders")
    assert html_response(conn, 200) =~ "#{order.id}"
  end
  test "redirects unauthenticated" do
    assert get(build_conn(), ~p"/orders") |> redirected_to() == ~p"/login"
  end
end
```
### ChannelCase
```elixir
defmodule MyAppWeb.RoomChannelTest do
  use MyAppWeb.ChannelCase, async: true
  import MyApp.AccountsFixtures
  setup do
    user = user_fixture()
    token = MyApp.Accounts.generate_token(user)
    {:ok, socket} = connect(MyAppWeb.UserSocket, %{"token" => token})
    %{socket: socket, user: user, token: token}
  end
  test "joins with valid token", %{socket: socket, token: token} do
    assert {:ok, _, _} = subscribe_and_join(socket, "room:lobby", %{"token" => token})
  end
  test "rejects invalid token", %{socket: socket} do
    assert {:error, %{reason: "unauthorized"}} =
             subscribe_and_join(socket, "room:lobby", %{"token" => "bad"})
  end
  test "broadcasts messages", %{socket: socket, token: token} do
    {:ok, _, socket} = subscribe_and_join(socket, "room:lobby", %{"token" => token})
    push(socket, "new_msg", %{"body" => "hello"})
    assert_broadcast "new_msg", %{body: "hello"}
  end
end
```
### DataCase with Sandbox
```elixir
defmodule MyApp.AccountsTest do
  use MyApp.DataCase, async: true
  alias MyApp.Accounts
  @valid_attrs %{name: "Ada", email: "ada@example.com", password: "secure_password!"}
  test "creates user with valid attrs" do
    assert {:ok, user} = Accounts.create_user(@valid_attrs)
    assert user.email == "ada@example.com"
  end
  test "rejects duplicate email" do
    {:ok, _} = Accounts.create_user(@valid_attrs)
    assert {:error, cs} = Accounts.create_user(@valid_attrs)
    assert "has already been taken" in errors_on(cs).email
  end
  test "rejects short password" do
    assert {:error, cs} = Accounts.create_user(%{@valid_attrs | password: "short"})
    assert "should be at least 12 character(s)" in errors_on(cs).password
  end
end
```

---

## 8. Checklist
- [ ] Functions use pattern matching in heads instead of internal conditionals
- [ ] Data transforms use pipe chains; no nested function calls
- [ ] Fallible multi-step logic uses `with`; else clauses handle each error shape
- [ ] GenServers expose a client API; callbacks are `@impl true`
- [ ] Supervision tree uses the narrowest restart strategy needed
- [ ] DynamicSupervisor manages processes created at runtime
- [ ] Channel `join/3` verifies auth before accepting the connection
- [ ] Presence tracked in `handle_info(:after_join, ...)`
- [ ] LiveView mounts are fast; expensive work deferred to `connected?/1` branch
- [ ] Forms use changesets with `phx-change` for validation and `phx-submit` for save
- [ ] Ecto schemas define changesets with cast, validate, and constraint checks
- [ ] Multi-step DB writes use `Ecto.Multi` inside `Repo.transaction/1`
- [ ] Associations are preloaded explicitly; no lazy loading in templates
- [ ] Tests use `async: true` with Ecto SQL Sandbox for parallel execution
