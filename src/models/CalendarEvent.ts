import mongoose from "mongoose";

// 修改 1: 為了支援自由輸入，這裡將 TaskType 改為 string
// 如果您想保留型別提示，也可以用 string，但在前端做自動補全
export type TaskType = string;

export interface ICalendarEvent {
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  duration: number; // minutes
  type: TaskType;
  isCompleted: boolean;
  created_at: Date;
}

const CalendarEventSchema = new mongoose.Schema<ICalendarEvent>({
  title: {
    type: String,
    required: [true, "標題為必填"],
    trim: true,
  },
  date: {
    type: String,
    required: [true, "日期為必填"],
    match: [/^\d{4}-\d{2}-\d{2}$/, "日期格式必須為 YYYY-MM-DD"],
  },
  startTime: {
    type: String,
    required: [true, "開始時間為必填"],
    match: [/^\d{2}:\d{2}$/, "時間格式必須為 HH:mm"],
  },
  duration: {
    type: Number,
    required: true,
    min: [1, "持續時間至少 1 分鐘"],
    default: 60,
  },
  type: {
    type: String,
    // 修改 2: 移除 enum: [...] 限制，允許使用者自由輸入任何類別
    // 這樣前端傳入 "工程"、"安麗"、"生活" 都可以直接存入
    required: true,
    trim: true,
    default: "Life",
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// 建立複合索引以提升查詢效能 (依日期與時間排序)
// 這對於行事曆視圖非常關鍵，能加速 "查詢某一天所有行程" 的速度
CalendarEventSchema.index({ date: 1, startTime: 1 });

export default mongoose.models.CalendarEvent ||
  mongoose.model<ICalendarEvent>("CalendarEvent", CalendarEventSchema);
