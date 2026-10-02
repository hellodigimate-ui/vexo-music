import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'node:fs';

const env = dotenv.parse(fs.readFileSync('.env'));
const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

async function main() {
  const res = await pool.query('SELECT id, title, "artistName", genre, "createdAt" FROM public.albums ORDER BY "order" ASC, "createdAt" ASC;');
  console.log('PostgreSQL public.albums rows count:', res.rows.length);
  res.rows.forEach((r, idx) => {
    console.log(`${idx + 1}. ID: ${r.id} | Title: "${r.title}" | Artist: "${r.artistName}" | Genre: "${r.genre}"`);
  });
  await pool.end();
}

main().catch(console.error);
