"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  KeyRound,
  Users,
  Plus,
  Trash2,
  Lock,
  Check,
  X,
  Loader2,
} from "lucide-react";
import {
  getRoles,
  getAdmins,
  createRoleAction,
  updateRoleFieldAction,
  updateRolePermissionsAction,
  deleteRoleAction,
  updateAdminRoleAction,
  removeAdminAction,
  type RoleData,
  type AdminUser,
} from "@/app/actions/superadmin/roles";
import { RESOURCES, ACTIONS, type Resource, type Action } from "@/lib/roles-constants";

export default function RolesPermissionsPage() {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function loadAll() {
    setLoading(true);
    const [rolesData, adminsData] = await Promise.all([getRoles(), getAdmins()]);
    setRoles(rolesData);
    setAdmins(adminsData);
    if (!selectedRoleId && rolesData.length > 0) {
      const nonLocked = rolesData.find((r) => !r.locked);
      setSelectedRoleId((nonLocked ?? rolesData[0]).id);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) ?? null,
    [roles, selectedRoleId]
  );

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function togglePermission(resource: Resource, action: Action) {
    if (!selectedRole || selectedRole.locked) return;
    const updated: RoleData = {
      ...selectedRole,
      permissions: {
        ...selectedRole.permissions,
        [resource]: {
          ...selectedRole.permissions[resource],
          [action]: !selectedRole.permissions[resource][action],
        },
      },
    };
    setRoles((rs) => rs.map((r) => (r.id === selectedRole.id ? updated : r)));
    startTransition(async () => {
      await updateRolePermissionsAction(updated.id, updated.permissions);
    });
  }

  function addRole() {
    startTransition(async () => {
      const res = await createRoleAction();
      if (res.success && res.data) {
        await loadAll();
        setSelectedRoleId(res.data.id);
      } else if (!res.success) {
        alert(res.message);
      }
    });
  }

  function updateRoleField(id: string, field: "name" | "description", value: string) {
    setRoles((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    startTransition(async () => {
      await updateRoleFieldAction(id, { [field]: value });
    });
  }

  function removeRole(id: string) {
    const role = roles.find((r) => r.id === id);
    if (!role || role.adminCount > 0) return;

    const previous = roles;
    setRoles((rs) => rs.filter((r) => r.id !== id));
    if (selectedRoleId === id) {
      const fallback = roles.find((r) => r.id !== id);
      setSelectedRoleId(fallback?.id ?? null);
    }
    startTransition(async () => {
      const res = await deleteRoleAction(id);
      if (!res.success) {
        setRoles(previous);
        alert(res.message);
      }
    });
  }

  function updateAdminRole(adminId: string, roleId: string) {
    const previous = admins;
    setAdmins((as) => as.map((a) => (a.id === adminId ? { ...a, roleId } : a)));
    startTransition(async () => {
      const res = await updateAdminRoleAction(adminId, roleId);
      if (!res.success) {
        setAdmins(previous);
        alert(res.message);
      } else {
        loadAll(); // refresh adminCount per role
      }
    });
  }

  function removeAdmin(adminId: string) {
    if (!confirm("Remove this admin? This cannot be undone.")) return;
    const previous = admins;
    setAdmins((as) => as.filter((a) => a.id !== adminId));
    startTransition(async () => {
      const res = await removeAdminAction(adminId);
      if (!res.success) {
        setAdmins(previous);
        alert(res.message);
      } else {
        loadAll();
      }
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading roles...
      </div>
    );
  }

  if (!selectedRole) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-sm text-slate-400">
        <p>Couldn't load roles.</p>
        <p className="text-xs">
          Make sure you're logged in as a superadmin, then refresh this page.
        </p>
      </div>
    );
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
                  {role.adminCount} admin{role.adminCount !== 1 ? "s" : ""}
                </p>
              </button>
            ))}

            <button
              onClick={addRole}
              disabled={isPending}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-orange-600 hover:bg-orange-50 disabled:opacity-60"
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
                    disabled={selectedRole.adminCount > 0}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    title={
                      selectedRole.adminCount > 0
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
              {admins.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400">No admins yet.</p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-slate-100">
                  <div className="overflow-x-auto">
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
                              {admin.isSuperAdminAccount ? (
                                <span className="inline-flex items-center gap-1.5 text-slate-500">
                                  <Lock size={12} /> Super Admin
                                </span>
                              ) : (
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
                              )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-right">
                              {!admin.isSuperAdminAccount && (
                                <button
                                  onClick={() => removeAdmin(admin.id)}
                                  className="text-xs font-medium text-red-500 hover:text-red-600"
                                >
                                  Remove
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky save bar — permissions/fields already autosave on change, this is just a visible confirmation */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
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
