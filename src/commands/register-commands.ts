import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';
import { NoteScanner } from '../core/note-scanner';
import { LinkFinder } from '../core/link-finder';
import { LinkSelectionModal } from '../ui/link-selection-modal';
import { FolderSuggester } from '../ui/folder-suggester';
import { ProgressNotice } from '../ui/progress-notice';
import { AutoLinkSettings, LinkFinderResult } from '../types';
import { registerRemoveLinkCommands } from './remove-link-commands';
import AutoLinkPlugin from '../main';

/**
 * Registers all plugin commands
 */
export function registerCommands(plugin: Plugin & { settings: AutoLinkSettings }): void {
	
	// Command 1: Scan entire vault
	plugin.addCommand({
		id: 'autolink-scan-vault',
		name: 'Scan entire vault for unlinked references',
		callback: async () => {
			await scanVault(plugin);
		}
	});

	// Command 2: Scan folder (with selection)
	plugin.addCommand({
		id: 'autolink-scan-folder-select',
		name: 'Scan folder (choose from list)',
		callback: async () => {
			new FolderSuggester(plugin.app, (folder) => {
				void (async () => {
					await scanFolder(plugin, folder.path, plugin.settings.recursiveFolderScan);
				})();
			}).open();
		}
	});

	// Command 3: Scan current folder
	plugin.addCommand({
		id: 'autolink-scan-current-folder',
		name: "Scan current note's folder",
		editorCallback: async (editor: Editor, view: MarkdownView) => {
			const file = view.file;
			if (!file) {
				new Notice('❌ no active file');
				return;
			}

			const folderPath = file.parent?.path || '';
			await scanFolder(plugin, folderPath, plugin.settings.recursiveFolderScan);
		}
	});

	// Command 4: Scan current note only
	plugin.addCommand({
		id: 'autolink-scan-current',
		name: 'Scan current note only',
		editorCallback: async (editor: Editor, view: MarkdownView) => {
			const file = view.file;
			if (!file) {
				new Notice('❌ no active file');
				return;
			}

			await scanCurrentNote(plugin, file.path);
		}
	});

	// Register link removal commands
	registerRemoveLinkCommands(plugin as AutoLinkPlugin);
}

/**
 * Scans the entire vault
 */
async function scanVault(plugin: Plugin & { settings: AutoLinkSettings }): Promise<void> {
	const scanner = new NoteScanner(plugin.app, plugin.settings);
	const finder = new LinkFinder(plugin.app, plugin.settings);

	// Get all notes
	const allNotes = scanner.getAllNotes();
	
	if (allNotes.length === 0) {
		new Notice('No notes found in vault');
		return;
	}

	// Show progress
	let progress: ProgressNotice | null = null;
	if (plugin.settings.showProgress) {
		progress = new ProgressNotice('Scanning vault...');
	}

	try {
		const results: LinkFinderResult[] = [];

		for (let i = 0; i < allNotes.length; i++) {
			const note = allNotes[i];
		if (!note) continue;
			if (progress) {
				progress.update(i + 1, allNotes.length, note.basename);
			}

			// Find unlinked references
			const result = await finder.findUnlinkedReferences(note, allNotes);
			
			if (result.matches.length > 0) {
				results.push(result);
			}
		}

		// Dismiss progress
		if (progress) {
			progress.dismiss();
		}

		// Show results
		if (results.length === 0) {
			new Notice('✅ no unlinked references found');
			return;
		}

		new LinkSelectionModal(plugin.app, results, 'Entire vault').open();

	} catch (error) {
		if (progress) {
			progress.dismiss();
		}
		console.error('Error scanning vault:', error);
		new Notice('❌ error scanning vault - check console for details');
	}
}

/**
 * Scans a specific folder
 */
async function scanFolder(
	plugin: Plugin & { settings: AutoLinkSettings },
	folderPath: string,
	recursive: boolean
): Promise<void> {
	const scanner = new NoteScanner(plugin.app, plugin.settings);
	const finder = new LinkFinder(plugin.app, plugin.settings);

	// Get notes in folder
	const notes = scanner.getNotesInFolder(folderPath, recursive);
	
	if (notes.length === 0) {
		new Notice(`No notes found in folder: ${folderPath}`);
		return;
	}

	// Show progress
	let progress: ProgressNotice | null = null;
	if (plugin.settings.showProgress && notes.length > 10) {
		const recursiveText = recursive ? ' (recursive)' : '';
		progress = new ProgressNotice(`Scanning folder: ${folderPath}${recursiveText}...`);
	}

	try {
		const results: LinkFinderResult[] = [];

		// For folder scans, search within the folder notes
		for (let i = 0; i < notes.length; i++) {
			const note = notes[i];
			if (!note) continue;
			
			// Update progress
			if (progress) {
				progress.update(i + 1, notes.length, note.basename);
			}

			// Find unlinked references (search against all vault notes for targets)
			const allNotes = scanner.getAllNotes();
			const result = await finder.findUnlinkedReferences(note, allNotes);
			
			if (result.matches.length > 0) {
				results.push(result);
			}
		}

		// Dismiss progress
		if (progress) {
			progress.dismiss();
		}

		// Show results
		if (results.length === 0) {
			new Notice('✅ no unlinked references found');
			return;
		}

		const folderName = folderPath || '(root)';
		const recursiveText = recursive ? ' (recursive)' : '';
		new LinkSelectionModal(
			plugin.app, 
			results, 
			`Folder: ${folderName}${recursiveText} (${notes.length} notes)`
		).open();

	} catch (error) {
		if (progress) {
			progress.dismiss();
		}
		console.error('Error scanning folder:', error);
		new Notice('❌ error scanning folder - check console for details');
	}
}

/**
 * Scans only the current note
 */
async function scanCurrentNote(
	plugin: Plugin & { settings: AutoLinkSettings },
	filePath: string
): Promise<void> {
	const scanner = new NoteScanner(plugin.app, plugin.settings);
	const finder = new LinkFinder(plugin.app, plugin.settings);

	// Get the current markdown file
	const currentFile = plugin.app.vault.getMarkdownFiles().find(f => f.path === filePath);
	if (!currentFile) {
		new Notice('❌ file not found or not a Markdown file');
		return;
	}

	try {
		// Get all notes as potential targets
		const allNotes = scanner.getAllNotes();

		// Find unlinked references
		const result = await finder.findUnlinkedReferences(currentFile, allNotes);

		if (result.matches.length === 0) {
			new Notice('✅ no unlinked references found in current note');
			return;
		}

		// Show results
		new LinkSelectionModal(
			plugin.app,
			[result],
			`Current note: ${currentFile.basename}`
		).open();

	} catch (error) {
		console.error('Error scanning current note:', error);
		new Notice('❌ error scanning note - check console for details');
	}
}
