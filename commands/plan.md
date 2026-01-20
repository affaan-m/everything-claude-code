---
description: Restate requirements, assess risks, and create step-by-step implementation plan for Odoo modules. WAIT for user CONFIRM before touching any code.
---

# Plan Command

This command invokes the **planner** agent to create a comprehensive implementation plan for Odoo modules before writing any code.

## What This Command Does

1. **Restate Requirements** - Clarify what needs to be built
2. **Design Module Structure** - Models, views, security, data
3. **Identify Risks** - Surface potential issues and blockers
4. **Create Step Plan** - Break down implementation into phases
5. **Wait for Confirmation** - MUST receive user approval before proceeding

## When to Use

Use `/plan` when:
- Starting a new Odoo module
- Adding significant features to existing module
- Making architectural changes
- Multiple models/views will be affected
- Requirements are unclear or ambiguous

## How It Works

The planner agent will:

1. **Analyze the request** and restate requirements in clear terms
2. **Design module structure** with models, fields, relationships
3. **Plan security** - ACLs, record rules, groups
4. **Plan views** - Form, tree, search, actions, menus
5. **Break down into phases** with specific, actionable steps
6. **Assess risks** and potential blockers
7. **Present the plan** and WAIT for your explicit confirmation

## Example Usage

```
User: /plan I need a module to track employee training certifications

Agent (planner):
# Implementation Plan: Employee Training Certifications Module

## Requirements Restatement
- Track employee training certifications
- Store certification name, date obtained, expiry date
- Link certifications to employees
- Notify when certifications are about to expire
- Allow managers to view team certifications

## Module Structure

### __manifest__.py
```python
{
    'name': 'HR Training Certifications',
    'version': '15.0.1.0.0',
    'category': 'Human Resources',
    'summary': 'Track employee training certifications',
    'depends': ['hr'],
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'data/ir_cron_data.xml',
        'views/hr_certification_views.xml',
        'views/hr_employee_views.xml',
        'views/menu_views.xml',
    ],
    'installable': True,
    'license': 'LGPL-3',
}
```

### Models

**hr.certification** (New Model)
```python
class HrCertification(models.Model):
    _name = 'hr.certification'
    _description = 'Employee Certification'

    name = fields.Char(string="Certification Name", required=True)
    employee_id = fields.Many2one('hr.employee', required=True, ondelete='cascade')
    date_obtained = fields.Date(string="Date Obtained")
    date_expiry = fields.Date(string="Expiry Date")
    state = fields.Selection([
        ('valid', 'Valid'),
        ('expiring', 'Expiring Soon'),
        ('expired', 'Expired'),
    ], compute='_compute_state', store=True)
    document = fields.Binary(string="Certificate Document")
```

**hr.employee** (Extension)
```python
class HrEmployee(models.Model):
    _inherit = 'hr.employee'

    certification_ids = fields.One2many('hr.certification', 'employee_id')
    certification_count = fields.Integer(compute='_compute_certification_count')
```

## Implementation Phases

### Phase 1: Database Schema & Models
- Create hr_certification model
- Add fields and computed methods
- Extend hr.employee with One2many
- Write Phase 1 database tests

### Phase 2: Security
- Create security groups (User, Manager)
- Define ir.model.access.csv
- Add record rules for department visibility
- Test access rights

### Phase 3: Views & UI
- Certification form view
- Certification tree view
- Search view with filters
- Employee form extension (notebook page)
- Action and menu items

### Phase 4: Business Logic
- Compute certification state
- Expiry notification cron job
- Email template for notifications
- Write Phase 2 unit tests

## Security Plan

**ir.model.access.csv:**
```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_certification_user,certification.user,model_hr_certification,hr.group_hr_user,1,1,1,0
access_certification_manager,certification.manager,model_hr_certification,hr.group_hr_manager,1,1,1,1
```

**Record Rules:**
- Users see own employee certifications
- Managers see department certifications

## Dependencies
- hr (Human Resources core)

## Risks
- HIGH: Cron job performance with many employees
- MEDIUM: Email deliverability for notifications
- LOW: Date timezone handling

## Testing Plan
- Phase 1: Direct DB tests for schema
- Phase 2: TransactionCase for business logic
- Phase 2: Security tests for access rights

## Estimated Complexity: MEDIUM

**WAITING FOR CONFIRMATION**: Proceed with this plan? (yes/no/modify)
```

## Odoo-Specific Planning

The planner agent considers:

### Module Structure
```
hr_certification/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   ├── hr_certification.py
│   └── hr_employee.py
├── views/
│   ├── hr_certification_views.xml
│   ├── hr_employee_views.xml
│   └── menu_views.xml
├── security/
│   ├── security.xml
│   └── ir.model.access.csv
├── data/
│   └── ir_cron_data.xml
└── tests/
    ├── __init__.py
    ├── test_phase1_db.py
    └── test_phase2_orm.py
```

### Security Considerations
- ACLs for each new model
- Record rules for data isolation
- Group hierarchy
- Field-level access with `groups` attribute

### Testing Requirements
- Phase 1: Database schema verification
- Phase 2: ORM unit tests in `tests/` folder

## Important Notes

**CRITICAL**: The planner agent will **NOT** write any code until you explicitly confirm the plan with "yes" or "proceed" or similar affirmative response.

If you want changes, respond with:
- "modify: [your changes]"
- "different approach: [alternative]"
- "skip phase 2 and do phase 3 first"

## Integration with Other Commands

After planning:
- Use `/tdd` to implement with test-driven development
- Use `/code-review` to review completed implementation
- Use `/test-coverage` to verify test coverage

## Related Agents

This command invokes the `planner` agent located at:
`~/.claude/agents/planner.md`
