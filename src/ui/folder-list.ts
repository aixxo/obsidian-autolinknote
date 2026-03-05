import { App, ButtonComponent } from 'obsidian';
import { FolderSuggester } from './folder-suggester';

/**
 * FolderListInput Component
 * 
 * Renders a vertical list of folder paths with remove buttons.
 * New folders can be added via the FolderSuggester modal.
 */

export class FolderListInput {
	private app: App;
	private containerEl: HTMLElement;
	private listContainerEl: HTMLElement;
	private folders: string[];
	private onChangeCallback: (folders: string[]) => void;

	constructor(
		app: App, 
		containerEl: HTMLElement, 
		onChange: (folders: string[]) => void
	) {
		this.app = app;
		this.containerEl = containerEl;
		this.onChangeCallback = onChange;
		this.folders = [];
		
		this.render();
	}

	private render(): void {
		this.containerEl.empty();
		this.containerEl.addClass('autolink-folder-list');

		// Container for folder items
		this.listContainerEl = this.containerEl.createDiv('autolink-folder-list-container');

		// Render existing folders
		this.renderFolders();

		// Add folder button
		const buttonContainer = this.containerEl.createDiv('autolink-folder-add-container');
		
		new ButtonComponent(buttonContainer)
			.setButtonText('➕ add folder')
			.setClass('autolink-folder-add-button')
			.onClick(() => this.openFolderSuggester());
	}

	private renderFolders(): void {
		this.listContainerEl.empty();

		if (this.folders.length === 0) {
			const emptyMsg = this.listContainerEl.createDiv('autolink-folder-empty');
			// eslint-disable-next-line obsidianmd/ui/sentence-case
			emptyMsg.textContent = 'none';
			return;
		}

		this.folders.forEach((folder, index) => {
			const itemEl = this.listContainerEl.createDiv('autolink-folder-item');

			// Folder path
			const pathEl = itemEl.createSpan('autolink-folder-path');
			pathEl.textContent = folder;

			// Remove button
			const removeBtn = itemEl.createSpan('autolink-folder-remove');
			removeBtn.textContent = '×';
			removeBtn.setAttribute('aria-label', `${folder} entfernen`);
			removeBtn.addEventListener('click', () => this.removeFolder(index));
		});
	}

	private openFolderSuggester(): void {
		const suggester = new FolderSuggester(this.app, (folder) => {
			this.addFolder(folder.path);
		});
		suggester.open();
	}

	private addFolder(folderPath: string): void {
		// Check for duplicates
		if (this.folders.includes(folderPath)) {
			return;
		}

		// Add folder
		this.folders.push(folderPath);
		
		// Sort folders alphabetically for better UX
		this.folders.sort();
		
		// Re-render and notify
		this.renderFolders();
		this.notifyChange();
	}

	private removeFolder(index: number): void {
		if (index >= 0 && index < this.folders.length) {
			this.folders.splice(index, 1);
			this.renderFolders();
			this.notifyChange();
		}
	}

	private notifyChange(): void {
		if (this.onChangeCallback) {
			this.onChangeCallback([...this.folders]); // Pass a copy
		}
	}

	/**
	 * Set the current folders
	 */
	public setValue(folders: string[]): void {
		this.folders = [...folders]; // Store a copy
		this.folders.sort(); // Keep sorted
		this.renderFolders();
	}

	/**
	 * Get the current folders
	 */
	public getValue(): string[] {
		return [...this.folders]; // Return a copy
	}

	/**
	 * Clear all folders
	 */
	public clear(): void {
		this.folders = [];
		this.renderFolders();
		this.notifyChange();
	}
}
