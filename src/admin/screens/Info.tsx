/**
 * Info & teksty (mobile tab: "Info"). Works like Zespół: a list of the parts of the website
 * on the left, in the order they appear on the page, and an editor for the selected one on
 * the right (#/info/<id>). On mobile the list and the editor are separate screens.
 * Replaces "Gabinet i rezerwacje" (Figma 404:1238, channel drawer 494:5456; mobile 436:2841).
 * Not drawn in Figma yet (docs/design/figma-todo.md); the layout follows Zespół (403:889).
 */
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { useAdmin } from '../App';
import { Icon } from '../icons';
import { mediumDate, t } from '../format';
import { LOCALES, type Channel, type DayKey, type Hours, type Locale, type Localized, type SiteTexts, type Studio } from '../types';
import { Button, Chips, Drawer, IconButton, LangSwitch, LinkButton, TextArea, TextInput, Toggle, VisibleBox } from '../ui';

const SAVED = 'Zapisano. Zmiany widać na stronie od razu.';
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
const topBarAddress = (s: Studio) => `${s.address.replace(/^ul\. /, '')} · ${s.postcode.split(' ').slice(1).join(' ')}`;

// ── Section text fields ───────────────────────────────────

type Path = (string | number)[];
/**
 * One editable text. `max` is a soft limit: going over shows a warning, it doesn't block saving.
 * Limits are estimates from the current copy (about 25% longer than the longest of PL/EN/UA);
 * check them against the Figma layout when the Figma sync is back.
 */
type FieldSpec = {
  path: Path;
  label: string;
  max: number;
  area?: boolean;
  group?: string;
  /** Several paragraphs in one field: a blank line (Enter twice) starts a new one on the site. */
  paragraphs?: boolean;
};
const countParagraphs = (v: string) => v.split(/\n\s*\n/).filter((p) => p.trim()).length;
const paragraphWord = (n: number) => (n === 1 ? 'akapit' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'akapity' : 'akapitów');
type SectionKey = keyof SiteTexts;

const titleFields = (max: number): FieldSpec[] => [
  { path: ['title', 0], label: 'Tytuł · linia 1', max },
  { path: ['title', 1], label: 'Tytuł · linia 2 (kursywą)', max },
];
const FIELDS: Record<SectionKey, FieldSpec[]> = {
  hero: [{ path: ['eyebrow'], label: 'Nadtytuł', max: 40 }, ...titleFields(18), { path: ['lead'], label: 'Opis', max: 200, area: true }],
  about: [
    { path: ['eyebrow'], label: 'Nadtytuł', max: 40 },
    ...titleFields(24),
    { path: ['text'], label: 'Tekst', max: 540, area: true, paragraphs: true },
    ...[0, 1, 2].flatMap((i) => [
      { path: ['features', i, 'title'], label: 'Tytuł', max: 24, group: `Wyróżnik ${i + 1}` },
      { path: ['features', i, 'text'], label: 'Opis', max: 70, group: `Wyróżnik ${i + 1}` },
    ]),
  ],
  gift: [{ path: ['eyebrow'], label: 'Nadtytuł', max: 40 }, ...titleFields(22), { path: ['text'], label: 'Opis', max: 260, area: true }],
  contact: [{ path: ['eyebrow'], label: 'Nadtytuł', max: 40 }, ...titleFields(22)],
};

const getAt = (o: unknown, path: Path): Localized => path.reduce<any>((x, k) => x[k], o); // eslint-disable-line @typescript-eslint/no-explicit-any
function setAt<T>(o: T, path: Path, value: Localized): T {
  const copy = structuredClone(o);
  const parent = path.slice(0, -1).reduce<any>((x, k) => x[k], copy); // eslint-disable-line @typescript-eslint/no-explicit-any
  parent[path[path.length - 1]] = value;
  return copy;
}
/** EN/UA when at least one text of the section is missing in that language. */
const missingLangs = (section: object, fields: FieldSpec[]) => LOCALES.filter((l) => l !== 'pl' && fields.some((f) => !getAt(section, f.path)[l]?.trim()));

