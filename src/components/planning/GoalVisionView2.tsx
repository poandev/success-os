"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  TrashIcon,
  XMarkIcon,
  RocketLaunchIcon,
  CubeTransparentIcon,
  ClockIcon,
  GlobeAltIcon,
  PresentationChartLineIcon,
  BoltIcon,
  PencilSquareIcon,
  PlusIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

// --- 型別定義 ---
type GoalLevel = "Long" | "Mid" | "Short";

interface Goal {
  _id?: string;
  title: string;
  level: GoalLevel;
  deadline: string;
  progress: number;
}

// --- 設定檔 ---
const levelConfig: Record<
  GoalLevel,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    border: string;
    shadow: string;
    text: string;
    badge: string;
    bgGradient: string;
  }
> = {
  Long: {
    label: "A70 願景",
    icon: GlobeAltIcon,
    color: "from-violet-500 via-fuchsia-500 to-pink-500",
    border: "border-fuchsia-500/30",
    shadow: "shadow-fuchsia-500/20",
    text: "text-fuchsia-400",
    badge: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20",
    bgGradient: "from-fuchsia-900/20 to-transparent",
  },
  Mid: {
    label: "年度目標",
    icon: PresentationChartLineIcon,
    color: "from-cyan-400 via-blue-500 to-indigo-500",
    border: "border-cyan-500/30",
    shadow: "shadow-cyan-500/20",
    text: "text-cyan-400",
    badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    bgGradient: "from-cyan-900/20 to-transparent",
  },
  Short: {
    label: "短期衝刺",
    icon: BoltIcon,
    color: "from-emerald-400 via-teal-500 to-cyan-400",
    border: "border-emerald-500/30",
    shadow: "shadow-emerald-500/20",
    text: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    bgGradient: "from-emerald-900/20 to-transparent",
  },
};

