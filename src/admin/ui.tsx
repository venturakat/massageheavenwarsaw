/** Admin UI building blocks (Figma 393:11 "Admin components"). Styles in admin.css. */
import type { ComponentChildren } from 'preact';
import { createPortal } from 'preact/compat';
import { useEffect, useRef } from 'preact/hooks';

/** Stable unique id per component instance (preact's useId repeats ids across client-only islands). */
let idCounter = 0;
function useId() {
  const ref = useRef<string | null>(null);
  if (!ref.current) ref.current = `f${++idCounter}`;
  return ref.current;
}
import { Icon, type IconName } from './icons';
import { LOCALES, type Locale, type VoucherStatus } from './types';
import { STATUS_LABEL } from './format';

// ── Buttons ───────────────────────────────────────────────

type BtnProps = {
  class?: string;
  children?: ComponentChildren;
  onClick?: (e: MouseEvent) => void;
  variant?: 'primary' | 'secondary';
  block?: boolean;
  href?: string;
  target?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  /** Gets the focus when its pop-up opens. */
  autofocus?: boolean;
};
export function Button({ variant = 'primary', block, href, class: cls, children, type = 'button', autofocus, ...rest }: BtnProps) {
  const className = ['btn', `btn--${variant}`, block && 'btn--block', cls].filter(Boolean).join(' ');
  if (href)
    return (
      <a class={className} href={href} target={rest.target} rel={rest.target ? 'noopener' : undefined}>
        {children}
      </a>
    );
  return (
    <button type={type} class={className} data-autofocus={autofocus || undefined} {...rest}>
      {children}
    </button>
  );
}

export function IconButton({ icon, label, onClick, class: cls }: { icon: IconName; label: string; onClick?: () => void; class?: string }) {
  return (
    <button type="button" class={`icon-btn ${cls ?? ''}`} aria-label={label} title={label} onClick={onClick}>
      <Icon name={icon} />
    </button>
  );
}

export function LinkButton({ icon, children, onClick, href, muted }: { icon?: IconName; children: ComponentChildren; onClick?: () => void; href?: string; muted?: boolean }) {
  const cls = `link-btn${muted ? ' link-btn--muted' : ''}`;
  const inner = (
    <>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </>
  );
  return href ? (
    <a class={cls} href={href} target="_blank" rel="noopener">
      {inner}
    </a>
  ) : (
    <button type="button" class={cls} onClick={onClick}>
      {inner}
    </button>
  );
}

// ── Form fields ───────────────────────────────────────────

type FieldBase = { label?: string; hint?: string; error?: boolean; class?: string };

