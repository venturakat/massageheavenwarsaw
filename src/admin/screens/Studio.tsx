/** Gabinet i rezerwacje (Figma 404:1238, channel drawer 494:5456; mobile 436:2841). */
import { useState } from 'preact/hooks';
import { useAdmin } from '../App';
import { Icon } from '../icons';
import { mediumDate, t } from '../format';
import type { Channel, DayKey, Locale, Localized, Studio } from '../types';
import { Button, Chips, Drawer, IconButton, LangSwitch, LinkButton, TextInput, Toggle, VisibleBox } from '../ui';

const DAYS: [DayKey, string][] = [
  ['mon', 'Poniedziałek'],
  ['tue', 'Wtorek'],
  ['wed', 'Środa'],
  ['thu', 'Czwartek'],
  ['fri', 'Piątek'],
  ['sat', 'Sobota'],
  ['sun', 'Niedziela'],
];
const setLoc = (l: Localized, locale: Locale, value: string): Localized => ({ ...l, [locale]: value });
/** "fresha.com/…/massage-heaven-warszawa-krucza-16-22" — short enough for one line. */
const shortUrl = (u: string) => {
  try {
    const url = new URL(u);
    const host = url.hostname.replace(/^www\./, '');
    const parts = url.pathname.split('/').filter(Boolean);
    const named = parts.find((p) => p.length > 12);
    if (parts.length > 2 && named) return `${host}/…/${named.replace(/-[a-z0-9]{8}$/, '')}`;
    return `${host}${url.pathname.replace(/\/$/, '')}`;
  } catch {
    return u;
  }
};

