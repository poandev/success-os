"use client";
import React, { useState } from "react";

export default function HabitStackingForm() {
  const [habit, setHabit] = useState({
    roleName: "",
    existingHabit: "",
    newAction: "",
    twoMinuteVersion: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 這裡之後會串接 API
    console.log("提交習慣疊加：", habit);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">建立習慣疊加</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 角色關聯 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            對應角色 (願景層)
          </label>
          <select
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            onChange={(e) => setHabit({ ...habit, roleName: e.target.value })}
          >
            <option value="">選擇身分...</option>
            <option value="engineer">工程師</option>
            <option value="DD">白金</option>
          </select>
        </div>

        {/* 習慣疊加公式 */}
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <p className="text-sm text-indigo-800 font-semibold mb-2">
            原子習慣公式：
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">在</span>
              <input
                type="text"
                placeholder="既有習慣 (例如：刷牙)"
                className="flex-1 text-sm border-b-2 border-indigo-200 bg-transparent focus:outline-none focus:border-indigo-500"
                onChange={(e) =>
                  setHabit({ ...habit, existingHabit: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">之後，我會執行</span>
              <input
                type="text"
                placeholder="新習慣 (例如：做 10 個深蹲)"
                className="flex-1 text-sm border-b-2 border-indigo-200 bg-transparent focus:outline-none focus:border-indigo-500"
                onChange={(e) =>
                  setHabit({ ...habit, newAction: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* 兩分鐘法則 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 italic">
            兩分鐘法則 (確保啟動無壓力)
          </label>
          <input
            type="text"
            placeholder="極簡版本 (例如：穿上球鞋)"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            onChange={(e) =>
              setHabit({ ...habit, twoMinuteVersion: e.target.value })
            }
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 font-bold"
        >
          開始疊加身分
        </button>
      </form>
    </div>
  );
}
