export interface WingSelection {
  flavorId: string;
  quantity: number;
  style: "classic" | "boneless";
}

export interface ParticipantOrder {
  name: string;
  selections: WingSelection[];
  submittedAt: string;
}

export interface OrderSession {
  code: string;
  name: string;
  createdAt: string;
  orders: Record<string, ParticipantOrder>;
}
