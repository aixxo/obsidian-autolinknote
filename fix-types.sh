#!/bin/bash

# Fix link-applicator.ts line 71
sed -i '' '71s/const noteFile = selections\[0\].noteFile;/const firstSelection = selections[0];\
		if (!firstSelection) return 0;\
		const noteFile = firstSelection.noteFile;/' src/core/link-applicator.ts

# Fix link-finder.ts line 112
sed -i '' '112s/if (!lastMatch.targetNotes.some(t => t.path === match.targetNotes\[0\].path)) {/const firstTarget = match.targetNotes[0];\
			if (lastMatch \&\& firstTarget \&\& !lastMatch.targetNotes.some(t => t.path === firstTarget.path)) {/' src/core/link-finder.ts

# Fix link-selection-modal.ts lines 36-37
sed -i '' '36,37s/if (match.targetNotes.length > 0) {/if (match \&\& match.targetNotes.length > 0) {\
					const firstTarget = match.targetNotes[0];\
					if (firstTarget) {/' src/ui/link-selection-modal.ts
sed -i '' '37s/this.targetSelections.set(matchId, match.targetNotes\[0\].path);/this.targetSelections.set(matchId, firstTarget.path);\
					}/' src/ui/link-selection-modal.ts

# Fix link-selection-modal.ts line 185
sed -i '' '185s/text: `→ \[\[${match.targetNotes\[0\].basename}\]\]`,/text: `→ [[${match.targetNotes[0]?.basename || '"'"'unknown'"'"'}]]`,/' src/ui/link-selection-modal.ts

# Fix link-selection-modal.ts lines 228 and 233
sed -i '' '228s/const targetPath = this.targetSelections.get(matchId) || match.targetNotes\[0\].path;/const firstTarget = match?.targetNotes[0];\
			if (!match || !firstTarget) continue;\
			const targetPath = this.targetSelections.get(matchId) || firstTarget.path;/' src/ui/link-selection-modal.ts
sed -i '' '233s/match: {/match: {\
					...match,\
					matchedText: match.matchedText || '"'"''"'"',/' src/ui/link-selection-modal.ts
sed -i '' '234s/selectedTarget,/selectedTarget/' src/ui/link-selection-modal.ts
sed -i '' '235s/...match//' src/ui/link-selection-modal.ts

echo "Type fixes applied"
