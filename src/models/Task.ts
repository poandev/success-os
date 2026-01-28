import mongoose, { Schema, model, models } from "mongoose";

const TaskSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["BigRock", "Habit"], required: true },
  status: {
    type: String,
    enum: ["Todo", "In Progress", "Completed"],
    default: "Todo",
  },
  quadrant: { type: Number, enum: [1, 2, 3, 4], default: 2 }, // 預設為「重要不緊急」
  isBigRock: { type: Boolean, default: false },
  goalId: { type: Schema.Types.ObjectId, ref: "Goal", required: true },
  roleId: { type: Schema.Types.ObjectId, ref: "Role" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Task = models.Task || model("Task", TaskSchema);
