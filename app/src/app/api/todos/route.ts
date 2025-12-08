import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { todos, NewTodo } from "@/db/schema";
import { and, gte, lte } from "drizzle-orm";
import { inferDueDateFromDescription } from "@/services/api/ai";

// GET /api/todos?start=ISO&end=ISO
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  // TODO: Validate date range more strictly
  // Query with UTC dates directly (dates in DB are already in UTC)
  const rows =
    start && end
      ? await db
          .select()
          .from(todos)
          .where(and(gte(todos.due_date, start), lte(todos.due_date, end)))
          .orderBy(todos.due_date)
      : await db.select().from(todos).orderBy(todos.due_date);
  return NextResponse.json({ items: rows });
}

// POST /api/todos
export async function POST(req: NextRequest) {
  const body = await req.json();
  const inferredDue =
    body.due_date ||
    (await inferDueDateFromDescription(body.description || ""));

  const payload: NewTodo = {
    id: body.id ?? crypto.randomUUID(),
    description: body.description,
    due_date: inferredDue, // Already in UTC from AI service
    status: body.status ?? "not_completed",
    created_at: undefined,
    updated_at: undefined,
  };

  // Basic validation
  if (!payload.description) {
    return NextResponse.json(
      { error: "Description is required" },
      { status: 400 }
    );
  }
  if (!payload.due_date) {
    return NextResponse.json(
      { error: "Unable to infer due_date" },
      { status: 400 }
    );
  }

  await db.insert(todos).values(payload);
  return NextResponse.json({ item: payload }, { status: 201 });
}
