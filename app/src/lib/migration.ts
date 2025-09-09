import { databaseService } from "@/services/database/databaseService";
import { VN_TIMEZONE, isValidUTCString } from "@/lib/timezone";
import { fromZonedTime } from "date-fns-tz";

/**
 * Data Migration Utilities for UTC Conversion
 * Use these utilities to assess and migrate existing datetime data to UTC
 */

export interface MigrationReport {
  totalRecords: number;
  validUTCRecords: number;
  invalidRecords: number;
  needsMigration: number;
  migrationPlan: MigrationAction[];
}

export interface MigrationAction {
  id: string;
  currentValue: string;
  proposedValue: string;
  action: "convert" | "skip" | "manual_review";
  reason: string;
}

/**
 * Assess existing data and generate migration report
 */
export async function assessDataMigration(): Promise<MigrationReport> {
  console.log("🔍 Assessing existing data for UTC migration...");

  const transactions = await databaseService.getAllTransactions();
  const report: MigrationReport = {
    totalRecords: transactions.length,
    validUTCRecords: 0,
    invalidRecords: 0,
    needsMigration: 0,
    migrationPlan: [],
  };

  for (const transaction of transactions) {
    const { created_at, updated_at, id } = transaction;

    // Check created_at
    if (isValidUTCString(created_at)) {
      report.validUTCRecords++;
    } else {
      report.needsMigration++;
      report.migrationPlan.push(analyzeDateField(id, "created_at", created_at));
    }

    // Check updated_at
    if (isValidUTCString(updated_at)) {
      report.validUTCRecords++;
    } else {
      report.needsMigration++;
      report.migrationPlan.push(analyzeDateField(id, "updated_at", updated_at));
    }
  }

  console.log("📊 Migration Assessment Complete:", report);
  return report;
}

/**
 * Analyze a date field and determine migration action
 */
function analyzeDateField(
  recordId: string,
  fieldName: string,
  currentValue: string
): MigrationAction {
  try {
    // Try to parse as date
    const date = new Date(currentValue);

    if (isNaN(date.getTime())) {
      return {
        id: recordId,
        currentValue,
        proposedValue: "",
        action: "manual_review",
        reason: `Invalid date format in ${fieldName}`,
      };
    }

    // Check if it's already UTC (ends with Z)
    if (currentValue.endsWith("Z")) {
      return {
        id: recordId,
        currentValue,
        proposedValue: currentValue,
        action: "skip",
        reason: `${fieldName} already appears to be UTC`,
      };
    }

    // Assume it's in Vietnam timezone and convert to UTC
    const utcValue = fromZonedTime(date, VN_TIMEZONE).toISOString();

    return {
      id: recordId,
      currentValue,
      proposedValue: utcValue,
      action: "convert",
      reason: `Convert ${fieldName} from VN timezone to UTC`,
    };
  } catch (error) {
    return {
      id: recordId,
      currentValue,
      proposedValue: "",
      action: "manual_review",
      reason: `Error parsing ${fieldName}: ${error}`,
    };
  }
}

/**
 * Execute migration plan (DRY RUN by default)
 */
export async function executeMigration(
  migrationPlan: MigrationAction[],
  dryRun: boolean = true
): Promise<{ success: number; failed: number; skipped: number }> {
  console.log(
    `${dryRun ? "🧪 DRY RUN:" : "🚀 EXECUTING:"} Migration for ${
      migrationPlan.length
    } actions`
  );

  const results = { success: 0, failed: 0, skipped: 0 };

  for (const action of migrationPlan) {
    if (action.action === "skip" || action.action === "manual_review") {
      results.skipped++;
      continue;
    }

    if (action.action === "convert") {
      try {
        if (!dryRun) {
          // Execute actual migration
          await databaseService.updateTransaction(action.id, {
            created_at: action.proposedValue,
          });
        }

        console.log(
          `✅ ${dryRun ? "[DRY RUN]" : ""} Migrated ${action.id}: ${
            action.currentValue
          } -> ${action.proposedValue}`
        );
        results.success++;
      } catch (error) {
        console.error(`❌ Failed to migrate ${action.id}:`, error);
        results.failed++;
      }
    }
  }

  console.log("📈 Migration Results:", results);
  return results;
}

/**
 * Backup existing data before migration
 */
export async function backupData(): Promise<void> {
  console.log("💾 Creating data backup...");

  const transactions = await databaseService.getAllTransactions();
  const backup = {
    timestamp: new Date().toISOString(),
    totalRecords: transactions.length,
    data: transactions,
  };

  // In a real app, you'd save this to a file or separate backup table
  console.log("📦 Backup created:", {
    timestamp: backup.timestamp,
    totalRecords: backup.totalRecords,
  });

  // For now, just log the backup data structure
  if (typeof window !== "undefined") {
    // Client-side: save to localStorage as emergency backup
    localStorage.setItem("jstwimanacher_backup", JSON.stringify(backup));
    console.log("💾 Emergency backup saved to localStorage");
  }
}

/**
 * Validate migration success
 */
export async function validateMigration(): Promise<{
  isValid: boolean;
  issues: string[];
}> {
  console.log("🔍 Validating migration results...");

  const transactions = await databaseService.getAllTransactions();
  const issues: string[] = [];

  for (const transaction of transactions) {
    if (!isValidUTCString(transaction.created_at)) {
      issues.push(`Transaction ${transaction.id}: invalid created_at format`);
    }

    if (!isValidUTCString(transaction.updated_at)) {
      issues.push(`Transaction ${transaction.id}: invalid updated_at format`);
    }
  }

  const isValid = issues.length === 0;
  console.log(`${isValid ? "✅" : "❌"} Migration validation:`, {
    isValid,
    issueCount: issues.length,
  });

  return { isValid, issues };
}

/**
 * Full migration workflow
 */
export async function runFullMigration(executeForReal: boolean = false) {
  console.log("🎯 Starting full UTC migration workflow...");

  try {
    // Step 1: Backup
    await backupData();

    // Step 2: Assess
    const report = await assessDataMigration();

    if (report.needsMigration === 0) {
      console.log("✅ No migration needed - all data is already in UTC format");
      return { success: true, message: "No migration needed" };
    }

    // Step 3: Execute (dry run first)
    console.log("🧪 Running dry run migration...");
    const dryRunResults = await executeMigration(report.migrationPlan, true);

    if (!executeForReal) {
      console.log(
        "🔍 Dry run complete. Use executeForReal=true to actually migrate data."
      );
      return {
        success: true,
        message: "Dry run complete",
        results: dryRunResults,
      };
    }

    // Step 4: Execute for real
    console.log("🚀 Executing real migration...");
    const realResults = await executeMigration(report.migrationPlan, false);

    // Step 5: Validate
    const validation = await validateMigration();

    if (validation.isValid) {
      console.log("🎉 Migration completed successfully!");
      return {
        success: true,
        message: "Migration completed",
        results: realResults,
      };
    } else {
      console.error("❌ Migration validation failed:", validation.issues);
      return {
        success: false,
        message: "Migration validation failed",
        issues: validation.issues,
      };
    }
  } catch (error) {
    console.error("💥 Migration failed:", error);
    return { success: false, message: "Migration failed", error };
  }
}
