import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { writeAuditLog } from "@/lib/audit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = requireAdmin(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await params;

  try {
    await connectDB();
    const user = await User.findById(id);
    if (!user || user.is_deleted) {
      return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const oldHash = user.hardware_hash;

    await User.updateOne(
      { _id: id },
      {
        $set: {
          hardware_hash: null,
          hardware_first_login: null,
          hardware_info: null,
          last_modified: new Date(),
        },
      }
    );

    await writeAuditLog({
      target_collection: "users",
      action: "admin_reset_device",
      target_id: id,
      target_username: user.username,
      performed_by: payload.email,
      performed_by_type: "admin",
      details: { old_hardware_hash: oldHash ? oldHash.substring(0, 16) + "..." : null },
      success: true,
    });

    return Response.json({ message: "تم إعادة تعيين ربط الجهاز بنجاح" });
  } catch (error) {
    console.error("Admin reset device error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