// ── The list ──────────────────────────────────────────────

type ItemId = 'pasek' | 'start' | 'o-nas' | 'bon' | 'kontakt' | 'dane' | 'godziny' | 'rezerwacje';
type Item = { id: ItemId; title: string; em?: string; where: string; section?: SectionKey };

/** In the order they appear on the website, top to bottom. */
const ITEMS: Item[] = [
  { id: 'pasek', title: 'Pasek', em: 'na górze strony', where: 'Nad menu, na każdej stronie.' },
  { id: 'start', title: 'Start', em: 'strony', where: 'Pierwszy ekran, z przyciskiem „Zarezerwuj wizytę”.', section: 'hero' },
  { id: 'o-nas', title: 'O', em: 'nas', where: 'Sekcja pod cennikiem, ze zdjęciem gabinetu.', section: 'about' },
  { id: 'bon', title: 'Bon', em: 'podarunkowy', where: 'Sekcja z przyciskiem „Zamów bon”.', section: 'gift' },
  { id: 'kontakt', title: 'Kontakt', where: 'Ostatnia sekcja, obok mapy. Adres i Instagram zmieniasz w „Dane kontaktowe”.', section: 'contact' },
  { id: 'dane', title: 'Dane', em: 'kontaktowe', where: 'Sekcja Kontakt, stopka i polityka prywatności. Wspólne dla wszystkich języków.' },
  { id: 'godziny', title: 'Godziny', em: 'otwarcia', where: 'Strona, wizytówka Google i tabliczka na drzwiach.' },
  { id: 'rezerwacje', title: 'Okienko', em: 'rezerwacji', where: 'Otwiera się z każdego przycisku „Zarezerwuj”.' },
];

export function InfoScreen({ itemId }: { itemId?: string }) {
  const { data } = useAdmin();
  const studio = data.studio;
  const selected = ITEMS.find((i) => i.id === itemId) ?? (window.matchMedia('(min-width: 1024px)').matches ? ITEMS[0] : undefined);
  const hasSelection = !!itemId && !!selected;

  const subtitle = (item: Item): string => {
    if (item.section) {
      const sec = data.texts[item.section];
      const missing = missingLangs(sec, FIELDS[item.section]);
      const title = `${sec.title[0].pl} ${sec.title[1].pl}`;
      return missing.length ? `${title} · brak ${missing.map((l) => l.toUpperCase()).join(', ')}` : title;
    }
    switch (item.id) {
      case 'pasek':
        return studio.announcement.enabled && studio.announcement.text.pl.trim()
          ? `Komunikat${studio.announcement.until ? ` do ${mediumDate(studio.announcement.until)}` : ''}`
          : 'Pokazuje adres';
      case 'dane':
        return `${studio.address} · ${studio.phone}`;
      case 'godziny': {
        const open = DAYS.filter(([k]) => studio.hours[k].isOpen).length;
        return `Otwarte ${open} dni w tygodniu`;
      }
      default: {
        const visible = studio.channels.filter((c) => c.visible).length;
        return visible === studio.channels.length ? `${visible} kanały, wszystkie widoczne` : `Widoczne kanały: ${visible} z ${studio.channels.length}`;
      }
    }
  };

  return (
    <>
      <header class={`page-head${hasSelection ? ' team-hide-mobile' : ''}`}>
        <div class="page-head__text">
          <h1 class="page-title">
            Info <em>& teksty</em>
          </h1>
          <p class="muted">Wszystko na stronie poza cennikiem, zespołem i FAQ, w kolejności od góry strony. Zmieniasz słowa, układ sekcji zostaje ten sam.</p>
        </div>
      </header>

      <div class={`team${hasSelection ? ' has-selection' : ''}`}>
        <div class="team__list">
          <ol class="stack-12">
            {ITEMS.map((item, i) => (
              <li class={`person-item${item.id === selected?.id ? ' is-active' : ''}`}>
                <a class="person-item__link" href={`#/info/${item.id}`} aria-current={item.id === selected?.id ? 'true' : undefined}>
                  <span class="info-item__num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span class="person-item__text">
                    <span class="body-medium">
                      {item.title} {item.em}
                    </span>
                    <span class="small muted info-item__sub">{subtitle(item)}</span>
                  </span>
                  <Icon name="chevronRight" />
                </a>
              </li>
            ))}
          </ol>
          <p class="small muted">Kolejność jak na stronie, od góry.</p>
        </div>

        {selected && <Editor key={selected.id} item={selected} />}
      </div>
    </>
  );
}

