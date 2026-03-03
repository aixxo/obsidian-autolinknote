import AutoLinkPlugin from '../main';
import { ScanScope, LinkTargetGroup, LinkOccurrence, ExtractedLinkResult } from '../types';
import { NoteScanner } from '../core/note-scanner';
import { ProgressNotice } from './progress-notice';
import { LinkTargetSelectionModal } from './link-target-selection-modal';
import { LinkOccurrenceSelectionModal } from './link-occurrence-selection-modal';
import { LinkRemover } from '../core/link-remover';
import { extractWikiLinks } from '../utils/link-utils';
import { ContentSanitizer } from '../utils/sanitizer';

/**
 * Orchestrates the link removal workflow
 */
export async function startLinkRemovalFlow(
	plugin: AutoLinkPlugin,
	scope: ScanScope,
	folderPath?: string
): Promise<void> {
	// Step 1: Get notes for the specified scope
	const scanner = new NoteScanner(plugin.app, plugin.settings);
	const notes = scanner.getNotesForScope(scope, folderPath);

	if (notes.length === 0) {
		return;
	}

	// Step 2: Show progress notice if enabled and many notes
	let progress: ProgressNotice | null = null;
	if (plugin.settings.showProgress && notes.length > 10) {
		progress = new ProgressNotice('Scanning for links...');
	}

	// Step 3: Extract links from all notes
	const results: ExtractedLinkResult[] = [];
	
	for (let i = 0; i < notes.length; i++) {
		const note = notes[i];
		if (!note) continue;

		if (progress) {
			progress.update(i + 1, notes.length, note.path);
		}

		try {
			const content = await plugin.app.vault.read(note);
			const links = extractWikiLinks(content);

			if (links.length > 0) {
				results.push({
					noteFile: note,
					links
				});
			}
		} catch (error) {
			console.error(`Error reading ${note.path}:`, error);
		}
	}

	// Dismiss progress
	if (progress) {
		progress.dismiss();
	}

	// Check if any links were found
	const totalLinks = results.reduce((sum, r) => sum + r.links.length, 0);
	if (totalLinks === 0) {
		return;
	}

	// Step 4: Group links by target name with context
	const groups = await groupLinksByTarget(plugin, results);

	if (groups.length === 0) {
		return;
	}

	// Step 5: Show target selection modal
	new LinkTargetSelectionModal(plugin.app, groups, (selectedGroup) => {
		// Step 6: Show occurrence selection modal
		new LinkOccurrenceSelectionModal(
			plugin.app,
			selectedGroup,
			(selections) => {
				// Step 7: Remove/replace the selected links
				const remover = new LinkRemover(plugin.app);
				void remover.removeLinks(selections);
			}
		).open();
	}).open();
}

/**
 * Groups extracted links by their target note name
 */
async function groupLinksByTarget(
	plugin: AutoLinkPlugin,
	results: ExtractedLinkResult[]
): Promise<LinkTargetGroup[]> {
	const groupMap = new Map<string, LinkOccurrence[]>();

	// Process all results and group by target name
	for (const result of results) {
		const content = await plugin.app.vault.read(result.noteFile);

		for (const link of result.links) {
			const targetName = link.targetNote;

			// Create occurrence with context
			const context = ContentSanitizer.getContext(
				content,
				link.startPos,
				link.endPos,
				40
			);

			const occurrence: LinkOccurrence = {
				noteFile: result.noteFile,
				link,
				context
			};

			// Add to group
			if (!groupMap.has(targetName)) {
				groupMap.set(targetName, []);
			}
			groupMap.get(targetName)!.push(occurrence);
		}
	}

	// Convert map to array of LinkTargetGroup
	const groups: LinkTargetGroup[] = [];

	for (const [targetName, occurrences] of groupMap.entries()) {
		// Count unique files
		const uniqueFiles = new Set(occurrences.map(o => o.noteFile.path));

		groups.push({
			targetName,
			totalCount: occurrences.length,
			fileCount: uniqueFiles.size,
			occurrences
		});
	}

	// Sort by total count (descending)
	groups.sort((a, b) => b.totalCount - a.totalCount);

	return groups;
}
