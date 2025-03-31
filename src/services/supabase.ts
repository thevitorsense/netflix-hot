import { createClient } from '@supabase/supabase-js';
import { SubscriptionPlan, Transaction } from '../types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Subscription plans
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price', { ascending: true });
  
  if (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
  
  return data || [];
}

// Transactions
export async function createTransaction(
  planId: string,
  amount: number,
  paymentMethod: string,
  paymentId: string,
  userId?: string
): Promise<string> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      plan_id: planId,
      amount,
      payment_method: paymentMethod,
      status: 'pending',
      payment_id: paymentId,
      user_id: userId || null
    })
    .select('id')
    .single();
  
  if (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
  
  return data.id;
}

export async function updateTransactionStatus(
  paymentId: string,
  status: 'pending' | 'completed' | 'cancelled'
): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .update({ status })
    .eq('payment_id', paymentId);
  
  if (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
}

export async function getTransactionByPaymentId(
  paymentId: string
): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('payment_id', paymentId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching transaction:', error);
    throw error;
  }
  
  return data;
}

// User subscriptions
export async function createUserSubscription(
  userId: string,
  planId: string,
  transactionId: string,
  expiresAt?: string
): Promise<void> {
  const { error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      plan_id: planId,
      transaction_id: transactionId,
      status: 'active',
      expires_at: expiresAt || null // null for lifetime subscriptions
    });
  
  if (error) {
    console.error('Error creating user subscription:', error);
    throw error;
  }
}
