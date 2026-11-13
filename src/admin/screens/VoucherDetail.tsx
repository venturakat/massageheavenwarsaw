/** Bon — detail (Figma 399:289, handed over 413:1378, dialogs 464:4614, toast 472:4802). */
import { useState } from 'preact/hooks';
import { api } from '../api';
import { useAdmin } from '../App';
import { Icon } from '../icons';
import {
  FLOW,
  STATUS_LABEL,
  addMonths,
  dotDate,
  fullDateTime,
  isoDate,
  isoDateTime,
  longDate,
  newCode,
  now,
  shortDate,
  shortDateTime,
  statusOf,
  telLink,
  voucherService,
  waLink,
  whatsappMessage,
  zl,
} from '../format';
import { downloadPdf, generateVoucherPdf } from '../pdf/voucher-pdf';
import { PAYMENTS, type Payment, type Voucher } from '../types';
import { Button, Dialog, LinkButton, Select, StatusBadge, TextInput } from '../ui';
import { VoucherPreview } from '../VoucherPreview';
import { VoucherForm } from './VoucherForm';

const NEXT_LABEL: Partial<Record<Voucher['status'], string>> = {
  nowy: 'Oznacz jako w kontakcie',
  kontakt: 'Oznacz jako opłacony',
  oplacony: 'Oznacz jako przekazany',
  przekazany: 'Oznacz jako zrealizowany',
};

