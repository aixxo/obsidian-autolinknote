import { TFile } from 'obsidian';

/**
 * Represents a single unlinked reference match found in a note
 */
export interface LinkMatch {
	/** The text that was matched (e.g., "JavaScript") */
	matchedText: string;
	/** Start position in the original content */
	startPos: number;
	/** End position in the original content */
	endPos: number;
	/** Potential target notes that this could link to */
	targetNotes: TFile[];
	/** The selected target note (for UI selection) */
	selectedTarget?: TFile;
}

/**
 * Result of scanning a single note for unlinked references
 */
export interface LinkFinderResult {
	/** The note that was scanned */
	noteFile: TFile;
	/** All matches found in this note */
	matches: LinkMatch[];
}

/**
 * Plugin settings interface
 */
export interface AutoLinkSettings {
	/** Whether matching should be case-sensitive */
	caseSensitive: boolean;
	/** Whether to include frontmatter aliases in matching */
	includeAliases: boolean;
	/** Minimum word length to consider for matching */
	minWordLength: number;
	/** Folders to exclude from scanning */
	excludeFolders: string[];
	/** Words that should never be linked (blacklist) */
	wordBlacklist: string[];
	/** Whether to exclude code blocks from scanning */
	excludeCodeBlocks: boolean;
	/** Whether to exclude URLs from scanning */
	excludeUrls: boolean;
	/** Whether to exclude frontmatter (YAML headers) from scanning */
	excludeFrontmatter: boolean;
	/** Whether to exclude headings from scanning */
	excludeHeadings: boolean;
	/** Whether to scan subfolders recursively when scanning a folder */
	recursiveFolderScan: boolean;
	/** Whether to show progress notifications during scanning */
	showProgress: boolean;
}

/**
 * Default plugin settings
 */
export const DEFAULT_SETTINGS: AutoLinkSettings = {
	caseSensitive: false,
	includeAliases: true,
	minWordLength: 3,
	excludeFolders: [],
	wordBlacklist: [],
	excludeCodeBlocks: true,
	excludeUrls: true,
	excludeFrontmatter: true,
	excludeHeadings: false,
	recursiveFolderScan: true,
	showProgress: true
};

/**
 * Scan scope types
 */
export type ScanScope = 'vault' | 'folder' | 'current-folder' | 'current-note';

/**
 * Options for scanning
 */
export interface ScanOptions {
	scope: ScanScope;
	folderPath?: string;
	recursive?: boolean;
}

/**
 * Serialized note data for worker communication
 */
export interface SerializedNote {
	path: string;
	basename: string;
	content: string;
	aliases: string[];
}

/**
 * Worker message types
 */
export interface WorkerMessage {
	type: 'scan' | 'progress' | 'complete' | 'error';
	data?: any;
}

/**
 * Progress information
 */
export interface ScanProgress {
	current: number;
	total: number;
	currentNotePath?: string;
}

/**
 * Link selection data for applying links
 */
export interface LinkSelection {
	noteFile: TFile;
	match: LinkMatch;
}

/**
 * Note info for indexing
 */
export interface NoteInfo {
	file: TFile;
	basename: string;
	aliases: string[];
	searchTerms: string[]; // basename + aliases
}
