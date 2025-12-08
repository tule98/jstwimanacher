/**
 * Environment variable validation
 * This module ensures all required environment variables are set before the application starts.
 * If any required variable is missing, the application will fail to start with a clear error message.
 */

type EnvironmentVariable = {
  key: string;
  description: string;
  required: boolean;
  env: "server" | "client" | "both";
};

const REQUIRED_ENV_VARS: EnvironmentVariable[] = [
  // Database
  {
    key: "TURSO_DATABASE_URL",
    description: "Turso/LibSQL database URL",
    required: true,
    env: "server",
  },
  {
    key: "TURSO_AUTH_TOKEN",
    description: "Turso/LibSQL authentication token",
    required: true,
    env: "server",
  },

  // Authentication & Security
  {
    key: "PROTECTION_KEY",
    description: "Protection key for API access",
    required: true,
    env: "server",
  },
  {
    key: "API_KEY",
    description: "API key for internal requests",
    required: true,
    env: "server",
  },
  {
    key: "CRON_SECRET",
    description: "Secret token for Vercel Cron job authorization",
    required: true,
    env: "server",
  },

  // AI Services
  {
    key: "GEMINI_API_KEY",
    description:
      "Google Gemini API key for AI features (todo due date inference, flash card translation)",
    required: true,
    env: "server",
  },

  // Notion Integration
  {
    key: "NOTION_API_KEY",
    description: "Notion API key for task/project/plan management",
    required: false,
    env: "server",
  },
  {
    key: "NOTION_VERSION",
    description: "Notion API version (defaults to 2022-06-28 if not set)",
    required: false,
    env: "server",
  },
  {
    key: "NOTION_TASKS_DATABASE_ID",
    description: "Notion database ID for tasks",
    required: false,
    env: "server",
  },
  {
    key: "NOTION_PROJECTS_DATABASE_ID",
    description: "Notion database ID for projects",
    required: false,
    env: "server",
  },
  {
    key: "NOTION_PLANS_DATABASE_ID",
    description: "Notion database ID for plans",
    required: false,
    env: "server",
  },

  // Slack Integration
  {
    key: "SLACK_BOT_TOKEN",
    description: "Slack bot token for sending notifications",
    required: false,
    env: "server",
  },
  {
    key: "SLACK_CHANNEL_ID",
    description: "Slack channel ID for daily task notifications",
    required: false,
    env: "server",
  },
];

/**
 * Validates that all required environment variables are set.
 * Throws an error if any required variable is missing.
 * Should be called during application initialization (in next.config.ts or at build time).
 *
 * @throws {Error} If any required environment variable is missing
 */
export function validateEnv(): void {
  const missing: EnvironmentVariable[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar.key];
    if (envVar.required && !value) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    const missingList = missing
      .map((v) => `  • ${v.key}: ${v.description}`)
      .join("\n");

    const error = new Error(
      `❌ ENVIRONMENT VALIDATION FAILED\n\n` +
        `The following required environment variables are missing:\n\n${missingList}\n\n` +
        `Please set these variables in your .env.local file and restart the application.`
    );

    console.error(error.message);
    process.exit(1);
  }

  // Optional: Log which optional vars are missing (for awareness)
  const missingOptional = REQUIRED_ENV_VARS.filter(
    (v) => !v.required && !process.env[v.key]
  );

  if (missingOptional.length > 0) {
    const optionalList = missingOptional
      .map((v) => `  • ${v.key}: ${v.description}`)
      .join("\n");

    console.warn(
      `⚠️  WARNING: The following optional environment variables are not set:\n\n${optionalList}\n` +
        `Some features may not work properly. Set them in .env.local for full functionality.\n`
    );
  }

  console.log(
    "✅ Environment validation passed - all required variables are set."
  );
}

/**
 * Get a summary of all environment variables for documentation/debugging
 */
export function getEnvSummary(): string {
  const required = REQUIRED_ENV_VARS.filter((v) => v.required);
  const optional = REQUIRED_ENV_VARS.filter((v) => !v.required);

  const requiredList = required
    .map((v) => `  ${v.key}: ${v.description}`)
    .join("\n");

  const optionalList = optional
    .map((v) => `  ${v.key}: ${v.description}`)
    .join("\n");

  return (
    `REQUIRED ENVIRONMENT VARIABLES:\n${requiredList}\n\n` +
    `OPTIONAL ENVIRONMENT VARIABLES:\n${optionalList}`
  );
}