export function VoucherDetail({ id }: { id: string }) {
  const { data, saveVoucher, toast } = useAdmin();
  const v = data.vouchers.find((x) => x.id === id);
  const [payOpen, setPayOpen] = useState(false);
  const [payment, setPayment] = useState<Payment>('BLIK');
  const [sent, setSent] = useState<{ message: string; url: string } | null>(null);
  const [note, setNote] = useState(v?.note ?? '');
  const [busy, setBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (!v) {
    return (
      <div class="card empty-state">
        <p>Nie ma takiego bonu.</p>
        <Button variant="secondary" href="#/bony">
          Wróć do listy
        </Button>
      </div>
    );
  }

  const status = statusOf(v);
  const [first, ...rest] = v.buyer.split(' ');
  const handed = v.history.find((h) => h.status === 'przekazany');
  // The order can change while you're in contact; once paid, the code and PDF are fixed.
  const editable = v.status === 'nowy' || v.status === 'kontakt';

  const advance = async (to: Voucher['status'], detail?: string, extra: Partial<Voucher> = {}) => {
    const next: Voucher = { ...v, ...extra, status: to, history: [...v.history.filter((h) => h.status !== to), { status: to, at: isoDateTime(now()), detail }] };
    await saveVoucher(next);
    toast(`Status: ${STATUS_LABEL[to].toLowerCase()}.`);
  };
  const markPaid = async () => {
    setPayOpen(false);
    await advance('oplacony', payment, {
      payment,
      code: v.code ?? newCode(data.vouchers.map((x) => x.code ?? '')),
      validUntil: v.validUntil ?? isoDate(addMonths(now(), 12)),
    });
  };
  const onNext = () => {
    if (v.status === 'nowy') advance('kontakt');
    else if (v.status === 'kontakt') setPayOpen(true);
    else if (v.status === 'oplacony') advance('przekazany', 'osobiście');
    else if (v.status === 'przekazany') advance('zrealizowany');
  };

  const values = {
    recipient: v.recipient ?? '',
    buyer: v.buyer,
    service: voucherService(v),
    validUntil: v.validUntil ? dotDate(v.validUntil) : '',
    code: v.code ?? '',
  };
  const pdfReady = Boolean(v.code);

  const onDownload = async () => {
    setBusy(true);
    try {
      downloadPdf(await generateVoucherPdf(values), `bon-${v.code}.pdf`);
      toast(
        'PDF pobrany. Gdy przekażesz bon, oznacz go jako przekazany.',
        v.status === 'oplacony' ? { label: 'Oznacz teraz', onClick: () => advance('przekazany', 'osobiście') } : undefined,
      );
    } finally {
      setBusy(false);
    }
  };

  const onSendWhatsApp = async () => {
    // Open the tab during the click so the browser doesn't block it, then point it at WhatsApp.
    const tab = window.open('', '_blank');
    setBusy(true);
    try {
      const pdf = await generateVoucherPdf(values);
      const link = await api.publishVoucherPdf(v, pdf);
      const message = whatsappMessage(v, link);
      const url = waLink(v.phone, message);
      if (tab) tab.location.href = url;
      else window.open(url, '_blank');
      setSent({ message, url });
    } catch {
      tab?.close();
      toast('Nie udało się przygotować bonu. Spróbuj jeszcze raz.');
    } finally {
      setBusy(false);
    }
  };

  const saveNote = () => {
    if ((v.note ?? '') !== note) saveVoucher({ ...v, note }).then(() => toast('Notatka zapisana.'));
  };

  // Furthest step reached. Steps before it count as done even without a date: a voucher
  // added by hand starts at "Opłacony", and some requests are paid without a "W kontakcie" step.
  const reached = Math.max(FLOW.indexOf(v.status), ...v.history.map((h) => FLOW.indexOf(h.status)));
  const nextIndex = reached + 1;

  return (
    <>
      <header class="page-head page-head--detail">
        <div class="page-head__text">
          <a class="back-link" href="#/bony">
            ← Bony podarunkowe
          </a>
          <div class="title-row">
            <h1 class="page-title">
              {first} {rest.length > 0 && <em>{rest.join(' ')}</em>}
            </h1>
            <StatusBadge status={status} />
          </div>
          <p class="muted">
            {v.source === 'form' ? `Zgłoszenie z ${fullDateTime(v.createdAt)} · formularz na stronie` : `Dodany ręcznie ${fullDateTime(v.createdAt)}`}
            {handed && ` · bon przekazany ${shortDate(handed.at)}${handed.detail === 'WhatsApp' ? ' przez WhatsApp' : handed.detail ? ` (${handed.detail})` : ''}`}
          </p>
        </div>
        <div class="page-head__actions detail-actions">
          <div class="detail-actions__contact">
            <Button variant="secondary" href={telLink(v.phone)}>
              Zadzwoń
            </Button>
            <Button variant="secondary" href={waLink(v.phone, '')} target="_blank">
              WhatsApp
            </Button>
          </div>
          {NEXT_LABEL[v.status] && status !== 'wygasly' && <Button onClick={onNext}>{NEXT_LABEL[v.status]}</Button>}
        </div>
      </header>

      <div class="detail-grid">
        <div class="detail-grid__left">
          <section class="card card--pad">
            <div class="card-head card-head--row">
              <h2 class="h-card">Zamówienie</h2>
              {editable && (
                <LinkButton icon="pencil" onClick={() => setEditOpen(true)}>
                  Edytuj
                </LinkButton>
              )}
            </div>
            <dl class="facts">
              <div>
                <dt>Rodzaj bonu</dt>
                <dd class="body-medium">{v.type === 'amount' ? 'Kwota' : 'Konkretny masaż'}</dd>
              </div>
              {v.type === 'massage' && (
                <div>
                  <dt>Masaż</dt>
                  <dd class="body-medium">{voucherService(v)}</dd>
                </div>
              )}
              <div>
                <dt>Wartość</dt>
                <dd class="body-medium">{zl(v.value)}</dd>
              </div>
              <div>
                <dt>Dla kogo</dt>
                <dd>{v.recipient || '—'}</dd>
              </div>
              {v.message && (
                <div>
                  <dt>Wiadomość</dt>
                  <dd>{v.message}</dd>
                </div>
              )}
              <div>
                <dt>Telefon</dt>
                <dd class="body-medium">
                  <a href={telLink(v.phone)}>{v.phone}</a>
                </dd>
              </div>
              {v.payment && (
                <div>
                  <dt>Płatność</dt>
                  <dd class="body-medium">{v.payment}</dd>
                </div>
              )}
              <div>
                <dt>Zgoda RODO</dt>
                <dd class="body-medium">{v.consentAt ? `Tak · ${fullDateTime(v.consentAt)}` : 'Bon dodany ręcznie'}</dd>
              </div>
            </dl>
          </section>

          <section class="card card--pad stack-16">
            <h2 class="h-card">Historia i notatki</h2>
            <ol class="timeline">
              {FLOW.map((s, i) => {
                const h = v.history.find((x) => x.status === s);
                const done = i <= reached;
                const isNext = i === nextIndex && status !== 'wygasly';
                const stepNote = h
                  ? `${shortDateTime(h.at)}${h.detail ? ` · ${h.detail}` : ''}`
                  : done
                    ? v.source === 'manual'
                      ? i === 0
                        ? 'dodany ręcznie'
                        : '—'
                      : 'pominięty'
                    : isNext
                      ? 'następny krok'
                      : status === 'wygasly'
                        ? 'bon wygasł'
                        : s === 'zrealizowany'
                          ? 'po wizycie'
                          : '—';
                return (
                  <li class={`timeline__step${done ? ' is-done' : ''}${isNext ? ' is-next' : ''}${i + 1 <= reached ? ' is-linked' : ''}`}>
                    <span class="timeline__dot" aria-hidden="true">
                      {done && <Icon name="check" size={14} />}
                    </span>
                    <span class="timeline__text">
                      <span class="body-medium">{STATUS_LABEL[s]}</span>
                      <span class={`small ${isNext ? 'plum' : 'muted'}`}>{stepNote}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
            {status === 'wygasly' && v.validUntil && <p class="small plum">Bon wygasł {longDate(v.validUntil)}.</p>}
            <div onFocusOut={saveNote}>
              <TextInput label="Notatka (widzisz ją tylko Ty)" value={note} onInput={setNote} placeholder="np. odbiór osobisty w piątek" />
            </div>
          </section>
        </div>

        <section class="card card--pad stack-16 detail-grid__right">
          <h2 class="h-card">Podgląd bonu</h2>
          <VoucherPreview values={values} />
          <div class="code-box">
            <span>
              <span class="label label--plum">Kod bonu</span>
              <span class="code-box__code">{v.code ?? '—'}</span>
            </span>
            <span>
              <span class="label label--plum">Ważny do</span>
              <span class="body-medium">{v.validUntil ? longDate(v.validUntil) : '—'}</span>
            </span>
          </div>
          <p class="small muted">
            {pdfReady
              ? 'Dane z zamówienia wpisują się na bon automatycznie. Po wizycie oznacz bon jako zrealizowany, żeby nie dało się go użyć drugi raz.'
              : 'Kod i datę ważności nadamy, gdy oznaczysz bon jako opłacony. Wtedy pobierzesz PDF.'}
          </p>
          <Button block onClick={onDownload} disabled={!pdfReady || busy}>
            Pobierz PDF
          </Button>
          {status !== 'zrealizowany' && status !== 'wygasly' && (
            <Button variant="secondary" block onClick={onSendWhatsApp} disabled={!pdfReady || busy}>
              Wyślij link przez WhatsApp
            </Button>
          )}
        </section>
      </div>

      {editable && <VoucherForm open={editOpen} onClose={() => setEditOpen(false)} voucher={v} />}

      <Dialog
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Bon"
        em="opłacony?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={markPaid}>Oznacz jako opłacony</Button>
          </>
        }
      >
        <p class="muted">Nadamy kod bonu i datę ważności (12 miesięcy · do {longDate(isoDate(addMonths(now(), 12)))}).</p>
        <Select label="Płatność" value={payment} onChange={setPayment} options={PAYMENTS.map((p) => ({ value: p, label: p }))} />
      </Dialog>

      <Dialog
        open={Boolean(sent)}
        onClose={() => setSent(null)}
        title="Wysłałaś"
        em="bon?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSent(null)}>
              Jeszcze nie
            </Button>
            <Button
              onClick={async () => {
                setSent(null);
                if (v.status === 'oplacony' || v.status === 'kontakt') await advance('przekazany', 'WhatsApp');
              }}
            >
              Tak, oznacz jako przekazany
            </Button>
          </>
        }
      >
        <p class="muted">
          WhatsApp otworzył się w nowej karcie z gotową wiadomością do: {v.buyer}. Wyślij ją i wróć tutaj, żeby oznaczyć bon jako przekazany.
        </p>
        <div class="message-preview">
          <span class="label">Wiadomość · {v.phone}</span>
          <p>
            {sent?.message.split('\n').map((line) => (
              <>
                {line}
                <br />
              </>
            ))}
          </p>
        </div>
        <LinkButton icon="external" href={sent?.url}>
          Otwórz WhatsApp jeszcze raz
        </LinkButton>
      </Dialog>
    </>
  );
}

