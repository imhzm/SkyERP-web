import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Invoice } from "@/models/billing/Invoice";
import { Transaction } from "@/models/billing/Transaction";

export async function GET(request: NextRequest) {
  const payload = requireAdmin(request);
  if (!payload) return Response.json({ error: "غير مصرح" }, { status: 401 });

  try {
    await connectDB();

    const [
      total_users,
      active_users,
      suspended_users,
      trial_users,
      expired_users,
      total_invoices,
      paid_invoices,
      overdue_invoices,
      total_revenue,
      recent_registrations,
      recent_logins,
    ] = await Promise.all([
      User.countDocuments({ is_deleted: { $ne: true } }),
      User.countDocuments({ is_deleted: { $ne: true }, "activation.status": "active" }),
      User.countDocuments({ is_deleted: { $ne: true }, "activation.status": "suspended" }),
      User.countDocuments({ is_deleted: { $ne: true }, "activation.status": "trial" }),
      User.countDocuments({ is_deleted: { $ne: true }, "activation.status": "expired" }),
      Invoice.countDocuments(),
      Invoice.countDocuments({ status: "paid" }),
      Invoice.countDocuments({ status: "overdue" }),
      Invoice.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      User.find({ is_deleted: { $ne: true } })
        .sort({ created_at: -1 })
        .limit(10)
        .select("username email full_name role activation.status created_at"),
      User.find({ is_deleted: { $ne: true }, last_login: { $ne: null } })
        .sort({ last_login: -1 })
        .limit(10)
        .select("username email full_name role last_login"),
    ]);

    const device_bound = await User.countDocuments({
      is_deleted: { $ne: true },
      hardware_hash: { $nin: [null, ""] },
    });

    const locked_users = await User.countDocuments({
      is_deleted: { $ne: true },
      locked_until: { $ne: null, $gt: new Date() },
    });

    const plans_distribution = await User.aggregate([
      { $match: { is_deleted: { $ne: true } } },
      { $group: { _id: "$activation.subscription.plan", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return Response.json({
      users: {
        total: total_users,
        active: active_users,
        suspended: suspended_users,
        trial: trial_users,
        expired: expired_users,
        device_bound,
        locked: locked_users,
        plans: plans_distribution,
      },
      revenue: {
        total: total_revenue.length > 0 ? total_revenue[0].total : 0,
        invoices: { total: total_invoices, paid: paid_invoices, overdue: overdue_invoices },
      },
      recent: {
        registrations: recent_registrations,
        logins: recent_logins,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return Response.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
