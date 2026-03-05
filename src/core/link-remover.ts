import { App, Notice } from 'obsidian';
import { LinkRemovalSelection } from '../types';

/**
 * Handles removal/replacement of wiki links in notes
 */
export class LinkRemover {
	constructor(private app: App) {}

	/**
	 * Removes or replaces selected links in their respective notes
	 * @param selections - Array of link occurrences with replacement text
	 * @returns Number of links successfully replaced
	 */
	async removeLinks(selections: LinkRemovalSelection[]): Promise<number> {
		if (selections.length === 0) {
			return 0;
		}

		// Group selections by note file
		const groupedByNote = this.groupSelectionsByNote(selections);

		let totalLinksReplaced = 0;
		const errors: string[] = [];

		// Process each note
		for (const [notePath, noteSelections] of groupedByNote.entries()) {
			try {
				const linksReplaced = await this.removeLinksFromNote(noteSelections);
				totalLinksReplaced += linksReplaced;
			} catch (error) {
				console.error(`Error removing links from ${notePath}:`, error);
				errors.push(notePath);
			}
		}

		// Show results
		if (errors.length > 0) {
			new Notice(`⚠️ AutoLink: ${totalLinksReplaced} links ersetzt, aber ${errors.length} Datei(en) hatten Fehler`);
		} else {
			const filesCount = groupedByNote.size;
			new Notice(`✅ AutoLink: ${totalLinksReplaced} Link${totalLinksReplaced === 1 ? '' : 's'} erfolgreich in ${filesCount} Datei${filesCount === 1 ? '' : 'en'} ersetzt!`);
		}

		return totalLinksReplaced;
	}

	/**
	 * Groups selections by their note file path
	 */
	private groupSelectionsByNote(selections: LinkRemovalSelection[]): Map<string, LinkRemovalSelection[]> {
		const grouped = new Map<string, LinkRemovalSelection[]>();

		for (const selection of selections) {
			const path = selection.occurrence.noteFile.path;
			if (!grouped.has(path)) {
				grouped.set(path, []);
			}
			grouped.get(path)!.push(selection);
		}

		return grouped;
	}

	/**
	 * Removes/replaces links in a single note
	 */
	private async removeLinksFromNote(selections: LinkRemovalSelection[]): Promise<number> {
		if (selections.length === 0) {
			return 0;
		}

		const firstSelection = selections[0];
		if (!firstSelection) {
			return 0;
		}

		const noteFile = firstSelection.occurrence.noteFile;

		// Read current content
		let content = await this.app.vault.read(noteFile);

		// Sort selections in REVERSE order by position
		// This is critical to maintain correct positions as we modify the content
		const sorted = selections.sort((a, b) => 
			b.occurrence.link.endPos - a.occurrence.link.endPos
		);

		// Apply each link replacement
		for (const selection of sorted) {
			const link = selection.occurrence.link;
			const replacementText = selection.replacementText;

			// Replace the link with the replacement text
			content = 
				content.slice(0, link.startPos) +
				replacementText +
				content.slice(link.endPos);
		}

		// Write modified content back
		await this.app.vault.modify(noteFile, content);

		return selections.length;
	}
}
