'use client';
import React from 'react';
import { Button, Description, Dialog, DialogBackdrop, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface DialogComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

interface DialogButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

interface DialogFooterProps {
  children: React.ReactNode;
}

export const DialogButton: React.FC<DialogButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
}) => {
  const baseStyles = "w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg transition-colors";
  const variantStyles = {
    primary: "text-white bg-blue-600 hover:bg-blue-700",
    secondary: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50",
    danger: "text-white bg-red-600 hover:bg-red-700",
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </Button>
  );
};

export const DialogFooter: React.FC<DialogFooterProps> = ({ children }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-4 pt-3 sm:pt-4 border-t border-gray-100">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 w-full sm:w-auto">
        {children}
      </div>
    </div>
  );
};

const DialogComponent: React.FC<DialogComponentProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
}) => {

  return (
    <Dialog open={isOpen} onClose={onClose} as="div" className="fixed inset-0 z-50 overflow-y-auto">
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-4 sm:p-5 mx-2 sm:mx-auto text-left align-middle shadow-xl transition-all">
            <div className="flex justify-between items-start">
              <div className="flex-1 pr-2">
                <DialogTitle className="text-base sm:text-lg font-medium leading-6 text-gray-900">
                  {title}
                </DialogTitle>
                {description && (
                  <Description className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                    {description}
                  </Description>
                )}
              </div>
              <button
                type="button"
                className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onClose}
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-3 sm:mt-4">{children}</div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default DialogComponent;