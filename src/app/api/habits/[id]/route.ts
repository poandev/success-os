import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Habit } from "@/models/Habit";

// PATCH: 更新習慣資料
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await Habit.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true },
    );

    if (!updated) {
      return NextResponse.json({ error: "習慣不存在" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: 刪除習慣
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  await dbConnect();
  try {
    const { id } = await params;

    const deleted = await Habit.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "習慣不存在" }, { status: 404 });
    }

    return NextResponse.json({ message: "刪除成功", habit: deleted });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
