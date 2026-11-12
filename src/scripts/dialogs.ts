/**
 * Shared behaviour for every <dialog data-dialog> (see Modal.astro).
 * - [data-open-dialog="id"] opens that dialog as a modal
 * - [data-close-dialog], Esc (native) and a click on the dim close it
 * - focus returns to the element that opened it
 * - the page behind doesn't scroll (base.css: html:has(dialog[open]))
 */
const openers = new WeakMap<HTMLDialogElement, Element | null>();

export function openDialog(id: string, opener: Element | null = document.activeElement): void {
  const dialog = document.getElementById(id);
  if (!(dialog instanceof HTMLDialogElement) || dialog.open) return;
  openers.set(dialog, opener);
  dialog.showModal();
}

export function closeDialog(dialog: HTMLDialogElement): void {
  if (dialog.open) dialog.close();
}

document.addEventListener('click', (event) => {
  const target = event.target as Element | null;
  if (!target) return;

  const opener = target.closest<HTMLElement>('[data-open-dialog]');
  if (opener?.dataset.openDialog) {
    event.preventDefault();
    openDialog(opener.dataset.openDialog, opener);
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
    if (!(dialog instanceof HTMLDialogElement)) return;
    const opener = openers.get(dialog);
    if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
  },
  true,
);
