'use client';
import React, { Fragment } from 'react';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { X } from "lucide-react";

interface DialogProps {
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
  const baseStyles = "px-4 py-2 text-sm font-medium rounded-lg transition-colors";
  const variantStyles = {
    primary: "text-white bg-blue-600 hover:bg-blue-700",
    secondary: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50",
    danger: "text-white bg-red-600 hover:bg-red-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
};

export const DialogFooter: React.FC<DialogFooterProps> = ({ children }) => {
  return (
    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
      {children}
    </div>
  );
};

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          aria-hidden="true"
          onClick={onClose}
        />

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {title}
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {description && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                )}
                <div className="mt-4">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dialog; 