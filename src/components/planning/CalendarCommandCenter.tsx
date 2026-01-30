"use client";
import { useState, useEffect, useRef } from "react";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  getYear,
  getWeek,
  addWeeks,
  subWeeks,
} from "date-fns";
import {
  BoltIcon,
  BriefcaseIcon,
  SparklesIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";
import {
  RocketLaunchIcon,
  FireIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// --- 型別定義 ---
interface Habit {
  _id: string;
  title: string;
  anchor: string;
  action: string;
  streak: number;
  lastCompletedDate: string;
}

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

interface CalendarEvent {
  _id?: string;
  title: string;
  date: string;
  startTime: string;
  duration: number;
  type: string;
  isCompleted: boolean;
}

// --- 輔助函式：動態決定顏色 ---
const getColorConfig = (type: string) => {
  const t = (type || "").toLowerCase();

  if (
    t.includes("工程") ||
    t.includes("dev") ||
    t.includes("api") ||
    t.includes("code")
  ) {
    return {
      color: "bg-blue-500/20 text-blue-300",
      border: "border-blue-500/50",
      glow: "shadow-[0_0_15px_rgba(59,130,246,0.4)]",
      icon: BoltIcon,
    };
  }
  if (
    t.includes("安麗") ||
    t.includes("amway") ||
    t.includes("直銷") ||
    t.includes("產品")
  ) {
    return {
      color: "bg-emerald-500/20 text-emerald-300",
      border: "border-emerald-500/50",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.4)]",
      icon: SparklesIcon,
    };
  }
  if (
    t.includes("塔羅") ||
    t.includes("tarot") ||
    t.includes("諮詢") ||
    t.includes("靈性")
  ) {
    return {
      color: "bg-purple-500/20 text-purple-300",
      border: "border-purple-500/50",
      glow: "shadow-[0_0_15px_rgba(168,85,247,0.4)]",
      icon: FireIcon,
    };
  }

  // 預設樣式
  return {
    color: "bg-slate-500/20 text-slate-300",
    border: "border-slate-500/50",
    glow: "shadow-none",
    icon: BriefcaseIcon,
  };
};

