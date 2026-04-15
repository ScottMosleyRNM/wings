// ── Wings ────────────────────────────────────────────────────────────────────

export interface Flavor {
  id: string;
  name: string;
  heat: 0 | 1 | 2 | 3; // 0=none 1=mild 2=medium 3=hot
  description: string;
}

export const FLAVORS: Flavor[] = [
  { id: "lemon-pepper",      name: "Lemon Pepper",        heat: 0, description: "Tangy citrus with bold black pepper" },
  { id: "garlic-parmesan",   name: "Garlic Parmesan",      heat: 0, description: "Rich garlic butter with parmesan" },
  { id: "hickory-smoked-bbq",name: "Hickory Smoked BBQ",   heat: 0, description: "Sweet and smoky classic BBQ" },
  { id: "honey-mustard",     name: "Honey Mustard",        heat: 0, description: "Sweet honey with tangy mustard" },
  { id: "plain",             name: "Plain",                heat: 0, description: "Just the wing, no sauce" },
  { id: "louisiana-rub",     name: "Louisiana Rub",        heat: 1, description: "Cajun-spiced dry rub" },
  { id: "mild",              name: "Mild",                 heat: 1, description: "Classic buffalo with gentle heat" },
  { id: "hawaiian",          name: "Hawaiian",             heat: 1, description: "Sweet tropical pineapple glaze" },
  { id: "korean-q",          name: "Korean Q",             heat: 1, description: "Sweet and savory Korean BBQ glaze" },
  { id: "original-hot",      name: "Original Hot",         heat: 2, description: "Classic hot buffalo sauce" },
  { id: "cajun",             name: "Cajun",                heat: 2, description: "Bold Southern spices with heat" },
  { id: "spicy-korean-q",    name: "Spicy Korean Q",       heat: 2, description: "Korean Q with an added kick" },
  { id: "mango-habanero",    name: "Mango Habanero",       heat: 3, description: "Tropical sweet heat with habanero fire" },
  { id: "atomic",            name: "Atomic",               heat: 3, description: "Wingstop's hottest — not for the faint of heart" },
];

export const HEAT_LABELS  = ["No Heat", "Mild", "Medium", "Hot"] as const;
export const HEAT_COLORS  = ["#8b949e", "#E9C423", "#F97316", "#EF4444"] as const;
export const HEAT_BG      = ["#1c2128", "#2a2200", "#2a1400", "#2a0a0a"] as const;
export const WING_COUNTS  = [5, 10, 15, 20, 25, 30, 50];

// ── Sides ─────────────────────────────────────────────────────────────────────

export interface Side {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const SIDES: Side[] = [
  { id: "seasoned-fries",    name: "Seasoned Fries",          emoji: "🍟", description: "Classic Wingstop seasoned fries" },
  { id: "cajun-fries",       name: "Cajun Fries",             emoji: "🌶️", description: "Fries tossed in Cajun seasoning" },
  { id: "voodoo-fries",      name: "Louisiana Voodoo Fries",  emoji: "✨", description: "Cajun fries with ranch drizzle" },
  { id: "loaded-fries",      name: "Loaded Fries",            emoji: "🧀", description: "Fries with cheese sauce" },
  { id: "coleslaw",          name: "Coleslaw",                emoji: "🥗", description: "Creamy classic coleslaw" },
  { id: "corn",              name: "Corn on the Cob",         emoji: "🌽", description: "Buttery corn on the cob" },
  { id: "mac-cheese",        name: "Mac & Cheese",            emoji: "🧀", description: "Creamy macaroni and cheese" },
  { id: "potato-wedges",     name: "Potato Wedges",           emoji: "🥔", description: "Crispy seasoned potato wedges" },
];

export const SIDE_QTY = [1, 2, 3];

// ── Dips ──────────────────────────────────────────────────────────────────────

export interface Dip {
  id: string;
  name: string;
  emoji: string;
}

export const DIPS: Dip[] = [
  { id: "ranch",            name: "Ranch",             emoji: "🤍" },
  { id: "bleu-cheese",      name: "Bleu Cheese",        emoji: "🫙" },
  { id: "honey-mustard",    name: "Honey Mustard",      emoji: "🍯" },
  { id: "bbq",              name: "BBQ Sauce",          emoji: "🍖" },
  { id: "garlic-parmesan",  name: "Garlic Parmesan",    emoji: "🧄" },
];
