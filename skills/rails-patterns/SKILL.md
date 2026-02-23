---
name: rails-patterns
description: Ruby on Rails development patterns — ActiveRecord, service objects, concerns, Hotwire/Turbo, Action Cable, Sidekiq jobs, RSpec testing, and performance optimization.
---

# Ruby on Rails Development Patterns

Production-grade Rails patterns for modern full-stack applications.

## When to Activate

- Building Rails models with ActiveRecord patterns
- Extracting business logic into service objects
- Using Hotwire (Turbo + Stimulus) for interactive UIs
- Setting up Action Cable WebSocket channels
- Writing background jobs with Sidekiq/ActiveJob
- Testing with RSpec and FactoryBot
- Optimizing N+1 queries and caching

## Core Principles

1. **Convention over configuration** — follow Rails conventions for productivity
2. **Thin controllers, rich models** — but extract complex logic to service objects
3. **Concerns for shared behavior** — DRY with `ActiveSupport::Concern`
4. **Hotwire by default** — minimal JavaScript with Turbo and Stimulus
5. **Test everything** — RSpec for confidence, factories over fixtures

## ActiveRecord Patterns

### Scopes and Queries

```ruby
class Order < ApplicationRecord
  belongs_to :user
  has_many :line_items, dependent: :destroy

  scope :pending, -> { where(status: :pending) }
  scope :recent, -> { where("created_at > ?", 30.days.ago) }
  scope :high_value, -> { where("total_cents > ?", 100_00) }
  scope :for_user, ->(user) { where(user: user) }

  enum :status, { pending: 0, confirmed: 1, shipped: 2, cancelled: 3 }

  validates :total_cents, presence: true, numericality: { greater_than: 0 }

  def total
    Money.new(total_cents, currency)
  end
end

# Composable query
Order.pending.recent.high_value.includes(:line_items)
```

### Callbacks (Use Sparingly)

```ruby
class User < ApplicationRecord
  before_validation :normalize_email
  after_create_commit :send_welcome_email
  after_update_commit :broadcast_changes

  private

  def normalize_email
    self.email = email&.downcase&.strip
  end

  def send_welcome_email
    UserMailer.welcome(self).deliver_later
  end

  def broadcast_changes
    broadcast_replace_to "user_#{id}", partial: "users/user"
  end
end
```

### Associations

```ruby
class Project < ApplicationRecord
  has_many :memberships, dependent: :destroy
  has_many :members, through: :memberships, source: :user
  has_many :tasks, dependent: :destroy

  has_one :settings, class_name: "ProjectSettings", dependent: :destroy

  # Counter cache for performance
  belongs_to :organization, counter_cache: true

  # Polymorphic
  has_many :comments, as: :commentable, dependent: :destroy
end
```

## Service Objects

### PORO Pattern

```ruby
class Orders::PlaceOrder
  def initialize(user:, cart:, payment_method:)
    @user = user
    @cart = cart
    @payment_method = payment_method
  end

  def call
    ActiveRecord::Base.transaction do
      order = create_order
      process_payment(order)
      clear_cart
      notify_user(order)
      Result.new(success: true, order: order)
    end
  rescue PaymentError => e
    Result.new(success: false, error: e.message)
  end

  private

  attr_reader :user, :cart, :payment_method

  def create_order
    Order.create!(
      user: user,
      line_items: cart.items.map { |item| LineItem.new(item.attributes) },
      total_cents: cart.total_cents
    )
  end

  def process_payment(order)
    PaymentGateway.charge(
      amount: order.total_cents,
      method: payment_method,
      idempotency_key: "order-#{order.id}"
    )
  end

  def clear_cart = cart.clear!
  def notify_user(order) = OrderMailer.confirmation(order).deliver_later
end

# Usage
result = Orders::PlaceOrder.new(user:, cart:, payment_method:).call
if result.success?
  redirect_to result.order
else
  flash.now[:alert] = result.error
end
```

### Result Object

```ruby
class Result
  attr_reader :value, :error

  def initialize(success:, value: nil, error: nil, **extra)
    @success = success
    @value = value
    @error = error
    extra.each { |k, v| define_singleton_method(k) { v } }
  end

  def success? = @success
  def failure? = !@success
end
```

## Controllers

### RESTful Pattern

```ruby
class OrdersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_order, only: %i[show update destroy]

  def index
    @orders = authorize_scope(Order.all)
      .includes(:line_items)
      .order(created_at: :desc)
      .page(params[:page])
  end

  def create
    result = Orders::PlaceOrder.new(
      user: current_user,
      cart: current_cart,
      payment_method: order_params[:payment_method]
    ).call

    if result.success?
      redirect_to result.order, notice: "Order placed successfully"
    else
      flash.now[:alert] = result.error
      render :new, status: :unprocessable_entity
    end
  end

  private

  def set_order
    @order = authorize(current_user.orders.find(params[:id]))
  end

  def order_params
    params.require(:order).permit(:payment_method, :shipping_address_id)
  end
end
```

## Concerns

### Model Concern

