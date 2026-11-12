/**
 * Shared behaviour for every <dialog data-dialog> (Modal.astro, Menu.astro).
 * - [data-open-dialog="id"] opens that dialog as a modal
 * - [data-booking="general|anastazja|ina"] opens the matching booking chooser
 * - [data-replace-dialog] on an opener inside an open dialog closes that one first
 *   (the menu's "Zarezerwuj wizytę" swaps the menu for the chooser); otherwise a
 *   dialog opens on top (the privacy policy over the gift form)
 * - [data-close-dialog], Esc (native) and a click on the dim close it
 * - focus returns to the element that opened it; an opener with aria-expanded
 *   is kept in sync
 * - the page behind doesn't scroll (base.css: html:has(dialog[open]))
 * - fires "mh:beforeopen" on the dialog just before it opens
 */
const openers = new WeakMap<HTMLDialogElement, HTMLElement | null>();

export function openDialog(id: string, opener: HTMLElement | null = null): void {
  const dialog = document.getElementById(id);
  if (!(dialog instanceof HTMLDialogElement) || dialog.open) return;
  openers.set(dialog, opener);
  if (opener?.hasAttribute('aria-expanded')) opener.setAttribute('aria-expanded', 'true');
  // Lets the content reset itself while still hidden (see gift-form.ts).
  dialog.dispatchEvent(new Event('mh:beforeopen'));
  dialog.showModal();
}

/** Close; `restoreFocus: false` when the page is about to move focus itself. */
export function closeDialog(dialog: HTMLDialogElement, restoreFocus = true): void {
  if (!dialog.open) return;
  if (!restoreFocus) dialog.dataset.noRestore = '';
  dialog.close();
}

const targetDialogId = (el: HTMLElement): string | undefined =>
  el.dataset.openDialog ?? (el.dataset.booking ? `booking-${el.dataset.booking}` : undefined);

document.addEventListener('click', (event) => {
  const target = event.target as Element | null;
  if (!target) return;

  const opener = target.closest<HTMLElement>('[data-open-dialog], [data-booking]');
  const id = opener && targetDialogId(opener);
  if (opener && id) {
    event.preventDefault();
    const parent = opener.closest('dialog[data-dialog]');
    if (parent instanceof HTMLDialogElement && opener.hasAttribute('data-replace-dialog')) {
      // Hand the original opener (e.g. the menu button) to the new dialog.
      const original = openers.get(parent) ?? null;
      closeDialog(parent, false);
      openDialog(id, original);
    } else {
      openDialog(id, opener);
    }
    return;
  }

  const closer = target.closest('[data-close-dialog]');
  const dialog = target.closest('dialog[data-dialog]');
  if (closer && dialog instanceof HTMLDialogElement) {
    closeDialog(dialog);
    return;
  }

  // A click on the <dialog> element itself (not its card) is a click on the dim.
  if (target instanceof HTMLDialogElement && target.matches('[data-dialog]')) {
    closeDialog(target);
  }
});

document.addEventListener(
  'close',
  (event) => {
    const dialog = event.target;
    if (!(dialog instanceof HTMLDialogElement) || !dialog.matches('[data-dialog]')) return;
    const opener = openers.get(dialog);
    openers.delete(dialog);
    if (opener?.hasAttribute('aria-expanded')) opener.setAttribute('aria-expanded', 'false');
    const restore = !('noRestore' in dialog.dataset);
    delete dialog.dataset.noRestore;
    if (restore && opener?.isConnected) opener.focus({ preventScroll: true });
  },
  true,
);
