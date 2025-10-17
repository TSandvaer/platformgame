/**
 * Migration Script: localStorage to MongoDB
 * This script helps migrate existing game data from localStorage to MongoDB Atlas
 *
 * Usage:
 * 1. Make sure your server is running (npm start)
 * 2. Open the browser console on your game page
 * 3. Copy the gameData JSON from console.log
 * 4. Run: node scripts/migrateToMongoDB.js
 * 5. Paste the JSON when prompted
 *
 * Note: Requires Node.js v18+ (uses native fetch API)
 */

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const API_URL = 'http://localhost:3000/api/games';

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function migrateData() {
    console.log('='.repeat(60));
    console.log('Platform RPG Game - MongoDB Migration Tool');
    console.log('='.repeat(60));
    console.log('');
    console.log('This tool will help you migrate your game data from localStorage to MongoDB.');
    console.log('');
    console.log('STEP 1: Get your game data');
    console.log('  1. Open your game in the browser');
    console.log('  2. Open Developer Console (F12)');
    console.log('  3. Run: JSON.stringify(localStorage.getItem("platformGame_gameData"))');
    console.log('  4. Copy the output (everything including quotes)');
    console.log('');

    const jsonInput = await question('Paste your game data JSON here: ');

    if (!jsonInput || jsonInput.trim() === '') {
        console.error('Error: No data provided');
        rl.close();
        return;
    }

    let gameData;
    try {
        // Parse the stringified JSON
        const dataString = JSON.parse(jsonInput);
        gameData = JSON.parse(dataString);
    } catch (error) {
        console.error('Error parsing JSON:', error.message);
        console.log('');
        console.log('Make sure you copied the entire output including quotes.');
        rl.close();
        return;
    }

    console.log('');
    console.log('Game data loaded successfully!');
    console.log(`  - Scenes: ${gameData.scenes?.length || 0}`);
    console.log(`  - Title: ${gameData.gameInfo?.title || 'Unknown'}`);
    console.log('');

    const gameName = await question('Enter a name for this game (e.g., "My Platform Game"): ');
    const description = await question('Enter a description (optional, press Enter to skip): ');

    console.log('');
    console.log('Uploading to MongoDB...');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: gameName || 'Migrated Game',
                description: description || 'Migrated from localStorage',
                gameData: gameData
            })
        });

        const result = await response.json();

        if (result.success) {
            console.log('');
            console.log('✓ Migration successful!');
            console.log(`  Game ID: ${result.game.id}`);
            console.log(`  Name: ${result.game.name}`);
            console.log('');
            console.log('NEXT STEPS:');
            console.log('  1. Reload your game in the browser');
            console.log('  2. Click "Select Game" button');
            console.log('  3. Select your migrated game from the list');
            console.log('');
        } else {
            console.error('Error:', result.error || 'Unknown error');
        }
    } catch (error) {
        console.error('Error uploading to MongoDB:', error.message);
        console.log('');
        console.log('Make sure:');
        console.log('  1. Your server is running (npm start)');
        console.log('  2. MongoDB Atlas is configured correctly');
        console.log('  3. Your .env file has the correct MONGODB_URI');
    }

    rl.close();
}

migrateData().catch(console.error);
