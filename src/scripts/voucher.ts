/**
 * Gift voucher request — the single hand-off point for the developer (phase 2).
 *
 * Phase 1: nothing is sent. The function waits briefly and resolves, so the form
 * shows its success screen. Replace the body with the real request (e.g. a POST to
 * the back end) and throw on failure: the form then shows its error message.
 */
export type VoucherRequest = {
  type: 'massage' | 'amount';
  massage?: string; // treatment name, when type = 'massage'
  duration?: string; // e.g. "60 min", when type = 'massage'
  amount?: number; // PLN, when type = 'amount'
  recipient?: string; // name printed on the voucher (optional)
  name: string;
  phone: string; // normalised: +48XXXXXXXXX
  message?: string; // not printed on the voucher
  consent: true;
  locale: string;
};

export async function submitVoucherRequest(data: VoucherRequest): Promise<void> {
  // TODO(developer): send `data` to the back end and store it for the admin panel.
  if (import.meta.env.DEV) console.info('[voucher] request (not sent in phase 1):', data);
  await new Promise((resolve) => setTimeout(resolve, 400));
}