```ruby
module Searchable
  extend ActiveSupport::Concern

  included do
    scope :search, ->(query) {
      return all if query.blank?
      # Column names from search_columns are developer-defined, not user input
      conditions = search_columns.map { |c| "#{c} ILIKE :q" }.join(' OR ')
      where(conditions, q: "%#{sanitize_sql_like(query)}%")
    }
  end

  class_methods do
    def search_columns
      raise NotImplementedError, "Define search_columns in #{name}"
    end
  end
end

class Product < ApplicationRecord
  include Searchable

  def self.search_columns = %w[name description sku]
end
```

## Hotwire / Turbo

### Turbo Frames

```erb
<%# app/views/tasks/index.html.erb %>
<%= turbo_frame_tag "tasks" do %>
  <% @tasks.each do |task| %>
    <%= render task %>
  <% end %>
<% end %>

<%# app/views/tasks/_task.html.erb %>
<%= turbo_frame_tag dom_id(task) do %>
  <div class="task">
    <span><%= task.title %></span>
    <%= link_to "Edit", edit_task_path(task) %>
  </div>
<% end %>
```

### Turbo Streams

```ruby
# app/controllers/tasks_controller.rb
def create
  @task = current_user.tasks.build(task_params)

  if @task.save
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to tasks_path }
    end
  else
    render :new, status: :unprocessable_entity
  end
end
```

```erb
<%# app/views/tasks/create.turbo_stream.erb %>
<%= turbo_stream.prepend "tasks", @task %>
<%= turbo_stream.update "task_form" do %>
  <%= render "form", task: Task.new %>
<% end %>
```

### Stimulus Controller

```javascript
// app/javascript/controllers/toggle_controller.js
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["content"]
  static values = { open: { type: Boolean, default: false } }

  toggle() {
    this.openValue = !this.openValue
  }

  openValueChanged() {
    this.contentTarget.classList.toggle("hidden", !this.openValue)
  }
}
```

## Background Jobs

### Sidekiq with ActiveJob

```ruby
class OrderProcessingJob < ApplicationJob
  queue_as :default
  retry_on StandardError, wait: :polynomially_longer, attempts: 5
  discard_on ActiveRecord::RecordNotFound

  def perform(order_id)
    order = Order.find(order_id)
    Orders::ProcessOrder.new(order: order).call
  end
end

# Enqueue
OrderProcessingJob.perform_later(order.id)
OrderProcessingJob.set(wait: 5.minutes).perform_later(order.id)
```

### Periodic Jobs

```ruby
# config/initializers/sidekiq.rb
Sidekiq.configure_server do |config|
  config.on(:startup) do
    Sidekiq::Cron::Job.create(
      name: "daily-cleanup",
      cron: "0 3 * * *",
      class: "CleanupJob"
    )
  end
end
```

## Testing with RSpec

### Model Specs

```ruby
RSpec.describe Order, type: :model do
  describe "validations" do
    it { is_expected.to validate_presence_of(:total_cents) }
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_many(:line_items).dependent(:destroy) }
  end

  describe "scopes" do
    let!(:pending_order) { create(:order, :pending) }
    let!(:shipped_order) { create(:order, :shipped) }

    it "returns only pending orders" do
      expect(Order.pending).to contain_exactly(pending_order)
    end
  end
end
```

### Request Specs

```ruby
RSpec.describe "Orders API", type: :request do
  let(:user) { create(:user) }

  before { sign_in user }

  describe "POST /orders" do
    let(:cart) { create(:cart, :with_items, user: user) }

    it "creates an order" do
      post orders_path, params: {
        order: { payment_method: "credit_card" }
      }

      expect(response).to redirect_to(Order.last)
      expect(Order.count).to eq(1)
    end
  end
end
```

### Factories

```ruby
FactoryBot.define do
  factory :order do
    association :user
    total_cents { 99_99 }
    status { :pending }

    trait :confirmed do
      status { :confirmed }
    end

    trait :with_items do
      after(:create) do |order|
        create_list(:line_item, 3, order: order)
      end
    end
  end
end
```

## Performance

### N+1 Prevention

```ruby
# config/environments/development.rb
config.after_initialize do
  Bullet.enable = true
  Bullet.alert = true
  Bullet.rails_logger = true
end

# Controller — eager load
@orders = Order.includes(:user, line_items: :product)
               .references(:user)
               .order(created_at: :desc)
```

### Caching

```ruby
# Fragment caching
<% cache @product do %>
  <%= render partial: "product_card", locals: { product: @product } %>
<% end %>

# Russian doll caching
<% cache [current_user, @products.maximum(:updated_at)] do %>
  <% @products.each do |product| %>
    <% cache product do %>
      <%= render product %>
    <% end %>
  <% end %>
<% end %>

# Low-level caching
Rails.cache.fetch("stats/dashboard", expires_in: 15.minutes) do
  { orders: Order.count, revenue: Order.sum(:total_cents) }
end
```

## Checklist

- [ ] Models use scopes for reusable queries
- [ ] Complex logic extracted to service objects
- [ ] Controllers are thin with strong params
- [ ] N+1 queries caught by Bullet gem
- [ ] Background jobs are idempotent with retry strategy
- [ ] Turbo Frames/Streams used for dynamic UI updates
- [ ] RSpec specs cover models, requests, and key flows
- [ ] Caching applied for expensive queries
