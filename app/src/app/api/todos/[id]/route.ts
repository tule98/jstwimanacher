import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT /api/todos/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await req.json();
  const update: Partial<typeof todos.$inferInsert> = {
    description: body.description,
    due_date: body.due_date,
    status: body.status,
    updated_at: undefined,
  };

  await db.update(todos).set(update).where(eq(todos.id, id));
  return NextResponse.json({ id, update });
}

// DELETE /api/todos/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  await db.delete(todos).where(eq(todos.id, id));
  return NextResponse.json({ id });
}
