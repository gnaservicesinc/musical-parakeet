# YouTube Comments Closed

A standalone Chrome extension that keeps YouTube comments out of the way.
It closes the comments panel using YouTube's own close button, allowing YouTube
to restore the video width. It also hides comments below videos and comment
previews. NoComment or any other blocker is not required.

## Install

1. Open `chrome://extensions` in Chrome and enable **Developer mode**.
2. Click **Load unpacked** and select the `extension` folder in this repository
   (or the `YouTube Comments Closed` folder from the supplied ZIP).
3. Reload any YouTube tabs that were already open.

You can remove NoComment once this extension is loaded. No settings or toolbar
clicks are needed. To turn comments back on, disable this extension and reload
the YouTube tab.

The extension runs only on desktop `youtube.com` and `www.youtube.com`. It closes
the comments engagement panel, including the panel used by desktop Shorts,
on initial load, navigation between videos, and reopening. Other panels such as
Description, Ask, and Transcript remain available. It uses no network requests,
storage, analytics, background worker, or additional Chrome API permissions.

## Development

The installable extension is entirely contained in `extension/`. Source files
are unbundled and require no build step. Run `npm ci`, `npx playwright install chromium`,
and `npm test` for the browser
regression suite. The tests use an isolated temporary browser profile and local
YouTube-shaped fixtures; they do not use your Chrome profile or account.

Run `npm run package` to create an installable folder and ZIP in `dist/`.

YouTube can change its markup. Closing currently relies on the comments panel's
stable identifier and native header close control. The script never forces
layout widths or edits YouTube's panel-state attributes. If the native control
has not loaded yet, it waits for hydration and retries briefly.
