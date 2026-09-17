export interface WingOrder {
  flavorId: string;
  quantity: number;
  style: "classic" | "boneless";
}

export interface SideOrder {
  sideId: string;
  quantity: number;
}

export interface DipOrder {
  dipId: string;
  /** A size from the dip's own list ("Regular" | "Large" | "Medium"), or "" when it has none. */
  size: string;
  quantity: number;
  /** Side of Flavor only: which wing flavor to serve on the side. */
  flavorId?: string;
}

export interface ParticipantOrder {
  name: string;
  wings: WingOrder[];
  sides: SideOrder[];
  dips: DipOrder[];
  submittedAt: string;
}

export interface OrderSession {
  code: string;
  name: string;
  createdAt: string;
  orders: Record<string, ParticipantOrder>;
}

export type WingSelection = WingOrder;
