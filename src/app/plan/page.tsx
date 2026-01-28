"use client";
import { useState } from "react";
import GoalVisionView from "@/components/planning/GoalVisionView";
import MonthPlanView from "@/components/planning/MonthPlanView";
import WeekPlanView from "@/components/planning/WeekPlanView";
import DayExecutionView from "@/components/planning/DayExecutionView";

export default function PlanningPage() {
  const [view, setView] = useState("Day"); // Day, Week, Month, Goal

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* 頂部切換器：對齊柯維的指南針概念 */}
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm flex justify-around">
        {["Goal", "Month", "Week", "Day"].map((item) => (
          <button
            key={item}
            onClick={() => setView(item)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${
              view === item ? "bg-indigo-600 text-white" : "text-slate-400"
            }`}
          >
            {item === "Goal" ? "願景目標" : item}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* 視圖切換邏輯 */}
        {view === "Goal" && <GoalVisionView />}
        {view === "Month" && <MonthPlanView />}
        {view === "Week" && <WeekPlanView />}
        {view === "Day" && <DayExecutionView />}
      </div>
    </main>
  );
}
