# XML Views - Odoo 15 Development

## View Rules

### MUST Rules
- All fields should have `string` labels unless auto-generated
- Use XPath for inheritance; avoid raw copy-paste
- Do NOT add business logic in views

### CRITICAL RULE - Field Requirements

**Define field requirements in XML views using `required="1"`, NOT in Python models using `required=True`.**

Python `required=True` causes database NULL constraints that conflict with different use cases:
- EDIT vs CREATE modes
- Readonly fields
- Conditional visibility

**Use XML `attrs` for conditional required validation instead.**

### INTERNATIONALIZATION RULE

For validation messages, labels, and field name displays in views that are not yet translated:
- Keep default language in **English**
- Add translations in `i18n/*.po` files

## View Inheritance with XPath

```xml
<!-- Good - Using XPath -->
<record id="view_partner_form_inherit_credit" model="ir.ui.view">
    <field name="name">res.partner.form.inherit.credit</field>
    <field name="model">res.partner</field>
    <field name="inherit_id" ref="base.view_partner_form"/>
    <field name="arch" type="xml">
        <xpath expr="//field[@name='credit']" position="after">
            <field name="credit_limit" string="Credit Limit"/>
        </xpath>
    </field>
</record>

<!-- Bad - Missing XPath, field without label -->
<record id="view_partner_form_inherit_credit" model="ir.ui.view">
    <field name="name">res.partner.form.inherit.credit</field>
    <field name="model">res.partner</field>
    <field name="inherit_id" ref="base.view_partner_form"/>
    <field name="arch" type="xml">
        <field name="credit_limit"/>
    </field>
</record>
```

## XPath Positions

| Position | Description | Example |
|----------|-------------|---------|
| `after` | Insert after target | `<xpath expr="//field[@name='x']" position="after">` |
| `before` | Insert before target | `<xpath expr="//field[@name='x']" position="before">` |
| `inside` | Insert inside target (at end) | `<xpath expr="//group[@name='x']" position="inside">` |
| `replace` | Replace target completely | `<xpath expr="//field[@name='x']" position="replace">` |
| `attributes` | Modify attributes | See example below |

### Modifying Attributes

```xml
<xpath expr="//field[@name='partner_id']" position="attributes">
    <attribute name="readonly">1</attribute>
    <attribute name="required">1</attribute>
</xpath>
```

## Conditional Requirements with attrs

```xml
<!-- Conditional required based on state -->
<field name="delivery_date"
       string="Delivery Date"
       attrs="{'required': [('state', '=', 'confirmed')], 'invisible': [('state', '=', 'draft')]}"/>

<!-- Conditional required based on field value -->
<field name="reason"
       string="Reason"
       attrs="{'required': [('requires_approval', '=', True)]}"/>
```

## Group Visibility

```xml
<!-- Field visible only to specific group -->
<field name="commission_rate" groups="sales_team.group_sale_manager"/>

<!-- Group visibility on page -->
<page string="Advanced" groups="base.group_no_one">
    <field name="technical_field"/>
</page>
```

## Data Files

### MUST Rules
- Use XML/CSV for initial/demo data; avoid raw SQL
- Put demo under `demo/`, production under `data/`
- Use `noupdate="1"` for system configs

```xml
<!-- Good - With noupdate -->
<data noupdate="1">
    <record id="res_company_default" model="res.company">
        <field name="name">My Company</field>
    </record>
</data>

<!-- Bad - Missing noupdate for config data -->
<data>
    <record id="res_company_default" model="res.company">
        <field name="name">My Company</field>
    </record>
</data>
```

## QWeb Reports

### MUST Rules
- Keep report templates under `report/`, separate from business logic
- Use QWeb expressions (`t-esc`, `t-if`, `t-foreach`) safely
- Never inject raw SQL

### SHOULD Rules
- Provide Excel/CSV exports for large tabular data
- Always translate labels with `_()`

