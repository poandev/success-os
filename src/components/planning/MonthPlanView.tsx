"use client";
import { useState, useEffect, useRef } from "react";
import {
  RocketLaunchIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  FireIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleSolid,
  FireIcon as FireSolid,
} from "@heroicons/react/24/solid";

interface FocusGoal {
  title: string;
  status: "Todo" | "Doing" | "Done";
}

export default function MonthPlanView() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [focusGoals, setFocusGoals] = useState<FocusGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);

  // 用於清除 timeout 防止記憶體洩漏 (雖然在短動畫中不常見，但寫法更規範)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchMonthData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/monthly-plans?month=${selectedMonth}`);
        if (res.ok) {
          const data = await res.json();
          setFocusGoals(data.focusGoals || []);
        }
      } catch (error) {
        console.error("Failed to fetch month data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthData();
  }, [selectedMonth]);

  // 果凍動畫觸發
  const triggerJelly = (index: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAnimatingIndex(index);
    timeoutRef.current = setTimeout(() => setAnimatingIndex(null), 500);
  };

  const handleUpdateGoals = async (newGoals: FocusGoal[]) => {
    setFocusGoals(newGoals);
    try {
      await fetch("/api/monthly-plans", {
        method: "POST",
        body: JSON.stringify({
          monthIdentifier: selectedMonth,
          focusGoals: newGoals,
        }),
      });
    } catch (error) {
      console.error("Failed to update goals", error);
    }
  };

  // 狀態循環邏輯
  const cycleStatus = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 防止觸發卡片的果凍動畫

    const currentGoal = focusGoals[index];
    let newStatus: FocusGoal["status"] = "Todo";

    if (currentGoal.status === "Todo") newStatus = "Doing";
    else if (currentGoal.status === "Doing") newStatus = "Done";
    else newStatus = "Todo";

    const updated = [...focusGoals];
    updated[index].status = newStatus;
    handleUpdateGoals(updated);
  };

  const changeMonth = (offset: number) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const newDate = new Date(year, month - 1 + offset);
    setSelectedMonth(
      `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`,
    );
  };

  // 輔助函式：根據狀態回傳對應的樣式與圖示
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Done":
        return {
          icon: (
            <CheckCircleSolid className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          ),
          borderColor: "border-emerald-500/50",
          glow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
          text: "text-emerald-400",
          label: "已完成",
        };
      case "Doing":
        return {
          icon: (
            <FireSolid className="w-8 h-8 text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          ),
          borderColor: "border-amber-500/50",
          glow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
          text: "text-amber-400",
          label: "執行中",
        };
      default: // Todo
        return {
          icon: (
            <PlayCircleIcon className="w-8 h-8 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
          ),
          borderColor: "border-white/10",
          glow: "",
          text: "text-slate-500",
          label: "待辦中",
        };
    }
  };

  return (
    <div className="relative space-y-8 animate-in fade-in duration-1000 h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden pb-24 px-1 scrollbar-hide text-white">
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
      <div className="fixed top-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-fuchsia-900/10 rounded-full blur-[100px] -z-10" />

      {/* --- 月份選擇器 --- */}
      <div className="flex items-center justify-between bg-white/[0.03] backdrop-blur-xl border border-white/10 p-2 rounded-[2.5rem] shadow-2xl shadow-black/20 mx-2">
        <button
          onClick={() => changeMonth(-1)}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-90"
          aria-label="上個月"
        >
          <ChevronLeftIcon className="w-5 h-5 text-indigo-300" />
        </button>
        <div className="text-center">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] opacity-80">
            本月核心
          </span>
          <h3 className="text-2xl font-black tracking-tight text-white mt-0.5 font-mono">
            {selectedMonth}
          </h3>
        </div>
        <button
          onClick={() => changeMonth(1)}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-90"
          aria-label="下個月"
        >
          <ChevronRightIcon className="w-5 h-5 text-indigo-300" />
        </button>
      </div>

      {/* --- 三大戰功區 --- */}
      <section
        className={`space-y-5 px-2 ${loading ? "opacity-40 pointer-events-none" : ""}`}
      >
        {focusGoals.map((goal, i) => {
          const isAnimating = animatingIndex === i;
          const statusConfig = getStatusConfig(goal.status);

          return (
            <div
              key={i}
              onClick={() => triggerJelly(i)}
              // 卡片本體
              className={`group relative bg-white/[0.03] backdrop-blur-[30px] backdrop-saturate-[150%] p-5 rounded-[2.5rem] border shadow-lg flex items-center gap-5 transition-all duration-300
              ${statusConfig.borderColor} ${statusConfig.glow}
              ${isAnimating ? "animate-jelly" : "hover:bg-white/[0.06]"}`}
            >
              {/* 序號 (左側) */}
              <div className="relative w-12 h-12 flex-shrink-0 rounded-[1.2rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/40 font-black font-mono shadow-inner">
                {i + 1}
              </div>

              {/* 中間：輸入與標籤 */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                {/* 標題輸入框 */}
                <input
                  className="w-full font-bold text-lg text-white bg-transparent outline-none placeholder:text-white/10 transition-colors py-1"
                  value={goal.title}
                  onChange={(e) => {
                    const updated = [...focusGoals];
                    updated[i].title = e.target.value;
                    setFocusGoals(updated);
                  }}
                  onBlur={() => handleUpdateGoals(focusGoals)}
                  placeholder="輸入本月戰功..."
                />

                {/* 狀態文字 (不可點擊，僅顯示) */}
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] font-black uppercase tracking-[0.2em] ${statusConfig.text} transition-colors duration-300`}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {/* 右側：狀態切換按鈕 (大按鈕，好點擊) */}
              <button
                onClick={(e) => cycleStatus(i, e)}
                className="relative p-3 rounded-[1.5rem] bg-black/20 hover:bg-black/40 border border-white/5 active:scale-90 transition-all duration-200 group-hover:border-white/20"
                aria-label={`切換狀態，目前為：${statusConfig.label}`}
              >
                {statusConfig.icon}
              </button>
            </div>
          );
        })}

        {/* --- 新增按鈕 --- */}
        {focusGoals.length < 3 && (
          <button
            onClick={() =>
              handleUpdateGoals([...focusGoals, { title: "", status: "Todo" }])
            }
            className="w-full py-6 bg-white/[0.02] backdrop-blur-sm border-2 border-dashed border-white/10 rounded-[2.5rem] text-white/30 font-black flex items-center justify-center gap-3 hover:bg-white/[0.05] hover:border-indigo-500/30 hover:text-indigo-400 transition-all active:scale-95 duration-300"
          >
            <RocketLaunchIcon className="w-6 h-6 animate-bounce" />
            <span className="tracking-widest text-sm">新增核心戰功</span>
          </button>
        )}
      </section>

      {/* --- 底部反思卡片 --- */}
      <div className="relative mx-2 p-8 rounded-[3rem] bg-gradient-to-br from-slate-900/90 to-black/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
        <div className="relative flex items-center gap-3 mb-4">
          <SparklesIcon className="w-5 h-5 text-amber-300" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            磨利鋸子
          </span>
        </div>
        <p className="relative text-slate-300 leading-relaxed font-medium text-sm">
          <span className="text-white font-bold">以終為始</span>{" "}
          不僅是設定目標，更是將每個月的戰鬥與你的人生願景垂直對齊。
        </p>
      </div>
    </div>
  );
}
