#!/bin/bash
# Firestore Restore Script
# Usage: ./scripts/restore.sh [backup-timestamp]
# Example: ./scripts/restore.sh 20260212-020000

set -e

# Configuration
PROJECT_ID="expenchive"  # Replace with your Firebase project ID
BACKUP_BUCKET="gs://expenchive-backups"

# Check arguments
if [ -z "$1" ]; then
    echo "❌ Error: Backup timestamp required"
    echo "Usage: ./scripts/restore.sh [backup-timestamp]"
    echo ""
    echo "Available backups:"
    gsutil ls "${BACKUP_BUCKET}/manual-backups/" || echo "No backups found"
    exit 1
fi

TIMESTAMP=$1
BACKUP_PATH="${BACKUP_BUCKET}/manual-backups/${TIMESTAMP}"

echo "⚠️  WARNING: This will overwrite your current Firestore data!"
echo "📁 Backup source: ${BACKUP_PATH}"
echo ""
read -p "Are you sure you want to restore? (type 'yes' to confirm): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

# Check if backup exists
if ! gsutil ls "${BACKUP_PATH}" &> /dev/null; then
    echo "❌ Error: Backup not found at ${BACKUP_PATH}"
    exit 1
fi

# Create a safety export before restoring
echo "💾 Creating safety backup of current data..."
SAFETY_BACKUP="${BACKUP_BUCKET}/pre-restore-backups/$(date +%Y%m%d-%H%M%S)"
gcloud firestore export "${SAFETY_BACKUP}" \
    --project="${PROJECT_ID}" \
    --async

echo "✅ Safety backup initiated at: ${SAFETY_BACKUP}"
echo ""
echo "⏳ Waiting 5 seconds before restore..."
sleep 5

# Restore from backup
echo "📥 Restoring Firestore data from backup..."
gcloud firestore import "${BACKUP_PATH}" \
    --project="${PROJECT_ID}" \
    --async

echo "✅ Restore initiated successfully!"
echo ""
echo "To check restore status:"
echo "  gcloud firestore operations list --project=${PROJECT_ID}"
echo ""
echo "If something went wrong, you can restore from the safety backup:"
echo "  ./scripts/restore.sh pre-restore-$(date +%Y%m%d)"
