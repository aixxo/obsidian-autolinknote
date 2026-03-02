import { Plugin } from 'obsidian';
import { AutoLinkSettings, DEFAULT_SETTINGS } from './types';
import { AutoLinkSettingTab } from './settings';
import { registerCommands } from './commands/register-commands';

/**
 * AutoLink Plugin - Automatically find and link unlinked references
 */
export default class AutoLinkPlugin extends Plugin {
	settings: AutoLinkSettings;

	async onload() {
		// Load settings
		await this.loadSettings();

		// Register commands
		registerCommands(this);

		// Add settings tab
		this.addSettingTab(new AutoLinkSettingTab(this.app, this));

		console.log('AutoLink plugin loaded');
	}

	onunload() {
		console.log('AutoLink plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
