/**
 * Cleanup Duplicate Documents in MongoDB
 *
 * This script helps identify and remove duplicate game documents
 * that may have been created due to the previous bug where
 * multiple games were saving to the same document ID.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Game = require('../models/Game');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function main() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        // Find all games (including inactive ones)
        const allGames = await Game.find({}).select('_id name description isActive createdAt updatedAt').lean();

        console.log(`📊 Database Statistics:`);
        console.log(`   Total documents: ${allGames.length}`);
        console.log(`   Active: ${allGames.filter(g => g.isActive !== false).length}`);
        console.log(`   Inactive (soft-deleted): ${allGames.filter(g => g.isActive === false).length}\n`);

        // Display all games
        console.log('📋 All games in database:');
        console.log('─'.repeat(80));
        allGames.forEach((game, index) => {
            const status = game.isActive === false ? '❌ DELETED' : '✓ ACTIVE';
            const created = new Date(game.createdAt).toLocaleString();
            const updated = new Date(game.updatedAt).toLocaleString();

            console.log(`${index + 1}. [${status}] "${game.name}"`);
            console.log(`   ID: ${game._id}`);
            console.log(`   Created: ${created}`);
            console.log(`   Updated: ${updated}`);
            if (game.description) {
                console.log(`   Description: ${game.description}`);
            }
            console.log('');
        });
        console.log('─'.repeat(80));

        // Check for potential duplicates (same name)
        const nameGroups = {};
        allGames.forEach(game => {
            const name = game.name.toLowerCase().trim();
            if (!nameGroups[name]) {
                nameGroups[name] = [];
            }
            nameGroups[name].push(game);
        });

        const duplicateNames = Object.entries(nameGroups).filter(([_, games]) => games.length > 1);

        if (duplicateNames.length > 0) {
            console.log('\n⚠️  Found games with duplicate names:');
            duplicateNames.forEach(([name, games]) => {
                console.log(`\n   "${name}" appears ${games.length} times:`);
                games.forEach(game => {
                    const status = game.isActive === false ? 'DELETED' : 'ACTIVE';
                    console.log(`      - ID: ${game._id} [${status}]`);
                });
            });
        }

        // Ask user what to do
        console.log('\n📝 Cleanup Options:');
        console.log('   1. Delete all INACTIVE (soft-deleted) games permanently');
        console.log('   2. Delete a specific game by ID');
        console.log('   3. Exit without making changes');

        const choice = await question('\nEnter your choice (1-3): ');

        if (choice === '1') {
            const inactiveGames = allGames.filter(g => g.isActive === false);

            if (inactiveGames.length === 0) {
                console.log('\n✓ No inactive games found. Nothing to delete.');
            } else {
                console.log(`\n⚠️  This will PERMANENTLY delete ${inactiveGames.length} inactive game(s):`);
                inactiveGames.forEach(game => {
                    console.log(`   - "${game.name}" (ID: ${game._id})`);
                });

                const confirm = await question('\nAre you sure? Type "yes" to confirm: ');

                if (confirm.toLowerCase() === 'yes') {
                    const result = await Game.deleteMany({ isActive: false });
                    console.log(`\n✅ Deleted ${result.deletedCount} inactive game(s) permanently.`);
                } else {
                    console.log('\n❌ Cancelled. No games were deleted.');
                }
            }
        } else if (choice === '2') {
            const gameId = await question('\nEnter the game ID to delete: ');

            const game = await Game.findById(gameId.trim());

            if (!game) {
                console.log(`\n❌ Game with ID "${gameId}" not found.`);
            } else {
                console.log(`\n⚠️  This will PERMANENTLY delete:`);
                console.log(`   Name: "${game.name}"`);
                console.log(`   ID: ${game._id}`);
                console.log(`   Status: ${game.isActive === false ? 'DELETED' : 'ACTIVE'}`);

                const confirm = await question('\nAre you sure? Type "yes" to confirm: ');

                if (confirm.toLowerCase() === 'yes') {
                    await Game.findByIdAndDelete(gameId.trim());
                    console.log('\n✅ Game deleted permanently.');
                } else {
                    console.log('\n❌ Cancelled. Game was not deleted.');
                }
            }
        } else {
            console.log('\n✓ Exiting without making changes.');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        rl.close();
        await mongoose.connection.close();
        console.log('\n✓ Disconnected from MongoDB');
    }
}

main();
