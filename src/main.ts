import { Plugin } from 'obsidian';
import { AutoLinkSettings, DEFAULT_SETTINGS, isAutoLinkSettings } from './types';
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

		console.debug('AutoLink plugin loaded');
	}

	onunload() {
		console.debug('AutoLink plugin unloaded');
	}

	async loadSettings() {
		const data: unknown = await this.loadData();
		
		if (isAutoLinkSettings(data)) {
			this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
		} else {
			// Fallback to defaults if data is invalid
			this.settings = { ...DEFAULT_SETTINGS };
			if (data !== null) {
				console.warn('Invalid settings data loaded, using defaults');
			}
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
