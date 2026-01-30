import mongoose from "mongoose";

// Transaction (保持不變)
const TransactionSchema = new mongoose.Schema({
  date: { type: String, required: true },
  type: { type: String, enum: ["Income", "Expense"], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  note: { type: String },
  created_at: { type: Date, default: Date.now },
});

// StockPosition (當前持倉狀態 - 保持不變)
const StockPositionSchema = new mongoose.Schema({
  stockId: { type: String, required: true, unique: true },
  stockName: { type: String, required: true },
  shares: { type: Number, required: true, default: 0 },
  avgCost: { type: Number, required: true, default: 0 },
  marketValue: { type: Number, required: true, default: 0 }, // 手動輸入的總現值
  refPrice: { type: Number, required: true, default: 0 }, // 手動輸入的參考價
  updated_at: { type: Date, default: Date.now },
});

// 🔥 新增：StockHistory (歷史紀錄)
const StockHistorySchema = new mongoose.Schema({
  stockId: { type: String, required: true }, // 對應的股票代號
  date: { type: Date, default: Date.now }, // 紀錄時間
  action: {
    type: String,
    enum: ["UPDATE", "CREATE", "DELETE"],
    default: "UPDATE",
  },

  // 記錄當下的快照數據
  shares: { type: Number, required: true },
  avgCost: { type: Number, required: true },
  marketValue: { type: Number, required: true },
  refPrice: { type: Number, required: true },

  // 當下的總損益 (方便日後直接撈取繪圖)
  totalProfit: { type: Number },
});

export const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
export const StockPosition =
  mongoose.models.StockPosition ||
  mongoose.model("StockPosition", StockPositionSchema);
export const StockHistory =
  mongoose.models.StockHistory ||
  mongoose.model("StockHistory", StockHistorySchema);
