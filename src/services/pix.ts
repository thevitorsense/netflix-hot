import { PaymentResponse } from '../types';

const API_TOKEN = '22087|3sI0vvVA70KRDDPbzH6WZdzr6JWmiYFOiz52H7wCf874b044';
const API_BASE = 'https://api.pushinpay.com.br/api';

export async function generatePixPayment(
  amount: number
): Promise<{
  id: string;
  qr_code: string;
  qr_code_base64: string;
}> {
  try {
    // Convert amount to cents as required by PushinPay
    const amountInCents = Math.round(amount * 100);
    
    // Prepare payload according to PushinPay API
    const payload = {
      value: amountInCents,
      webhook_url: window.location.origin + '/api/webhook'
    };
    
    const response = await fetch(`${API_BASE}/pix/cashIn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(`Failed to generate PIX payment: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.id || !data.qr_code) {
      console.error('Invalid API response:', data);
      throw new Error('Invalid response from payment gateway');
    }
    
    return {
      id: data.id,
      qr_code: data.qr_code,
      qr_code_base64: data.qr_code_base64
    };
  } catch (error) {
    console.error('Error generating PIX payment:', error);
    throw error;
  }
}

export async function checkPaymentStatus(paymentId: string): Promise<string> {
  try {
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }
    
    const response = await fetch(`${API_BASE}/transaction/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(`Failed to check payment status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data || !data.status) {
      console.error('Invalid status response:', data);
      throw new Error('Invalid response from payment gateway');
    }
    
    // Map PushinPay status to our application status
    // Only return PAID if the gateway explicitly confirms payment
    let mappedStatus = 'PENDING';
    if (data.status === 'PAID' || data.status === 'COMPLETED') {
      mappedStatus = 'PAID';
    } else if (data.status === 'EXPIRED' || data.status === 'CANCELLED') {
      mappedStatus = 'CANCELLED';
    }
    
    console.log(`Payment ${paymentId} status: ${data.status} -> ${mappedStatus}`);
    return mappedStatus;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
}

// Webhook handler for PushinPay notifications
export async function handlePushinPayWebhook(event: any) {
  try {
    const { id, status } = event;
    
    if (!id) {
      throw new Error('Missing payment ID in webhook payload');
    }
    
    // Map PushinPay status to our application status
    let mappedStatus = 'pending';
    if (status === 'PAID' || status === 'COMPLETED') {
      mappedStatus = 'paid';
    } else if (status === 'EXPIRED' || status === 'CANCELLED') {
      mappedStatus = 'cancelled';
    }
    
    // Here you would update the transaction in your database
    // This will be handled by the api.ts service
    
    return { success: true };
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
}
