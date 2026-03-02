import { App, TFile, TFolder } from 'obsidian';

/**
 * Utility functions for working with folders
 */
export class FolderUtils {
	/**
	 * Gets all folders in the vault
	 */
	static getAllFolders(app: App): TFolder[] {
		const folders: TFolder[] = [];
		
		// Recursively collect all folders
		const collectFolders = (folder: TFolder) => {
			folders.push(folder);
			for (const child of folder.children) {
				if (child instanceof TFolder) {
					collectFolders(child);
				}
			}
		};

		// Start from root
		const root = app.vault.getRoot();
		for (const child of root.children) {
			if (child instanceof TFolder) {
				collectFolders(child);
			}
		}

		// Sort alphabetically by path
		folders.sort((a, b) => a.path.localeCompare(b.path));

		return folders;
	}

	/**
	 * Gets the parent folder path of a file
	 */
	static getFolderPath(file: TFile): string {
		return file.parent?.path || '';
	}

	/**
	 * Gets all markdown notes in a folder
	 * @param app The Obsidian app
	 * @param folderPath Path to the folder
	 * @param recursive Whether to include subfolders
	 */
	static getNotesInFolder(app: App, folderPath: string, recursive: boolean): TFile[] {
		const notes: TFile[] = [];
		
		// Get the folder
		const folder = app.vault.getAbstractFileByPath(folderPath);
		if (!(folder instanceof TFolder)) {
			return notes;
		}

		// Collect notes
		const collectNotes = (folder: TFolder) => {
			for (const child of folder.children) {
				if (child instanceof TFile && child.extension === 'md') {
					notes.push(child);
				} else if (recursive && child instanceof TFolder) {
					collectNotes(child);
				}
			}
		};

		collectNotes(folder);

		return notes;
	}

	/**
	 * Gets all markdown files in the vault, excluding specified folders
	 */
	static getAllNotes(app: App, excludeFolders: string[] = []): TFile[] {
		const allFiles = app.vault.getMarkdownFiles();
		
		if (excludeFolders.length === 0) {
			return allFiles;
		}

		// Filter out files in excluded folders
		return allFiles.filter(file => {
			const filePath = file.path;
			return !excludeFolders.some(excluded => 
				filePath.startsWith(excluded + '/') || filePath === excluded
			);
		});
	}

	/**
	 * Checks if a path is within an excluded folder
	 */
	static isInExcludedFolder(filePath: string, excludeFolders: string[]): boolean {
		return excludeFolders.some(excluded => 
			filePath.startsWith(excluded + '/') || filePath === excluded
		);
	}
}
