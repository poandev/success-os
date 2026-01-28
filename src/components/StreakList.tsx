"use client";
import { FireIcon, CheckCircleIcon } from "@heroicons/react/24/solid";

const mockHabits = [
  {
    id: "1",
    title: "冥想與使命宣言",
    streak: 15,
    role: "心靈修行者",
    completedToday: true,
    after: "起床",
  },
  {
    id: "2",
    title: "撰寫技術文件",
    streak: 4,
    role: "工程師",
    completedToday: false,
    after: "早餐",
  },
  {
    id: "3",
    title: "深蹲 10 下",
    streak: 28,
    role: "健康管理者",
    completedToday: true,
    after: "晚餐",
  },
];

export default function MobileStreakList() {
  return (
    <div className="space-y-3">
      {mockHabits.map((habit) => (
        <div
          key={habit.id}
          className="bg-white p-4 rounded-[1.5rem] shadow-sm flex items-center gap-4 border border-transparent active:scale-[0.98] transition-transform"
        >
          {/* 左側：連勝火苗 */}
          <div className="flex flex-col items-center justify-center bg-orange-50 w-12 h-12 rounded-2xl">
            <FireIcon className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold text-orange-600">
              {habit.streak}
            </span>
          </div>

          {/* 中間：任務內容 */}
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800 leading-tight">
              {habit.title}
            </h4>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">
              在 {habit.after} 之後
            </p>
          </div>

          {/* 右側：打卡大按鈕 */}
          <button
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${habit.completedToday ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-300"}`}
          >
            <CheckCircleIcon className="w-7 h-7 stroke-[3px]" />
          </button>
        </div>
      ))}
    </div>
  );
}
