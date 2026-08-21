export type Action = "View" | "Create" | "Edit" | "Delete";
export const ACTIONS: Action[] = ["View", "Create", "Edit", "Delete"];

export const RESOURCES = [
  "Businesses",
  "Orders",
  "Platform Users",
  "System Logs",
  "Payments",
  "Global Settings",
] as const;
export type Resource = (typeof RESOURCES)[number];

export type PermissionMap = Record<Resource, Record<Action, boolean>>;