import React, { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { PaymentPage } from './pages/PaymentPage';
import { SubscriptionPlan } from './types';

function App() {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
  };
  
  const handlePaymentComplete = () => {
    setPaymentCompleted(true);
    console.log('Payment completed successfully');
  };
  
  const handleBackToPlans = () => {
    setSelectedPlan(null);
  };
  
  return (
    <div className="min-h-screen bg-manuflix-black text-white">
      {selectedPlan ? (
        <PaymentPage 
          plan={selectedPlan} 
          onBack={handleBackToPlans}
          onPaymentComplete={handlePaymentComplete}
        />
      ) : (
        <LandingPage onSelectPlan={handleSelectPlan} />
      )}
    </div>
  );
}

export default App;
