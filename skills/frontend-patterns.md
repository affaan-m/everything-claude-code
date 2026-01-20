---
name: frontend-patterns
description: Frontend development patterns for Odoo 15 using OWL framework, QWeb templates, services, hooks, and registries.
---

# Odoo 15 Frontend Development Patterns

Modern frontend patterns for Odoo 15 using OWL (Odoo Web Library), QWeb templates, and the JavaScript framework.

## OWL Component Patterns

### Basic Component Structure

```javascript
/** @odoo-module **/

import { Component, useState, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

export class MyComponent extends Component {
    setup() {
        // State management
        this.state = useState({
            count: 0,
            items: [],
            loading: false,
        });

        // Service injection
        this.rpc = useService("rpc");
        this.notification = useService("notification");
        this.orm = useService("orm");

        // Lifecycle hooks
        onMounted(() => {
            this.loadData();
        });
    }

    async loadData() {
        this.state.loading = true;
        try {
            this.state.items = await this.orm.searchRead(
                "res.partner",
                [["is_company", "=", true]],
                ["name", "email"]
            );
        } catch (error) {
            this.notification.add("Failed to load data", { type: "danger" });
        } finally {
            this.state.loading = false;
        }
    }

    increment() {
        this.state.count++;
    }
}

MyComponent.template = "my_module.MyComponent";
MyComponent.props = {
    title: { type: String, optional: true },
    onSave: { type: Function, optional: true },
};
```

### Component Template (QWeb)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<templates xml:space="preserve">
    <t t-name="my_module.MyComponent">
        <div class="o_my_component">
            <h3 t-if="props.title" t-esc="props.title"/>

            <div t-if="state.loading" class="o_loading">
                <i class="fa fa-spinner fa-spin"/> Loading...
            </div>

            <div t-else="">
                <p>Count: <t t-esc="state.count"/></p>
                <button class="btn btn-primary" t-on-click="increment">
                    Increment
                </button>

                <ul t-if="state.items.length">
                    <t t-foreach="state.items" t-as="item" t-key="item.id">
                        <li>
                            <span t-esc="item.name"/>
                            <span t-if="item.email" class="text-muted">
                                (<t t-esc="item.email"/>)
                            </span>
                        </li>
                    </t>
                </ul>
                <p t-else="" class="text-muted">No items found</p>
            </div>
        </div>
    </t>
</templates>
```

## OWL Hooks

### useState - Reactive State

```javascript
import { useState } from "@odoo/owl";

setup() {
    // Simple state
    this.state = useState({
        value: "",
        items: [],
        isOpen: false,
    });

    // Nested state (reactive at all levels)
    this.formData = useState({
        partner: {
            name: "",
            email: "",
            address: {
                street: "",
                city: "",
            },
        },
    });
}

// State updates are reactive
updateName(name) {
    this.state.formData.partner.name = name;  // Triggers re-render
}
```

### useRef - DOM References

```javascript
import { useRef, onMounted } from "@odoo/owl";

setup() {
    this.inputRef = useRef("input");
    this.containerRef = useRef("container");

    onMounted(() => {
        // Access DOM element after mount
        if (this.inputRef.el) {
            this.inputRef.el.focus();
        }
    });
}

// In template: <input t-ref="input"/>
```

### useService - Service Injection

```javascript
import { useService } from "@web/core/utils/hooks";

setup() {
    // Core services
    this.rpc = useService("rpc");
    this.orm = useService("orm");
    this.notification = useService("notification");
    this.dialog = useService("dialog");
    this.user = useService("user");
    this.router = useService("router");
    this.action = useService("action");
    this.company = useService("company");
}

async fetchData() {
    // Using ORM service
    const partners = await this.orm.searchRead(
        "res.partner",
        [["customer_rank", ">", 0]],
        ["name", "email", "phone"],
        { limit: 10, order: "name" }
    );

    // Using RPC service for custom endpoints
    const result = await this.rpc("/my_module/api/custom_action", {
        params: { id: 1 },
    });
}
```

### useBus - Event Bus Communication

```javascript
import { useBus } from "@web/core/utils/hooks";

setup() {
    // Subscribe to bus events
    useBus(this.env.bus, "PARTNER_UPDATED", (ev) => {
        this.onPartnerUpdated(ev.detail);
    });

    useBus(this.env.bus, "RELOAD_DATA", () => {
        this.loadData();
    });
}

