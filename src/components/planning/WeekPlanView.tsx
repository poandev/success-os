"use client";
import { useState, useEffect } from "react";
import { getWeek, getYear, startOfWeek, endOfWeek, format } from "date-fns";
import {
  XMarkIcon,
  TrashIcon,
  PencilSquareIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface BigRock {
  roleName: string;
  task: string;
  targetDate: string;
  isCompleted?: boolean;
}

interface WeekPlan {
  _id?: string;
  weekIdentifier: string;
  bigRocks: BigRock[];
}

export default function WeekPlanView() {
  const [bigRocks, setBigRocks] = useState<BigRock[]>([]);
  const [pastPlans, setPastPlans] = useState<WeekPlan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"current" | "past">("current");
  const [searchWeek, setSearchWeek] = useState("");
  const [filteredPastPlans, setFilteredPastPlans] = useState<WeekPlan[]>([]);

  // 動畫狀態
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    roleName: "",
    task: "",
    targetDate: "",
  });

  const getWeekIdentifier = () => {
    const today = new Date();
    const year = getYear(today);
    const week = getWeek(today, { weekStartsOn: 1 });
    return `${year}-W${String(week).padStart(2, "0")}`;
  };

  const currentWeek = getWeekIdentifier();

  useEffect(() => {
    fetch(`/api/weekly-plans?week=${currentWeek}`)
      .then((res) => res.json())
      .then((data) => {
        setBigRocks(data.bigRocks || []);
      })
      .catch((err) => console.error(err));

    const fetchPastPlans = async () => {
      try {
        const res = await fetch("/api/weekly-plans");
        const data = await res.json();
        let plans: WeekPlan[] = [];
        if (Array.isArray(data)) plans = data;
        else if (data.plans) plans = data.plans;
        else if (data.weekIdentifier) plans = [data];

        const past = plans.filter(
          (plan) => plan.weekIdentifier !== currentWeek,
        );
        setPastPlans(past);
        setFilteredPastPlans(past);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPastPlans();
  }, []);

  const saveWeekPlan = async (newRocks: BigRock[]) => {
    try {
      await fetch("/api/weekly-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekIdentifier: currentWeek,
          bigRocks: newRocks,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRock = (index: number) => {
    if (confirm("確定要移除這顆大石頭嗎？")) {
      const newRocks = bigRocks.filter((_, i) => i !== index);
      setBigRocks(newRocks);
      saveWeekPlan(newRocks);
    }
  };

  const openEditModal = (index: number) => {
    // 觸發果凍動畫
    setAnimatingIndex(index);
    setTimeout(() => setAnimatingIndex(null), 500);

    const rock = bigRocks[index];
    setFormData({
      roleName: rock.roleName || "",
      task: rock.task || "",
      targetDate: rock.targetDate || "",
    });
    setEditingIndex(index);
    // 稍微延遲開啟 Modal
    setTimeout(() => setShowModal(true), 150);
  };

  const handleSaveRock = async () => {
    if (!formData.roleName || !formData.task || !formData.targetDate) {
      return alert("請填寫所有欄位");
    }
    const newRocks = [...bigRocks];
    if (editingIndex !== null) {
      newRocks[editingIndex] = {
        ...formData,
        isCompleted: newRocks[editingIndex].isCompleted,
      };
    } else {
      newRocks.push({ ...formData, isCompleted: false });
    }
    setBigRocks(newRocks);
    await saveWeekPlan(newRocks);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingIndex(null);
    setFormData({ roleName: "", task: "", targetDate: "" });
  };

  const handleSearchPastPlans = (query: string) => {
    setSearchWeek(query);
    const filtered = pastPlans.filter((plan) => {
      const matchWeek = plan.weekIdentifier.includes(query);
      const matchTask = plan.bigRocks.some((rock) =>
        rock.task.toLowerCase().includes(query.toLowerCase()),
      );
      const matchRole = plan.bigRocks.some((rock) =>
        rock.roleName.toLowerCase().includes(query.toLowerCase()),
      );
      return matchWeek || matchTask || matchRole;
    });
    setFilteredPastPlans(filtered);
  };

  const getWeekDateRange = (weekIdentifier: string) => {
    const [year, week] = weekIdentifier.split("-W");
    const date = new Date(parseInt(year), 0, 1);
    const weekNum = parseInt(week);
    date.setDate(date.getDate() + (weekNum - 1) * 7);
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return `${format(start, "MM/dd")} - ${format(end, "MM/dd")}`;
  };

  const getCompletionRate = (rocks: BigRock[]) => {
    if (rocks.length === 0) return 0;
    const completed = rocks.filter((r) => r.isCompleted).length;
    return Math.round((completed / rocks.length) * 100);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden pb-20 px-1 scrollbar-hide text-white">
      <style jsx global>{`
        @keyframes jelly {
          0% {
            transform: scale(1, 1);
          }
          25% {
            transform: scale(0.95, 1.05);
          }
          50% {
            transform: scale(1.05, 0.95);
          }
          75% {
            transform: scale(0.98, 1.02);
          }
          100% {
            transform: scale(1, 1);
          }
        }
        .animate-jelly {
          animation: jelly 0.4s ease-in-out;
        }
      `}</style>

      {/* --- 背景光影 --- */}
      <div className="fixed top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="fixed bottom-[10%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-900/10 rounded-full blur-[100px] -z-10" />

      {/* --- 模式切換器 --- */}
      <div className="flex gap-2 bg-white/5 backdrop-blur-md rounded-[2rem] p-1.5 shadow-lg border border-white/10 mx-2">
        <button
          onClick={() => setViewMode("current")}
          className={`flex-1 py-3 rounded-[1.5rem] font-black text-sm tracking-wide transition-all ${
            viewMode === "current"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          本週計畫
        </button>
        <button
          onClick={() => setViewMode("past")}
          className={`flex-1 py-3 rounded-[1.5rem] font-black text-sm tracking-wide transition-all ${
            viewMode === "past"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40"
              : "text-slate-400 hover:text-white"
          }`}
        >
          過往記錄
        </button>
      </div>

      {/* --- 本週計畫視圖 --- */}
      {viewMode === "current" && (
        <div className="space-y-6">
          {/* 儀表板卡片 */}
          <div className="mx-2 bg-gradient-to-br from-indigo-900/80 to-slate-900/80 backdrop-blur-xl p-8 rounded-[3rem] text-white shadow-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black italic tracking-tighter">
                    每週大石頭
                  </h2>
                  <p className="text-indigo-300 text-[10px] mt-1 uppercase tracking-[0.2em] font-bold">
                    First Things First
                  </p>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-full border border-white/10">
                  <span className="text-xs font-mono font-bold text-indigo-300">
                    {currentWeek}
                  </span>
                </div>
              </div>

              {(() => {
                const completed = bigRocks.filter((r) => r.isCompleted).length;
                const rate =
                  bigRocks.length > 0
                    ? Math.round((completed / bigRocks.length) * 100)
                    : 0;

                return (
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">
                        能量水準
                      </span>
                      <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        {rate}%
                      </span>
                    </div>
                    {/* 能量條 */}
                    <div className="h-4 w-full bg-black/40 rounded-full p-[3px] shadow-inner border border-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000 relative overflow-hidden"
                        style={{ width: `${rate}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <span className="text-[10px] font-mono text-white/40">
                        {completed} / {bigRocks.length} 完成
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* 大石頭列表 */}
          <div className="space-y-4 px-2">
            {bigRocks.map((rock, i) => {
              const isAnimating = animatingIndex === i;
              return (
                <div
                  key={i}
                  onClick={() => openEditModal(i)}
                  className={`group relative bg-white/[0.03] backdrop-blur-[30px] backdrop-saturate-[150%] p-5 rounded-[2.5rem] border flex items-center gap-5 transition-all duration-300 cursor-pointer active:scale-95
                  ${
                    rock.isCompleted
                      ? "border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                      : "border-white/5 hover:border-white/10 shadow-lg"
                  }
                  ${isAnimating ? "animate-jelly" : ""}`}
                >
                  {/* 左側指示條 */}
                  <div
                    className={`w-1.5 h-12 rounded-full shadow-[0_0_10px_currentColor]
                    ${rock.isCompleted ? "bg-emerald-400 text-emerald-400" : "bg-indigo-500 text-indigo-500"}`}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black tracking-[0.1em] uppercase text-white/40 mb-0.5">
                      {rock.roleName}
                    </p>
                    <p
                      className={`text-lg font-bold truncate transition-colors ${rock.isCompleted ? "text-emerald-400 line-through decoration-emerald-500/50" : "text-white"}`}
                    >
                      {rock.task}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <CalendarIcon className="w-3 h-3 text-slate-500" />
                      <p className="text-[10px] font-mono text-slate-500">
                        {rock.targetDate}
                      </p>
                    </div>
                  </div>

                  {rock.isCompleted && (
                    <div className="flex-shrink-0 bg-emerald-500/10 p-2 rounded-full border border-emerald-500/20">
                      <CheckCircleIcon className="w-6 h-6 text-emerald-400" />
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRock(i);
                    }}
                    className="p-3 rounded-2xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              );
            })}

            {/* 新增按鈕 */}
            <button
              onClick={() => {
                setEditingIndex(null);
                setFormData({ roleName: "", task: "", targetDate: "" });
                setShowModal(true);
              }}
              className="w-full py-6 bg-white/[0.02] backdrop-blur-sm border-2 border-dashed border-white/10 rounded-[2.5rem] text-white/30 font-black flex items-center justify-center gap-3 hover:bg-white/[0.05] hover:border-indigo-500/30 hover:text-indigo-400 transition-all active:scale-95 duration-300"
            >
              <PlusIcon className="w-6 h-6" />
              <span className="tracking-widest text-sm">放入大石頭</span>
            </button>
          </div>
        </div>
      )}

      {/* --- 過往計畫視圖 --- */}
      {viewMode === "past" && (
        <div className="space-y-6 px-2">
          {/* 搜尋欄 */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="搜尋過往記錄..."
              className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-[2rem] text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
              value={searchWeek}
              onChange={(e) => handleSearchPastPlans(e.target.value)}
            />
          </div>

          {filteredPastPlans.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-[3rem]">
              <p className="text-slate-600 font-mono text-sm">查無資料</p>
            </div>
          ) : (
            filteredPastPlans.map((plan, idx) => {
              const completionRate = getCompletionRate(plan.bigRocks);
              return (
                <div
                  key={idx}
                  className="bg-white/[0.03] backdrop-blur-md rounded-[2.5rem] p-6 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-black text-white font-mono">
                        {plan.weekIdentifier}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        {getWeekDateRange(plan.weekIdentifier)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-indigo-400">
                        {completionRate}%
                      </div>
                      <p className="text-[10px] text-slate-600 uppercase tracking-wider">
                        完成率
                      </p>
                    </div>
                  </div>

                  {/* 迷你進度條 */}
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>

                  {/* 唯讀列表 */}
                  <div className="space-y-2">
                    {plan.bigRocks.map((rock, i) => (
                      <div
                        key={i}
                        className={`px-4 py-3 rounded-xl border flex items-center gap-3 ${
                          rock.isCompleted
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-white/5 border-white/5"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${rock.isCompleted ? "bg-emerald-500" : "bg-slate-600"}`}
                        />
                        <p
                          className={`text-sm font-medium truncate ${rock.isCompleted ? "text-emerald-400/80 line-through" : "text-slate-300"}`}
                        >
                          {rock.task}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* --- 編輯/新增 Modal (Bottom Sheet) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={handleCloseModal}
          />
          <div className="relative bg-[#09090b] border border-white/10 w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8 sm:hidden" />

            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white tracking-tight">
                {editingIndex !== null ? "編輯大石頭" : "新增大石頭"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 bg-white/5 rounded-full text-slate-400 hover:bg-white/10"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase px-1 tracking-widest font-mono">
                  角色名稱
                </label>
                <input
                  type="text"
                  placeholder="例如：白金、日常..."
                  className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-3xl text-lg font-bold text-white placeholder:text-slate-700 focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all"
                  value={formData.roleName}
                  onChange={(e) =>
                    setFormData({ ...formData, roleName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase px-1 tracking-widest font-mono">
                  核心任務
                </label>
                <textarea
                  placeholder="這週最重要的事情是什麼？"
                  className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-3xl text-lg font-medium text-white placeholder:text-slate-700 focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all resize-none h-32"
                  value={formData.task}
                  onChange={(e) =>
                    setFormData({ ...formData, task: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase px-1 tracking-widest font-mono">
                  目標日期
                </label>
                <input
                  type="date"
                  className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-3xl text-lg font-bold text-white outline-none focus:bg-white/10 [color-scheme:dark] font-mono"
                  value={formData.targetDate}
                  onChange={(e) =>
                    setFormData({ ...formData, targetDate: e.target.value })
                  }
                />
              </div>

              <button
                onClick={handleSaveRock}
                className="w-full py-5 mt-4 bg-white text-black font-black rounded-3xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-indigo-50 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {editingIndex !== null ? "儲存變更" : "立即建立"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
