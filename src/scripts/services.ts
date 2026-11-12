/**
 * Services behaviour (docs/behaviour/website.md → Services).
 * - Card click: open its panel (closing any other); click again or "Zwiń" to close.
 *   The page scrolls so the card + panel are in view.
 * - Search: filters treatment names, ignoring case and Polish diacritics.
 *   Results title uses Polish plurals (1 zabieg, 2–4 zabiegi, 5+ zabiegów).
 * - "No results" chips clear the search and open that category.
 */

/** Lowercase, strip diacritics (ą→a, ł→l, …). */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Polish plural form index: 0 = one, 1 = few (2–4, not 12–14), 2 = many. */
export function polishPlural(n: number): 0 | 1 | 2 {
  if (n === 1) return 0;
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastDigit >= 2 && lastDigit <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return 1;
  return 2;
}

/** Fill "{count} {zabieg|zabiegi|zabiegów} dla „{query}”". */
export function fillTemplate(template: string, values: { count?: number; query: string }): string {
  return template
    .replace(/\{([^{}|]+\|[^{}]+)\}/g, (_, forms: string) => forms.split('|')[polishPlural(values.count ?? 0)] ?? '')
    .replace(/\{count\}/g, String(values.count ?? ''))
    .replace(/\{query\}/g, values.query);
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initServices(root: HTMLElement): void {
  const cards = [...root.querySelectorAll<HTMLButtonElement>('[data-service-card]')];
  const panelFor = (card: HTMLButtonElement) => root.querySelector<HTMLElement>(`#${card.getAttribute('aria-controls')}`);
  const grid = root.querySelector<HTMLElement>('[data-grid]')!;
  const input = root.querySelector<HTMLInputElement>('[data-search-input]')!;
  const searchBox = root.querySelector<HTMLElement>('[data-search]')!;
  const inputClear = searchBox.querySelector<HTMLButtonElement>('[data-search-clear]')!;
  const results = root.querySelector<HTMLElement>('[data-results]')!;
  const resultsTitle = root.querySelector<HTMLElement>('[data-results-title]')!;
  const resultRows = [...root.querySelectorAll<HTMLElement>('[data-result]')];
  const empty = root.querySelector<HTMLElement>('[data-empty]')!;
  const emptyTitle = root.querySelector<HTMLElement>('[data-empty-title]')!;
  const status = root.querySelector<HTMLElement>('[data-search-status]')!;
  const searchIndex = resultRows.map((row) => normalise(row.dataset.name ?? ''));

  const scrollToCard = (card: HTMLElement) => {
    card.closest<HTMLElement>('.services__card')?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const setOpen = (card: HTMLButtonElement, open: boolean) => {
    card.setAttribute('aria-expanded', String(open));
    const panel = panelFor(card);
    if (panel) panel.hidden = !open;
  };

  const openCategory = (card: HTMLButtonElement) => {
    cards.forEach((c) => c !== card && setOpen(c, false));
    setOpen(card, true);
    scrollToCard(card);
  };

  const closeCategory = (card: HTMLButtonElement) => {
    setOpen(card, false);
    scrollToCard(card);
  };

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      if (card.getAttribute('aria-expanded') === 'true') closeCategory(card);
      else openCategory(card);
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-collapse]').forEach((button) => {
    button.addEventListener('click', () => {
      const card = cards.find((c) => c.getAttribute('aria-controls') === button.getAttribute('aria-controls'));
      if (card) {
        closeCategory(card);
        card.focus({ preventScroll: true });
      }
    });
  });

  // ── Search ──
  const runSearch = () => {
    const raw = input.value.trim();
    const query = normalise(raw);
    const active = query.length > 0;

    searchBox.classList.toggle('is-active', active);
    inputClear.hidden = !active;
    grid.hidden = active;

    if (!active) {
      results.hidden = true;
      empty.hidden = true;
      status.textContent = '';
      return;
    }

    let count = 0;
    resultRows.forEach((row, i) => {
      const match = searchIndex[i].includes(query);
      row.hidden = !match;
      if (match) count++;
    });

    results.hidden = count === 0;
    empty.hidden = count > 0;
    const title =
      count > 0
        ? fillTemplate(resultsTitle.dataset.template ?? '', { count, query: raw })
        : fillTemplate(emptyTitle.dataset.template ?? '', { query: raw });
    (count > 0 ? resultsTitle : emptyTitle).textContent = title;
    status.textContent = title;
  };

  const clearSearch = () => {
    input.value = '';
    runSearch();
  };

  input.addEventListener('input', runSearch);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && input.value) {
      event.preventDefault();
      clearSearch();
    }
  });
  root.querySelectorAll<HTMLButtonElement>('[data-search-clear]').forEach((button) => {
    button.addEventListener('click', () => {
      clearSearch();
      input.focus();
    });
  });

  root.querySelectorAll<HTMLButtonElement>('[data-open-category]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const card = cards.find((c) => c.getAttribute('aria-controls') === chip.dataset.openCategory);
      clearSearch();
      if (card) {
        openCategory(card);
        card.focus({ preventScroll: true });
      }
    });
  });

  // A search typed before the script loaded (or restored by the browser).
  if (input.value) runSearch();
}
