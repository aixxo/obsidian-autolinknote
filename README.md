# AutoLink Note

An Obsidian plugin that automatically finds unlinked references to note names and aliases throughout your vault, allowing you to quickly create links between related notes.

## Features

- **Flexible Scanning**: Scan your entire vault, select a specific folder, scan the current folder, or just the current note
- **Alias Support**: Optionally include note aliases in the search
- **Smart Filtering**: Filter matches by word length, exclude code blocks and URLs, and maintain a blacklist of common words
- **Recursive Folder Scanning**: Control whether to scan subfolders when targeting specific folders
- **Interactive Selection**: Review all potential links with context preview before applying them
- **Batch Application**: Apply multiple links at once across different notes
- **Case Sensitivity**: Choose between case-sensitive or case-insensitive matching

## Commands

The plugin provides four commands:

1. **AutoLink: Scan entire vault** - Scans all notes in your vault for unlinked references
2. **AutoLink: Scan folder (select)** - Opens a folder picker to select which folder to scan
3. **AutoLink: Scan current folder** - Scans notes in the same folder as the active note
4. **AutoLink: Scan current note** - Scans only the currently active note

## Usage

1. Open the command palette (`Ctrl/Cmd + P`)
2. Type "AutoLink" and select one of the scan commands
3. Wait for the scan to complete (progress is shown in a notice)
4. Review the found matches in the selection modal
5. Check the links you want to create
6. Click "Apply Selected Links" to create the links in your notes

## Settings

Configure the plugin behavior in **Settings → AutoLink Note**:

- **Case Sensitive**: Match note names with exact case
- **Include Aliases**: Search for note aliases in addition to note names
- **Minimum Word Length**: Only match words with at least this many characters
- **Exclude Code Blocks**: Skip matches within code blocks
- **Exclude URLs**: Skip matches within URLs
- **Recursive Folder Scan**: Include subfolders when scanning specific folders
- **Show Progress**: Display progress notifications during scanning
- **Word Blacklist**: Comma-separated list of common words to ignore
- **Exclude Folders**: Comma-separated list of folder paths to skip during scanning

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
2. **Indexing**: Builds an index of note names and aliases to search for
3. **Matching**: Uses regex to find unlinked occurrences of note names in file contents
4. **Sanitization**: Excludes existing links, code blocks, and URLs based on your settings
5. **Selection**: Displays matches with surrounding context for user review
6. **Application**: Replaces selected text with wiki-style links `[[note name]]`

## Credits

Inspired by [obsidian-note-linker](https://github.com/AlexW00/obsidian-note-linker) by AlexW00.

## License

MIT License - See LICENSE file for details.

