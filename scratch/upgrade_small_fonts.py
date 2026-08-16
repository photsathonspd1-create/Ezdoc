import os
import re

root_dir = r"C:\Agentic\working\EzDoc\src"

# Regex to match font sizes smaller than text-xs in Tailwind class names
# Matches things like text-[10px], text-[11px], text-[9px], text-[8px]
small_font_pat = re.compile(r'text-\[(?:8|9|10|11)px\]')

# Counter for replacements
replaced_count = 0
modified_files = []

print("Running safe font upgrade to text-xs...")

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.css')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Check if there are matches in this file
            matches = small_font_pat.findall(content)
            if matches:
                # Exclude the exact A4 sheet css block in documents/[id]/page.tsx
                # Let's handle it by checking lines or just doing regex replacement but ignoring the specific A4 sheet css line.
                lines = content.split('\n')
                new_lines = []
                file_changed = False
                
                for line in lines:
                    if '.A4-sheet .text-[9px]' in line or '.A4-sheet .text-[8px]' in line:
                        new_lines.append(line)
                    else:
                        new_line, num = small_font_pat.subn('text-xs', line)
                        if num > 0:
                            line = new_line
                            replaced_count += num
                            file_changed = True
                        new_lines.append(line)
                
                if file_changed:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write('\n'.join(new_lines))
                    modified_files.append(os.path.relpath(path, root_dir))

print(f"Successfully upgraded {replaced_count} font class occurrences to text-xs across {len(modified_files)} files.")
print("Modified files:")
for f in modified_files:
    print(f"- {f}")
