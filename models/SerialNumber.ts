import mongoose, { Schema, Document } from "mongoose";

export interface ISerialNumber extends Document {
  prefix: string;
  last_number: number;
  created_at: Date;
  updated_at: Date;
}

const SerialNumberSchema = new Schema<ISerialNumber>({
  prefix: { type: String, required: true, unique: true },
  last_number: { type: Number, required: true, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { collection: "serial_numbers" });

export async function generateSerialNumber(): Promise<string> {
  await mongoose.connect(process.env.MONGODB_URI || "");
  const doc = await SerialNumber.findOneAndUpdate(
    { prefix: "SW-ERP" },
    { $inc: { last_number: 1 }, $set: { updated_at: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return `SW-ERP-${String(doc.last_number).padStart(5, "0")}`;
}

export const SerialNumber = mongoose.models.SerialNumber || mongoose.model<ISerialNumber>("SerialNumber", SerialNumberSchema);
