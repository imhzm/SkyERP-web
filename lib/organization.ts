import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { requireAuth } from "./middleware";
import type { JwtPayload } from "./auth";
import { connectDB } from "./mongodb";
import { Organization } from "@/models/Organization";

export function isMultiTenant(): boolean {
  return process.env.MULTI_TENANT_ENABLED === "true";
}

export async function requireOrganization(request: NextRequest): Promise<{
  payload: JwtPayload;
  organization_id: string;
  _orgDoc: any;
} | null> {
  const payload = requireAuth(request);
  if (!payload) return null;

  if (!isMultiTenant()) {
    return { payload, organization_id: "", _orgDoc: null };
  }

  if (!payload.organization_id) return null;

  try {
    await connectDB();
    const org = await Organization.findById(payload.organization_id);
    if (!org || !org.is_active) return null;
    return { payload, organization_id: payload.organization_id, _orgDoc: org };
  } catch {
    return null;
  }
}

export async function requireOrgAdmin(request: NextRequest): Promise<{
  payload: JwtPayload;
  organization_id: string;
  orgRole: "owner" | "admin";
} | null> {
  const ctx = await requireOrganization(request);
  if (!ctx || !ctx._orgDoc) return null;

  const adminEntry = ctx._orgDoc.admins?.find(
    (a: any) => a.user_id.toString() === ctx.payload.sub
  );
  if (!adminEntry) return null;

  return { payload: ctx.payload, organization_id: ctx.organization_id, orgRole: adminEntry.role };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || `org-${Date.now()}`;
}
