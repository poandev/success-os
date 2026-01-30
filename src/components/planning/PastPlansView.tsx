"use client";
import { useState, useEffect } from "react";
import { startOfWeek, endOfWeek, format } from "date-fns";
import {
  CalendarIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ArchiveBoxIcon, // 新增：用於標題圖示
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

export default function PastPlansView() {
  const [pastPlans, setPastPlans] = useState<WeekPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchWeek, setSearchWeek] = useState("");
  const [filteredPlans, setFilteredPlans] = useState<WeekPlan[]>([]);

  useEffect(() => {
    const fetchPastPlans = async () => {
      try {
        const res = await fetch("/api/weekly-plans");
        const data = await res.json();
        // 兼容不同的 API 回傳格式
        const plans = Array.isArray(data) ? data : data.plans || [];
        setPastPlans(plans);
        setFilteredPlans(plans);
      } catch (err) {
        console.error("Failed to fetch past plans:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPastPlans();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchWeek(query);

    const filtered = pastPlans.filter((plan) => {
      const matchWeek = plan.weekIdentifier.toLowerCase().includes(query);
      const matchTask = plan.bigRocks.some((rock) =>
        rock.task.toLowerCase().includes(query),
      );
      const matchRole = plan.bigRocks.some((rock) =>
        rock.roleName.toLowerCase().includes(query),
      );
      return matchWeek || matchTask || matchRole;
    });

    setFilteredPlans(filtered);
  };

  const getWeekDateRange = (weekIdentifier: string) => {
    try {
      const [year, week] = weekIdentifier.split("-W");
      const date = new Date(parseInt(year), 0, 1);
      const weekNum = parseInt(week);
      // 簡單計算週次日期
      date.setDate(date.getDate() + (weekNum - 1) * 7);

      const start = startOfWeek(date, { weekStartsOn: 1 });
      const end = endOfWeek(date, { weekStartsOn: 1 });

      return `${format(start, "MM/dd")} - ${format(end, "MM/dd")}`;
    } catch (e) {
      return weekIdentifier; // 若格式解析失敗則回傳原字串
    }
  };

  const getCompletionRate = (rocks: BigRock[]) => {
    if (rocks.length === 0) return 0;
    const completed = rocks.filter((r) => r.isCompleted).length;
    return Math.round((completed / rocks.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-slate-900 text-white space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">
          LOADING ARCHIVES...
        </p>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-transparent text-white pt-2 select-none">
      {/* 隱藏卷軸樣式 */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* --- 背景光影 --- */}
      <div className="fixed top-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-fuchsia-900/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* --- 標題與搜尋區 (Sticky Top) --- */}
      <div className="flex-shrink-0 px-4 pb-4 z-20">
        <div className="flex items-center gap-3 mb-4">
          <ArchiveBoxIcon className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-black italic tracking-tighter text-white">
            過往計畫搜尋
          </h2>
        </div>

        <div className="relative group">
          <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="搜尋週次、任務或角色..."
            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-[2rem] text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all"
            value={searchWeek}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* --- 計畫列表 (Scrollable Area) --- */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 scrollbar-hide space-y-4">
        {filteredPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/10 rounded-[2rem] bg-white/[0.02]">
            <MagnifyingGlassIcon className="w-10 h-10 text-slate-600 mb-2" />
            <p className="text-slate-500 font-mono text-sm">
              找不到符合條件的計畫
            </p>
          </div>
        ) : (
          filteredPlans.map((plan, idx) => {
            const completionRate = getCompletionRate(plan.bigRocks);
            return (
              <div
                key={idx}
                className="bg-white/[0.03] backdrop-blur-md rounded-[2.5rem] p-6 border border-white/5 hover:border-white/10 transition-all shadow-lg"
              >
                {/* 卡片標題區 */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-white font-mono tracking-tight">
                      {plan.weekIdentifier}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                      <CalendarIcon className="w-3 h-3" />
                      <p className="text-xs font-mono">
                        {getWeekDateRange(plan.weekIdentifier)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-indigo-400 drop-shadow-[0_0_10px_rgba(129,140,248,0.3)]">
                      {completionRate}%
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                      完成率
                    </p>
                  </div>
                </div>

                {/* 進度條 */}
                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden mb-6 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>

                {/* 大石頭唯讀列表 */}
                <div className="space-y-2">
                  {plan.bigRocks.map((rock, i) => (
                    <div
                      key={i}
                      className={`px-4 py-3 rounded-2xl border flex items-center gap-3 transition-colors ${
                        rock.isCompleted
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : "bg-white/5 border-white/5"
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {rock.isCompleted ? (
                          <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            {rock.roleName}
                          </p>
                          {rock.targetDate && (
                            <span className="text-[9px] font-mono text-slate-500 opacity-60">
                              {rock.targetDate}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm font-bold truncate ${
                            rock.isCompleted
                              ? "text-emerald-200 line-through decoration-emerald-500/50"
                              : "text-slate-200"
                          }`}
                        >
                          {rock.task}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
