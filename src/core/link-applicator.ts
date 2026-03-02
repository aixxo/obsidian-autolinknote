import { App, Notice, TFile } from 'obsidian';
import { LinkSelection } from '../types';

/**
 * Applies selected links to notes
 */
export class LinkApplicator {
	constructor(private app: App) {}

	/**
	 * Applies the selected links to their respective notes
	 * @returns Number of links successfully inserted
	 */
	async applyLinks(selections: LinkSelection[]): Promise<number> {
		if (selections.length === 0) {
			return 0;
		}

		// Group selections by note file
		const groupedByNote = this.groupSelectionsByNote(selections);

		let totalLinksInserted = 0;
		const errors: string[] = [];

		// Process each note
		for (const [notePath, noteSelections] of groupedByNote.entries()) {
			try {
				const linksInserted = await this.applyLinksToNote(noteSelections);
				totalLinksInserted += linksInserted;
			} catch (error) {
				console.error(`Error applying links to ${notePath}:`, error);
				errors.push(notePath);
			}
		}

		// Show results
		if (errors.length > 0) {
			new Notice(`⚠️ AutoLink: ${totalLinksInserted} links inserted, but ${errors.length} note(s) had errors`);
		} else {
			new Notice(`✅ AutoLink: ${totalLinksInserted} link${totalLinksInserted === 1 ? '' : 's'} successfully inserted!`);
		}

		return totalLinksInserted;
	}

	/**
	 * Groups selections by their note file
	 */
	private groupSelectionsByNote(selections: LinkSelection[]): Map<string, LinkSelection[]> {
		const grouped = new Map<string, LinkSelection[]>();

		for (const selection of selections) {
			const path = selection.noteFile.path;
			if (!grouped.has(path)) {
				grouped.set(path, []);
			}
			grouped.get(path)!.push(selection);
		}

		return grouped;
	}

	/**
	 * Applies links to a single note
	 */
	private async applyLinksToNote(selections: LinkSelection[]): Promise<number> {
		if (selections.length === 0) {
			return 0;
		}

		const firstSelection = selections[0];
		if (!firstSelection) {
			return 0;
		}

		const noteFile = firstSelection.noteFile;

		// Read current content
		let content = await this.app.vault.read(noteFile);

		// Sort selections in REVERSE order by position
		// This is critical to maintain correct positions as we modify the content
		const sorted = selections.sort((a, b) => b.match.endPos - a.match.endPos);

		// Apply each link replacement
		for (const selection of sorted) {
			const match = selection.match;
			const targetNote = match.selectedTarget || match.targetNotes[0];

			if (!targetNote) {
				console.warn('No target note selected for match:', match);
				continue;
			}

			// Create wiki link
			const link = `[[${targetNote.basename}]]`;

			// Replace the matched text with the link
			content = 
				content.slice(0, match.startPos) +
				link +
				content.slice(match.endPos);
		}

		// Write modified content back
		await this.app.vault.modify(noteFile, content);

		return selections.length;
	}
}
