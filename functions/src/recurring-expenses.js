const {onSchedule} = require("firebase-functions/v2/scheduler");

/**
 * Kept as a no-op so deploying this version safely replaces the previously
 * scheduled automatic expense creator. Recurring expenses are now manual
 * templates registered by the user from the app.
 */
exports.createRecurringExpenses = onSchedule(
  {
    schedule: "0 0 * * *",
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async () => {
    console.log("Recurring expense automation is disabled; templates are manual.");
    return {
      success: true,
      processed: 0,
      automaticCreationDisabled: true,
    };
  }
);
