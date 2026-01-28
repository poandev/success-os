export default function MonthPlanView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800">1月計畫</h2>
        <button className="text-indigo-600 text-sm font-bold">
          + 設定月重點
        </button>
      </div>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-400 mb-4 tracking-widest">
          本月三大戰功
        </h3>
        <ul className="space-y-4">
          {[
            "啟動 Success OS 專案開發",
            "完成 4 場曲線管理說明會",
            "讀完《與成功有約》",
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                {i + 1}
              </div>
              <span className="text-slate-700 font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
