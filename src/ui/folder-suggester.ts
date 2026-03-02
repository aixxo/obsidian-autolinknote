import { App, FuzzySuggestModal, TFolder } from 'obsidian';
import { FolderUtils } from '../utils/folder-utils';

/**
 * Modal for selecting a folder from the vault
 */
export class FolderSuggester extends FuzzySuggestModal<TFolder> {
	private onChooseCallback: (folder: TFolder) => void;
	private folders: TFolder[];

	constructor(app: App, onChoose: (folder: TFolder) => void) {
		super(app);
		this.onChooseCallback = onChoose;
		this.folders = FolderUtils.getAllFolders(app);
		
		this.setPlaceholder('Select a folder to scan...');
	}

	getItems(): TFolder[] {
		return this.folders;
	}

	getItemText(folder: TFolder): string {
		return folder.path || '(root)';
	}

	onChooseItem(folder: TFolder, evt: MouseEvent | KeyboardEvent): void {
		this.onChooseCallback(folder);
	}
}
