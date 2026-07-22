"use client";

import { useMemo, useState } from "react";
import {
  KeyRound,
  Users,
  Plus,
  Trash2,
  Lock,
  Check,
  X,
} from "lucide-react";

type Action = "View" | "Create" | "Edit" | "Delete";
const ACTIONS: Action[] = ["View", "Create", "Edit", "Delete"];

const RESOURCES = [
  "Businesses",
  "Orders",
  "Platform Users",
  "System Logs",
  "Payments",
  "Global Settings",
] as const;
type Resource = (typeof RESOURCES)[number];

type PermissionMap = Record<Resource, Record<Action, boolean>>;

interface Role {
  id: string;
  name: string;
  description: string;
  locked?: boolean; // Super Admin — always full access, not editable
  permissions: PermissionMap;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
}

function fullAccess(): PermissionMap {
  return RESOURCES.reduce((acc, r) => {
    acc[r] = { View: true, Create: true, Edit: true, Delete: true };
    return acc;
  }, {} as PermissionMap);
}

function noAccess(): PermissionMap {
  return RESOURCES.reduce((acc, r) => {
    acc[r] = { View: false, Create: false, Edit: false, Delete: false };
    return acc;
  }, {} as PermissionMap);
}

const initialRoles: Role[] = [
  {
    id: "super-admin",
    name: "Super Admin",
    description: "Full access to every module. Cannot be edited or removed.",
    locked: true,
    permissions: fullAccess(),
  },
  {
    id: "admin",
    name: "Admin",
    description: "Manages day-to-day operations across the platform.",
    permissions: {
      ...noAccess(),
      Businesses: { View: true, Create: true, Edit: true, Delete: false },
      Orders: { View: true, Create: false, Edit: true, Delete: false },
      "Platform Users": { View: true, Create: true, Edit: true, Delete: false },
      "System Logs": { View: true, Create: false, Edit: false, Delete: false },
      Payments: { View: true, Create: false, Edit: false, Delete: false },
      "Global Settings": { View: true, Create: false, Edit: false, Delete: false },
    },
  },
  {
    id: "moderator",
    name: "Moderator",
    description: "Reviews and moderates business and order activity.",
    permissions: {
      ...noAccess(),
      Businesses: { View: true, Create: false, Edit: true, Delete: false },
      Orders: { View: true, Create: false, Edit: true, Delete: false },
      "System Logs": { View: true, Create: false, Edit: false, Delete: false },
    },
  },
  {
    id: "support",
    name: "Support Staff",
    description: "Handles user support tickets and read-only lookups.",
    permissions: {
      ...noAccess(),
      Orders: { View: true, Create: false, Edit: false, Delete: false },
      "Platform Users": { View: true, Create: false, Edit: false, Delete: false },
    },
  },
];

