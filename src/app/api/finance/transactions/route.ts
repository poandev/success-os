import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Transaction } from "@/models/Finance";

// 1. GET: 取得特定月份的收支
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // 格式: "2026-01"

    if (!month) {
      return NextResponse.json({ error: "Month is required" }, { status: 400 });
    }

    await dbConnect();

    // 使用 Regex 篩選日期字串 (e.g. 找出所有以 "2026-01" 開頭的紀錄)
    const transactions = await Transaction.find({
      date: { $regex: `^${month}` },
    }).sort({ date: -1, created_at: -1 }); // 日期新的排前面

    return NextResponse.json(transactions);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

// 2. POST: 新增一筆收支
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect();

    // 簡單驗證
    if (!body.date || !body.amount || !body.category || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newTransaction = await Transaction.create({
      date: body.date,
      type: body.type,
      category: body.category,
      amount: Number(body.amount),
      note: body.note || "",
    });

    return NextResponse.json(newTransaction);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}

// 3. DELETE: 刪除收支
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "ID required" }, { status: 400 });

    await dbConnect();
    await Transaction.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
