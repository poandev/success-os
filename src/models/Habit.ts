import mongoose, { Schema, model, models } from "mongoose";

const HabitSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  roleName: String,
  title: String,
  stacking: {
    after: String, // 舊習慣
    will: String, // 新習慣
  },
  twoMinuteVersion: String,
  streak: { type: Number, default: 0 },
  completedDates: [Date], // 視覺化連勝的基礎
});

export const Habit = models.Habit || model("Habit", HabitSchema);
