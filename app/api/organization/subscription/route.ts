import { NextRequest } from "next/server";
import { requireOrganization } from "@/lib/organization";
import { connectDB } from "@/lib/mongodb";
import { Organization } from "@/models/Organization";

export async function GET(request: NextRequest) {
  const ctx = await requireOrganization(request);
  if (!ctx) return Response.json({ error: "غير مصرح" }, { status: 401 });

  if (!ctx.organization_id) {
    return Response.json({ subscription: null });
  }

  try {
    await connectDB();
    const org = await Organization.findById(ctx.organization_id).select("subscription").lean();
    if (!org) return Response.json({ subscription: null });

    return Response.json({ subscription: org.subscription });
  } catch (error) {
    console.error("Get org subscription error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
