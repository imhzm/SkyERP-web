import { connectDB } from "./mongodb";
import { AuditLog, IAuditLog } from "@/models/AuditLog";

export type AuditRole = "founder" | "super_admin" | "admin" | "support" | "client" | "sub_user" | null;

export function toAuditRole(role: string | undefined): AuditRole {
  if (!role) return null;
  return role as AuditRole;
}

interface AuditEntry {
  target_collection: string;
  action: string;
  target_id?: string | null;
  target_username?: string | null;
  performed_by?: string | null;
  performed_by_type?: "user" | "admin" | "system";
  actor_role?: AuditRole;
  organization_id?: string | null;
  ip_address?: string;
  details?: Record<string, any>;
  success?: boolean;
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create({
      target_collection: entry.target_collection,
      action: entry.action,
      target_id: entry.target_id || null,
      target_username: entry.target_username || null,
      performed_by: entry.performed_by || null,
      performed_by_type: entry.performed_by_type || "system",
      actor_role: entry.actor_role || null,
      organization_id: entry.organization_id || null,
      ip_address: entry.ip_address || "",
      user_agent: "",
      details: entry.details || {},
      timestamp: new Date(),
      success: entry.success ?? true,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
