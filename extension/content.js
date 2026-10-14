(() => {
  "use strict";

  const PANEL_TAG = "ytd-engagement-panel-section-list-renderer";
  const COMMENTS = `${PANEL_TAG}[target-id="engagement-panel-comments-section"], ${PANEL_TAG}#engagement-panel-comments-section`;
  const EXPANDED = "ENGAGEMENT_PANEL_VISIBILITY_EXPANDED";
  const HIDDEN = "ENGAGEMENT_PANEL_VISIBILITY_HIDDEN";
  // Retrying covers a close button rendered before its event handler is ready.
  // Keep attempts bounded so a changed YouTube layout cannot cause a click loop.
  const RETRY_DELAYS = [100, 250, 500, 1000, 2000];
  const attempts = new WeakMap();
  let frame = 0;
  let retryTimer = 0;

  function closeControl(panel) {
    // Structural IDs work in every language. Never select a page-wide "Close"
    // button: Description, Ask, transcript, and dialogs have their own controls.
    const selectors = [
      "ytd-engagement-panel-title-header-renderer #visibility-button button",
      "ytd-engagement-panel-title-header-renderer #visibility-button [role='button']",
      "#header #close-button button",
      "#header button#close-button",
      "#header yt-icon-button#close-button",
    ];
    for (const selector of selectors) {
      const button = panel.querySelector(selector);
      if (button && !button.disabled && button.getAttribute("aria-disabled") !== "true") {
        return button;
      }
    }
    return null;
  }

  function closeComments() {
    frame = 0;
    clearTimeout(retryTimer);
    retryTimer = 0;
    let nextRetry = Infinity;

    for (const panel of document.querySelectorAll(COMMENTS)) {
      // CSS visibility/display is deliberately ignored. Another blocker can
      // hide the panel while YouTube still reserves an open column for it.
      if (panel.getAttribute("visibility") !== EXPANDED) {
        attempts.delete(panel);
        continue;
      }

      const button = closeControl(panel);
      if (!button) continue; // The observer will catch the lazily built header.
      let attempt = attempts.get(panel);
      if (!attempt || attempt.button !== button) {
        attempt = { button, count: 0, next: 0 };
        attempts.set(panel, attempt);
      }
      if (attempt.count > RETRY_DELAYS.length) continue;

      const now = performance.now();
      if (now >= attempt.next) {
        // Use YouTube's own action so its internal panel state, column width,
        // and player size all update together. Do not edit visibility ourselves.
        button.click();
        attempt.next = now + (RETRY_DELAYS[attempt.count] ?? Infinity);
        attempt.count += 1;
      }
      if (panel.getAttribute("visibility") === EXPANDED) {
        nextRetry = Math.min(nextRetry, Math.max(0, attempt.next - performance.now()));
      } else {
        attempts.delete(panel);
      }
    }

    if (Number.isFinite(nextRetry)) {
      retryTimer = setTimeout(scheduleClose, nextRetry);
    }
  }

  function scheduleClose() {
    if (!frame) frame = requestAnimationFrame(closeComments);
  }

  function pageReady() {
    // YouTube can reuse the same panel and button for the next video. A new
    // page readiness event starts a fresh bounded cycle after slow hydration.
    for (const panel of document.querySelectorAll(COMMENTS)) attempts.delete(panel);
    scheduleClose();
  }

  function hasPanel(node) {
    return node instanceof Element &&
      (node.matches(PANEL_TAG) || node.querySelector(PANEL_TAG) !== null);
  }

  const observer = new MutationObserver((records) => {
    let relevant = false;
    for (const record of records) {
      const target = record.target;
      if (!(target instanceof Element)) continue;
      if (record.type === "attributes") {
        if (target.matches(PANEL_TAG)) {
          // Handle reopening even if hidden -> expanded happens between frames.
          if ((record.attributeName === "visibility" && record.oldValue === HIDDEN) ||
              (["target-id", "id"].includes(record.attributeName) &&
               record.oldValue !== target.getAttribute(record.attributeName))) {
            attempts.delete(target);
          }
          relevant = true;
        } else {
          const panel = target.closest(COMMENTS);
          if (panel) {
            const button = attempts.get(panel)?.button;
            if (button === target && record.oldValue !== target.getAttribute(record.attributeName) &&
                (record.attributeName === "id" ||
                 (record.attributeName === "disabled" && !target.hasAttribute("disabled")) ||
                 (record.attributeName === "aria-disabled" && target.getAttribute("aria-disabled") !== "true"))) {
              attempts.delete(panel);
            }
            relevant = true;
          }
        }
      } else if (target.closest(COMMENTS) || Array.from(record.addedNodes).some(hasPanel)) {
        relevant = true;
      }
    }
    if (relevant) scheduleClose();
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ["visibility", "target-id", "id", "disabled", "aria-disabled"],
  });

  // The script is injected on all desktop YouTube routes, including Home, so
  // clicking through to a video does not depend on a full page reload.
  document.addEventListener("yt-navigate-finish", pageReady);
  document.addEventListener("yt-page-data-updated", pageReady);
  window.addEventListener("pageshow", pageReady);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) pageReady();
  });
  scheduleClose();
})();
