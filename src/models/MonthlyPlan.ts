import mongoose, { Schema, model, models } from "mongoose";

const MonthlyPlanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  monthIdentifier: { type: String, required: true }, // 格式: "2026-01"
  focusGoals: [
    {
      title: String,
      status: {
        type: String,
        enum: ["Todo", "Doing", "Done"],
        default: "Todo",
      },
      goalId: { type: Schema.Types.ObjectId, ref: "Goal" }, // 連結到願景層的短期目標
    },
  ],
  reflection: String, // 月末反思
  createdAt: { type: Date, default: Date.now },
});

export const MonthlyPlan =
  models.MonthlyPlan || model("MonthlyPlan", MonthlyPlanSchema);
