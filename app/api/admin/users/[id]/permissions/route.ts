import { NextRequest } from "next/server";
import { requireAdminOrFounder } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { writeAuditLog, toAuditRole } from "@/lib/audit";

const ALL_TABS = [
  "dashboard", "projects", "quotes", "expenses", "payments",
  "clients", "employees", "services", "accounting", "todo", "settings",
];
const ALL_ACTIONS = ["create", "read", "update", "delete", "export", "print"];
const ALL_FEATURES = [
  "user_management", "system_settings", "financial_reports",
  "data_export", "client_reports", "task_management",
];

const ROLE_PERMISSIONS: Record<string, { tabs: string[]; actions: string[]; features: string[] }> = {
  admin: { tabs: ALL_TABS, actions: ALL_ACTIONS, features: ALL_FEATURES },
  accountant: {
    tabs: ["dashboard", "projects", "quotes", "expenses", "payments", "clients", "employees", "services", "accounting", "todo"],
    actions: ALL_ACTIONS,
    features: ["financial_reports", "data_export", "task_management"],
  },
  sales: {
    tabs: ["dashboard", "projects", "quotes", "clients", "services", "todo"],
    actions: ["create", "read", "update", "print"],
    features: ["client_reports", "task_management"],
  },
  employee: {
    tabs: ["dashboard", "projects", "clients", "services", "todo"],
    actions: ["create", "read", "update", "print"],
    features: ["client_reports", "task_management"],
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "ØºÙŠØ± Ù…ØµØ±Ø­" }, { status: 401 });

  const { id } = await params;

  try {
    await connectDB();
    const user = await User.findById(id).select("desktop_role custom_permissions");
    if (!user || user.is_deleted) {
      return Response.json({ error: "Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯" }, { status: 404 });
    }

    const roleDefault = ROLE_PERMISSIONS[user.desktop_role || ""] || { tabs: [], actions: [], features: [] };

    return Response.json({
      desktop_role: user.desktop_role || null,
      custom_permissions: user.custom_permissions || null,
      role_defaults: roleDefault,
      all_tabs: ALL_TABS,
      all_actions: ALL_ACTIONS,
      all_features: ALL_FEATURES,
    });
  } catch (error) {
    console.error("Permissions GET error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireAdminOrFounder(request);
  if (!payload) return Response.json({ error: "ØºÙŠØ± Ù…ØµØ±Ø­" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Ø¨ÙŠØ§Ù†Ø§Øª ØºÙŠØ± ØµØ§Ù„Ø­Ø©" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  if (!raw.custom_permissions || typeof raw.custom_permissions !== "object") {
    return Response.json({ error: "custom_permissions Ù…Ø·Ù„ÙˆØ¨ ÙˆÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† object" }, { status: 400 });
  }

  const cp = raw.custom_permissions as Record<string, unknown>;
  if (!Array.isArray(cp.tabs) || !Array.isArray(cp.actions) || !Array.isArray(cp.features)) {
    return Response.json({ error: "tabs, actions, features must be arrays" }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await User.findById(id);
    if (!user || user.is_deleted) {
      return Response.json({ error: "Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯" }, { status: 404 });
    }

    await User.updateOne(
      { _id: id },
      { $set: { custom_permissions: { tabs: cp.tabs, actions: cp.actions, features: cp.features }, last_modified: new Date() } }
    );

    await writeAuditLog({
      target_collection: "users",
      action: "admin_update_user",
      target_id: id,
      target_username: user.username,
      performed_by: payload.email,
      performed_by_type: "admin",
      actor_role: toAuditRole(payload.role),
      organization_id: payload.organization_id,
      details: { custom_permissions: { tabs: cp.tabs, actions: cp.actions, features: cp.features } },
      success: true,
    });

    return Response.json({ message: "ØªÙ… Ø­ÙØ¸ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø¨Ù†Ø¬Ø§Ø­" });
  } catch (error) {
    console.error("Permissions PATCH error:", error);
    return Response.json({ error: "Ø­Ø¯Ø« Ø®Ø·Ø£" }, { status: 500 });
  }
}
