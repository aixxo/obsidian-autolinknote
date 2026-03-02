import { App, TFile } from 'obsidian';
import { AutoLinkSettings, LinkMatch, LinkFinderResult } from '../types';
import { ContentSanitizer } from '../utils/sanitizer';
import { RegexBuilder } from '../utils/regex-builder';
import { NoteScanner } from './note-scanner';

/**
 * Finds unlinked references to other notes
 */
export class LinkFinder {
	private scanner: NoteScanner;

	constructor(private app: App, private settings: AutoLinkSettings) {
		this.scanner = new NoteScanner(app, settings);
	}

	/**
	 * Finds all unlinked references in a note to target notes
	 */
	async findUnlinkedReferences(
		noteToCheck: TFile,
		targetNotes: TFile[]
	): Promise<LinkFinderResult> {
		// Read the note content
		const content = await this.scanner.getNoteContent(noteToCheck);

		// Sanitize content (remove existing links, code blocks, etc.)
		const sanitized = ContentSanitizer.sanitizeContent(content, this.settings);

		// Find matches
		const allMatches: LinkMatch[] = [];

		for (const targetNote of targetNotes) {
			// Don't match the note against itself
			if (targetNote.path === noteToCheck.path) {
				continue;
			}

			// Get aliases for the target note
			const aliases = this.scanner.getNoteAliases(targetNote);

			// Build regex for this note
			const regex = RegexBuilder.buildNoteRegex(
				targetNote.basename,
				aliases,
				this.settings
			);

			if (!regex) {
				continue; // No valid patterns for this note
			}

			// Find all matches in the sanitized content
			const matches = this.findMatches(sanitized, regex, targetNote);
			allMatches.push(...matches);
		}

		// Merge overlapping matches (keep longer/earlier ones)
		const mergedMatches = RegexBuilder.deduplicateMatches(allMatches);

		return {
			noteFile: noteToCheck,
			matches: mergedMatches
		};
	}

	/**
	 * Finds all matches of a regex in content
	 */
	private findMatches(content: string, regex: RegExp, targetNote: TFile): LinkMatch[] {
		const matches: LinkMatch[] = [];
		let match: RegExpExecArray | null;

		// Reset regex lastIndex
		regex.lastIndex = 0;

		while ((match = regex.exec(content)) !== null) {
			// Get the actual matched text (from any capturing group)
			const matchedText = match[0];
			const startPos = match.index;
			const endPos = startPos + matchedText.length;

			matches.push({
				matchedText,
				startPos,
				endPos,
				targetNotes: [targetNote],
				selectedTarget: targetNote
			});
		}

		return matches;
	}

	/**
	 * Merges matches that refer to the same target
	 * If multiple notes have the same name/alias, we keep them as multiple targets
	 */
	static mergeMatchesByPosition(matches: LinkMatch[]): LinkMatch[] {
		if (matches.length === 0) return matches;

		// Sort by position
		const sorted = [...matches].sort((a, b) => a.startPos - b.startPos);
		const merged: LinkMatch[] = [];

		for (const match of sorted) {
			const lastMatch = merged[merged.length - 1];

			// Check if this is the exact same position
			if (lastMatch && lastMatch.startPos === match.startPos && lastMatch.endPos === match.endPos) {
				// Same position - add target note to the existing match
				const firstTarget = match.targetNotes[0];
				if (firstTarget && !lastMatch.targetNotes.some(t => t.path === firstTarget.path)) {
					lastMatch.targetNotes.push(...match.targetNotes);
				}
			} else {
				// Different position, add as new match
				merged.push(match);
			}
		}

		return merged;
	}
}
