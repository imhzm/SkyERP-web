import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
  name: String,
  key: { type: String, unique: true },
  duration_days: Number,
  price: Number,
  currency: { type: String, default: "EGP" },
  grace_period_days: { type: Number, default: 7 },
  max_devices: { type: Number, default: 1 },
  features: [String],
  is_active: { type: Boolean, default: true },
  sort_order: { type: Number, default: 0 },
}, { collection: "plans" });

const Plan = mongoose.model("Plan", PlanSchema);

const plans = [
  {
    name: "تجربة مجانية",
    key: "trial",
    duration_days: 2,
    price: 0,
    grace_period_days: 0,
    max_devices: 1,
    features: ["جهاز واحد", "جميع الميزات الأساسية", "دعم فني"],
    allowed_apps: ["dashboard", "clients", "tasks"],
    sort_order: 0,
  },
  {
    name: "اشتراك شهري",
    key: "monthly",
    duration_days: 30,
    price: 500,
    grace_period_days: 7,
    max_devices: 1,
    features: ["جهاز واحد", "جميع الميزات الأساسية", "دعم فني", "تحديثات دورية"],
    allowed_apps: "*",
    sort_order: 1,
  },
  {
    name: "اشتراك نصف سنوي",
    key: "half_yearly",
    duration_days: 183,
    price: 2500,
    grace_period_days: 7,
    max_devices: 2,
    features: ["جهازين", "جميع الميزات الأساسية", "دعم فني", "تحديثات دورية", "خصم 17%"],
    allowed_apps: "*",
    sort_order: 2,
  },
  {
    name: "اشتراك سنوي",
    key: "yearly",
    duration_days: 365,
    price: 4500,
    grace_period_days: 14,
    max_devices: 3,
    features: ["ثلاثة أجهزة", "جميع الميزات الأساسية", "دعم فني", "تحديثات دورية", "خصم 25%"],
    allowed_apps: "*",
    sort_order: 3,
  },
  {
    name: "اشتراك مدى الحياة",
    key: "lifetime",
    duration_days: 36500,
    price: 15000,
    grace_period_days: 30,
    max_devices: 5,
    features: ["خمسة أجهزة", "جميع الميزات الأساسية", "دعم فني", "تحديثات دورية", "جميع الإصدارات"],
    allowed_apps: "*",
    sort_order: 4,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected");

  for (const plan of plans) {
    await Plan.findOneAndUpdate({ key: plan.key }, { $set: plan }, { upsert: true });
    console.log(`Upserted plan: ${plan.name} (${plan.key}) - ${plan.duration_days} days`);
  }

  await mongoose.disconnect();
  console.log("Done - all plans seeded");
}

seed().catch(console.error);
