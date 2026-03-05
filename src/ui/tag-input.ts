/**
 * TagInput Component
 * 
 * Renders a tag-based input where items appear as pills/chips with remove buttons.
 * New tags can be added by typing and pressing Enter or comma.
 */

export class TagInput {
	private containerEl: HTMLElement;
	private tagsContainerEl: HTMLElement;
	private inputEl: HTMLInputElement;
	private tags: string[];
	private onChangeCallback: (tags: string[]) => void;

	constructor(containerEl: HTMLElement, onChange: (tags: string[]) => void) {
		this.containerEl = containerEl;
		this.onChangeCallback = onChange;
		this.tags = [];
		
		this.render();
	}

	private render(): void {
		this.containerEl.empty();
		this.containerEl.addClass('autolink-tag-input');

		// Container for tags and input
		this.tagsContainerEl = this.containerEl.createDiv('autolink-tag-container');

		// Render existing tags
		this.renderTags();

		// Create input field for new tags
		this.inputEl = this.tagsContainerEl.createEl('input', {
			type: 'text',
			cls: 'autolink-tag-input-field',
			attr: {
				placeholder: 'Neues Wort hinzufügen...'
			}
		});

		// Event listeners for input
		this.inputEl.addEventListener('keydown', this.handleKeyDown.bind(this));
		this.inputEl.addEventListener('blur', this.handleBlur.bind(this));
	}

	private renderTags(): void {
		// Remove existing tag elements (but keep input)
		const existingTags = this.tagsContainerEl.querySelectorAll('.autolink-tag-pill');
		existingTags.forEach(tag => tag.remove());

		// Render all tags before the input field
		this.tags.forEach((tag, index) => {
			const tagEl = this.tagsContainerEl.createDiv('autolink-tag-pill');
			
			// Tag text
			const textSpan = tagEl.createSpan('autolink-tag-text');
			textSpan.textContent = tag;

			// Remove button
			const removeBtn = tagEl.createSpan('autolink-tag-remove');
			removeBtn.textContent = '×';
			removeBtn.setAttribute('aria-label', `${tag} entfernen`);
			removeBtn.addEventListener('click', () => this.removeTag(index));

			// Insert before input field
			if (this.inputEl) {
				this.tagsContainerEl.insertBefore(tagEl, this.inputEl);
			} else {
				this.tagsContainerEl.appendChild(tagEl);
			}
		});
	}

	private handleKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter' || event.key === ',') {
			event.preventDefault();
			this.addTag();
		} else if (event.key === 'Backspace' && this.inputEl.value === '' && this.tags.length > 0) {
			// Remove last tag on backspace with empty input
			event.preventDefault();
			this.removeTag(this.tags.length - 1);
		}
	}

	private handleBlur(): void {
		// Add tag on blur if input is not empty
		if (this.inputEl.value.trim()) {
			this.addTag();
		}
	}

	private addTag(): void {
		const value = this.inputEl.value.trim();
		
		if (value === '') {
			return;
		}

		// Check for duplicates (case-insensitive)
		const lowerValue = value.toLowerCase();
		const isDuplicate = this.tags.some(tag => tag.toLowerCase() === lowerValue);
		
		if (isDuplicate) {
			this.inputEl.value = '';
			return;
		}

		// Add tag
		this.tags.push(value);
		this.inputEl.value = '';
		
		// Re-render and notify
		this.renderTags();
		this.notifyChange();
	}

	private removeTag(index: number): void {
		if (index >= 0 && index < this.tags.length) {
			this.tags.splice(index, 1);
			this.renderTags();
			this.notifyChange();
		}
	}

	private notifyChange(): void {
		if (this.onChangeCallback) {
			this.onChangeCallback([...this.tags]); // Pass a copy
		}
	}

	/**
	 * Set the current tags
	 */
	public setValue(tags: string[]): void {
		this.tags = [...tags]; // Store a copy
		this.renderTags();
	}

	/**
	 * Get the current tags
	 */
	public getValue(): string[] {
		return [...this.tags]; // Return a copy
	}

	/**
	 * Focus the input field
	 */
	public focus(): void {
		this.inputEl?.focus();
	}

	/**
	 * Clear all tags
	 */
	public clear(): void {
		this.tags = [];
		this.renderTags();
		this.notifyChange();
	}
}
