import React, { useState } from 'react';
import Link from 'next/link';
import { formatNumberWithDots } from '../../lib/utils';
import { TrashIcon } from '@heroicons/react/24/outline';
import DeleteBankCardDialog from './Dialog/DeleteBankCardDialog';

interface BankCardProps {
  id: string;
  cardName: string;
  bankName: string;
  cardType: string;
  cardNumberLast4: string;
  creditLimit?: number;
  cardColor?: string;
  onDelete?: (id: string) => void;
}

const BankCard: React.FC<BankCardProps> = ({
  id,
  cardName,
  bankName,
  cardType,
  cardNumberLast4,
  creditLimit,
  cardColor,
  onDelete,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getCardBackgroundColor = (type: string, color?: string) => {
    if (color) {
      // Use style attribute for custom colors
      return `bg-gradient-to-br`;
    }
    
    switch (type.toUpperCase()) {
      case 'VISA':
        return 'bg-gradient-to-br from-blue-500 to-blue-600';
      case 'MASTERCARD':
        return 'bg-gradient-to-br from-orange-500 to-red-500';
      case 'AMEX':
        return 'bg-gradient-to-br from-green-500 to-green-600';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  const adjustColor = (hex: string, percent: number) => {
    // Remove the # if present
    hex = hex.replace(/^#/, '');

    // Convert to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Adjust each component
    r = Math.min(255, Math.max(0, Math.round(r * (1 + percent/100))));
    g = Math.min(255, Math.max(0, Math.round(g * (1 + percent/100))));
    b = Math.min(255, Math.max(0, Math.round(b * (1 + percent/100))));

    // Convert back to hex
    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  };

  return (
    <>
      <Link href={`/cards/${id}`}>
        <div 
          className={`${getCardBackgroundColor(cardType, cardColor)} rounded-xl overflow-hidden relative transition-all duration-300 ease-in-out aspect-[1.7/1] hover:shadow-xl hover:scale-105 hover:-translate-y-0.5 cursor-pointer`}
          style={cardColor ? {
            background: `linear-gradient(to bottom right, ${cardColor}, ${adjustColor(cardColor, -20)})`,
          } : undefined}
        >
          <div className="p-6 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white text-lg font-medium mb-1">{cardName}</h3>
                  <p className="text-blue-100 text-sm">{bankName}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-white text-sm">{cardType}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">••••</span>
                </div>
                <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">••••</span>
                </div>
                <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">••••</span>
                </div>
                <span className="text-white text-base ml-1">{cardNumberLast4}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              {creditLimit && (
                <div>
                  <p className="text-blue-100 text-sm">Credit Limit</p>
                  <p className="text-white text-lg font-medium">
                    {formatNumberWithDots(creditLimit)} VNĐ
                  </p>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowDeleteDialog(true);
                }}
                className="p-2 text-white/70 hover:text-red-400 transition-colors duration-200 disabled:opacity-50 hover:bg-white/10 rounded-full"
                title="Delete card"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </Link>
      {showDeleteDialog && <DeleteBankCardDialog
        onClose={() => setShowDeleteDialog(false)}
        cardName={cardName}
        cardId={id}
        onDelete={(deletedId) => {
          onDelete?.(deletedId);
          setShowDeleteDialog(false);
        }}
      />}
    </>
  );
};

export default BankCard; 