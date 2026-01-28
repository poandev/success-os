"use client";
import { useState, useEffect } from "react";
import { getWeek, getYear, startOfWeek, endOfWeek, format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { XMarkIcon } from "@heroicons/react/24/solid";

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

export default function WeekPlanView() {
  const [bigRocks, setBigRocks] = useState<BigRock[]>([]);
  const [pastPlans, setPastPlans] = useState<WeekPlan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"current" | "past">("current");
  const [searchWeek, setSearchWeek] = useState("");
  const [filteredPastPlans, setFilteredPastPlans] = useState<WeekPlan[]>([]);
  const [formData, setFormData] = useState({
    roleName: "",
    task: "",
    targetDate: "",
  });

  // 自動計算當前週次 (ISO 8601 格式)
  const getWeekIdentifier = () => {
    const today = new Date();
    const year = getYear(today);
    const week = getWeek(today, { weekStartsOn: 1 }); // 週一為第一天
    console.log("Current week number:", week);
    return `${year}-W${String(week).padStart(2, "0")}`;
  };

  const currentWeek = getWeekIdentifier();

  useEffect(() => {
    fetch(`/api/weekly-plans?week=${currentWeek}`)
      .then((res) => res.json())
      .then((data) => {
        const rocks = data.bigRocks || [];
        console.log("Loaded current week rocks:", rocks);
        setBigRocks(rocks);
      })
      .catch((err) => console.error("Failed to fetch current week:", err));

    // 取得過往計畫
    const fetchPastPlans = async () => {
      try {
        const res = await fetch("/api/weekly-plans");
        const data = await res.json();

        // 処理返回的数据格式
        let plans: WeekPlan[] = [];
        if (Array.isArray(data)) {
          plans = data;
        } else if (data.plans && Array.isArray(data.plans)) {
          plans = data.plans;
        } else if (data.weekIdentifier) {
          // 单个计划的情况
          plans = [data];
        }

        // 過濾掉當週計畫，只顯示過往
        const past = plans.filter(
          (plan: WeekPlan) => plan.weekIdentifier !== currentWeek,
        );

        console.log("Fetched past plans:", past);
        setPastPlans(past);
        setFilteredPastPlans(past);
      } catch (err) {
        console.error("Failed to fetch past plans:", err);
      }
    };
    fetchPastPlans();
  }, []);

  const saveWeekPlan = async (newRocks: BigRock[]) => {
    try {
      const response = await fetch("/api/weekly-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weekIdentifier: currentWeek,
          bigRocks: newRocks,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to save week plan:", error);
        alert("保存失敗，請稍後重試");
        return;
      }

      const data = await response.json();
      console.log("Week plan saved successfully:", data);
      // 重新載入過往計畫以顯示最新的更新
      fetchPastPlans();
    } catch (err) {
      console.error("Error saving week plan:", err);
      alert("保存時發生錯誤");
    }
  };

  const addRock = () => {
    const newRocks: BigRock[] = [
      ...bigRocks,
      { roleName: "新角色", task: "新大石頭任務", targetDate: "" },
    ];
    setBigRocks(newRocks);
    saveWeekPlan(newRocks);
  };

  const deleteRock = (index: number) => {
    if (confirm("確定要刪除這顆大石頭嗎？")) {
      const newRocks = bigRocks.filter((_, i) => i !== index);
      setBigRocks(newRocks);
      saveWeekPlan(newRocks);
    }
  };

  const openEditModal = (index: number) => {
    const rock = bigRocks[index];
    setFormData({
      roleName: rock.roleName || "",
      task: rock.task || "",
      targetDate: rock.targetDate || "",
    });
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleSaveRock = async () => {
    if (!formData.roleName || !formData.task || !formData.targetDate) {
      alert("請填寫所有欄位");
      return;
    }

    const newRocks = [...bigRocks];
    if (editingIndex !== null) {
      // 編輯現有項目
      newRocks[editingIndex] = { ...formData };
    } else {
      // 新增項目
      newRocks.push({ ...formData });
    }

    setBigRocks(newRocks);
    await saveWeekPlan(newRocks);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingIndex(null);
    setFormData({ roleName: "", task: "", targetDate: "" });
  };

  const fetchPastPlans = async () => {
    try {
      const res = await fetch("/api/weekly-plans");
      const data = await res.json();

      // 処理返回的数据格式
      let plans: WeekPlan[] = [];
      if (Array.isArray(data)) {
        plans = data;
      } else if (data.plans && Array.isArray(data.plans)) {
        plans = data.plans;
      } else if (data.weekIdentifier) {
        // 单个计划的情况
        plans = [data];
      }

      // 過濾掉當週計畫，只顯示過往
      const past = plans.filter(
        (plan: WeekPlan) => plan.weekIdentifier !== currentWeek,
      );

      console.log("Fetched past plans:", past);
      setPastPlans(past);
      setFilteredPastPlans(past);
    } catch (err) {
      console.error("Failed to fetch past plans:", err);
    }
  };

  const handleSearchPastPlans = (query: string) => {
    setSearchWeek(query);
    const filtered = pastPlans.filter((plan) => {
      const matchWeek = plan.weekIdentifier.includes(query);
      const matchTask = plan.bigRocks.some((rock) =>
        rock.task.toLowerCase().includes(query.toLowerCase()),
      );
      const matchRole = plan.bigRocks.some((rock) =>
        rock.roleName.toLowerCase().includes(query.toLowerCase()),
      );
      return matchWeek || matchTask || matchRole;
    });
    setFilteredPastPlans(filtered);
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

  return (
    <div className="space-y-6">
      {/* 模式切換器 */}
      <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-sm">
        <button
          onClick={() => setViewMode("current")}
          className={`flex-1 py-3 rounded-xl font-bold transition ${
            viewMode === "current"
              ? "bg-indigo-600 text-white"
              : "text-slate-600"
          }`}
        >
          本週計畫
        </button>
        <button
          onClick={() => setViewMode("past")}
          className={`flex-1 py-3 rounded-xl font-bold transition ${
            viewMode === "past" ? "bg-indigo-600 text-white" : "text-slate-600"
          }`}
        >
          過往計畫
        </button>
      </div>

      {/* 本週計畫視圖 */}
      {viewMode === "current" && (
        <div className="space-y-6">
          <div className="bg-indigo-900 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col max-h-[calc(100vh-300px)]">
            <div className="flex-shrink-0">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black italic">
                    週計畫：大石頭排程
                  </h2>
                  <p className="text-indigo-300 text-xs mt-2 uppercase tracking-widest font-bold">
                    要事第一 (Put First Things First)
                  </p>
                </div>
                {(() => {
                  const completed = bigRocks.filter(
                    (r) => r.isCompleted,
                  ).length;
                  const rate =
                    bigRocks.length > 0
                      ? Math.round((completed / bigRocks.length) * 100)
                      : 0;
                  return (
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl md:text-4xl font-black text-yellow-300">
                          {rate}%
                        </span>
                        <span className="text-xs text-indigo-200 font-bold">
                          {completed}/{bigRocks.length}
                        </span>
                      </div>
                      <div className="w-32 h-2 bg-indigo-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-300 transition-all duration-300"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="mt-8 h-[500px] overflow-y-auto space-y-4">
              {bigRocks.map((rock, i) => (
                <div
                  key={i}
                  className="bg-white/10 p-5 rounded-3xl border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() => openEditModal(i)}
                >
                  <div className="w-1.5 h-10 bg-indigo-400 rounded-full" />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold opacity-60 uppercase w-full">
                      {rock.roleName}
                    </p>
                    <p className="text-sm font-medium w-full mt-1">
                      {rock.task}
                    </p>
                    <p className="text-[10px] opacity-50 mt-2">
                      目標日期: {rock.targetDate}
                    </p>
                  </div>
                  {rock.isCompleted && (
                    <div className="flex-shrink-0 text-green-400 text-lg font-bold">
                      ✓
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRock(i);
                    }}
                    className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 transition-colors"
                    title="刪除"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full py-4 border-2 border-dashed border-indigo-500/50 rounded-3xl text-indigo-300 text-sm font-bold"
          >
            + 放入一顆大石頭
          </button>
        </div>
      )}

      {/* 過往計畫視圖 */}
      {viewMode === "past" && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="搜尋週次、任務或角色..."
            className="w-full p-4 text-slate-600 bg-white rounded-2xl outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
            value={searchWeek}
            onChange={(e) => handleSearchPastPlans(e.target.value)}
          />

          {filteredPastPlans.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <p className="text-slate-500">無符合條件的計畫</p>
            </div>
          ) : (
            filteredPastPlans.map((plan, idx) => {
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
      )}

      {/* 編輯/新增 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-[3rem] p-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {editingIndex !== null ? "編輯大石頭" : "新增大石頭"}
              </h3>
              <button onClick={handleCloseModal}>
                <XMarkIcon className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="角色名稱"
                className="w-full p-4 text-slate-600 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-400"
                value={formData.roleName}
                onChange={(e) =>
                  setFormData({ ...formData, roleName: e.target.value })
                }
              />
              <textarea
                placeholder="大石頭任務"
                className="w-full p-4 text-slate-600 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-400 resize-none h-32"
                value={formData.task}
                onChange={(e) =>
                  setFormData({ ...formData, task: e.target.value })
                }
              />
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  預定完成日期
                </label>
                <input
                  type="date"
                  className="w-full p-4 text-slate-600 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-400"
                  value={formData.targetDate}
                  onChange={(e) =>
                    setFormData({ ...formData, targetDate: e.target.value })
                  }
                />
              </div>
              <button
                onClick={handleSaveRock}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition"
              >
                {editingIndex !== null ? "儲存變更" : "新增"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
