"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { getSecurityLogsData } from "@/lib/setting/security-logs";

const LOGS_PATH = "/setting/security-logs";

export async function fetchSecurityLogsAction() {
  const session = await getSession();
  if (!session || (session.role !== "owner" && session.role !== "manager")) {
    return { success: false, error: "Not authorized." };
  }

  try {
    const data = await getSecurityLogsData();
    revalidatePath(LOGS_PATH);
    return { success: true, data };
  } catch (err) {
    console.error("Failed to fetch security logs:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load security logs.",
    };
  }
}

export async function exportSecurityLogsCsvAction() {
  const session = await getSession();
  if (!session || (session.role !== "owner" && session.role !== "manager")) {
    return { success: false, error: "Not authorized." };
  }

  try {
    const { logs } = await getSecurityLogsData();

    const headers = ["Timestamp", "User", "Role", "Action", "Category", "IP Address", "Status", "Priority", "Details"];
    const rows = logs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.user}"`,
      `"${l.role}"`,
      `"${l.action}"`,
      `"${l.category}"`,
      `"${l.ipAddress}"`,
      `"${l.status}"`,
      `"${l.priority}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    return { success: true, csv: csvContent };
  } catch (err) {
    console.error("Failed to export security logs:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to export logs.",
    };
  }
}
