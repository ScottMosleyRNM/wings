// Menu data mirrors wingstop.com (verified 2026-09-17).
// Prices/availability are store-specific; this app only tracks what people want,
// so we keep names, descriptions and option shapes — not prices.

// ── Wings ────────────────────────────────────────────────────────────────────

export interface Flavor {
  id: string;
  name: string;
  /** Bucketed from Wingstop's 0–5 flame scale: 0→0, 1–2→1, 3→2, 4–5→3. */
  heat: 0 | 1 | 2 | 3;
  description: string;
}

// The 13 permanent flavors. Limited-time flavors (currently Lemon Pepper Chili
// Crunch and Lemon Pepper Chili Glaze) are deliberately left out.
export const FLAVORS: Flavor[] = [
  { id: "garlic-parmesan",    name: "Garlic Parmesan",    heat: 0, description: "Savory garlic, buttery parmesan — simple, potent, delicious" },
  { id: "hawaiian",           name: "Hawaiian",           heat: 0, description: "A sweet and tangy blend of island citrus" },
  { id: "plain",              name: "Plain",              heat: 0, description: "No flavor? No problem. Get em plain." },
  { id: "lemon-pepper",       name: "Lemon Pepper",       heat: 1, description: "Zesty lemon and cracked black pepper — the gateway flavor" },
  { id: "hickory-smoked-bbq", name: "Hickory Smoked BBQ", heat: 1, description: "Bold, smoky, sweet and rich" },
  { id: "mild",               name: "Mild",               heat: 1, description: "That O.G. hot, turned down a notch" },
  { id: "original-hot",       name: "Original Hot",       heat: 2, description: "The first sauce we tossed — full of heat and tang" },
  { id: "hot-honey-rub",      name: "Hot Honey Rub",      heat: 2, description: "Sweet honey in a fiery dry rub" },
  { id: "louisiana-rub",      name: "Louisiana Rub",      heat: 2, description: "A crispy, spiced dry rub with a distinctly Cajun drawl" },
  { id: "spicy-korean-q",     name: "Spicy Korean Q",     heat: 2, description: "Korean-inspired glaze with garlic, soy, honey sweetness and a kick" },
  { id: "cajun",              name: "Cajun",              heat: 3, description: "Tossed in Original Hot, dusted with bold and zesty Cajun seasoning" },
  { id: "mango-habanero",     name: "Mango Habanero",     heat: 3, description: "It's sweet, with heat. And then some. Seriously." },
  { id: "atomic",             name: "Atomic",             heat: 3, description: "It's the hottest we've got. Find out for yourself." },
];

export const HEAT_LABELS    = ["No Heat", "Mild", "Medium", "Hot"] as const;
export const HEAT_COLORS    = ["#8b949e", "#E9C423", "#F97316", "#EF4444"] as const;
export const HEAT_BG        = ["#1c2128", "#2a2200", "#2a1400", "#2a0a0a"] as const;
export const WING_QUICK_PICKS = [5, 10, 15, 20, 25, 30, 50];

// ── Sides ─────────────────────────────────────────────────────────────────────

export interface Side {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const SIDES: Side[] = [
  { id: "seasoned-fries",     name: "Seasoned Fries",         emoji: "🍟", description: "Hand-tossed in our signature Fry Seasoning" },
  { id: "cheese-fries",       name: "Cheese Fries",           emoji: "🧀", description: "Seasoned Fries topped with creamy jalapeño cheese sauce" },
  { id: "voodoo-fries",       name: "Louisiana Voodoo Fries", emoji: "✨",  description: "Cajun-seasoned fries with cheese sauce and House Made Ranch" },
  { id: "buffalo-ranch-fries", name: "Buffalo Ranch Fries",   emoji: "🌶️", description: "Seasoned Fries with Original Hot sauce and House Made Ranch" },
  { id: "cajun-fried-corn",   name: "Cajun Fried Corn",       emoji: "🌽", description: "Corn on the cob with Fry Seasoning and Cajun seasoning" },
  { id: "veggie-sticks",      name: "Veggie Sticks",          emoji: "🥕", description: "Fresh, chilled celery and carrot sticks" },
];

export const SIDE_QTY = [1, 2, 3];

// ── Dips ──────────────────────────────────────────────────────────────────────

export interface Dip {
  id: string;
  name: string;
  emoji: string;
  /** Size options as Wingstop lists them. Empty means the item has no sizes. */
  sizes: readonly string[];
  /** Side of Flavor: the customer picks one of the wing flavors instead. */
  pickFlavor?: boolean;
}

export const DIPS: Dip[] = [
  { id: "ranch",          name: "Ranch",          emoji: "🤍", sizes: ["Regular", "Large"] },
  { id: "bleu-cheese",    name: "Bleu Cheese",    emoji: "🫙", sizes: ["Regular", "Large"] },
  { id: "honey-mustard",  name: "Honey Mustard",  emoji: "🍯", sizes: ["Regular", "Large"] },
  { id: "cheese-sauce",   name: "Cheese Sauce",   emoji: "🧀", sizes: ["Regular", "Medium"] },
  { id: "side-of-flavor", name: "Side of Flavor", emoji: "🍗", sizes: [], pickFlavor: true },
];

export const DIP_QTY = [1, 2, 3];

/** Orders saved before sizes matched the menu used "2oz"/"5.5oz". */
export function normalizeDipSize(dip: Dip | undefined, size: string | undefined): string {
  if (!dip) return size ?? "";
  if (dip.sizes.length === 0) return "";
  if (size && dip.sizes.includes(size)) return size;
  return dip.sizes[0];
}
