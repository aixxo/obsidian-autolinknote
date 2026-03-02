import { AutoLinkSettings } from '../types';

/**
 * Builder for creating regex patterns to match note names and aliases
 */
export class RegexBuilder {
	/**
	 * Escapes special regex characters in a string
	 */
	static escapeRegex(str: string): string {
		return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	/**
	 * Builds a regex pattern to match a note name and its aliases
	 * @param basename The note's base name
	 * @param aliases Array of aliases from frontmatter
	 * @param settings Plugin settings
	 * @returns RegExp or null if no valid patterns
	 */
	static buildNoteRegex(
		basename: string,
		aliases: string[],
		settings: AutoLinkSettings
	): RegExp | null {
		const patterns: string[] = [];

		// Add basename if it meets criteria
		if (this.isValidSearchTerm(basename, settings)) {
			patterns.push(this.escapeRegex(basename));
		}

		// Add aliases if enabled and valid
		if (settings.includeAliases) {
			for (const alias of aliases) {
				if (this.isValidSearchTerm(alias, settings)) {
					patterns.push(this.escapeRegex(alias));
				}
			}
		}

		// No valid patterns
		if (patterns.length === 0) {
			return null;
		}

		// Sort by length (longest first) to prioritize longer matches
		patterns.sort((a, b) => b.length - a.length);

		// Build regex with Unicode-aware word boundaries
		// \\b doesn't work correctly with Unicode characters (umlauts, accents, etc.)
		// Instead, use negative lookahead/lookbehind to prevent matching within words
		// Character class includes: ASCII, German umlauts, and extended Latin characters
		const wordChar = '[a-zA-Z0-9äöüÄÖÜßà-ÿÀ-ÖØ-öø-ÿ_]';
		const pattern = patterns.map(p => `(?<!${wordChar})(${p})(?!${wordChar})`).join('|');

		// Create regex with appropriate flags
		const flags = settings.caseSensitive ? 'g' : 'gi';

		try {
			return new RegExp(pattern, flags);
		} catch (e) {
			console.error('Failed to create regex:', e);
			return null;
		}
	}

	/**
	 * Checks if a search term is valid according to settings
	 */
	private static isValidSearchTerm(term: string, settings: AutoLinkSettings): boolean {
		// Check minimum length
		if (term.length < settings.minWordLength) {
			return false;
		}

		// Check against blacklist
		const termLower = term.toLowerCase();
		for (const blacklisted of settings.wordBlacklist) {
			if (blacklisted.toLowerCase() === termLower) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Removes duplicate matches, keeping the longest/first one
	 */
	static deduplicateMatches<T extends { startPos: number; endPos: number }>(
		matches: T[]
	): T[] {
		if (matches.length === 0) return matches;

		// Sort by start position
		const sorted = [...matches].sort((a, b) => a.startPos - b.startPos);
		const deduplicated: T[] = [];

		for (const match of sorted) {
			const lastMatch = deduplicated[deduplicated.length - 1];

			// Check if this match overlaps with the last one
			if (lastMatch && match.startPos < lastMatch.endPos) {
				// Overlapping - keep the longer one
				if (match.endPos > lastMatch.endPos) {
					deduplicated[deduplicated.length - 1] = match;
				}
				// Otherwise skip this match
			} else {
				// No overlap, add it
				deduplicated.push(match);
			}
		}

		return deduplicated;
	}
}
