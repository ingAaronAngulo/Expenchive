const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

// Import function modules
const { createRecurringExpenses } = require("./recurring-expenses");
const { reduceInstallmentDebt } = require("./credit-debt-reduction");

// Export functions
exports.createRecurringExpenses = createRecurringExpenses;
exports.reduceInstallmentDebt = reduceInstallmentDebt;
