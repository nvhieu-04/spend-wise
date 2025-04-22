'use client';

import React from 'react';
import AddBankCard from '@/components/AddBankCard';

export default function AddCardPage() {
  const handleSubmit = (cardData: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
    color: string;
  }) => {
    // TODO: Implement card submission logic
    console.log('Card data:', cardData);
  };

  return (
    <div>
      <AddBankCard onSubmit={handleSubmit} />
    </div>
  );
} 