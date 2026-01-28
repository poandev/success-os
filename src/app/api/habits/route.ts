import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Habit } from "@/models/Habit";

export async function GET() {
  await dbConnect();
  const habits = await Habit.find({}).sort({ order: 1 });
  return NextResponse.json(habits);
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();

  // 自動設定新習慣的 order 為當前最大值 + 1
  const maxOrderHabit = await Habit.findOne({}).sort({ order: -1 });
  const nextOrder = maxOrderHabit ? maxOrderHabit.order + 1 : 0;

  const habit = await Habit.create({ ...body, order: nextOrder });
  return NextResponse.json(habit, { status: 201 });
}

// PATCH: 批量更新習慣順序
export async function PATCH(req: Request) {
  await dbConnect();
  const { habits } = await req.json(); // habits: [{ id, order }, ...]

  try {
    // 批量更新每個習慣的 order
    await Promise.all(
      habits.map((h: { id: string; order: number }) =>
        Habit.findByIdAndUpdate(h.id, { order: h.order }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "更新順序失敗" }, { status: 500 });
  }
}
