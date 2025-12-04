# Changelog

All notable changes to Pattern Auto Tab Grouper will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-12-04

### Added
- Delete buttons next to each URL pattern for easy removal
  - Hover effect changes color to red for clear feedback
  - Maintains visual alignment with existing patterns
- Always-visible pattern input field at the bottom of pattern lists
  - Users can immediately start typing new patterns
  - No need to press Enter on existing patterns to show input field

### Changed
- Removed conditional display logic for new pattern input
- Simplified blur handling for pattern inputs
- Improved keyboard navigation between pattern fields

### Technical
- Removed `showNewMatcherInput` and `justCreatedNewMatcher` state variables
- Removed `SlideVertical` animation component for pattern input
- Added invisible delete button placeholder for consistent alignment

## [1.0.0] - 2024-11-XX

### Added
- Initial release with mid-pattern wildcard support
- Automatic tab grouping based on URL patterns
- Support for wildcards (`*`) in the middle of URL patterns (e.g., `https://github.com/*/issues`)
- Drag-and-drop group reordering (always enabled, no toggle required)
- Import/Export configuration functionality
- Chrome group color support
- Pattern validation with Chrome match pattern syntax

### Features
- Browser action popup for quick pattern addition
- Full options page with group management
- Group creation and editing dialog
- Pattern list management with validation
- Undo functionality for group deletions

---

## Version History Summary

- **1.1.0**: Added delete buttons and always-visible pattern input
- **1.0.0**: Initial release with mid-pattern wildcard support

[1.1.0]: https://github.com/alegmal/pattern-auto-tab-grouper/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/alegmal/pattern-auto-tab-grouper/releases/tag/v1.0.0
