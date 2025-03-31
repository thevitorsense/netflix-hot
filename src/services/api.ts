import axios from 'axios';
import { PaymentResponse } from '../types';
import { supabase, createTransaction, updateTransactionStatus, createUserSubscription } from './supabase';
import { generatePixPayment as generatePix, checkPaymentStatus as checkStatus, handlePushinPayWebhook as handleWebhook } from './pix';

// Export the PIX functions from our pix.ts file
export const generatePixPayment = generatePix;
export const checkPaymentStatus = checkStatus;
export const handlePushinPayWebhook = handleWebhook;
