/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

// Notion API configuration
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_PLANS_DATABASE_ID;
const NOTION_VERSION = process.env.NOTION_VERSION || "2022-06-28";

// Helper function to extract plan data from Notion page
function extractPlanData(page: any) {
  // Lấy title từ title property
  const titleProperty = page.properties.title;
  const title = titleProperty?.title?.[0]?.plain_text || "Không có tiêu đề";

  // Lấy date từ date property
  const dateProperty = page.properties.date;
  const date = dateProperty?.date?.start || null;

  // Lấy projects từ relation property
  const projectsProperty = page.properties.projects;
  const projects = projectsProperty?.relation || [];

  // Lấy plans từ relation property
  const plansProperty = page.properties.plans;
  const plans = plansProperty?.relation || [];

  // Lấy ID của page
  const id = page.id;

  return {
    id,
    title,
    date,
    projects,
    plans,
  };
}

// Helper to query Notion database for plans
async function queryNotionPlans() {
  if (!NOTION_API_KEY) throw new Error("Missing Notion API key");

  const response = await fetch(
    `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
      },
      body: JSON.stringify({
        filter: {
          or: [
            {
              property: "status",
              status: {
                equals: "inProgress",
              },
            },
            {
              property: "status",
              status: {
                equals: "todo",
              },
            },
          ],
        },
        sorts: [
          {
            property: "startDate",
            direction: "ascending",
          },
        ],
        page_size: 50,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Notion API error: ${error}`);
  }

  return response.json();
}

export async function GET() {
  try {
    const result = await queryNotionPlans();

    // Tách và tổng hợp dữ liệu thành list gồm title, date, projects và plans
    const planList = result.results.map((page: any) => extractPlanData(page));

    return NextResponse.json({
      success: true,
      data: planList,
      count: planList.length,
      rawData: result.results, // Để debug nếu cần
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
