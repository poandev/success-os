"use client";
import { useState, useEffect, useMemo } from "react";
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  PresentationChartLineIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";
import {
  format,
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
} from "date-fns";

// --- 型別定義 ---
interface StockItem {
  _id: string;
  stockId: string;
  stockName: string;
  shares: number;
  avgCost: number;
  marketValue: number;
  refPrice: number;
}

interface TransactionItem {
  _id: string;
  date: string;
  type: "Income" | "Expense";
  category: string;
  amount: number;
  note: string;
}

// 預設分類選項
const CATEGORIES = {
  Expense: ["飲食", "交通", "購物", "娛樂", "居住", "醫療", "其他"],
  Income: ["薪資", "獎金", "投資", "兼職", "其他"],
};

export default function FinanceDashboard() {
  const [tab, setTab] = useState<"Invest" | "Cashflow">("Invest"); // 預設可改為 Cashflow 方便測試
  const [showModal, setShowModal] = useState(false); // 股票 Modal
  const [showTransModal, setShowTransModal] = useState(false); // 記帳 Modal
  const [loading, setLoading] = useState(true);

  // --- 股票狀態 ---
  const [stocks, setStocks] = useState<StockItem[]>([]);
  // --- 收支狀態 ---
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date()); // 當前選擇月份

  // --- 表單狀態 (股票) ---
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<StockItem>>({
    stockId: "",
    stockName: "",
    shares: 0,
    avgCost: 0,
    marketValue: 0,
    refPrice: 0,
  });

  // --- 表單狀態 (記帳) ---
  const [transFormData, setTransFormData] = useState<{
    date: string;
    type: "Income" | "Expense";
    category: string;
    amount: number;
    note: string;
  }>({
    date: format(new Date(), "yyyy-MM-dd"),
    type: "Expense",
    category: "飲食",
    amount: 0,
    note: "",
  });

  // ================= API 操作 =================

  // 1. 取得股票
  const fetchStocks = async () => {
    try {
      const res = await fetch("/api/finance/stocks");
      const data = await res.json();
      if (Array.isArray(data)) setStocks(data);
    } catch (e) {
      console.error(e);
    }
  };

  // 2. 取得收支 (依月份)
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const monthStr = format(currentMonth, "yyyy-MM");
      const res = await fetch(`/api/finance/transactions?month=${monthStr}`);
      const data = await res.json();
      if (Array.isArray(data)) setTransactions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 初始化與月份切換時讀取
  useEffect(() => {
    if (tab === "Invest") fetchStocks();
    if (tab === "Cashflow") fetchTransactions();
  }, [tab, currentMonth]);

  // --- 股票相關 Handler (省略重複部分，保持功能) ---
  const handleStockSubmit = async () => {
    /* ...沿用上一版邏輯... */
    if (!formData.stockId || !formData.stockName)
      return alert("請輸入代號與名稱");
    await fetch("/api/finance/stocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setShowModal(false);
    fetchStocks();
  };
  const handleStockDelete = async () => {
    /* ...沿用上一版邏輯... */
    if (!formData._id) return;
    await fetch(`/api/finance/stocks?id=${formData._id}`, { method: "DELETE" });
    setShowModal(false);
    fetchStocks();
  };
  const handleEditClick = (stock: StockItem) => {
    setIsEditing(true);
    setFormData(stock);
    setShowModal(true);
  };
  const handleAddClick = () => {
    setIsEditing(false);
    setFormData({
      stockId: "",
      stockName: "",
      shares: 0,
      avgCost: 0,
      marketValue: 0,
      refPrice: 0,
    });
    setShowModal(true);
  };

  // --- 記帳相關 Handler ---
  const handleTransSubmit = async () => {
    if (!transFormData.amount || !transFormData.category)
      return alert("請輸入金額與分類");

    try {
      await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transFormData),
      });
      setShowTransModal(false);
      // 重置表單但保留日期，方便連續記帳
      setTransFormData((prev) => ({ ...prev, amount: 0, note: "" }));
      fetchTransactions();
    } catch (e) {
      alert("記帳失敗");
    }
  };

  const handleTransDelete = async (id: string) => {
    if (!confirm("確定刪除此紀錄？")) return;
    await fetch(`/api/finance/transactions?id=${id}`, { method: "DELETE" });
    fetchTransactions();
  };

  // 月份切換
  const prevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const nextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  // ================= 計算邏輯 =================

  // 股票統計
  const portfolioStats = useMemo(() => {
    let totalMarketValue = 0;
    let totalCost = 0;
    stocks.forEach((s) => {
      const shares = Number(s.shares) || 0;
      const avgCost = Number(s.avgCost) || 0;
      const marketValue = Number(s.marketValue) || 0;
      totalMarketValue += marketValue;
      totalCost += shares * avgCost;
    });
    const totalProfit = totalMarketValue - totalCost;
    const profitRate = totalCost === 0 ? 0 : (totalProfit / totalCost) * 100;
    return { totalMarketValue, totalCost, totalProfit, profitRate };
  }, [stocks]);

  // 收支統計 (當月)
  const cashflowStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      if (t.type === "Income") income += t.amount;
      if (t.type === "Expense") expense += t.amount;
    });
    return { income, expense, balance: income - expense };
  }, [transactions]);

  // 總資產 = 股票現值 + (這裡簡單用收支結餘當現金，或您想手動輸入現金也可)
  // 這裡我們先假設 `Cashflow` 的結餘只是當月的，總現金可能需要另外儲存。
  // 為求簡單，我們這裡還是用 portfolioStats 顯示股票，現金顯示當月結餘 (或可改為累計)

  const fMoney = (n: number) =>
    n.toLocaleString("zh-TW", {
      style: "currency",
      currency: "TWD",
      maximumFractionDigits: 0,
    });
  const fRate = (n: number) => {
    if (isNaN(n) || !isFinite(n)) return "0.00%";
    return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
  };

  return (
    <div className="h-full w-full bg-[#09090b] text-white flex flex-col font-sans overflow-hidden">
      {/* --- 頂部：資產戰情總覽 --- */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-white/10 shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 顯示內容根據 Tab 切換不同重點 */}
          {tab === "Invest" ? (
            <>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                  股票總資產
                </p>
                <p className="text-xl md:text-2xl font-black text-white tracking-tight">
                  {fMoney(portfolioStats.totalMarketValue)}
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                  總損益 (P&L)
                </p>
                <div
                  className={`flex items-end gap-2 ${portfolioStats.totalProfit >= 0 ? "text-red-400" : "text-green-400"}`}
                >
                  <p className="text-xl md:text-2xl font-black tracking-tight">
                    {portfolioStats.totalProfit > 0 ? "+" : ""}
                    {fMoney(portfolioStats.totalProfit)}
                  </p>
                  <span className="text-xs font-bold mb-1 bg-white/10 px-1.5 py-0.5 rounded">
                    {fRate(portfolioStats.profitRate)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                  本月結餘
                </p>
                <p
                  className={`text-xl md:text-2xl font-black tracking-tight ${cashflowStats.balance >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {fMoney(cashflowStats.balance)}
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
                  本月支出
                </p>
                <p className="text-xl md:text-2xl font-black text-white tracking-tight">
                  {fMoney(cashflowStats.expense)}
                </p>
              </div>
            </>
          )}

          {/* 通用資訊 (大螢幕顯示) */}
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md hidden md:block">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
              本月收入
            </p>
            <p className="text-xl font-bold text-emerald-300">
              {fMoney(cashflowStats.income)}
            </p>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md hidden md:block">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
              總投入成本
            </p>
            <p className="text-xl font-bold text-slate-300">
              {fMoney(portfolioStats.totalCost)}
            </p>
          </div>
        </div>
      </div>

      {/* --- 切換 Tabs --- */}
      <div className="flex border-b border-white/10 shrink-0">
        <button
          onClick={() => setTab("Invest")}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${tab === "Invest" ? "text-indigo-400 border-b-2 border-indigo-500 bg-white/5" : "text-slate-500 hover:text-slate-300"}`}
        >
          <PresentationChartLineIcon className="w-4 h-4" /> 股票庫存
        </button>
        <button
          onClick={() => setTab("Cashflow")}
          className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all ${tab === "Cashflow" ? "text-emerald-400 border-b-2 border-emerald-500 bg-white/5" : "text-slate-500 hover:text-slate-300"}`}
        >
          <BanknotesIcon className="w-4 h-4" /> 收支記帳
        </button>
      </div>

      {/* --- 內容區域 --- */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide relative">
        {/* === 投資視圖 === */}
        {tab === "Invest" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full" /> 持股明細
              </h3>
              <button
                onClick={handleAddClick}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors active:scale-95"
              >
                <PlusIcon className="w-4 h-4" /> 新增持股
              </button>
            </div>
            <div className="grid gap-3">
              {stocks.map((stock) => {
                const shares = Number(stock.shares) || 0;
                const avgCost = Number(stock.avgCost) || 0;
                const marketValue = Number(stock.marketValue) || 0;
                const refPrice = Number(stock.refPrice) || 0;
                const cost = shares * avgCost;
                const profit = marketValue - cost;
                const rate = cost === 0 ? 0 : (profit / cost) * 100;
                const isProfitable = profit >= 0;

                return (
                  <div
                    key={stock.stockId}
                    onClick={() => handleEditClick(stock)}
                    className="bg-[#18181b] border border-white/5 rounded-2xl p-4 relative overflow-hidden group active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div
                      className={`absolute right-0 top-0 w-32 h-32 blur-[60px] opacity-20 rounded-full pointer-events-none ${isProfitable ? "bg-red-600" : "bg-green-600"}`}
                    />
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-white/10 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono">
                            {stock.stockId}
                          </span>
                          <h4 className="text-lg font-black text-white">
                            {stock.stockName}
                          </h4>
                        </div>
                        <div className="flex gap-4 text-xs text-slate-400">
                          <span>{shares} 股</span>
                          <span>成本 {avgCost}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-black ${isProfitable ? "text-red-400" : "text-green-400"}`}
                        >
                          {fMoney(profit)}
                        </p>
                        <p
                          className={`text-xs font-bold ${isProfitable ? "text-red-400/80" : "text-green-400/80"}`}
                        >
                          {fRate(rate)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-xs">
                      <div className="text-slate-500">
                        參考價{" "}
                        <span className="text-white font-mono font-bold text-sm ml-1">
                          {refPrice}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">總現值</span>
                        <span className="text-indigo-300 font-mono font-bold text-base">
                          {fMoney(marketValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* === 收支視圖 (已實作) === */}
        {tab === "Cashflow" && (
          <div className="space-y-6">
            {/* 月份切換器 */}
            <div className="flex items-center justify-between bg-white/5 p-2 rounded-2xl border border-white/10">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-500" />
                <span className="text-lg font-black tracking-wide font-mono text-white">
                  {format(currentMonth, "yyyy年 MM月")}
                </span>
              </div>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* 記帳按鈕 */}
            <button
              onClick={() => setShowTransModal(true)}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-6 h-6" /> 記一筆
            </button>

            {/* 交易列表 */}
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-10 text-slate-600 font-mono">
                  本月尚無紀錄
                </div>
              ) : (
                transactions.map((t) => (
                  <div
                    key={t._id}
                    className="bg-[#18181b] border border-white/5 rounded-2xl p-4 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                                        ${t.type === "Income" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}
                      >
                        {t.category[0]}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">
                          {t.category}{" "}
                          <span className="text-slate-500 text-xs font-normal ml-2">
                            {t.note}
                          </span>
                        </p>
                        <p className="text-slate-500 text-xs font-mono">
                          {t.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p
                        className={`font-mono font-bold text-base ${t.type === "Income" ? "text-emerald-400" : "text-white"}`}
                      >
                        {t.type === "Income" ? "+" : "-"}
                        {t.amount}
                      </p>
                      <button
                        onClick={() => handleTransDelete(t._id)}
                        className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- 股票 Modal (保持不變) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#18181b] w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-black text-white mb-6">
              {isEditing ? "編輯持股" : "新增持股"}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-xs text-slate-500 mb-1 block">
                    代號
                  </label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="2330"
                    value={formData.stockId}
                    onChange={(e) =>
                      setFormData({ ...formData, stockId: e.target.value })
                    }
                    disabled={isEditing}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">
                    名稱
                  </label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="台積電"
                    value={formData.stockName}
                    onChange={(e) =>
                      setFormData({ ...formData, stockName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    持有股數
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                    value={formData.shares}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shares: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    平均成本
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                    value={formData.avgCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        avgCost: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    參考價 (市價)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-center"
                    value={formData.refPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        refPrice: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-emerald-400 font-bold mb-1 block">
                    總現值 (含稅)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border-2 border-emerald-500/30 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500 font-mono text-center"
                    value={formData.marketValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        marketValue: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              {isEditing && (
                <button
                  onClick={handleStockDelete}
                  className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleStockSubmit}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-500/25"
              >
                {isEditing ? "儲存變更" : "確認新增"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 記帳 Modal --- */}
      {showTransModal && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowTransModal(false)}
          />
          <div className="relative bg-[#18181b] w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 border border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white">記一筆</h3>
              <button
                onClick={() => setShowTransModal(false)}
                className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              {/* 收支類型切換 */}
              <div className="flex bg-white/5 p-1 rounded-xl">
                <button
                  onClick={() =>
                    setTransFormData({ ...transFormData, type: "Expense" })
                  }
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${transFormData.type === "Expense" ? "bg-rose-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                >
                  支出
                </button>
                <button
                  onClick={() =>
                    setTransFormData({ ...transFormData, type: "Income" })
                  }
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${transFormData.type === "Income" ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                >
                  收入
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  金額
                </label>
                <input
                  type="number"
                  value={transFormData.amount || ""}
                  onChange={(e) =>
                    setTransFormData({
                      ...transFormData,
                      amount: Number(e.target.value),
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                  placeholder="0"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-2 block">
                  分類
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES[transFormData.type].map((cat) => (
                    <button
                      key={cat}
                      onClick={() =>
                        setTransFormData({ ...transFormData, category: cat })
                      }
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all
                                    ${
                                      transFormData.category === cat
                                        ? "bg-white text-black border-white font-bold"
                                        : "bg-white/5 text-slate-400 border-transparent hover:bg-white/10"
                                    }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    日期
                  </label>
                  <input
                    type="date"
                    value={transFormData.date}
                    onChange={(e) =>
                      setTransFormData({
                        ...transFormData,
                        date: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">
                    備註
                  </label>
                  <input
                    type="text"
                    value={transFormData.note}
                    onChange={(e) =>
                      setTransFormData({
                        ...transFormData,
                        note: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="午餐..."
                  />
                </div>
              </div>

              <button
                onClick={handleTransSubmit}
                className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
              >
                確認儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
