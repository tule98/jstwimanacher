// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/db";
// import { storySessions } from "@/db/schema";
// import { eq } from "drizzle-orm";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   const id = params.id;

//   if (!id) {
//     return NextResponse.json({ error: "Missing story ID" }, { status: 400 });
//   }

//   try {
//     // Truy vấn chi tiết story từ database
//     const story = await db.query.storySessions.findFirst({
//       where: eq(storySessions.id, id),
//     });

//     if (!story) {
//       return NextResponse.json({ error: "Story not found" }, { status: 404 });
//     }

//     return NextResponse.json(story);
//   } catch (error) {
//     console.error("Error fetching story:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch story" },
//       { status: 500 }
//     );
//   }
// }

export async function GET() {
  return new Response("Hello, this is the story detail route.");
}
