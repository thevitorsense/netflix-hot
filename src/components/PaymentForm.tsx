import React, { useState, useEffect } from 'react';
import { QrCode, Lock, Check, Copy, Loader2 } from 'lucide-react';
import { generatePixPayment, checkPaymentStatus } from '../services/api';

interface PaymentFormProps {
  onComplete: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<{
    qrcode_image: string;
    copy_paste: string;
    id: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const response = await generatePixPayment(
        39.90, // Fixed price for the lifetime subscription
        'Acesso Vitalício Manuflix',
        '', // No email required
        '', // No name required
        undefined // No CPF required
      );
      
      setPixData({
        qrcode_image: response.qrcode_image,
        copy_paste: response.copy_paste,
        id: response.id
      });
      
      // Calculate expiration time in seconds
      const expirationDate = new Date(response.expiration_date);
      const now = new Date();
      const expirationSeconds = Math.floor((expirationDate.getTime() - now.getTime()) / 1000);
      setTimeLeft(expirationSeconds > 0 ? expirationSeconds : 3600);
      
    } catch (error) {
      console.error('Error generating PIX:', error);
      setError('Erro ao gerar o PIX. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const copyPixCode = async () => {
    if (pixData?.copy_paste) {
      try {
        await navigator.clipboard.writeText(pixData.copy_paste);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
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
    if (!pixData?.id) return;
    
    const checkInterval = setInterval(async () => {
      try {
        setCheckingStatus(true);
        const status = await checkPaymentStatus(pixData.id);
        
        if (status === 'PAID') {
          clearInterval(checkInterval);
          onComplete();
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
      } finally {
        setCheckingStatus(false);
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(checkInterval);
  }, [pixData?.id, onComplete]);
  
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Método de Pagamento</h3>
        
        <div className="payment-option selected">
          <div className="flex flex-col items-center">
            <QrCode className="mb-2 text-manuflix-red" />
            <span>PIX</span>
          </div>
        </div>
      </div>
      
      {!pixData ? (
        <>
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-manuflix-red text-white p-4 rounded font-bold text-lg hover:bg-opacity-80 transition-colors pulse-red disabled:bg-opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Processando...
                </span>
              ) : (
                'GERAR QR CODE PIX'
              )}
            </button>
            
            <div className="flex items-center justify-center mt-4 text-sm text-manuflix-gray">
              <Lock size={16} className="mr-2" />
              <span>Pagamento 100% seguro</span>
            </div>
          </div>
        </>
      ) : (
        <div id="pix-container" className="bg-manuflix-dark p-6 rounded-lg mb-6">
          <h3 className="text-xl font-bold mb-4 text-center">Escaneie o QR Code ou copie o código PIX</h3>
          
          <div className="bg-white p-4 rounded-lg inline-block mb-4 mx-auto block">
            <img 
              src={pixData.qrcode_image} 
              alt="QR Code PIX" 
              className="w-48 h-48 mx-auto"
            />
          </div>
          
          <div className="relative mb-8">
            <p className="text-sm mb-2">Código PIX copia e cola:</p>
            <div className="bg-black bg-opacity-30 p-3 rounded flex items-center justify-between mb-2">
              <span className="text-sm truncate mr-2">{pixData.copy_paste}</span>
              <button 
                type="button"
                onClick={copyPixCode}
                className="bg-manuflix-gray text-white p-2 rounded hover:bg-opacity-80 transition-colors"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            {copied && (
              <div className="absolute -bottom-6 left-0 right-0 text-green-500 text-sm text-center">
                Código copiado com sucesso!
              </div>
            )}
          </div>
          
          <div className="text-center text-sm">
            <p className="mb-2">O pagamento será confirmado automaticamente.</p>
            {checkingStatus && (
              <div className="flex items-center justify-center mt-2 text-manuflix-red">
                <Loader2 size={16} className="animate-spin mr-2" />
                <span>Verificando pagamento...</span>
              </div>
            )}
            <p className="mt-2">
              Este QR Code expira em: <span className="font-bold">{formatTimeLeft()}</span>
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-manuflix-dark p-4 rounded-lg">
        <h4 className="font-bold mb-2">Resumo da compra</h4>
        <div className="flex justify-between mb-2">
          <span>Acesso Vitalício Manuflix</span>
          <span>R$ 39,90</span>
        </div>
        <div className="border-t border-manuflix-gray pt-2 flex justify-between font-bold">
          <span>Total</span>
          <span>R$ 39,90</span>
        </div>
      </div>
    </form>
  );
};
