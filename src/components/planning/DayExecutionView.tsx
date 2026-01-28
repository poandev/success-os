import MobileStreakList from "@/components/StreakList";

export default function DayExecutionView() {
  return (
    <div className="space-y-8">
      {/* 今日核心行動 - 直接從週計畫大石頭拆解而來 */}
      <section>
        <h3 className="text-xs font-bold text-slate-400 mb-3 tracking-widest uppercase">
          今日核心行動
        </h3>
        <div className="bg-white p-5 rounded-3xl shadow-sm border-l-4 border-indigo-500">
          <div className="flex justify-between items-center">
            <p className="font-bold text-slate-800">撰寫 Goal Schema 與 API</p>
            <input
              type="checkbox"
              className="w-6 h-6 rounded-full border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* 習慣疊加區 */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase">
            身分認同習慣
          </h3>
          <span className="text-[10px] text-orange-500 font-bold">
            🔥 8 天連勝
          </span>
        </div>
        <MobileStreakList /> {/* 這是我們之前寫的手機版打卡列表 */}
      </section>
    </div>
  );
}
