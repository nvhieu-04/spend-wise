import React from 'react';
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
  isExpense: boolean;
  cashbackEarned?: number;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  amount,
  currency,
  transactionDate,
  merchantName,
  category,
  isExpense,
  cashbackEarned = 0,
}) => {
  const formattedDate = new Date(transactionDate).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            {merchantName ?? "Unknown Merchant"}
          </h3>
          <p className="text-sm text-gray-500">
            {formattedDate} • {category?.name ?? "No Category"}
          </p>
          {cashbackEarned > 0 && (
            <p className="text-sm text-green-600 mt-1">
              Cashback: {formatNumberWithDots(cashbackEarned)} {currency}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className={`text-lg font-semibold ${isExpense ? "text-red-600" : "text-green-600"}`}>
            {isExpense ? "-" : "+"}{formatNumberWithDots(amount)} {currency}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem; 