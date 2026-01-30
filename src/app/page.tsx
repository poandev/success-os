import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* 頂部：願景與個人憲法 */}
      <header className="px-6 py-12 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
          Success OS DD
        </h1>
        <p className="text-base text-slate-500 font-medium mb-8">以終為始</p>

        {/* 個人憲法卡片 */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-indigo-100 overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-100 rounded-full -translate-x-16 -translate-y-16 opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-50 rounded-full translate-x-20 translate-y-20 opacity-40"></div>
            <div className="relative z-10">
              {/* <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">
                ✨ 個人憲法
              </p> */}
              <p className="text-xl text-slate-700 italic font-semibold leading-relaxed">
                「單純相信照著做。」
              </p>
            </div>
          </div>
        </div>

        {/* 核心功能區域 */}
        <div className="max-w-2xl mx-auto space-y-4 mb-12">
          {/* 導航到 Plan Page */}
          <Link
            href="/plan"
            className="block bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 text-white rounded-2xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 active:translate-y-0"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm font-medium text-indigo-100 mb-1">
                  開始規劃
                </p>
                <p className="text-xl font-bold">進入規劃中心</p>
              </div>
              <span className="text-3xl">→</span>
            </div>
            <p className="text-xs text-indigo-200 mt-3">
              願景目標 • 月份計畫 • 週計畫 • 日執行
            </p>
          </Link>

          {/* 習慣追蹤（預留） */}
          {/* <div className="block bg-slate-100 hover:bg-slate-200 transition-colors rounded-2xl p-6 opacity-50 cursor-not-allowed">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm font-medium text-slate-500 mb-1">
                  即將推出
                </p>
                <p className="text-xl font-bold text-slate-700">習慣追蹤</p>
              </div>
              <span className="text-3xl">🔒</span>
            </div>
          </div> */}
        </div>

        {/* 視覺化統計（預留） */}
        {/* <div className="max-w-2xl mx-auto grid grid-cols-3 gap-3 mb-12">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <p className="text-2xl font-black text-indigo-600">0</p>
            <p className="text-xs text-slate-500 mt-1">目標</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <p className="text-2xl font-black text-emerald-600">0</p>
            <p className="text-xs text-slate-500 mt-1">習慣</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <p className="text-2xl font-black text-orange-600">0</p>
            <p className="text-xs text-slate-500 mt-1">連勝</p>
          </div>
        </div> */}

        {/* 說明文字 */}
        {/* <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700">Success OS</span>{" "}
            是個人發展系統， 結合柯維的時間管理四象限、習慣疊加等方法論，
            幫助你在有限時間內完成最重要的事。
          </p>
        </div> */}
      </header>
    </main>
  );
}
