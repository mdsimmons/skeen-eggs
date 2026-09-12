import Link from "next/link";

export default function BackupPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="text-muted hover:text-foreground text-sm">Settings</Link>
        <span className="text-muted">/</span>
        <h1 className="text-2xl font-bold">Backup & Restore</h1>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <h2 className="font-semibold">Export Database</h2>
        <p className="text-sm text-muted">
          Download a copy of your SQLite database file. You can restore it by replacing the file on your Pi.
        </p>
        <a
          href="/api/backup"
          className="block w-full text-center bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary-light transition-colors"
        >
          Download Database (.db)
        </a>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <h2 className="font-semibold">Automated Cloud Backup</h2>
        <p className="text-sm text-muted">
          Set up automatic backups when the Pi connects to the internet. Add this cron job to the Pi:
        </p>
        <div className="bg-foreground/5 rounded-lg p-3 font-mono text-xs overflow-x-auto">
          <pre>{`# Edit crontab
crontab -e

# Add this line (runs daily at 8pm):
0 20 * * * cd /path/to/skeen-eggs && \\
  rsync -avz data/skeen-eggs.db \\
  user@cloud-server:/backups/skeen-eggs/ \\
  >> /var/log/skeen-backup.log 2>&1`}</pre>
        </div>
        <p className="text-sm text-muted">
          Or use rclone for Google Drive / Dropbox / S3:
        </p>
        <div className="bg-foreground/5 rounded-lg p-3 font-mono text-xs overflow-x-auto">
          <pre>{`# Install rclone
curl https://rclone.org/install.sh | sudo bash

# Configure (follow interactive setup)
rclone config

# Add to crontab:
0 20 * * * cd /path/to/skeen-eggs && \\
  rclone copy data/skeen-eggs.db \\
  mydrive:skeen-eggs-backups/ \\
  --max-age 30d \\
  >> /var/log/skeen-backup.log 2>&1`}</pre>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <h2 className="font-semibold">Restore from Backup</h2>
        <p className="text-sm text-muted">
          To restore, simply stop the app, replace the database file, and restart:
        </p>
        <div className="bg-foreground/5 rounded-lg p-3 font-mono text-xs overflow-x-auto">
          <pre>{`# Stop the app
sudo systemctl stop skeen-eggs

# Replace the database
cp /path/to/backup/skeen-eggs.db data/skeen-eggs.db

# Restart
sudo systemctl start skeen-eggs`}</pre>
        </div>
      </div>
    </div>
  );
}
