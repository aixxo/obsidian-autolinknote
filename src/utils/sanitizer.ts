import { AutoLinkSettings } from '../types';

/**
 * Sanitizer for content - removes existing links and optionally code blocks/URLs
 */
export class ContentSanitizer {
	/**
	 * Removes existing links, code blocks, and URLs from content based on settings
	 */
	static sanitizeContent(content: string, settings: AutoLinkSettings): string {
		let sanitized = content;

		// Optionally remove frontmatter (YAML headers)
		if (settings.excludeFrontmatter) {
			// Match frontmatter at the start of the file: ---\n...\n---\n
			// Replace with spaces to preserve positions for later link insertion
			sanitized = sanitized.replace(/^---\s*\n[\s\S]*?\n---\s*\n/m, (match) => {
				return ' '.repeat(match.length);
			});
		}

		// Optionally remove headings
		if (settings.excludeHeadings) {
			// Match markdown headings: # Title, ## Title, etc.
			// Replace with spaces to preserve positions
			sanitized = sanitized.replace(/^#{1,6}\s+.+$/gm, (match) => {
				return ' '.repeat(match.length);
			});
		}

		// Remove existing wiki links [[...]]
		// Handles: [[Link]], [[Link|Alias]], [[Link#Heading]], [[Link#Heading|Alias]]
		// Replace with spaces to preserve positions and prevent re-linking inside links
		sanitized = sanitized.replace(/\[\[([^[\]]+)\]\]/g, (match) => {
			return ' '.repeat(match.length);
		});

		// Remove existing markdown links [text](url)
		// Replace with spaces to preserve positions and prevent re-linking
		sanitized = sanitized.replace(/\[([^[\]]+)\]\(([^)]+)\)/g, (match) => {
			return ' '.repeat(match.length);
		});

		// Optionally remove code blocks
		if (settings.excludeCodeBlocks) {
			// Remove code fences ```...```
			// Replace with spaces to preserve positions
			sanitized = sanitized.replace(/```[\s\S]*?```/g, (match) => {
				return ' '.repeat(match.length);
			});
			// Remove inline code `...`
			// Replace with spaces to preserve positions
			sanitized = sanitized.replace(/`[^`]+`/g, (match) => {
				return ' '.repeat(match.length);
			});
		}

		// Optionally remove URLs
		if (settings.excludeUrls) {
			// Replace with spaces to preserve positions
			sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, (match) => {
				return ' '.repeat(match.length);
			});
		}

		return sanitized;
	}

	/**
	 * Creates a position map from sanitized content back to original content
	 * This helps maintain correct positions when inserting links
	 */
	static buildPositionMap(original: string, sanitized: string): Map<number, number> {
		const map = new Map<number, number>();
		let origIndex = 0;
		let sanitIndex = 0;

		// Simple implementation - for MVP we'll use direct sanitization
		// In future versions, this can be more sophisticated
		for (let i = 0; i < sanitized.length && origIndex < original.length; i++) {
			map.set(sanitIndex, origIndex);
			sanitIndex++;
			origIndex++;
		}

		return map;
	}

	/**
	 * Gets context around a match for display purposes
	 */
	static getContext(content: string, startPos: number, endPos: number, contextLength: number = 40): string {
		const start = Math.max(0, startPos - contextLength);
		const end = Math.min(content.length, endPos + contextLength);
		
		let context = content.slice(start, end);
		
		// Add ellipsis if truncated
		if (start > 0) context = '...' + context;
		if (end < content.length) context = context + '...';
		
		// Highlight the match with markdown bold
		const matchStart = startPos - start + (start > 0 ? 3 : 0);
		const matchEnd = matchStart + (endPos - startPos);
		context = context.slice(0, matchStart) + '**' + context.slice(matchStart, matchEnd) + '**' + context.slice(matchEnd);
		
		return context;
	}
}
