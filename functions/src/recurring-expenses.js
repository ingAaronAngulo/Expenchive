const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

const db = admin.firestore();

/**
 * Scheduled function that runs daily at midnight UTC
 * Creates expenses for recurring expenses that are due
 */
exports.createRecurringExpenses = onSchedule(
  {
    schedule: "0 0 * * *",
    timeoutSeconds: 540, // 9 minutes
    memory: "256MiB",
    retryConfig: {
      retryCount: 3,
      maxRetryDuration: "600s",
      minBackoffDuration: "10s",
      maxBackoffDuration: "300s",
      maxDoublings: 5,
    },
  },
  async (event) => {
    const startTime = Date.now();
    console.log("🔄 Starting createRecurringExpenses function");
    console.log(`📅 Execution time: ${new Date().toISOString()}`);

    let processedCount = 0;
    let errorCount = 0;
    const errors = [];

    try {
      const now = admin.firestore.Timestamp.now();

      // Query active recurring expenses where nextDueDate <= now
      console.log("📊 Querying recurring expenses...");
      const recurringQuery = await db
        .collection("recurringExpenses")
        .where("isActive", "==", true)
        .where("nextDueDate", "<=", now)
        .get();

      if (recurringQuery.empty) {
        console.log("✅ No recurring expenses due");
        return {
          success: true,
          processed: 0,
          errors: 0,
          duration: Date.now() - startTime,
        };
      }

      console.log(`📋 Found ${recurringQuery.size} recurring expense(s) to process`);

      // Process in smaller batches to avoid timeout (max 500 operations per batch)
      const BATCH_SIZE = 400; // Leave room for safety
      let batch = db.batch();
      let batchCount = 0;

      for (const doc of recurringQuery.docs) {
        try {
          const recurring = doc.data();

          // Validate required fields
          if (!recurring.userId || !recurring.name || !recurring.amount) {
            console.warn(`⚠️  Skipping invalid recurring expense ${doc.id}: missing required fields`);
            errorCount++;
            errors.push({
              recurringId: doc.id,
              error: "Missing required fields",
            });
            continue;
          }

          // Check if end date has passed
          if (recurring.endDate && recurring.endDate.toMillis() < now.toMillis()) {
            console.log(`🏁 Recurring expense ${doc.id} has ended, deactivating`);
            batch.update(doc.ref, {
              isActive: false,
              updatedAt: now,
            });
            batchCount++;
            continue;
          }

          // Validate frequency
          if (!["daily", "weekly", "monthly", "yearly"].includes(recurring.frequency)) {
            console.warn(`⚠️  Invalid frequency for ${doc.id}: ${recurring.frequency}`);
            errorCount++;
            errors.push({
              recurringId: doc.id,
              error: `Invalid frequency: ${recurring.frequency}`,
            });
            continue;
          }

          // Create the expense
          const expenseData = {
            userId: recurring.userId,
            name: recurring.name,
            amount: recurring.amount,
            category: recurring.category || "Uncategorized",
            date: now,
            paymentType: recurring.paymentType,
            accountId: recurring.accountId || null,
            creditCardId: recurring.creditCardId || null,
            isInstallment: recurring.isInstallment || false,
            installmentMonths: recurring.installmentMonths || null,
            installmentMonthsPaid: 0,
            monthlyPayment:
              recurring.isInstallment && recurring.installmentMonths
                ? recurring.amount / recurring.installmentMonths
                : null,
            installmentStartDate: recurring.isInstallment ? now : null,
            remainingDebt: recurring.paymentType === "credit" ? recurring.amount : 0,
            isFullyPaid: recurring.paymentType === "debit",
            isFromRecurring: true,
            recurringExpenseId: doc.id,
            schemaVersion: 1,
            createdAt: now,
            updatedAt: now,
          };

          // Add expense to batch
          const expenseRef = db.collection("expenses").doc();
          batch.set(expenseRef, expenseData);
          batchCount++;

          // Calculate next due date
          const nextDueDate = calculateNextDueDate(
            recurring.nextDueDate.toDate(),
            recurring.frequency
          );

          // Update recurring expense
          batch.update(doc.ref, {
            lastCreatedAt: now,
            nextDueDate: admin.firestore.Timestamp.fromDate(nextDueDate),
            updatedAt: now,
          });
          batchCount++;

          processedCount++;
          console.log(`✓ Queued expense for: ${recurring.name} (${doc.id})`);

          // Commit batch if reaching size limit
          if (batchCount >= BATCH_SIZE) {
            console.log(`💾 Committing batch of ${batchCount} operations...`);
            await batch.commit();
            batch = db.batch();
            batchCount = 0;
          }
        } catch (docError) {
          console.error(`❌ Error processing recurring expense ${doc.id}:`, docError);
          errorCount++;
          errors.push({
            recurringId: doc.id,
            error: docError.message || "Unknown error",
          });
        }
      }

      // Commit remaining operations
      if (batchCount > 0) {
        console.log(`💾 Committing final batch of ${batchCount} operations...`);
        await batch.commit();
      }

      const duration = Date.now() - startTime;
      const result = {
        success: errorCount === 0,
        processed: processedCount,
        errors: errorCount,
        errorDetails: errors.length > 0 ? errors : undefined,
        duration,
      };

      if (errorCount > 0) {
        console.warn(`⚠️  Completed with ${errorCount} error(s)`);
      } else {
        console.log(`🎉 Successfully created ${processedCount} recurring expense(s)`);
      }

      console.log(`⏱️  Total execution time: ${duration}ms`);

      // Log to a monitoring collection for tracking
      try {
        await db.collection("_function_logs").add({
          functionName: "createRecurringExpenses",
          executedAt: now,
          ...result,
        });
      } catch (logError) {
        console.error("Failed to write log:", logError);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error("💥 Critical error in createRecurringExpenses:", error);
      console.error("Stack trace:", error.stack);

      // Log critical failure
      try {
        await db.collection("_function_logs").add({
          functionName: "createRecurringExpenses",
          executedAt: admin.firestore.Timestamp.now(),
          success: false,
          processed: processedCount,
          errors: errorCount + 1,
          criticalError: error.message,
          duration,
        });
      } catch (logError) {
        console.error("Failed to write error log:", logError);
      }

      throw error;
    }
  }
);

/**
 * Calculate next due date based on frequency
 * Handles edge cases like month-end dates and leap years
 */
function calculateNextDueDate(currentDate, frequency) {
  const date = new Date(currentDate);

  switch (frequency) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly": {
      // Handle month-end dates (e.g., Jan 31 -> Feb 28)
      const currentDay = date.getDate();
      date.setMonth(date.getMonth() + 1);

      // If day changed due to month overflow, set to last day of month
      if (date.getDate() !== currentDay) {
        date.setDate(0); // Go to last day of previous month
      }
      break;
    }
    case "yearly":
      // Handle leap year (Feb 29)
      const currentYear = date.getFullYear();
      date.setFullYear(currentYear + 1);

      // If Feb 29 becomes invalid, set to Feb 28
      if (date.getMonth() !== currentDate.getMonth()) {
        date.setDate(0);
      }
      break;
    default:
      throw new Error(`Unknown frequency: ${frequency}`);
  }

  return date;
}
