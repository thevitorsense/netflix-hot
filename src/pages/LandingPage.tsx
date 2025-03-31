import React, { useRef } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { ContentPreview } from '../components/ContentPreview';
import { DeviceSection } from '../components/DeviceSection';
import { FAQ } from '../components/FAQ';
import { Footer } from '../components/Footer';
import { SubscriptionPlans } from '../components/SubscriptionPlans';
import { SubscriptionPlan } from '../types';

interface LandingPageProps {
  onSelectPlan: (plan: SubscriptionPlan) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectPlan }) => {
  const subscriptionRef = useRef<HTMLDivElement>(null);

  const scrollToSubscription = () => {
    subscriptionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div>
      <Header onSubscribeClick={scrollToSubscription} />
      <Hero onStartPayment={scrollToSubscription} />
      <ContentPreview onSeeMoreClick={scrollToSubscription} />
      <DeviceSection />
      <div ref={subscriptionRef}>
        <SubscriptionPlans onSelectPlan={onSelectPlan} />
      </div>
      <FAQ />
      <Footer />
    </div>
  );
};
