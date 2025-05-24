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
          className={`${getCardBackgroundColor(cardType, cardColor)} rounded-xl overflow-hidden relative transition-all duration-300 ease-in-out w-full aspect-[1.6/1] hover:shadow-xl hover:scale-105 hover:-translate-y-0.5 cursor-pointer`}
          style={cardColor ? {
            background: `linear-gradient(to bottom right, ${cardColor}, ${adjustColor(cardColor, -20)})`,
          } : undefined}
        >
          <div className="p-3 sm:p-4 md:p-6 h-full flex flex-col justify-between">
            <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
              <div className="flex justify-between items-start">
                <div className="max-w-[70%]">
                  <h3 className="text-white text-xs sm:text-sm md:text-base lg:text-lg font-medium mb-0.5 truncate">{cardName}</h3>
                  <p className="text-blue-100 text-[10px] sm:text-xs md:text-sm truncate">{bankName}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1">
                  <span className="text-white text-[10px] sm:text-xs md:text-sm">{cardType}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-white text-[6px] sm:text-[8px] md:text-[10px]">••••</span>
                </div>
                <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-white text-[6px] sm:text-[8px] md:text-[10px]">••••</span>
                </div>
                <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-white text-[6px] sm:text-[8px] md:text-[10px]">••••</span>
                </div>
                <span className="text-white text-[10px] sm:text-xs md:text-sm lg:text-base ml-0.5 sm:ml-1">{cardNumberLast4}</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              {creditLimit && (
                <div className="max-w-[60%] overflow-hidden">
                  <p className="text-blue-100 text-[8px] sm:text-[10px] md:text-xs">Credit Limit</p>
                  <p className="text-white text-[10px] sm:text-xs md:text-sm lg:text-base font-medium truncate">
                    {formatNumberWithDots(creditLimit)} VNĐ
                  </p>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowDeleteDialog(true);
                }}
                className="p-1 sm:p-1.5 md:p-2 text-white/70 hover:text-red-400 transition-colors duration-200 disabled:opacity-50 hover:bg-white/10 rounded-full"
                title="Delete card"
              >
                <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
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