export function StudioScreen() {
  const { data, saveStudio, toast } = useAdmin();
  const [draft, setDraft] = useState<Studio>(data.studio);
  const [channel, setChannel] = useState<Channel | null>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(data.studio);
  const set = (patch: Partial<Studio>) => setDraft({ ...draft, ...patch });

  const save = async () => {
    await saveStudio(draft);
    toast('Zapisano. Zmiany widać na stronie od razu.');
  };

  return (
    <>
      <header class="page-head">
        <div class="page-head__text">
          <h1 class="page-title">
            Gabinet <em>i rezerwacje</em>
          </h1>
          <p class="muted">Adres, godziny i linki do rezerwacji. Zmieniasz raz, a aktualizuje się cała strona.</p>
        </div>
        <div class="page-head__actions">
          <Button onClick={save} disabled={!dirty}>
            Zapisz zmiany
          </Button>
        </div>
      </header>

      <div class="studio">
        <div class="studio__col">
          <section class="card card--pad stack-14" aria-labelledby="contact-title">
            <div class="card-head">
              <h2 class="h-card" id="contact-title">
                Dane kontaktowe
              </h2>
              <p class="small muted">Stopka, sekcja Kontakt, polityka prywatności.</p>
            </div>
            <div class="field-row field-row--address">
              <TextInput label="Adres" value={draft.address} onInput={(address) => set({ address })} />
              <TextInput label="Kod i miasto" value={draft.postcode} onInput={(postcode) => set({ postcode })} />
            </div>
            <div class="field-row">
              <TextInput label="Telefon / WhatsApp" type="tel" value={draft.phone} onInput={(phone) => set({ phone })} />
              <TextInput label="Instagram" value={draft.instagram} onInput={(instagram) => set({ instagram })} />
            </div>
            <TextInput label="Link do Google Maps" type="url" value={draft.googleMaps} onInput={(googleMaps) => set({ googleMaps })} />
          </section>

          <section class="card card--pad" aria-labelledby="channels-title">
            <div class="card-head">
              <h2 class="h-card" id="channels-title">
                Kanały rezerwacji
              </h2>
              <p class="small muted">Okienko „Zarezerwuj wizytę” na stronie.</p>
            </div>
            <ul class="channel-list">
              {draft.channels.map((c) => (
                <li class={`channel-row${c.visible ? '' : ' is-hidden'}`}>
                  <span class="channel-row__text">
                    <span class="body-medium">{c.title.pl}</span>
                    <span class="small muted">{c.id === 'whatsapp' ? `${shortUrl(c.url).split('?')[0]} · z gotową wiadomością` : shortUrl(c.url)}</span>
                  </span>
                  <Toggle checked={c.visible} label={`${c.title.pl}: widoczny w okienku`} onChange={(visible) => set({ channels: draft.channels.map((x) => (x.id === c.id ? { ...x, visible } : x)) })} />
                  <IconButton icon="pencil" label={`Edytuj: ${c.title.pl}`} onClick={() => setChannel(c)} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div class="studio__col">
          <section class="card card--pad" aria-labelledby="hours-title">
            <div class="card-head">
              <h2 class="h-card" id="hours-title">
                Godziny otwarcia
              </h2>
              <p class="small muted">Strona, wizytówka Google i tabliczka na drzwiach.</p>
            </div>
            <ul class="hours">
              {DAYS.map(([key, label]) => {
                const h = draft.hours[key];
                const setDay = (patch: Partial<typeof h>) => set({ hours: { ...draft.hours, [key]: { ...h, ...patch } } });
                return (
                  <li class={`hours__day${h.isOpen ? '' : ' is-closed'}`}>
                    <span class="body-medium hours__name">{label}</span>
                    {h.isOpen ? (
                      <>
                        <input class="time-input" type="text" inputMode="numeric" aria-label={`${label}: otwarcie`} value={h.open} onInput={(e) => setDay({ open: (e.target as HTMLInputElement).value })} />
                        <span class="muted" aria-hidden="true">
                          –
                        </span>
                        <input class="time-input" type="text" inputMode="numeric" aria-label={`${label}: zamknięcie`} value={h.close} onInput={(e) => setDay({ close: (e.target as HTMLInputElement).value })} />
                      </>
                    ) : (
                      <span class="muted hours__closed">nieczynne</span>
                    )}
                    <Toggle checked={h.isOpen} label={`${label}: otwarte`} onChange={(isOpen) => setDay({ isOpen })} />
                  </li>
                );
              })}
            </ul>
          </section>

          <section class="card card--pad stack-14" aria-labelledby="bar-title">
            <div class="card-head">
              <h2 class="h-card" id="bar-title">
                Pasek na górze strony
              </h2>
              <p class="small muted">Na co dzień adres. Włącz komunikat, gdy chcesz coś ogłosić.</p>
            </div>
            <p class="topbar-preview" aria-label="Podgląd paska">
              {draft.announcement.enabled && draft.announcement.text.pl ? draft.announcement.text.pl : `${draft.address.replace(/^ul\. /, '')} · ${draft.postcode.split(' ').slice(1).join(' ')}`}
            </p>
            <div class="field-row field-row--message">
              <TextInput label="Komunikat" value={draft.announcement.text.pl} onInput={(v) => set({ announcement: { ...draft.announcement, text: { ...draft.announcement.text, pl: v } } })} />
              <TextInput label="Pokazuj do" type="date" value={draft.announcement.until} onInput={(until) => set({ announcement: { ...draft.announcement, until } })} ariaLabel={`Pokazuj do: ${draft.announcement.until ? mediumDate(draft.announcement.until) : ''}`} />
            </div>
            <Toggle checked={draft.announcement.enabled} onChange={(enabled) => set({ announcement: { ...draft.announcement, enabled } })} label="Pokaż komunikat zamiast adresu" labelVisible />
          </section>
        </div>
      </div>

      {channel && (
        <ChannelDrawer
          key={channel.id}
          channel={channel}
          onClose={() => setChannel(null)}
          onSave={async (c) => {
            const next = { ...draft, channels: draft.channels.map((x) => (x.id === c.id ? c : x)) };
            setDraft(next);
            await saveStudio({ ...data.studio, channels: next.channels });
            setChannel(null);
            toast('Zapisano. Zmiany widać na stronie od razu.');
          }}
        />
      )}
    </>
  );
}

function ChannelDrawer({ channel, onClose, onSave }: { channel: Channel; onClose: () => void; onSave: (c: Channel) => void }) {
  const [draft, setDraft] = useState(channel);
  const [locale, setLocale] = useState<Locale>('pl');
  const icon = draft.group === 'online' ? 'clock' : 'chat';

  return (
    <Drawer
      open
      onClose={onClose}
      title="Edytuj"
      em="kanał"
      footer={
        <>
          <span class="drawer__note small muted">Zmiany widać na stronie od razu.</span>
          <Button variant="secondary" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={() => draft.title.pl.trim() && draft.url.trim() && onSave(draft)}>Zapisz</Button>
        </>
      }
    >
      <div class="lang-row">
        <LangSwitch value={locale} onChange={setLocale} />
        <span class="small muted">{locale === 'pl' ? 'Edytujesz wersję polską. Przełącz język, żeby zmienić podpis w EN i UA.' : 'Link jest wspólny dla wszystkich języków.'}</span>
      </div>
      <TextInput label="Nazwa w okienku" value={draft.title[locale] ?? ''} placeholder={draft.title.pl} onInput={(v) => setDraft({ ...draft, title: setLoc(draft.title, locale, v) })} />
      <div class="stack-10">
        <TextInput label="Link do rezerwacji" type="url" value={draft.url} onInput={(url) => setDraft({ ...draft, url })} />
        <LinkButton icon="external" href={draft.url}>
          Sprawdź link (otworzy się w nowej karcie)
        </LinkButton>
      </div>
      <TextInput label="Podpis pod nazwą" value={draft.hint[locale] ?? ''} placeholder={draft.hint.pl} onInput={(v) => setDraft({ ...draft, hint: setLoc(draft.hint, locale, v) })} />
      <div class="field">
        <span class="field__label">Grupa w okienku</span>
        <Chips
          label="Grupa w okienku"
          value={draft.group}
          onChange={(group) => setDraft({ ...draft, group })}
          options={[
            { value: 'online', label: 'Rezerwacja online' },
            { value: 'message', label: 'Napisz do nas' },
          ]}
        />
      </div>
      <VisibleBox checked={draft.visible} onChange={(visible) => setDraft({ ...draft, visible })} title="Widoczny w okienku rezerwacji" hint="Wyłącz, żeby schować kanał bez usuwania jego ustawień." />
      <div class="field">
        <span class="field__label">Podgląd w okienku „Zarezerwuj wizytę”</span>
        <div class="preview-panel">
          <div class="chooser-preview">
            <span class="label">{draft.group === 'online' ? 'Rezerwacja online' : 'Napisz do nas'}</span>
            <span class="chooser-preview__option">
              <span class="chooser-preview__icon">
                <Icon name={icon} />
              </span>
              <span class="chooser-preview__text">
                <span class="chooser-preview__title">{t(draft.title, locale)}</span>
                <span class="muted">{t(draft.hint, locale)}</span>
              </span>
              <Icon name="external" size={16} class="muted" />
            </span>
          </div>
        </div>
        <span class="small muted">Zmienia się na bieżąco, gdy edytujesz pola powyżej.</span>
      </div>
      <div class="info-box">
        <p class="body-medium">Rezerwacja u konkretnej osoby</p>
        <p class="small muted">Linki Booksy i Fresha do Anastazji i Iny zmieniasz w zakładce Zespół, przy każdej osobie.</p>
      </div>
    </Drawer>
  );
}
