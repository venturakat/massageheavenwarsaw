/** Zespół (Figma 403:889, new person 454:3160; mobile 435:2354 list, 435:2466 edit). */
import { useEffect, useRef, useState } from 'preact/hooks';
import { go, useAdmin } from '../App';
import { Icon } from '../icons';
import { mediumDate, isoDateTime, now, t } from '../format';
import type { Locale, Localized, Person } from '../types';
import { Button, ConfirmDialog, Grip, LangSwitch, LinkButton, TextArea, TextInput, Toggle, useReorder } from '../ui';
import { photoOf } from '../team-photos';
import { PhotoCropper } from '../PhotoCropper';

const setLoc = (l: Localized, locale: Locale, value: string): Localized => ({ ...l, [locale]: value });
const blank = (): Person => ({
  id: `p${Date.now()}`,
  name: { pl: '' },
  role: { pl: '' },
  bio: { pl: '' },
  visible: true,
  booksy: '',
  fresha: '',
  whatsappText: { pl: '' },
});

export function Team({ personId }: { personId?: string }) {
  const { data, saveTeam, toast } = useAdmin();
  const [creating, setCreating] = useState<Person | null>(null);
  const isNewRoute = personId === 'nowa';
  const selectedId = personId ?? (window.matchMedia('(min-width: 1024px)').matches ? data.team[0]?.id : undefined);
  // "nowa" gets a blank form (also when the page is opened at #/zespol/nowa directly).
  const selected = isNewRoute ? (creating ?? undefined) : data.team.find((p) => p.id === selectedId);
  const reorder = useReorder(data.team, (team) => saveTeam(team).then(() => toast('Kolejność zapisana.')));

  useEffect(() => {
    if (isNewRoute) setCreating((c) => c ?? blank());
    else setCreating(null);
  }, [personId]);

  const startNew = () => go('zespol/nowa');

  return (
    <>
      <header class={`page-head${selected && personId ? ' team-hide-mobile' : ''}`}>
        <div class="page-head__text">
          <h1 class="page-title">Zespół</h1>
          <p class="muted">Te osoby widać w sekcji Zespół na stronie i w okienku rezerwacji u wybranej masażystki.</p>
        </div>
        <div class="page-head__actions">
          <Button onClick={startNew}>Dodaj osobę</Button>
        </div>
      </header>

      <div class={`team${personId ? ' has-selection' : ''}`}>
        <div class="team__list">
          <ul class="stack-12">
            {data.team.map((p, i) => (
              <li class={`person-item${p.id === selected?.id ? ' is-active' : ''}${p.visible ? '' : ' is-hidden'}`} data-row {...reorder.rowProps(i)}>
                <Grip {...reorder.gripProps(i, p.name.pl)} />
                <a class="person-item__link" href={`#/zespol/${p.id}`} aria-current={p.id === selected?.id ? 'true' : undefined}>
                  <span class={`person-photo${photoOf(p) ? '' : ' person-photo--empty'}`}>{photoOf(p) ? <img src={photoOf(p)} alt="" /> : <Icon name="image" />}</span>
                  <span class="person-item__text">
                    <span class="body-medium">{p.name.pl}</span>
                    <span class="small muted">{p.visible ? p.role.pl : `${p.role.pl} · schowana`}</span>
                  </span>
                  <Icon name="chevronRight" />
                </a>
              </li>
            ))}
            {isNewRoute && creating && (
              <li class="person-item is-active is-new">
                <span class="grip" aria-hidden="true">
                  <Icon name="grip" />
                </span>
                <span class="person-item__link">
                  <span class="person-photo person-photo--empty">
                    <Icon name="image" />
                  </span>
                  <span class="person-item__text">
                    <span class="body-medium plum">{creating.name.pl || 'Nowa osoba'}</span>
                    <span class="small muted">uzupełnij dane</span>
                  </span>
                  <Icon name="chevronRight" />
                </span>
              </li>
            )}
          </ul>
          <p class="small muted">Przeciągnij, żeby zmienić kolejność na stronie.</p>
        </div>

        {selected && (
          <PersonEditor
            key={selected.id}
            person={selected}
            isNew={isNewRoute}
            onCancel={() => {
              setCreating(null);
              go('zespol');
            }}
            onSave={async (p) => {
              const exists = data.team.some((x) => x.id === p.id);
              await saveTeam(exists ? data.team.map((x) => (x.id === p.id ? p : x)) : [...data.team, p]);
              setCreating(null);
              toast(exists ? 'Zapisano. Zmiany widać na stronie od razu.' : `Dodano: ${p.name.pl}.`);
              go(`zespol/${p.id}`);
            }}
            onDelete={async (p) => {
              await saveTeam(data.team.filter((x) => x.id !== p.id));
              toast(`Usunięto: ${p.name.pl}.`);
              go('zespol');
            }}
          />
        )}
      </div>
    </>
  );
}

