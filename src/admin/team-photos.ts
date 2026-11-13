/**
 * Portraits for the admin prototype (the same cut-out PNGs the website uses).
 * Built-in portraits are looked up by person id when shown and never stored in the data:
 * their URLs differ between the dev server and a build, so a stored one goes stale.
 * Only an uploaded photo (a data: URL in the prototype, a storage URL in phase 2) is stored.
 */
import anastazja from '../assets/team/anastazja.png';
import ina from '../assets/team/ina.png';
import type { Person } from './types';

const builtIn: Record<string, string> = { anastazja: anastazja.src, ina: ina.src };

export const photoOf = (p: Pick<Person, 'id' | 'photo'>): string | undefined => p.photo || builtIn[p.id];

/** Keeps uploaded photos, drops stale built-in URLs saved by an earlier prototype version. */
export const isStoredPhoto = (url: string | undefined) => Boolean(url && /^(data:|https?:)/.test(url));

