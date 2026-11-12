/**
 * Links with `data-href-touch` use that URL on touch phones and their normal
 * href elsewhere. Used for Instagram: the ig.me DM link works in the app but
 * not on Instagram Web, so desktop gets the profile link.
 * Decided at click time, so it follows the device actually in use.
 */
const isTouchPhone = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

document.addEventListener('click', (event) => {
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-href-touch]');
  if (!link) return;
  const touch = link.dataset.hrefTouch;
  if (!touch) return;
  link.dataset.hrefDefault ??= link.getAttribute('href') ?? '';
  link.href = isTouchPhone() ? touch : link.dataset.hrefDefault;
});
