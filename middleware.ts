import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/api/:path*"],
};

let lastRun = 0;
const INTERVAL_MS = 5 * 60 * 1000;
let isRunning = false;

export async function middleware(request: NextRequest) {
  const now = Date.now();
  if (now - lastRun < INTERVAL_MS || isRunning) {
    return NextResponse.next();
  }

  isRunning = true;
  lastRun = now;

  try {
    const { connectDB } = await import("@/lib/mongodb");
    const { Invoice } = await import("@/models/billing/Invoice");
    const { User } = await import("@/models/User");
    const { Organization } = await import("@/models/Organization");

    await connectDB();
    const nowDate = new Date();

    const overdueResult = await Invoice.updateMany(
      { status: "pending", due_date: { $lt: nowDate } },
      { $set: { status: "overdue" } }
    );
    if (overdueResult.modifiedCount > 0) {
      console.log(`[auto-tasks] Marked ${overdueResult.modifiedCount} invoices as overdue`);
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
    }
  } catch (error) {
    console.error("[auto-tasks] Error:", error);
  } finally {
    isRunning = false;
  }

  return NextResponse.next();
}
