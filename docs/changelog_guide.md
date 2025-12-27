# Changelog Guide

This guide explains how to update the Changelog page for the Resourced application.

## Location
The changelog data is stored directly within the page component file:
`src/app/(main)/changelog/page.tsx`

## How to Add a New Entry

1.  Open `src/app/(main)/changelog/page.tsx`.
2.  Locate the `CHANGELOG_DATA` constant at the top of the file.
3.  Add a new object to the **beginning** of the array (so it appears first).

### Format
```javascript
{
    version: '1.1.0',       // The version number
    date: '2025-01-01',     // The release date
    content: `
+ Added a cool new feature
+ Improved performance
- Fixed a bug in the login flow
Check it out at https://example.com
`
}
```

## Formatting Syntax

The content string supports special formatting for each line:

*   **Green Text (Additions):** Start the line with a `+`.
    *   Example: `+ Added dark mode`
    *   Result: The line will be displayed in green.

*   **Red Text (Removals/Fixes):** Start the line with a `-`.
    *   Example: `- Removed legacy code`
    *   Result: The line will be displayed in red.

*   **Links:**
    *   Any text starting with `http://` or `https://` will be automatically converted into a clickable link.
    *   Example: `Read more at https://google.com`

*   **Author Tooltip:**
    *   Add `@AuthorName` at the very end of the line.
    *   The `@AuthorName` text will be hidden, but hovering over the line will show a tooltip saying "Author: AuthorName".
    *   Example: `+ Added new feature @johndoe`

*   **Normal Text:**
    *   Any line not starting with `+` or `-` will be displayed in standard gray text.
