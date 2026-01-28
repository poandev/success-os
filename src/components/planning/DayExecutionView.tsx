"use client";
import { useState, useEffect } from "react";
import {
  CheckCircleIcon,
  FireIcon,
  TrophyIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { getWeek, getYear } from "date-fns";
import { zhTW } from "date-fns/locale";
import { CheckCircleIcon as OutlineCheck } from "@heroicons/react/24/outline";

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  // 在 useEffect 前定義 fetchHabits
  const fetchHabits = async () => {
    const res = await fetch("/api/habits");
    const data = await res.json();
    setHabits(data);
    setLoading(false);
  };

  useEffect(() => {
    const fetchHabits = async () => {
      const res = await fetch("/api/habits");
      const data = await res.json();
      setHabits(data);
      setLoading(false);
    };
    fetchHabits();

    // 取得當週計畫
    const getWeekIdentifier = () => {
      const today = new Date();
      const year = getYear(today);
      const week = getWeek(today, { weekStartsOn: 1 }); // 週一為第一天
      // console.log("Current week number:", week);
      return `${year}-W${String(week).padStart(2, "0")}`;
    };

    fetch(`/api/weekly-plans?week=${getWeekIdentifier()}`)
      .then((res) => res.json())
      .then((data) => setWeekPlan(data))
      .catch((err) => console.error("Failed to fetch weekly plan:", err));
  }, []);

  const handleCreateHabit = async () => {
    if (!formData.title || !formData.anchor || !formData.action) return;

    if (editingId) {
      // 更新現有習慣
      const res = await fetch(`/api/habits/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchHabits();
        setShowHabitModal(false);
        setFormData({ title: "", anchor: "", action: "" });
        setEditingId(null);
      }
    } else {
      // 新增習慣
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchHabits();
        setShowHabitModal(false);
        setFormData({ title: "", anchor: "", action: "" });
      }
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

  const handleDeleteHabit = async (id: string) => {
    if (!confirm("確定要刪除這個習慣嗎？")) return;

    const res = await fetch(`/api/habits/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchHabits();
    }
  };

  const toggleHabit = async (id: string, lastDate: string) => {
    const isCheckedToday = lastDate === todayStr;
    const method = isCheckedToday ? "DELETE" : "POST";
    const res = await fetch(`/api/habits/${id}/check`, { method });
    if (res.ok) fetchHabits();
  };

  const toggleBigRock = async (originalIndex: number) => {
    if (!weekPlan?.bigRocks) return;

    const updatedRocks = [...weekPlan.bigRocks];
    updatedRocks[originalIndex].isCompleted =
      !updatedRocks[originalIndex].isCompleted;

    // 這裡需要調用 API 保存狀態
    const week = getWeek(new Date(), { weekStartsOn: 1 });
    const year = getYear(new Date());
    const weekId = `${year}-W${String(week).padStart(2, "0")}`;

    await fetch("/api/weekly-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekIdentifier: weekId,
        bigRocks: updatedRocks,
      }),
    });

    setWeekPlan({ ...weekPlan, bigRocks: updatedRocks });
  };

  // 拖拽處理
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newHabits = [...habits];
    const draggedItem = newHabits[draggedIndex];
    newHabits.splice(draggedIndex, 1);
    newHabits.splice(index, 0, draggedItem);

    setHabits(newHabits);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    // 更新資料庫中的順序
    const updatedHabits = habits.map((habit, index) => ({
      id: habit._id,
      order: index,
    }));

    await fetch("/api/habits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habits: updatedHabits }),
    });

    setDraggedIndex(null);
  };

  // 移動端觸摸拖拽處理
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    setDraggedIndex(index);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent, currentIndex: number) => {
    if (draggedIndex === null) return;

    const touchY = e.touches[0].clientY;
    const deltaY = touchY - touchStartY;

    // 根據移動距離判斷是否需要交換位置
    const cardHeight = 200; // 估計卡片高度
    const moveThreshold = cardHeight / 2;

    if (Math.abs(deltaY) > moveThreshold) {
      const direction = deltaY > 0 ? 1 : -1;
      let targetIndex = currentIndex + direction;

      // 處理雙列布局：需要跳兩格
      if (Math.abs(deltaY) > cardHeight * 1.5) {
        targetIndex = currentIndex + direction * 2;
      }

      // 確保索引在有效範圍內
      if (
        targetIndex >= 0 &&
        targetIndex < habits.length &&
        targetIndex !== draggedIndex
      ) {
        const newHabits = [...habits];
        const draggedItem = newHabits[draggedIndex];
        newHabits.splice(draggedIndex, 1);
        newHabits.splice(targetIndex, 0, draggedItem);

        setHabits(newHabits);
        setDraggedIndex(targetIndex);
        setTouchStartY(touchY);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (draggedIndex === null) return;

    // 更新資料庫中的順序
    const updatedHabits = habits.map((habit, index) => ({
      id: habit._id,
      order: index,
    }));

    await fetch("/api/habits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habits: updatedHabits }),
    });

    setDraggedIndex(null);
  };

  const completedHabits = habits.filter(
    (h) => h.lastCompletedDate === todayStr,
  ).length;
  const progress =
    habits.length > 0 ? (completedHabits / habits.length) * 100 : 0;

  return (
    <div className="space-y-8 pb-24">
      {/* 1. 今日戰報儀表板 */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-black">今日戰報</h2>
            <p className="text-indigo-100 text-sm mt-1">
              {todayStr} · 磨利鋸子中
            </p>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
            <TrophyIcon className="w-6 h-6 text-yellow-300" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold px-1">
            <span>習慣達成率</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. 今日大石頭區塊 */}
      {weekPlan?.bigRocks && weekPlan.bigRocks.length > 0 && (
        <section className="flex flex-col h-56">
          <div className="flex flex-col gap-3 px-2 flex-shrink-0">
            <div className="flex justify-between items-start">
              <h3 className="font-black text-slate-800 uppercase tracking-tighter text-sm md:text-base">
                今日大石頭
              </h3>
              {(() => {
                const todayRocks = weekPlan.bigRocks.filter(
                  (rock) => rock.targetDate === todayStr,
                );
                const completedToday = todayRocks.filter(
                  (r) => r.isCompleted,
                ).length;
                const rateToday =
                  todayRocks.length > 0
                    ? Math.round((completedToday / todayRocks.length) * 100)
                    : 0;
                return (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl md:text-3xl font-black text-green-600">
                      {rateToday}%
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      {completedToday}/{todayRocks.length}
                    </span>
                  </div>
                );
              })()}
            </div>
            {(() => {
              const todayRocks = weekPlan.bigRocks.filter(
                (rock) => rock.targetDate === todayStr,
              );
              const completedToday = todayRocks.filter(
                (r) => r.isCompleted,
              ).length;
              const rateToday =
                todayRocks.length > 0
                  ? Math.round((completedToday / todayRocks.length) * 100)
                  : 0;
              return (
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all duration-300"
                    style={{ width: `${rateToday}%` }}
                  />
                </div>
              );
            })()}
          </div>
          <div className="mt-4 overflow-x-auto flex-1 flex gap-4 pb-4">
            {weekPlan.bigRocks
              .map((rock, originalIndex) => ({
                rock,
                originalIndex,
              }))
              .filter((item) => item.rock.targetDate === todayStr)
              .map((item, displayIndex) => (
                <div
                  key={displayIndex}
                  className={`bg-white p-5 rounded-3xl shadow-sm border flex flex-col gap-3 flex-shrink-0 w-48 cursor-pointer transition-all ${
                    item.rock.isCompleted
                      ? "border-green-200 bg-green-50"
                      : "border-slate-100"
                  }`}
                  onClick={() => toggleBigRock(item.originalIndex)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        item.rock.isCompleted ? "bg-green-100" : "bg-indigo-50"
                      }`}
                    >
                      <span
                        className={`font-black text-xs ${
                          item.rock.isCompleted
                            ? "text-green-600"
                            : "text-indigo-600"
                        }`}
                      >
                        {displayIndex + 1}
                      </span>
                    </div>
                    {item.rock.isCompleted && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 ml-auto" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {item.rock.roleName || "角色"}
                    </p>
                    <p
                      className={`text-sm font-bold line-clamp-3 ${
                        item.rock.isCompleted
                          ? "text-slate-400 line-through"
                          : "text-slate-700"
                      }`}
                    >
                      {item.rock.task}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* 3. 原子習慣區塊 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-slate-800">原子習慣</h3>
          <button
            onClick={() => setShowHabitModal(true)}
            className="text-indigo-600 text-sm font-bold"
          >
            + 新增
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {habits.map((habit, index) => {
            const isDone = habit.lastCompletedDate === todayStr;
            const isBeingDragged = draggedIndex === index;
            return (
              <div
                key={habit._id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={(e) => handleTouchMove(e, index)}
                onTouchEnd={handleTouchEnd}
                className={`p-5 rounded-[2rem] flex flex-col gap-3 transition-all active:scale-95 cursor-move border ${
                  isDone
                    ? "bg-amber-100/50 border-transparent shadow-none"
                    : "bg-white border-slate-100 shadow-sm"
                } ${isBeingDragged ? "opacity-50 scale-105" : ""}`}
              >
                {/* 打卡區域 */}
                <div
                  onClick={() =>
                    toggleHabit(habit._id, habit.lastCompletedDate)
                  }
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div
                      className={`p-2 rounded-xl ${isDone ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-500"}`}
                    >
                      <FireIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-amber-600">
                      {habit.streak}D
                    </span>
                  </div>
                  <div className="mt-3">
                    <p
                      className={`text-lg font-bold leading-tight ${isDone ? "text-amber-900/50" : "text-slate-700"}`}
                    >
                      {habit.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 italic">
                      在 {habit.anchor} 之後...
                    </p>
                    <p className="text-xs text-slate-400 mt-1 italic">
                      我就會 {habit.action}
                    </p>
                  </div>
                </div>

                {/* 編輯/刪除按鈕 */}
                <div className="flex gap-1 mt-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditHabit(habit);
                    }}
                    className="flex-1 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    編輯
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHabit(habit._id);
                    }}
                    className="flex-1 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    刪除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. 新增習慣 Modal (Mobile Bottom Sheet) */}
      {showHabitModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-[3rem] p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? "編輯習慣" : "建立原子習慣"}
              </h3>
              <button
                onClick={() => {
                  setShowHabitModal(false);
                  setEditingId(null);
                  setFormData({ title: "", anchor: "", action: "" });
                }}
              >
                <XMarkIcon className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="習慣名稱"
                className="w-full p-4 text-slate-600 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                <p className="text-[10px] font-bold text-amber-600 uppercase mb-3">
                  習慣疊加邏輯
                </p>
                <input
                  placeholder="當我... (既有習慣)"
                  className="w-full text-slate-600 bg-transparent border-b border-amber-200 py-2 text-sm outline-none mb-3"
                  value={formData.anchor}
                  onChange={(e) =>
                    setFormData({ ...formData, anchor: e.target.value })
                  }
                />
                <input
                  placeholder="我就會... (新原子習慣)"
                  className="w-full text-slate-600 bg-transparent border-b border-amber-200 py-2 text-sm outline-none"
                  value={formData.action}
                  onChange={(e) =>
                    setFormData({ ...formData, action: e.target.value })
                  }
                />
              </div>
              <button
                onClick={handleCreateHabit}
                className="w-full py-4 bg-amber-500 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition"
              >
                {editingId ? "儲存變更" : "立即生效"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
