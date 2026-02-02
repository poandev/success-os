# 🚀 Success OS - 成功作業系統

一個整體人生管理平台，採用賽博龐克視覺設計，集成 6 大核心模組。以終為始，要事第一，幫助你統一管理目標、計畫、執行、人脈和財務。

**版本**: V2.2 (含人脈管理系統升級)

---

## 📱 核心功能概覽

| 模組      | 圖標 | 說明                             |
| --------- | ---- | -------------------------------- |
| **願景**  | 🗺️   | 長期目標規劃與人生方向設定       |
| **執行**  | ✅   | 每日任務檢查表與進度追蹤         |
| **戰情**  | ⚡   | 行事曆與時間流管理（Gantt 視圖） |
| **人脈**  | 👥   | 客戶/人脈管理系統（V2.2 新增）   |
| **財富**  | 💰   | 財務儀表板與收支管理             |
| **月/週** | 📅   | 層級化規劃（選用）               |

---

## ✨ 功能詳解

### 🗺️ 願景規劃

- 設定長期人生目標與願景
- 視覺化目標追蹤
- 連結到週計畫執行

### ✅ 每日執行

- 清單式任務管理
- 實時進度更新
- 完成度統計

### ⚡ 時間戰情室

- 行事曆視圖與事件管理
- Gantt 甘特圖時間流
- 月度與週度規劃整合

### 👥 人脈管理 (V2.2 升級版)

#### 🎯 核心功能

- **分類管理**: Amway、Work、Life 多維度分類
- **狀態追蹤**: 新名單 → 暖身中 → 已邀約 → 跟進中 → 已成交/暫緩
- **潛力評分**: 5 星級系統量化客戶價值
- **動態標籤**: 快速標記人物特徵（愛保養、想賺錢、感情困擾等）

#### 📝 跟進紀錄系統 (重點升級)

- **時間線式設計**: 像聊天室一樣查看過往交互記錄
- **多筆筆記**: 每個人物可儲存無限筆記歷史
- **時間戳記**: 精確記錄每次跟進時間 (yyyy/MM/dd HH:mm)
- **即時編輯**: 點按紀錄時自動載入歷史，便利複查

#### 🔍 搜尋與篩選

- 按分類篩選人脈
- 全文搜尋（名字、標籤、筆記內容）
- 星級排序

#### 🎨 視覺設計

- 卡片式列表展示（Grid 布局）
- 左側狀態色塊快速辨識
- 最新筆記預覽
- 紫色賽博龐克主題

### 💰 財務中控

- 收支統計與分析
- 資產追蹤
- 財務目標設定

---

## 🛠️ 技術棧

### 前端

- **框架**: Next.js 15 + React 19
- **樣式**: Tailwind CSS + 自訂組件
- **Icons**: Heroicons (24px Solid)
- **工具**: date-fns (時間格式化)

### 後端

- **API**: Next.js API Routes
- **資料庫**: MongoDB
- **認證**: (可擴展)

### 部署

- Vercel (推薦)
- Docker 容器化

---

## 🎨 設計語言

### 色彩主題

- **背景**: 深黑色 (`#09090b`, `#0f172a`)
- **主色**: 紫色賽博龐克風格 (`#a855f7`, `#8b5cf6`)
- **次色**: 靛藍/翠綠漸層
- **對比**: 白色文字 + 高透明度背景

### 特效

- 高斯模糊背景 (backdrop-blur)
- 漸層光影動畫
- 平滑過渡與縮放
- 深度陰影（Shadows）

### 響應式設計

- 移動優先設計
- 平板/桌面自適應
- 觸控友好的按鈕與交互

---

## 📦 項目結構

