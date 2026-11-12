# Figma map

File key `J7HQH69jG2BbPrzjCWG5dx`. Link to a node: `https://www.figma.com/design/J7HQH69jG2BbPrzjCWG5dx/Massage-Heaven?node-id=<id with - instead of :>`

## Page "Landing front end" (85:2646) — the website
| Frame | Node |
|---|---|
| Homepage — Desktop | **95:14** |
| Homepage — Mobile (390) | **240:1064** |

### Desktop homepage sections (95:14)
| Section | Node | Anchor |
|---|---|---|
| Header (top bar + nav), fixed | 205:1041 (top bar 203:1041, nav 95:15, actions 207:1069) | — |
| Hero | in 95:14 | `#start` |
| Services (cards, panels, search) | 198:1068 | `#cennik` |
| About — Poznaj gabinet | in 95:14 | `#o-nas` |
| FAQ — Przed pierwszą wizytą | 151:138 (list 154:324) | `#faq` |
| Gift certificate | in 95:14 | `#bon` |
| Team | 151:135 | `#zespol` |
| Contact + map | in 95:14 | `#kontakt` |
| Footer | in 95:14 | — |

Suggested anchor ids are in the right column (Polish, no diacritics). The nav order is: Cennik, O nas, FAQ, Bon podarunkowy, Zespół, Kontakt.

### Mobile homepage sections (240:1064)
- Services 240:1085 (category 03 card 240:1095, panel list 240:1145)
- FAQ 240:1258 (list 240:1264)
- Menu button 242:1201

### Services block component set (all states in one place)
164:1339: the variants are Default, Category 01–06 (one panel open), Search results (query "głow"), and Search empty (query "shiatsu").

### Overlays — desktop
| Overlay | Node |
|---|---|
| Rezerwacja (general chooser) | 293:1219 |
| Rezerwacja: Anastazja | 293:1435 |
| Rezerwacja: Ina | 293:1651 |
| Bon podarunkowy (form) | 165:887 |
| Bon wysłany (success) | 165:947 |
| Polityka prywatności | 226:1057 |
| Cookie banner | 232:1064 |
| Ustawienia cookies | 232:1074 |

### Overlays — mobile
| Overlay | Node |
|---|---|
| Menu | 242:1204 |
| Rezerwacja / Anastazja / Ina (bottom sheets) | 293:1327 / 293:1543 / 293:1759 |
| Bon podarunkowy (full screen) | 251:1191 |
| Bon wysłany | 251:1241 |
| Polityka prywatności | 251:1253 |
| Cookie banner | 251:1301 |
| Ustawienia cookies (bottom sheet) | 251:1302 |

### Components (section "Components" 353:4400)
| Component | Node |
|---|---|
| Button | 352:1681 |
| Icon link | 352:1709 |
| Text link | 352:1726 |
| Booking option | 354:3566 |
| Booking icons (calendar / chat / at / arrow-up-right) | 292:1217, 292:1221, 292:1225, 292:1228 |
| Service card | 163:122 |
| Treatment row | 163:126 |
| Treatment row / Mobile | 241:1194 |
| Price pill | 163:123 |
| FAQ item | 152:103 |
| Team card | 152:104 |
| Filter chip | 152:89 |
| Form field | 152:125 |
| Language switch | 207:1062 |
| Toggle | 232:1061 |
| Services header | 191:986 |

## Other pages
| Page / item | Node |
|---|---|
| Components (logo set, brand icons, colours) | page 0:1; logo set 47:75, brand icon set 45:1912 |
| Printables: gift certificate front / back | 520:83 / 520:82 |
| Printables: filled certificate examples | 520:86 |
| Landing back end (admin panel, developer's part) | page 353:4297; desktop section 397:87, mobile section 429:1594, components 393:11 |
| Instagram stories (price lists, FAQ, team) | page 43:1452 |

## Assets to export from Figma
- Logo SVGs (all colour versions) and the brand icon/favicon from Components 0:1.
- Hero visual, studio interior photo (About), team cut-out portraits, the certificate preview. Export as PNG at 2× and convert to WebP/AVIF with Astro `<Image>`.
- Booking icons (292:1217–292:1228) and other icons as SVG.