export default function CalendarCommandCenter() {
  // --- 狀態管理 ---
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 用於自動滾動的 Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [pendingRocks, setPendingRocks] = useState<BigRock[]>([]);
  const [weekPlan, setWeekPlan] = useState<WeekPlan | null>(null);

  const [selectedRockIndex, setSelectedRockIndex] = useState<number | null>(
    null,
  );

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editEventId, setEditEventId] = useState<string | null>(null);

  const [eventFormData, setEventFormData] = useState<{
    startTime: string;
    title: string;
    type: string;
    duration: number;
  }>({
    startTime: "09:00",
    title: "",
    type: "生活",
    duration: 60,
  });

  const todayStr = format(selectedDate, "yyyy-MM-dd");

  // --- 自動滾動與時間線邏輯 ---
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // 進入頁面時，自動滾動到當前時間
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      const currentHour = new Date().getHours();
      // 這裡您可以決定是否要顯示 01:00-05:00，目前邏輯是從 06:00 開始
      if (currentHour >= 6) {
        const element = document.getElementById(`time-slot-${currentHour}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }, 100);

    return () => clearTimeout(scrollTimer);
  }, []);

  // --- 資料獲取 ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [habitsRes, eventsRes] = await Promise.all([
        fetch("/api/habits"),
        fetch(`/api/calendar?date=${todayStr}`),
      ]);

      const habitsData = await habitsRes.json();
      const eventsData = await eventsRes.json();

      setHabits(Array.isArray(habitsData) ? habitsData : []);
      setTodayEvents(Array.isArray(eventsData) ? eventsData : []);

      const year = getYear(selectedDate);
      const week = getWeek(selectedDate, { weekStartsOn: 1 });
      const weekId = `${year}-W${String(week).padStart(2, "0")}`;

      const planRes = await fetch(`/api/weekly-plans?week=${weekId}`);
      const planData = await planRes.json();

      if (planData && planData.bigRocks) {
        setWeekPlan(planData);
        const pending = planData.bigRocks.filter(
          (r: BigRock) => !r.isCompleted && r.targetDate !== todayStr,
        );
        setPendingRocks(pending);
      } else {
        setWeekPlan(null);
        setPendingRocks([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // --- 新功能：週次切換 & 回到今天 ---
  const handlePrevWeek = () => setSelectedDate((prev) => subWeeks(prev, 1));
  const handleNextWeek = () => setSelectedDate((prev) => addWeeks(prev, 1));
  const handleGoToday = () => setSelectedDate(new Date());

  // --- 核心操作功能 ---
  const handleTimeSlotClick = (hour: number) => {
    if (selectedRockIndex !== null && pendingRocks[selectedRockIndex]) {
      scheduleRockToToday(pendingRocks[selectedRockIndex], hour);
    } else {
      setIsEditing(false);
      setEditEventId(null);
      setEventFormData({
        startTime: `${String(hour).padStart(2, "0")}:00`,
        title: "",
        type: "生活",
        duration: 60,
      });
      setShowModal(true);
    }
  };

  const handleEditClick = (event: CalendarEvent) => {
    setIsEditing(true);
    setEditEventId(event._id || null);
    setEventFormData({
      startTime: event.startTime,
      title: event.title,
      type: event.type,
      duration: event.duration,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!eventFormData.title) return alert("請輸入標題");

    const payload = {
      ...eventFormData,
      date: todayStr,
      isCompleted: false,
    };

    if (isEditing && editEventId) {
      setTodayEvents((prev) =>
        prev.map((e) => (e._id === editEventId ? { ...e, ...payload } : e)),
      );
      setShowModal(false);

      await fetch("/api/calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: editEventId, ...payload }),
      });
    } else {
      const tempEvent = {
        ...payload,
        _id: "temp-" + Date.now(),
        isCompleted: false,
      };
      setTodayEvents((prev) => [...prev, tempEvent]);
      setShowModal(false);

      await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    fetchData(); // 確保後端資料同步
  };

  const handleDelete = async () => {
    if (!editEventId || !confirm("確定要刪除這個活動嗎？")) return;

    setTodayEvents((prev) => prev.filter((e) => e._id !== editEventId));
    setShowModal(false);

    await fetch(`/api/calendar?id=${editEventId}`, { method: "DELETE" });
    fetchData();
  };

  const toggleComplete = async (event: CalendarEvent) => {
    const newStatus = !event.isCompleted;
    setTodayEvents((prev) =>
      prev.map((e) =>
        e._id === event._id ? { ...e, isCompleted: newStatus } : e,
      ),
    );

    try {
      await fetch("/api/calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: event._id, isCompleted: newStatus }),
      });
    } catch (e) {
      console.error("Toggle complete failed", e);
      fetchData();
    }
  };

  // 🔥 核心優化：大石頭瞬間排程 (Optimistic Update) 🔥
  const scheduleRockToToday = async (rock: BigRock, hour: number) => {
    // 1. 建立新活動物件 (帶有臨時 ID)
    const newEvent: CalendarEvent = {
      _id: "temp-" + Date.now(),
      title: rock.task,
      date: todayStr,
      startTime: `${String(hour).padStart(2, "0")}:00`,
      duration: 60,
      type: rock.roleName,
      isCompleted: false,
    };

    // 2. 立即更新 UI (不用等 API 回傳，感覺更快)
    setTodayEvents((prev) => [...prev, newEvent]); // 行事曆馬上出現
    setPendingRocks((prev) => prev.filter((_, i) => i !== selectedRockIndex)); // 待辦清單馬上移除

    // 3. 重置狀態
    setSelectedRockIndex(null);
    setIsDrawerOpen(false);

    // 4. 背景執行 API 請求
    try {
      // 更新週計畫 (標記該石頭已排程)
      if (weekPlan) {
        const originalIndex = weekPlan.bigRocks.findIndex(
          (r) => r.task === rock.task,
        );
        if (originalIndex !== -1) {
          const newRocks = [...weekPlan.bigRocks];
          newRocks[originalIndex].targetDate = todayStr;

          await fetch("/api/weekly-plans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              weekIdentifier: weekPlan.weekIdentifier,
              bigRocks: newRocks,
            }),
          });
        }
      }

      // 寫入行事曆資料庫
      await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newEvent, _id: undefined }), // 移除臨時 ID
      });

      // 最後再悄悄同步一次，確保 ID 正確
      fetchData();
    } catch (error) {
      console.error("Schedule failed", error);
      // 如果失敗，理論上應該要 rollback，但這裡先重新抓取資料復原
      fetchData();
    }
  };

  const toggleHabit = async (id: string, lastDate: string) => {
    const isDoneToday = lastDate === todayStr;
    const method = isDoneToday ? "DELETE" : "POST";

    setHabits((prev) =>
      prev.map((h) =>
        h._id === id
          ? { ...h, lastCompletedDate: isDoneToday ? "" : todayStr }
          : h,
      ),
    );
    await fetch(`/api/habits/${id}/check`, { method });
  };

  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), i),
  );
  const timeSlots = Array.from({ length: 19 }).map((_, i) => i + 6);

  // 取得當前時間的分鐘數百分比 (用於紅線定位)
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const minutePercentage = (currentMinute / 60) * 100;

  return (
    <div className="h-full w-full bg-[#09090b] text-white flex flex-col relative overflow-hidden font-sans">
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* --- 頂部：日期滑軌 --- */}
      <div className="flex-shrink-0 z-20 bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 pt-4 pb-2">
        <div className="flex items-center justify-between px-4 mb-3">
          {/* 🔥 頂部控制列：日期切換 (按鈕已縮小) 🔥 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevWeek}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-90"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2 select-none">
              <span className="text-indigo-500">
                {format(selectedDate, "MMM")}
              </span>
              <span>{format(selectedDate, "yyyy")}</span>
            </h2>
            <button
              onClick={handleNextWeek}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-90"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToday}
              className="ml-1 px-2 py-0.5 text-[10px] font-bold bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-md hover:bg-indigo-600 hover:text-white transition-all active:scale-95 flex items-center gap-1"
            >
              <CalendarIcon className="w-3 h-3" />
              今天
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                style={{
                  width: `${todayEvents.length > 0 ? (todayEvents.filter((t) => t.isCompleted).length / todayEvents.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-xs font-mono text-slate-400">
              {todayEvents.length > 0
                ? Math.round(
                    (todayEvents.filter((t) => t.isCompleted).length /
                      todayEvents.length) *
                      100,
                  )
                : 0}
              %
            </span>
          </div>
        </div>
        <div className="flex overflow-x-auto scrollbar-hide px-4 gap-3 pb-2">
          {weekDays.map((date, i) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`mt-2 flex flex-col items-center justify-center min-w-10 h-10 rounded-2xl transition-all duration-300 flex-shrink-0 border
                ${isSelected ? "bg-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.4)] transform -translate-y-1" : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                  {format(date, "EEE")}
                </span>
                <span
                  className={`text-[12px] font-black ${isSelected ? "text-white" : isToday ? "text-indigo-400" : "text-slate-200"}`}
                >
                  {format(date, "d")}
                </span>
                {isToday && !isSelected && (
                  <span className="w-1 h-1 bg-indigo-400 rounded-full mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- 主畫面：垂直時間軸 (網格佈局) --- */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative scrollbar-hide pb-32"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-full w-px bg-white/5 absolute left-16" />
        </div>

        {timeSlots.map((hour) => {
          const eventsInHour = todayEvents.filter(
            (t) => parseInt(t.startTime.split(":")[0]) === hour,
          );

          // 判斷是否為當前小時，用於顯示紅線
          const isCurrentHour =
            isSameDay(selectedDate, currentTime) && hour === currentHour;

          return (
            <div
              key={hour}
              id={`time-slot-${hour}`} // 用於自動滾動定位
              className="relative min-h-[5rem] group"
            >
              {/* 時間標記 */}
              <div className="absolute left-0 top-0 w-16 text-right pr-4 py-2">
                <span
                  className={`text-xs font-mono font-bold ${isCurrentHour ? "text-red-500" : "text-slate-500"}`}
                >
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>

              {/* 活動區域 */}
              <div className="ml-16 mr-4 border-b border-white/5 min-h-[5rem] relative grid grid-cols-2 gap-2 py-1">
                {/* 🔥 現在時間紅線 🔥 */}
                {isCurrentHour && (
                  <div
                    className="absolute left-0 right-0 h-px bg-red-500 z-20 pointer-events-none flex items-center"
                    style={{ top: `${minutePercentage}%` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                  </div>
                )}

                {/* 渲染既有活動 */}
                {eventsInHour.map((event) => {
                  const config = getColorConfig(event.type);
                  return (
                    <div
                      key={event._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(event);
                      }}
                      className={`relative rounded-xl border backdrop-blur-md p-3 flex flex-col justify-center cursor-pointer active:scale-95 transition-all duration-300 h-full z-10
                      ${
                        event.isCompleted
                          ? "bg-emerald-900/30 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] col-span-1"
                          : `${config.color} ${config.border} ${config.glow} col-span-1`
                      }
                      ${eventsInHour.length === 1 && "col-span-1"}`}
                    >
                      <div className="flex justify-between items-start">
                        <span
                          className={`text-sm font-bold truncate ${event.isCompleted ? "line-through opacity-80" : ""}`}
                        >
                          {event.title}
                        </span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleComplete(event);
                          }}
                          className={`p-1 -mr-2 -mt-2 rounded-full transition-colors z-10
                            ${event.isCompleted ? "text-emerald-400 hover:bg-emerald-500/20" : "text-white/20 hover:text-white hover:bg-white/10"}`}
                        >
                          <CheckCircleIcon className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 opacity-70">
                        {config.icon && <config.icon className="w-3 h-3" />}
                        <span className="text-[10px] font-mono font-bold uppercase truncate">
                          {event.type}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* 渲染新增按鈕 */}
                {eventsInHour.length < 2 && (
                  <div
                    onClick={() => handleTimeSlotClick(hour)}
                    className={`flex items-center justify-center rounded-xl border-2 border-dashed border-white/5 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all cursor-pointer h-full z-0
                    ${eventsInHour.length === 0 ? "col-span-2 opacity-0 group-hover:opacity-100" : "col-span-1 opacity-50 hover:opacity-100"}
                    ${selectedRockIndex !== null ? "opacity-100 bg-indigo-500/10 border-indigo-500/30 animate-pulse" : ""}`}
                  >
                    {selectedRockIndex !== null &&
                    pendingRocks[selectedRockIndex] ? (
                      <span className="text-[10px] text-indigo-300 font-bold text-center px-2">
                        {eventsInHour.length === 0
                          ? `👇 安排 "${pendingRocks[selectedRockIndex].task}"`
                          : "👈 +"}
                      </span>
                    ) : (
                      <PlusIcon className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- 底部戰術指揮列 (確保 z-index 足夠高) --- */}
      <div className="fixed bottom-0 left-0 w-full px-4 pb-6 pt-4 bg-gradient-to-t from-black via-[#09090b]/95 to-transparent z-50">
        <div className="flex items-end justify-between gap-4">
          <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 flex items-center justify-around shadow-2xl overflow-x-auto scrollbar-hide">
            {habits.map((habit) => {
              const isDone = habit.lastCompletedDate === todayStr;
              return (
                <button
                  key={habit._id}
                  onClick={() =>
                    toggleHabit(habit._id, habit.lastCompletedDate)
                  }
                  className={`relative w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-lg transition-all duration-300 active:scale-75
                  ${isDone ? "bg-emerald-500/20 grayscale-0 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "grayscale opacity-50 hover:opacity-100 bg-white/5"}`}
                >
                  <span className="filter drop-shadow-md">🔥</span>
                  {isDone && (
                    <div className="absolute inset-0 border-2 border-emerald-400 rounded-full animate-ping opacity-20" />
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center justify-center hover:bg-indigo-500 hover:scale-105 active:scale-90 transition-all duration-300 group relative overflow-hidden flex-shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <RocketLaunchIcon className="w-8 h-8 relative z-10 group-hover:animate-bounce" />
            {pendingRocks.length > 0 && (
              <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-[#09090b] animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* --- 待排程大石頭 Drawer --- */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsDrawerOpen(false)}
      />
      <div
        className={`fixed bottom-0 left-0 w-full bg-[#18181b] rounded-t-[2.5rem] z-50 border-t border-white/10 shadow-2xl transition-transform duration-300 ease-out h-[60vh] flex flex-col
        ${isDrawerOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-4 mb-6 flex-shrink-0" />
        <div className="px-6 pb-4 flex justify-between items-center flex-shrink-0">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-indigo-400" />
            待排程大石頭
          </h3>
          <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-1 rounded-lg">
            {pendingRocks.length} ROCKS
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-3 scrollbar-hide">
          {pendingRocks.map((rock, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedRockIndex(idx);
                setIsDrawerOpen(false);
              }}
              className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between active:scale-95 active:bg-indigo-600/20 transition-all cursor-pointer group hover:bg-white/10"
            >
              <div>
                <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  {rock.roleName}
                </p>
                <p className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {rock.task}
                </p>
              </div>
              <ArrowPathIcon className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
            </div>
          ))}
          {pendingRocks.length === 0 && (
            <div className="text-center py-10 text-slate-500 font-mono text-sm border-2 border-dashed border-white/10 rounded-2xl">
              本週大石頭已全數就位！🚀
            </div>
          )}
        </div>
      </div>

      {/* --- 共用 Modal (新增/編輯) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-[#18181b] border border-white/10 w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white">
                {isEditing ? "編輯活動" : "新活動安排"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 bg-white/5 rounded-full text-slate-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">
                  標題
                </label>
                <input
                  type="text"
                  value={eventFormData.title}
                  onChange={(e) =>
                    setEventFormData({
                      ...eventFormData,
                      title: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-colors text-lg font-bold"
                  placeholder="做什麼？"
                  autoFocus={!isEditing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">
                    時間
                  </label>
                  <input
                    type="time"
                    value={eventFormData.startTime}
                    onChange={(e) =>
                      setEventFormData({
                        ...eventFormData,
                        startTime: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 [color-scheme:dark] font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">
                    類別
                  </label>
                  <input
                    type="text"
                    value={eventFormData.type}
                    onChange={(e) =>
                      setEventFormData({
                        ...eventFormData,
                        type: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="工程、安麗..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                {isEditing && (
                  <button
                    onClick={handleDelete}
                    className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 active:scale-95 transition-all"
                  >
                    <TrashIcon className="w-6 h-6" />
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
                >
                  {isEditing ? "儲存變更" : "確認新增"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 提示與取消選擇按鈕 🔥 */}
      {selectedRockIndex !== null && pendingRocks[selectedRockIndex] && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-xl animate-bounce flex items-center gap-3 pointer-events-auto shadow-indigo-500/50">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5" />
            <span className="font-bold text-sm">請點擊時間軸空檔</span>
          </div>
          {/* 取消按鈕 */}
          <button
            onClick={() => setSelectedRockIndex(null)}
            className="p-1 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
