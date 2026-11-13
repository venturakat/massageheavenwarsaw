/** Admin panel app: hash routing, session, layout (sidebar on desktop, app bar + tab bar on mobile). */
import { createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { api, resetPrototypeData } from './api';
import { Icon, type IconName } from './icons';
import { statusOf } from './format';
import type { AdminData, Category, FaqItem, Person, SiteTexts, Studio, Voucher } from './types';
import { ConfirmDialog, Toast, type ToastData } from './ui';
import logoWhite from '../assets/brand/logo-white.svg?url';
import { Login } from './screens/Login';
import { Vouchers } from './screens/Vouchers';
import { VoucherDetail } from './screens/VoucherDetail';
import { Pricing } from './screens/Pricing';
import { Team } from './screens/Team';
import { Faq } from './screens/Faq';
import { InfoScreen } from './screens/Info';

// ── Routing ───────────────────────────────────────────────

const readRoute = () => location.hash.replace(/^#\/?/, '') || 'bony';
export const go = (route: string) => (location.hash = `#/${route}`);

function useRoute() {
  const [route, setRoute] = useState(readRoute());
  useEffect(() => {
    const on = () => {
      setRoute(readRoute());
      window.scrollTo(0, 0);
      document.querySelector<HTMLElement>('.main')?.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

// ── Shared state ──────────────────────────────────────────

type Ctx = {
  data: AdminData;
  saveVoucher: (v: Voucher) => Promise<void>;
  deleteVoucher: (id: string) => Promise<void>;
  saveCategories: (c: Category[]) => Promise<void>;
  saveTeam: (t: Person[]) => Promise<void>;
  saveFaq: (f: FaqItem[]) => Promise<void>;
  saveStudio: (s: Studio) => Promise<void>;
  saveTexts: (t: SiteTexts) => Promise<void>;
  toast: (message: string, action?: ToastData['action']) => void;
};
const AdminContext = createContext<Ctx>(null as unknown as Ctx);
export const useAdmin = () => useContext(AdminContext);

const NAV: { route: string; label: string; short: string; icon: IconName }[] = [
  { route: 'bony', label: 'Bony podarunkowe', short: 'Bony', icon: 'gift' },
  { route: 'cennik', label: 'Cennik', short: 'Cennik', icon: 'list' },
  { route: 'zespol', label: 'Zespół', short: 'Zespół', icon: 'users' },
  { route: 'faq', label: 'FAQ', short: 'FAQ', icon: 'help' },
  { route: 'info', label: 'Info & teksty', short: 'Info', icon: 'pin' },
];

export function App() {
  const route = useRoute();
  const [user, setUser] = useState<{ name: string; role: string } | null | undefined>(undefined);
  const [data, setData] = useState<AdminData | null>(null);
  const [toastData, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    api.session().then(setUser);
  }, []);
  useEffect(() => {
    if (user) api.load().then(setData);
  }, [user]);

  if (user === undefined) return null;
  const loginRoutes = ['logowanie', 'reset', 'reset/wyslano'];
  if (!user || loginRoutes.includes(route)) {
    return (
      <Login
        route={loginRoutes.includes(route) ? route : 'logowanie'}
        onLoggedIn={() => {
          api.session().then((u) => {
            setUser(u);
            go('bony');
          });
        }}
      />
    );
  }
  if (!data) return null;

  const toast: Ctx['toast'] = (message, action) => setToast({ id: Date.now(), message, action });
  const saver =
    <T,>(key: keyof AdminData, fn: (x: T) => Promise<void>) =>
    async (x: T) => {
      await fn(x);
      setData(await api.load());
      void key;
    };
  const ctx: Ctx = {
    data,
    toast,
    saveVoucher: saver('vouchers', api.saveVoucher),
    deleteVoucher: saver('vouchers', api.deleteVoucher),
    saveCategories: saver('categories', api.saveCategories),
    saveTeam: saver('team', api.saveTeam),
    saveFaq: saver('faq', api.saveFaq),
    saveStudio: saver('studio', api.saveStudio),
    saveTexts: saver('texts', api.saveTexts),
  };

  const [rawSection, sub] = route.split('/');
  const section = rawSection === 'gabinet' ? 'info' : rawSection; // old address of "Info & teksty"
  const newCount = data.vouchers.filter((v) => statusOf(v) === 'nowy').length;
  const logout = async () => {
    await api.logout();
    setUser(null);
    go('logowanie');
  };

  let screen;
  switch (section) {
    case 'cennik':
      screen = <Pricing />;
      break;
    case 'zespol':
      screen = <Team personId={sub} />;
      break;
    case 'faq':
      screen = <Faq />;
      break;
    case 'info':
      screen = <InfoScreen itemId={sub} />;
      break;
    default:
      screen = sub ? <VoucherDetail id={sub} /> : <Vouchers />;
  }

  return (
    <AdminContext.Provider value={ctx}>
      <div class="shell">
        <a class="skip-link" href="#main">
          Przejdź do treści
        </a>
        {/* Desktop sidebar (Figma 395:89) */}
        <nav class="sidebar" aria-label="Panel gabinetu">
          <div class="sidebar__brand">
            <img src={logoWhite} alt="Massage Heaven" width="150" height="28" />
            <span class="label">Panel gabinetu</span>
          </div>
          {NAV.map((n) => (
            <a class={`nav-item${section === n.route ? ' is-active' : ''}`} href={`#/${n.route}`} aria-current={section === n.route ? 'page' : undefined}>
              <Icon name={n.icon} />
              <span>{n.label}</span>
              {n.route === 'bony' && newCount > 0 && (
                <span class="nav-item__badge" aria-label={`${newCount} nowe`}>
                  {newCount}
                </span>
              )}
            </a>
          ))}
          <span class="sidebar__spacer" />
          <a class="nav-item" href="/" target="_blank" rel="noopener">
            <Icon name="external" />
            <span>Zobacz stronę</span>
          </a>
          <div class="sidebar__user">
            <span class="avatar" aria-hidden="true">
              {user.name[0]}
            </span>
            <span class="sidebar__name">
              <span>{user.name}</span>
              <span class="small">{user.role}</span>
            </span>
            <button type="button" class="sidebar__logout" aria-label="Wyloguj" title="Wyloguj" onClick={logout}>
              <Icon name="logout" />
            </button>
          </div>
        </nav>

        {/* Mobile app bar (Figma 429:1562) */}
        <header class="appbar">
          <img src={logoWhite} alt="Massage Heaven — panel gabinetu" width="132" height="24" />
          <div class="appbar__actions">
            <a class="appbar__btn" href="/" target="_blank" rel="noopener" aria-label="Zobacz stronę">
              <Icon name="external" />
            </a>
            <button type="button" class="appbar__btn" aria-label="Wyloguj" onClick={logout}>
              <Icon name="logout" />
            </button>
          </div>
        </header>

        <main class="main" id="main">
          <DemoNotice />
          {screen}
        </main>

        {/* Mobile tab bar (Figma 429:1486) */}
        <nav class="tabbar" aria-label="Panel gabinetu">
          {NAV.map((n) => (
            <a class={`tab${section === n.route ? ' is-active' : ''}`} href={`#/${n.route}`} aria-current={section === n.route ? 'page' : undefined}>
              <span class="tab__icon">
                <Icon name={n.icon} />
                {n.route === 'bony' && newCount > 0 && <span class="tab__badge">{newCount}</span>}
              </span>
              <span>{n.short}</span>
            </a>
          ))}
        </nav>
      </div>
      <Toast toast={toastData} onDone={() => setToast(null)} />
    </AdminContext.Provider>
  );
}

/** Prototype only — remove when the real back end is connected. */
function DemoNotice() {
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <p class="demo-notice">
      Prototyp: przykładowe dane, zmiany zapisują się tylko w tej przeglądarce i nie trafiają na stronę.{' '}
      <button type="button" onClick={() => setConfirmReset(true)}>
        Przywróć dane startowe
      </button>
      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetPrototypeData();
          location.reload();
        }}
        title="Przywrócić"
        em="dane startowe?"
        message="Wszystkie Twoje zmiany w prototypie znikną z tej przeglądarki, a panel wróci do treści ze strony i przykładowych bonów."
        confirmLabel="Tak, przywróć"
      />
    </p>
  );
}
