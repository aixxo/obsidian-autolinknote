import { App, FuzzySuggestModal } from 'obsidian';
import { LinkTargetGroup } from '../types';

/**
 * Modal for selecting which link target to remove
 * Shows grouped links with counts
 */
export class LinkTargetSelectionModal extends FuzzySuggestModal<LinkTargetGroup> {
	private groups: LinkTargetGroup[];
	private onChoose: (group: LinkTargetGroup) => void;

	constructor(
		app: App,
		groups: LinkTargetGroup[],
		onChoose: (group: LinkTargetGroup) => void
	) {
		super(app);
		this.groups = groups;
		this.onChoose = onChoose;
		
		// eslint-disable-next-line obsidianmd/ui/sentence-case
		this.setPlaceholder('search');
	}

	getItems(): LinkTargetGroup[] {
		return this.groups;
	}

	getItemText(group: LinkTargetGroup): string {
		const plural = group.fileCount === 1 ? 'datei' : 'dateien';
		return `[[${group.targetName}]] - ${group.totalCount} vorkommen in ${group.fileCount} ${plural}`;
	}

	onChooseItem(group: LinkTargetGroup, evt: MouseEvent | KeyboardEvent): void {
		this.onChoose(group);
	}
}
