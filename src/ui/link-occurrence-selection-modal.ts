import { App, Modal, ButtonComponent } from 'obsidian';
import { LinkTargetGroup, LinkOccurrence, LinkRemovalSelection } from '../types';

/**
 * Modal for selecting which occurrences of a link to remove/replace
 */
export class LinkOccurrenceSelectionModal extends Modal {
	private targetGroup: LinkTargetGroup;
	private onApply: (selections: LinkRemovalSelection[]) => void;
	private selections: Map<string, boolean>; // occurrenceId -> selected
	private replacementInput: HTMLInputElement | null = null;

	constructor(
		app: App,
		targetGroup: LinkTargetGroup,
		onApply: (selections: LinkRemovalSelection[]) => void
	) {
		super(app);
		this.targetGroup = targetGroup;
		this.onApply = onApply;
		this.selections = new Map();

		// Pre-select all occurrences
		this.initializeSelections();
	}

	private initializeSelections(): void {
		for (const occurrence of this.targetGroup.occurrences) {
			const occurrenceId = this.getOccurrenceId(occurrence);
			this.selections.set(occurrenceId, true); // Pre-selected
		}
	}

	private getOccurrenceId(occurrence: LinkOccurrence): string {
		return `${occurrence.noteFile.path}::${occurrence.link.startPos}`;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('autolink-modal');

		// Header
		this.createHeader(contentEl);

		// Statistics
		this.createStatistics(contentEl);

		// Replacement text input
		this.createReplacementInput(contentEl);

		// Toolbar
		this.createToolbar(contentEl);

		// Occurrences list
		this.createOccurrencesList(contentEl);

		// Apply button
		this.createApplyButton(contentEl);
	}

	private createHeader(container: HTMLElement): void {
		const header = container.createDiv('autolink-modal-header');
		header.createEl('h2', { text: `Vorkommen von [[${this.targetGroup.targetName}]]` });
	}

	private createStatistics(container: HTMLElement): void {
		const stats = container.createDiv('autolink-stats');
		const fileWord = this.targetGroup.fileCount === 1 ? 'datei' : 'dateien';
		stats.createEl('p', { 
			text: `${this.targetGroup.totalCount} vorkommen in ${this.targetGroup.fileCount} ${fileWord}` 
		});
	}

	private createReplacementInput(container: HTMLElement): void {
		const inputSection = container.createDiv('autolink-replacement-section');
		inputSection.createEl('label', { 
			text: 'Ersatztext:', 
			cls: 'autolink-replacement-label' 
		});
		
		this.replacementInput = inputSection.createEl('input', {
			type: 'text',
			placeholder: 'Ersatztext eingeben...',
			cls: 'autolink-replacement-input'
		});
		
		// Default value is the target name (without brackets)
		this.replacementInput.value = this.targetGroup.targetName;
		this.replacementInput.select(); // Select text for easy editing
	}

	private createToolbar(container: HTMLElement): void {
		const toolbar = container.createDiv('autolink-toolbar');

		new ButtonComponent(toolbar)
			.setButtonText('Select all')
			.onClick(() => this.selectAll(true));

		new ButtonComponent(toolbar)
			.setButtonText('Deselect all')
			.onClick(() => this.selectAll(false));
	}

	private createOccurrencesList(container: HTMLElement): void {
		const listContainer = container.createDiv('autolink-results-list');

		// Group occurrences by file
		const groupedByFile = this.groupOccurrencesByFile();

		for (const occurrences of groupedByFile.values()) {
			const noteFile = occurrences[0]?.noteFile;
			if (!noteFile) continue;
			
			this.createFileSection(listContainer, noteFile.basename, occurrences);
		}
	}

	private groupOccurrencesByFile(): Map<string, LinkOccurrence[]> {
		const grouped = new Map<string, LinkOccurrence[]>();

		for (const occurrence of this.targetGroup.occurrences) {
			const path = occurrence.noteFile.path;
			if (!grouped.has(path)) {
				grouped.set(path, []);
			}
			grouped.get(path)!.push(occurrence);
		}

		return grouped;
	}

	private createFileSection(
		container: HTMLElement,
		filename: string,
		occurrences: LinkOccurrence[]
	): void {
		const section = container.createDiv('autolink-note-section');

		// File header (collapsible)
		const header = section.createDiv('autolink-note-header');
		const headerText = header.createEl('h3', { 
			text: `${filename} (${occurrences.length} vorkommen)`
		});

		// Occurrences container
		const occurrencesContainer = section.createDiv('autolink-matches-container');

		// Toggle collapse on click
		let collapsed = false;
		headerText.addEventListener('click', () => {
			collapsed = !collapsed;
			occurrencesContainer.style.display = collapsed ? 'none' : 'block';
			headerText.setText(
				`${collapsed ? '▶' : '▼'} ${filename} (${occurrences.length} vorkommen)`
			);
		});

		// Initially expanded
		headerText.setText(`▼ ${filename} (${occurrences.length} vorkommen)`);

		// Create occurrence items
		occurrences.forEach((occurrence) => {
			this.createOccurrenceItem(occurrencesContainer, occurrence);
		});
	}

	private createOccurrenceItem(
		container: HTMLElement,
		occurrence: LinkOccurrence
	): void {
		const occurrenceItem = container.createDiv('autolink-match-item');
		const occurrenceId = this.getOccurrenceId(occurrence);

		// Checkbox
		const checkboxContainer = occurrenceItem.createDiv('autolink-match-checkbox');
		const checkbox = checkboxContainer.createEl('input', { type: 'checkbox' });
		checkbox.checked = this.selections.get(occurrenceId) || false;
		checkbox.addEventListener('change', () => {
			this.selections.set(occurrenceId, checkbox.checked);
		});

		// Context with bold highlighting
		const contextContainer = occurrenceItem.createDiv('autolink-match-context');
		
		// Render context with bold parts
		this.renderContextSafe(contextContainer, occurrence.context);
	}

	private renderContextSafe(container: HTMLElement, context: string): void {
		// Split by **bold** markers and render safely
		const parts = context.split(/\*\*/);
		parts.forEach((part, index) => {
			if (index % 2 === 0) {
				// Regular text
				container.appendText(part);
			} else {
				// Bold text
				container.createEl('strong', { text: part });
			}
		});
	}

	private createApplyButton(container: HTMLElement): void {
		const buttonContainer = container.createDiv('autolink-apply-container');

		new ButtonComponent(buttonContainer)
			.setButtonText('Replace selected links')
			.setCta()
			.onClick(() => this.applySelectedReplacements());

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

	private applySelectedReplacements(): void {
		// Get replacement text
		const replacementText = this.replacementInput?.value || '';

		// Collect selected occurrences
		const selections: LinkRemovalSelection[] = [];

		for (const occurrence of this.targetGroup.occurrences) {
			const occurrenceId = this.getOccurrenceId(occurrence);
			const isSelected = this.selections.get(occurrenceId);

			if (isSelected) {
				selections.push({
					occurrence,
					replacementText
				});
			}
		}

		if (selections.length === 0) {
			return;
		}

		// Call the callback
		this.onApply(selections);

		// Close modal
		this.close();
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
