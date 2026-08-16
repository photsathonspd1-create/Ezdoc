import os
import re
import sys

# Reconfigure stdout to use UTF-8
sys.stdout.reconfigure(encoding='utf-8')

root_dir = r"C:\Agentic\working\EzDoc\src"
small_font_pat = re.compile(r'text-\[(?:8|9|10|11)px\]|text-xxs')

print("Scanning for small font sizes in standard UI...")
matches = []
for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            path = os.path.join(root, file)
            # Exclude A4 physical paper print stylesheet definitions or physical prints themselves
            # which are normally inside .A4-sheet styles in document designer.
            # However, we will look at all matches and then decide.
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
                for idx, line in enumerate(lines):
                    if small_font_pat.search(line):
                        matches.append({
                            'file': os.path.relpath(path, root_dir),
                            'line': idx + 1,
                            'content': line.strip()
                        })

print(f"Found {len(matches)} occurrences:")
for m in matches:
    print(f"{m['file']}:{m['line']}: {m['content']}")
