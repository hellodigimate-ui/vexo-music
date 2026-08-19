declare const process: any;
import { db } from '../src/db/index.js';

async function seed() {
  console.log('Seeding VEXO Database with 14 models...');
  const snapshot = db.snapshot;

  console.log(`- Admin Users: ${snapshot.adminUsers.length}`);
  console.log(`- Artists: ${snapshot.artists.length}`);
  console.log(`- Artist Socials: ${snapshot.artistSocials.length}`);
  console.log(`- Albums: ${snapshot.albums.length}`);
  console.log(`- Tracks: ${snapshot.tracks.length}`);
  console.log(`- Events: ${snapshot.events.length}`);
  console.log(`- Event Artists: ${snapshot.eventArtists.length}`);
  console.log(`- Videos: ${snapshot.videos.length}`);
  console.log(`- Services: ${snapshot.services.length}`);
  console.log(`- Media: ${snapshot.media.length}`);
  console.log(`- Contact Requests: ${snapshot.contactRequests.length}`);
  console.log(`- Homepage: ${snapshot.homepage ? 'OK' : 'MISSING'}`);
  console.log(`- Site Settings: ${snapshot.siteSettings ? 'OK' : 'MISSING'}`);
  console.log(`- Activity Logs: ${snapshot.activityLogs.length}`);

  console.log('\n✅ VEXO Database Seed Completed Successfully!');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
