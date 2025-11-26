import { NextResponse } from "next/server";
import { databaseService } from "@/services/database/databaseService";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = await databaseService.updateHabit(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ok = await databaseService.deleteHabit(params.id);
    return NextResponse.json({ success: ok });
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
