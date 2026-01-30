"use client";
import { useState } from "react";
import {
  MapIcon,
  CalendarDaysIcon,
  QueueListIcon,
  BoltIcon,
} from "@heroicons/react/24/solid";
import GoalVisionView from "@/components/planning/GoalVisionView2";
import MonthPlanView from "@/components/planning/MonthPlanView";
import WeekPlanView from "@/components/planning/WeekPlanView";
import DayExecutionView from "@/components/planning/DayExecutionView";

export default function PlanningPage() {
  const [view, setView] = useState("Day");

  const navItems = [
    { id: "Goal", label: "願景", icon: MapIcon },
    { id: "Month", label: "月度", icon: CalendarDaysIcon },
    { id: "Week", label: "每週", icon: QueueListIcon },
    { id: "Day", label: "今日", icon: BoltIcon },
  ];

  return (
    <main className="h-[100dvh] w-full bg-[#0f172a] text-white flex flex-col overflow-hidden relative">
      {/* 全域背景光影 (與子組件的光影融合) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-fuchsia-900/10 rounded-full blur-[80px]" />
      </div>

      {/* 頂部導航切換器 (懸浮玻璃膠囊) */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2 z-50">
        <div className="mx-auto max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-[2rem] shadow-lg flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`relative flex items-center justify-center gap-1.5 px-4 py-3 rounded-[1.5rem] text-sm font-bold transition-all duration-300 flex-1
                ${
                  isActive
                    ? "text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                {/* 啟動狀態的背景滑塊 */}
                {isActive && (
                  <div className="absolute inset-0 bg-indigo-600 rounded-[1.5rem] -z-10 animate-in fade-in zoom-in-95 duration-200" />
                )}

                <item.icon
                  className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`}
                />
                <span>{item.label}</span>
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
          {view === "Day" && <DayExecutionView />}
        </div>
      </div>
    </main>
  );
}
