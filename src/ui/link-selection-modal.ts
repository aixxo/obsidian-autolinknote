import { App, Modal, ButtonComponent, Setting } from 'obsidian';
import { LinkFinderResult, LinkSelection, LinkMatch } from '../types';
import { LinkApplicator } from '../core/link-applicator';
import { ContentSanitizer } from '../utils/sanitizer';

/**
 * Modal for selecting which links to apply
 */
export class LinkSelectionModal extends Modal {
	private results: LinkFinderResult[];
	private scanInfo: string;
	private selections: Map<string, boolean>; // matchId -> selected
	private targetSelections: Map<string, string>; // matchId -> targetPath
	private applicator: LinkApplicator;

	constructor(app: App, results: LinkFinderResult[], scanInfo: string) {
		super(app);
		this.results = results;
		this.scanInfo = scanInfo;
		this.selections = new Map();
		this.targetSelections = new Map();
		this.applicator = new LinkApplicator(app);

		// Pre-select all matches
		this.initializeSelections();
	}

	private initializeSelections(): void {
		for (const result of this.results) {
			for (let i = 0; i < result.matches.length; i++) {
				const matchId = this.getMatchId(result.noteFile.path, i);
				this.selections.set(matchId, true); // Pre-selected

				// Set default target (first one)
				const match = result.matches[i];
				if (match && match.targetNotes.length > 0) {
					const firstTarget = match.targetNotes[0];
					if (firstTarget) {
						this.targetSelections.set(matchId, firstTarget.path);
					}
				}
			}
		}
	}

	private getMatchId(notePath: string, matchIndex: number): string {
		return `${notePath}::${matchIndex}`;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('autolink-modal');

		// Header
		this.createHeader(contentEl);

		// Statistics
		this.createStatistics(contentEl);

		// Toolbar
		this.createToolbar(contentEl);

		// Results list
		this.createResultsList(contentEl);

		// Apply button
		this.createApplyButton(contentEl);
	}

	private createHeader(container: HTMLElement): void {
		const header = container.createDiv('autolink-modal-header');
		header.createEl('h2', { text: 'AutoLink - Select Links to Apply' });
		header.createEl('p', { text: `Scanned: ${this.scanInfo}` });
	}

	private createStatistics(container: HTMLElement): void {
		const totalMatches = this.results.reduce((sum, r) => sum + r.matches.length, 0);
		const totalNotes = this.results.length;

		const stats = container.createDiv('autolink-stats');
		stats.createEl('p', { 
			text: `Found ${totalMatches} unlinked reference${totalMatches === 1 ? '' : 's'} in ${totalNotes} note${totalNotes === 1 ? '' : 's'}` 
		});
	}

	private createToolbar(container: HTMLElement): void {
		const toolbar = container.createDiv('autolink-toolbar');

		new ButtonComponent(toolbar)
			.setButtonText('Select All')
			.onClick(() => this.selectAll(true));

		new ButtonComponent(toolbar)
			.setButtonText('Deselect All')
			.onClick(() => this.selectAll(false));
	}

	private createResultsList(container: HTMLElement): void {
		const listContainer = container.createDiv('autolink-results-list');

		for (const result of this.results) {
			this.createNoteSection(listContainer, result);
		}
	}

	private createNoteSection(container: HTMLElement, result: LinkFinderResult): void {
		const section = container.createDiv('autolink-note-section');

		// Note header (collapsible)
		const header = section.createDiv('autolink-note-header');
		const headerText = header.createEl('h3', { 
			text: `${result.noteFile.basename} (${result.matches.length} match${result.matches.length === 1 ? '' : 'es'})` 
		});
		headerText.style.cursor = 'pointer';

		// Matches container
		const matchesContainer = section.createDiv('autolink-matches-container');

		// Toggle collapse on click
		let collapsed = false;
		headerText.addEventListener('click', () => {
			collapsed = !collapsed;
			matchesContainer.style.display = collapsed ? 'none' : 'block';
			headerText.setText(
				`${collapsed ? '▶' : '▼'} ${result.noteFile.basename} (${result.matches.length} match${result.matches.length === 1 ? '' : 'es'})`
			);
		});

		// Initially expanded
		headerText.setText(`▼ ${result.noteFile.basename} (${result.matches.length} match${result.matches.length === 1 ? '' : 'es'})`);

		// Create match items
		result.matches.forEach((match, index) => {
			this.createMatchItem(matchesContainer, result, match, index);
		});
	}

