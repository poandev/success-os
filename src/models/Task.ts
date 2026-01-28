import mongoose, { Schema, model, models } from "mongoose";

const TaskSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  quadrant: { type: Number, enum: [1, 2, 3, 4], default: 2 }, // 預設為「重要不緊急」
  isBigRock: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  roleId: Schema.Types.ObjectId,
});

export const Task = models.Task || model("Task", TaskSchema);
