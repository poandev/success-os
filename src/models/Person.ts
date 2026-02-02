import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const PersonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, default: "Amway" },
  relationship: { type: String },
  status: {
    type: String,
    enum: ["New", "Warming", "Invited", "FollowUp", "Closed", "Lost"],
    default: "New",
  },
  tags: [String],
  // 🔥 修改：改為陣列結構
  notes: [NoteSchema],
  rating: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

export const Person =
  mongoose.models.Person || mongoose.model("Person", PersonSchema);
