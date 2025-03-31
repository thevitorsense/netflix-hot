export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export interface PaymentResponse {
  id: string;
  qrcode_image: string;
  copy_paste: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  expiration_date: string;
}

export interface Transaction {
  id: string;
  user_id?: string;
  plan_id: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'cancelled';
  payment_id: string;
  created_at: string;
}
