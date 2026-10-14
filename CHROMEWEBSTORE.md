# Chrome Web Store submission — YouTube Comments Closed

Last updated: October 14, 2026

Extension ID supplied by the publisher: `ecmhkbgdoeeicpohpleinhgmdfliedak`.
The draft URL did not open in the available browser; the answers below are
prepared from the current source and Google's published guidance. No draft
fields have been changed or submitted by the assistant.

## Package

Upload `youtube-comments-closed-1.0.1-webstore.zip` to the existing item's
Package tab. This adds the new icon to version 1.0.0 without changing comment
blocking behavior. The store ZIP has manifest.json at its root and excludes
test files, developer tools, private signing keys, and listing artwork.

## Store listing

**Name:** YouTube Comments Closed

**Short description:**

Keeps YouTube comments closed and gives the video its space back. Also hides comments below videos.

**Detailed description — paste this plain text:**

```text
YouTube Comments Closed keeps comments out of the way while you watch.

It automatically closes YouTube's comments side panel so the video gets its space back. It also hides comment sections below videos and comment previews.

The extension keeps working as you move between videos. Description, Ask, and Transcript panels remain available. It works independently and does not require another comment blocker.

Install the extension and reload any YouTube tabs that are already open. No settings or toolbar clicks are needed. To restore comments, disable the extension and reload YouTube.

Privacy: the extension checks YouTube's page structure locally to hide and close comments. It does not collect personal information, record your browsing history, store comment text, or send any data off your device. There are no accounts, analytics, tracking, or advertising.

The extension operates only on desktop youtube.com and www.youtube.com. YouTube layout changes may require an extension update.

Support: alast.andy@gmail.com

This is an independent extension and is not affiliated with YouTube or Google.
```

**Category:** Workflow & Planning (focus and fewer distractions).

**Language:** English.

**Mature content:** No. The extension adds no mature content.

**Support email:** alast.andy@gmail.com

**Support URL:** https://github.com/gnaservicesinc/musical-parakeet/issues

**Homepage URL:** https://github.com/gnaservicesinc/musical-parakeet

**Official URL:** Optional; leave blank unless you have a verified website.

## Privacy practices

### Single purpose — paste this

```text
Keep YouTube comments hidden and automatically close the comments side panel so the video regains its normal space.
```

### Host permission justification — paste this

```text
Access to youtube.com and www.youtube.com is required to identify and close YouTube's comments panel and hide comment sections below videos. These changes happen locally in the user's browser. Access is limited to those two YouTube hosts; the extension does not record browsing history, store comment text, or transmit page information.
```

The manifest has no Chrome API permissions or explicit host_permissions entry.
Its two content-script match patterns provide the YouTube site access needed
for automatic operation. If the dashboard asks for a host justification, use
the text above.

### Remote code

Select **No, I am not using remote code.** All executable code ships in the
extension package. It fetches no remote scripts and uses no remotely hosted
execution service.

### Data usage

Leave **every data-type checkbox unchecked**. The extension identifies interface
controls and checks whether the comments panel is open so it can close it. It
does not extract comment text, capture video content, collect account data,
record browsing history or user activity, or store or transmit user information.
Temporary references to interface controls and retry counters are operational
state, not a collection of website content or user information.

| Data type | Declaration |
|---|---|
| Personally identifiable information | No |
| Health information | No |
| Financial and payment information | No |
| Authentication information | No |
| Personal communications | No |
| Location | No |
| Web history | No |
| User activity | No |
| Website content | No |

Select all three data-use certifications; each matches the current source:

- No sale or transfer of user data to third parties outside approved uses.
- No use or transfer for purposes unrelated to the extension's single purpose.
- No use or transfer to determine creditworthiness or for lending purposes.

### Privacy policy URL

Leave this field blank for the current extension. It collects no user data.
The publisher does not want a privacy policy published, and none has been
published. The earlier local policy draft has been removed.

## Artwork

| Dashboard field | File | Required size |
|---|---|---|
| Store icon | store-icon-128.png | 128 × 128 PNG |
| Screenshot | screenshot-1280x800.png | 1280 × 800 PNG |
| Small promotional tile | small-promo-440x280.png | 440 × 280 PNG |
| Marquee promotional tile | marquee-1400x560.png | 1400 × 560 PNG; optional |

The screenshot is an actual signed-out desktop YouTube page with the extension
source running and the native comments panel closed. It is not an invented
interface. Promotional illustrations are separate from the screenshot.

## Distribution and publisher fields

- Price: Free — there is no payment feature.
- Visibility: Public for a discoverable release; Unlisted for sharing only by
  direct store link. Choose the audience you intend.
- Regions: All regions is suitable; the extension has no region restriction.
- Publisher name: Use your existing developer account's public publisher name.
- Contact email: alast.andy@gmail.com
- Account/trader status or business verification: Answer from your actual
  personal/business circumstances, not from the extension's source.

## Review test instructions — paste this

```text
No account or login credentials are required.

1. Install the extension and reload a desktop YouTube watch page.
2. Confirm that comments below the video and comment previews are hidden.
3. In a layout that offers the comments side panel, opening that panel should cause it to close automatically and release its reserved space.
4. Navigate to another video without reloading the whole site; comments should remain hidden and the side panel should still close automatically.
5. Description, Ask, and Transcript panels should remain usable where YouTube offers them.

No other comment-blocking extension is required. The extension runs only on https://youtube.com/* and https://www.youtube.com/*.
```

## Version history and validation

| Version | Date | Change | Status |
|---|---|---|---|
| 1.0.1 | 2026-10-14 | Added original store and extension icons; prepared listing artwork and no-collection disclosures | Prepared locally |
| 1.0.0 | 2026-10-14 | Standalone comment hiding and native panel closure | Draft reported by publisher |

Version 1.0.1 passed all 17 automated Chromium regression tests and a live native
closure check. No runtime JavaScript or CSS behavior changed from 1.0.0.

## Sources

- Privacy fields: https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- Local data processing: https://developer.chrome.com/docs/webstore/program-policies/user-data-faq
- Artwork requirements: https://developer.chrome.com/docs/webstore/images
- Categories: https://developer.chrome.com/docs/webstore/best-practices
- Listing fields: https://developer.chrome.com/docs/webstore/cws-dashboard-listing
