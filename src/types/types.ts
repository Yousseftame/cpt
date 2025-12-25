// src/types/ticket.ts
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

// src/types/ticket.ts
import { Timestamp } from 'firebase/firestore';

export interface InternalNote {
  note: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface TicketMessage {
  senderId: string;
  senderType: 'customer' | 'admin';
  message: string;
  attachments: string[];
  createdAt: Timestamp;
}

export interface Ticket {
  id: string;
  subject: string;
  message: string;
  customerId: string;
  priority: TicketPriority;
  status: TicketStatus;

  assignedAdminId: string | null;
  assignedAt: Timestamp | null;

  internalNotes: InternalNote[];
  messages: TicketMessage[];

  createdAt: Timestamp;
}