export default function GoalVisionView2() {
  // --- 狀態管理 ---
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGoalId, setCurrentGoalId] = useState<string | null>(null);

  // 動畫與選單狀態
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // 長按邏輯 Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  // 表單資料
  const [formData, setFormData] = useState<Omit<Goal, "_id">>({
    title: "",
    level: "Long",
    deadline: "",
    progress: 0,
  });

  // --- 資料獲取 ---
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetch("/api/goals");
        const data = await res.json();
        setGoals(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch goals", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();

    const handleClickOutside = () => setMenuOpenId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // --- 統計 ---
  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => g.progress === 100).length;
    const avgProgress =
      total === 0
        ? 0
        : Math.round(
            goals.reduce((acc, curr) => acc + (curr.progress || 0), 0) / total,
          );
    return { total, completed, avgProgress };
  }, [goals]);

  // --- 互動邏輯 ---
  const triggerJelly = (id: string) => {
    setAnimatingId(id);
    setTimeout(() => setAnimatingId(null), 500);
  };

  // --- 長按處理核心 ---
  const startPress = (id: string) => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      // 觸發震動回饋 (僅手機有效)
      if (navigator.vibrate) navigator.vibrate(50);
      setMenuOpenId(id);
    }, 600); // 600ms 視為長按
  };

  const endPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleCardInteraction = (
    e: React.MouseEvent | React.TouchEvent,
    id: string,
  ) => {
    // 阻止冒泡以免關閉選單
    // e.stopPropagation();
    // 若是短按 (Click)，且沒有觸發長按邏輯，則執行果凍動畫
    if (!isLongPressRef.current) {
      triggerJelly(id);
      // 如果有點開的選單，點其他地方應該要關閉 (由 global click handler 處理)
    }
  };

  const openAddModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setFormData({ title: "", level: "Long", deadline: "", progress: 0 });
    setShowModal(true);
  };

  const openEditModal = (goal: Goal) => {
    setMenuOpenId(null);
    setIsEditing(true);
    setCurrentGoalId(goal._id || null);
    setFormData({
      title: goal.title,
      level: goal.level,
      deadline: goal.deadline ? goal.deadline.split("T")[0] : "",
      progress: goal.progress || 0,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
  };

  // --- API ---
  const handleSubmit = async () => {
    if (!formData.title || !formData.deadline) return alert("請填寫完整資訊");
    const method = isEditing ? "PATCH" : "POST";
    const url = isEditing ? `/api/goals/${currentGoalId}` : "/api/goals";

    try {
      const res = await fetch(url, {
        method: method,
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (res.ok) {
        if (isEditing) {
          setGoals(goals.map((g) => (g._id === currentGoalId ? data : g)));
        } else {
          setGoals([data, ...goals]);
        }
        closeModal();
      }
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要移除這個目標嗎？")) return;
    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (res.ok) setGoals(goals.filter((g) => g._id !== id));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-500 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">
          Vision OS Loading...
        </p>
      </div>
    );

  return (
    <div className="relative space-y-8 h-[calc(100vh-120px)] overflow-auto pb-24 px-2 scrollbar-hide text-white select-none">
      <style jsx global>{`
        @keyframes jelly {
          0% {
            transform: scale(1, 1);
          }
          25% {
            transform: scale(0.98, 1.02);
          }
          50% {
            transform: scale(1.02, 0.98);
          }
          75% {
            transform: scale(0.99, 1.01);
          }
          100% {
            transform: scale(1, 1);
          }
        }
        .animate-jelly {
          animation: jelly 0.4s ease-in-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* 背景裝飾 */}
      <div className="fixed top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
      <div className="fixed bottom-[10%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-900/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* 儀表板 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            總目標
          </span>
          <span className="text-2xl font-black text-white mt-1">
            {stats.total}
          </span>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            已達成
          </span>
          <span className="text-2xl font-black text-emerald-400 mt-1">
            {stats.completed}
          </span>
        </div>
        <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            總進度
          </span>
          <span className="text-2xl font-black text-indigo-400 mt-1">
            {stats.avgProgress}%
          </span>
        </div>
      </div>

      {/* 浮動新增按鈕 */}
      <button
        onClick={openAddModal}
        className="fixed bottom-8 right-4 z-40 group overflow-hidden p-4 rounded-full bg-slate-950/90 backdrop-blur-xl border border-white/10 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:border-indigo-500/50 hover:shadow-[0_0_50px_rgba(79,70,229,0.6)] transition-all active:scale-90 duration-200 ease-out flex items-center justify-center gap-2"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
        <RocketLaunchIcon className="w-6 h-6 stroke-[2] text-indigo-300 group-hover:text-white transition-colors group-hover:animate-bounce relative z-10" />
        <span className="relative z-10 font-black text-sm tracking-wide hidden sm:block pr-1">
          新增願景
        </span>
      </button>

      {/* 目標列表 */}
      {(["Long", "Mid", "Short"] as const).map((levelKey) => {
        const config = levelConfig[levelKey];
        const ConfigIcon = config.icon;
        const levelGoals = goals.filter((g) => g.level === levelKey);

        return (
          <div key={levelKey} className="space-y-4">
            <div className="flex items-center justify-between px-2 py-2 sticky top-0 bg-[#0f172a]/80 backdrop-blur-md z-10 rounded-xl">
              <h4 className="flex items-center gap-3 text-lg font-black text-white drop-shadow-md">
                <span
                  className={`p-1.5 rounded-lg bg-white/5 border border-white/5 ${config.text}`}
                >
                  <ConfigIcon className="w-5 h-5" />
                </span>
                {config.label}
              </h4>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border shadow-inner backdrop-blur-md ${config.badge}`}
              >
                {levelGoals.length}
              </span>
            </div>

            <div className="grid gap-4">
              {levelGoals.map((goal) => {
                const isAnimating = animatingId === goal._id;
                const isMenuOpen = menuOpenId === goal._id;

                return (
                  <div
                    key={goal._id}
                    // --- 長按事件綁定 ---
                    onMouseDown={() => goal._id && startPress(goal._id)}
                    onMouseUp={endPress}
                    onMouseLeave={endPress}
                    onTouchStart={() => goal._id && startPress(goal._id)}
                    onTouchEnd={(e) => {
                      endPress();
                      if (goal._id) handleCardInteraction(e, goal._id);
                    }}
                    onClick={(e) => {
                      // 桌面版 Click 觸發短按邏輯 (手機主要靠 TouchEnd)
                      if (goal._id) handleCardInteraction(e, goal._id);
                    }}
                    // --- 樣式設定 ---
                    className={`group relative bg-white/[0.02] backdrop-blur-[20px] backdrop-saturate-[180%] rounded-[2rem] p-5 border shadow-lg transition-all duration-200 cursor-pointer overflow-hidden
                      ${config.border} ${config.shadow}
                      ${isAnimating ? "animate-jelly" : "hover:bg-white/[0.05] active:scale-[0.98]"}
                      ${isMenuOpen ? "z-30 ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0f172a]" : "z-auto"}`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1 flex-1 pr-2">
                          <h3 className="text-lg font-bold text-white tracking-tight leading-snug drop-shadow-sm line-clamp-2">
                            {goal.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <ClockIcon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono font-medium tracking-wide opacity-80">
                              {new Date(goal.deadline).toLocaleDateString(
                                "zh-TW",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pointer-events-none">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <ChartBarIcon className="w-3 h-3" /> 進度
                          </span>
                          <span
                            className={`text-sm font-mono font-black ${config.text}`}
                          >
                            {goal.progress}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${config.color} shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-1000 relative`}
                            style={{ width: `${goal.progress}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </div>
                        </div>
                      </div>

                      {/* 長按觸發的懸浮選單 (覆蓋在卡片上層) */}
                      {isMenuOpen && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center gap-4 animate-in fade-in duration-200 rounded-[2rem]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(goal);
                            }}
                            className="flex flex-col items-center gap-1 text-white hover:text-indigo-400 transition-colors p-4"
                          >
                            <div className="p-3 bg-white/10 rounded-full">
                              <PencilSquareIcon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold">編輯</span>
                          </button>
                          <div className="w-px h-10 bg-white/20"></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              goal._id && handleDelete(goal._id);
                            }}
                            className="flex flex-col items-center gap-1 text-white hover:text-red-400 transition-colors p-4"
                          >
                            <div className="p-3 bg-white/10 rounded-full">
                              <TrashIcon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold">刪除</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {levelGoals.length === 0 && (
                <div className="py-8 border border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center space-y-2 bg-white/[0.01]">
                  <CubeTransparentIcon className="w-6 h-6 text-slate-600 opacity-50" />
                  <p className="text-slate-600 text-xs font-medium tracking-wide font-mono">
                    暫無資料
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Modal 保持不變 */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-2 sm:p-0">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeModal}
          />
          <div className="relative bg-[#0f172a] border border-white/10 w-full max-w-lg rounded-3xl p-6 shadow-2xl shadow-black animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                {isEditing ? (
                  <PencilSquareIcon className="w-6 h-6 text-indigo-400" />
                ) : (
                  <RocketLaunchIcon className="w-6 h-6 text-indigo-400" />
                )}
                {isEditing ? "編輯願景" : "啟動新願景"}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 bg-white/5 rounded-full text-slate-400 hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase px-1">
                  目標名稱
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="輸入目標..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase px-1">
                    層級
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        level: e.target.value as GoalLevel,
                      })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none appearance-none focus:bg-white/10"
                  >
                    <option value="Long" className="bg-slate-900">
                      A70 願景
                    </option>
                    <option value="Mid" className="bg-slate-900">
                      年度目標
                    </option>
                    <option value="Short" className="bg-slate-900">
                      短期衝刺
                    </option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase px-1">
                    截止日期
                  </label>
                  <input
                    type="date"
                    value={formData.deadline.split("T")[0]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deadline: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:bg-white/10 [color-scheme:dark]"
                  />
                </div>
              </div>
              {isEditing && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between px-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">
                      當前進度
                    </label>
                    <span className="text-indigo-400 font-black font-mono">
                      {formData.progress}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        progress: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              )}
              <button
                onClick={handleSubmit}
                className="w-full py-4 mt-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/50 hover:bg-indigo-500 active:scale-95 transition-all duration-200"
              >
                確認儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
