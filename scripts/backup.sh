#!/bin/bash
# Firestore Backup Script
# Usage: ./scripts/backup.sh

set -e

# Configuration
PROJECT_ID="expenchive"  # Replace with your Firebase project ID
BACKUP_BUCKET="gs://expenchive-backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_PATH="${BACKUP_BUCKET}/manual-backups/${TIMESTAMP}"

echo "🔄 Starting Firestore backup..."
echo "📁 Backup location: ${BACKUP_PATH}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "❌ Error: Not authenticated with gcloud"
    echo "Run: gcloud auth login"
    exit 1
fi

# Export Firestore data
echo "📤 Exporting Firestore data..."
gcloud firestore export "${BACKUP_PATH}" \
    --project="${PROJECT_ID}" \
    --async

echo "✅ Backup initiated successfully!"
echo "📍 Backup path: ${BACKUP_PATH}"
echo ""
echo "To check backup status:"
echo "  gcloud firestore operations list --project=${PROJECT_ID}"
echo ""
echo "To restore from this backup:"
echo "  ./scripts/restore.sh ${TIMESTAMP}"