function Editor({ item }: { item: Item }) {
  if (item.section) return <TextsEditor item={item} section={item.section} />;
  if (item.id === 'pasek') return <TopBarEditor item={item} />;
  if (item.id === 'dane') return <ContactEditor item={item} />;
  if (item.id === 'godziny') return <HoursEditor item={item} />;
  return <ChannelsEditor item={item} />;
}

/** The editor card: the same layout as the person editor in Zespół. */
function EditorCard({
  item,
  locale,
  onLocale,
  dirty,
  onReset,
  onSave,
  note,
  children,
}: {
  item: Item;
  locale?: Locale;
  onLocale?: (l: Locale) => void;
  dirty?: boolean;
  onReset?: () => void;
  onSave?: () => void;
  note?: string;
  children: ComponentChildren;
}) {
  return (
    <section class="card person-editor" aria-labelledby="info-editor-title">
      <div class="person-editor__head">
        <a class="back-link team-show-mobile" href="#/info">
          ← Info & teksty
        </a>
        <div class="info-editor__title">
          <h2 class="h-card" id="info-editor-title">
            {item.title} {item.em && <em>{item.em}</em>}
          </h2>
          <p class="small muted">{item.where}</p>
        </div>
        {locale && onLocale && <LangSwitch value={locale} onChange={onLocale} />}
      </div>
      <div class="person-editor__body">
        <div class="person-editor__fields">{children}</div>
      </div>
      <div class="person-editor__footer">
        {dirty && onReset && (
          <LinkButton muted onClick={onReset}>
            Cofnij zmiany
          </LinkButton>
        )}
        <span class="small muted">{note ?? 'Zmiany widać na stronie od razu po zapisaniu.'}</span>
        {onSave && <Button onClick={onSave}>Zapisz zmiany</Button>}
      </div>
    </section>
  );
}

/** Text field with a soft character limit. */
function CountedField({ spec, value, placeholder, onInput }: { spec: FieldSpec; value: string; placeholder?: string; onInput: (v: string) => void }) {
  const length = value.length;
  const over = length > spec.max;
  return (
    <div class="counted">
      {spec.area ? (
        <TextArea label={spec.label} value={value} placeholder={placeholder} onInput={onInput} rows={spec.paragraphs ? 9 : spec.max > 240 ? 5 : 3} />
      ) : (
        <TextInput label={spec.label} value={value} placeholder={placeholder} onInput={onInput} error={over} />
      )}
      <div class="counted__meta">
        {spec.paragraphs && <span class="small muted">Pusta linia (2 × Enter) zaczyna nowy akapit na stronie.</span>}
        <span class={`counted__count small${over ? ' is-over' : ' muted'}`} aria-live="polite">
          {spec.paragraphs && value.trim() ? `${countParagraphs(value)} ${paragraphWord(countParagraphs(value))} · ` : ''}
          {over ? `Za długie o ${length - spec.max} zn. Może się nie zmieścić w układzie strony.` : `${length} / ${spec.max}`}
        </span>
      </div>
    </div>
  );
}

// ── Editors ───────────────────────────────────────────────