function PersonEditor({
  person,
  isNew,
  onSave,
  onCancel,
  onDelete,
}: {
  person: Person;
  isNew: boolean;
  onSave: (p: Person) => void;
  onCancel: () => void;
  onDelete: (p: Person) => void;
}) {
  const [draft, setDraft] = useState(person);
  const [locale, setLocale] = useState<Locale>('pl');
  const [tried, setTried] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const firstName = draft.name.pl || 'tej osoby';

  // Photo: pick a file (or re-crop the current one) → crop pop-up → square photo.
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const closeCrop = () => {
    if (cropSrc?.startsWith('blob:')) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };
  const onPhoto = (input: HTMLInputElement) => {
    const f = input.files?.[0];
    input.value = ''; // so picking the same file again still opens the crop
    if (f) setCropSrc(URL.createObjectURL(f));
  };

  const save = () => {
    setTried(true);
    if (!draft.name.pl.trim() || !draft.role.pl.trim()) return;
    onSave({ ...draft, updatedAt: isoDateTime(now()) });
  };

  return (
    <section class="card person-editor" aria-labelledby="person-title">
      <div class="person-editor__head">
        <a class="back-link team-show-mobile" href="#/zespol">
          ← Zespół
        </a>
        <h2 class="h-card" id="person-title">
          {isNew ? (
            <>
              Nowa <em>osoba</em>
            </>
          ) : (
            t(draft.name, locale) || draft.name.pl
          )}
        </h2>
        <LangSwitch value={locale} onChange={setLocale} />
      </div>

      <div class="person-editor__body">
        <div class="person-editor__photo">
          <button type="button" class={`person-photo person-photo--large${photoOf(draft) ? '' : ' person-photo--empty'}`} onClick={() => file.current?.click()} aria-label="Zmień zdjęcie">
            {photoOf(draft) ? <img src={photoOf(draft)} alt={`Zdjęcie: ${draft.name.pl}`} /> : <Icon name="image" size={32} />}
          </button>
          <input ref={file} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => onPhoto(e.target as HTMLInputElement)} />
          <Button variant="secondary" class="btn--small" onClick={() => file.current?.click()}>
            {photoOf(draft) ? 'Zmień zdjęcie' : 'Dodaj zdjęcie'}
          </Button>
          {photoOf(draft) && (
            <LinkButton icon="image" onClick={() => setCropSrc(photoOf(draft) ?? null)}>
              Kadruj
            </LinkButton>
          )}
          <p class="small muted">Zdjęcie z usuniętym tłem (wycięta sylwetka, przezroczyste tło), PNG lub WebP, min. 800 × 800 px. Śliwkowe tło pod spodem dodamy sami.</p>
          <Toggle checked={draft.visible} onChange={(visible) => setDraft({ ...draft, visible })} label="Na stronie" labelVisible />
        </div>

        <div class="person-editor__fields">
          <div class="field-row">
            <TextInput label="Imię (tak jak na stronie)" value={draft.name[locale] ?? ''} placeholder={locale === 'pl' ? 'np. Anastazja' : draft.name.pl} error={tried && !draft.name.pl.trim()} onInput={(v) => setDraft({ ...draft, name: setLoc(draft.name, locale, v) })} />
            <TextInput label="Rola" value={draft.role[locale] ?? ''} placeholder={locale === 'pl' ? 'np. masażystka' : draft.role.pl} error={tried && !draft.role.pl.trim()} onInput={(v) => setDraft({ ...draft, role: setLoc(draft.role, locale, v) })} />
          </div>
          <TextArea label="O mnie" rows={5} value={draft.bio[locale] ?? ''} placeholder={locale === 'pl' ? 'Kilka zdań o doświadczeniu, wykształceniu i ulubionych technikach…' : 'Brak tłumaczenia — na stronie pokaże się wersja polska.'} onInput={(v) => setDraft({ ...draft, bio: setLoc(draft.bio, locale, v) })} />
          <span class="field__label">Linki do rezerwacji {isNew ? 'u tej osoby' : `u ${genitive(firstName)}`}</span>
          <div class="field-row">
            <TextInput label="Booksy" type="url" value={draft.booksy} placeholder="Link do profilu w Booksy" onInput={(booksy) => setDraft({ ...draft, booksy })} />
            <TextInput label="Fresha" type="url" value={draft.fresha} placeholder="Link do profilu we Fresha" onInput={(fresha) => setDraft({ ...draft, fresha })} />
          </div>
          <TextInput
            label="Wiadomość WhatsApp (wpisze się sama)"
            value={draft.whatsappText[locale] ?? ''}
            placeholder={locale === 'pl' ? 'Dzień dobry! Chcę umówić wizytę u …' : draft.whatsappText.pl}
            onInput={(v) => setDraft({ ...draft, whatsappText: setLoc(draft.whatsappText, locale, v) })}
          />
        </div>
      </div>

      <div class="person-editor__footer">
        {!isNew && (
          <LinkButton
            icon="trash"
            muted
            onClick={() => setConfirmDelete(true)}
          >
            Usuń osobę
          </LinkButton>
        )}
        <span class="small muted">{isNew ? 'Nowa osoba pojawi się na końcu listy w sekcji Zespół.' : person.updatedAt ? `Ostatnia zmiana: ${mediumDate(person.updatedAt)}` : ''}</span>
        {isNew && (
          <Button variant="secondary" onClick={onCancel}>
            Anuluj
          </Button>
        )}
        <Button onClick={save}>{isNew ? 'Dodaj osobę' : 'Zapisz zmiany'}</Button>
      </div>
      <PhotoCropper
        src={cropSrc}
        onCancel={closeCrop}
        onSave={(photo) => {
          setDraft({ ...draft, photo });
          closeCrop();
        }}
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => onDelete(person)}
        title="Usunąć"
        em="osobę?"
        message={
          <>
            <strong>{person.name.pl}</strong> zniknie z sekcji Zespół na stronie i z okienka rezerwacji, we wszystkich językach. Tego nie da się cofnąć.
          </>
        }
        hint="Jeśli ta osoba może wrócić, lepiej ją tylko schować: wyłącz przełącznik „Na stronie”."
        confirmLabel="Tak, usuń"
      />
    </section>
  );
}

/** Polish genitive for the names in use (u Anastazji, u Iny); other names stay as typed. */
function genitive(name: string) {
  if (/ja$/.test(name)) return name.replace(/ja$/, 'ji');
  if (/a$/.test(name)) return name.replace(/a$/, 'y');
  return name;
}
