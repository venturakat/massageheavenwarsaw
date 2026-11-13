/** Cennik (Figma 401:375; drawers 402:596 edit, 452:2901 add, 485:5312 category; mobile 434:1869). */
import { useState } from 'preact/hooks';
import { useAdmin } from '../App';
import { Icon } from '../icons';
import { hasTranslation, shortTreatmentName, t, zl } from '../format';
import type { Category, Locale, Localized, Treatment } from '../types';
import { Button, ConfirmDialog, Drawer, Grip, IconButton, LangPills, LangSwitch, LinkButton, Select, TextArea, TextInput, Toggle, VisibleBox, useReorder } from '../ui';

const DURATIONS = ['30 min', '45 min', '60 min', '75 min', '90 min', '120 min'];
const lowest = (c: Category) => {
  const prices = c.treatments.filter((x) => x.visible).flatMap((x) => x.options.map((o) => o.price));
  return prices.length ? Math.min(...prices) : 0;
};
const pricesLine = (tr: Treatment) => tr.options.map((o) => `${o.duration.pl} · ${zl(o.price)}`).join('   /   ');
const done = (l: Localized) => ({ pl: true, en: hasTranslation(l, 'en'), ua: hasTranslation(l, 'ua') });
const setLoc = (l: Localized | undefined, locale: Locale, value: string): Localized => ({ ...(l ?? { pl: '' }), [locale]: value });

