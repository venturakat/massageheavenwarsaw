/**
 * Privacy policy from docs/content/privacy-policy.pl.md (the source of truth).
 * Turns the Markdown into a simple structure: lead paragraph, numbered sections
 * with paragraphs and bullet lists, and the "last updated" line.
 * [Bracketed placeholders] become <span class="policy-placeholder"> (shown in plum);
 * e-mail addresses become mailto links.
 */
import type { Locale } from './index';

const sources = import.meta.glob<string>('../../docs/content/privacy-policy.*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export type Block = { type: 'p' | 'ul'; items: string[] };
export type Section = { title: string; blocks: Block[] };
export type Policy = { title: string; lead: string; sections: Section[]; updated?: string };

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Escaped HTML with placeholders highlighted and e-mail addresses as mailto links. */
export const inline = (text: string) =>
  escape(text)
    .replace(/\[([^\]]+)\]/g, '<span class="policy-placeholder">[$1]</span>')
    .replace(/\b([\w.+-]+@[\w-]+(?:\.[\w-]+)+)\b/g, '<a class="policy-link" href="mailto:$1">$1</a>');

export function parsePolicy(markdown: string, updatedPrefix: string): Policy {
  const lines = markdown.replace(/<!--[\s\S]*?-->/g, '').split('\n');
  const policy: Policy = { title: '', lead: '', sections: [] };
  let section: Section | null = null;
  let paragraph: string[] = [];
  let list: string[] | null = null;

  const flush = () => {
    if (paragraph.length) {
      const text = paragraph.join(' ');
      if (text.startsWith(updatedPrefix)) policy.updated = text;
      else if (section) section.blocks.push({ type: 'p', items: [text] });
      else if (policy.title && !policy.lead) policy.lead = text;
      paragraph = [];
    }
    if (list && section) section.blocks.push({ type: 'ul', items: list });
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
    } else if (line.startsWith('## ')) {
      flush();
      section = { title: line.slice(3), blocks: [] };
      policy.sections.push(section);
    } else if (line.startsWith('# ')) {
      flush();
      policy.title = line.slice(2);
    } else if (line.startsWith('- ')) {
      if (paragraph.length) flush();
      (list ??= []).push(line.slice(2));
    } else {
      if (list) flush();
      paragraph.push(line);
    }
  }
  flush();
  return policy;
}

/** The policy for a locale, or the Polish one until it's translated. */
export function policySource(locale: Locale): string {
  return sources[`../../docs/content/privacy-policy.${locale}.md`] ?? sources['../../docs/content/privacy-policy.pl.md'];
}
