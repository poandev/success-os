import Link from "next/link";
import {
  BoltIcon,
  BanknotesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white flex flex-col justify-center relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-emerald-600/10 rounded-full blur-[100px]" />

      <header className="px-6 py-12 text-center relative z-10">
        <h1 className="text-5xl font-black tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Success OS
        </h1>
        <p className="text-slate-400 font-mono text-sm tracking-[0.2em] uppercase mb-12">
          DD V2.2 SYSTEM
        </p>

        {/* 核心雙入口 */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
          {/* 左：規劃中心 (Plan) */}
          <Link
            href="/plan?view=Flow"
            className="group relative bg-slate-800/50 hover:bg-indigo-900/40 border border-white/10 hover:border-indigo-500/50 rounded-[2rem] p-8 text-left transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-indigo-500/20"
          >
            <div className="absolute top-4 right-4 bg-white/5 p-3 rounded-full group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <BoltIcon className="w-6 h-6 text-indigo-300 group-hover:text-white" />
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-white mb-2">規劃中控</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                以終為始，要事第一。
                <br />
                願景 • 週計畫 • 時間流
              </p>
              <span className="inline-flex items-center gap-2 text-xs font-bold text-indigo-300 group-hover:text-white transition-colors uppercase tracking-widest">
                Enter System <ArrowRightIcon className="w-3 h-3" />
              </span>
            </div>
          </Link>

          {/* 右：財富中控 (Money) */}
          <Link
            href="/finance"
            className="group relative bg-slate-800/50 hover:bg-emerald-900/40 border border-white/10 hover:border-emerald-500/50 rounded-[2rem] p-8 text-left transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-emerald-500/20"
          >
            <div className="absolute top-4 right-4 bg-white/5 p-3 rounded-full group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <BanknotesIcon className="w-6 h-6 text-emerald-300 group-hover:text-white" />
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-white mb-2">財富戰情</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                現金流與資產配置。
                <br />
                股票庫存 • 收支記帳
              </p>
              <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 group-hover:text-white transition-colors uppercase tracking-widest">
                Manage Assets <ArrowRightIcon className="w-3 h-3" />
              </span>
            </div>
          </Link>
        </div>

        {/* 底部小語 */}
        <div className="mt-16 opacity-50">
          <p className="text-sm text-slate-500 italic font-medium">
            單純相信照著做。
          </p>
        </div>
      </header>
    </main>
  );
}
