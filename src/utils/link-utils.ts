import { ExtractedLink } from '../types';

/**
 * Regular expression to match wiki-style links
 * Matches: [[Link]], [[Link|Alias]], [[Link#Heading]], [[Link#Heading|Alias]]
 * Captures the full link content (without outer brackets) in group 1
 */
export const WIKI_LINK_REGEX = /\[\[([^\[\]]+)\]\]/g;

/**
 * Extracts all wiki-style links from the given content
 * @param content - The markdown content to scan
 * @returns Array of extracted links sorted by position
 */
export function extractWikiLinks(content: string): ExtractedLink[] {
	const links: ExtractedLink[] = [];
	const regex = new RegExp(WIKI_LINK_REGEX); // Create new instance for clean state
	
	let match: RegExpExecArray | null;
	while ((match = regex.exec(content)) !== null) {
		const fullLink = match[0]; // Full match including [[]]
		const linkContent = match[1]?.trim(); // Content inside [[]]
		
		if (!linkContent) continue;
		
		// Extract target note (before | or # if present)
		let targetNote = linkContent;
		const pipeIndex = linkContent.indexOf('|');
		const hashIndex = linkContent.indexOf('#');
		
		if (pipeIndex !== -1) {
			// Has alias: [[Note|Alias]] -> "Note"
			targetNote = linkContent.substring(0, pipeIndex).trim();
		} else if (hashIndex !== -1) {
			// Has heading: [[Note#Heading]] -> "Note"
			targetNote = linkContent.substring(0, hashIndex).trim();
		}
		
		links.push({
			fullLink,
			targetNote,
			startPos: match.index,
			endPos: match.index + fullLink.length
		});
	}
	
	// Sort by position (should already be sorted, but ensure it)
	return links.sort((a, b) => a.startPos - b.startPos);
}
