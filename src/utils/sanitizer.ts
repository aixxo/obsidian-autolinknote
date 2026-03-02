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

		// Remove existing wiki links [[...]]
		sanitized = sanitized.replace(/\[\[.*?\]\]/g, '');

		// Remove existing markdown links [text](url)
		sanitized = sanitized.replace(/\[.*?\]\(.*?\)/g, '');

		// Optionally remove code blocks
		if (settings.excludeCodeBlocks) {
			// Remove code fences ```...```
			sanitized = sanitized.replace(/```[\s\S]*?```/g, '');
			// Remove inline code `...`
			sanitized = sanitized.replace(/`[^`]+`/g, '');
		}

		// Optionally remove URLs
		if (settings.excludeUrls) {
			sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '');
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
