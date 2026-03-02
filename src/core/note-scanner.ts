import { App, TFile, TFolder } from 'obsidian';
import { AutoLinkSettings, NoteInfo, ScanScope } from '../types';
import { FolderUtils } from '../utils/folder-utils';

/**
 * Scanner for notes in the vault
 */
export class NoteScanner {
	constructor(private app: App, private settings: AutoLinkSettings) {}

	/**
	 * Gets notes based on the specified scan scope
	 */
	getNotesForScope(
		scope: ScanScope,
		folderPath?: string,
		recursive?: boolean
	): TFile[] {
		switch (scope) {
			case 'vault':
				return this.getAllNotes();
			
			case 'folder':
				if (!folderPath) {
					throw new Error('Folder path required for folder scope');
				}
				return this.getNotesInFolder(folderPath, recursive ?? this.settings.recursiveFolderScan);
			
			case 'current-folder':
				const activeFile = this.getActiveFile();
				if (!activeFile) {
					throw new Error('No active file');
				}
				const parentPath = FolderUtils.getFolderPath(activeFile);
				return this.getNotesInFolder(parentPath, recursive ?? this.settings.recursiveFolderScan);
			
			case 'current-note':
				const currentFile = this.getActiveFile();
				if (!currentFile) {
					throw new Error('No active file');
				}
				return [currentFile];
			
			default:
				throw new Error(`Unknown scope: ${scope}`);
		}
	}

	/**
	 * Gets all markdown notes in the vault (excluding configured folders)
	 */
	getAllNotes(): TFile[] {
		return FolderUtils.getAllNotes(this.app, this.settings.excludeFolders);
	}

	/**
	 * Gets markdown notes in a specific folder
	 */
	getNotesInFolder(folderPath: string, recursive: boolean): TFile[] {
		return FolderUtils.getNotesInFolder(this.app, folderPath, recursive);
	}

	/**
	 * Reads the content of a note
	 */
	async getNoteContent(file: TFile): Promise<string> {
		return await this.app.vault.read(file);
	}

	/**
	 * Gets aliases from a note's frontmatter
	 */
	getNoteAliases(file: TFile): string[] {
		const cache = this.app.metadataCache.getFileCache(file);
		const aliases = cache?.frontmatter?.aliases;
		
		if (!aliases) {
			return [];
		}

		// Handle both string and array formats
		if (Array.isArray(aliases)) {
			return aliases.filter(a => typeof a === 'string');
		} else if (typeof aliases === 'string') {
			return [aliases];
		}

		return [];
	}

	/**
	 * Builds an index of all notes with their search terms
	 */
	buildNoteIndex(notes: TFile[]): Map<string, NoteInfo> {
		const index = new Map<string, NoteInfo>();

		for (const note of notes) {
			const aliases = this.getNoteAliases(note);
			const searchTerms = [note.basename, ...aliases];

			const info: NoteInfo = {
				file: note,
				basename: note.basename,
				aliases,
				searchTerms
			};

			index.set(note.path, info);
		}

		return index;
	}

	/**
	 * Gets the currently active file
	 */
	getActiveFile(): TFile | null {
		return this.app.workspace.getActiveFile();
	}

	/**
	 * Gets the parent folder of the active file
	 */
	getActiveFolder(): TFolder | null {
		const activeFile = this.getActiveFile();
		return activeFile?.parent || null;
	}
}
