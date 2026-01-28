import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Goal } from "@/models/Goal";

// GET: 取得所有目標（可按層級分組）
export async function GET() {
  await dbConnect();
  try {
    const goals = await Goal.find({}).sort({ deadline: 1 });
    return NextResponse.json(goals);
  } catch (error) {
    return NextResponse.json({ error: "無法讀取目標" }, { status: 500 });
  }
}

// POST: 建立新目標
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    // body 應包含: title, level (Long/Mid/Short), roleId, deadline
    const newGoal = await Goal.create(body);
    return NextResponse.json(newGoal, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "建立目標失敗" }, { status: 400 });
  }
}
