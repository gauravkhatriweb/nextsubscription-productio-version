/**
 * Development MongoDB Memory Server
 * Starts an in-memory MongoDB instance for development
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startDevDB() {
  console.log('🚀 Starting MongoDB Memory Server...');

  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'nextsubscription'
    }
  });

  const uri = mongod.getUri();
  console.log('✅ MongoDB Memory Server started');
  console.log('📍 Connection URI:', uri);

  // Update .env file
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Replace MONGOOSE_URL
  envContent = envContent.replace(
    /MONGOOSE_URL=.*/,
    `MONGOOSE_URL=${uri}nextsubscription`
  );

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file updated with connection URI');
  console.log('\n🎉 Development database is ready!');
  console.log('💡 Press Ctrl+C to stop the database\n');

  // Keep the process running
  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping MongoDB Memory Server...');
    await mongod.stop();
    console.log('✅ Database stopped');
    process.exit(0);
  });
}

startDevDB().catch(console.error);
