export interface WingOrder {
  flavorId: string;
  quantity: number;
  style: "classic" | "boneless";
}

export interface SideOrder {
  sideId: string;
  quantity: number;
}

export interface ParticipantOrder {
  name: string;
  wings: WingOrder[];
  sides: SideOrder[];
  dips: string[]; // array of dip IDs
  submittedAt: string;
}

export interface OrderSession {
  code: string;
  name: string;
  createdAt: string;
  orders: Record<string, ParticipantOrder>;
}

// Legacy compat
export type WingSelection = WingOrder;
