import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { todoCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/todos/categories - Get all categories
export async function GET() {
  try {
    const categories = await db.select().from(todoCategories);
    return NextResponse.json({ items: categories });
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}

// POST /api/todos/categories - Create new category
export async function POST(req: NextRequest) {
  try {
    const {
      name,
      color,
      is_default,
    }: { name?: string; color?: string; is_default?: boolean } =
      await req.json();

    if (!name || !color) {
      return NextResponse.json(
        { error: "Name and color are required" },
        { status: 400 }
      );
    }

    if (is_default) {
      await db.update(todoCategories).set({ is_default: false });
    }

    const id = `cat_${crypto.randomUUID().split("-")[0]}`;
    const created = await db
      .insert(todoCategories)
      .values({ id, name, color, is_default: !!is_default })
      .returning();

    return NextResponse.json({ item: created[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}

// PUT /api/todos/categories/:id - Update category color
export async function PUT(req: NextRequest) {
  try {
    const {
      id,
      color,
      name,
      is_default,
    }: { id?: string; color?: string; name?: string; is_default?: boolean } =
      await req.json();

    if (!id || (!color && !name && typeof is_default === "undefined")) {
      return NextResponse.json(
        { error: "ID and at least one field to update are required" },
        { status: 400 }
      );
    }

    if (is_default) {
      await db.update(todoCategories).set({ is_default: false });
    }

    const updated = await db
      .update(todoCategories)
      .set({
        ...(color ? { color } : {}),
        ...(name ? { name } : {}),
        ...(typeof is_default !== "undefined"
          ? { is_default: !!is_default }
          : {}),
      })
      .where(eq(todoCategories.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ item: updated[0] });
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/categories/:id - Delete category
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => null);
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(todoCategories)
      .where(eq(todoCategories.id, id));

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (existing[0].is_default) {
      return NextResponse.json(
        { error: "Cannot delete the default category" },
        { status: 400 }
      );
    }

    await db.delete(todoCategories).where(eq(todoCategories.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    );
  }
}
