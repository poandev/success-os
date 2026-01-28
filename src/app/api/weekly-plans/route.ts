import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { WeeklyPlan } from "@/models/WeeklyPlan";

interface BigRock {
  roleName?: string;
  task?: string;
  targetDate?: string;
  isCompleted?: boolean;
  roleId?: string;
  goalId?: string;
}

// 取得特定週次的計畫或所有計畫
export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const week = searchParams.get("week"); // 例如 2026-W05

  if (week) {
    // 獲取特定週次
    const plan = await WeeklyPlan.findOne({ weekIdentifier: week });
    return NextResponse.json(plan || { weekIdentifier: week, bigRocks: [] });
  } else {
    // 獲取所有計畫
    const plans = await WeeklyPlan.find({}).sort({ weekIdentifier: -1 });
    return NextResponse.json(plans || []);
  }
}

// 建立或更新週計畫 (Upsert)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { weekIdentifier, bigRocks } = body;

    if (!weekIdentifier || !bigRocks) {
      return NextResponse.json(
        { error: "Missing weekIdentifier or bigRocks" },
        { status: 400 },
      );
    }

    // 驗證每個 bigRock 都有必要的字段
    const validatedRocks = bigRocks.map((rock: BigRock) => ({
      roleName: rock.roleName || "",
      task: rock.task || "",
      targetDate: rock.targetDate || "", // 確保 targetDate 被保存
      isCompleted: rock.isCompleted || false,
      roleId: rock.roleId,
      goalId: rock.goalId,
    }));

    const plan = await WeeklyPlan.findOneAndUpdate(
      { weekIdentifier },
      {
        $set: {
          weekIdentifier,
          bigRocks: validatedRocks,
        },
      },
      { upsert: true, new: true },
    );

    console.log("Weekly plan saved:", plan);
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error saving weekly plan:", error);
    return NextResponse.json(
      { error: "Failed to save weekly plan" },
      { status: 500 },
    );
  }
}
