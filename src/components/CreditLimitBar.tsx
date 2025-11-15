import React from "react";

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
    <div className="w-full space-y-1.5 sm:space-y-2.5">
      <div className="flex flex-col justify-between text-xs text-gray-600 sm:flex-row sm:text-sm">
        <span className="mb-0.5 sm:mb-0">
          Spending: {currentSpending.toLocaleString()}VNĐ
        </span>
        <span>Repayment: {currentRepayment.toLocaleString()}VNĐ</span>
      </div>
      <div className="h-5 w-full overflow-hidden rounded-lg bg-gray-200 sm:h-7">
        <div className="flex h-full">
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
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-1 text-gray-500">
          <div className="h-2 w-2 rounded-full bg-blue-500 sm:h-3 sm:w-3"></div>
          <span>Spent</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <div className="h-2 w-2 rounded-full bg-green-500 sm:h-3 sm:w-3"></div>
          <span>Repaid</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <div className="h-2 w-2 rounded-full bg-gray-300 sm:h-3 sm:w-3"></div>
          <span>Available</span>
        </div>
      </div>
      <div className="text-center text-base font-semibold text-gray-900 sm:text-lg">
        Available Credit Limit: {availableCreditLimit.toLocaleString()}VNĐ
      </div>
    </div>
  );
};

export default CreditLimitBar;
