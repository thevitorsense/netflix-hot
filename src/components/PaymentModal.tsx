import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Loader2, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { SubscriptionPlan, PaymentResponse } from '../types';
import { generatePixPayment, checkPaymentStatus } from '../services/pix';

interface PaymentModalProps {
  plan: SubscriptionPlan;
  onClose: () => void;
  onPaymentComplete: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  plan, 
  onClose,
  onPaymentComplete
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(3600); // 1 hour default
  const [statusCheckCount, setStatusCheckCount] = useState(0);

  // Generate PIX code automatically when modal opens
  useEffect(() => {
    generatePix();
  }, []);

  const generatePix = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await generatePixPayment(plan.price);
      
      if (!response || !response.qr_code) {
        throw new Error('Falha ao gerar o código PIX. Tente novamente.');
      }
      
      setPaymentData({
        id: response.id,
        qrcode_image: `data:image/png;base64,${response.qr_code_base64}`,
        copy_paste: response.qr_code,
        status: 'PENDING',
        expiration_date: new Date(Date.now() + 3600 * 1000).toISOString() // 1 hour from now
      });
      
      // Reset status check count
      setStatusCheckCount(0);
    } catch (err) {
      console.error('Error generating payment:', err);
      setError('Erro ao gerar o pagamento. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = async () => {
    if (paymentData?.copy_paste) {
      try {
        await navigator.clipboard.writeText(paymentData.copy_paste);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const checkPaymentStatusHandler = async () => {
    if (!paymentData?.id) return;
    
    try {
      setCheckingStatus(true);
      const status = await checkPaymentStatus(paymentData.id);
      
      // Update payment data with new status
      setPaymentData(prev => prev ? { ...prev, status } : null);
      
      // Increment check count
      setStatusCheckCount(prev => prev + 1);
      
      if (status === 'PAID') {
        onPaymentComplete();
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  // Format time left as MM:SS
  const formatTimeLeft = () => {
    if (timeLeft === null) return '00:00';
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Check payment status periodically
  useEffect(() => {
    if (!paymentData?.id || paymentData.status === 'PAID') return;
    
    // Start with a 5-second interval
    const initialInterval = 5000;
    // Increase interval as more checks are performed (up to 30 seconds)
    const currentInterval = Math.min(initialInterval + (statusCheckCount * 1000), 30000);
    
    const checkInterval = setInterval(() => {
      checkPaymentStatusHandler();
    }, currentInterval);
    
    return () => clearInterval(checkInterval);
  }, [paymentData?.id, paymentData?.status, statusCheckCount]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-manuflix-dark rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Finalizar Pagamento</h3>
            <button 
              onClick={onClose}
              className="text-manuflix-gray hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="mb-6">
            <h4 className="font-bold mb-2">Resumo do pedido</h4>
            <div className="bg-black bg-opacity-30 p-4 rounded">
              <div className="flex justify-between mb-2">
                <span>{plan.name}</span>
                <span>R$ {plan.price.toFixed(2)}</span>
              </div>
              <div className="border-t border-manuflix-gray pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>R$ {plan.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 size={40} className="text-manuflix-red animate-spin mb-4" />
              <p>Gerando código PIX...</p>
            </div>
          ) : error ? (
            <div>
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-4 rounded mb-6">
                <p>{error}</p>
              </div>
              <button 
                onClick={generatePix}
                className="w-full bg-manuflix-red text-white p-3 rounded font-bold hover:bg-opacity-80 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          ) : paymentData ? (
            <div>
              <div className="mb-6">
                <h4 className="font-bold text-lg mb-4 text-center">Código PIX para Pagamento</h4>
                
                <div className="relative mb-8">
                  <div className="bg-black bg-opacity-30 p-4 rounded mb-2">
                    <p className="text-sm text-manuflix-gray mb-2">Código PIX:</p>
                    <p className="text-sm break-all mb-4">{paymentData.copy_paste}</p>
                    
                    <button 
                      onClick={copyPixCode}
                      className={`w-full flex items-center justify-center ${copied ? 'bg-green-600' : 'bg-manuflix-red'} text-white p-4 rounded font-bold hover:bg-opacity-90 transition-colors`}
                    >
                      {copied ? (
                        <>
                          <Check size={20} className="mr-2" />
                          Código Copiado!
                        </>
                      ) : (
                        <>
                          <Copy size={20} className="mr-2" />
                          Copiar Código PIX
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="bg-black bg-opacity-20 p-4 rounded mb-6">
                  <h5 className="font-bold mb-3 flex items-center">
                    <Smartphone size={18} className="mr-2 text-manuflix-red" />
                    Como pagar com PIX:
                  </h5>
                  
                  <ol className="space-y-4 text-sm">
                    <li className="flex">
                      <span className="bg-manuflix-red rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">1</span>
                      <div>
                        <p><strong>Abra o aplicativo do seu banco</strong></p>
                        <p className="text-manuflix-gray">Acesse o app do seu banco ou instituição financeira</p>
                      </div>
                    </li>
                    
                    <li className="flex">
                      <span className="bg-manuflix-red rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">2</span>
                      <div>
                        <p><strong>Encontre a opção PIX</strong></p>
                        <p className="text-manuflix-gray">Procure por "PIX" ou "Pagar com PIX" no menu principal</p>
                      </div>
                    </li>
                    
                    <li className="flex">
                      <span className="bg-manuflix-red rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">3</span>
                      <div>
                        <p><strong>Selecione "PIX Copia e Cola"</strong></p>
                        <p className="text-manuflix-gray">Escolha a opção para colar o código PIX</p>
                      </div>
                    </li>
                    
                    <li className="flex">
                      <span className="bg-manuflix-red rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">4</span>
                      <div className="flex items-start">
                        <div>
                          <p><strong>Cole o código PIX</strong></p>
                          <p className="text-manuflix-gray">Cole o código que você copiou no campo indicado</p>
                        </div>
                      </div>
                    </li>
                    
                    <li className="flex">
                      <span className="bg-manuflix-red rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0">5</span>
                      <div>
                        <p><strong>Confira os dados e confirme</strong></p>
                        <p className="text-manuflix-gray">Verifique se o valor é R$ {plan.price.toFixed(2)} e confirme o pagamento</p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
              
              <div className="text-center text-sm">
                <div className="flex items-center justify-center mb-2 text-manuflix-gray">
                  <AlertCircle size={16} className="mr-2" />
                  <p>O pagamento será confirmado automaticamente.</p>
                </div>
                
                {checkingStatus && (
                  <div className="flex items-center justify-center mt-2 text-manuflix-red">
                    <Loader2 size={16} className="animate-spin mr-2" />
                    <span>Verificando pagamento...</span>
                  </div>
                )}
                
                <div className="mt-4">
                  <button 
                    onClick={checkPaymentStatusHandler}
                    disabled={checkingStatus}
                    className="bg-manuflix-gray text-white px-4 py-2 rounded text-sm hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingStatus ? 'Verificando...' : 'Verificar Pagamento'}
                  </button>
                </div>
                
                <p className="mt-2">
                  Tempo restante: <span className="font-bold">{formatTimeLeft()}</span>
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
