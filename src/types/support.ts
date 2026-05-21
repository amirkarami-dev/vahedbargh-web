// ─── Support (Ticket) ──────────────────────────────────────────────────────────

export interface Support {
  id: string;
  clientId: string;
  userId: string;
  toUserId: string | null;
  ticketNumber: string | null;
  userType: number;
  title: string;
  fileNumber: string | null;
  rate: number | null;
  isRead: boolean;
  closed: boolean;
  field1: string | null;
  field2: string | null;
  solarCreated: string | null;
  createdAt: string;
  updatedAt: string | null;
}

// ─── Support Message ───────────────────────────────────────────────────────────

export interface SupportMessage {
  id: string;
  clientId: string;
  supportId: string;
  userId: string;
  message: string;
  createdAt: string;
}

// ─── Support File ──────────────────────────────────────────────────────────────

export interface SupportFile {
  id: string;
  clientId: string;
  supportId: string;
  storagePath: string;
  name: string | null;
  createdAt: string;
}
