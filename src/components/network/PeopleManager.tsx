"use client";
import { useState, useEffect, useMemo } from "react";
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  StarIcon,
  TagIcon,
  ChatBubbleLeftEllipsisIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowsUpDownIcon, // 新增：排序圖示
} from "@heroicons/react/24/solid";
import { format } from "date-fns";

// --- 型別 ---
interface Note {
  content: string;
  date: string;
}

interface Person {
  _id?: string;
  name: string;
  category: string;
  relationship: string;
  status: "New" | "Warming" | "Invited" | "FollowUp" | "Closed" | "Lost";
  tags: string[];
  notes: Note[];
  rating: number;
  order: number; // 🔥 新增 order
}

const CATEGORIES = ["全部", "Amway", "Work", "Life"];
const STATUS_OPTS = [
  {
    value: "New",
    label: "新名單",
    color: "bg-slate-600",
    ring: "ring-slate-500",
  },
  {
    value: "Warming",
    label: "推薦中",
    color: "bg-amber-600",
    ring: "ring-amber-500",
  },
  {
    value: "Invited",
    label: "已邀約",
    color: "bg-cyan-600",
    ring: "ring-cyan-500",
  },
  {
    value: "FollowUp",
    label: "跟進中",
    color: "bg-indigo-600",
    ring: "ring-indigo-500",
  },
  {
    value: "Closed",
    label: "已達標",
    color: "bg-emerald-500",
    ring: "ring-emerald-500",
  },
  { value: "Lost", label: "暫緩", color: "bg-gray-700", ring: "ring-gray-600" },
];

// 🔥 排序優先級定義：跟進中>>已邀約>>推薦中>>新名單>>已達標>>暫緩
const STATUS_PRIORITY: Record<string, number> = {
  FollowUp: 0,
  Invited: 1,
  Warming: 2,
  New: 3,
  Closed: 4,
  Lost: 5,
};

