import { connectDB } from "@/lib/mongodb";
import { Invoice } from "@/models/billing/Invoice";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";

export async function POST() {
  try {
    await connectDB();
    const nowDate = new Date();
    let results: Record<string, number> = {};

    const overdueResult = await Invoice.updateMany(
      { status: "pending", due_date: { $lt: nowDate } },
      { $set: { status: "overdue" } }
    );
    if (overdueResult.modifiedCount > 0) {
      console.log(`[auto-tasks] Marked ${overdueResult.modifiedCount} invoices as overdue`);
      results.overdue_invoices = overdueResult.modifiedCount;
    }

    const expiredTrials = await User.updateMany(
      {
        "activation.status": "trial",
        "activation.trial_end": { $lt: nowDate },
        is_active: true,
      },
      {
        $set: {
          "activation.status": "expired",
          is_active: false,
        },
      }
    );
    if (expiredTrials.modifiedCount > 0) {
      console.log(`[auto-tasks] Expired ${expiredTrials.modifiedCount} trial accounts`);
      results.expired_trials = expiredTrials.modifiedCount;
    }

    const expiredSubscriptions = await User.updateMany(
      {
        "activation.status": "active",
        "activation.subscription.grace_period_end": { $lt: nowDate },
        is_active: true,
      },
      {
        $set: {
          "activation.status": "expired",
          is_active: false,
        },
      }
    );
    if (expiredSubscriptions.modifiedCount > 0) {
      console.log(`[auto-tasks] Expired ${expiredSubscriptions.modifiedCount} subscriptions`);
      results.expired_subscriptions = expiredSubscriptions.modifiedCount;
    }

    const expiredOrgs = await Organization.updateMany(
      {
        "subscription.status": "active",
        "subscription.grace_period_end": { $lt: nowDate },
        is_active: true,
      },
      {
        $set: {
          "subscription.status": "expired",
          is_active: false,
        },
      }
    );
    if (expiredOrgs.modifiedCount > 0) {
      console.log(`[auto-tasks] Expired ${expiredOrgs.modifiedCount} organizations`);
      results.expired_organizations = expiredOrgs.modifiedCount;
    }

    return Response.json({ success: true, results });
  } catch (error) {
    console.error("[auto-tasks] Error:", error);
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
