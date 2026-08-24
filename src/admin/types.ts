export interface Session {
  username: string;
  csrf: string;
}

export interface Guest {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  attendance: "yes" | "no";
  guests: number;
  slot: string | null;
  interest: string | null;
  message: string | null;
  theme: string | null;
  created_at: string;
  payment_status: string | null;
  payment_amount: string | null;
}

export interface Payment {
  id: number;
  user_id: number;
  amount: string;
  method: string;
  status: string;
  reference: string | null;
  notes: string | null;
  paid_at: string | null;
  user_name: string;
  user_email: string;
  user_whatsapp: string;
}
