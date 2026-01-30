import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { MonthlyPlan } from "@/models/MonthlyPlan";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month") || "2026-01";
  const plan = await MonthlyPlan.findOne({ monthIdentifier: month });
  return NextResponse.json(plan || { focusGoals: [] });
}

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const { monthIdentifier, focusGoals } = body;

  const plan = await MonthlyPlan.findOneAndUpdate(
    { monthIdentifier },
    { $set: { focusGoals } },
    { upsert: true, new: true },
  );

  return NextResponse.json(plan);
}
