import mongoose, { Schema, model, models } from "mongoose";

const WeeklyPlanSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  weekIdentifier: { type: String, required: true }, // 格式: "2026-W05"
  bigRocks: [
    {
      roleId: Schema.Types.ObjectId,
      roleName: String,
      task: String,
      targetDate: { type: String, required: true }, // 預定完成日期: "2026-01-28"
      isCompleted: { type: Boolean, default: false },
      goalId: { type: Schema.Types.ObjectId, ref: "Goal" }, // 垂直整合：連結到長中短期目標
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export const WeeklyPlan =
  models.WeeklyPlan || model("WeeklyPlan", WeeklyPlanSchema);
