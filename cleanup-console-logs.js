const fs = require('fs');
const path = require('path');

// Directories to process
const directories = [
    'js/background',
    'js/enemy',
    'js/npc',
    'js/player',
    'js/scenes',
    'js/ui',
    'js/lootables',
    'js/items',
    'js/props',
    'js/platforms',
    'js/gameData',
    'js/gameEditor',
    'js/input',
    'js/hud',
    'js/inventory',
    'js/camera',
    'js/viewport'
];

let totalFilesProcessed = 0;
let totalLogsRemoved = 0;

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const newLines = [];
    let removedCount = 0;
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // Check if this is a console.log line to remove
        if (trimmed.startsWith('console.log(')) {
            // Single line console.log
            if (trimmed.endsWith(');')) {
                removedCount++;
                i++;
                continue;
            }
            // Multi-line console.log - skip until we find the closing );
            let foundEnd = false;
            while (i < lines.length && !foundEnd) {
                if (lines[i].includes(');')) {
                    foundEnd = true;
                }
                i++;
            }
            removedCount++;
            continue;
        }

        // Keep console.error and console.warn lines
        newLines.push(line);
        i++;
    }

    if (removedCount > 0) {
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
        totalLogsRemoved += removedCount;
        totalFilesProcessed++;
    }
}

function processDirectory(dir) {
    const fullPath = path.join(__dirname, dir);

    if (!fs.existsSync(fullPath)) {
        return;
    }

    const files = fs.readdirSync(fullPath);

    for (const file of files) {
        if (file.endsWith('.js') && !file.includes('.backup')) {
            processFile(path.join(fullPath, file));
        }
    }
}

// Process all directories

for (const dir of directories) {
    processDirectory(dir);
}

// Also process game.js if needed (already done manually, but including for completeness)
// processFile(path.join(__dirname, 'game.js'));