	private async createMatchItem(
		container: HTMLElement,
		result: LinkFinderResult,
		match: LinkMatch,
		index: number
	): Promise<void> {
		const matchItem = container.createDiv('autolink-match-item');
		const matchId = this.getMatchId(result.noteFile.path, index);

		// Checkbox
		const checkboxContainer = matchItem.createDiv('autolink-match-checkbox');
		const checkbox = checkboxContainer.createEl('input', { type: 'checkbox' });
		checkbox.checked = this.selections.get(matchId) || false;
		checkbox.addEventListener('change', () => {
			this.selections.set(matchId, checkbox.checked);
		});

		// Context
		const contextContainer = matchItem.createDiv('autolink-match-context');
		
		// Get content to show context
		const content = await this.app.vault.read(result.noteFile);
		const context = ContentSanitizer.getContext(content, match.startPos, match.endPos, 40);
		
		contextContainer.createEl('span', { text: context.replace(/\*\*/g, '') }); // Remove markdown bold for now
		
		// Target selection (if multiple targets)
		if (match.targetNotes.length > 1) {
			const selectContainer = matchItem.createDiv('autolink-match-target');
			selectContainer.createEl('span', { text: '→ ' });
			
			const select = selectContainer.createEl('select');
			for (const targetNote of match.targetNotes) {
				const option = select.createEl('option', { 
					text: targetNote.basename,
					value: targetNote.path 
				});
				
				if (targetNote.path === this.targetSelections.get(matchId)) {
					option.selected = true;
				}
			}
			
			select.addEventListener('change', () => {
				this.targetSelections.set(matchId, select.value);
			});
		} else if (match.targetNotes.length === 1) {
			const targetContainer = matchItem.createDiv('autolink-match-target');
			targetContainer.createEl('span', { 
				text: `→ [[${match.targetNotes[0]?.basename || 'unknown'}]]`,
				cls: 'autolink-target-preview'
			});
		}
	}

	private createApplyButton(container: HTMLElement): void {
		const buttonContainer = container.createDiv('autolink-apply-container');

		new ButtonComponent(buttonContainer)
			.setButtonText('Apply Selected Links')
			.setCta()
			.onClick(() => this.applySelectedLinks());

		new ButtonComponent(buttonContainer)
			.setButtonText('Cancel')
			.onClick(() => this.close());
	}

	private selectAll(selected: boolean): void {
		this.selections.forEach((_, key) => {
			this.selections.set(key, selected);
		});

		// Update checkboxes in UI
		const checkboxes = this.contentEl.querySelectorAll<HTMLInputElement>('.autolink-match-checkbox input[type="checkbox"]');
		checkboxes.forEach(cb => cb.checked = selected);
	}

	private async applySelectedLinks(): Promise<void> {
		// Collect selected links
		const selections: LinkSelection[] = [];

		for (const result of this.results) {
			for (let i = 0; i < result.matches.length; i++) {
				const matchId = this.getMatchId(result.noteFile.path, i);
				const isSelected = this.selections.get(matchId);

				if (isSelected) {
					const match = result.matches[i];
					if (!match) continue;
					
					const firstTarget = match.targetNotes[0];
					if (!firstTarget) continue;
					
					const targetPath = this.targetSelections.get(matchId) || firstTarget.path;

					// Find the selected target note
					const selectedTarget = match.targetNotes.find(t => t.path === targetPath);

					if (selectedTarget) {
						selections.push({
							noteFile: result.noteFile,
							match: {
								...match,
								selectedTarget
							}
						});
					}
				}
			}
		}

		if (selections.length === 0) {
			return;
		}

		// Apply links
		await this.applicator.applyLinks(selections);

		// Close modal
		this.close();
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
