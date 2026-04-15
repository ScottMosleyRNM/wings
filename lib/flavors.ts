export interface Flavor {
  id: string;
  name: string;
  heat: 0 | 1 | 2 | 3;
  description: string;
}

export const FLAVORS: Flavor[] = [
  { id: "lemon-pepper", name: "Lemon Pepper", heat: 0, description: "Tangy citrus with bold black pepper" },
  { id: "garlic-parmesan", name: "Garlic Parmesan", heat: 0, description: "Rich garlic butter with parmesan" },
  { id: "hickory-smoked-bbq", name: "Hickory Smoked BBQ", heat: 0, description: "Sweet and smoky classic BBQ" },
  { id: "honey-mustard", name: "Honey Mustard", heat: 0, description: "Sweet honey with tangy mustard" },
  { id: "louisiana-rub", name: "Louisiana Rub", heat: 1, description: "Cajun-spiced dry rub with mild heat" },
  { id: "mild", name: "Mild", heat: 1, description: "Classic buffalo with gentle heat" },
  { id: "original-hot", name: "Original Hot", heat: 2, description: "Classic hot buffalo sauce" },
  { id: "cajun", name: "Cajun", heat: 2, description: "Bold Southern spices with real heat" },
  { id: "hawaiian", name: "Hawaiian", heat: 1, description: "Sweet tropical pineapple glaze" },
  { id: "korean-q", name: "Korean Q", heat: 1, description: "Sweet and savory Korean BBQ glaze" },
  { id: "mango-habanero", name: "Mango Habanero", heat: 3, description: "Tropical sweet heat with habanero fire" },
  { id: "atomic", name: "Atomic", heat: 3, description: "Wingstop's hottest — not for the faint of heart" },
  { id: "spicy-korean-q", name: "Spicy Korean Q", heat: 2, description: "Korean Q with an added kick" },
  { id: "plain", name: "Plain", heat: 0, description: "Just the wing, no sauce" },
];

export const HEAT_LABELS = ["No Heat", "Mild", "Medium", "Hot"] as const;
export const HEAT_COLORS = ["text-gray-400", "text-yellow-500", "text-orange-500", "text-red-600"] as const;
export const WING_COUNTS = [5, 10, 15, 20, 25, 30, 50];
