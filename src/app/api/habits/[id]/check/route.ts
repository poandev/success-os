import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Habit } from "@/models/Habit";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await dbConnect();
  try {
    const { id } = await params; // 這裡也要 await
    const today = new Date().toISOString().split("T")[0];
    const habit = await Habit.findById(id);

    // 1. 如果今天已經打過卡，就不重複處理
    if (habit.lastCompletedDate === today) {
      return NextResponse.json(
        { message: "今日已完成", habit },
        { status: 200 },
      );
    }

    // 2. 計算連勝天數 (Yesterday Logic)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = 1;
    if (habit.lastCompletedDate === yesterdayStr) {
      newStreak = habit.streak + 1;
    }

    // 3. 更新資料庫
    const updated = await Habit.findByIdAndUpdate(
      id,
      {
        $set: { lastCompletedDate: today, streak: newStreak },
        $push: { completedDates: today },
      },
      { new: true },
    );

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: 取消今日打卡
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  await dbConnect();
  try {
    const { id } = await params;
    const today = new Date().toISOString().split("T")[0];
    const habit = await Habit.findById(id);

    if (!habit) {
      return NextResponse.json({ error: "習慣不存在" }, { status: 404 });
    }

    // 只有今天打過卡才能取消
    if (habit.lastCompletedDate !== today) {
      return NextResponse.json(
        { message: "今日尚未打卡，無法取消" },
        { status: 400 },
      );
    }

    // 計算前一天的連勝數
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // 從 completedDates 找出前一次打卡日期
    const previousDates = habit.completedDates.filter(
      (date: string) => date !== today,
    );
    const lastDate = previousDates[previousDates.length - 1] || "";

    // 如果上次打卡是昨天，連勝數恢復到前一個值；否則歸零
    const newStreak = lastDate === yesterdayStr ? habit.streak - 1 : 0;

    const updated = await Habit.findByIdAndUpdate(
      id,
      {
        $set: {
          lastCompletedDate: lastDate,
          streak: Math.max(0, newStreak),
        },
        $pull: { completedDates: today },
      },
      { new: true },
    );

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
