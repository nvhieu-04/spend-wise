import React, { useState } from 'react';
import Dialog, { DialogButton, DialogFooter } from './Dialog';
import Link from 'next/link';
import { formatNumberWithDots } from '../../lib/utils';

interface BankCardProps {
  id: string;
  cardName: string;
  bankName: string;
  cardType: string;
  cardNumberLast4: string;
  creditLimit?: number;
  onDelete?: (id: string) => void;
}

const BankCard: React.FC<BankCardProps> = ({
  id,
  cardName,
  bankName,
  cardType,
  cardNumberLast4,
  creditLimit,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/bank-cards/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      onDelete?.(id);
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete card. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <Link href={`/cards/${id}`}>
        <div className="bg-blue-500 rounded-xl overflow-hidden relative transition-all duration-300 ease-in-out aspect-[1.7/1] hover:shadow-xl hover:scale-105 hover:-translate-y-0.5 cursor-pointer">
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
                disabled={isDeleting}
                className="p-2 text-white/70 hover:text-red-400 transition-colors duration-200 disabled:opacity-50 hover:bg-white/10 rounded-full"
                title="Delete card"
              >
                {isDeleting ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </Link>

      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Card"
        description={`Are you sure you want to delete the card "${cardName}"? This action cannot be undone.`}
      >
        <DialogFooter>
          <DialogButton
            variant="secondary"
            onClick={() => setShowDeleteDialog(false)}
          >
            Cancel
          </DialogButton>
          <DialogButton
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </DialogButton>
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default BankCard; 