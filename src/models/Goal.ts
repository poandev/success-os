// models/Goal.ts
import mongoose, { Schema, model, models } from "mongoose";

const GoalSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  roleId: Schema.Types.ObjectId, // 關連到特定角色，例如「工程師」的長期目標
  title: { type: String, required: true },
  description: String,

  // 目標分級
  level: {
    type: String,
    enum: ["Long", "Mid", "Short"], // 長期 (3-5年), 中期 (1年), 短期 (1-3個月)
    required: true,
  },

  parentGoalId: { type: Schema.Types.ObjectId, ref: "Goal" }, // 實現目標分解
  deadline: Date,
  progress: { type: Number, default: 0 }, // 0-100
  status: { type: String, default: "ACTIVE" },
});

export const Goal = models.Goal || model("Goal", GoalSchema);
