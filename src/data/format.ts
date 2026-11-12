/** Small formatting helpers shared by components. Templates come from ui.*.json. */

/** Replace {key} placeholders in a template string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

type Option = { duration: string; price: number };
type Treatment = { name: string; options: Option[] };

/** Lowest price in a category. Calculated, never read from the stored "from" value. */
export function lowestPrice(treatments: Treatment[]): number {
  return Math.min(...treatments.flatMap((t) => t.options.map((o) => o.price)));
}
