"use client";
import { useState, useEffect } from "react";
import {
  TrashIcon,
  XMarkIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

type Goal = {
  _id?: string;
  title: string;
  level: "Long" | "Mid" | "Short";
  deadline: string;
  progress?: number;
};

// 目標層級配色方案
const levelStyles = {
  Long: {
    label: "A70 目標",
    color: "from-purple-500 to-purple-600",
    bgLight: "bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    accent: "text-purple-600",
    border: "border-purple-200",
  },
  Mid: {
    label: "本年度目標",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    accent: "text-blue-600",
    border: "border-blue-200",
  },
  Short: {
    label: "短期目標",
    color: "from-emerald-500 to-emerald-600",
    bgLight: "bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
    accent: "text-emerald-600",
    border: "border-emerald-200",
  },
};

export default function GoalVisionView() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGoalId, setCurrentGoalId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Goal, "_id">>({
    title: "",
    level: "Long",
    deadline: "",
    progress: 0,
  });

  // 1. Read (讀取)
  useEffect(() => {
    fetch("/api/goals")
      .then((res) => res.json())
      .then((data) => {
        setGoals(data);
        setLoading(false);
      });
  }, []);

  // 開啟編輯模式
  const openEditModal = (goal: Goal) => {
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

  // 2. Create / Update 切換邏輯
  const handleSubmit = async () => {
    const method = isEditing ? "PATCH" : "POST";
    const url = isEditing ? `/api/goals/${currentGoalId}` : "/api/goals";

    const res = await fetch(url, {
      method: method,
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (isEditing) {
      setGoals(goals.map((g) => (g._id === currentGoalId ? data : g)));
    } else {
      setGoals([...goals, data]);
    }

    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentGoalId(null);
    setFormData({ title: "", level: "Long", deadline: "", progress: 0 });
  };

  // DELETE 實作
  const handleDelete = async (id: string) => {
    // 手機端建議增加一個簡單確認，避免誤觸
    if (!confirm("確定要移除這個願景目標嗎？這將會影響垂直整合的計畫。"))
      return;

    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // 樂觀更新 UI：直接過濾掉被刪除的 ID
        setGoals(goals.filter((goal: Goal) => goal._id !== id));
      } else {
        alert("刪除失敗");
      }
    } catch (error) {
      console.error("刪除時發生錯誤", error);
    }
  };

  if (loading) return <div className="text-center p-10">載入願景中...</div>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => {
          setIsEditing(false);
          setShowModal(true);
        }}
        className="flex w-full p-4 bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-dashed border-indigo-300 rounded-2xl text-indigo-700 font-bold items-center justify-center hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-400 active:scale-95 transition-all duration-200"
      >
        <span className="text-xl">✨</span> &nbsp; 增加新目標
      </button>

      {/* 新增目標模態視窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in slide-in-from-bottom duration-300 sm:scale-in">
            {/* 標題列 */}
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900">
                {isEditing ? "✏️ 編輯目標" : "🎯 新增目標"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* 表單內容 */}
            <div className="space-y-6">
              {/* 標題輸入 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  目標標題 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="請輸入目標名稱..."
                  className="w-full px-4 py-3 text-slate-700 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
              </div>

              {/* 進度調整 (僅編輯模式顯示) */}
              {isEditing && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    達成進度:{" "}
                    <span className="text-lg font-bold text-indigo-600">
                      {formData.progress}%
                    </span>
                  </label>
                  <div className="relative">
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
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}

              {/* 目標層級 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  目標層級 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      level: e.target.value as Goal["level"],
                    })
                  }
                  className="w-full px-4 py-3 text-slate-700 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none transition"
                >
                  <option value="Long">🏔️ A70 目標 (1-70年)</option>
                  <option value="Mid">📅 本年度目標</option>
                  <option value="Short">⚡ 短期目標</option>
                </select>
              </div>

              {/* 截止日期 */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  截止日期 <span className="text-red-500">*</span>
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
                  className="w-full px-4 py-3 text-slate-700 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none transition"
                />
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-95 transition-all"
              >
                {isEditing ? "✓ 儲存變更" : "✓ 立即建立"}
              </button>
              <button
                onClick={closeModal}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 目標列表 */}
      {[
        { title: "🏔️ A70 目標", key: "Long" },
        { title: "📅 本年度目標", key: "Mid" },
        { title: "⚡ 短期目標", key: "Short" },
      ].map((level) => (
        <div key={level.key}>
          <div className="flex items-center gap-2 mb-4 px-2">
            <h4 className="text-lg font-bold text-slate-800">{level.title}</h4>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{
                backgroundColor:
                  levelStyles[
                    level.key as keyof typeof levelStyles
                  ].badge.split(" ")[0],
                color:
                  levelStyles[
                    level.key as keyof typeof levelStyles
                  ].badge.split(" ")[1],
              }}
            >
              {goals.filter((g) => g.level === level.key).length} 個
            </span>
          </div>
          <div className="space-y-3">
            {goals
              .filter((g) => g.level === level.key)
              .map((goal: Goal) => {
                const style = levelStyles[goal.level];
                return (
                  <div
                    key={goal._id}
                    onClick={() => openEditModal(goal)}
                    className="bg-white hover:shadow-md border-l-4 transition-all cursor-pointer rounded-2xl overflow-hidden"
                    style={{
                      borderLeftColor:
                        style.color.split(" ")[0] === "from"
                          ? "rgb(168, 85, 247)"
                          : style.color.includes("blue")
                            ? "rgb(59, 130, 246)"
                            : "rgb(16, 185, 129)",
                    }}
                  >
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-lg break-words">
                            {goal.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            📅{" "}
                            {new Date(goal.deadline).toLocaleDateString(
                              "zh-TW",
                            )}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            goal._id && handleDelete(goal._id);
                          }}
                          className="flex-shrink-0 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 active:bg-red-100 rounded-lg transition-colors"
                          aria-label="刪除目標"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>

                      {/* 進度條 */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-600">
                            進度
                          </span>
                          <span
                            className="text-sm font-bold"
                            style={{
                              color:
                                style.color.split(" ")[0] === "from"
                                  ? "rgb(168, 85, 247)"
                                  : style.color.includes("blue")
                                    ? "rgb(59, 130, 246)"
                                    : "rgb(16, 185, 129)",
                            }}
                          >
                            {goal.progress}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${goal.progress}%`,
                              background: `linear-gradient(to right, ${
                                style.color.split(" ")[0] === "from"
                                  ? "rgb(168, 85, 247)"
                                  : style.color.includes("blue")
                                    ? "rgb(59, 130, 246)"
                                    : "rgb(16, 185, 129)"
                              }, ${
                                style.color.split(" ")[0] === "from"
                                  ? "rgb(147, 51, 234)"
                                  : style.color.includes("blue")
                                    ? "rgb(37, 99, 235)"
                                    : "rgb(5, 150, 105)"
                              })`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            {goals.filter((g) => g.level === level.key).length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">還沒有{level.title}，立即新增一個吧！</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
