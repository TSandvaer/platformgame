/**
 * Database Migration Script
 * Migrates data from "test" database to "PlatformHubDB" database
 */

const mongoose = require('mongoose');
require('dotenv').config();

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function migrateDatabase() {
  const startTime = Date.now();

  log('\n========================================', colors.bright);
  log('MongoDB Database Migration', colors.bright);
  log('========================================\n', colors.bright);

  log('Source Database: test', colors.blue);
  log('Target Database: PlatformHubDB', colors.blue);
  log('');

  try {
    // Get connection string from environment
    const baseUri = process.env.MONGODB_URI;
    if (!baseUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    log('Step 1: Connecting to MongoDB...', colors.yellow);

    // Create connection to source database (test)
    const sourceConnection = await mongoose.createConnection(baseUri, {
      dbName: 'test'
    }).asPromise();
    log('✓ Connected to source database (test)', colors.green);

    // Create connection to target database (PlatformHubDB)
    const targetConnection = await mongoose.createConnection(baseUri, {
      dbName: 'PlatformHubDB'
    }).asPromise();
    log('✓ Connected to target database (PlatformHubDB)', colors.green);
    log('');

    // Get collections from source database
    log('Step 2: Identifying collections to migrate...', colors.yellow);
    const collections = await sourceConnection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    log(`✓ Found ${collectionNames.length} collections: ${collectionNames.join(', ')}`, colors.green);
    log('');

    // Migration summary
    const summary = {
      collections: {},
      totalDocuments: 0,
      errors: []
    };

    // Migrate each collection
    log('Step 3: Migrating collections...', colors.yellow);
    for (const collectionName of collectionNames) {
      try {
        log(`\n  Migrating collection: ${collectionName}`, colors.blue);

        const sourceCollection = sourceConnection.db.collection(collectionName);
        const targetCollection = targetConnection.db.collection(collectionName);

        // Count documents in source
        const sourceCount = await sourceCollection.countDocuments();
        log(`    Source documents: ${sourceCount}`);

        if (sourceCount === 0) {
          log(`    Skipping empty collection`, colors.yellow);
          summary.collections[collectionName] = {
            source: 0,
            target: 0,
            migrated: 0,
            status: 'skipped'
          };
          continue;
        }

        // Get all documents from source
        const documents = await sourceCollection.find({}).toArray();

        // Check if target collection already has data
        const existingCount = await targetCollection.countDocuments();
        if (existingCount > 0) {
          log(`    WARNING: Target collection already has ${existingCount} documents`, colors.yellow);
          log(`    Dropping target collection before migration...`, colors.yellow);
          await targetCollection.drop();
        }

        // Insert documents into target
        if (documents.length > 0) {
          await targetCollection.insertMany(documents);
          log(`    ✓ Inserted ${documents.length} documents`, colors.green);
        }

        // Verify migration
        const targetCount = await targetCollection.countDocuments();
        log(`    Target documents: ${targetCount}`);

        if (sourceCount === targetCount) {
          log(`    ✓ Migration successful!`, colors.green);
          summary.collections[collectionName] = {
            source: sourceCount,
            target: targetCount,
            migrated: documents.length,
            status: 'success'
          };
          summary.totalDocuments += documents.length;
        } else {
          const error = `Document count mismatch! Source: ${sourceCount}, Target: ${targetCount}`;
          log(`    ✗ ${error}`, colors.red);
          summary.collections[collectionName] = {
            source: sourceCount,
            target: targetCount,
            migrated: documents.length,
            status: 'error',
            error
          };
          summary.errors.push(`${collectionName}: ${error}`);
        }

      } catch (error) {
        const errorMsg = `Failed to migrate ${collectionName}: ${error.message}`;
        log(`    ✗ ${errorMsg}`, colors.red);
        summary.collections[collectionName] = {
          status: 'error',
          error: errorMsg
        };
        summary.errors.push(errorMsg);
      }
    }

    // Close connections
    log('\n\nStep 4: Closing connections...', colors.yellow);
    await sourceConnection.close();
    await targetConnection.close();
    log('✓ Connections closed', colors.green);

    // Print summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    log('\n========================================', colors.bright);
    log('Migration Summary', colors.bright);
    log('========================================\n', colors.bright);

    log(`Total collections migrated: ${Object.keys(summary.collections).length}`);
    log(`Total documents migrated: ${summary.totalDocuments}`);
    log(`Duration: ${duration} seconds`);
    log('');

    // Detailed collection summary
    log('Collection Details:', colors.bright);
    for (const [name, data] of Object.entries(summary.collections)) {
      const statusColor = data.status === 'success' ? colors.green :
                         data.status === 'error' ? colors.red : colors.yellow;
      log(`  ${name}: ${data.status}`, statusColor);
      if (data.migrated !== undefined) {
        log(`    - Migrated: ${data.migrated} documents`);
      }
      if (data.error) {
        log(`    - Error: ${data.error}`, colors.red);
      }
    }
    log('');

    // Print errors if any
    if (summary.errors.length > 0) {
      log('Errors encountered:', colors.red);
      summary.errors.forEach(error => log(`  - ${error}`, colors.red));
      log('');
      log('⚠ Migration completed with errors', colors.yellow);
      process.exit(1);
    } else {
      log('✓ Migration completed successfully!', colors.green);
      log('');
      log('Next steps:', colors.bright);
      log('1. Update your .env file to use PlatformHubDB database', colors.blue);
      log('2. Restart your application server', colors.blue);
      log('3. Verify the application works correctly', colors.blue);
      log('4. Optionally delete the "test" database in MongoDB Atlas', colors.blue);
      log('');
      process.exit(0);
    }

  } catch (error) {
    log(`\n✗ Migration failed: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
log('Starting database migration...\n');
migrateDatabase();
