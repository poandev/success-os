import mongoose, { Schema, model, models } from "mongoose";

const RoleSchema = new Schema({
  name: { type: String, required: true }, // 工程師, 創業者
  identityLabel: String, // 「我要成為...的人」
  color: String,
});

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  missionStatement: String, // 個人憲法
  roles: [RoleSchema],
});

export const User = models.User || model("User", UserSchema);
