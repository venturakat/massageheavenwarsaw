/** FAQ (Figma 403:1064; drawers 498:7272 edit, 454:3343 add; mobile 436:2537). */
import { useState } from 'preact/hooks';
import { useAdmin } from '../App';
import { hasTranslation } from '../format';
import type { FaqItem, Locale, Localized } from '../types';
import { Button, ConfirmDialog, Drawer, Grip, IconButton, LangPills, LangSwitch, LinkButton, Select, TextArea, TextInput, Toggle, VisibleBox, useReorder } from '../ui';

const setLoc = (l: Localized, locale: Locale, value: string): Localized => ({ ...l, [locale]: value });
const done = (it: FaqItem) => ({ pl: true, en: hasTranslation(it.q, 'en') && hasTranslation(it.a, 'en'), ua: hasTranslation(it.q, 'ua') && hasTranslation(it.a, 'ua') });

export function Faq() {
  const { data, saveFaq, toast } = useAdmin();
  const [editing, setEditing] = useState<FaqItem | 'new' | null>(null);
  const reorder = useReorder(data.faq, (faq) => saveFaq(faq));

  return (
    <>
      <header class="page-head">
        <div class="page-head__text">
          <h1 class="page-title">FAQ</h1>
          <p class="muted">Pytania z sekcji „Przed pierwszą wizytą”. Przeciągnij, żeby zmienić kolejność.</p>
        </div>
        <div class="page-head__actions">
          <Button onClick={() => setEditing('new')}>Dodaj pytanie</Button>
        </div>
      </header>

      <section class="card" aria-label="Pytania">
        <ol class="faq-list">
          {data.faq.map((it, i) => (
            <li class={`faq-row${it.visible ? '' : ' is-hidden'}`} data-row {...reorder.rowProps(i)}>
              <Grip {...reorder.gripProps(i, it.q.pl)} />
              <span class="faq-row__num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span class="faq-row__q body-medium">{it.q.pl}</span>
              <span class="faq-row__langs">
                <LangPills done={done(it)} />
              </span>
              <span class="faq-row__toggle">
                <Toggle
                  checked={it.visible}
                  label={`${it.q.pl}: widoczne na stronie`}
                  onChange={(visible) => {
                    saveFaq(data.faq.map((x) => (x.id === it.id ? { ...x, visible } : x)));
                    toast(visible ? 'Pytanie widać na stronie.' : 'Pytanie schowane ze strony.');
                  }}
                />
              </span>
              <IconButton icon="pencil" label={`Edytuj: ${it.q.pl}`} onClick={() => setEditing(it)} class="faq-row__edit" />
            </li>
          ))}
          {data.faq.length === 0 && <li class="empty">Nie ma jeszcze pytań.</li>}
        </ol>
      </section>

      {editing && <FaqDrawer key={editing === 'new' ? 'new' : editing.id} item={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function FaqDrawer({ item, onClose }: { item: FaqItem | null; onClose: () => void }) {
  const { data, saveFaq, toast } = useAdmin();
  const isNew = !item;
  const [locale, setLocale] = useState<Locale>('pl');
  const [draft, setDraft] = useState<FaqItem>(item ?? { id: `faq-${Date.now()}`, q: { pl: '' }, a: { pl: '' }, visible: true });
  const currentIndex = item ? data.faq.findIndex((x) => x.id === item.id) : data.faq.length;
  const [position, setPosition] = useState(String(currentIndex));
  const [tried, setTried] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const total = data.faq.length + (isNew ? 1 : 0);

  const save = async () => {
    setTried(true);
    if (!draft.q.pl.trim() || !draft.a.pl.trim()) return;
    const list = data.faq.filter((x) => x.id !== draft.id);
    list.splice(Number(position), 0, draft);
    await saveFaq(list);
    toast(isNew ? 'Pytanie dodane.' : 'Zapisano. Zmiany widać na stronie od razu.');
    onClose();
  };
  const remove = async () => {
    await saveFaq(data.faq.filter((x) => x.id !== draft.id));
    toast('Pytanie usunięte.');
    onClose();
  };

  const positions = Array.from({ length: total }, (_, i) => ({
    value: String(i),
    label: i === 0 ? 'Na początku · jako 1.' : i === total - 1 ? `Na końcu · jako ${i + 1}.` : `Jako ${i + 1}.`,
  }));

  return (
    <Drawer
      open
      onClose={onClose}
      title={isNew ? 'Dodaj' : 'Edytuj'}
      em="pytanie"
      footer={
        <>
          {isNew ? (
            <span class="drawer__note small muted">Zmiany widać na stronie od razu.</span>
          ) : (
            <span class="drawer__note">
              <LinkButton icon="trash" muted onClick={() => setConfirmDelete(true)}>
                Usuń pytanie
              </LinkButton>
            </span>
          )}
          <Button variant="secondary" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={save}>{isNew ? 'Dodaj pytanie' : 'Zapisz'}</Button>
        </>
      }
    >
      <div class="lang-row">
        <LangSwitch value={locale} onChange={setLocale} />
        <span class="small muted">
          {locale === 'pl' ? 'Edytujesz wersję polską. Przełącz język, żeby zmienić EN i UA.' : `Edytujesz wersję ${locale === 'en' ? 'angielską' : 'ukraińską'}. Puste pole = na stronie pokaże się polska.`}
        </span>
      </div>
      <TextInput label="Pytanie" value={draft.q[locale] ?? ''} placeholder={locale === 'pl' ? 'np. Czy mogę kupić bon na prezent?' : draft.q.pl} error={tried && !draft.q.pl.trim()} onInput={(v) => setDraft({ ...draft, q: setLoc(draft.q, locale, v) })} />
      <TextArea label="Odpowiedź" rows={6} value={draft.a[locale] ?? ''} placeholder={locale === 'pl' ? '2–4 krótkie zdania. Pisz tak, jak mówisz do klientki.' : draft.a.pl} onInput={(v) => setDraft({ ...draft, a: setLoc(draft.a, locale, v) })} />
      <Select label="Miejsce na liście" value={position} onChange={setPosition} options={positions} />
      <VisibleBox checked={draft.visible} onChange={(visible) => setDraft({ ...draft, visible })} title="Widoczne na stronie" hint="Wyłącz, żeby przygotować pytanie i opublikować je później." />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        title="Usunąć"
        em="pytanie?"
        message={
          <>
            Pytanie <strong>„{draft.q.pl}”</strong> zniknie z sekcji FAQ na stronie, we wszystkich językach. Tego nie da się cofnąć.
          </>
        }
        hint="Jeśli chcesz je tylko na chwilę ukryć, wyłącz „Widoczne na stronie”."
        confirmLabel="Tak, usuń"
      />
    </Drawer>
  );
}
