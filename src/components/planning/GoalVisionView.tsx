"use client";
import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  FireIcon,
  TrophyIcon,
  XMarkIcon,
  SparklesIcon,
  PlusIcon,
  CalendarIcon,
  BoltIcon,
  ArrowsUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import { getWeek, getYear } from "date-fns";

interface Habit {
  _id: string;
  title: string;
  anchor: string;
  action: string;
  streak: number;
  lastCompletedDate: string;
  order: number;
}

interface BigRock {
  roleId?: string;
  roleName?: string;
  task: string;
  isCompleted?: boolean;
  targetDate?: string;
  goalId?: string;
}

interface WeekPlan {
  bigRocks?: BigRock[];
}

export default function DayExecutionView() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    anchor: "",
    action: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  // 排序模式狀態
  const [isReordering, setIsReordering] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchHabits = async () => {
    try {
      const res = await fetch("/api/habits");
      const data = await res.json();
      // 確保按 order 排序
      const sortedData = Array.isArray(data)
        ? data.sort((a: Habit, b: Habit) => a.order - b.order)
        : [];
      setHabits(sortedData);
    } catch (error) {
      console.error("Failed to fetch habits", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
    const getWeekIdentifier = () => {
      const today = new Date();
      const year = getYear(today);
      const week = getWeek(today, { weekStartsOn: 1 });
      return `${year}-W${String(week).padStart(2, "0")}`;
    };
    fetch(`/api/weekly-plans?week=${getWeekIdentifier()}`)
      .then((res) => res.json())
      .then((data) => setWeekPlan(data))
      .catch((err) => console.error("Failed to fetch weekly plan:", err));
  }, []);

  const triggerJelly = (id: string) => {
    setAnimatingId(id);
    setTimeout(() => setAnimatingId(null), 500);
  };

  // --- 處理順序變更邏輯 ---
  const handleMoveHabit = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === habits.length - 1) return;

    const newHabits = [...habits];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    // 交換位置
    [newHabits[index], newHabits[targetIndex]] = [
      newHabits[targetIndex],
      newHabits[index],
    ];

    // 更新本地狀態以獲得即時反饋
    setHabits(newHabits);

    // 更新資料庫順序
    const updatedHabits = newHabits.map((habit, idx) => ({
      id: habit._id,
      order: idx,
    }));

    try {
      await fetch("/api/habits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits: updatedHabits }),
      });
    } catch (error) {
      console.error("Failed to update order", error);
      fetchHabits(); // 失敗則回滾
    }
  };

  const handleCreateHabit = async () => {
    if (!formData.title || !formData.anchor || !formData.action) return;
    const url = editingId ? `/api/habits/${editingId}` : "/api/habits";
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchHabits();
        setShowHabitModal(false);
        setFormData({ title: "", anchor: "", action: "" });
        setEditingId(null);
      }
    } catch (error) {
      console.error("Failed to save habit", error);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!confirm("確定要刪除這個習慣嗎？")) return;
    try {
      const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
      if (res.ok) fetchHabits();
    } catch (error) {
      console.error("Failed to delete habit", error);
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setFormData({
      title: habit.title,
      anchor: habit.anchor,
      action: habit.action,
    });
    setEditingId(habit._id);
    setShowHabitModal(true);
  };

  const toggleHabit = async (id: string, lastDate: string) => {
    if (isReordering) return; // 排序模式下禁用打卡
    triggerJelly(id);
    const method = lastDate === todayStr ? "DELETE" : "POST";
    try {
      const res = await fetch(`/api/habits/${id}/check`, { method });
      if (res.ok) fetchHabits();
    } catch (error) {
      console.error("Failed to toggle habit", error);
    }
  };

  const toggleBigRock = async (originalIndex: number) => {
    triggerJelly(`rock-${originalIndex}`);
    if (!weekPlan?.bigRocks) return;

    // 正確的不可變更新 (Immutability)
    const updatedRocks = weekPlan.bigRocks.map((rock, idx) =>
      idx === originalIndex
        ? { ...rock, isCompleted: !rock.isCompleted }
        : rock,
    );

    setWeekPlan({ ...weekPlan, bigRocks: updatedRocks });

    const week = getWeek(new Date(), { weekStartsOn: 1 });
    const year = getYear(new Date());
    const weekId = `${year}-W${String(week).padStart(2, "0")}`;

    try {
      await fetch("/api/weekly-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekIdentifier: weekId,
          bigRocks: updatedRocks,
        }),
      });
    } catch (error) {
      console.error("Failed to update big rock", error);
    }
  };

  const completedHabits = habits.filter(
    (h) => h.lastCompletedDate === todayStr,
  ).length;
  const progress =
    habits.length > 0 ? (completedHabits / habits.length) * 100 : 0;

  return (
    <div className="h-[calc(100dvh-90px)] w-full flex flex-col overflow-hidden bg-transparent text-white pt-2 select-none">
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
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* 背景光影 */}
      <div className="fixed top-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-fuchsia-900/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* 1. 今日戰報 */}
      <div className="flex-shrink-0 px-2 pb-2">
        <div className="bg-gradient-to-br from-indigo-900/80 to-slate-950/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[50px] pointer-events-none" />
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter">
                今日戰報
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <p className="text-indigo-200 text-[10px] font-mono tracking-widest uppercase">
                  {todayStr}
                </p>
              </div>
            </div>
            <div className="bg-white/5 p-2 rounded-2xl backdrop-blur-md border border-white/10">
              <TrophyIcon className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" />
            </div>
          </div>
          <div className="space-y-2 relative z-10">
            <div className="flex justify-between items-end px-1">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em]">
                達成率
              </span>
              <span className="text-3xl font-black text-white">
                {Math.round(progress)}
                <span className="text-sm align-top">%</span>
              </span>
            </div>
            <div className="h-3 w-full bg-black/40 rounded-full p-[2px] shadow-inner border border-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] transition-all duration-1000 relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 今日大石頭 */}
      <div className="flex-1 min-h-0 flex flex-col justify-center px-2 py-1">
        <div className="flex justify-between items-center mb-1 px-2">
          <h3 className="flex items-center gap-2 font-black text-white text-sm tracking-wide">
            <SparklesIcon className="w-4 h-4 text-indigo-400" />
            今日要事
          </h3>
          {weekPlan?.bigRocks && (
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
              {
                weekPlan.bigRocks.filter(
                  (r) => r.targetDate === todayStr && r.isCompleted,
                ).length
              }{" "}
              /{" "}
              {
                weekPlan.bigRocks.filter((r) => r.targetDate === todayStr)
                  .length
              }
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide px-1 py-1 h-full">
          {weekPlan?.bigRocks &&
          weekPlan.bigRocks.filter((r) => r.targetDate === todayStr).length >
            0 ? (
            weekPlan.bigRocks
              .map((rock, originalIndex) => ({ rock, originalIndex }))
              .filter((item) => item.rock.targetDate === todayStr)
              .map((item, displayIndex) => {
                const isAnimating =
                  animatingId === `rock-${item.originalIndex}`;
                return (
                  <div
                    key={displayIndex}
                    onClick={() => toggleBigRock(item.originalIndex)}
                    className={`bg-white/[0.03] backdrop-blur-xl p-4 rounded-[2rem] border flex flex-col justify-between flex-shrink-0 w-48 h-full max-h-[160px] cursor-pointer transition-all duration-300
                    ${
                      item.rock.isCompleted
                        ? "border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                        : "border-white/5 shadow-lg"
                    }
                    ${isAnimating ? "animate-jelly" : "hover:border-white/20 active:scale-95"}`}
                  >
                    <div className="flex justify-between items-start">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-inner 
                        ${item.rock.isCompleted ? "bg-emerald-500 text-white" : "bg-white/5 text-indigo-400 border border-white/5"}`}
                      >
                        {displayIndex + 1}
                      </div>
                      {item.rock.isCompleted && (
                        <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-widest truncate mb-1">
                        {item.rock.roleName}
                      </p>
                      <p
                        className={`text-sm font-bold leading-snug line-clamp-2 ${item.rock.isCompleted ? "text-emerald-300 line-through decoration-emerald-500/50" : "text-white"}`}
                      >
                        {item.rock.task}
                      </p>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="w-full h-full max-h-[160px] flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[2rem] bg-white/[0.01] text-slate-500">
              <CalendarIcon className="w-8 h-8 opacity-50 mb-2" />
              <p className="text-xs font-mono">今日無排程</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. 原子習慣 (排序開關) */}
      <div className="flex-1 min-h-0 flex flex-col justify-center px-2 py-1">
        <div className="flex justify-between items-center mb-1 px-2">
          <h3 className="flex items-center gap-2 font-black text-white text-sm tracking-wide">
            <BoltIcon className="w-4 h-4 text-amber-400" />
            原子習慣
          </h3>
          <div className="flex gap-2">
            {/* 排序按鈕 */}
            <button
              onClick={() => setIsReordering(!isReordering)}
              className={`p-1.5 rounded-full transition-colors ${isReordering ? "bg-indigo-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
              aria-label="排序習慣"
            >
              <ArrowsUpDownIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowHabitModal(true)}
              className="p-1.5 bg-amber-500/20 rounded-full hover:bg-amber-500/40 transition-colors"
              aria-label="新增習慣"
            >
              <PlusIcon className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide px-1 py-1 h-full">
          {habits.map((habit, index) => {
            const isDone = habit.lastCompletedDate === todayStr;
            const isAnimating = animatingId === habit._id;

            return (
              <div
                key={habit._id}
                onClick={() => toggleHabit(habit._id, habit.lastCompletedDate)}
                className={`relative p-4 rounded-[2rem] flex flex-col justify-between flex-shrink-0 w-48 h-full max-h-[160px] border transition-all duration-300
                ${isDone ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]" : "bg-white/[0.03] border-white/5 backdrop-blur-xl shadow-lg hover:border-white/10"}
                ${isAnimating ? "animate-jelly" : isReordering ? "" : "active:scale-95 cursor-pointer"}`}
              >
                {/* 排序模式覆蓋層 */}
                {isReordering && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 rounded-[2rem] flex items-center justify-center gap-4 animate-in fade-in duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveHabit(index, "up");
                      }}
                      disabled={index === 0}
                      className="p-3 bg-white/10 rounded-full hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-white/10 transition-colors"
                      aria-label="上移"
                    >
                      <ChevronUpIcon className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveHabit(index, "down");
                      }}
                      disabled={index === habits.length - 1}
                      className="p-3 bg-white/10 rounded-full hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-white/10 transition-colors"
                      aria-label="下移"
                    >
                      <ChevronDownIcon className="w-6 h-6 text-white" />
                    </button>
                  </div>
                )}

                {/* 卡片頭部：改用 Flex justify-between 確保不重疊 */}
                <div className="flex justify-between items-start w-full">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl border ${isDone ? "bg-amber-500 text-white border-amber-400" : "bg-white/5 text-amber-500/60 border-white/5"}`}
                    >
                      <FireIcon
                        className={`w-4 h-4 ${isDone ? "animate-pulse" : ""}`}
                      />
                    </div>
                    {/* 將天數放在左側，火苗旁邊 */}
                    <span className="text-[10px] font-mono font-black text-amber-600/80 bg-amber-900/20 px-2 py-0.5 rounded-lg border border-amber-500/10 whitespace-nowrap">
                      {habit.streak} 天
                    </span>
                  </div>

                  {/* 編輯按鈕：放在最右側，確保有空間 */}
                  {!isReordering && (
                    <button
                      className="p-1.5 text-slate-600 hover:text-white z-10 bg-white/5 rounded-full hover:bg-white/10 transition-colors ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditHabit(habit);
                      }}
                      aria-label="編輯習慣"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="mt-2">
                  <div className="mb-1">
                    <p
                      className={`text-base font-bold leading-tight transition-colors truncate ${isDone ? "text-amber-200" : "text-white"}`}
                    >
                      {habit.title}
                    </p>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-400 flex items-center gap-1 truncate">
                      <span className="w-1 h-1 bg-slate-500 rounded-full shrink-0" />{" "}
                      {habit.anchor} 之後
                    </p>
                    <p className="text-[9px] text-slate-400 flex items-center gap-1 truncate">
                      <span className="w-1 h-1 bg-amber-500 rounded-full shrink-0" />{" "}
                      我就會 {habit.action}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Dark Bottom Sheet */}
      {showHabitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end">
          <div className="bg-[#09090b] border border-white/10 w-full rounded-t-[3rem] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl shadow-black">
            <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8" />
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <BoltIcon className="w-6 h-6 text-amber-500" />
                {editingId ? "編輯習慣" : "新增原子習慣"}
              </h3>
              <button
                onClick={() => {
                  setShowHabitModal(false);
                  setEditingId(null);
                  setFormData({ title: "", anchor: "", action: "" });
                }}
                className="p-2 bg-white/5 rounded-full text-slate-400 hover:bg-white/10"
                aria-label="關閉"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase px-1 tracking-widest font-mono">
                  習慣名稱
                </label>
                <input
                  type="text"
                  placeholder="例如：閱讀"
                  className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-3xl text-lg font-bold text-white outline-none focus:bg-white/10 focus:border-amber-500/50 transition-all"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="p-6 bg-amber-500/5 rounded-[2rem] border border-amber-500/20 space-y-4">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                  <SparklesIcon className="w-3 h-3" /> 習慣疊加法
                </p>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 ml-2">
                    當我做完... (既有習慣)
                  </label>
                  <input
                    placeholder="(例如：刷牙)"
                    className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-2xl text-white outline-none focus:border-amber-500/50"
                    value={formData.anchor}
                    onChange={(e) =>
                      setFormData({ ...formData, anchor: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 ml-2">
                    我就會... (新習慣)
                  </label>
                  <input
                    placeholder="(例如：看一頁書)"
                    className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-2xl text-white outline-none focus:border-amber-500/50"
                    value={formData.action}
                    onChange={(e) =>
                      setFormData({ ...formData, action: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-3">
                {editingId && (
                  <button
                    onClick={() => {
                      handleDeleteHabit(editingId);
                      setShowHabitModal(false);
                    }}
                    className="flex-1 py-5 bg-red-500/10 text-red-500 font-black rounded-3xl hover:bg-red-500/20 transition-all"
                  >
                    刪除
                  </button>
                )}
                <button
                  onClick={handleCreateHabit}
                  className="flex-[2] py-5 bg-white text-black font-black rounded-3xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-amber-50 transition-all active:scale-95"
                >
                  {editingId ? "儲存變更" : "立即啟用"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
