/**
 * Re-apply hash scrolling after the page layout settles.
 *
 * On a HARD load of a URL with a #hash (e.g. .../signer/changelog.html#v1-72-0),
 * Docusaurus deliberately does not scroll — its scrollAfterNavigation() no-ops on
 * the initial render ("use native browser feature"). The browser then scrolls to
 * the anchor using the *pre-hydration* layout. On a long page the content above
 * the anchor grows by thousands of pixels as it finishes rendering, so the anchor
 * moves far down while the scroll position stays near the top — the reported bug.
 * Short pages appear to work only because the shift is small.
 *
 * onRouteDidUpdate DOES fire on the initial load (with previousLocation === null),
 * so we hook it and, when a hash is present, wait for the anchor's absolute
 * position to stop moving (layout settled) and then scroll it into view. This also
 * covers client-side navigations to a hash on a page that shifts after render.
 * scroll-margin-top on the headings keeps the fixed navbar from covering them.
 */

const MAX_TRIES = 120; // ~2s at 60fps — long enough for fonts/late layout shifts

// Keys that mean the reader is navigating the page themselves — back off if so.
const SCROLL_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar',
]);

// Scroll to the element for `rawHash` once its position is stable. Returns a
// cancel function so a newer navigation can abort an in-flight attempt.
function scrollToHashWhenSettled(rawHash) {
  const id = decodeURIComponent((rawHash || '').replace(/^#/, ''));
  if (!id) return null;

  let raf = 0;
  let tries = 0;
  let lastTop = NaN;
  let stableFrames = 0;
  let cancelled = false;

  const cleanup = () => {
    cancelAnimationFrame(raf);
    // Only real user input cancels — NOT the programmatic/native scrolls we and
    // the browser perform (those don't fire wheel/touch/keydown).
    window.removeEventListener('wheel', onUserInput);
    window.removeEventListener('touchmove', onUserInput);
    window.removeEventListener('keydown', onKeyDown);
  };
  const onUserInput = () => { cancelled = true; cleanup(); };
  const onKeyDown = (e) => { if (SCROLL_KEYS.has(e.key)) onUserInput(); };

  window.addEventListener('wheel', onUserInput, {passive: true});
  window.addEventListener('touchmove', onUserInput, {passive: true});
  window.addEventListener('keydown', onKeyDown);

  const tick = () => {
    if (cancelled) return;
    const el = document.getElementById(id);
    if (el) {
      const top = Math.round(el.getBoundingClientRect().top + window.scrollY);
      if (top === lastTop) stableFrames++;
      else { stableFrames = 0; lastTop = top; }
      if (stableFrames >= 2) { // anchor position steady → land on it
        el.scrollIntoView();
        cleanup();
        return;
      }
    }
    if (tries++ < MAX_TRIES) {
      raf = requestAnimationFrame(tick);
    } else {
      if (el) el.scrollIntoView(); // best effort if it never fully settled
      cleanup();
    }
  };
  raf = requestAnimationFrame(tick);

  return cleanup;
}

let cancelActive = null;

export function onRouteDidUpdate({location}) {
  if (typeof window === 'undefined') return;
  // A newer navigation supersedes any in-flight scroll attempt.
  if (cancelActive) { cancelActive(); cancelActive = null; }
  if (!location.hash) return;
  cancelActive = scrollToHashWhenSettled(location.hash);
}
