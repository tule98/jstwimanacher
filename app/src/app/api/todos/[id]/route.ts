import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { todos, NewTodo } from "@/db/schema";
import { eq } from "drizzle-orm";
import { calculateNextDueDate } from "@/lib/recurrence-utils";

// PUT /api/todos/:id
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  // Fetch the current todo to get recurrence info
  const currentTodo = await db.query.todos.findFirst({
    where: eq(todos.id, id),
  });

  const update: Partial<typeof todos.$inferInsert> = {
    description: body.description,
    due_date: body.due_date,
    status: body.status,
    category_id: body.category_id,
    recurrence_type: body.recurrence_type,
    recurrence_days: body.recurrence_days
      ? JSON.stringify(body.recurrence_days)
      : undefined,
    updated_at: undefined,
  };

  // If marking as completed and has recurrence, auto-generate next instance
  if (body.status === "completed" && currentTodo) {
    if (currentTodo.recurrence_type && currentTodo.recurrence_type !== "none") {
      const nextDueDate = calculateNextDueDate(
        currentTodo.due_date,
        currentTodo.recurrence_type,
        currentTodo.recurrence_days
          ? JSON.parse(currentTodo.recurrence_days)
          : undefined
      );

      // Create next instance
      const nextTodo: NewTodo = {
        id: crypto.randomUUID(),
        description: currentTodo.description,
        due_date: nextDueDate,
        status: "not_completed",
        category_id: currentTodo.category_id,
        recurrence_type: currentTodo.recurrence_type,
        recurrence_days: currentTodo.recurrence_days,
        created_at: undefined,
        updated_at: undefined,
      };

      await db.insert(todos).values(nextTodo);
    }
  }

  await db.update(todos).set(update).where(eq(todos.id, id));
  return NextResponse.json({ id, update });
}

// DELETE /api/todos/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(todos).where(eq(todos.id, id));
  return NextResponse.json({ id });
}
