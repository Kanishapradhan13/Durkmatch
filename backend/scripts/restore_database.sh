#!/bin/bash
# Database Restore Script for DrukMatch
# This script restores a database backup

# Configuration (edit these)
DB_NAME="drukmatch"
DB_USER="your_db_user"
DB_HOST="localhost"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: ./restore_database.sh <backup_file>"
    echo "Example: ./restore_database.sh /path/to/backup.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Warning
echo "WARNING: This will overwrite the current database!"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Decompressing backup..."
    gunzip -c "$BACKUP_FILE" > /tmp/drukmatch_restore_temp.sql
    RESTORE_FILE="/tmp/drukmatch_restore_temp.sql"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Perform restore
echo "Starting restore..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" < "$RESTORE_FILE"

# Check if restore was successful
if [ $? -eq 0 ]; then
    echo "Restore completed successfully!"

    # Clean up temp file
    if [ -f "/tmp/drukmatch_restore_temp.sql" ]; then
        rm /tmp/drukmatch_restore_temp.sql
    fi
else
    echo "Restore failed!"
    exit 1
fi
