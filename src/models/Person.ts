import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const PersonSchema = new mongoose.Schema({
  // ... 其他欄位保持不變 ...
  name: { type: String, required: true },
  category: { type: String, required: true, default: "Amway" },
  relationship: { type: String },
  status: { type: String, default: "New" },
  tags: [String],
  notes: [NoteSchema],
  rating: { type: Number, default: 0 },

  // 🔥 新增：排序欄位
  order: { type: Number, default: 0 },

  created_at: { type: Date, default: Date.now },
});

export const Person =
  mongoose.models.Person || mongoose.model("Person", PersonSchema);
