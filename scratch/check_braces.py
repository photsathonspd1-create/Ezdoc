with open(r"C:\Agentic\safe_page_v6.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

braces = 0
brackets = 0
parentheses = 0

for idx, line in enumerate(lines):
    for char in line:
        if char == '{': braces += 1
        elif char == '}': braces -= 1
        elif char == '[': brackets += 1
        elif char == ']': brackets -= 1
        elif char == '(': parentheses += 1
        elif char == ')': parentheses -= 1
    
    if braces < 0 or brackets < 0 or parentheses < 0:
        print(f"Unbalanced at line {idx+1}: braces={braces}, brackets={brackets}, parens={parentheses}")
        break

print(f"Final counts: braces={braces}, brackets={brackets}, parens={parentheses}")
