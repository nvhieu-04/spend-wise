import React from 'react';
import { format } from 'date-fns';
import { formatNumberWithDots } from '../../lib/utils';

interface TransactionItemProps {
  id: string;
  amount: number;
  currency: string;
  transactionDate: string;
  merchantName?: string;
  category?: {
    name: string;
  };
  cashbackEarned?: number;
  isExpense: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  amount,
  currency,
  transactionDate,
  merchantName,
  category,
  cashbackEarned,
  isExpense,
}) => {
  const formattedDate = format(new Date(transactionDate), 'MMM dd, yyyy');
  const amountColor = isExpense ? 'text-red-600' : 'text-green-600';
  const amountSign = isExpense ? '-' : '+';

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-900 font-medium">
            {merchantName || 'Unknown Merchant'}
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            {formattedDate}
            {category && ` • ${category.name}`}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-semibold ${amountColor}`}>
            {amountSign}{formatNumberWithDots(Math.abs(amount))} {currency}
          </p>
          {cashbackEarned && cashbackEarned > 0 && (
            <p className="text-green-600 text-sm mt-1">
              +{formatNumberWithDots(cashbackEarned)} {currency} cashback
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionItem; 