export function Field({ label, children, class: cls, id }: { label?: string; children: ComponentChildren; class?: string; id: string }) {
  return (
    <div class={`field ${cls ?? ''}`}>
      {label && (
        <label class="field__label" for={id}>
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

export function TextInput({
  label,
  value,
  onInput,
  placeholder,
  type = 'text',
  error,
  class: cls,
  list,
  autoComplete,
  inputMode,
  suffix,
  ariaLabel,
}: FieldBase & {
  value: string;
  onInput: (v: string) => void;
  placeholder?: string;
  type?: string;
  list?: string;
  autoComplete?: string;
  inputMode?: 'numeric' | 'text' | 'tel' | 'email';
  suffix?: string;
  ariaLabel?: string;
}) {
  const id = useId();
  return (
    <Field label={label} id={id} class={cls}>
      <div class={`input${error ? ' input--error' : ''}`}>
        <input
          id={id}
          type={type as 'text'}
          value={value}
          placeholder={placeholder}
          list={list}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-label={ariaLabel}
          aria-invalid={error || undefined}
          onInput={(e) => onInput((e.target as HTMLInputElement).value)}
        />
        {suffix && <span class="input__suffix">{suffix}</span>}
        {list && <Icon name="chevronDown" class="input__chevron" />}
      </div>
    </Field>
  );
}

export function TextArea({ label, value, onInput, placeholder, rows = 5, class: cls }: FieldBase & { value: string; onInput: (v: string) => void; placeholder?: string; rows?: number }) {
  const id = useId();
  return (
    <Field label={label} id={id} class={cls}>
      <div class="input input--area">
        <textarea id={id} rows={rows} value={value} placeholder={placeholder} onInput={(e) => onInput((e.target as HTMLTextAreaElement).value)} />
      </div>
    </Field>
  );
}

export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  class: cls,
  ariaLabel,
}: FieldBase & { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; ariaLabel?: string }) {
  const id = useId();
  return (
    <Field label={label} id={id} class={cls}>
      <div class="input input--select">
        <select id={id} value={value} aria-label={ariaLabel} onChange={(e) => onChange((e.target as HTMLSelectElement).value as T)}>
          {options.map((o) => (
            <option value={o.value}>{o.label}</option>
          ))}
        </select>
        <Icon name="chevronDown" class="input__chevron" />
      </div>
    </Field>
  );
}

// ── Toggles, chips, badges ────────────────────────────────

export function Toggle({ checked, onChange, label, labelVisible }: { checked: boolean; onChange: (v: boolean) => void; label: string; labelVisible?: boolean }) {
  return (
    <label class="toggle">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange((e.target as HTMLInputElement).checked)} aria-label={labelVisible ? undefined : label} />
      <span class="toggle__track" aria-hidden="true" />
      {labelVisible && <span class="toggle__label">{label}</span>}
    </label>
  );
}

/** Grey box with a title, a hint and a toggle ("Widoczny na stronie"). */
export function VisibleBox({ checked, onChange, title, hint }: { checked: boolean; onChange: (v: boolean) => void; title: string; hint: string }) {
  return (
    <div class="visible-box">
      <div>
        <p class="body-medium">{title}</p>
        <p class="small muted">{hint}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

export function Chips<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div class="chip-group" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button type="button" role="radio" aria-checked={value === o.value} class={`chip${value === o.value ? ' chip--active' : ''}`} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: VoucherStatus }) {
  return (
    <span class={`badge badge--${status}`}>
      <span class="badge__dot" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function LangPills({ done }: { done: Record<Locale, boolean> }) {
  return (
    <span class="lang-pills">
      {LOCALES.map((l) => (
        <span class={`lang-pill${done[l] ? '' : ' lang-pill--missing'}`} title={done[l] ? `${l.toUpperCase()}: przetłumaczone` : `${l.toUpperCase()}: brak tłumaczenia`}>
          {l.toUpperCase()}
        </span>
      ))}
    </span>
  );
}

export function LangSwitch({ value, onChange }: { value: Locale; onChange: (l: Locale) => void }) {
  return (
    <div class="lang-switch" role="radiogroup" aria-label="Język treści">
      {LOCALES.map((l) => (
        <button type="button" role="radio" aria-checked={value === l} class={value === l ? 'is-active' : ''} onClick={() => onChange(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** "Bony <em>podarunkowe</em>" — regular + italic plum title. */
export function Title({ text, em, as: Tag = 'h1', class: cls }: { text: string; em?: string; as?: 'h1' | 'h2'; class?: string }) {
  return (
    <Tag class={cls}>
      {text}
      {em && (
        <>
          {' '}
          <em>{em}</em>
        </>
      )}
    </Tag>
  );
}

// ── Overlays: drawer (desktop) / sheet (mobile), dialog ───

/** Open pop-ups, newest last: only the top one reacts to Esc and Tab (a confirmation over a drawer). */
const overlayStack: object[] = [];

function useOverlay(open: boolean, onClose: () => void, ref: { current: HTMLElement | null }) {
  useEffect(() => {
    if (!open) return;
    const token = {};
    overlayStack.push(token);
    const previous = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const focusables = () =>
      Array.from(el?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? []).filter((n) => n.offsetParent !== null);
    (el?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0])?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (overlayStack[overlayStack.length - 1] !== token) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab') {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    return () => {
      overlayStack.splice(overlayStack.indexOf(token), 1);
      document.removeEventListener('keydown', onKey);
      if (!overlayStack.length) document.body.classList.remove('no-scroll');
      previous?.focus?.();
    };
  }, [open]);
}

export function Drawer({
  open,
  onClose,
  title,
  em,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  em?: string;
  children: ComponentChildren;
  footer: ComponentChildren;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlay(open, onClose, ref);
  if (!open) return null;
  return createPortal(
    <div class="overlay">
      <div class="scrim" onClick={onClose} />
      <div class="drawer" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref}>
        <span class="drawer__grabber" aria-hidden="true" />
        <div class="drawer__head">
          <h2 id={titleId} class="h-card">
            {title} {em && <em>{em}</em>}
          </h2>
          <IconButton icon="x" label="Zamknij" onClick={onClose} />
        </div>
        <div class="drawer__content">{children}</div>
        <div class="drawer__footer">{footer}</div>
      </div>
    </div>,
    document.body,
  );
}

export function Dialog({ open, onClose, title, em, children, footer }: { open: boolean; onClose: () => void; title: string; em?: string; children: ComponentChildren; footer: ComponentChildren }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlay(open, onClose, ref);
  if (!open) return null;
  return createPortal(
    <div class="overlay overlay--center">
      <div class="scrim" onClick={onClose} />
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref}>
        <span class="drawer__grabber" aria-hidden="true" />
        <div class="drawer__head">
          <h2 id={titleId} class="h-card">
            {title} {em && <em>{em}</em>}
          </h2>
          <IconButton icon="x" label="Zamknij" onClick={onClose} />
        </div>
        <div class="dialog__body">{children}</div>
        <div class="drawer__footer">{footer}</div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Confirmation pop-up for irreversible actions (deleting a person, a treatment, a question).
 * Same look as the other dialogs; "Anuluj" has the focus, so Enter never deletes by accident.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  em,
  message,
  hint,
  confirmLabel,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  em?: string;
  message: ComponentChildren;
  hint?: ComponentChildren;
  confirmLabel: string;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      em={em}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} autofocus>
            Anuluj
          </Button>
          <Button
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{message}</p>
      {hint && <p class="info-box small muted">{hint}</p>}
    </Dialog>
  );
}

// ── Toast ─────────────────────────────────────────────────

export type ToastData = { id: number; message: string; action?: { label: string; onClick: () => void } };

export function Toast({ toast, onDone }: { toast: ToastData | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [toast?.id]);
  return (
    <div class="toast-region" role="status" aria-live="polite">
      {toast && (
        <div class="toast" key={toast.id}>
          <span class="toast__icon" aria-hidden="true">
            <Icon name="check" size={16} />
          </span>
          <span class="toast__message">{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              class="toast__action"
              onClick={() => {
                toast.action!.onClick();
                onDone();
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Reordering: drag the grip, or focus it and use ↑ / ↓ ──

export function useReorder<T>(items: T[], onChange: (items: T[]) => void) {
  const dragFrom = useRef<number | null>(null);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = items.slice();
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onChange(next);
  };
  return {
    rowProps: (i: number) => ({
      onDragOver: (e: DragEvent) => {
        if (dragFrom.current === null) return;
        e.preventDefault();
        if (dragFrom.current !== i) {
          move(dragFrom.current, i);
          dragFrom.current = i;
        }
      },
      onDrop: (e: DragEvent) => e.preventDefault(),
    }),
    gripProps: (i: number, label: string) => ({
      draggable: true,
      'aria-label': `${label}: zmień kolejność (strzałki góra/dół)`,
      title: 'Przeciągnij, żeby zmienić kolejność',
      onDragStart: (e: DragEvent) => {
        dragFrom.current = i;
        e.dataTransfer?.setData('text/plain', String(i));
        const row = (e.currentTarget as HTMLElement).closest('[data-row]');
        if (row && e.dataTransfer) e.dataTransfer.setDragImage(row, 20, 20);
      },
      onDragEnd: () => (dragFrom.current = null),
      onKeyDown: (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          const to = e.key === 'ArrowUp' ? i - 1 : i + 1;
          move(i, to);
          requestAnimationFrame(() => document.querySelectorAll<HTMLElement>('[data-grip]')[to]?.focus());
        }
      },
    }),
  };
}

export function Grip(props: Record<string, unknown>) {
  return (
    <button type="button" class="grip" data-grip {...props}>
      <Icon name="grip" />
    </button>
  );
}
