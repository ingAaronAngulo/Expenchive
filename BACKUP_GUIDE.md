# Firestore Backup & Disaster Recovery Guide

## Overview

This guide explains how to set up automated backups for your Firestore database to prevent data loss.

## Backup Strategy

### 1. Automated Daily Backups (Recommended)

Firebase provides automated scheduled exports to Google Cloud Storage.

#### Setup Steps:

1. **Enable Cloud Storage**
   ```bash
   # Create a Cloud Storage bucket for backups
   gsutil mb -l us-central1 gs://expenchive-backups
   ```

2. **Configure Scheduled Exports (via Firebase Console)**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to Firestore Database
   - Click on "Schedule Backup" (requires Blaze plan)
   - Configure:
     - Frequency: Daily
     - Time: 2:00 AM (low traffic time)
     - Bucket: `gs://expenchive-backups`
     - Collections: Select all or specific collections

3. **Or Configure via gcloud CLI**
   ```bash
   # Schedule daily export at 2 AM
   gcloud firestore export gs://expenchive-backups/scheduled-backups \
     --project=expenchive \
     --async

   # Create a Cloud Scheduler job for automated backups
   gcloud scheduler jobs create http firestore-backup \
     --schedule="0 2 * * *" \
     --uri="https://firestore.googleapis.com/v1/projects/expenchive/databases/(default):exportDocuments" \
     --message-body='{"outputUriPrefix":"gs://expenchive-backups/scheduled-backups","collectionIds":[]}' \
     --oauth-service-account-email=firebase-adminsdk@expenchive.iam.gserviceaccount.com \
     --time-zone="America/Los_Angeles"
   ```

### 2. Manual Backup

You can trigger manual backups anytime:

```bash
# Export entire database
gcloud firestore export gs://expenchive-backups/manual-$(date +%Y%m%d-%H%M%S)

# Export specific collections
gcloud firestore export gs://expenchive-backups/expenses-backup \
  --collection-ids=expenses,accounts,creditCards
```

### 3. Export to JSON (Development/Testing)

For local development or testing, you can export data to JSON:

```bash
# Install firestore-export-import
npm install -g firestore-export-import

# Export to JSON
firestore-export --accountCredentials ./serviceAccountKey.json \
  --backupFile ./backup.json \
  --nodePath "/"

# Import from JSON
firestore-import --accountCredentials ./serviceAccountKey.json \
  --backupFile ./backup.json \
  --nodePath "/"
```

## Restore from Backup

### Restore from Cloud Storage Export

```bash
# Import from a specific backup
gcloud firestore import gs://expenchive-backups/scheduled-backups/2026-02-12-02:00

# Warning: This will overwrite existing data. Consider these options:
# 1. Restore to a different Firebase project first (staging)
# 2. Export current data before restoring
# 3. Use collection-ids to restore specific collections only
```

### Restore Specific Collections

```bash
# Restore only expenses and accounts
gcloud firestore import gs://expenchive-backups/scheduled-backups/2026-02-12-02:00 \
  --collection-ids=expenses,accounts
```

## Backup Retention Policy

Recommended retention:
- **Daily backups**: Keep for 30 days
- **Weekly backups**: Keep for 3 months
- **Monthly backups**: Keep for 1 year

Configure lifecycle rules on your Cloud Storage bucket:

```bash
# Create lifecycle configuration
cat > lifecycle.json <<EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 30,
          "matchesPrefix": ["scheduled-backups/"]
        }
      },
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 365,
          "matchesPrefix": ["monthly-backups/"]
        }
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://expenchive-backups
```

## Point-in-Time Recovery (PITR)

Firebase doesn't have built-in PITR, but you can implement it by:

1. **Increase backup frequency** (hourly instead of daily)
2. **Use Cloud Functions to track changes**:
   ```javascript
   // Log all changes to a separate audit collection
   exports.auditTrail = functions.firestore
     .document('{collection}/{docId}')
     .onWrite((change, context) => {
       return admin.firestore().collection('audit_log').add({
         collection: context.params.collection,
         docId: context.params.docId,
         before: change.before.data(),
         after: change.after.data(),
         timestamp: admin.firestore.FieldValue.serverTimestamp()
       });
     });
   ```

## Testing Your Backups

**IMPORTANT**: Regularly test your backup restoration process!

```bash
# 1. Create a test Firebase project
firebase projects:create expenchive-test

# 2. Restore backup to test project
gcloud firestore import gs://expenchive-backups/latest-backup \
  --project=expenchive-test

# 3. Verify data integrity
# 4. Delete test project after verification
```

## Disaster Recovery Plan

### If Data is Lost or Corrupted:

1. **Don't panic** - Your scheduled backups should have your data
2. **Identify the scope** - Which collections are affected?
3. **Find the last good backup**:
   ```bash
   gsutil ls gs://expenchive-backups/scheduled-backups/
   ```
4. **Restore to staging first** (test project)
5. **Verify data integrity**
6. **Restore to production** if verified

### If Backup is Corrupted:

- Fall back to the previous day's backup
- Check multiple backup sources (daily, weekly)
- Review Cloud Storage logs for issues

## Monitoring

Set up alerts for backup failures:

1. **Cloud Monitoring Alerts**:
   - Alert when scheduled exports fail
   - Alert when backup bucket size decreases unexpectedly
   - Alert when no backups created in 48 hours

2. **Email notifications**:
   ```bash
   # Configure Cloud Scheduler to send notifications
   gcloud scheduler jobs update http firestore-backup \
     --attempt-deadline=1800s \
     --max-retry-attempts=3
   ```

## Cost Optimization

- Backups in Cloud Storage are cheap (~$0.02/GB/month)
- Use lifecycle policies to auto-delete old backups
- Compress backups if storage becomes expensive
- Store backups in Nearline/Coldline storage for long-term retention

## Security

- Encrypt backups at rest (enabled by default in GCS)
- Limit access to backup buckets using IAM roles
- Store backup credentials securely (use Secret Manager)
- Audit backup access regularly

## Best Practices

1. ✅ **Automate everything** - Don't rely on manual backups
2. ✅ **Test regularly** - Backup is useless if you can't restore
3. ✅ **Multiple retention periods** - Daily, weekly, monthly
4. ✅ **Monitor backup health** - Set up alerts
5. ✅ **Document procedures** - Everyone should know how to restore
6. ✅ **Secure backups** - Encrypt and limit access
7. ✅ **Off-site storage** - Consider multi-region backups for critical data

## Emergency Contacts

- Firebase Support: https://firebase.google.com/support
- Google Cloud Support: https://cloud.google.com/support
- Project Owner: [Add your contact info]
