import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  try {
    await dbConnect();

    // 範例：建立一個初始使用者與角色
    const testUser = await User.findOneAndUpdate(
      { email: "test@example.com" },
      {
        missionStatement: "活出影響力，持續學習。",
        $set: { roles: [{ name: "工程師", identityLabel: "解決問題的專家" }] },
      },
      { upsert: true, new: true },
    );

    return NextResponse.json({ message: "連線成功！", data: testUser });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "未知錯誤" }, { status: 500 });
  }
}
