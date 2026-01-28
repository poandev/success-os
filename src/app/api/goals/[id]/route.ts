import { NextRequest, NextResponse } from "next/server"; // 建議改用 NextRequest
import dbConnect from "@/lib/mongodb";
import { Goal } from "@/models/Goal";

// 更新目標 (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // 關鍵：這裡改為 Promise
) {
  try {
    await dbConnect();

    // 關鍵：必須 await params
    const { id } = await params;

    const body = await request.json();
    const updatedGoal = await Goal.findByIdAndUpdate(id, body, { new: true });

    if (!updatedGoal) {
      return NextResponse.json({ error: "找不到該目標" }, { status: 404 });
    }

    return NextResponse.json(updatedGoal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// 刪除目標 (DELETE) - 同理也要修正
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // 這裡也同步修正
) {
  try {
    await dbConnect();
    const { id } = await params; // 這裡也要 await

    const deletedGoal = await Goal.findByIdAndDelete(id);

    if (!deletedGoal) {
      return NextResponse.json({ error: "找不到該目標" }, { status: 404 });
    }

    return NextResponse.json({ message: "目標已成功刪除" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
