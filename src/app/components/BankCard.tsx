import { TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React, { useState } from "react";
import { formatNumberWithDots } from "../../lib/utils";
import DeleteBankCardDialog from "./Dialog/DeleteBankCardDialog";

interface BankCardProps {
  isAdd?: boolean;
  id?: string;
  cardName: string;
  bankName: string;
  cardType: string;
  cardNumberLast4: string;
  creditLimit?: number;
  cardColor?: string;
  className?: string;
  onDelete?: (id: string) => void;
}

const BankCard: React.FC<BankCardProps> = ({
  isAdd = false,
  id,
  cardName,
  bankName,
  cardType,
  cardNumberLast4,
  creditLimit,
  cardColor,
  className,
  onDelete,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getCardBackgroundColor = (type: string, color?: string) => {
    if (color) {
      return `bg-gradient-to-br`;
    }

    switch (type.toUpperCase()) {
      case "VISA":
        return "bg-gradient-to-br from-blue-500 to-blue-600";
      case "MASTERCARD":
        return "bg-gradient-to-br from-orange-500 to-red-500";
      case "AMEX":
        return "bg-gradient-to-br from-green-500 to-green-600";
      default:
        return "bg-gradient-to-br from-gray-500 to-gray-600";
    }
  };

  const adjustColor = (hex: string, percent: number) => {
    hex = hex.replace(/^#/, "");

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = Math.min(255, Math.max(0, Math.round(r * (1 + percent / 100))));
    g = Math.min(255, Math.max(0, Math.round(g * (1 + percent / 100))));
    b = Math.min(255, Math.max(0, Math.round(b * (1 + percent / 100))));

    const rHex = r.toString(16).padStart(2, "0");
    const gHex = g.toString(16).padStart(2, "0");
    const bHex = b.toString(16).padStart(2, "0");

    return `#${rHex}${gHex}${bHex}`;
  };

  return (
    <>
      <Link className={className} href={isAdd ? "#" : `/cards/${id}`}>
        <div
          className={`${getCardBackgroundColor(cardType, cardColor)} relative aspect-[1.6/1] w-full cursor-pointer overflow-hidden rounded-xl transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-xl`}
          style={
            cardColor
              ? {
                  background: `linear-gradient(to bottom right, ${cardColor}, ${adjustColor(cardColor, -20)})`,
                }
              : undefined
          }
        >
          <div className="flex h-full flex-col justify-between p-3 sm:p-4 md:p-6">
            <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
              <div className="flex items-start justify-between">
                <div className="max-w-[70%]">
                  <h3 className="mb-0.5 truncate text-xs font-medium text-white sm:text-sm md:text-base lg:text-lg">
                    {cardName}
                  </h3>
                  <p className="truncate text-[10px] text-blue-100 sm:text-xs md:text-sm">
                    {bankName}
                  </p>
                </div>
                <div className="rounded-full bg-white/20 px-1.5 py-0.5 backdrop-blur-sm sm:px-2 sm:py-1 md:px-3">
                  <span className="text-[10px] text-white sm:text-xs md:text-sm">
                    {cardType}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2">
                <div className="flex h-3 w-3 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:h-4 sm:w-4 md:h-5 md:w-5">
                  <span className="text-[6px] text-white sm:text-[8px] md:text-[10px]">
                    ••••
                  </span>
                </div>
                <div className="flex h-3 w-3 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:h-4 sm:w-4 md:h-5 md:w-5">
                  <span className="text-[6px] text-white sm:text-[8px] md:text-[10px]">
                    ••••
                  </span>
                </div>
                <div className="flex h-3 w-3 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:h-4 sm:w-4 md:h-5 md:w-5">
                  <span className="text-[6px] text-white sm:text-[8px] md:text-[10px]">
                    ••••
                  </span>
                </div>
                <span className="ml-0.5 text-[10px] text-white sm:ml-1 sm:text-xs md:text-sm lg:text-base">
                  {cardNumberLast4}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {creditLimit && (
                <div className="max-w-[60%] overflow-hidden">
                  <p className="text-[8px] text-blue-100 sm:text-[10px] md:text-xs">
                    Credit Limit
                  </p>
                  <p className="truncate text-[10px] font-medium text-white sm:text-xs md:text-sm lg:text-base">
                    {formatNumberWithDots(creditLimit)} VNĐ
                  </p>
                </div>
              )}
              {!isAdd && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDeleteDialog(true);
                  }}
                  className="rounded-full p-1 text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-red-400 disabled:opacity-50 sm:p-1.5 md:p-2"
                  title="Delete card"
                >
                  <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
      {showDeleteDialog && !isAdd && (
        <DeleteBankCardDialog
          onClose={() => setShowDeleteDialog(false)}
          cardName={cardName}
          cardId={id!}
          onDelete={(deletedId) => {
            onDelete?.(deletedId);
            setShowDeleteDialog(false);
          }}
        />
      )}
    </>
  );
};

export default BankCard;
