#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Directories to process
base_dirs = [
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
]

# Pattern to match console.log statements (single and multi-line)
console_log_pattern = re.compile(
    r'^\s*console\.log\([^)]*\);?\s*$',
    re.MULTILINE
)

# Multi-line console.log pattern (more complex)
multiline_start = re.compile(r'^\s*console\.log\(')
multiline_end = re.compile(r'\);?\s*$')

total_files_processed = 0
total_logs_removed = 0

def remove_console_logs(file_path):
    """Remove console.log statements from a file, keeping console.error and console.warn"""
    global total_logs_removed

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    removed_count = 0
    i = 0

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Skip console.log lines
        if stripped.startswith('console.log('):
            # Check if it's a single-line console.log
            if stripped.endswith(');') or stripped.endswith(')'):
                removed_count += 1
                i += 1
                continue
            else:
                # Multi-line console.log - find the end
                removed_count += 1
                i += 1
                while i < len(lines):
                    if ');' in lines[i] or ')' in lines[i]:
                        i += 1
                        break
                    i += 1
                continue

        # Keep all other lines (including console.error and console.warn)
        new_lines.append(line)
        i += 1

    # Write back only if we removed something
    if removed_count > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        total_logs_removed += removed_count
        return removed_count
    return 0

def process_directory(dir_path):
    """Process all JavaScript files in a directory"""
    global total_files_processed

    if not os.path.exists(dir_path):
        print(f"Skipping {dir_path} (not found)")
        return

    for file in os.listdir(dir_path):
        if file.endswith('.js') and '.backup' not in file:
            file_path = os.path.join(dir_path, file)
            removed = remove_console_logs(file_path)
            if removed > 0:
                print(f"Cleaned {file_path}: removed {removed} console.log statements")
                total_files_processed += 1

# Process all directories
print("Starting console.log cleanup...\n")

for dir_name in base_dirs:
    process_directory(dir_name)

# Also process game.js
# game_js = 'game.js'
# if os.path.exists(game_js):
#     removed = remove_console_logs(game_js)
#     if removed > 0:
#         print(f"Cleaned {game_js}: removed {removed} console.log statements")
#         total_files_processed += 1

print(f"\n=== Cleanup Complete ===")
print(f"Files processed: {total_files_processed}")
print(f"Console.log statements removed: {total_logs_removed}")