// Trigger event from another component
this.env.bus.trigger("PARTNER_UPDATED", { partnerId: 42 });
```

### Lifecycle Hooks

```javascript
import {
    onWillStart,
    onMounted,
    onWillUpdateProps,
    onWillUnmount,
    onError,
} from "@odoo/owl";

setup() {
    // Before component starts (async allowed)
    onWillStart(async () => {
        this.initialData = await this.loadInitialData();
    });

    // After component is mounted to DOM
    onMounted(() => {
        this.setupEventListeners();
        _logger.debug("Component mounted");
    });

    // When props are about to change
    onWillUpdateProps((nextProps) => {
        if (nextProps.partnerId !== this.props.partnerId) {
            this.loadPartner(nextProps.partnerId);
        }
    });

    // Before component is destroyed
    onWillUnmount(() => {
        this.cleanupEventListeners();
    });

    // Error handling
    onError((error) => {
        _logger.error("Component error:", error);
        this.notification.add("An error occurred", { type: "danger" });
    });
}
```

## QWeb Template Directives

### Conditionals

```xml
<!-- t-if, t-elif, t-else -->
<div t-if="state.status === 'draft'" class="badge badge-secondary">Draft</div>
<div t-elif="state.status === 'confirmed'" class="badge badge-success">Confirmed</div>
<div t-else="" class="badge badge-danger">Unknown</div>

<!-- Ternary in attributes -->
<div t-att-class="state.isActive ? 'active' : 'inactive'"/>
```

### Loops

```xml
<!-- t-foreach with t-key (required for performance) -->
<t t-foreach="state.items" t-as="item" t-key="item.id">
    <div class="item">
        <span t-esc="item.name"/>
        <!-- Loop variables: item_index, item_first, item_last, item_odd, item_even -->
        <span t-if="item_first" class="badge">First</span>
        <span class="index" t-esc="item_index"/>
    </div>
</t>

<!-- Object iteration -->
<t t-foreach="Object.entries(state.data)" t-as="entry" t-key="entry[0]">
    <div>
        <strong t-esc="entry[0]"/>: <span t-esc="entry[1]"/>
    </div>
</t>
```

### Output

```xml
<!-- Escaped output (safe) -->
<span t-esc="state.userName"/>

<!-- Raw HTML (use with caution, XSS risk) -->
<div t-out="state.htmlContent"/>

<!-- Attribute binding -->
<div t-att-id="'item_' + item.id"
     t-att-class="{'active': state.isActive, 'disabled': !state.isEnabled}"
     t-att-data-id="item.id"/>

<!-- Multiple attributes from object -->
<div t-att="{'id': item.id, 'data-name': item.name}"/>
```

### Events

```xml
<!-- Click handler -->
<button t-on-click="onButtonClick">Click me</button>

<!-- With parameters -->
<button t-on-click="() => this.selectItem(item.id)">Select</button>

<!-- Event modifiers -->
<form t-on-submit.prevent="onSubmit">
    <input t-on-keydown.enter="onEnter"/>
    <button t-on-click.stop="onClick">Stop propagation</button>
</form>

<!-- Input binding -->
<input type="text"
       t-att-value="state.searchQuery"
       t-on-input="(ev) => this.state.searchQuery = ev.target.value"/>
```

### Component Slots

```xml
<!-- Parent component -->
<MyCard>
    <t t-set-slot="header">
        <h3>Card Title</h3>
    </t>
    <t t-set-slot="body">
        <p>Card content goes here</p>
    </t>
    <t t-set-slot="footer">
        <button class="btn btn-primary">Save</button>
    </t>
</MyCard>

<!-- MyCard template -->
<t t-name="my_module.MyCard">
    <div class="card">
        <div class="card-header">
            <t t-slot="header"/>
        </div>
        <div class="card-body">
            <t t-slot="body"/>
        </div>
        <div class="card-footer">
            <t t-slot="footer"/>
        </div>
    </div>
</t>
```

### Sub-templates

```xml
<!-- Define reusable template -->
<t t-name="my_module.PartnerBadge">
    <span t-att-class="'badge badge-' + (partner.is_company ? 'primary' : 'secondary')">
        <i t-att-class="partner.is_company ? 'fa fa-building' : 'fa fa-user'"/>
        <t t-esc="partner.name"/>
    </span>
</t>

<!-- Call sub-template -->
<t t-call="my_module.PartnerBadge">
    <t t-set="partner" t-value="state.selectedPartner"/>
