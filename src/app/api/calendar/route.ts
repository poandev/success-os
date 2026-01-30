import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CalendarEvent from "@/models/CalendarEvent"; // 確保引入你的 Mongoose Model
import mongoose from "mongoose";

// GET 和 POST 保持原樣...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date)
      return NextResponse.json({ error: "Date is required" }, { status: 400 });

    await dbConnect; // 確保連線
    const events = await CalendarEvent.find({ date }).sort({ startTime: 1 });

    return NextResponse.json(events);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect;
    const newEvent = await CalendarEvent.create(body);
    return NextResponse.json(newEvent);
  } catch (e) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

// --- 新增的部分 ---

// 1. PATCH: 更新活動 (編輯內容 或 切換完成狀態)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id)
      return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await dbConnect;
    const updatedEvent = await CalendarEvent.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }, // 回傳更新後的資料
    );

    return NextResponse.json(updatedEvent);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// 2. DELETE: 刪除活動
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await dbConnect;
    await CalendarEvent.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
