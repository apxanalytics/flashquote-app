const UNIT_PATTERNS = [
  { unit: 'sqft', re: /\b(\d+(?:\.\d+)?)\s*(?:sq\s*\.?\s*ft|sqft|square\s*feet)\b/i },
  { unit: 'lf', re: /\b(\d+(?:\.\d+)?)\s*(?:lf|linear\s*feet?)\b/i },
  { unit: 'each', re: /\b(\d+(?:\.\d+)?)\s*(?:each|ea)\b/i },
  { unit: 'hour', re: /\b(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)\b/i },
  { unit: 'day', re: /\b(\d+(?:\.\d+)?)\s*(?:days?)\b/i },
];

export function extractQtyUnit(text: string): { quantity: number; unit: string; conf: number } | null {
  for (const p of UNIT_PATTERNS) {
    const m = text.match(p.re);
    if (m) {
      return { quantity: Number(m[1]), unit: p.unit, conf: 0.9 };
    }
  }

  const m = text.match(/\b(\d+(?:\.\d+)?)\b/);
  return m ? { quantity: Number(m[1]), unit: 'each', conf: 0.5 } : null;
}

export interface PriceBookCategory {
  id: string;
  name: string;
  unit: string;
  price: number;
  aliases: string[];
}

export function findCategory(
  desc: string,
  catalog: PriceBookCategory[]
): { category: PriceBookCategory; conf: number } | null {
  const d = desc.toLowerCase();

  for (const c of catalog) {
    if (d.includes(c.name.toLowerCase())) {
      return { category: c, conf: 0.95 };
    }

    if (c.aliases?.some((a: string) => d.includes(a.toLowerCase()))) {
      return { category: c, conf: 0.9 };
    }
  }

  return null;
}