</t>
```

## Services

### ORM Service

```javascript
setup() {
    this.orm = useService("orm");
}

async crudOperations() {
    // Search and read
    const partners = await this.orm.searchRead(
        "res.partner",
        [["customer_rank", ">", 0]],
        ["name", "email"],
        { limit: 10, offset: 0, order: "name ASC" }
    );

    // Search (returns IDs only)
    const partnerIds = await this.orm.search(
        "res.partner",
        [["is_company", "=", true]]
    );

    // Read specific records
    const records = await this.orm.read(
        "res.partner",
        [1, 2, 3],
        ["name", "email"]
    );

    // Create
    const newId = await this.orm.create("res.partner", {
        name: "New Partner",
        email: "new@example.com",
    });

    // Write (update)
    await this.orm.write("res.partner", [newId], {
        phone: "+1234567890",
    });

    // Unlink (delete)
    await this.orm.unlink("res.partner", [newId]);

    // Call method
    const result = await this.orm.call(
        "res.partner",
        "action_archive",
        [[partnerId]]
    );

    // Search count
    const count = await this.orm.searchCount(
        "res.partner",
        [["customer_rank", ">", 0]]
    );
}
```

### Notification Service

```javascript
setup() {
    this.notification = useService("notification");
}

showNotifications() {
    // Success notification
    this.notification.add("Record saved successfully", {
        type: "success",
        sticky: false,
    });

    // Warning notification
    this.notification.add("Please review the data", {
        type: "warning",
        sticky: true,
    });

    // Error notification
    this.notification.add("Failed to save record", {
        type: "danger",
        sticky: true,
    });

    // Info with custom title
    this.notification.add("New message received", {
        title: "Notification",
        type: "info",
    });
}
```

### Dialog Service

```javascript
setup() {
    this.dialog = useService("dialog");
}

async showDialogs() {
    // Confirmation dialog
    this.dialog.add(ConfirmationDialog, {
        title: "Confirm Delete",
        body: "Are you sure you want to delete this record?",
        confirm: async () => {
            await this.deleteRecord();
        },
        cancel: () => {
            // Cancelled
        },
    });
}
```

### Action Service

```javascript
setup() {
    this.action = useService("action");
}

async doActions() {
    // Open form view
    await this.action.doAction({
        type: "ir.actions.act_window",
        res_model: "res.partner",
        res_id: partnerId,
        views: [[false, "form"]],
        target: "current",
    });

    // Open list view with domain
    await this.action.doAction({
        type: "ir.actions.act_window",
        name: "Customers",
        res_model: "res.partner",
        domain: [["customer_rank", ">", 0]],
        views: [[false, "list"], [false, "form"]],
        target: "current",
    });

    // Execute server action
    await this.action.doAction("my_module.action_process_records");

    // Open URL
    await this.action.doAction({
        type: "ir.actions.act_url",
        url: "/report/pdf/my_module.report_template/" + recordId,
        target: "new",
    });
}
```

## Registries

### Action Registry

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";
import { MyCustomAction } from "./my_custom_action";

// Register client action
registry.category("actions").add("my_module.my_action", MyCustomAction);
```

### Field Registry

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";
import { CharField } from "@web/views/fields/char/char_field";

export class MyCustomField extends CharField {
    setup() {
        super.setup();
        // Custom setup
    }

    get formattedValue() {
        return this.props.value ? this.props.value.toUpperCase() : "";
    }
}

MyCustomField.template = "my_module.MyCustomField";

registry.category("fields").add("my_custom_char", MyCustomField);
```

### Service Registry

```javascript
/** @odoo-module **/

import { registry } from "@web/core/registry";

export const myCustomService = {
    dependencies: ["rpc", "notification"],

    start(env, { rpc, notification }) {
        return {
            async doSomething(params) {
                try {
                    const result = await rpc("/my_module/api/action", params);
                    notification.add("Success!", { type: "success" });
                    return result;
                } catch (error) {
                    notification.add("Failed", { type: "danger" });
                    throw error;
                }
            },
        };
    },
};

registry.category("services").add("myCustomService", myCustomService);
```

## Patching Existing Code

### Patching Components

```javascript
/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { FormController } from "@web/views/form/form_controller";

