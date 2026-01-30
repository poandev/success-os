"use client";
import { useState } from "react";
import {
  MapIcon,
  CalendarDaysIcon,
  QueueListIcon,
  ClipboardDocumentCheckIcon, // 用於 V1 清單
  BoltIcon, // 用於 V2 戰情
} from "@heroicons/react/24/solid";

// 引入所有組件
import GoalVisionView from "@/components/planning/GoalVisionView2";
// import GoalVisionView2 from "@/components/planning/GoalVisionView2"; // 如果你想用新版願景，請改用這個
import MonthPlanView from "@/components/planning/MonthPlanView";
import WeekPlanView from "@/components/planning/WeekPlanView";
import DayExecutionView from "@/components/planning/DayExecutionView"; // V1: 執行清單
import CalendarCommandCenter from "@/components/planning/CalendarCommandCenter"; // V2: 戰情室

export default function PlanningPage() {
  // 預設進入 V2 戰情室 (Flow)，你可以隨時切換回 V1 執行 (Execute)
  const [view, setView] = useState("Flow");

  const navItems = [
    { id: "Goal", label: "願景", icon: MapIcon },
    { id: "Month", label: "月度", icon: CalendarDaysIcon },
    { id: "Week", label: "每週", icon: QueueListIcon },
    { id: "Execute", label: "執行", icon: ClipboardDocumentCheckIcon }, // V1 舊版入口
    { id: "Flow", label: "戰情", icon: BoltIcon }, // V2 新版入口
  ];

  return (
    <main className="h-[100dvh] w-full bg-[#09090b] text-white flex flex-col overflow-hidden relative">
      {/* 背景光影邏輯：
          V2 (Flow) 有自己的背景，所以只有在非 Flow 模式下顯示全域背景 
      */}
      {view !== "Flow" && (
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-fuchsia-900/10 rounded-full blur-[80px]" />
        </div>
      )}

      {/* 頂部導航切換器 (懸浮玻璃膠囊) */}
      <div className="flex-shrink-0 px-2 pt-4 pb-2 z-100">
        {/* 為了容納 5 個按鈕，調整 padding 和 gap */}
        <div className="mx-auto max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 rounded-[2rem] shadow-lg flex justify-between items-center overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`relative flex items-center justify-center gap-1.5 px-3 py-3 rounded-[1.5rem] text-sm font-bold transition-all duration-300 flex-1 min-w-[4.5rem]
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
                {/* 手機版字體稍微縮小，確保 5 個按鈕放得下 */}
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
          {view === "Execute" && <DayExecutionView />} {/* V1: 清單與習慣 */}
          {view === "Flow" && <CalendarCommandCenter />}{" "}
          {/* V2: 時間軸與排程 */}
        </div>
      </div>
    </main>
  );
}
