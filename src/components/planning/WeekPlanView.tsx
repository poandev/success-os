export default function WeekPlanView() {
  const bigRocks = [
    { role: "工程師", task: "實作 MongoDB Goal 關聯邏輯" },
    { role: "創業者", task: "與 2 位潛在合作夥伴見面" },
    { role: "家人", task: "週末帶父母去北海岸散步" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-indigo-900 p-6 rounded-[2.5rem] text-white">
        <p className="text-xs opacity-60">WEEKLY FOCUS</p>
        <h2 className="text-xl font-bold mt-1">本週大石頭 (Big Rocks)</h2>
        <div className="mt-6 space-y-4">
          {bigRocks.map((rock, i) => (
            <div
              key={i}
              className="flex gap-4 items-center bg-white/10 p-4 rounded-2xl border border-white/10"
            >
              <div className="w-2 h-10 bg-indigo-400 rounded-full" />
              <div>
                <p className="text-[10px] font-bold opacity-60 uppercase">
                  {rock.role}
                </p>
                <p className="text-sm font-medium">{rock.task}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
