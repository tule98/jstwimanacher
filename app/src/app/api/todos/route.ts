import { NextResponse } from "next/server";
import { db } from "@/db";
import { todos, NewTodo } from "@/db/schema";
import { and, gte, lte } from "drizzle-orm";
import { inferDueDateFromDescription } from "@/services/api/ai";
import { parseUserDateToUTC } from "@/lib/timezone";
import {
  compose,
  withAuth,
  withLog,
  type RouteHandler,
} from "@/lib/route-handlers";

// GET /api/todos?start=ISO&end=ISO
const baseGET: RouteHandler = async (request) => {
  const { searchParams } = request.nextUrl;
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const rows =
    start && end
      ? await db
          .select()
          .from(todos)
          .where(and(gte(todos.due_date, start), lte(todos.due_date, end)))
          .orderBy(todos.due_date)
      : await db.select().from(todos).orderBy(todos.due_date);
  return NextResponse.json({ items: rows });
};

export const GET = compose(withLog, withAuth)(baseGET);

// POST /api/todos
const basePOST: RouteHandler = async (request) => {
  const body = await request.json();
  const inferredDue =
    body.due_date ||
    (await inferDueDateFromDescription(body.description || ""));

  const dueDateUTC = inferredDue ? parseUserDateToUTC(inferredDue) : undefined;

  // Basic validation
  if (!body.description) {
    return NextResponse.json(
      { error: "Description is required" },
      { status: 400 }
    );
  }
  if (!dueDateUTC) {
    return NextResponse.json(
      { error: "Unable to infer due_date" },
      { status: 400 }
    );
  }

  const payload: NewTodo = {
    id: body.id ?? crypto.randomUUID(),
    description: body.description,
    due_date: dueDateUTC, // Always store UTC
    status: body.status ?? "not_completed",
    category_id: body.category_id || null,
    recurrence_type: body.recurrence_type || "none",
    recurrence_days: body.recurrence_days
      ? JSON.stringify(body.recurrence_days)
      : null,
    created_at: undefined,
    updated_at: undefined,
  };

  await db.insert(todos).values(payload);
  return NextResponse.json({ item: payload }, { status: 201 });
};

export const POST = compose(withLog, withAuth)(basePOST);
