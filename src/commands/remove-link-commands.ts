import { Editor, MarkdownView, Notice } from 'obsidian';
import AutoLinkPlugin from '../main';
import { FolderSuggester } from '../ui/folder-suggester';
import { startLinkRemovalFlow } from '../ui/link-removal-flow';

/**
 * Registers link removal commands
 */
export function registerRemoveLinkCommands(plugin: AutoLinkPlugin): void {
	
	// Command 1: Remove links from entire vault
	plugin.addCommand({
		id: 'autolink-remove-links-vault',
		name: 'Remove links from entire vault',
		callback: async () => {
			await startLinkRemovalFlow(plugin, 'vault');
		}
	});

	// Command 2: Remove links from folder (with selection)
	plugin.addCommand({
		id: 'autolink-remove-links-folder-select',
		name: 'Remove links from folder (choose)',
		callback: async () => {
			new FolderSuggester(plugin.app, (folder) => {
				void startLinkRemovalFlow(plugin, 'folder', folder.path);
			}).open();
		}
	});

	// Command 3: Remove links from current note's folder
	plugin.addCommand({
		id: 'autolink-remove-links-current-folder',
		name: "Remove links from current note's folder",
		editorCallback: async (editor: Editor, view: MarkdownView) => {
			const file = view.file;
			if (!file) {
				new Notice('No active file');
				return;
			}

			const folderPath = file.parent?.path || '';
			void startLinkRemovalFlow(plugin, 'folder', folderPath);
		}
	});

	// Command 4: Remove links from current note only
	plugin.addCommand({
		id: 'autolink-remove-links-current',
		name: 'Remove links from current note',
		editorCallback: async (editor: Editor, view: MarkdownView) => {
			const file = view.file;
			if (!file) {
				new Notice('No active file');
				return;
			}

			void startLinkRemovalFlow(plugin, 'current-note', file.path);
		}
	});
}
