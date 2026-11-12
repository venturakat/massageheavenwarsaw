/**
 * Cookie consent (docs/behaviour/website.md → Cookies).
 * - The choice is stored in localStorage with a version number. Raise
 *   CONSENT_VERSION when the privacy policy changes: everyone sees the banner again.
 * - Funkcjonalne → the Google map iframe in Contact ([data-map]) loads; off → placeholder.
 * - Analityczne → no analytics tool yet. Hook for the developer: listen for the
 *   "mh:consent" event on window (detail = the choice) and start/stop analytics there.
 * - Nothing third-party loads before consent.
 */
export const CONSENT_VERSION = 1;
const STORAGE_KEY = 'mh-cookie-consent';
const BANNER_DELAY_MS = 800;

export type Consent = { version: number; functional: boolean; analytics: boolean; date: string };

export function readConsent(): Consent | null {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Consent | null;
    return stored && stored.version === CONSENT_VERSION ? stored : null;
  } catch {
    return null;
  }
}

function writeConsent(choice: { functional: boolean; analytics: boolean }): Consent {
  const consent: Consent = { version: CONSENT_VERSION, ...choice, date: new Date().toISOString() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Storage blocked (private mode): the choice still applies for this visit.
  }
  return consent;
}

// ── Map ──
function applyMap(enabled: boolean): void {
  document.querySelectorAll<HTMLElement>('[data-map]').forEach((map) => {
    const existing = map.querySelector('iframe');
    const placeholder = map.querySelectorAll<HTMLElement>('.map__static, .map__show');
    if (enabled && !existing && map.dataset.embedSrc) {
      const iframe = document.createElement('iframe');
      iframe.src = map.dataset.embedSrc;
      iframe.title = map.dataset.embedTitle ?? '';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      map.append(iframe);
    } else if (!enabled && existing) {
      existing.remove();
    }
    placeholder.forEach((el) => (el.hidden = enabled));
  });
}

function apply(consent: Consent): void {
  applyMap(consent.functional);
  syncSettings(consent);
  window.dispatchEvent(new CustomEvent<Consent>('mh:consent', { detail: consent }));
}

// ── Settings toggles ──
function syncSettings(consent: Consent | null): void {
  document.querySelectorAll<HTMLInputElement>('[data-consent-toggle]').forEach((toggle) => {
    const key = toggle.dataset.consentToggle as 'functional' | 'analytics';
    toggle.checked = consent?.[key] ?? false;
  });
}

function choiceFromSettings(): { functional: boolean; analytics: boolean } {
  const value = (key: string) =>
    document.querySelector<HTMLInputElement>(`[data-consent-toggle="${key}"]`)?.checked ?? false;
  return { functional: value('functional'), analytics: value('analytics') };
}

// ── Banner ──
const banner = () => document.querySelector<HTMLElement>('[data-cookie-banner]');

function hideBanner(): void {
  const el = banner();
  if (el) el.hidden = true;
}

function save(choice: { functional: boolean; analytics: boolean }): void {
  apply(writeConsent(choice));
  hideBanner();
  const settings = document.getElementById('cookie-settings');
  if (settings instanceof HTMLDialogElement && settings.open) settings.close();
}

document.addEventListener('click', (event) => {
  const button = (event.target as Element | null)?.closest<HTMLElement>('[data-consent]');
  if (!button) return;
  switch (button.dataset.consent) {
    case 'accept-all':
      save({ functional: true, analytics: true });
      break;
    case 'reject-all':
      save({ functional: false, analytics: false });
      break;
    case 'save':
      save(choiceFromSettings());
      break;
  }
});

// Opening the settings always shows the saved choice (unsaved toggles are discarded).
document.addEventListener(
  'close',
  (event) => {
    if ((event.target as HTMLElement).id === 'cookie-settings') syncSettings(readConsent());
  },
  true,
);

// ── Start ──
const stored = readConsent();
if (stored) {
  apply(stored);
} else {
  syncSettings(null);
  setTimeout(() => {
    const el = banner();
    if (el && !readConsent()) el.hidden = false;
  }, BANNER_DELAY_MS);
}
