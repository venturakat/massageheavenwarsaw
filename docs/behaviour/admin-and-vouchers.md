# Admin panel and gift voucher PDF (developer, phase 2)

Designed in Figma, page **"Landing back end" (353:4297)**: desktop 1440×900 screens in section 397:87, mobile 390×844 screens in section 429:1594, components in 393:11. There are prototype flows "Panel administracyjny" (desktop, starting at 410:1353) and "Panel administracyjny (mobile)" (starting at 429:1595). The admin UI is in Polish. The user is the owner, Anastazja.

## Scope
Booking stays in Booksy / Fresha / WhatsApp / Instagram, so there is **no calendar and no client database**. The admin panel covers:
1. **Login** (e-mail + password, "Zapamiętaj mnie", password reset by e-mail link valid for 1 h). The login e-mail is a placeholder.
2. **Bony podarunkowe:** the inbox of voucher requests from the website form, plus manual vouchers (ordered by phone or in person).
3. **Cennik:** edit treatments (name, category, optional description, duration/price rows, visible toggle) per language. Add and delete treatments.
   - **Exactly 6 categories:** the owner can rename a category and edit its card tagline, but can't add, delete or hide categories (the website grid is designed for 6).
   - "od X zł" is calculated automatically.
4. **Zespół:** reorder people; each person has a photo, visible toggle, name, role, bio (PL/EN/UA), their own Booksy/Fresha links and a prefilled WhatsApp message. Add new people.
5. **FAQ:** reorder, add, edit, delete and show/hide questions, per language.
6. **Gabinet i rezerwacje:**
   - contact details and opening hours per day
   - a top-bar announcement with a preview and a "show until" date
   - the 4 booking channels: name, link, subtitle, group and visible toggle. The channels can't be deleted, only hidden.

Every change shows on the site right away ("Zmiany widać na stronie od razu"). That means the site has to read content from the admin data source: SSR, on-demand revalidation, or a rebuild hook. The developer chooses.

## Voucher statuses
Nowy → W kontakcie → Opłacony → **Przekazany** → Zrealizowany (+ Wygasły).
- Stat cards: Nowe zgłoszenia, Opłacone ("czekają na przekazanie"), Aktywne bony.
- New requests are tinted plum-100 in the list.

## Voucher detail actions
- Header actions: **Zadzwoń** (`tel:`), **WhatsApp**, **Oznacz jako przekazany**. After the voucher is handed over: **Oznacz jako zrealizowany**.
- **"Pobierz PDF":** downloads the voucher PDF. No dialog; a toast shows for about 4 s: "PDF pobrany. Gdy przekażesz bon, oznacz go jako przekazany." with the link "Oznacz teraz".
- **"Wyślij link przez WhatsApp":**
  1. Generates the PDF and stores it at a hard-to-guess URL (e.g. `massageheavenwarsaw.com/bon/7q4k-x8f2m`). The link must keep working until the voucher expires.
  2. Opens `wa.me/<buyer's number>?text=…` in a new tab.
  3. Shows the "Wysłałaś bon?" dialog with the buttons "Jeszcze nie" and "Tak, oznacz jako przekazany". The site can't know whether she pressed Send.
- **WhatsApp message template:** "Dzień dobry! Przesyłam bon podarunkowy Massage Heaven: <masaż>, <czas>. Kod <kod>, ważny do <data>. / Bon w PDF: <link> / Do zobaczenia na Kruczej 16/22!" The wording for amount vouchers isn't written yet.
- **Manual voucher ("Dodaj bon ręcznie")** fields:
  - Rodzaj bonu (Konkretny masaż / Kwota)
  - Masaż + Czas trwania + Wartość bonu (taken from the price list)
  - Kupujący + Telefon
  - Dla kogo (optional)
  - Status + Płatność (Gotówka, …)
  - Ważny ("12 miesięcy · do …")
  - The code is generated automatically (format `MH-XXXX`).

## Gift voucher PDF
Figma page "Printables" (132:6):
- Front: component **520:83**
- Back: component **520:82**
- Filled examples: section 520:86
- Rules card: 520:235

- **One PDF** for print and WhatsApp: 2 pages (front, back), each **216×105 mm** (210×99 mm trim + 3 mm bleed), CMYK, fonts embedded (Instrument Serif/Sans, OFL), no crop marks. Figma exports RGB only, so the CMYK conversion happens in the generator. Provisional CMYK values: Plum 45·95·25·15, Periwinkle 60·47·0·0, Ink 75·68·60·80.
- **The front is static.** The back has 5 value slots:
  - **Dla / For** = "Dla kogo". Optional; leave it blank for handwriting.
  - **Od / From** = the buyer's name.
  - **Usługa lub kwota:** "<service name> · <duration>" (e.g. "Masaż aromatyczny · 30 min · plecy"), or "<amount> zł". Polish names from the price list.
  - **Ważny do:** DD.MM.YYYY.
  - **Nr:** the voucher code (MH-XXXX).
- **Value style:** Instrument Serif Italic, 30 px, line height 36, plum #832F66, left-aligned on the line.
- **One line only.** If a value doesn't fit, shrink 1 px at a time down to **22 px**. Never wrap. Truncating with "…" is a last resort only.
- **Slot widths:** Dla, Od, Usługa = 657 px (111 mm). Ważny do, Nr = 308 px (52 mm). The longest service string fits at 28 px; 40 W's fit at 22 px.
- **Blank print template:** the back with all values empty.
- **Terms on the back:**
  - PL: "Bon można zrealizować w Massage Heaven, ul. Krucza 16/22, Warszawa. Umów wizytę przez Booksy, Fresha, WhatsApp lub Instagram i podaj numer bonu. Bon nie podlega wymianie na gotówkę."
  - EN: "Redeemable at Massage Heaven, Krucza 16/22, Warsaw. Book via Booksy, Fresha, WhatsApp or Instagram and quote the certificate number. Not exchangeable for cash."

## Not designed yet
- empty states
- voucher pricing rules
- delete confirmations (Usuń pytanie / Usuń zabieg)
- the "Kwota" state of Dodaj bon
- edit forms for the WhatsApp and Instagram channels
- reordering categories

Also undecided: whether the admin should be available in Ukrainian, and one validity rule (12 months is the default in Dodaj bon).
