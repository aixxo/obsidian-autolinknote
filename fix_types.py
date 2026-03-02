import re

# Fix link-applicator.ts
with open('/Users/okuhl/giteaRepository/AutoLinkNote/src/core/link-applicator.ts', 'r') as f:
    content = f.read()

# Fix line 71: Add null check for selections[0]
content = content.replace(
    '\t\tif (selections.length === 0) {\n\t\t\treturn 0;\n\t\t}\n\n\t\tconst noteFile = selections[0].noteFile;',
    '\t\tif (selections.length === 0) {\n\t\t\treturn 0;\n\t\t}\n\n\t\tconst firstSelection = selections[0];\n\t\tif (!firstSelection) {\n\t\t\treturn 0;\n\t\t}\n\n\t\tconst noteFile = firstSelection.noteFile;'
)

with open('/Users/okuhl/giteaRepository/AutoLinkNote/src/core/link-applicator.ts', 'w') as f:
    f.write(content)

# Fix link-finder.ts
with open('/Users/okuhl/giteaRepository/AutoLinkNote/src/core/link-finder.ts', 'r') as f:
    content = f.read()

# Fix line 112: Add null check for firstTarget
content = content.replace(
    '\t\t\t\t// Same position - add target note to the existing match\n\t\t\t\tif (!lastMatch.targetNotes.some(t => t.path === match.targetNotes[0].path)) {\n\t\t\t\t\tlastMatch.targetNotes.push(...match.targetNotes);\n\t\t\t\t}',
    '\t\t\t\t// Same position - add target note to the existing match\n\t\t\t\tconst firstTarget = match.targetNotes[0];\n\t\t\t\tif (firstTarget && !lastMatch.targetNotes.some(t => t.path === firstTarget.path)) {\n\t\t\t\t\tlastMatch.targetNotes.push(...match.targetNotes);\n\t\t\t\t}'
)

with open('/Users/okuhl/giteaRepository/AutoLinkNote/src/core/link-finder.ts', 'w') as f:
    f.write(content)

# Fix link-selection-modal.ts
with open('/Users/okuhl/giteaRepository/AutoLinkNote/src/ui/link-selection-modal.ts', 'r') as f:
    content = f.read()

# Fix lines 36-37: Add null checks for match and firstTarget
content = content.replace(
    '\t\t\t\t// Set default target (first one)\n\t\t\t\tconst match = result.matches[i];\n\t\t\t\tif (match.targetNotes.length > 0) {\n\t\t\t\t\tthis.targetSelections.set(matchId, match.targetNotes[0].path);\n\t\t\t\t}',
    '\t\t\t\t// Set default target (first one)\n\t\t\t\tconst match = result.matches[i];\n\t\t\t\tif (match && match.targetNotes.length > 0) {\n\t\t\t\t\tconst firstTarget = match.targetNotes[0];\n\t\t\t\t\tif (firstTarget) {\n\t\t\t\t\t\tthis.targetSelections.set(matchId, firstTarget.path);\n\t\t\t\t\t}\n\t\t\t\t}'
)

# Fix line 185: Add optional chaining for firstTarget
content = re.sub(
    r"text: `→ \[\[(\$\{match\.targetNotes\[0\]\.basename\})\]\]`,",
    r"text: `→ [[${match.targetNotes[0]?.basename || 'unknown'}]]`,",
    content
)

# Fix lines 228-233: Add null checks and fix match property order
content = content.replace(
    '\t\t\t\tif (isSelected) {\n\t\t\t\t\tconst match = result.matches[i];\n\t\t\t\t\tconst targetPath = this.targetSelections.get(matchId);',
    '\t\t\t\tif (isSelected) {\n\t\t\t\t\tconst match = result.matches[i];\n\t\t\t\t\tif (!match) continue;\n\t\t\t\t\t\n\t\t\t\t\tconst firstTarget = match.targetNotes[0];\n\t\t\t\t\tif (!firstTarget) continue;\n\t\t\t\t\t\n\t\t\t\t\tconst targetPath = this.targetSelections.get(matchId) || firstTarget.path;'
)

content = content.replace(
    '\t\t\t\t\tif (selectedTarget) {\n\t\t\t\t\t\tselections.push({\n\t\t\t\t\t\t\tnoteFile: result.nodeFile,\n\t\t\t\t\t\t\tmatch: {\n\t\t\t\t\t\t\t\tselectedTarget,\n\t\t\t\t\t\t\t\t...match\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t});\n\t\t\t\t\t}',
    '\t\t\t\t\tif (selectedTarget) {\n\t\t\t\t\t\tselections.push({\n\t\t\t\t\t\t\tnoteFile: result.noteFile,\n\t\t\t\t\t\t\tmatch: {\n\t\t\t\t\t\t\t\tmatchedText: match.matchedText,\n\t\t\t\t\t\t\t\tstartPos: match.startPos,\n\t\t\t\t\t\t\t\tendPos: match.endPos,\n\t\t\t\t\t\t\t\ttargetNotes: match.targetNotes,\n\t\t\t\t\t\t\t\tselectedTarget\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t});\n\t\t\t\t\t}'
)

with open('/Users/okuhl/giteaRepository/AutoLinkNote/src/ui/link-selection-modal.ts', 'w') as f:
    f.write(content)

print("Type fixes applied successfully")
