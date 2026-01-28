import mongoose, { Schema, model, models } from "mongoose";

const HabitSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  // 習慣疊加公式：在 [anchor] 之後，我會 [action]
  anchor: String,
  action: String,

  streak: { type: Number, default: 0 },
  lastCompletedDate: { type: String }, // 格式: YYYY-MM-DD
  completedDates: [String], // 紀錄所有打卡日期

  status: { type: String, default: "ACTIVE" },
  order: { type: Number, default: 0 }, // 排序欄位
  createdAt: { type: Date, default: Date.now },
});

export const Habit = models.Habit || model("Habit", HabitSchema);
