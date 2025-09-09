/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

// Notion API configuration
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_PROJECTS_DATABASE_ID;
const NOTION_VERSION = process.env.NOTION_VERSION || "2022-06-28";

// Helper function to extract project data from Notion page
function extractProjectData(page: any) {
  // Lấy ID của page
  const id = page.id;

  // Lấy title từ title property
  const titleProperty = page.properties.title;
  const title = titleProperty?.title?.[0]?.plain_text || "Không có tiêu đề";

  // Lấy startDate từ startDate property (có thể có cả start và end)
  const startDateProperty = page.properties.startDate;
  const startDate = startDateProperty?.date?.start || null;
  const endDate = startDateProperty?.date?.end || null;

  // Lấy projects từ relation property
  const projectsProperty = page.properties.projects;
  const projects = projectsProperty?.relation || [];

  // Lấy plans từ relation property
  const plansProperty = page.properties.plans;
  const plans = plansProperty?.relation || [];

  return {
    id,
    title,
    startDate,
    endDate,
    projects,
    plans,
  };
}

// Helper to query Notion database for projects
async function queryNotionProjects() {
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
          and: [
            {
              property: "reachable",
              checkbox: { equals: false },
            },
            {
              property: "status",
              status: { equals: "inProgress" },
            },
          ],
        },
        sorts: [
          {
            property: "startDate",
            direction: "descending",
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
    const result = await queryNotionProjects();

    // Tách và tổng hợp dữ liệu thành list gồm title, date, projects và plans
    const projectList = result.results.map((page: any) =>
      extractProjectData(page)
    );

    return NextResponse.json({
      success: true,
      data: projectList,
      count: projectList.length,
      rawData: result.results, // Để debug nếu cần
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
