# Pattern Auto Tab Grouper

Enhanced version of [auto-group-tabs](https://github.com/loilo/auto-group-tabs) with support for **mid-pattern wildcards** in URL matching.

Google Chrome extension that automatically adds tabs to configured groups based on URL patterns.

## ✨ What's New

This enhanced fork adds powerful pattern matching capabilities:

- ✅ **Mid-pattern wildcards**: Use patterns like `example.*.com` and `012345678909-*.console.aws.amazon.com`
- ✅ **Multiple wildcards**: Support patterns like `*.example.*.com` for complex matching
- ✅ **Exact level matching**: Each `*` matches exactly one subdomain level
- ✅ **Full backward compatibility**: All existing patterns continue to work

### Use Cases

Perfect for:
- **AWS/GCP Console users** with multiple accounts (e.g., `123456789-*.console.aws.amazon.com`)
- **Developers** working across environments (e.g., `dev.*.company.com`, `staging.*.company.com`)
- **Power users** managing many similar domains with dynamic subdomains

### Pattern Examples

| Pattern | Matches | Doesn't Match |
|---------|---------|---------------|
| `example.*.com` | `example.foo.com` | `example.com`, `example.foo.bar.com` |
| `*.example.*.com` | `sub.example.foo.com` | `example.foo.com`, `sub.example.com` |
| `012345678909-*.console.aws.amazon.com` | `012345678909-askjfe.console.aws.amazon.com` | `012345678909.console.aws.amazon.com` |
| `example.*.*.domain.com` | `example.a.b.domain.com` (2 levels) | `example.a.domain.com` (1 level) |

All original patterns still work:
- `*.example.com` - Any subdomain (including `example.com` itself)
- `example.com` - Exact domain match
- `*://example.com` - Any protocol (http or https)
- `example.com/path/*` - Path wildcards

## 📋 Original Project

This extension is based on [auto-group-tabs](https://github.com/loilo/auto-group-tabs) by Florian Reuschel.

**Original work** Copyright (c) 2021 Florian Reuschel
**Modified work** Copyright (c) 2025 Aleg Malinovsky

Licensed under the MIT License - See [LICENSE](LICENSE) for details.

### Changes from Original
- Added support for asterisk wildcards in the middle of hostname patterns
- Each asterisk matches exactly one subdomain level (e.g., `example.*.com`)
- Updated pattern validation and regex generation logic
- Maintained full backward compatibility with existing patterns
- Comprehensive test coverage for new functionality

## Development

This project is built with [Vue](https://v3.vuejs.org/) and [Vite](https://vitejs.dev/).

### Setup

Clone this project:

```bash
git clone https://github.com/alegmalinovsky/pattern-auto-tab-grouper.git
cd pattern-auto-tab-grouper
```

Install [npm](https://www.npmjs.com/) dependencies:

```bash
npm ci
```

### Development of the Options UI

The fastest way to tinker with the extension's options page is to run the `dev` script:

```bash
npm run dev
```

This will start up the Vite dev server and serve the options page on [localhost:6655](http://localhost:6655/). Having the options page directly in the browser allows for hot module reloading during development.

In this mode, Chrome extension APIs accessed during production (e.g. `chrome.i18n` and `chrome.storage`) use browser-based fallbacks.

> **Note:** Use the [device toolbar](https://developers.google.com/web/tools/chrome-devtools/device-mode) of Chrome's devtools to give the options page a proper viewport. Chrome's options overlays are 400px wide.

### Testing in Chrome

To test the extension in Chrome, do a production build:

```bash
npm run build
```

This creates an `extension` subfolder which can be loaded in Chrome:

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `extension` folder

### Running Tests

Run the test suite:

```bash
npm test
```

This runs:
- TypeScript type checking
- ESLint code quality checks
- Unit tests (Vitest)
- Browser tests (Playwright)

## Technical Implementation

### Files Modified

The mid-pattern wildcard support required changes to:

1. **`src/util/helpers.ts`** - Pattern validation regex
   - Simplified host validation to accept asterisks anywhere
   - Removed restriction that only allowed `*.hostname` format

2. **`src/util/matcher-regex.ts`** - Regex generation logic
   - Added logic to split hostname on asterisks
   - Each `*` is converted to `[^./]+` (matches one subdomain level)
   - Special handling for `*.hostname` to maintain backward compatibility

3. **Test files** - Comprehensive test coverage
   - Added tests for mid-pattern wildcards
   - Tests for exact level matching behavior
   - Backward compatibility verification

### Pattern Conversion

Example: `example.*.*.domain.com`
1. Split on asterisks: `['example.', '.', '.domain.com']`
2. Escape regex special chars: `['example\\.', '\\.', '\\.domain\\.com']`
3. Join with single-level pattern: `example\.[^./]+\.[^./]+\.domain\.com`
4. Result matches exactly 2 levels between "example" and "domain"

## License

MIT License

Original work Copyright (c) 2021 Florian Reuschel
Modified work Copyright (c) 2025 Aleg Malinovsky

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Contributing

This is a personal fork. For the original project, see [loilo/auto-group-tabs](https://github.com/loilo/auto-group-tabs).

Issues and pull requests for the mid-pattern wildcard functionality are welcome on this repository.

## Links

- **This Repository**: https://github.com/alegmalinovsky/pattern-auto-tab-grouper
- **Original Project**: https://github.com/loilo/auto-group-tabs
- **Original Issue**: https://github.com/loilo/auto-group-tabs/issues/54
- **Chrome Extension Documentation**: https://developer.chrome.com/docs/extensions/
