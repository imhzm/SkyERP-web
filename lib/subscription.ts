import { connectDB } from "./mongodb";
import { User } from "@/models/User";

export async function checkCascadingExpiry(userId: string): Promise<{
  blocked: boolean;
  reason: string | null;
}> {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user || user.is_deleted) {
      return { blocked: true, reason: "المستخدم غير موجود" };
    }

    if (user.account_type !== "sub_user" || !user.owner_id) {
      return { blocked: false, reason: null };
    }

    const owner = await User.findById(user.owner_id);
    if (!owner || owner.is_deleted) {
      return { blocked: true, reason: "حساب العميل الرئيسي غير موجود" };
    }

    if (!owner.is_active) {
      return { blocked: true, reason: "حساب العميل الرئيسي موقوف" };
    }

    const ownerStatus = owner.activation?.status;
    if (ownerStatus === "suspended") {
      return { blocked: true, reason: "اشتراك العميل الرئيسي معلق" };
    }

    if (ownerStatus === "expired") {
      return { blocked: true, reason: "انتهى اشتراك العميل الرئيسي" };
    }

    const ownerEndDate = owner.activation?.subscription?.end_date;
    if (ownerEndDate && new Date(ownerEndDate) < new Date()) {
      const graceEnd = owner.activation?.subscription?.grace_period_end;
      if (!graceEnd || new Date(graceEnd) < new Date()) {
        return { blocked: true, reason: "انتهى اشتراك العميل الرئيسي" };
      }
    }

    return { blocked: false, reason: null };
  } catch (err) {
    console.error("checkCascadingExpiry error:", err);
    return { blocked: true, reason: "حدث خطأ في التحقق من الاشتراك" };
  }
}

export async function syncTeamSubscriptionStatus(
  clientUserId: string
): Promise<{ updated: number }> {
  try {
    await connectDB();
    const owner = await User.findById(clientUserId);
    if (!owner) return { updated: 0 };

    const now = new Date();
    const ownerActive =
      owner.is_active &&
      owner.activation?.status === "active" &&
      (!owner.activation?.subscription?.end_date ||
        new Date(owner.activation.subscription.end_date) > now ||
        (owner.activation?.subscription?.grace_period_end &&
          new Date(owner.activation.subscription.grace_period_end) > now));

    const targetStatus = ownerActive ? "active" : "suspended";
    const targetActive = ownerActive;

    const result = await User.updateMany(
      {
        owner_id: owner._id,
        is_deleted: { $ne: true },
        account_type: "sub_user",
      },
      {
        $set: {
          "activation.status": targetStatus,
          is_active: targetActive,
          last_modified: now,
        },
      }
    );

    return { updated: result.modifiedCount };
  } catch (err) {
    console.error("syncTeamSubscriptionStatus error:", err);
    return { updated: 0 };
  }
}