```xml
<!-- Good - QWeb report -->
<t t-name="sale.report_order">
    <t t-foreach="docs" t-as="o">
        <p>
            <span t-esc="o.name"/> —
            <span t-esc="o.amount_total"/>
        </p>
    </t>
</t>

<!-- Bad - Inline Python, no escaping -->
<t t-name="sale.report_order">
    <t t-foreach="docs" t-as="o">
        <p>
            <span><?python print(o.name) ?></span>
        </p>
    </t>
</t>
```

## Excel Export

```python
# Good - Excel export via Odoo's reporting engine
@api.model
def export_xlsx(self, options, response=None):
    workbook = xlsxwriter.Workbook(response, {"in_memory": True})
    sheet = workbook.add_worksheet("Report")
    sheet.write(0, 0, _("Name"))
    sheet.write(0, 1, _("Total"))
    # populate rows...
    workbook.close()
```

## Common XPath Expressions

| Target | XPath Expression |
|--------|------------------|
| Field by name | `//field[@name='partner_id']` |
| Group by name | `//group[@name='main_info']` |
| Page by string | `//page[@string='Sales']` |
| Button by name | `//button[@name='action_confirm']` |
| Notebook | `//notebook` |
| Sheet | `//sheet` |
| Header | `//header` |
| First field | `//field[1]` |
| Last field | `//field[last()]` |

## Form View Structure

```xml
<record id="view_partner_form" model="ir.ui.view">
    <field name="name">res.partner.form</field>
    <field name="model">res.partner</field>
    <field name="arch" type="xml">
        <form string="Partner">
            <header>
                <button name="action_confirm" string="Confirm" type="object"/>
                <field name="state" widget="statusbar"/>
            </header>
            <sheet>
                <group name="main_info">
                    <group name="left_column">
                        <field name="name" string="Name" required="1"/>
                        <field name="email" string="Email"/>
                    </group>
                    <group name="right_column">
                        <field name="phone" string="Phone"/>
                        <field name="mobile" string="Mobile"/>
                    </group>
                </group>
                <notebook>
                    <page string="Contacts" name="contacts">
                        <field name="child_ids"/>
                    </page>
                    <page string="Sales" name="sales">
                        <field name="sale_order_ids"/>
                    </page>
                </notebook>
            </sheet>
            <div class="oe_chatter">
                <field name="message_follower_ids"/>
                <field name="message_ids"/>
            </div>
        </form>
    </field>
</record>
```

## Tree View Structure

```xml
<record id="view_partner_tree" model="ir.ui.view">
    <field name="name">res.partner.tree</field>
    <field name="model">res.partner</field>
    <field name="arch" type="xml">
        <tree string="Partners" decoration-danger="state == 'blocked'">
            <field name="name"/>
            <field name="email"/>
            <field name="phone"/>
            <field name="state" invisible="1"/>
        </tree>
    </field>
</record>
```

## Search View Structure

```xml
<record id="view_partner_search" model="ir.ui.view">
    <field name="name">res.partner.search</field>
    <field name="model">res.partner</field>
    <field name="arch" type="xml">
        <search string="Search Partners">
            <field name="name"/>
            <field name="email"/>
            <filter name="active" string="Active" domain="[('active', '=', True)]"/>
            <filter name="inactive" string="Inactive" domain="[('active', '=', False)]"/>
            <separator/>
            <group expand="0" string="Group By">
                <filter name="group_country" string="Country" context="{'group_by': 'country_id'}"/>
            </group>
        </search>
    </field>
</record>
```

## Action Definition

```xml
<record id="action_partner" model="ir.actions.act_window">
    <field name="name">Partners</field>
    <field name="res_model">res.partner</field>
    <field name="view_mode">tree,form,kanban</field>
    <field name="domain">[('customer', '=', True)]</field>
    <field name="context">{'default_customer': True}</field>
    <field name="help" type="html">
        <p class="o_view_nocontent_smiling_face">
            Create your first partner!
        </p>
    </field>
</record>
```

## Menu Definition

```xml
<menuitem id="menu_partner_root"
          name="Partners"
          sequence="10"/>

<menuitem id="menu_partner_list"
          name="All Partners"
          parent="menu_partner_root"
          action="action_partner"
          sequence="10"/>
```
