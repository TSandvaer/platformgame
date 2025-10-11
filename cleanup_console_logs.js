/**
 * Script to remove all console.log statements from JavaScript files
 * while preserving console.error and console.warn statements.
 */

const fs = require('fs');
const path = require('path');

const SKIP_DIRS = ['wiki', 'node_modules', '.git', 'sprites'];
const SKIP_FILES = ['.backup', 'cleanup_console_logs.js', 'game.js', 'backgroundSystem.js', 'enemySystem.js'];

function cleanConsoleLogsFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const cleaned = [];
    let skipUntilSemicolon = false;
    let removed = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // If we're in a multi-line console.log, skip until we find the closing
        if (skipUntilSemicolon) {
            if (line.trim().endsWith(');')) {
                skipUntilSemicolon = false;
            }
            continue;
        }

        // Check if line is a console.log (not console.error or console.warn)
        if (/^\s*console\.log\(/.test(line)) {
            removed++;

            // Check if it's a single-line statement
            if (!line.trim().endsWith(');')) {
                // Multi-line console.log - keep skipping
                skipUntilSemicolon = true;
            }
            continue;
        }

        cleaned.push(line);
    }

    if (removed > 0) {
        fs.writeFileSync(filePath, cleaned.join('\n'), 'utf8');
    }

    return removed;
}

function shouldSkipFile(filePath) {
    const fileName = path.basename(filePath);

    // Check if file should be skipped
    for (const skip of SKIP_FILES) {
        if (fileName.includes(skip)) {
            return true;
        }
    }

    // Check if in a skip directory
    for (const skipDir of SKIP_DIRS) {
        if (filePath.includes(path.sep + skipDir + path.sep) ||
            filePath.includes(path.sep + skipDir + '\\')) {
            return true;
        }
    }

    return false;
}

function getAllJsFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip directories in SKIP_DIRS
            if (!SKIP_DIRS.includes(file)) {
                getAllJsFiles(filePath, fileList);
            }
        } else if (file.endsWith('.js')) {
            if (!shouldSkipFile(filePath)) {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

function main() {
    const baseDir = process.cwd();
    console.log('Starting cleanup of console.log statements...');
    console.log('Base directory:', baseDir);
    console.log('');

    const jsFiles = getAllJsFiles(baseDir);
    let totalRemoved = 0;
    const filesCleaned = [];

    jsFiles.forEach(filePath => {
        console.log('Processing:', path.relative(baseDir, filePath));
        const removed = cleanConsoleLogsFromFile(filePath);

        if (removed > 0) {
            totalRemoved += removed;
            filesCleaned.push({ path: path.relative(baseDir, filePath), count: removed });
            console.log(`  Removed ${removed} console.log statements`);
        }
    });

    console.log('');
    console.log('='.repeat(80));
    console.log('CLEANUP SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total console.log statements removed: ${totalRemoved}`);
    console.log(`Files cleaned: ${filesCleaned.length}`);
    console.log('');

    if (filesCleaned.length > 0) {
        console.log('Files cleaned:');
        filesCleaned.sort((a, b) => b.count - a.count)
            .forEach(({ path, count }) => {
                console.log(`  ${path}: ${count} statements`);
            });
    }
}

main();
