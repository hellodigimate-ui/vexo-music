import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

import { db } from '../db/index.js';
import { syncAllVideosWithYouTube } from '../services/youtube.js';

async function main() {
  console.log('--- VEXO Music YouTube Manual / Cron Sync ---');
  console.log('Connecting to PostgreSQL and hydrating database...');
  const synced = await db.waitForSync(15000);
  if (!synced) {
    console.error('Failed to connect to PostgreSQL database.');
    process.exit(1);
  }

  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    console.warn('⚠️ Warning: YOUTUBE_API_KEY is not defined in environment variables.');
  }

  console.log('Starting YouTube video synchronization...');
  const result = await syncAllVideosWithYouTube();
  console.log('--- Sync Summary ---');
  console.log(`Total linked videos: ${result.total}`);
  console.log(`Successfully synced: ${result.synced}`);
  console.log(`Failed / Skipped:     ${result.failed}`);
  if (result.errors.length > 0) {
    console.log('Errors:');
    result.errors.forEach((e) => console.log(` - ${e}`));
  }
  console.log('--------------------');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error during YouTube sync:', err);
  process.exit(1);
});
