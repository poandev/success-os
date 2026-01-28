"use client";
import { useState, useEffect } from "react";
import { getWeek, getYear, startOfWeek, endOfWeek, format } from "date-fns";
import { zhTW } from "date-fns/locale";

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
        const plans = Array.isArray(data) ? data : data.plans || [];
        setPastPlans(plans);
        setFilteredPlans(plans);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch past plans:", err);
        setLoading(false);
      }
    };
    fetchPastPlans();
  }, []);

  const fetchPastPlans = async () => {
    try {
      const res = await fetch("/api/weekly-plans");
      const data = await res.json();
      const plans = Array.isArray(data) ? data : data.plans || [];
      setPastPlans(plans);
      setFilteredPlans(plans);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch past plans:", err);
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchWeek(query);

    const filtered = pastPlans.filter((plan) => {
      const matchWeek = plan.weekIdentifier.includes(query);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-600">加載中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* 搜尋區域 */}
      <div className="sticky top-0 bg-white z-10 p-4 space-y-4">
        <h2 className="text-2xl font-black text-slate-800">過往計畫查詢</h2>
        <input
          type="text"
          placeholder="搜尋週次、任務或角色..."
          className="w-full p-4 text-slate-600 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-400"
          value={searchWeek}
          onChange={handleSearch}
        />
      </div>

      {/* 計畫列表 */}
      <div className="space-y-4 px-4">
        {filteredPlans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">無符合條件的計畫</p>
          </div>
        ) : (
          filteredPlans.map((plan, idx) => {
            const completionRate = getCompletionRate(plan.bigRocks);
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
              >
                {/* 週次標題 */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {plan.weekIdentifier}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {getWeekDateRange(plan.weekIdentifier)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-indigo-600">
                      {completionRate}%
                    </div>
                    <p className="text-xs text-slate-500">完成率</p>
                  </div>
                </div>

                {/* 進度條 */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-indigo-600 transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>

                {/* 大石頭列表 */}
                <div className="space-y-3">
                  {plan.bigRocks.map((rock, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border transition-colors ${
                        rock.isCompleted
                          ? "bg-green-50 border-green-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                            rock.isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-slate-300 text-white"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-400 uppercase">
                            {rock.roleName}
                          </p>
                          <p
                            className={`text-sm font-bold mt-1 ${
                              rock.isCompleted
                                ? "text-slate-400 line-through"
                                : "text-slate-700"
                            }`}
                          >
                            {rock.task}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            目標: {rock.targetDate}
                          </p>
                        </div>
                        {rock.isCompleted && (
                          <div className="text-green-500 text-xl flex-shrink-0">
                            ✓
                          </div>
                        )}
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
