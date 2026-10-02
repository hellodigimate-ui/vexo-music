import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { syncAllVideosWithYouTube } from './youtube.js';

let schedulerTimer: NodeJS.Timeout | null = null;
let isSyncRunning = false;

// Default to 30 seconds (30000 ms)
const DEFAULT_INTERVAL_MS = 30000;

export function getSyncIntervalMs(): number {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
      if (parsed.YOUTUBE_SYNC_INTERVAL_MS) {
        const val = parseInt(parsed.YOUTUBE_SYNC_INTERVAL_MS, 10);
        if (!isNaN(val) && val > 0) return val;
      }
    }
  } catch {
    // fallback
  }

  const envVal = process.env.YOUTUBE_SYNC_INTERVAL_MS
    ? parseInt(process.env.YOUTUBE_SYNC_INTERVAL_MS, 10)
    : NaN;

  return !isNaN(envVal) && envVal > 0 ? envVal : DEFAULT_INTERVAL_MS;
}

export function startYouTubeSyncScheduler(): void {
  const initialIntervalMs = getSyncIntervalMs();

  console.log(
    `[YouTube Scheduler] ⏱️ Initializing background sync scheduler (interval: ${initialIntervalMs}ms / ${Math.round(initialIntervalMs / 1000)}s).`
  );

  const runSyncCycle = async () => {
    if (isSyncRunning) {
      console.log('[YouTube Scheduler] Previous sync cycle still running, skipping.');
      return;
    }
    isSyncRunning = true;
    try {
      const result = await syncAllVideosWithYouTube(false);
      console.log(
        `[YouTube Sync] ✅ Sync cycle complete. Total: ${result.total}, Synced: ${result.synced}, Failed: ${result.failed}.`
      );
    } catch (err: any) {
      console.warn('[YouTube Sync Warning] Error during scheduled sync:', err.message);
    } finally {
      isSyncRunning = false;
      // Dynamically read interval for next cycle so edits to .env take effect immediately
      const nextIntervalMs = getSyncIntervalMs();
      schedulerTimer = setTimeout(() => {
        runSyncCycle().catch(() => {});
      }, nextIntervalMs);
      schedulerTimer.unref?.();
    }
  };

  // Run initial sync after 2 seconds of startup
  schedulerTimer = setTimeout(() => {
    runSyncCycle().catch(() => {});
  }, 2000);
  schedulerTimer.unref?.();
}

export function stopYouTubeSyncScheduler(): void {
  if (schedulerTimer) {
    clearTimeout(schedulerTimer);
    schedulerTimer = null;
    console.log('[YouTube Scheduler] ⏹️ Scheduler stopped.');
  }
}
