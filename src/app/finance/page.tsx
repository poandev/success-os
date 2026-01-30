"use client";
import Link from "next/link";
import { HomeIcon } from "@heroicons/react/24/solid";
// 引入您之前建立的 FinanceDashboard 組件
import FinanceDashboard from "@/components/finance/FinanceDashboard";

export default function FinancePage() {
  return (
    <main className="h-[100dvh] w-full bg-[#09090b] text-white flex flex-col overflow-hidden relative">
      {/* --- 背景光影 (專屬財富色系：Emerald & Gold) --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-emerald-900/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-yellow-600/5 rounded-full blur-[80px]" />
      </div>

      {/* --- 頂部導航列：極簡模式 --- */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 z-50 flex items-center justify-between">
        {/* 左側：回到首頁 */}
        <Link
          href="/"
          className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-slate-400 hover:text-white transition-all duration-300 active:scale-95 backdrop-blur-md"
        >
          <HomeIcon className="w-5 h-5 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
          <span className="text-sm font-bold tracking-wide">回到首頁</span>
        </Link>

        {/* 中間：頁面標題 (裝飾用) */}
        <h1 className="text-lg font-black tracking-[0.2em] text-emerald-500/80 uppercase hidden sm:block">
          Wealth Command
        </h1>

        {/* 右側：佔位符 (保持平衡) */}
        <div className="w-[100px] hidden sm:block" />
      </div>

      {/* --- 主要內容區 --- */}
      <div className="flex-1 min-h-0 w-full z-10 relative px-2 sm:px-6 pb-6">
        {/* 內層容器：包裹 FinanceDashboard */}
        <div className="h-full w-full bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
          {/* 這裡渲染您的財務儀表板 */}
          <FinanceDashboard />
        </div>
      </div>
    </main>
  );
}