function TextsEditor({ item, section }: { item: Item; section: SectionKey }) {
  const { data, saveTexts, toast } = useAdmin();
  const fields = FIELDS[section];
  const saved = data.texts[section];
  const [draft, setDraft] = useState(saved);
  const [locale, setLocale] = useState<Locale>('pl');
  const [tried, setTried] = useState(false);
  const missingPl = fields.filter((f) => !getAt(draft, f.path).pl.trim());

  const save = async () => {
    setTried(true);
    if (missingPl.length) {
      setLocale('pl');
      return;
    }
    await saveTexts({ ...data.texts, [section]: draft });
    toast(SAVED);
  };

  let lastGroup: string | undefined;
  return (
    <EditorCard item={item} locale={locale} onLocale={setLocale} dirty={JSON.stringify(draft) !== JSON.stringify(saved)} onReset={() => setDraft(saved)} onSave={save}>
      <p class="small muted">{locale === 'pl' ? 'Wersja polska. Puste pola w EN i UA pokażą na stronie tekst polski.' : 'Puste pole pokaże na stronie tekst polski (widać go jako podpowiedź).'}</p>

      <div class="preview-panel text-preview" aria-label="Podgląd nagłówka">
        <span class="label label--plum">{t(getAt(draft, ['eyebrow']), locale)}</span>
        <p class="text-preview__title">
          {t(getAt(draft, ['title', 0]), locale)}
          <br />
          <em>{t(getAt(draft, ['title', 1]), locale)}</em>
        </p>
      </div>

      {fields.map((f) => {
        const value = getAt(draft, f.path);
        const groupHead = f.group && f.group !== lastGroup ? <p class="info-editor__group body-medium">{f.group}</p> : null;
        lastGroup = f.group;
        return (
          <>
            {groupHead}
            <CountedField spec={f} value={value[locale] ?? ''} placeholder={locale === 'pl' ? undefined : value.pl} onInput={(v) => setDraft(setAt(draft, f.path, setLoc(value, locale, v)))} />
          </>
        );
      })}

      {tried && missingPl.length > 0 && (
        <p class="form-error small" role="alert">
          Uzupełnij po polsku: {missingPl.map((f) => (f.group ? `${f.group} · ${f.label}` : f.label)).join(', ')}.
        </p>
      )}
    </EditorCard>
  );
}

function TopBarEditor({ item }: { item: Item }) {
  const { data, saveStudio, toast } = useAdmin();
  const saved = data.studio.announcement;
  const [draft, setDraft] = useState(saved);
  const [locale, setLocale] = useState<Locale>('pl');
  const preview = draft.enabled && draft.text.pl.trim() ? t(draft.text, locale) : topBarAddress(data.studio);

  return (
    <EditorCard
      item={item}
      locale={locale}
      onLocale={setLocale}
      dirty={JSON.stringify(draft) !== JSON.stringify(saved)}
      onReset={() => setDraft(saved)}
      onSave={async () => {
        await saveStudio({ ...data.studio, announcement: draft });
        toast(SAVED);
      }}
    >
      <p class="small muted">Na co dzień pasek pokazuje adres. Włącz komunikat, gdy chcesz coś ogłosić, np. że gabinet jest nieczynny w święta.</p>
      <p class="topbar-preview" aria-label="Podgląd paska">
        {preview}
      </p>
      <div class="field-row field-row--message">
        <TextInput label="Komunikat" value={draft.text[locale] ?? ''} placeholder={locale === 'pl' ? undefined : draft.text.pl} onInput={(v) => setDraft({ ...draft, text: setLoc(draft.text, locale, v) })} />
        <TextInput label="Pokazuj do" type="date" value={draft.until} onInput={(until) => setDraft({ ...draft, until })} ariaLabel={`Pokazuj do: ${draft.until ? mediumDate(draft.until) : ''}`} />
      </div>
      <VisibleBox checked={draft.enabled} onChange={(enabled) => setDraft({ ...draft, enabled })} title="Pokaż komunikat zamiast adresu" hint="Po dacie „Pokazuj do” pasek wróci do adresu." />
    </EditorCard>
  );
}

