#!/usr/bin/env python3
"""
Script to remove all console.log statements from JavaScript files
while preserving console.error and console.warn statements.
"""

import os
import re
from pathlib import Path

def clean_console_logs(file_path):
    """Remove console.log statements from a file, keeping console.error and console.warn."""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    cleaned_lines = []
    skip_line = False
    removed_count = 0

    for i, line in enumerate(lines):
        # Check if this line contains console.log (not console.error or console.warn)
        if re.search(r'^\s*console\.log\(', line):
            removed_count += 1
            skip_line = True
            # Check if the statement ends on this line
            if line.rstrip().endswith(');'):
                skip_line = False
            continue

        # If we're skipping a multi-line console.log
        if skip_line:
            if line.rstrip().endswith(');'):
                skip_line = False
            continue

        cleaned_lines.append(line)

    # Write back the cleaned content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(cleaned_lines)

    return removed_count

def process_directory(base_path, skip_dirs=None, skip_files=None):
    """Process all .js files in directory tree."""
    if skip_dirs is None:
        skip_dirs = {'wiki', 'node_modules', '.git'}
    if skip_files is None:
        skip_files = {'.backup'}

    total_removed = 0
    files_cleaned = []

    base_path = Path(base_path)

    for js_file in base_path.rglob('*.js'):
        # Skip if in excluded directory
        if any(skip_dir in js_file.parts for skip_dir in skip_dirs):
            continue

        # Skip if has excluded extension/suffix
        if any(str(js_file).endswith(skip_file) for skip_file in skip_files):
            continue

        # Skip already cleaned files
        if 'game.js' in str(js_file) or 'backgroundSystem.js' in str(js_file) or 'enemySystem.js' in str(js_file):
            print(f"Skipping (already cleaned): {js_file}")
            continue

        print(f"Processing: {js_file}")
        removed = clean_console_logs(js_file)

        if removed > 0:
            total_removed += removed
            files_cleaned.append((str(js_file), removed))
            print(f"  Removed {removed} console.log statements")

    return total_removed, files_cleaned

if __name__ == '__main__':
    base_dir = r'C:\Trunk\platformgame'

    print("Starting cleanup of console.log statements...")
    print(f"Base directory: {base_dir}")
    print()

    total, files = process_directory(base_dir)

    print("\n" + "="*80)
    print("CLEANUP SUMMARY")
    print("="*80)
    print(f"Total console.log statements removed: {total}")
    print(f"Files cleaned: {len(files)}")
    print()

    if files:
        print("Files cleaned:")
        for file_path, count in sorted(files, key=lambda x: x[1], reverse=True):
            print(f"  {file_path}: {count} statements")
