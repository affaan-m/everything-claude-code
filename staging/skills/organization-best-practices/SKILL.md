---
name: organization-best-practices
description: This skill provides guidance and enforcement rules for implementing multi-tenant organizations, teams, and role-based access control using Better Auth's organization plugin.
---

## Setting Up Organizations

Configure the `organization` plugin with appropriate limits and permissions:

```ts
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5, // Max orgs per user
      membershipLimit: 100, // Max members per org
    }),
  ],
});
```

After adding the plugin, run `npx @better-auth/cli migrate` to add the required database tables.

Client-side: add `organizationClient()` from `better-auth/client/plugins` to your `createAuthClient` plugins array.

## Limits Configuration

All limits accept static values or async functions for dynamic logic based on user/org context.

| Limit | Config Key | Notes |
|-------|-----------|-------|
| Orgs per user | `organizationLimit` | `async (user) => number` supported |
| Members per org | `membershipLimit` | `async (user, org) => number` supported |
| Pending invites per org | `invitationLimit` | Static number |
| Teams per org | `teams.maximumTeams` | Requires `teams.enabled: true` |
| Members per team | `teams.maximumMembersPerTeam` | Static number |
| Invitation expiry | `invitationExpiresIn` | Seconds (default: 48 hours) |

```ts
organization({
  organizationLimit: async (user) => user.plan === "premium" ? 20 : 3,
  membershipLimit: async (user, org) => org.metadata?.plan === "enterprise" ? 1000 : 50,
  invitationExpiresIn: 60 * 60 * 24 * 7, // 7 days
  invitationLimit: 100,
  cancelPendingInvitationsOnReInvite: true,
});
```

## Active Organization Pattern

The active organization is stored in the session and scopes subsequent API calls. Always set an active organization after the user selects one via `authClient.organization.setActive({ organizationId })`.

Many endpoints (`listMembers`, `listInvitations`, `inviteMember`, etc.) use the active organization when `organizationId` is not provided.

Use `authClient.organization.getFullOrganization()` to retrieve the active org with all members, invitations, and teams.

## Roles & Permissions

Three default roles:

| Role | Description |
|------|-------------|
| `owner` | Full access, can delete organization |
| `admin` | Can manage members, invitations, settings |
| `member` | Basic access to organization resources |

### Permission Checks

```ts
// Server-round-trip check (authoritative)
const { data } = await authClient.organization.hasPermission({
  permission: "member:write",
});

// Client-only check (for UI rendering, no API call)
const canManage = authClient.organization.checkRolePermission({
  role: "admin",
  permissions: ["member:write"],
});
```

**Gotcha**: `checkRolePermission` uses static role definitions. For dynamic access control (custom roles per org), always use `hasPermission` instead.

### Dynamic Access Control

For applications needing custom roles per organization at runtime:

```ts
organization({
  dynamicAccessControl: { enabled: true },
});
```

This enables `createRole`, `updateRole`, and `deleteRole` endpoints. Pre-defined roles (owner, admin, member) cannot be deleted. Roles assigned to members cannot be deleted until members are reassigned.

## Teams

Enable teams for sub-grouping within organizations:

```ts
organization({
  teams: {
    enabled: true,
    maximumTeams: 20,
    maximumMembersPerTeam: 50,
    allowRemovingAllTeams: false, // Prevent removing last team
  },
});
```

Users must be org members before being added to teams. Active teams work like active organizations -- set via `setActiveTeam` and scoped to session.

## Lifecycle Hooks

Execute custom logic at various points in the organization lifecycle:

```ts
organization({
  hooks: {
    organization: {
      beforeCreate: async ({ data, user }) => {
        return { data: { ...data, metadata: { ...data.metadata, createdBy: user.id } } };
      },
      afterCreate: async ({ organization, member }) => {
        await createDefaultResources(organization.id);
      },
      beforeDelete: async ({ organization }) => {
        await archiveOrganizationData(organization.id);
      },
    },
    member: {
      afterCreate: async ({ member, organization }) => {
        await notifyAdmins(organization.id, `New member joined`);
      },
    },
    invitation: {
      afterCreate: async ({ invitation, organization, inviter }) => {
        await logInvitation(invitation);
      },
    },
  },
});
```

## Schema Customization

Rename tables/fields and add additional fields:

```ts
organization({
  schema: {
    organization: {
      modelName: "workspace",          // Rename table
      fields: { name: "workspaceName" }, // Rename fields
      additionalFields: {
        billingId: { type: "string", required: false },
      },
    },
    member: {
      additionalFields: {
        department: { type: "string", required: false },
        title: { type: "string", required: false },
      },
    },
  },
});
```

## Security Considerations

### Owner Protection

- The last owner cannot be removed or leave the organization
- The owner role cannot be removed from the last owner
- Always transfer ownership before removing the current owner:

```ts
// Transfer ownership first
await authClient.organization.updateMemberRole({
  memberId: "new-owner-member-id",
  role: "owner",
});
// Then the previous owner can be demoted or removed
```

### Organization Deletion

Deleting an organization removes **all** associated data (members, invitations, teams).

```ts
organization({
  disableOrganizationDeletion: true, // Prevent deletion entirely
});
```

Or implement soft delete via `hooks.organization.beforeDelete` -- archive data and throw to prevent actual deletion.

### Invitation Security

- Invitations expire after 48 hours by default (configurable via `invitationExpiresIn`)
- Only the invited email address can accept an invitation
- Pending invitations can be cancelled by organization admins
- `getInvitationURL` does **not** call `sendInvitationEmail` -- handle delivery yourself

### Server-Side Only Operations

- `auth.api.addMember()` bypasses the invitation system (admin use only)
- `auth.api.createOrganization({ body: { userId } })` creates orgs on behalf of users
- The `userId` parameter cannot be used alongside session headers
- Members can have multiple roles: `role: ["admin", "moderator"]`
