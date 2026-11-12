/**
 * Booking chooser options from site.json → booking, with the Instagram rule applied:
 * profile link by default, ig.me DM link on touch phones (see scripts/touch-links.ts).
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