patch(FormController.prototype, "my_module.FormController", {
    setup() {
        this._super(...arguments);
        // Additional setup
        this.myService = useService("myCustomService");
    },

    async saveRecord() {
        // Custom logic before save
        console.log("Before save");

        const result = await this._super(...arguments);

        // Custom logic after save
        console.log("After save");

        return result;
    },
});
```

### Patching Objects

```javascript
/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { ListRenderer } from "@web/views/list/list_renderer";

patch(ListRenderer.prototype, "my_module.ListRenderer", {
    // Override existing method
    onCellClicked(record, column, ev) {
        if (column.name === "special_field") {
            // Custom handling
            this.handleSpecialField(record);
            return;
        }
        return this._super(...arguments);
    },

    // Add new method
    handleSpecialField(record) {
        // Custom logic
    },
});
```

## Form View Customization

### Custom Form Widget

```javascript
/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { standardFieldProps } from "@web/views/fields/standard_field_props";

export class ColorPickerField extends Component {
    setup() {
        this.state = useState({
            isOpen: false,
        });
    }

    get colors() {
        return ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];
    }

    selectColor(color) {
        this.props.update(color);
        this.state.isOpen = false;
    }
}

ColorPickerField.template = "my_module.ColorPickerField";
ColorPickerField.props = {
    ...standardFieldProps,
};
ColorPickerField.supportedTypes = ["char"];

registry.category("fields").add("color_picker", ColorPickerField);
```

```xml
<t t-name="my_module.ColorPickerField">
    <div class="o_color_picker_field">
        <div class="o_color_preview"
             t-att-style="'background-color: ' + (props.value || '#FFFFFF')"
             t-on-click="() => this.state.isOpen = !this.state.isOpen"/>

        <div t-if="state.isOpen" class="o_color_palette">
            <t t-foreach="colors" t-as="color" t-key="color">
                <div class="o_color_option"
                     t-att-style="'background-color: ' + color"
                     t-on-click="() => this.selectColor(color)"/>
            </t>
        </div>
    </div>
</t>
```

## Best Practices

### Component Design

```javascript
// ✅ GOOD: Small, focused components
export class PartnerCard extends Component {
    static template = "my_module.PartnerCard";
    static props = {
        partner: Object,
        onSelect: { type: Function, optional: true },
    };
}

// ✅ GOOD: Separate business logic
export class PartnerListController extends Component {
    setup() {
        this.state = useState({ partners: [], loading: true });
        this.orm = useService("orm");
        onWillStart(() => this.loadPartners());
    }

    async loadPartners() {
        this.state.partners = await this.orm.searchRead(
            "res.partner",
            [],
            ["name", "email"]
        );
        this.state.loading = false;
    }
}
```

### Error Handling

```javascript
// ✅ GOOD: Proper error handling with user feedback
async saveRecord() {
    try {
        await this.orm.write("res.partner", [this.props.resId], this.state.data);
        this.notification.add("Saved successfully", { type: "success" });
    } catch (error) {
        _logger.error("Save failed:", error);
        this.notification.add(
            error.message || "Failed to save",
            { type: "danger", sticky: true }
        );
    }
}
```

### Performance

```javascript
// ✅ GOOD: Debounce search input
import { debounce } from "@web/core/utils/timing";

setup() {
    this.debouncedSearch = debounce(this.performSearch.bind(this), 300);
}

onSearchInput(ev) {
    this.state.searchQuery = ev.target.value;
    this.debouncedSearch();
}

// ✅ GOOD: Use t-key in loops for efficient updates
// <t t-foreach="items" t-as="item" t-key="item.id">
```

### Module Structure

```
my_module/
├── static/
│   └── src/
│       ├── js/
│       │   ├── components/
│       │   │   ├── my_component.js
│       │   │   └── my_component.xml
│       │   ├── fields/
│       │   │   └── color_picker_field.js
│       │   ├── services/
│       │   │   └── my_service.js
│       │   └── views/
│       │       └── my_list_view.js
│       └── scss/
│           └── my_styles.scss
└── __manifest__.py
```

### Asset Declaration

```python
# __manifest__.py
{
    'name': 'My Module',
    'version': '15.0.1.0.0',
    'assets': {
        'web.assets_backend': [
            'my_module/static/src/js/**/*.js',
            'my_module/static/src/js/**/*.xml',
            'my_module/static/src/scss/**/*.scss',
        ],
        'web.assets_qweb': [
            'my_module/static/src/js/**/*.xml',
        ],
    },
}
```

**Remember**: Odoo 15 uses OWL 1.x framework. Follow Odoo's component patterns and use services for cross-cutting concerns.
