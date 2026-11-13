/** Bony podarunkowe — list (Figma 397:88, mobile 432:1550). */
import { useMemo, useState } from 'preact/hooks';
import { useAdmin } from '../App';
import { Icon } from '../icons';
import { isActive, monthLocative, now, shortDate, shortDateTime, statusOf, time, voucherSubtitle, voucherTitle } from '../format';
import type { VoucherStatus } from '../types';
import { Button, StatusBadge } from '../ui';
import { VoucherForm } from './VoucherForm';

type Filter = 'all' | VoucherStatus;
const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Wszystkie' },
  { value: 'nowy', label: 'Nowe' },
  { value: 'kontakt', label: 'W kontakcie' },
  { value: 'oplacony', label: 'Opłacone' },
  { value: 'przekazany', label: 'Przekazane' },
  { value: 'zrealizowany', label: 'Zrealizowane' },
  { value: 'wygasly', label: 'Wygasłe' },
];

export function Vouchers() {
  const { data } = useAdmin();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);

  const list = useMemo(
    () => [...data.vouchers].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data.vouchers],
  );
  const count = (s: VoucherStatus) => list.filter((v) => statusOf(v) === s).length;
  const active = list.filter(isActive);
  const nextMonth = (now().getMonth() + 1) % 12;
  const expiringSoon = active.filter((v) => v.validUntil && new Date(v.validUntil).getMonth() === nextMonth && new Date(v.validUntil).getTime() - now().getTime() < 62 * 864e5).length;

  const q = query.trim().toLowerCase().replace(/\s/g, '');
  const shown = list.filter(
    (v) =>
      (filter === 'all' || statusOf(v) === filter) &&
      (!q || `${v.buyer}${v.phone}${v.code ?? ''}${v.recipient ?? ''}`.toLowerCase().replace(/\s/g, '').includes(q)),
  );
  const newCount = count('nowy');

  return (
    <>
      <header class="page-head">
        <div class="page-head__text">
          <h1 class="page-title">
            Bony <em>podarunkowe</em>
          </h1>
          <p class="muted">Zamówienia z formularza na stronie. O każdym nowym zgłoszeniu dostajesz też SMS.</p>
        </div>
        <div class="page-head__actions">
          <Button variant="secondary" onClick={() => setAdding(true)}>
            Dodaj bon ręcznie
          </Button>
        </div>
      </header>

      <section class="stats" aria-label="Podsumowanie">
        <div class="stat stat--highlight">
          <span class="label">
            Nowe<span class="hide-mobile"> zgłoszenia</span>
          </span>
          <span class="stat__value">{newCount}</span>
          <span class="small">czekają na{' '}<span class="hide-mobile">Twój </span>kontakt</span>
        </div>
        <div class="stat">
          <span class="label">Opłacone</span>
          <span class="stat__value">{count('oplacony')}</span>
          <span class="small">czekają na przekazanie</span>
        </div>
        <div class="stat">
          <span class="label">
            Aktywne<span class="hide-mobile"> bony</span>
          </span>
          <span class="stat__value">{active.length}</span>
          <span class="small">
            <span class="hide-mobile">do wykorzystania · </span>
            {expiringSoon} {expiringSoon > 1 && expiringSoon < 5 ? 'wygasają' : 'wygasa'} w {monthLocative(nextMonth)}
          </span>
        </div>
      </section>

      <section class="card vouchers" aria-label="Lista bonów">
        <div class="vouchers__toolbar">
          <div class="chip-row" role="group" aria-label="Filtruj według statusu">
            {FILTERS.filter((f) => f.value !== 'wygasly' || count('wygasly') > 0).map((f) => (
              <button type="button" class={`chip chip--small${filter === f.value ? ' chip--active' : ''}`} aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}>
                {f.label}
                {f.value === 'nowy' && newCount > 0 ? ` · ${newCount}` : ''}
              </button>
            ))}
          </div>
          <label class="input search">
            <span class="sr-only">Szukaj</span>
            <input type="search" placeholder="Szukaj: imię, telefon lub kod" value={query} onInput={(e) => setQuery((e.target as HTMLInputElement).value)} />
          </label>
        </div>

        <div class="vouchers__labels" aria-hidden="true">
          <span class="col-date">Data</span>
          <span class="col-buyer">Kupujący</span>
          <span class="col-voucher">Bon</span>
          <span class="col-code">Kod</span>
          <span class="col-status">Status</span>
          <span class="col-arrow" />
        </div>

        <ul class="vouchers__list">
          {shown.map((v) => {
            const s = statusOf(v);
            return (
              <li>
                <a class={`voucher-row${s === 'nowy' ? ' is-new' : ''}`} href={`#/bony/${v.id}`}>
                  <span class="col-date">
                    <span class="body-medium">{shortDate(v.createdAt)}</span>
                    <span class="small muted">{time(v.createdAt)}</span>
                  </span>
                  <span class="col-buyer">
                    <span class="body-medium">{v.buyer}</span>
                    <span class="small muted">{v.phone}</span>
                  </span>
                  <span class="col-voucher">
                    <span>{voucherTitle(v)}</span>
                    <span class="small muted">{voucherSubtitle(v)}</span>
                  </span>
                  <span class="col-code small-medium">{v.code ?? '—'}</span>
                  <span class="col-status">
                    <StatusBadge status={s} />
                  </span>
                  <Icon name="chevronRight" class="col-arrow" />

                  {/* Mobile card (Figma 429:1580) */}
                  <span class="voucher-card">
                    <span class="voucher-card__top">
                      <span class="body-medium">{v.buyer}</span>
                      <StatusBadge status={s} />
                    </span>
                    <span>
                      {voucherTitle(v)} · {voucherSubtitle(v)}
                    </span>
                    <span class="voucher-card__meta">
                      <span class="small muted">
                        {shortDateTime(v.createdAt)} · {v.phone}
                      </span>
                      <span class="small-medium">{v.code ?? '—'}</span>
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
          {shown.length === 0 && <li class="empty">{query ? 'Nic nie pasuje do wyszukiwania.' : 'Brak bonów w tym widoku.'}</li>}
        </ul>
      </section>

      <VoucherForm open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
