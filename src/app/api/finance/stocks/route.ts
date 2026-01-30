import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { StockPosition, StockHistory } from "@/models/Finance";

export async function GET() {
  try {
    await dbConnect();
    const stocks = await StockPosition.find({}).sort({ stockId: 1 });
    return NextResponse.json(stocks);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch stocks" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect();

    if (!body.stockId || !body.stockName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. 準備數據
    const shares = Number(body.shares) || 0;
    const avgCost = Number(body.avgCost) || 0;
    const marketValue = Number(body.marketValue) || 0;
    const refPrice = Number(body.refPrice) || 0;

    // 計算當下損益 (用於歷史紀錄)
    const totalCost = shares * avgCost;
    const totalProfit = marketValue - totalCost;

    // 2. 更新或新增持倉 (StockPosition)
    const stock = await StockPosition.findOneAndUpdate(
      { stockId: body.stockId },
      {
        $set: {
          stockName: body.stockName,
          shares,
          avgCost,
          marketValue,
          refPrice,
          updated_at: new Date(),
        },
      },
      { upsert: true, new: true, runValidators: true },
    );

    // 3. 🔥 寫入歷史紀錄 (StockHistory)
    await StockHistory.create({
      stockId: body.stockId,
      action: "UPDATE",
      shares,
      avgCost,
      marketValue,
      refPrice,
      totalProfit,
    });

    return NextResponse.json(stock);
  } catch (e) {
    console.error("Stock Update Error:", e);
    return NextResponse.json(
      { error: "Failed to update stock" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "ID required" }, { status: 400 });

    await dbConnect();

    // 刪除前先抓取資料以記錄 (可選)
    const stockToDelete = await StockPosition.findById(id);

    if (stockToDelete) {
      // 記錄一筆刪除操作
      await StockHistory.create({
        stockId: stockToDelete.stockId,
        action: "DELETE",
        shares: stockToDelete.shares,
        avgCost: stockToDelete.avgCost,
        marketValue: stockToDelete.marketValue,
        refPrice: stockToDelete.refPrice,
        totalProfit: 0, // 刪除視為歸零或平倉
      });

      await StockPosition.findByIdAndDelete(id);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
