import { Dialog as HeadlessDialog } from '@headlessui/react';
import type { ReactNode } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

interface DialogButtonProps {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  children: ReactNode;
}

export function Dialog({ isOpen, onClose, title, description, children }: DialogProps) {
  return (
    <HeadlessDialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black opacity-30" />
        <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <HeadlessDialog.Title className="text-lg font-medium text-gray-900">
            {title}
          </HeadlessDialog.Title>
          {description && (
            <HeadlessDialog.Description className="mt-2 text-sm text-gray-500">
              {description}
            </HeadlessDialog.Description>
          )}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </HeadlessDialog>
  );
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 flex justify-end space-x-3">
      {children}
    </div>
  );
}

export function DialogButton({ variant = 'primary', onClick, children }: DialogButtonProps) {
  const baseClasses = "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = variant === 'primary'
    ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 focus:ring-blue-500";

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
} 