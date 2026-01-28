import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Goal } from "@/models/Goal";

// 已經在之前的步驟建立，這裡確保包含 PATCH 邏輯
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const updatedGoal = await Goal.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updatedGoal) {
      return NextResponse.json({ error: "找不到該目標" }, { status: 404 });
    }

    return NextResponse.json(updatedGoal);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "刪除失敗" },
      { status: 500 },
    );
  }
}

// DELETE: 刪除特定目標
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await dbConnect();
    const { id } = await params;

    const deletedGoal = await Goal.findByIdAndDelete(id);

    if (!deletedGoal) {
      return NextResponse.json({ error: "找不到該目標" }, { status: 404 });
    }

    return NextResponse.json({ message: "目標已成功刪除" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "刪除失敗" },
      { status: 500 },
    );
  }
}
