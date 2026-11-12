/**
 * Keep the reader's place when switching language (/ → /en/ → /ua/).
 * On click: note the section currently under the header and how far into it the
 * page is scrolled; link to /xx/#section. After the new page loads: scroll to the
 * same offset inside that section. Works even when translations change lengths.
 */
const KEY = 'mh-lang-place';

const headerHeight = () => document.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 0;

function currentSection(): HTMLElement | null {
  const line = headerHeight() + 1;
  let current: HTMLElement | null = null;
  document.querySelectorAll<HTMLElement>('main section[id]').forEach((section) => {
    if (section.getBoundingClientRect().top <= line) current = section;
  });
  return current;
}

document.addEventListener('click', (event) => {
  const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-lang-link]');
  if (!link) return;
  const section = window.scrollY > 40 ? currentSection() : null;
  if (!section) {
    link.href = link.pathname;
    return;
  }
  const offset = Math.round(headerHeight() - section.getBoundingClientRect().top);
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ id: section.id, offset }));
  } catch {
    // Storage blocked: the #section anchor alone still lands at the section.
  }
  link.href = `${link.pathname}#${section.id}`;
});

// After arriving from a language switch.
try {
  const saved = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as { id: string; offset: number } | null;
  sessionStorage.removeItem(KEY);
  if (saved && location.hash === `#${saved.id}`) {
    const restore = () => {
      const section = document.getElementById(saved.id);
      if (!section) return;
      const top = section.getBoundingClientRect().top + window.scrollY - headerHeight() + saved.offset;
      window.scrollTo({ top, behavior: 'instant' });
    };
    if (document.readyState === 'complete') restore();
    else window.addEventListener('load', restore, { once: true });
  }
} catch {
  // Ignore unreadable storage.
}
