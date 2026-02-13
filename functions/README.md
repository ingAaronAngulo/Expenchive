# Cloud Functions for Expenchive

## Overview

Two scheduled Cloud Functions that automate recurring expenses and debt reduction:

1. **createRecurringExpenses** - Runs daily at midnight UTC
2. **reduceInstallmentDebt** - Runs monthly on the 1st at midnight UTC

## Functions

### createRecurringExpenses

**Schedule:** Daily at 00:00 UTC
**Purpose:** Automatically creates expenses from recurring expense templates

**Logic:**
1. Query active recurring expenses where `nextDueDate <= now`
2. Check if end date has passed (deactivate if yes)
3. Create new expense with all properties from template
4. Calculate and update `nextDueDate` based on frequency
5. Update `lastCreatedAt` timestamp

**Frequencies Supported:**
- Daily: +1 day
- Weekly: +7 days
- Monthly: +1 month
- Yearly: +1 year

### reduceInstallmentDebt

**Schedule:** Monthly on 1st at 00:00 UTC
**Purpose:** Automatically reduces credit card debt for installment expenses

**Logic:**
1. Query all credit expenses with installments that aren't fully paid
2. Increment `installmentMonthsPaid` by 1
3. Calculate new `remainingDebt`:
   - `remainingDebt = amount - (monthlyPayment × monthsPaid)`
4. Mark as `isFullyPaid` if `monthsPaid >= installmentMonths`
5. Recalculate credit card `currentBalance`

## Deployment

### Requirements

⚠️ **Important:** Cloud Functions require the **Blaze (pay-as-you-go) plan**.

Free Spark plan does NOT support Cloud Functions.

### Upgrade to Blaze Plan

1. Visit: https://console.firebase.google.com/project/expenchive-1d3cd/usage/details
2. Click "Upgrade to Blaze"
3. Enter billing information
4. Confirm upgrade

**Pricing:**
- Cloud Functions: First 2 million invocations/month FREE
- After that: $0.40 per million invocations
- For this app: ~60 invocations/month (daily + monthly functions)
- **Expected cost: $0.00/month** (well within free tier)

### Deploy Functions

Once upgraded to Blaze plan:

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:createRecurringExpenses
firebase deploy --only functions:reduceInstallmentDebt
```

### Verify Deployment

Check logs:
```bash
firebase functions:log
```

View in Firebase Console:
https://console.firebase.google.com/project/expenchive-1d3cd/functions

## Testing

### Local Testing (Emulator)

```bash
cd functions
npm run serve
```

This starts the Firebase Emulator for local testing without deploying.

### Manual Trigger

You can manually trigger functions from Firebase Console for testing.

## Monitoring

### View Logs

```bash
# Real-time logs
firebase functions:log

# Specific function
firebase functions:log --only createRecurringExpenses
```

### Firebase Console

View function execution, errors, and performance:
https://console.firebase.google.com/project/expenchive-1d3cd/functions

## Alternative: Client-Side Implementation

If you don't want to upgrade to Blaze plan, you can implement this logic client-side:

### On App Load (Recurring Expenses)

Add to `App.tsx`:

```typescript
useEffect(() => {
  if (user) {
    checkAndCreateRecurringExpenses(user.uid);
  }
}, [user]);
```

### Monthly Cron Job (Debt Reduction)

Use a service like:
- Vercel Cron
- GitHub Actions scheduled workflows
- Heroku Scheduler

These can call your Firebase functions or Firestore directly.

## Function Files

- `src/index.js` - Main export file
- `src/recurring-expenses.js` - Daily recurring expense creation
- `src/credit-debt-reduction.js` - Monthly debt reduction

## Dependencies

- `firebase-functions` v5.0.0
- `firebase-admin` v12.0.0
- Node.js 18

## Security

Functions use Firebase Admin SDK with full privileges:
- Can read/write to all Firestore collections
- Runs with service account credentials
- No user authentication required (runs as system)

## Error Handling

Both functions include:
- Try-catch error handling
- Console logging for debugging
- Batch writes for atomicity
- Validation checks

## Status

✅ **Functions Code:** Complete and ready
⚠️ **Deployment:** Requires Blaze plan upgrade
🔄 **Alternative:** Client-side implementation available

---

**Note:** Functions are production-ready. The only blocker is the Firebase plan upgrade requirement.
