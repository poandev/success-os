import HabitStackingForm from "@/components/HabitStackingForm";
import StreakList from "@/components/StreakList";

export default function MobileDashboard() {
  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {" "}
      {/* 留空間給底部導航 */}
      {/* 頂部：願景與個人憲法 */}
      <header className="bg-white px-6 py-8 rounded-b-[2rem] shadow-sm border-b border-slate-100">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
          Success OS
        </h1>
        <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            個人憲法
          </p>
          <p className="text-sm text-slate-600 italic mt-1">
            「以終為始，活出對世界的正面影響力。」
          </p>
        </div>
      </header>
      <div className="px-5 mt-8 space-y-8">
        {/* 執行層：連勝打卡 (手機版最核心組件) */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold text-slate-800">今日習慣疊加</h2>
            <span className="text-xs text-slate-400">2026/01/28</span>
          </div>
          <StreakList />
        </section>

        {/* 戰略層：本週大石頭 (手機改為橫向滾動或精簡卡片) */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4">本週大石頭</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <div className="min-w-[280px] bg-slate-800 p-5 rounded-3xl text-white shadow-xl">
              <span className="px-2 py-1 bg-indigo-500 rounded-md text-[10px] uppercase font-bold">
                工程師
              </span>
              <p className="mt-3 font-medium">完成 Success OS 核心 Schema</p>
              <div className="mt-4 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400 w-1/2"></div>
              </div>
            </div>
            {/* 更多大石頭卡片... */}
          </div>
        </section>

        {/* 設定層：新增習慣 (平時可摺疊) */}
        <section className="pb-10">
          <details className="group">
            <summary className="list-none flex justify-center items-center py-4 bg-white rounded-2xl border border-slate-200 text-slate-500 font-medium cursor-pointer group-open:mb-4">
              <span>+ 建立新習慣疊加</span>
            </summary>
            <HabitStackingForm />
          </details>
        </section>
      </div>
    </main>
  );
}
