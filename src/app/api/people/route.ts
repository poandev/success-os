import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Person } from "@/models/Person";

// GET: 取得所有人脈 (依照 order 排序)
export async function GET() {
  try {
    await dbConnect();
    // 🔥 修改：改為依照 order 排序，若 order 相同則依建立時間
    const people = await Person.find({}).sort({ order: 1, created_at: -1 });
    return NextResponse.json(people);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch people" },
      { status: 500 },
    );
  }
}

// POST: 新增/更新 (保持不變，但新增時要給預設 order)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect();

    if (body._id) {
      // 更新
      const updated = await Person.findByIdAndUpdate(body._id, body, {
        new: true,
      });
      return NextResponse.json(updated);
    } else {
      // 新增：先找出目前最大的 order，新的人排在最後
      const maxOrderPerson = await Person.findOne().sort({ order: -1 });
      const newOrder = maxOrderPerson ? maxOrderPerson.order + 1 : 0;

      const newPerson = await Person.create({ ...body, order: newOrder });
      return NextResponse.json(newPerson);
    }
  } catch (e) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}

// 🔥 新增 PATCH: 處理批量排序更新
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { people } = body; // 預期收到 [{ id: "...", order: 0 }, { id: "...", order: 1 }]

    if (!Array.isArray(people)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 },
      );
    }

    await dbConnect();

    // 使用 Promise.all 並行更新
    await Promise.all(
      people.map((p: any) =>
        Person.findByIdAndUpdate(p.id, { order: p.order }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Reorder failed" }, { status: 500 });
  }
}

// DELETE (保持不變)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    await dbConnect();
    await Person.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
