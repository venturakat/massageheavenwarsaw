/**
 * Gift voucher form (docs/behaviour/website.md → Gift voucher).
 * - "Konkretny masaż" / "Kwota" switches between massage + duration and an amount field
 * - the duration list is filled from the chosen treatment
 * - validates on submit (Polish phone, +48 optional), shows messages under the fields
 * - on success swaps to the "Bon wysłany" screen; closing the pop-up resets it
 */
import { submitVoucherRequest, type VoucherRequest } from './voucher';

type Errors = Record<'massage' | 'duration' | 'amount' | 'amountMin' | 'name' | 'phone' | 'consent' | 'send', string>;

/** "+48 600 123 456", "600-123-456", "0048600123456" → "+48600123456"; null if invalid. */
export function normalisePolishPhone(value: string): string | null {
  const compact = value.replace(/[\s\-().]/g, '');
  const match = compact.match(/^(?:\+48|0048)?(\d{9})$/);
  return match ? `+48${match[1]}` : null;
}

export function initGiftForm(form: HTMLFormElement): void {
  const dialog = form.closest('dialog');
  const durations: Record<string, string[]> = JSON.parse(form.dataset.durations ?? '{}');
  const errors: Errors = JSON.parse(form.dataset.errors ?? '{}');
  // Lowest price in the price list; amount vouchers can't be smaller (no maximum).
  const minAmount = Number(form.dataset.minAmount) || 1;
  const field = <T extends HTMLElement>(name: string) => form.elements.namedItem(name) as T;

  const massage = field<HTMLSelectElement>('massage');
  const duration = field<HTMLSelectElement>('duration');
  const amount = field<HTMLInputElement>('amount');
  const name = field<HTMLInputElement>('name');
  const phone = field<HTMLInputElement>('phone');
  const recipient = field<HTMLInputElement>('recipient');
  const message = field<HTMLTextAreaElement>('message');
  const consent = field<HTMLInputElement>('consent');
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]')!;
  const sendError = form.querySelector<HTMLElement>('[data-send-error]')!;
  const formView = form.querySelector<HTMLElement>('[data-view="form"]')!;
  const sentView = form.querySelector<HTMLElement>('[data-view="sent"]')!;
  const sentTitle = form.querySelector<HTMLElement>('[data-sent-title]')!;
  const durationPlaceholder = duration.options[0]?.cloneNode(true) as HTMLOptionElement;

  const type = () => (form.querySelector<HTMLInputElement>('input[name="type"]:checked')?.value ?? 'massage') as VoucherRequest['type'];

  // ── Field errors ──
  const errorEl = (control: HTMLElement) => document.getElementById(`${control.id}-error`);
  const setError = (control: HTMLElement, text: string | null) => {
    const el = errorEl(control);
    if (text) {
      control.setAttribute('aria-invalid', 'true');
      control.setAttribute('aria-describedby', `${control.id}-error`);
    } else {
      control.removeAttribute('aria-invalid');
      if (control !== consent) control.removeAttribute('aria-describedby');
    }
    if (el) {
      el.textContent = text ?? '';
      el.hidden = !text;
    }
  };

  // ── Type switch ──
  const applyType = () => {
    const current = type();
    form.querySelectorAll<HTMLElement>('[data-for-type]').forEach((row) => {
      const active = row.dataset.forType === current;
      row.hidden = !active;
      row.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select').forEach((control) => {
        control.disabled = !active || (control === duration && !massage.value);
        if (!active) setError(control, null);
      });
    });
  };
  form.querySelectorAll('input[name="type"]').forEach((radio) => radio.addEventListener('change', applyType));

  // ── Durations follow the chosen massage ──
  const fillDurations = () => {
    const list = durations[massage.value] ?? [];
    const placeholder = durationPlaceholder.cloneNode(true) as HTMLOptionElement;
    if (list.length && form.dataset.durationChoose) placeholder.textContent = form.dataset.durationChoose;
    duration.replaceChildren(placeholder);
    list.forEach((d) => duration.append(new Option(d, d)));
    duration.disabled = list.length === 0;
    // One duration only: pick it.
    if (list.length === 1) duration.value = list[0];
    else duration.selectedIndex = 0;
  };
  massage.addEventListener('change', () => {
    fillDurations();
    setError(massage, null);
  });

  // Clear a field's error as soon as it changes.
  form.addEventListener('input', (event) => {
    const control = event.target as HTMLElement;
    if (control.getAttribute('aria-invalid') === 'true') setError(control, null);
    sendError.hidden = true;
  });
  form.addEventListener('change', (event) => {
    const control = event.target as HTMLElement;
    if (control.getAttribute('aria-invalid') === 'true') setError(control, null);
  });

  // ── Validation ──
  const validate = (): HTMLElement | null => {
    const problems: [HTMLElement, string][] = [];
    if (type() === 'massage') {
      if (!massage.value) problems.push([massage, errors.massage]);
      else if (!duration.value) problems.push([duration, errors.duration]);
    } else {
      const value = Number(amount.value);
      if (!amount.value || !Number.isFinite(value)) problems.push([amount, errors.amount]);
      else if (value < minAmount || !Number.isInteger(value)) problems.push([amount, errors.amountMin.replace('{min}', String(minAmount))]);
    }
    if (!name.value.trim()) problems.push([name, errors.name]);
    if (!normalisePolishPhone(phone.value)) problems.push([phone, errors.phone]);
    if (!consent.checked) problems.push([consent, errors.consent]);

    [massage, duration, amount, name, phone, consent].forEach((c) => setError(c, null));
    problems.forEach(([control, text]) => setError(control, text));
    return problems[0]?.[0] ?? null;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    sendError.hidden = true;
    const firstInvalid = validate();
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const data: VoucherRequest = {
      type: type(),
      ...(type() === 'massage' ? { massage: massage.value, duration: duration.value } : { amount: Number(amount.value) }),
      recipient: recipient.value.trim() || undefined,
      name: name.value.trim(),
      phone: normalisePolishPhone(phone.value)!,
      message: message.value.trim() || undefined,
      consent: true,
      locale: form.dataset.locale ?? 'pl',
    };

    submit.setAttribute('aria-busy', 'true');
    submit.disabled = true;
    try {
      await submitVoucherRequest(data);
      formView.hidden = true;
      sentView.hidden = false;
      dialog?.classList.add('is-sent');
      sentTitle.focus();
    } catch {
      sendError.hidden = false;
    } finally {
      submit.removeAttribute('aria-busy');
      submit.disabled = false;
    }
  });

  // ── Reset when the pop-up closes ──
  const reset = () => {
    form.reset();
    [massage, duration, amount, name, phone, consent].forEach((c) => setError(c, null));
    sendError.hidden = true;
    fillDurations();
    applyType();
    formView.hidden = false;
    sentView.hidden = true;
    dialog?.classList.remove('is-sent');
  };
  // Keep a half-filled form; start fresh only after a request was sent. Reset just
  // before the pop-up opens again — resetting on close showed the form for a moment
  // while the success screen was still fading out.
  dialog?.addEventListener('mh:beforeopen', () => {
    if (dialog.classList.contains('is-sent')) reset();
  });

  fillDurations();
  applyType();
}
