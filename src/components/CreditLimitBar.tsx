import React from 'react';

interface CreditLimitBarProps {
  creditLimit: number;
  currentSpending: number;
  currentRepayment: number;
}

const CreditLimitBar: React.FC<CreditLimitBarProps> = ({
  creditLimit,
  currentSpending,
  currentRepayment,
}) => {
  const spendingPercentage = (currentSpending / creditLimit) * 100;
  const repaymentPercentage = (currentRepayment / creditLimit) * 100;
  const availablePercentage = 100 - spendingPercentage - repaymentPercentage;
  const availableCreditLimit = creditLimit + currentSpending + currentRepayment;

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Spending: {currentSpending.toLocaleString()}VNĐ</span>
        <span>Repayment: {currentRepayment.toLocaleString()}VNĐ</span>
      </div>
      <div className="w-full h-8 bg-gray-200 rounded-lg overflow-hidden">
        <div className="h-full flex">
          <div 
            className="bg-blue-500 transition-all duration-300" 
            style={{ width: `${spendingPercentage}%` }}
            title={`Spent: ${currentSpending.toLocaleString()}VNĐ`}
          />
          <div 
            className="bg-green-500 transition-all duration-300" 
            style={{ width: `${repaymentPercentage}%` }}
            title={`Repaid: ${currentRepayment.toLocaleString()}VNĐ`}
          />
          <div 
            className="bg-gray-300 transition-all duration-300" 
            style={{ width: `${availablePercentage}%` }}
            title={`Available: ${availableCreditLimit.toLocaleString()}VNĐ`}
          />
        </div>
      </div>
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-1 text-gray-500">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Spent</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Repaid</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <span>Available</span>
        </div>
      </div>
      <div className="text-center text-lg font-semibold text-gray-900">
        Available Credit Limit: {availableCreditLimit.toLocaleString()}VNĐ
      </div>
    </div>
  );
};

export default CreditLimitBar; 