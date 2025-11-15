# Pattern Auto Tab Grouper - Chrome Extension

A Chrome extension that automatically groups tabs based on URL patterns with mid-pattern wildcard support.

## Project Overview

This is an enhanced fork of the original auto-group-tabs extension that adds support for mid-pattern wildcards (`*`) in URL matching rules, allowing for more flexible tab grouping patterns.

**Key Features:**
- Automatic tab grouping based on URL patterns
- Mid-pattern wildcard support (e.g., `https://github.com/*/issues`)
- Drag-and-drop group reordering (always enabled)
- Import/Export configuration
- Chrome group color support

## Technology Stack

- **Framework**: Vue 3 with Composition API (`<script setup>`)
- **Language**: TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest + Playwright
- **Drag-and-Drop**: vuedraggable
- **Chrome APIs**: chrome.tabs, chrome.tabGroups, chrome.storage

## Project Structure

```
auto-group-tabs/
├── src/
│   ├── components/
│   │   ├── Group.vue              # Individual group container
│   │   ├── GroupHeader.vue        # Group header with drag handle
│   │   ├── PatternList.vue        # List of URL patterns for a group
│   │   └── Dialog/
│   │       ├── EditDialog.vue     # Group creation/edit dialog
│   │       └── SettingsDialog.vue # Extension settings
│   ├── Options.vue                # Main options page
│   ├── Popup.vue                  # Browser action popup
│   ├── background.ts              # Background service worker
│   └── util/
│       ├── types.ts               # TypeScript type definitions
│       └── group-configurations.ts # Group config management
├── manifest.json                  # Chrome extension manifest
└── vite.config.ts                 # Build configuration
```

## Key Components

### Group.vue
Container component for a single group that:
- Displays GroupHeader with title, color, and drag handle
- Contains PatternList for URL pattern management
- Emits events for title, color, options, and matchers updates

### GroupHeader.vue
Header component that:
- Shows group title and color tag
- Provides drag handle for reordering (always visible with subtle opacity)
- Contains edit and add pattern buttons
- Opens EditDialog for group settings

### PatternList.vue
Manages URL patterns within a group:
- Input fields for URL patterns with validation
- Chrome match pattern info link
- Dynamic pattern addition/removal

### Options.vue
Main options page that:
- Uses vuedraggable for group reordering
- Manages group creation and deletion with undo stack
- Handles import/export functionality

## Development Guidelines

### Running the Project

```bash
# Install dependencies
npm install

# Development build with hot reload
npm run dev

# Production build
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

### Testing

- **Unit Tests**: Vitest tests in `__tests__/` directories
- **Browser Tests**: Playwright tests for Chrome extension API
- All tests must pass before committing

### Code Style

- Use Vue 3 Composition API with `<script setup>`
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- 2-space indentation
- Use `defineProps` and `defineEmits` for component contracts

### Chrome Extension Development

- Manifest V3 required
- Test in actual Chrome browser, not just dev server
- Use `chrome.tabs`, `chrome.tabGroups`, `chrome.storage` APIs
- Permissions: `tabs`, `tabGroups`, `storage`

## Version Update Process

1. Update version in `manifest.json`
2. Run `npm run build`
3. Create ZIP: `node create-zip.js`
4. Upload to Chrome Web Store Developer Dashboard
5. Wait for review (1-3 days)
6. Users auto-update within hours of approval

## Chrome Web Store

- **Publisher**: Aleg Malinovsky
- **Contact**: alegmal.dev@gmail.com
- **Store URL**: [Will be available after approval]

## Important Notes

### Drag-and-Drop UX
Groups are **always draggable** without needing to toggle a sort mode:
- Drag handle is always visible with low opacity (0.3)
- Opacity increases to 0.8 on hover for discoverability
- Uses `handle=".drag-handle"` with vuedraggable
- Patterns remain visible during group dragging

### URL Pattern Matching
- Uses Chrome match pattern syntax
- Supports mid-pattern wildcards: `https://github.com/*/issues`
- First matching pattern wins (order matters)
- Invalid patterns are highlighted with error message

### Multi-tenant Considerations
This is a single-user Chrome extension with no backend:
- Configuration stored in `chrome.storage.sync`
- No server-side processing
- No user authentication required

## Git Workflow

- Main branch: `main`
- Commit messages: Conventional Commits format preferred
- No force push to main (except for commit message cleanup)
- GitHub repository: `alegmal/pattern-auto-tab-grouper`

## Future Enhancements

Potential features to consider:
- Pattern drag-and-drop within groups
- Regex pattern support
- Tab session management
- Cloud sync across devices
- Dark mode theming

## Links

- [Original Project](https://github.com/JohnyTheCarrot/auto-group-tabs)
- [Chrome Match Patterns Documentation](https://developer.chrome.com/docs/extensions/mv3/match_patterns/)
- [Chrome Extension Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)

## Contact

For questions or issues, contact: alegmal.dev@gmail.com
