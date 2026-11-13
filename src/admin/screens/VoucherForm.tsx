/**
 * "Dodaj bon ręcznie" drawer (Figma 460:4178). The "Kwota" state isn't designed yet: built in the same style.
 * With `voucher` it becomes "Edytuj bon" (not designed: same drawer). Only for vouchers that aren't paid yet
 * (Nowy / W kontakcie), so the client can change the massage or amount while you're in contact.
 * Status, payment and validity are set later by "Oznacz jako opłacony", so edit mode hides them.
 */
import { useEffect, useMemo, useState } from "preact/hooks";
import { useAdmin, go } from "../App";
import {
  addMonths,
  isoDate,
  isoDateTime,
  mediumDate,
  newCode,
  now,
  zl,
} from "../format";
import { PAYMENTS, type Payment, type Voucher } from "../types";
import { Button, Chips, Drawer, Select, TextInput } from "../ui";

const VALIDITY = [12, 6, 3] as const;
type Status = Voucher["status"];
const STATUSES: { value: Status; label: string }[] = [
  { value: "oplacony", label: "Opłacony" },
  { value: "przekazany", label: "Przekazany" },
  { value: "kontakt", label: "W kontakcie (czeka na płatność)" },
];

export function VoucherForm({
  open,
  onClose,
  voucher,
}: {
  open: boolean;
  onClose: () => void;
  voucher?: Voucher;
}) {
  const { data, saveVoucher, toast } = useAdmin();
  const editing = Boolean(voucher);
  const treatments = useMemo(
    () => data.categories.flatMap((c) => c.treatments.filter((t) => t.visible)),
    [data.categories],
  );

  const [type, setType] = useState<"massage" | "amount">("massage");
  const [treatmentId, setTreatmentId] = useState(treatments[0]?.id ?? "");
  const treatment =
    treatments.find((t) => t.id === treatmentId) ?? treatments[0];
  const [duration, setDuration] = useState("");
  const option =
    treatment?.options.find((o) => o.duration.pl === duration) ??
    treatment?.options[0];
  const [amount, setAmount] = useState("200");
  const [buyer, setBuyer] = useState("");
  const [phone, setPhone] = useState("");
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState<Status>("oplacony");
  const [payment, setPayment] = useState<Payment>("Gotówka");
  const [months, setMonths] = useState<string>("12");
  const [tried, setTried] = useState(false);

  const value =
    type === "amount"
      ? Number(amount.replace(/[^\d]/g, "")) || 0
      : (option?.price ?? 0);
  const validUntil = isoDate(addMonths(now(), Number(months)));
  const valid =
    buyer.trim() && phone.replace(/\D/g, "").length >= 9 && value > 0;

  // Edit mode: fill the form from the voucher each time the drawer opens.
  useEffect(() => {
    if (!open || !voucher) return;
    const t = treatments.find((x) => x.name.pl === voucher.treatment);
    setType(voucher.type);
    setTreatmentId(t?.id ?? treatments[0]?.id ?? "");
    setDuration(voucher.duration ?? "");
    setAmount(voucher.type === "amount" ? String(voucher.value) : "200");
    setBuyer(voucher.buyer);
    setPhone(voucher.phone);
    setRecipient(voucher.recipient ?? "");
    setTried(false);
  }, [open, voucher?.id]);

  const reset = () => {
    setType("massage");
    setBuyer("");
    setPhone("");
    setRecipient("");
    setTried(false);
  };

  const submit = async () => {
    setTried(true);
    if (!valid) return;
    if (voucher) {
      await saveVoucher({
        ...voucher,
        type,
        treatment: type === "massage" ? treatment?.name.pl : undefined,
        duration: type === "massage" ? option?.duration.pl : undefined,
        value,
        recipient: recipient.trim() || undefined,
        buyer: buyer.trim(),
        phone: phone.trim(),
      });
      onClose();
      toast("Zmiany zapisane.");
      return;
    }
    const at = isoDateTime(now());
    const paid = status !== "kontakt";
    const v: Voucher = {
      id: `v${Date.now()}`,
      code: paid ? newCode(data.vouchers.map((x) => x.code ?? "")) : undefined,
      createdAt: at,
      source: "manual",
      type,
      treatment: type === "massage" ? treatment?.name.pl : undefined,
      duration: type === "massage" ? option?.duration.pl : undefined,
      value,
      recipient: recipient.trim() || undefined,
      buyer: buyer.trim(),
      phone: phone.trim(),
      status,
      payment: paid ? payment : undefined,
      validUntil: paid ? validUntil : undefined,
      history: [
        ...(paid ? [] : [{ status: "kontakt" as const, at }]),
        ...(paid ? [{ status: "oplacony" as const, at, detail: payment }] : []),
        ...(status === "przekazany"
          ? [{ status: "przekazany" as const, at, detail: "osobiście" }]
          : []),
      ],
    };
    await saveVoucher(v);
    reset();
    onClose();
    toast(v.code ? `Bon ${v.code} dodany.` : "Bon dodany.");
    go(`bony/${v.id}`);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? "Edytuj" : "Dodaj"}
      em="bon"
      footer={
        <>
          <span class="drawer__note body-medium muted">
            {editing
              ? "Kod bonu nadamy przy płatności."
              : "Kod bonu nadamy automatycznie."}
          </span>
          <Button variant="secondary" onClick={onClose}>
            Anuluj
          </Button>
          <Button onClick={submit}>
            {editing ? "Zapisz zmiany" : "Dodaj bon"}
          </Button>
        </>
      }
    >
      <div class="field">
        <span class="field__label">Rodzaj bonu</span>
        <Chips
          label="Rodzaj bonu"
          value={type}
          onChange={setType}
          options={[
            { value: "massage", label: "Konkretny masaż" },
            { value: "amount", label: "Kwota" },
          ]}
        />
      </div>

      {type === "massage" ? (
        <>
          <Select
            label="Masaż"
            value={treatment?.id ?? ""}
            onChange={(id) => (setTreatmentId(id), setDuration(""))}
            options={treatments.map((t) => ({ value: t.id, label: t.name.pl }))}
          />
          <div class="field-row">
            <Select
              label="Czas trwania"
              value={option?.duration.pl ?? ""}
              onChange={setDuration}
              options={(treatment?.options ?? []).map((o) => ({
                value: o.duration.pl,
                label: o.duration.pl,
              }))}
            />
            <TextInput
              label="Wartość bonu"
              value={zl(value)}
              onInput={() => {}}
              ariaLabel="Wartość bonu (z cennika)"
            />
          </div>
        </>
      ) : (
        <TextInput
          label="Kwota"
          value={amount}
          onInput={setAmount}
          inputMode="numeric"
          suffix="zł"
          error={tried && value <= 0}
          placeholder="np. 300"
        />
      )}

      <div class="field-row">
        <TextInput
          label="Kupujący"
          value={buyer}
          onInput={setBuyer}
          placeholder="Imię i nazwisko"
          error={tried && !buyer.trim()}
        />
        <TextInput
          label="Telefon"
          type="tel"
          value={phone}
          onInput={setPhone}
          placeholder="+48 …"
          error={tried && phone.replace(/\D/g, "").length < 9}
        />
      </div>
      <TextInput
        label="Dla kogo (opcjonalnie)"
        value={recipient}
        onInput={setRecipient}
        placeholder="Imię osoby obdarowanej — wpiszemy je na bonie"
      />
      {!editing && (
        <>
          <div class="field-row">
            <Select
              label="Status"
              value={status}
              onChange={setStatus}
              options={STATUSES}
            />
            <Select
              label="Płatność"
              value={payment}
              onChange={setPayment}
              options={PAYMENTS.map((p) => ({ value: p, label: p }))}
            />
          </div>
          <Select
            label="Ważny"
            value={months}
            onChange={setMonths}
            options={VALIDITY.map((m) => ({
              value: String(m),
              label: `${m} ${m < 5 ? "miesiące" : "miesięcy"} · do ${mediumDate(isoDate(addMonths(now(), m)))}`,
            }))}
          />
        </>
      )}
    </Drawer>
  );
}
