import { randomUUID } from 'node:crypto';

export const COMMENTS = 'engagement-panel-comments-section';
export const EXPANDED = 'ENGAGEMENT_PANEL_VISIBILITY_EXPANDED';
export const HIDDEN = 'ENGAGEMENT_PANEL_VISIBILITY_HIDDEN';

// These fixtures keep YouTube's close handler in the page's MAIN world. The
// extension loads normally in Chrome's ISOLATED world, just as it does for users.
export function fixtureHTML(options = {}) {
  const config = JSON.stringify({ panels: [{}], ...options }).replaceAll('<', '\\u003c');
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>YouTube comments regression fixture</title>
<style>
  body { margin: 24px; background: #111; color: white; font: 18px sans-serif; }
  #player { width: 1150px; height: 620px; background: #283a4c; }
  ytd-watch-flexy[comments-open] #player { width: 810px; }
  ytd-engagement-panel-section-list-renderer { display: block; position: absolute; top: 24px; left: 850px; width: 300px; background: #222; }
  ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_HIDDEN"] { display: none; }
  ytd-engagement-panel-title-header-renderer { display: flex; justify-content: space-between; padding: 16px; }
  ytd-comments, ytd-item-section-renderer { display: block; }
  button { font: inherit; }
</style></head><body>
<ytd-watch-flexy><main id="player">Video player</main><h1>Test video</h1>
<div id="inline-host"><ytd-comments id="comments"><p>Ordinary inline comments</p></ytd-comments></div>
<div id="panel-host"></div></ytd-watch-flexy>
<script>
(() => {
  const options = ${config};
  const ready = new WeakSet();
  window.closeCalls = [];
  window.closeAttempts = [];
  window.syntheticEvents = [];
  window.layoutChanges = [];
  window.hydratePanel = panel => ready.add(panel);
  const host = document.querySelector('#panel-host');
  const watch = document.querySelector('ytd-watch-flexy');

  window.updateLayout = () => {
    const open = [...host.querySelectorAll('ytd-engagement-panel-section-list-renderer')].some(panel =>
      (panel.getAttribute('target-id') === '${COMMENTS}' || panel.id === '${COMMENTS}') &&
      panel.getAttribute('visibility') === '${EXPANDED}');
    watch.toggleAttribute('comments-open', open);
    window.layoutChanges.push(open);
  };

  window.addCloseControl = (panel, classic = false, outsideHeader = false) => {
    let header = panel.querySelector('ytd-engagement-panel-title-header-renderer');
    if (!header) {
      header = document.createElement('ytd-engagement-panel-title-header-renderer');
      header.id = 'header';
      header.innerHTML = '<span>Comments</span>';
      panel.prepend(header);
    }
    const control = document.createElement(classic ? 'yt-icon-button' : 'div');
    control.id = classic ? 'close-button' : 'visibility-button';
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Close');
    button.textContent = '×';
    control.append(button);
    (outsideHeader ? panel : header).append(control);
    return button;
  };

  window.makePanel = (settings = {}) => {
    const panel = document.createElement('ytd-engagement-panel-section-list-renderer');
    panel.dataset.testKey = settings.key || 'comments';
    panel.setAttribute(settings.byId ? 'id' : 'target-id', settings.target || '${COMMENTS}');
    panel.setAttribute('visibility', settings.visibility || '${EXPANDED}');
    panel.innerHTML = '<div id="content"><ytd-comments><p>Side panel comments</p></ytd-comments></div>';
    if (settings.control !== false) {
      const button = window.addCloseControl(panel, settings.classic, settings.outsideHeader);
      button.disabled = Boolean(settings.disabled);
    }
    if (settings.legacyHidden) panel.style.setProperty('display', 'none', 'important');
    host.append(panel);
    if (settings.hydrationDelay) setTimeout(() => ready.add(panel), settings.hydrationDelay);
    else ready.add(panel);
    window.updateLayout();
    return panel;
  };

  document.addEventListener('click', event => {
    const button = event.target.closest('#visibility-button button, yt-icon-button#close-button button');
    const panel = button?.closest('ytd-engagement-panel-section-list-renderer');
    if (!panel) return;
    const key = panel.dataset.testKey;
    window.closeAttempts.push(key);
    if (!ready.has(panel)) return;
    const expanded = panel.getAttribute('visibility') === '${EXPANDED}';
    panel.setAttribute('visibility', expanded ? '${HIDDEN}' : '${EXPANDED}');
    window.closeCalls.push({ key, expanded });
    window.updateLayout();
  });

  // A generic "close panels" event could close unrelated Description/Ask panels.
  // Record it so tests require the native comments button path instead.
  for (const name of ['yt-command', 'yt-action', 'yt-engagement-panel-visibility-change']) {
    document.addEventListener(name, () => window.syntheticEvents.push(name));
  }
  for (const panel of options.panels) window.makePanel(panel);
  window.fixtureReady = true;
})();
</script></body></html>`;
}

export async function openFixture(context, t, options = {}, route = '/watch') {
  const page = await context.newPage();
  page.setDefaultTimeout(6000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route('https://www.youtube.com/**', request => request.fulfill({
    status: 200,
    contentType: 'text/html',
    body: fixtureHTML(options),
  }));
  await page.goto(`https://www.youtube.com${route}?fixture=${randomUUID()}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.fixtureReady === true);
  t.after(async () => {
    await page.close();
    if (errors.length) throw new Error(`Browser errors: ${errors.join('\n')}`);
  });
  return page;
}
