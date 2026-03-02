import { App, PluginSettingTab, Setting } from 'obsidian';
import AutoLinkPlugin from './main';

export class AutoLinkSettingTab extends PluginSettingTab {
	plugin: AutoLinkPlugin;

	constructor(app: App, plugin: AutoLinkPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'AutoLink Settings' });

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
			.setName('Exclude URLs')
			.setDesc('Do not match text inside URLs')
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
			.setDesc('Do not match text inside markdown headings (# Title, ## Title, etc.)')
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
		new Setting(containerEl)
			.setName('Word blacklist')
			.setDesc('Words that should never be linked (comma-separated)')
			.addTextArea(text => text
				.setPlaceholder('the, and, or, a, an')
				.setValue(this.plugin.settings.wordBlacklist.join(', '))
				.onChange(async (value) => {
					this.plugin.settings.wordBlacklist = value
						.split(',')
						.map(w => w.trim())
						.filter(w => w.length > 0);
					await this.plugin.saveSettings();
				}));

		// Exclude Folders
		new Setting(containerEl)
			.setName('Exclude folders')
			.setDesc('Folders to exclude from scanning (comma-separated paths)')
			.addTextArea(text => text
				.setPlaceholder('Templates, Archive')
				.setValue(this.plugin.settings.excludeFolders.join(', '))
				.onChange(async (value) => {
					this.plugin.settings.excludeFolders = value
						.split(',')
						.map(f => f.trim())
						.filter(f => f.length > 0);
					await this.plugin.saveSettings();
				}));
	}
}