const initialAdmins: AdminUser[] = [
  { id: "1", name: "Sima Malla", email: "sima@bistrocentral.com", roleId: "super-admin" },
  { id: "2", name: "Aayush Shrestha", email: "aayush@bistrocentral.com", roleId: "admin" },
  { id: "3", name: "Prakriti Gurung", email: "prakriti@bistrocentral.com", roleId: "moderator" },
  { id: "4", name: "Bibek Karki", email: "bibek@bistrocentral.com", roleId: "support" },
];

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [selectedRoleId, setSelectedRoleId] = useState(roles[1].id);
  const [saved, setSaved] = useState(false);

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId)!,
    [roles, selectedRoleId]
  );

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function togglePermission(resource: Resource, action: Action) {
    setRoles((rs) =>
      rs.map((r) =>
        r.id === selectedRoleId && !r.locked
          ? {
              ...r,
              permissions: {
                ...r.permissions,
                [resource]: {
                  ...r.permissions[resource],
                  [action]: !r.permissions[resource][action],
                },
              },
            }
          : r
      )
    );
  }

  function addRole() {
    const id = crypto.randomUUID();
    const newRole: Role = {
      id,
      name: "New Role",
      description: "Describe what this role can do.",
      permissions: noAccess(),
    };
    setRoles((rs) => [...rs, newRole]);
    setSelectedRoleId(id);
  }

  function updateRoleField(id: string, field: "name" | "description", value: string) {
    setRoles((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function removeRole(id: string) {
    if (admins.some((a) => a.roleId === id)) return; // guard: reassign admins first
    setRoles((rs) => rs.filter((r) => r.id !== id));
    if (selectedRoleId === id) setSelectedRoleId(roles[0].id);
  }

  function updateAdminRole(adminId: string, roleId: string) {
    setAdmins((as) => as.map((a) => (a.id === adminId ? { ...a, roleId } : a)));
  }

  function removeAdmin(adminId: string) {
    setAdmins((as) => as.filter((a) => a.id !== adminId));
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Roles &amp; Permissions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Control what each admin role can view, create, edit, or delete across the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {/* Role list */}
          <div className="space-y-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                  selectedRoleId === role.id
                    ? "border-orange-300 bg-orange-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{role.name}</p>
                  {role.locked && <Lock size={12} className="text-slate-400" />}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {admins.filter((a) => a.roleId === role.id).length} admin
                  {admins.filter((a) => a.roleId === role.id).length !== 1 ? "s" : ""}
                </p>
              </button>
            ))}

            <button
              onClick={addRole}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-orange-600 hover:bg-orange-50"
            >
              <Plus size={15} />
              Add role
            </button>
          </div>

          {/* Selected role detail */}
          <div className="space-y-6">
            <Card icon={KeyRound}>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-2">
                  {selectedRole.locked ? (
                    <>
                      <p className="text-sm font-semibold text-slate-800">{selectedRole.name}</p>
                      <p className="text-xs text-slate-500">{selectedRole.description}</p>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={selectedRole.name}
                        onChange={(e) => updateRoleField(selectedRole.id, "name", e.target.value)}
                        className="input font-semibold"
                      />
                      <input
                        type="text"
                        value={selectedRole.description}
                        onChange={(e) =>
                          updateRoleField(selectedRole.id, "description", e.target.value)
                        }
                        className="input text-xs"
                      />
                    </>
                  )}
                </div>

                {!selectedRole.locked && (
                  <button
                    onClick={() => removeRole(selectedRole.id)}
                    disabled={admins.some((a) => a.roleId === selectedRole.id)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    title={
                      admins.some((a) => a.roleId === selectedRole.id)
                        ? "Reassign admins before deleting this role"
                        : "Delete role"
                    }
                  >
                    <Trash2 size={14} />
                    Delete Role
                  </button>
                )}
              </div>

              {selectedRole.locked && (
                <p className="mb-5 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  <Lock size={13} />
                  Super Admin always has full access and can't be modified.
                </p>
              )}

              {/* Permission matrix */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      <th className="py-2 pr-4">Module</th>
                      {ACTIONS.map((action) => (
                        <th key={action} className="px-3 py-2 text-center">
                          {action}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {RESOURCES.map((resource) => (
                      <tr key={resource}>
                        <td className="whitespace-nowrap py-3 pr-4 font-medium text-slate-700">
                          {resource}
                        </td>
                        {ACTIONS.map((action) => {
                          const checked = selectedRole.permissions[resource][action];
                          return (
                            <td key={action} className="px-3 py-3 text-center">
                              <button
                                type="button"
                                disabled={selectedRole.locked}
                                onClick={() => togglePermission(resource, action)}
                                className={`mx-auto flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${
                                  checked
                                    ? "border-orange-500 bg-orange-500 text-white"
                                    : "border-slate-200 bg-white text-transparent"
                                } ${selectedRole.locked ? "cursor-not-allowed opacity-70" : "hover:border-orange-300"}`}
                              >
                                {checked ? <Check size={14} /> : <X size={12} />}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Admins assigned to roles */}
            <Card icon={Users} title="Assigned Admins">
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">Role</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admins.map((admin) => (
                      <tr key={admin.id}>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                          {admin.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">{admin.email}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <select
                            value={admin.roleId}
                            onChange={(e) => updateAdminRole(admin.id, e.target.value)}
                            className="input w-40"
                          >
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <button
                            onClick={() => removeAdmin(admin.id)}
                            className="text-xs font-medium text-red-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <p className="text-xs text-slate-400">
            {saved ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600">
                <Check size={14} /> Changes saved
              </span>
            ) : (
              "Unsaved changes are not applied until you save."
            )}
          </p>
          <div className="flex gap-3">
            <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Discard
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-orange-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Shared input styling */}
      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #334155;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: #fb923c;
          box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.15);
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Card({
  title,
  children,
  icon: Icon,
}: {
  title?: string;
  children: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {title && (
        <div className="mb-5 flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-orange-500" />}
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
}
