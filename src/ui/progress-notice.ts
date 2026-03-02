import { Notice } from 'obsidian';

/**
 * A notice with a progress bar
 */
export class ProgressNotice {
	private notice: Notice;
	private messageEl: HTMLElement;
	private progressBarEl: HTMLElement;
	private progressFillEl: HTMLElement;

	constructor(message: string) {
		// Create a notice with indefinite timeout
		this.notice = new Notice('', 0);

		// Build the notice content
		const contentEl = this.notice.noticeEl;
		contentEl.empty();
		contentEl.addClass('autolink-progress-notice');

		// Message element
		this.messageEl = contentEl.createDiv('autolink-progress-message');
		this.messageEl.setText(message);

		// Progress bar container
		this.progressBarEl = contentEl.createDiv('autolink-progress-bar');
		this.progressFillEl = this.progressBarEl.createDiv('autolink-progress-fill');
		this.progressFillEl.style.width = '0%';
	}

	/**
	 * Updates the progress
	 */
	update(current: number, total: number, currentItem?: string): void {
		const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
		this.progressFillEl.style.width = `${percentage}%`;

		let message = `Scanning... ${current}/${total} (${percentage}%)`;
		if (currentItem) {
			message += `\nCurrent: ${currentItem}`;
		}

		this.messageEl.setText(message);
	}

	/**
	 * Updates just the message
	 */
	setMessage(message: string): void {
		this.messageEl.setText(message);
	}

	/**
	 * Dismisses the notice
	 */
	dismiss(): void {
		this.notice.hide();
	}
}