```
success-os/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 首頁
│   │   ├── plan/
│   │   │   └── page.tsx          # 規劃系統主頁（6大模組導航）
│   │   ├── finance/
│   │   │   └── page.tsx          # 財務儀表板
│   │   └── api/
│   │       ├── people/           # 人脈 API
│   │       ├── finance/          # 財務 API
│   │       ├── goals/            # 目標 API
│   │       ├── habits/           # 習慣 API
│   │       ├── calendar/         # 行事曆 API
│   │       ├── monthly-plans/    # 月計畫 API
│   │       ├── weekly-plans/     # 週計畫 API
│   │       └── test/             # 測試端點
│   ├── components/
│   │   ├── network/
│   │   │   └── PeopleManager.tsx # 人脈管理主組件
│   │   ├── planning/
│   │   │   ├── GoalVisionView2.tsx
│   │   │   ├── DayExecutionView.tsx
│   │   │   ├── CalendarCommandCenter.tsx
│   │   │   ├── MonthPlanView.tsx
│   │   │   ├── WeekPlanView.tsx
│   │   │   └── PastPlansView.tsx
│   │   └── finance/
│   │       └── FinanceDashboard.tsx
│   ├── lib/
│   │   └── mongodb.ts            # DB 連線
│   └── models/
│       ├── Person.ts             # 人脈資料模型
│       ├── Finance.ts
│       ├── Goal.ts
│       ├── Habit.ts
│       ├── MonthlyPlan.ts
│       ├── WeeklyPlan.ts
│       ├── Task.ts
│       ├── User.ts
│       └── CalendarEvent.ts
├── public/                        # 靜態資源
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## 🚀 快速開始

### 前置條件

- Node.js 18+
- MongoDB 連線 (Atlas 或本地)
- npm / yarn / pnpm

### 安裝與執行

```bash
# 克隆項目
git clone <repo-url>
cd success-os

# 安裝依賴
npm install

# 設置環境變數 (.env.local)
MONGODB_URI=mongodb+srv://...

# 開發模式
npm run dev

# 生產構建
npm run build
npm start
```

### 訪問應用

- 首頁: http://localhost:3000
- 規劃系統: http://localhost:3000/plan
- 財務: http://localhost:3000/finance

---

## 📖 使用指南

### 人脈管理工作流

1. **新增人脈** → 點擊左上 `+` 按鈕
2. **填寫信息** → 姓名、關係、分類、狀態
3. **設定潛力** → 5 星評分
4. **添加標籤** → Enter 快速新增特徵標籤
5. **記錄跟進** → 在歷史紀錄區下方輸入框新增筆記
6. **搜尋查詢** → 頂部搜尋框可查詢姓名、標籤、筆記內容
7. **編輯更新** → 點擊卡片重新編輯，舊筆記自動載入

### 規劃系統導航

頂部 Tab 欄支援快速切換：

- 願景 (Goal)
- 執行 (Execute)
- 戰情 (Flow)
- 人脈 (Network)
- 財富 (Money)

---

## 🔄 資料模型

### Person (人脈)

```typescript
{
  _id?: ObjectId,
  name: string,              // 人名（必填）
  category: string,          // 分類（Amway/Tarot/Work/Life）
  relationship: string,      // 關係描述
  status: enum,              // 狀態（New/Warming/Invited/FollowUp/Closed/Lost）
  tags: string[],            // 標籤陣列
  notes: [                   // 🔥 V2.2 筆記陣列
    {
      content: string,       // 筆記內容
      date: Date             // 建立時間
    }
  ],
  rating: number,            // 潛力星級（0-5）
  created_at: Date           // 建立時間
}
```

---

## 🎯 開發藍圖

### V2.2 (現在)

- ✅ 人脈管理系統 (CRUD + 時間線筆記)
- ✅ 6 大模組集成導航
- ✅ 紫色賽博龐克視覺設計

### 未來計畫 (V2.3+)

- 🔜 自動化跟進提醒
- 🔜 人脈分群分析
- 🔜 多用戶協作
- 🔜 數據匯出 (CSV/PDF)
- 🔜 行動 App (React Native)

---

## 📝 授權

MIT License - 自由使用與修改

---

## 💬 聯繫與反饋

有想法或發現 Bug？歡迎提出 Issue 或 PR！

---

**Made with ⚡ and 💜 by Success OS Team**

_最後更新: 2026年2月2日_