function ContactEditor({ item }: { item: Item }) {
  const { data, saveStudio, toast } = useAdmin();
  const s = data.studio;
  const saved = { address: s.address, postcode: s.postcode, phone: s.phone, instagram: s.instagram, googleMaps: s.googleMaps };
  const [draft, setDraft] = useState(saved);
  const set = (patch: Partial<typeof draft>) => setDraft({ ...draft, ...patch });
  return (
    <EditorCard
      item={item}
      dirty={JSON.stringify(draft) !== JSON.stringify(saved)}
      onReset={() => setDraft(saved)}
      onSave={async () => {
        await saveStudio({ ...data.studio, ...draft });
        toast(SAVED);
      }}
    >
      <div class="field-row field-row--address">
        <TextInput label="Adres" value={draft.address} onInput={(address) => set({ address })} />
        <TextInput label="Kod i miasto" value={draft.postcode} onInput={(postcode) => set({ postcode })} />
      </div>
      <div class="field-row">
        <TextInput label="Telefon / WhatsApp" type="tel" value={draft.phone} onInput={(phone) => set({ phone })} />
        <TextInput label="Instagram" value={draft.instagram} onInput={(instagram) => set({ instagram })} />
      </div>
      <div class="stack-10">
        <TextInput label="Link do Google Maps" type="url" value={draft.googleMaps} onInput={(googleMaps) => set({ googleMaps })} />
        <LinkButton icon="external" href={draft.googleMaps}>
          Sprawdź link (otworzy się w nowej karcie)
        </LinkButton>
      </div>
    </EditorCard>
  );
}

function HoursEditor({ item }: { item: Item }) {
  const { data, saveStudio, toast } = useAdmin();
  const saved = data.studio.hours;
  const [hours, setHours] = useState<Hours>(saved);
  return (
    <EditorCard
      item={item}
      dirty={JSON.stringify(hours) !== JSON.stringify(saved)}
      onReset={() => setHours(saved)}
      onSave={async () => {
        await saveStudio({ ...data.studio, hours });
        toast(SAVED);
      }}
    >
      <ul class="hours">
        {DAYS.map(([key, label]) => {
          const h = hours[key];
          const setDay = (patch: Partial<typeof h>) => setHours({ ...hours, [key]: { ...h, ...patch } });
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
    </EditorCard>
  );
}

function ChannelsEditor({ item }: { item: Item }) {
  const { data, saveStudio, toast } = useAdmin();
  const studio = data.studio;
  const [channel, setChannel] = useState<Channel | null>(null);
  return (
    <EditorCard item={item} note="Przełącznik chowa kanał od razu. Ołówek otwiera ustawienia kanału.">
      <ul class="channel-list">
        {studio.channels.map((c) => (
          <li class={`channel-row${c.visible ? '' : ' is-hidden'}`}>
            <span class="channel-row__text">
              <span class="body-medium">{c.title.pl}</span>
              <span class="small muted">{c.id === 'whatsapp' ? `${shortUrl(c.url).split('?')[0]} · z gotową wiadomością` : shortUrl(c.url)}</span>
            </span>
            <Toggle
              checked={c.visible}
              label={`${c.title.pl}: widoczny w okienku`}
              onChange={async (visible) => {
                await saveStudio({ ...studio, channels: studio.channels.map((x) => (x.id === c.id ? { ...x, visible } : x)) });
                toast(visible ? `${c.title.pl} widać w okienku rezerwacji.` : `${c.title.pl} schowany z okienka rezerwacji.`);
              }}
            />
            <IconButton icon="pencil" label={`Edytuj: ${c.title.pl}`} onClick={() => setChannel(c)} />
          </li>
        ))}
      </ul>
      <div class="info-box">
        <p class="body-medium">Rezerwacja u konkretnej osoby</p>
        <p class="small muted">Linki Booksy i Fresha do Anastazji i Iny zmieniasz w zakładce Zespół, przy każdej osobie.</p>
      </div>
      {channel && (
        <ChannelDrawer
          key={channel.id}
          channel={channel}
          onClose={() => setChannel(null)}
          onSave={async (c) => {
            await saveStudio({ ...studio, channels: studio.channels.map((x) => (x.id === c.id ? c : x)) });
            setChannel(null);
            toast(SAVED);
          }}
        />
      )}
    </EditorCard>
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
    </Drawer>
  );
}
