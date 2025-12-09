#!/bin/bash
# Database Backup Script for DrukMatch
# This script creates a timestamped backup of your PostgreSQL database

# Configuration (edit these)
DB_NAME="drukmatch"
DB_USER="your_db_user"
DB_HOST="localhost"
BACKUP_DIR="/home/kanisha13/Desktop/tinder/backups"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Backup filename
BACKUP_FILE="$BACKUP_DIR/drukmatch_backup_$TIMESTAMP.sql"

# Perform backup
echo "Starting backup of $DB_NAME..."
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully!"
    echo "File: $BACKUP_FILE"

    # Compress backup
    gzip "$BACKUP_FILE"
    echo "Compressed to: $BACKUP_FILE.gz"

    # Delete backups older than 30 days
    find "$BACKUP_DIR" -name "drukmatch_backup_*.sql.gz" -type f -mtime +30 -delete
    echo "Cleaned up old backups (>30 days)"
else
    echo "Backup failed!"
    exit 1
fi