export default function PeopleManager() {
  const [people, setPeople] = useState<Person[]>([]);
  const [filterCat, setFilterCat] = useState("Amway");
  const [filterStatus, setFilterStatus] = useState("全部");

  // UI 狀態
  const [isCatExpanded, setIsCatExpanded] = useState(false);
  const [isReordering, setIsReordering] = useState(false); // 🔥 新增：排序模式開關

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // 表單狀態
  const [formData, setFormData] = useState<Person>({
    name: "",
    category: "Amway",
    relationship: "",
    status: "New",
    tags: [],
    notes: [],
    rating: 3,
    order: 0,
  });
  const [tagInput, setTagInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  // --- API ---
  const fetchPeople = async () => {
    try {
      const res = await fetch("/api/people");
      const data = await res.json();
      if (Array.isArray(data)) {
        // 確保 notes 存在且排序
        const processed = data.map((p: any) => ({
          ...p,
          notes: Array.isArray(p.notes)
            ? p.notes.sort(
                (a: Note, b: Note) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
            : [],
        }));

        // 🔥 按狀態優先級排序
        const sorted = processed.sort((a, b) => {
          const priorityA = STATUS_PRIORITY[a.status] ?? 999;
          const priorityB = STATUS_PRIORITY[b.status] ?? 999;
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          // 同狀態下按 order 排序
          return (a.order ?? 0) - (b.order ?? 0);
        });

        setPeople(sorted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  // --- 排序邏輯 ---
  const handleMovePerson = async (index: number, direction: "up" | "down") => {
    // 因為有篩選器，我們只能在「當前顯示的列表」中移動
    // 這裡為了簡化邏輯，建議在「全部」或「特定分類」下進行排序
    // 我們直接操作 filteredPeople 的順序，然後更新全域 people

    // 注意：如果在有搜尋關鍵字或多重篩選下排序會比較複雜
    // 這裡我們採用簡單策略：直接交換 people 陣列中的位置
    // 先找到當前這兩個項目在原始 people 陣列中的 index

    const targetPerson = filteredPeople[index];
    const swapTargetIndex = direction === "up" ? index - 1 : index + 1;
    const swapPerson = filteredPeople[swapTargetIndex];

    if (!targetPerson || !swapPerson) return;

    // 找到在原始 people 陣列的索引
    const originalIndex1 = people.findIndex((p) => p._id === targetPerson._id);
    const originalIndex2 = people.findIndex((p) => p._id === swapPerson._id);

    if (originalIndex1 === -1 || originalIndex2 === -1) return;

    const newPeople = [...people];
    // 交換
    [newPeople[originalIndex1], newPeople[originalIndex2]] = [
      newPeople[originalIndex2],
      newPeople[originalIndex1],
    ];

    setPeople(newPeople); // 即時更新 UI

    // 更新後端
    const updatedOrder = newPeople.map((p, idx) => ({
      id: p._id,
      order: idx,
    }));

    try {
      await fetch("/api/people", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ people: updatedOrder }),
      });
    } catch (e) {
      console.error("Reorder failed", e);
      fetchPeople(); // 失敗則回滾
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return alert("請輸入姓名");

    const finalData = { ...formData };
    if (noteInput.trim()) {
      finalData.notes = [
        { content: noteInput, date: new Date().toISOString() },
        ...finalData.notes,
      ];
    }

    await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalData),
    });

    setNoteInput("");
    setShowModal(false);
    fetchPeople();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定刪除此名單？")) return;
    await fetch(`/api/people?id=${id}`, { method: "DELETE" });
    fetchPeople();
  };

  const handleEdit = (p: Person) => {
    // 排序模式下禁用編輯
    if (isReordering) return;

    setFormData(p);
    setNoteInput("");
    setShowModal(true);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      category: "Amway",
      relationship: "",
      status: "New",
      tags: [],
      notes: [],
      rating: 3,
      order: people.length,
    });
    setNoteInput("");
    setShowModal(true);
  };

  // --- 篩選邏輯 ---
  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      const matchCat = filterCat === "全部" || p.category === filterCat;
      const matchStatus = filterStatus === "全部" || p.status === filterStatus;
      const matchSearch =
        p.name.includes(search) ||
        p.tags?.some((t) => t.includes(search)) ||
        p.notes?.some((n) => n.content.includes(search));
      return matchCat && matchStatus && matchSearch;
    });
  }, [people, filterCat, filterStatus, search]);

  const getStatusColor = (status: string) =>
    STATUS_OPTS.find((s) => s.value === status)?.color || "bg-slate-500";
  const getStatusLabel = (status: string) =>
    STATUS_OPTS.find((s) => s.value === status)?.label || status;

  return (
    <div className="h-full w-full bg-[#09090b] text-white flex flex-col font-sans relative overflow-hidden">
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-150%) skewX(-15deg);
          }
          100% {
            transform: translateX(150%) skewX(-15deg);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>

      {/* 頂部搜尋與篩選 */}
      <div className="p-4 border-b border-emerald-500/20 bg-[#051311]/90 backdrop-blur-md z-10 space-y-4 mt-4 rounded-2xl mx-2 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
        {/* 第一列：搜尋 + 按鈕群 */}
        <div className="flex gap-3">
          <div className="flex-1 relative group">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            <input
              type="text"
              placeholder="搜尋..."
              className="w-full bg-emerald-900/10 border border-emerald-500/30 rounded-xl pl-10 pr-4 py-2.5 text-emerald-100 placeholder-emerald-400/50 focus:outline-none focus:border-emerald-400 focus:bg-emerald-900/20 transition-all shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 排序模式開關 */}
          <button
            onClick={() => setIsReordering(!isReordering)}
            className={`p-2.5 rounded-xl transition-all border flex-shrink-0
                ${
                  isReordering
                    ? "bg-amber-600 text-white border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "bg-emerald-900/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-800/30"
                }`}
          >
            <ArrowsUpDownIcon className="w-6 h-6" />
          </button>

          <button
            onClick={handleAdd}
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95 border border-emerald-400/50 flex-shrink-0"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 第二列：狀態篩選 */}
        <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide pb-1 items-center">
          <button
            onClick={() => setFilterStatus("全部")}
            className={`relative px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border overflow-hidden flex-shrink-0
                  ${
                    filterStatus === "全部"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                      : "bg-transparent text-slate-500 border-emerald-500/10 hover:text-white hover:bg-emerald-500/10"
                  }`}
          >
            {filterStatus === "全部" && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full animate-shimmer pointer-events-none" />
            )}
            全部狀態
          </button>

          {STATUS_OPTS.map((status) => {
            const isActive = filterStatus === status.value;
            return (
              <button
                key={status.value}
                onClick={() => setFilterStatus(status.value)}
                className={`relative px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 overflow-hidden flex-shrink-0
                        ${
                          isActive
                            ? `border-white/30 text-white shadow-lg scale-105 ${status.color} bg-opacity-80`
                            : "border-transparent bg-emerald-900/10 text-slate-400 hover:text-white hover:bg-emerald-800/20"
                        }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 h-full -skew-x-12 animate-shimmer pointer-events-none" />
                )}
                <div
                  className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white animate-pulse" : status.color}`}
                />
                <span className="relative z-10">{status.label}</span>
              </button>
            );
          })}
        </div>

        {/* 第三列：分類篩選 */}
        {/* <div className="relative">
          <div
            className={`flex flex-wrap gap-2 transition-all duration-300 ease-in-out overflow-hidden ${isCatExpanded ? "max-h-40 overflow-y-auto scrollbar-hide" : "max-h-[36px]"}`}
          >
            {CATEGORIES.map((cat) => {
              const isActive = filterCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0 overflow-hidden h-[30px]
                            ${
                              isActive
                                ? "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                : "bg-emerald-900/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-800/30 hover:text-white"
                            }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full h-full animate-shimmer pointer-events-none" />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsCatExpanded(!isCatExpanded)}
            className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center bg-gradient-to-l from-[#051311] via-[#051311] to-transparent text-emerald-400 hover:text-emerald-200"
          >
            {isCatExpanded ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
        </div> */}
      </div>

      {/* 名單列表區域 */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {loading ? (
          <div className="text-center text-emerald-400 mt-10 animate-pulse font-mono tracking-widest">
            載入中...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-20">
            {filteredPeople.map((person, index) => (
              <div
                key={person._id}
                onClick={() => handleEdit(person)}
                className={`bg-[#0b1210] border rounded-2xl p-4 relative group transition-all 
                ${isReordering ? "border-amber-500/30 cursor-move" : "border-emerald-500/10 cursor-pointer active:scale-[0.98] hover:border-emerald-500/40 hover:bg-[#111c19] hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"}`}
              >
                {/* 排序模式覆蓋層 */}
                {isReordering && (
                  <div
                    className="absolute top-3 left-2/3 transform -translate-x-2/3 z-20 rounded-2xl flex w-max h-max items-center justify-center gap-1 animate-in fade-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovePerson(index, "up");
                      }}
                      disabled={index === 0}
                      className="p-3 bg-white/10 rounded-full hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-white/10 transition-colors"
                    >
                      <ChevronUpIcon className="w-2 h-2 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovePerson(index, "down");
                      }}
                      disabled={index === filteredPeople.length - 1}
                      className="p-3 bg-white/10 rounded-full hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-white/10 transition-colors"
                    >
                      <ChevronDownIcon className="w-2 h-2 text-white" />
                    </button>
                  </div>
                )}

                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${getStatusColor(person.status)}`}
                />

                <div className="pl-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {person.name}
                        <div className="flex text-emerald-400">
                          {[...Array(person.rating)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className="w-3 h-3 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]"
                            />
                          ))}
                        </div>
                      </h3>
                      <p className="text-xs text-emerald-300/70 mt-0.5 font-mono">
                        {person.relationship} • {person.category}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-md text-white/90 shadow-sm ${getStatusColor(person.status)}`}
                    >
                      {getStatusLabel(person.status)}
                    </span>
                  </div>

                  {person.tags && person.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {person.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-emerald-900/20 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-500/20"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {person.notes && person.notes.length > 0 && (
                    <div className="mt-3 flex items-start gap-2 text-xs text-emerald-200/80 bg-emerald-900/10 p-2 rounded-lg truncate border border-emerald-500/10">
                      <ChatBubbleLeftEllipsisIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />
                      <div className="truncate flex-1">
                        <span className="text-emerald-400/60 font-mono text-[10px] mr-2">
                          {format(new Date(person.notes[0].date), "MM/dd")}
                        </span>
                        {person.notes[0].content}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && filteredPeople.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-emerald-500/30 space-y-2">
            <UserGroupIcon className="w-16 h-16" />
            <p className="font-mono text-sm tracking-widest">NO DATA</p>
          </div>
        )}
      </div>

      {/* --- 新增/編輯 Modal (維持不變) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0b1210] w-full max-w-md rounded-3xl p-6 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.2)] relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <UserGroupIcon className="w-6 h-6 text-emerald-500" />
                {formData._id ? "編輯名單" : "新增名單"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-emerald-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-emerald-300 mb-1 block">
                    姓名
                  </label>
                  <input
                    className="w-full bg-emerald-900/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-white focus:border-emerald-500 outline-none transition-colors"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="姓名"
                  />
                </div>
                <div>
                  <label className="text-xs text-emerald-300 mb-1 block">
                    關係/稱謂
                  </label>
                  <input
                    className="w-full bg-emerald-900/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-white focus:border-emerald-500 outline-none transition-colors"
                    value={formData.relationship}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        relationship: e.target.value,
                      })
                    }
                    placeholder="關係"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-emerald-300 mb-1 block">
                    分類
                  </label>
                  <select
                    className="w-full bg-emerald-900/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 appearance-none transition-colors"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {CATEGORIES.filter((c) => c !== "全部").map((c) => (
                      <option
                        key={c}
                        value={c}
                        className="bg-[#0b1210] text-white"
                      >
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-emerald-300 mb-1 block">
                    目前狀態
                  </label>
                  <select
                    className="w-full bg-emerald-900/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 appearance-none transition-colors"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                  >
                    {STATUS_OPTS.map((s) => (
                      <option
                        key={s.value}
                        value={s.value}
                        className="bg-[#0b1210] text-white"
                      >
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-emerald-300 mb-2 block">
                  潛力/熱度星級
                </label>
                <div className="flex gap-2 bg-emerald-900/10 p-2 rounded-xl border border-emerald-500/20 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`p-1 rounded-lg transition-all transform ${star <= formData.rating ? "text-emerald-400 scale-125 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "text-emerald-900/40 hover:text-emerald-600"}`}
                    >
                      <StarIcon className="w-8 h-8" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-emerald-300 mb-2 block">
                  標籤 (按 Enter 新增)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-emerald-600/20 text-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1 border border-emerald-500/30"
                    >
                      #{tag}
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            tags: formData.tags.filter((t) => t !== tag),
                          })
                        }
                      >
                        <XMarkIcon className="w-3 h-3 hover:text-white" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative group">
                  <TagIcon className="w-4 h-4 absolute left-3 top-3 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
                  <input
                    className="w-full bg-emerald-900/10 border border-emerald-500/20 rounded-xl pl-9 pr-3 py-2 text-white focus:border-emerald-500 outline-none text-sm transition-colors"
                    placeholder="新增標籤..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tagInput.trim()) {
                        e.preventDefault();
                        if (!formData.tags.includes(tagInput.trim())) {
                          setFormData({
                            ...formData,
                            tags: [...formData.tags, tagInput.trim()],
                          });
                        }
                        setTagInput("");
                      }
                    }}
                  />
                </div>
              </div>

              <div className="bg-emerald-900/5 rounded-2xl p-4 border border-emerald-500/10">
                <label className="text-xs text-emerald-300 mb-3 block flex items-center gap-2">
                  <ChatBubbleLeftEllipsisIcon className="w-4 h-4" /> 跟進紀錄 (
                  {formData.notes.length})
                </label>

                <div className="max-h-40 overflow-y-auto mb-3 space-y-3 pr-2 scrollbar-hide">
                  {formData.notes.length === 0 ? (
                    <p className="text-xs text-emerald-500/40 text-center py-2">
                      尚無紀錄
                    </p>
                  ) : (
                    formData.notes.map((note, idx) => (
                      <div key={idx} className="flex gap-3 text-xs">
                        <div className="flex-shrink-0 flex flex-col items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                          {idx !== formData.notes.length - 1 && (
                            <div className="w-px h-full bg-emerald-500/20 my-1" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-emerald-300/50 font-mono text-[10px] mb-0.5">
                            {format(new Date(note.date), "yyyy/MM/dd HH:mm")}
                          </p>
                          <p className="text-emerald-100 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/10 leading-relaxed">
                            {note.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="relative">
                  <input
                    className="w-full bg-black/30 border border-emerald-500/30 rounded-xl pl-4 pr-10 py-3 text-white text-sm focus:border-emerald-400 outline-none transition-all placeholder-emerald-500/30"
                    placeholder="輸入新的跟進狀況..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && noteInput.trim()) {
                        e.preventDefault();
                        setFormData((prev) => ({
                          ...prev,
                          notes: [
                            {
                              content: noteInput,
                              date: new Date().toISOString(),
                            },
                            ...prev.notes,
                          ],
                        }));
                        setNoteInput("");
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (noteInput.trim()) {
                        setFormData((prev) => ({
                          ...prev,
                          notes: [
                            {
                              content: noteInput,
                              date: new Date().toISOString(),
                            },
                            ...prev.notes,
                          ],
                        }));
                        setNoteInput("");
                      }
                    }}
                    className="absolute right-2 top-2 p-1.5 bg-emerald-600 rounded-lg text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!noteInput.trim()}
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 shrink-0">
              {formData._id && (
                <button
                  onClick={() => handleDelete(formData._id!)}
                  className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors border border-red-500/20"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95"
              >
                {formData._id ? "儲存更新" : "新增名單"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
