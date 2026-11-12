/**
 * Team portraits, keyed by the person id in docs/content/team.json.
 * Cut-out PNGs exported from Figma (156:836, 156:837); Astro converts them to WebP.
 */
import type { ImageMetadata } from 'astro';
import anastazja from '../assets/team/anastazja.png';
import ina from '../assets/team/ina.png';

export const teamPhotos: Record<string, ImageMetadata> = { anastazja, ina };
