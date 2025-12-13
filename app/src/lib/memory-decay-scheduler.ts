/**
 * Cron Job Scheduler for Memory Decay
 *
 * Sets up a daily scheduled job to run the memory-decay Edge Function
 *
 * Installation:
 * 1. Deploy the Edge Function: supabase functions deploy memory-decay
 * 2. In Supabase Dashboard, create a new cron job trigger:
 *    - Function: memory-decay
 *    - Schedule: 0 2 * * * (daily at 2 AM UTC)
 * 3. Or use this script to set it up programmatically
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Schedule the memory decay cron job
 * Call this during app initialization or from an admin endpoint
 */
export async function scheduleMemoryDecayJob() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check if trigger already exists
    const { data: existingTriggers, error: fetchError } = await supabase
      .from("pg_cron.job")
      .select("*")
      .eq("jobname", "memory_decay_daily");

    if (fetchError && !fetchError.message.includes("does not exist")) {
      console.error("Error checking cron triggers:", fetchError);
      return false;
    }

    // If trigger exists, return success
    if (existingTriggers && existingTriggers.length > 0) {
      console.log("Memory decay cron job already scheduled");
      return true;
    }

    // Create new cron job
    // Schedule: 0 2 * * * = Every day at 2:00 AM UTC
    const { error: createError } = await supabase.rpc("cron_schedule", {
      schedule: "0 2 * * *",
      command: `SELECT * FROM http_post('${supabaseUrl}/functions/v1/memory-decay', '{}', '{"Authorization":"Bearer ${supabaseServiceKey}"}'::jsonb)`,
    });

    if (createError) {
      console.error("Error scheduling cron job:", createError);
      return false;
    }

    console.log("Memory decay cron job scheduled successfully");
    return true;
  } catch (error) {
    console.error("Failed to schedule memory decay job:", error);
    return false;
  }
}

/**
 * Manually trigger the memory decay function
 * Useful for testing or admin operations
 */
export async function triggerMemoryDecay() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const response = await supabase.functions.invoke("memory-decay", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
    });

    console.log("Memory decay execution result:", response);
    return response.data;
  } catch (error) {
    console.error("Error triggering memory decay:", error);
    throw error;
  }
}

/**
 * Get the last memory decay execution status
 */
export async function getLastDecayStatus() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data, error } = await supabase
      .from("daily_stats")
      .select("date, words_decayed")
      .order("date", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching last decay status:", error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error("Error fetching decay status:", error);
    return null;
  }
}
