
export enum TicketCategory {
  INDIVIDUAL = 'Individual',
  DUO = 'Duo',
  TRIO = 'Trio',
  GROUP = 'Group'
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  category: TicketCategory;
  capacity?: number;
  maxPeople: number;
}

export interface FormData {
  fullName: string;
  phone: string;
  email: string;
  ticketId: string;
  additionalNames: string[];
  wantsUpdates: boolean;
  paymentReceipt: File | null;
}
