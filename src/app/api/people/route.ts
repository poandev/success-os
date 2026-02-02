import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Person } from "@/models/Person";

// GET: 取得所有人脈
export async function GET() {
  try {
    await dbConnect();
    const people = await Person.find({}).sort({ rating: -1, created_at: -1 }); // 星級高的排前面
    return NextResponse.json(people);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch people" },
      { status: 500 },
    );
  }
}

// POST: 新增/更新
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect();

    if (!body.name)
      return NextResponse.json({ error: "Name is required" }, { status: 400 });

    // 如果有 _id 則更新，沒有則新增
    if (body._id) {
      const updated = await Person.findByIdAndUpdate(body._id, body, {
        new: true,
      });
      return NextResponse.json(updated);
    } else {
      const newPerson = await Person.create(body);
      return NextResponse.json(newPerson);
    }
  } catch (e) {
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}

// DELETE
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