export function Pricing() {
  const { data, saveCategories, toast } = useAdmin();
  const [catId, setCatId] = useState(data.categories[2]?.id ?? data.categories[0].id);
  const [editing, setEditing] = useState<{ catId: string; treatment: Treatment | null } | null>(null);
  const [editingCat, setEditingCat] = useState(false);
  const cat = data.categories.find((c) => c.id === catId) ?? data.categories[0];

  const setCategory = (next: Category) => saveCategories(data.categories.map((c) => (c.id === next.id ? next : c)));
  const reorder = useReorder(cat.treatments, (treatments) => setCategory({ ...cat, treatments }));

  return (
    <>
      <header class="page-head">
        <div class="page-head__text">
          <h1 class="page-title">Cennik</h1>
          <p class="muted">6 kategorii, takich jak na stronie. Zmiany pojawiają się na stronie od razu po zapisaniu.</p>
        </div>
        <div class="page-head__actions page-head__actions--split">
          <Button variant="secondary" href="/#uslugi" target="_blank">
            Zobacz na stronie
          </Button>
          <Button onClick={() => setEditing({ catId: cat.id, treatment: null })}>Dodaj zabieg</Button>
        </div>
      </header>

      <div class="pricing">
        <nav class="categories" aria-label="Kategorie">
          <span class="label">Kategorie</span>
          <ul>
            {data.categories.map((c) => (
              <li>
                <button type="button" class={`category-item${c.id === cat.id ? ' is-active' : ''}`} aria-current={c.id === cat.id} onClick={() => setCatId(c.id)}>
                  <span class="category-item__num">{c.number}</span>
                  <span class="category-item__name">{c.name.pl}</span>
                  <span class="small muted">{c.treatments.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div class="categories-mobile">
          <Select label="Kategoria (6)" value={cat.id} onChange={setCatId} options={data.categories.map((c) => ({ value: c.id, label: `${c.number} · ${c.name.pl}` }))} />
        </div>

        <section class="card treatments" aria-labelledby="cat-title">
          <div class="treatments__head">
            <div>
              <h2 class="h-card" id="cat-title">
                {cat.name.pl}
              </h2>
              <p class="small muted">
                „{cat.tagline.pl}” · na karcie: od {zl(lowest(cat))} (liczone automatycznie)
              </p>
            </div>
            <IconButton icon="pencil" label="Edytuj kategorię" onClick={() => setEditingCat(true)} />
          </div>
          <div class="treatments__labels" aria-hidden="true">
            <span>Zabieg i ceny</span>
            <span>Tłumaczenia</span>
            <span>Na stronie</span>
          </div>
          <ul>
            {cat.treatments.map((tr, i) => (
              <li class={`treatment-row${tr.visible ? '' : ' is-hidden'}`} data-row {...reorder.rowProps(i)}>
                <Grip {...reorder.gripProps(i, tr.name.pl)} />
                <span class="treatment-row__info">
                  <span class="body-medium">{tr.name.pl}</span>
                  <span class="small muted">{pricesLine(tr)}</span>
                </span>
                <span class="treatment-row__langs">
                  <LangPills done={done(tr.name)} />
                </span>
                <span class="treatment-row__toggle">
                  <Toggle
                    checked={tr.visible}
                    label={`${tr.name.pl}: widoczny na stronie`}
                    onChange={(visible) => {
                      setCategory({ ...cat, treatments: cat.treatments.map((x) => (x.id === tr.id ? { ...x, visible } : x)) });
                      toast(visible ? `„${tr.name.pl}” widać na stronie.` : `„${tr.name.pl}” schowany ze strony.`);
                    }}
                  />
                </span>
                <IconButton icon="pencil" label={`Edytuj: ${tr.name.pl}`} onClick={() => setEditing({ catId: cat.id, treatment: tr })} class="treatment-row__edit" />
              </li>
            ))}
            {cat.treatments.length === 0 && <li class="empty">W tej kategorii nie ma jeszcze zabiegów.</li>}
          </ul>
        </section>
      </div>

      {editing && <TreatmentDrawer key={editing.treatment?.id ?? 'new'} catId={editing.catId} treatment={editing.treatment} onClose={() => setEditing(null)} />}
      {editingCat && <CategoryDrawer category={cat} onClose={() => setEditingCat(false)} />}
    </>
  );
}

function TreatmentDrawer({ catId, treatment, onClose }: { catId: string; treatment: Treatment | null; onClose: () => void }) {
  const { data, saveCategories, toast } = useAdmin();
  const isNew = !treatment;
  const [locale, setLocale] = useState<Locale>('pl');
  const [targetCat, setTargetCat] = useState(catId);
  const [draft, setDraft] = useState<Treatment>(
    treatment ?? { id: `t${Date.now()}`, name: { pl: '' }, options: [{ duration: { pl: '60 min' }, price: 0 }], visible: true },
  );
  const [tried, setTried] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const missing = (['en', 'ua'] as Locale[]).filter((l) => !hasTranslation(draft.name, l));
  const valid = draft.name.pl.trim() && draft.options.length > 0 && draft.options.every((o) => o.duration.pl.trim() && o.price > 0);

  const save = async () => {
    setTried(true);
    if (!valid) return;
    const categories = data.categories.map((c) => {
      const without = c.treatments.filter((x) => x.id !== draft.id);
      if (c.id !== targetCat) return { ...c, treatments: without };
      const idx = c.treatments.findIndex((x) => x.id === draft.id);
      const treatments = idx >= 0 && c.id === catId ? c.treatments.map((x) => (x.id === draft.id ? draft : x)) : [...without, draft];
      return { ...c, treatments };
    });
    await saveCategories(categories);
    toast(isNew ? `Dodano „${draft.name.pl}”.` : 'Zapisano. Zmiany widać na stronie od razu.');
    onClose();
  };
  const remove = async () => {
    await saveCategories(data.categories.map((c) => ({ ...c, treatments: c.treatments.filter((x) => x.id !== draft.id) })));
    toast(`Usunięto „${draft.name.pl}”.`);
    onClose();
  };
  const setOption = (i: number, patch: Partial<{ duration: string; price: number }>) =>
    setDraft({
      ...draft,
      options: draft.options.map((o, j) =>
        j !== i ? o : { duration: patch.duration !== undefined ? setLoc(o.duration, locale, patch.duration) : o.duration, price: patch.price ?? o.price },
      ),
    });

  return (
    <Drawer
      open
      onClose={onClose}
      title={isNew ? 'Dodaj' : 'Edytuj'}
      em="zabieg"
      footer={
        <>
          {isNew ? (
            <span class="drawer__note small muted">Doda się na końcu kategorii.</span>
          ) : (
            <span class="drawer__note">
              <LinkButton icon="trash" muted onClick={() => setConfirmDelete(true)}>
                Usuń zabieg
              </LinkButton>
            </span>
          )}
          <Button variant="secondary" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={save}>{isNew ? 'Dodaj zabieg' : 'Zapisz'}</Button>
        </>
      }
    >
      <div class="lang-row">
        <LangSwitch value={locale} onChange={setLocale} />
        <span class={`small ${isNew || missing.length === 0 ? 'muted' : 'plum'}`}>
          {isNew
            ? 'Zacznij od wersji polskiej. EN i UA możesz dodać później — do tego czasu na stronie pokaże się polska.'
            : missing.length
              ? `${missing.map((l) => l.toUpperCase()).join(' i ')}: brak tłumaczenia — na stronie pokaże się wersja polska.`
              : locale === 'pl'
                ? 'Edytujesz wersję polską. Przełącz język, żeby zmienić EN i UA.'
                : `Edytujesz wersję ${locale === 'en' ? 'angielską' : 'ukraińską'}. Ceny są wspólne dla wszystkich języków.`}
        </span>
      </div>
      <TextInput
        label="Nazwa zabiegu"
        value={draft.name[locale] ?? ''}
        placeholder={locale === 'pl' ? 'np. Masaż relaksacyjny' : draft.name.pl}
        error={tried && !draft.name.pl.trim()}
        onInput={(v) => setDraft({ ...draft, name: setLoc(draft.name, locale, v) })}
      />
      <Select label="Kategoria" value={targetCat} onChange={setTargetCat} options={data.categories.map((c) => ({ value: c.id, label: `${c.number} · ${c.name.pl}` }))} />
      <TextArea
        label="Krótki opis (opcjonalnie)"
        value={draft.description?.[locale] ?? ''}
        placeholder={locale === 'pl' ? '1–2 zdania widoczne pod nazwą na stronie…' : t(draft.description) || '1–2 zdania widoczne pod nazwą na stronie…'}
        onInput={(v) => setDraft({ ...draft, description: setLoc(draft.description, locale, v) })}
      />
      <div class="field">
        <span class="field__label">Czas i cena</span>
        <datalist id="durations">
          {DURATIONS.map((d) => (
            <option value={d} />
          ))}
        </datalist>
        <div class="stack-8">
          {draft.options.map((o, i) => (
            <div class="price-row">
              <TextInput
                ariaLabel={`Czas trwania ${i + 1}`}
                list={locale === 'pl' ? 'durations' : undefined}
                value={o.duration[locale] ?? ''}
                placeholder={o.duration.pl}
                error={tried && !o.duration.pl.trim()}
                onInput={(v) => setOption(i, { duration: v })}
              />
              <TextInput
                ariaLabel={`Cena ${i + 1}`}
                inputMode="numeric"
                suffix="zł"
                value={o.price ? String(o.price) : ''}
                placeholder="np. 250"
                error={tried && !(o.price > 0)}
                onInput={(v) => setOption(i, { price: Number(v.replace(/[^\d]/g, '')) || 0 })}
              />
              <button type="button" class="icon-plain" aria-label={`Usuń ${o.duration.pl || 'wariant'}`} onClick={() => setDraft({ ...draft, options: draft.options.filter((_, j) => j !== i) })}>
                <Icon name="trash" />
              </button>
            </div>
          ))}
        </div>
        <LinkButton icon="plus" onClick={() => setDraft({ ...draft, options: [...draft.options, { duration: { pl: '' }, price: 0 }] })}>
          Dodaj czas i cenę
        </LinkButton>
      </div>
      <VisibleBox checked={draft.visible} onChange={(visible) => setDraft({ ...draft, visible })} title="Widoczny na stronie" hint="Wyłącz, żeby schować zabieg bez usuwania (np. sezonowy)." />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={remove}
        title="Usunąć"
        em="zabieg?"
        message={
          <>
            <strong>{draft.name.pl}</strong> zniknie z cennika na stronie, razem z cenami i tłumaczeniami. Tego nie da się cofnąć.
          </>
        }
        hint="Jeśli zabieg może wrócić (np. sezonowy), lepiej go tylko schować: wyłącz „Widoczny na stronie”."
        confirmLabel="Tak, usuń"
      />
    </Drawer>
  );
}

function CategoryDrawer({ category, onClose }: { category: Category; onClose: () => void }) {
  const { data, saveCategories, toast } = useAdmin();
  const [locale, setLocale] = useState<Locale>('pl');
  const [draft, setDraft] = useState(category);
  const visible = draft.treatments.filter((x) => x.visible);

  const save = async () => {
    if (!draft.name.pl.trim()) return;
    await saveCategories(data.categories.map((c) => (c.id === draft.id ? draft : c)));
    toast('Zapisano. Zmiany widać na stronie od razu.');
    onClose();
  };

  return (
    <Drawer
      open
      onClose={onClose}
      title="Edytuj"
      em="kategorię"
      footer={
        <>
          <span class="drawer__note small muted">Zmiany widać na stronie od razu.</span>
          <Button variant="secondary" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={save}>Zapisz</Button>
        </>
      }
    >
      <div class="lang-row">
        <LangSwitch value={locale} onChange={setLocale} />
        <span class="small muted">Edytujesz wersję {locale === 'pl' ? 'polską. Przełącz język, żeby zmienić EN i UA.' : locale === 'en' ? 'angielską.' : 'ukraińską.'}</span>
      </div>
      <TextInput label="Nazwa kategorii" value={draft.name[locale] ?? ''} placeholder={draft.name.pl} onInput={(v) => setDraft({ ...draft, name: setLoc(draft.name, locale, v) })} />
      <TextInput label="Krótki opis na karcie" value={draft.tagline[locale] ?? ''} placeholder={draft.tagline.pl} onInput={(v) => setDraft({ ...draft, tagline: setLoc(draft.tagline, locale, v) })} />
      <div class="field">
        <span class="field__label">Podgląd karty na stronie</span>
        <div class="preview-panel">
          <div class="service-card-preview">
            <span class="label label--plum">{draft.number} / 06</span>
            <span class="service-card-preview__title">{t(draft.name, locale)}</span>
            <span class="small muted">{t(draft.tagline, locale)}</span>
            <span class="small">{visible.map((x) => (locale === 'pl' ? shortTreatmentName(x.name.pl) : t(x.name, locale))).join(' · ')}</span>
            <span class="service-card-preview__bottom">
              <span class="price">od {zl(lowest(draft))}</span>
              <span class="service-card-preview__arrow" aria-hidden="true">
                <Icon name="chevronRight" size={16} />
              </span>
            </span>
          </div>
        </div>
        <span class="small muted">Lista zabiegów i cena „od” uzupełniają się same.</span>
      </div>
      <div class="info-box">
        <p class="body-medium">Zabiegi w tej kategorii: {draft.treatments.length}</p>
        <p class="small muted">Żeby przenieść zabieg do innej kategorii, otwórz go (ołówek przy zabiegu) i zmień pole „Kategoria”.</p>
      </div>
    </Drawer>
  );
}
