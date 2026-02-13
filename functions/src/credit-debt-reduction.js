const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

const db = admin.firestore();

/**
 * Scheduled function that runs monthly on the 1st at midnight UTC
 * Reduces debt for all installment credit expenses
 */
exports.reduceInstallmentDebt = onSchedule(
  {
    schedule: "0 0 1 * *",
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
    console.log("🔄 Starting reduceInstallmentDebt function");
    console.log(`📅 Execution time: ${new Date().toISOString()}`);

    let processedCount = 0;
    let errorCount = 0;
    const errors = [];
    const cardBalanceUpdates = new Map();

    try {
      const now = admin.firestore.Timestamp.now();

      // Query all credit expenses with installments that aren't fully paid
      console.log("📊 Querying installment expenses...");
      const expensesQuery = await db
        .collection("expenses")
        .where("paymentType", "==", "credit")
        .where("isInstallment", "==", true)
        .where("isFullyPaid", "==", false)
        .get();

      if (expensesQuery.empty) {
        console.log("✅ No installment debts to reduce");
        return {
          success: true,
          processed: 0,
          errors: 0,
          duration: Date.now() - startTime,
        };
      }

      console.log(`📋 Found ${expensesQuery.size} installment expense(s) to process`);

      // Process in batches
      const BATCH_SIZE = 400;
      let batch = db.batch();
      let batchCount = 0;

      for (const doc of expensesQuery.docs) {
        try {
          const expense = doc.data();

          // Validate required fields
          if (!expense.amount || !expense.installmentMonths) {
            console.warn(`⚠️  Skipping invalid expense ${doc.id}: missing amount or installmentMonths`);
            errorCount++;
            errors.push({
              expenseId: doc.id,
              error: "Missing required fields",
            });
            continue;
          }

          // Calculate new values
          const installmentMonthsPaid = expense.installmentMonthsPaid || 0;
          const newMonthsPaid = installmentMonthsPaid + 1;
          const monthlyPayment = expense.monthlyPayment || expense.amount / expense.installmentMonths;
          const newRemainingDebt = expense.amount - monthlyPayment * newMonthsPaid;
          const isFullyPaid = newMonthsPaid >= expense.installmentMonths || newRemainingDebt <= 0;

          // Validate calculations
          if (isNaN(newRemainingDebt) || isNaN(monthlyPayment)) {
            console.warn(`⚠️  Invalid calculation for expense ${doc.id}`);
            errorCount++;
            errors.push({
              expenseId: doc.id,
              error: "Invalid calculation result",
            });
            continue;
          }

          // Update expense
          batch.update(doc.ref, {
            installmentMonthsPaid: newMonthsPaid,
            remainingDebt: Math.max(0, newRemainingDebt),
            isFullyPaid,
            updatedAt: now,
          });
          batchCount++;

          // Track credit card balance changes
          if (expense.creditCardId) {
            const currentDebt = cardBalanceUpdates.get(expense.creditCardId) || 0;
            cardBalanceUpdates.set(expense.creditCardId, currentDebt - monthlyPayment);
          }

          processedCount++;
          console.log(
            `✓ Reduced debt for: ${expense.name || doc.id} (${newMonthsPaid}/${expense.installmentMonths} months)`
          );

          // Commit batch if reaching size limit
          if (batchCount >= BATCH_SIZE) {
            console.log(`💾 Committing batch of ${batchCount} operations...`);
            await batch.commit();
            batch = db.batch();
            batchCount = 0;
          }
        } catch (docError) {
          console.error(`❌ Error processing expense ${doc.id}:`, docError);
          errorCount++;
          errors.push({
            expenseId: doc.id,
            error: docError.message || "Unknown error",
          });
        }
      }

      // Update credit card balances
      console.log(`💳 Updating ${cardBalanceUpdates.size} credit card balance(s)...`);
      for (const [cardId, debtReduction] of cardBalanceUpdates.entries()) {
        try {
          const cardRef = db.collection("creditCards").doc(cardId);
          const cardDoc = await cardRef.get();

          if (cardDoc.exists()) {
            const currentBalance = cardDoc.data().currentBalance || 0;
            const newBalance = Math.max(0, currentBalance + debtReduction);

            batch.update(cardRef, {
              currentBalance: newBalance,
              updatedAt: now,
            });
            batchCount++;

            console.log(
              `✓ Updated credit card ${cardId}: $${currentBalance.toFixed(2)} -> $${newBalance.toFixed(2)}`
            );
          } else {
            console.warn(`⚠️  Credit card ${cardId} not found`);
            errorCount++;
            errors.push({
              creditCardId: cardId,
              error: "Credit card not found",
            });
          }

          // Commit if batch is getting large
          if (batchCount >= BATCH_SIZE) {
            console.log(`💾 Committing batch...`);
            await batch.commit();
            batch = db.batch();
            batchCount = 0;
          }
        } catch (cardError) {
          console.error(`❌ Error updating credit card ${cardId}:`, cardError);
          errorCount++;
          errors.push({
            creditCardId: cardId,
            error: cardError.message || "Unknown error",
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
        cardsUpdated: cardBalanceUpdates.size,
        errors: errorCount,
        errorDetails: errors.length > 0 ? errors : undefined,
        duration,
      };

      if (errorCount > 0) {
        console.warn(`⚠️  Completed with ${errorCount} error(s)`);
      } else {
        console.log(`🎉 Successfully reduced debt for ${processedCount} expense(s)`);
        console.log(`💳 Updated ${cardBalanceUpdates.size} credit card(s)`);
      }

      console.log(`⏱️  Total execution time: ${duration}ms`);

      // Log to monitoring collection
      try {
        await db.collection("_function_logs").add({
          functionName: "reduceInstallmentDebt",
          executedAt: now,
          ...result,
        });
      } catch (logError) {
        console.error("Failed to write log:", logError);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error("💥 Critical error in reduceInstallmentDebt:", error);
      console.error("Stack trace:", error.stack);

      // Log critical failure
      try {
        await db.collection("_function_logs").add({
          functionName: "reduceInstallmentDebt",
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
