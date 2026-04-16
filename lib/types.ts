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
  size: "2oz" | "5.5oz";
  quantity: number;
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
