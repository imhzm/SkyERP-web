// Migration script: v2.x → v3.0 (Founder + Team + Cascading Subscription)
// Run: node scripts/migrate-to-v3.mjs
// Requires MONGODB_URI in .env or environment

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || process.argv[2];
if (!MONGODB_URI) {
  console.error("Please provide MONGODB_URI as env var or argument");
  process.exit(1);
}

async function migrate() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) { console.error("No database connection"); process.exit(1); }

  const usersCol = db.collection("users");
  const adminCol = db.collection("admin");
  const serialCol = db.collection("serial_numbers");
  const auditCol = db.collection("audit_log");

  console.log("Connected to MongoDB. Starting migration...\n");

  // Step 1: Create serial_number counter if not exists
  const counterExists = await serialCol.findOne({ prefix: "SW-ERP" });
  if (!counterExists) {
    await serialCol.insertOne({ prefix: "SW-ERP", last_number: 0, created_at: new Date(), updated_at: new Date() });
    console.log("Created serial number counter");
  } else {
    console.log("Serial number counter already exists");
  }

  // Step 2: Add account_type, serial_number, owner_id, team_members to all users
  const users = await usersCol.find({}).toArray();
  let updated = 0;
  for (const user of users) {
    const updateFields = {};
    const needsUpdate = [];

    // account_type
    if (!user.account_type) {
      updateFields.account_type = "client";
      needsUpdate.push("account_type");
    }

    // serial_number (for clients)
    if (!user.serial_number) {
      const counter = await serialCol.findOneAndUpdate(
        { prefix: "SW-ERP" },
        { $inc: { last_number: 1 }, $set: { updated_at: new Date() } },
        { returnDocument: "after" }
      );
      updateFields.serial_number = "SW-ERP-" + String(counter.last_number).padStart(5, "0");
      needsUpdate.push("serial_number");
    }

    // owner_id
    if (user.owner_id === undefined) {
      updateFields.owner_id = null;
      needsUpdate.push("owner_id");
    }

    // team_members
    if (user.team_members === undefined) {
      updateFields.team_members = [];
      needsUpdate.push("team_members");
    }

    // max_team_members
    if (user.max_team_members === undefined) {
      updateFields.max_team_members = 0;
      needsUpdate.push("max_team_members");
    }

    // company_name
    if (user.company_name === undefined) {
      updateFields.company_name = null;
      needsUpdate.push("company_name");
    }

    // notes
    if (user.notes === undefined) {
      updateFields.notes = "";
      needsUpdate.push("notes");
    }

    // tags
    if (user.tags === undefined) {
      updateFields.tags = [];
      needsUpdate.push("tags");
    }

    // profile_image_url
    if (user.profile_image_url === undefined) {
      updateFields.profile_image_url = null;
      needsUpdate.push("profile_image_url");
    }

    // created_by_admin_id
    if (user.created_by_admin_id === undefined) {
      updateFields.created_by_admin_id = null;
      needsUpdate.push("created_by_admin_id");
    }

    if (needsUpdate.length > 0) {
      await usersCol.updateOne({ _id: user._id }, { $set: updateFields });
      updated++;
    }
  }
  console.log("Updated " + updated + " users with new fields");

  // Step 3: Update admin collection - convert super_admin to founder for the original admin
  const founderAdmin = await adminCol.findOne({ email: "admin@skywaveads.com" });
  if (founderAdmin) {
    if (founderAdmin.role !== "founder") {
      await adminCol.updateOne(
        { _id: founderAdmin._id },
        {
          $set: {
            role: "founder",
            permissions: {
              can_manage_users: true,
              can_manage_billing: true,
              can_view_audit: true,
              can_manage_admins: true,
              can_manage_settings: true,
            },
            notes: "المؤسس الأساسي للنظام",
            two_factor_enabled: false,
          },
        }
      );
      console.log("Updated admin@skywaveads.com to founder role with full permissions");
    } else {
      console.log("Founder already set");
    }

    // Add permissions field to all other admins
    const adminResult = await adminCol.updateMany(
      { role: { $ne: "founder" }, permissions: { $exists: false } },
      {
        $set: {
          permissions: {
            can_manage_users: false,
            can_manage_billing: false,
            can_view_audit: false,
            can_manage_admins: false,
            can_manage_settings: false,
          },
          notes: "",
          two_factor_enabled: false,
        },
      }
    );
    if (adminResult.modifiedCount > 0) {
      console.log("Added permissions to " + adminResult.modifiedCount + " admins");
    }
  }

  // Step 4: Update audit_log collection - add actor_role field
  const auditResult = await auditCol.updateMany(
    { actor_role: { $exists: false } },
    { $set: { actor_role: null } }
  );
  if (auditResult.modifiedCount > 0) {
    console.log("Added actor_role to " + auditResult.modifiedCount + " audit logs");
  }

  // Step 5: Create indexes for new fields
  try {
    await usersCol.createIndex({ owner_id: 1 });
    await usersCol.createIndex({ serial_number: 1 }, { sparse: true });
    await usersCol.createIndex({ account_type: 1 });
    console.log("Created new indexes (owner_id, serial_number, account_type)");
  } catch (err) {
    console.log("Index creation:", err);
  }

  console.log("\nMigration complete!");
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
