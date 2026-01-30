import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Transaction, StockPosition } from "@/models/Finance"; // 確保路徑正確

export async function GET(request: Request) {
  try {
    await dbConnect;
    // 這裡簡單實作：一次拉取所有資料 (實際專案可能需要分頁或依日期篩選)
    const transactions = await Transaction.find().sort({ date: -1 });
    const stocks = await StockPosition.find().sort({ stockId: 1 });

    return NextResponse.json({ transactions, stocks });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch finance data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect;

    if (body.action === "ADD_TRANSACTION") {
      const newTrans = await Transaction.create(body.data);
      return NextResponse.json(newTrans);
    }

    if (body.action === "UPDATE_STOCK") {
      // 如果該股票已存在則更新，不存在則新增 (Upsert)
      const { stockId, ...updateData } = body.data;
      const stock = await StockPosition.findOneAndUpdate(
        { stockId },
        { stockId, ...updateData },
        { upsert: true, new: true },
      );
      return NextResponse.json(stock);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}

// 這裡也可以加入 DELETE (刪除紀錄) ...
