# AutoLink Note

An Obsidian plugin that automatically finds unlinked references to note names and aliases throughout your vault, allowing you to quickly create links between related notes.

## Features

- **Flexible Scanning**: Scan your entire vault, select a specific folder, scan the current folder, or just the current note
- **Alias Support**: Optionally include note aliases in the search
- **Smart Filtering**: Filter matches by word length, exclude code blocks and URLs, and maintain blacklists for common words and tags
- **Tag-Based Exclusion**: Exclude files with specific tags from processing (e.g., skip all notes tagged with #draft or #archive)
- **Folder Exclusion**: Exclude entire folders from scanning with an intuitive folder picker
- **Recursive Folder Scanning**: Control whether to scan subfolders when targeting specific folders
- **Interactive Selection**: Review all potential links with context preview before applying them
- **Batch Application**: Apply multiple links at once across different notes
- **Case Sensitivity**: Choose between case-sensitive or case-insensitive matching

## Commands

The plugin provides eight commands:

### Link Creation Commands

1. **AutoLink: Scan entire vault for unlinked references** - Scans all notes in your vault for unlinked references
2. **AutoLink: Scan folder (choose from list)** - Opens a folder picker to select which folder to scan
3. **AutoLink: Scan current note's folder** - Scans notes in the same folder as the active note
4. **AutoLink: Scan current note only** - Scans only the currently active note

### Link Removal Commands

5. **AutoLink: Remove links from entire vault** - Removes specified links from all notes in your vault
6. **AutoLink: Remove links from folder (choose)** - Opens a folder picker to select which folder to remove links from
7. **AutoLink: Remove links from current note's folder** - Removes links from notes in the same folder as the active note
8. **AutoLink: Remove links from current note** - Removes links from the currently active note only

## Usage

### Creating Links

1. Open the command palette (`Ctrl/Cmd + P`)
2. Type "AutoLink" and select one of the scan commands
3. Wait for the scan to complete (progress is shown in a notice)
4. Review the found matches in the selection modal
5. Check the links you want to create
6. Click "Apply Selected Links" to create the links in your notes

### Removing Links

1. Open the command palette (`Ctrl/Cmd + P`)
2. Type "AutoLink" and select one of the "Remove links" commands
3. Enter the text you want to replace links with (or leave empty to remove completely)
4. Wait for the scan to find existing links
5. Review the found links in the selection modal
6. Check the links you want to remove/replace
7. Click "Apply Changes" to update your notes

## Settings

Configure the plugin behavior in **Settings → AutoLink Note**:

- **Case Sensitive**: Match note names with exact case
- **Include Aliases**: Search for note aliases in addition to note names
- **Minimum Word Length**: Only match words with at least this many characters
- **Exclude Code Blocks**: Skip matches within code blocks
- **Exclude URLs**: Skip matches within URLs
- **Exclude Frontmatter**: Skip matches within YAML frontmatter headers
- **Exclude Headings**: Skip matches within markdown headings
- **Recursive Folder Scan**: Include subfolders when scanning specific folders
- **Show Progress**: Display progress notifications during scanning
- **Word Blacklist**: Interactive tag-style list of common words to ignore (e.g., "the", "and", "or"). Add words by typing and pressing Enter or comma, remove with × button
- **Exclude Folders**: Visual list of folders to skip during scanning. Add folders using the folder picker, remove with × button
- **Tag Blacklist**: Interactive tag-style list of tags that exclude files from processing. Files with any of these tags (in frontmatter or inline) will be completely ignored during scanning. Supports both `#tag` and `tag` format

## Installation

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Create a folder named `autolink-note` in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into the new folder
4. Reload Obsidian
5. Enable "AutoLink Note" in Settings → Community plugins

### Development Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start compilation in watch mode
4. Copy `main.js`, `manifest.json`, and `styles.css` to your vault's `.obsidian/plugins/autolink-note/` directory
5. Reload Obsidian and enable the plugin

## Development

```bash
# Install dependencies
npm install

# Start development build (watch mode)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## How It Works

1. **Scanning**: The plugin collects notes based on your selected scope (vault/folder/current)
2. **Filtering**: Excludes notes in blacklisted folders and notes with blacklisted tags (from frontmatter or inline tags)
3. **Indexing**: Builds an index of note names and aliases to search for
4. **Matching**: Uses regex to find unlinked occurrences of note names in file contents
5. **Sanitization**: Excludes existing links, code blocks, URLs, and blacklisted words based on your settings
6. **Selection**: Displays matches with surrounding context for user review
7. **Application**: Replaces selected text with wiki-style links `[[note name]]`

## Credits

Inspired by [obsidian-note-linker](https://github.com/AlexW00/obsidian-note-linker) by AlexW00.

## License

MIT License - See LICENSE file for details.

