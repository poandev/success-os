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
    <div className="space-y-4">
      <button
        onClick={() => {
          setIsEditing(false);
          setShowModal(true);
        }}
        className="flex w-full p-3 bg-indigo-300/50 border-2 border-dashed border-indigo-300 rounded-3xl text-indigo-600 font-bold items-center justify-center hover:bg-indigo-50 transition"
      >
        + 增加新目標
      </button>

      {/* 新增目標模態視窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-[3rem] sm:rounded-3xl shadow-xl max-w-md w-full p-8 animate-in slide-in-from-bottom duration-300">
            {/* 標題列 */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {isEditing ? "編輯目標" : "新增目標"}
              </h3>
              <button onClick={closeModal}>
                <XMarkIcon className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* 表單內容 */}
            <div className="space-y-5">
              {/* 標題輸入 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  目標標題 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="目標名稱"
                  className="w-full px-5 py-3 text-slate-600 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* 進度調整 (僅編輯模式顯示) */}
              {isEditing && (
                <div>
                  <label className="block text-sm font-bold text-indigo-600 mb-3 px-1">
                    達成進度: {formData.progress}%
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
                      className="w-full h-3 bg-gradient-to-r from-slate-200 via-indigo-200 to-indigo-400 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #818cf8 0%, #818cf8 ${formData.progress}%, #e2e8f0 ${formData.progress}%, #e2e8f0 100%)`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 目標層級 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  目標層級 *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      level: e.target.value as Goal["level"],
                    })
                  }
                  className="w-full px-4 py-2 text-slate-600 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  <option value="Long">A70 目標</option>
                  <option value="Mid">本年度目標</option>
                  <option value="Short">短期目標</option>
                </select>
              </div>

              {/* 截止日期 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  截止日期 *
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
                  className="w-full px-4 py-2 text-slate-600 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition"
              >
                {isEditing ? "儲存變更" : "立即建立"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 目標列表 */}
      {[
        { title: "A70", key: "Long" },
        { title: "本年度", key: "Mid" },
        { title: "短期", key: "Short" },
      ].map((level) => (
        <div key={level.key}>
          <h4 className="text-lg font-bold text-slate-800 mb-2 px-2 uppercase">
            {level.title} 目標
          </h4>
          <div className="space-y-3">
            {goals
              .filter((g) => g.level === level.key)
              .map((goal: Goal) => (
                <div
                  key={goal._id}
                  onClick={() => openEditModal(goal)}
                  className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 active:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">
                          {goal.title}
                        </h3>
                        <span className="text-sm text-slate-400">
                          {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      {/* 進度條 */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-500">進度</span>
                          <span className="text-xs font-bold text-indigo-600">
                            {goal.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {/* 刪除按鈕 - 針對手機優化，大小適中 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goal._id && handleDelete(goal._id);
                      }}
                      className="ml-2 p-2 text-red-500 hover:text-red-600 active:bg-red-50 rounded-2xl transition-colors"
                      aria-label="刪除目標"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
