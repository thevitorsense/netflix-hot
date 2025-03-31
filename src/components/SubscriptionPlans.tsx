import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { SubscriptionPlan } from '../types';

interface SubscriptionPlansProps {
  onSelectPlan: (plan: SubscriptionPlan) => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSelectPlan }) => {
  const [plans] = useState<SubscriptionPlan[]>([
    {
      id: 'lifetime',
      name: 'Acesso Vitalício',
      price: 39.90,
      period: 'pagamento único',
      features: [
        'Acesso a todo conteúdo',
        'Assista em qualquer dispositivo',
        'Suporte prioritário',
        'Atualizações vitalícias',
        'Acesso a conteúdos exclusivos',
        'Sem pagamentos recorrentes'
      ],
      popular: true
    }
  ]);

  return (
    <section id="planos" className="py-16 px-4 bg-manuflix-black">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Acesso Vitalício</h2>
        
        <div className="max-w-md mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className="bg-manuflix-dark rounded-lg overflow-hidden transition-transform hover:scale-105 border-2 border-manuflix-red relative"
            >
              <div className="absolute top-0 right-0 bg-manuflix-red text-white px-4 py-1 rounded-bl-lg flex items-center">
                <Star size={16} className="mr-1" />
                <span className="text-sm font-bold">Oferta Especial</span>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">R$ {plan.price.toFixed(2)}</span>
                  <span className="text-manuflix-gray ml-2">{plan.period}</span>
                </div>
                
                <ul className="mb-6 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check size={20} className="text-manuflix-red mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => onSelectPlan(plan)}
                  className="w-full py-3 rounded font-bold transition-colors bg-manuflix-red text-white hover:bg-opacity-80 pulse-red"
                >
                  Assinar Agora
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
