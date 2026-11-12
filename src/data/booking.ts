/**
 * Booking chooser content from site.json → booking, with the Instagram rule applied:
 * profile link by default, ig.me DM link on touch phones (see scripts/touch-links.ts).
 *
 * Choosers open from any element with data-booking="<id>":
 *   general     every "Zarezerwuj wizytę" / "Zarezerwuj" button
 *   anastazja   team card link (one per key in booking.therapists)
 *   ina
 */
import type { Content } from './index';

export type BookingIcon = 'calendar' | 'chat' | 'at';
export type BookingRow = {
  id: string;
  icon: BookingIcon;
  title: string;
  hint: string;
  href: string;
  hrefTouch?: string;
  note?: string;
};
export type BookingGroup = { label: string; options: BookingRow[] };
export type Chooser = { id: string; title: string[]; intro: string; groups: BookingGroup[] };

export const chooserDialogId = (id: string) => `booking-${id}`;

export function generalBookingGroups({ site }: Content): BookingGroup[] {
  return site.booking.general.groups.map((group) => ({
    label: group.label,
    options: group.options.map((o) =>
      o.id === 'instagram'
        ? { ...o, icon: o.icon as BookingIcon, href: site.studio.instagramProfile, hrefTouch: site.studio.instagramDm }
        : { ...o, icon: o.icon as BookingIcon, href: o.url },
    ),
  }));
}

/** Same layout as the general chooser, with the therapist's own links, hints and note. */
function therapistGroups(content: Content, key: string): BookingGroup[] {
  const { site } = content;
  const t = site.booking.therapists[key as keyof typeof site.booking.therapists];
  const general = generalBookingGroups(content);
  const titleOf = (id: string) => general.flatMap((g) => g.options).find((o) => o.id === id)?.title ?? id;
  const [online, message] = general;

  return [
    {
      label: online.label,
      options: [
        { id: 'booksy', icon: 'calendar', title: titleOf('booksy'), hint: t.hint, href: t.booksy },
        { id: 'fresha', icon: 'calendar', title: titleOf('fresha'), hint: t.hint, href: t.fresha },
      ],
    },
    {
      label: message.label,
      options: [
        { id: 'whatsapp', icon: 'chat', title: titleOf('whatsapp'), hint: site.studio.phone, href: t.whatsapp, note: t.note },
        {
          id: 'instagram',
          icon: 'at',
          title: titleOf('instagram'),
          hint: site.studio.instagramHandle,
          href: site.studio.instagramProfile,
          hrefTouch: site.studio.instagramDm,
          note: t.note,
        },
      ],
    },
  ];
}

export function allChoosers(content: Content): Chooser[] {
  const { general, therapists } = content.site.booking;
  return [
    { id: 'general', title: general.title, intro: general.intro, groups: generalBookingGroups(content) },
    ...Object.entries(therapists).map(([key, t]) => ({
      id: key,
      title: t.title,
      intro: t.intro,
      groups: therapistGroups(content, key),
    })),
  ];
}
