"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation"; // 1. 引入路由
import {
  MapIcon,
  CalendarDaysIcon,
  QueueListIcon,
  ClipboardDocumentCheckIcon,
  BoltIcon,
} from "@heroicons/react/24/solid";

// 引入所有組件
import GoalVisionView from "@/components/planning/GoalVisionView2";
import MonthPlanView from "@/components/planning/MonthPlanView";
import WeekPlanView from "@/components/planning/WeekPlanView";
import DayExecutionView from "@/components/planning/DayExecutionView";
import CalendarCommandCenter from "@/components/planning/CalendarCommandCenter";

export default function PlanningPage() {
  const [view, setView] = useState("Flow");
  const router = useRouter(); // 2. 初始化路由

  // 3. 長按邏輯 Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const navItems = [
    { id: "Goal", label: "願景", icon: MapIcon },
    { id: "Month", label: "月度", icon: CalendarDaysIcon },
    { id: "Week", label: "每週", icon: QueueListIcon },
    { id: "Execute", label: "執行", icon: ClipboardDocumentCheckIcon },
    { id: "Flow", label: "戰情", icon: BoltIcon },
  ];

  // 4. 開始按壓 (手機/滑鼠)
  const handlePressStart = () => {
    isLongPress.current = false; // 重置狀態
    timerRef.current = setTimeout(() => {
      isLongPress.current = true; // 標記為長按
      // 觸發震動回饋 (僅手機有效)
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(50);
      }
      // 跳轉回首頁
      router.push("/");
    }, 800); // 設定長按時間為 800ms
  };

  // 5. 結束按壓 (清除計時器)
  const handlePressEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  // 6. 點擊處理 (區分點擊與長按)
  const handleClick = (id: string) => {
    if (isLongPress.current) {
      // 如果觸發了長按，則忽略這次的 Click 事件
      return;
    }
    setView(id);
  };

  return (
    <main className="h-[100dvh] w-full bg-[#09090b] text-white flex flex-col overflow-hidden relative">
      {/* 背景光影 (非戰情模式顯示) */}
      {view !== "Flow" && (
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-fuchsia-900/10 rounded-full blur-[80px]" />
        </div>
      )}

      {/* 頂部導航切換器 */}
      {/* 使用 z-[100] 確保層級最高 */}
      <div className="flex-shrink-0 px-2 pt-4 pb-2 z-[100] relative">
        <div className="mx-auto max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-[2rem] shadow-lg flex justify-between items-center overflow-x-auto scrollbar-hide select-none">
          {navItems.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                // --- 綁定事件 ---
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd} // 滑開也算結束
                onClick={() => handleClick(item.id)}
                // ----------------
                className={`relative flex items-center justify-center gap-1.5 px-3 py-3 rounded-[1.5rem] text-sm font-bold transition-all duration-300 flex-1 min-w-[4.5rem] flex-shrink-0 touch-manipulation
                ${
                  isActive
                    ? "text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-indigo-600 rounded-[1.5rem] -z-10 animate-in fade-in zoom-in-95 duration-200" />
                )}
                <item.icon
                  className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`}
                />
                <span className="text-xs sm:text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 視圖內容區 */}
      <div className="flex-1 min-h-0 w-full z-10 relative">
        <div className="h-full w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          {view === "Goal" && <GoalVisionView />}
          {view === "Month" && <MonthPlanView />}
          {view === "Week" && <WeekPlanView />}
          {view === "Execute" && <DayExecutionView />}
          {view === "Flow" && <CalendarCommandCenter />}
        </div>
      </div>
    </main>
  );
}
