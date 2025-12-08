/// <reference types="node" />

// Make this file a module so global augmentation works.
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Required environment variables
      PROTECTION_KEY: string;
      API_KEY: string;
      GEMINI_API_KEY: string;
      TURSO_DATABASE_URL: string;
      TURSO_AUTH_TOKEN: string;

      // Optional environment variables
      NOTION_API_KEY?: string;
      NOTION_VERSION?: string;
      NOTION_TASKS_DATABASE_ID?: string;
      NOTION_PROJECTS_DATABASE_ID?: string;
      NOTION_PLANS_DATABASE_ID?: string;
      SLACK_BOT_TOKEN?: string;
      SLACK_CHANNEL_ID?: string;
      GOOGLE_SHEET_ID?: string;
      GOOGLE_CREDENTIALS_FILE?: string;

      // Node environment
      NODE_ENV?: "development" | "production" | "test";
    }
  }
}
