import { App, PluginSettingTab, Setting } from 'obsidian';
import AutoLinkPlugin from './main';
import { TagInput } from './ui/tag-input';
import { FolderListInput } from './ui/folder-list';

export class AutoLinkSettingTab extends PluginSettingTab {
	plugin: AutoLinkPlugin;

	constructor(app: App, plugin: AutoLinkPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Autolink')
			.setHeading();

		// Case Sensitivity
		new Setting(containerEl)
			.setName('Case sensitive matching')
			.setDesc('Match note names and aliases with case sensitivity')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.caseSensitive)
				.onChange(async (value) => {
					this.plugin.settings.caseSensitive = value;
					await this.plugin.saveSettings();
				}));

		// Include Aliases
		new Setting(containerEl)
			.setName('Include aliases')
			.setDesc('Match frontmatter aliases in addition to note names')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeAliases)
				.onChange(async (value) => {
					this.plugin.settings.includeAliases = value;
					await this.plugin.saveSettings();
				}));

		// Minimum Word Length
		new Setting(containerEl)
			.setName('Minimum word length')
			.setDesc('Minimum length of words to match (prevents matching very short words)')
			.addText(text => text
				.setPlaceholder('3')
				.setValue(String(this.plugin.settings.minWordLength))
				.onChange(async (value) => {
					const num = parseInt(value);
					if (!isNaN(num) && num > 0) {
						this.plugin.settings.minWordLength = num;
						await this.plugin.saveSettings();
					}
				}));

		// Exclude Code Blocks
		new Setting(containerEl)
			.setName('Exclude code blocks')
			.setDesc('Do not match text inside code blocks (``` and `)')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.excludeCodeBlocks)
				.onChange(async (value) => {
					this.plugin.settings.excludeCodeBlocks = value;
					await this.plugin.saveSettings();
				}));

		// Exclude URLs
		new Setting(containerEl)
			.setName('Exclude urls')
			.setDesc('Do not match text inside urls')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.excludeUrls)
				.onChange(async (value) => {
					this.plugin.settings.excludeUrls = value;
					await this.plugin.saveSettings();
				}));

		// Exclude Frontmatter
		new Setting(containerEl)
			.setName('Exclude frontmatter')
			.setDesc('Do not match text inside YAML frontmatter headers')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.excludeFrontmatter)
				.onChange(async (value) => {
					this.plugin.settings.excludeFrontmatter = value;
					await this.plugin.saveSettings();
				}));

		// Exclude Headings
		new Setting(containerEl)
			.setName('Exclude headings')
		.setDesc('Skip text inside Markdown headings')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.excludeHeadings)
				.onChange(async (value) => {
					this.plugin.settings.excludeHeadings = value;
					await this.plugin.saveSettings();
				}));

		// Recursive Folder Scan
		new Setting(containerEl)
			.setName('Recursive folder scanning')
			.setDesc('When scanning a folder, include all subfolders')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.recursiveFolderScan)
				.onChange(async (value) => {
					this.plugin.settings.recursiveFolderScan = value;
					await this.plugin.saveSettings();
				}));

		// Show Progress
		new Setting(containerEl)
			.setName('Show progress')
			.setDesc('Show progress notifications during scanning')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showProgress)
				.onChange(async (value) => {
					this.plugin.settings.showProgress = value;
					await this.plugin.saveSettings();
				}));

		// Word Blacklist
		const wordBlacklistSetting = new Setting(containerEl)
			.setName('Word blacklist')
			.setDesc('Words that should never be linked');

		const wordBlacklistContainer = wordBlacklistSetting.controlEl.createDiv();
		const tagInput = new TagInput(wordBlacklistContainer, (tags) => {
			void (async () => {
				this.plugin.settings.wordBlacklist = tags;
				await this.plugin.saveSettings();
			})();
		});
		tagInput.setValue(this.plugin.settings.wordBlacklist);

		// Exclude Folders
		const excludeFoldersSetting = new Setting(containerEl)
			.setName('Excluded folders')
			.setDesc('Folders to exclude from scanning');

		const folderListContainer = excludeFoldersSetting.controlEl.createDiv();
		const folderList = new FolderListInput(this.app, folderListContainer, (folders) => {
			void (async () => {
				this.plugin.settings.excludeFolders = folders;
				await this.plugin.saveSettings();
			})();
		});
		folderList.setValue(this.plugin.settings.excludeFolders);

		// Tag Blacklist
		const tagBlacklistSetting = new Setting(containerEl)
			.setName('Tag blacklist')
			.setDesc('Tags that exclude files from scanning (files with these tags will be ignored)');

		const tagBlacklistContainer = tagBlacklistSetting.controlEl.createDiv();
		const tagBlacklistInput = new TagInput(tagBlacklistContainer, (tags) => {
			void (async () => {
				this.plugin.settings.tagBlacklist = tags;
				await this.plugin.saveSettings();
			})();
		});
		tagBlacklistInput.setValue(this.plugin.settings.tagBlacklist);
	}
}
