const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('playerprogresses');

    console.log('\n📋 Current indexes:');
    const indexesBefore = await collection.indexes();
    indexesBefore.forEach(idx => {
      console.log(`  - ${idx.name}:`, idx.key);
    });

    // Drop the old index that only has gameId and playerId
    try {
      await collection.dropIndex('gameId_1_playerId_1');
      console.log('\n✅ Dropped old index: gameId_1_playerId_1');
    } catch (err) {
      if (err.code === 27) {
        console.log('\n⚠️  Index does not exist (already removed)');
      } else {
        throw err;
      }
    }

    console.log('\n📋 Indexes after cleanup:');
    const indexesAfter = await collection.indexes();
    indexesAfter.forEach(idx => {
      console.log(`  - ${idx.name}:`, idx.key);
    });

    await mongoose.disconnect();
    console.log('\n✅ Done! You can now create multiple sessions.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIndexes();
