import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getDictionary, type Locale } from "~/i18n";
import {
  formatNumberWithDots,
  parseNumberFromFormatted,
} from "../../../lib/utils";
import BankCard from "../BankCard";
import Dialog, { DialogButton, DialogFooter } from "../Dialog";
import ListBox from "../ListBox";
import TextField from "../TextField";

interface CardFormData {
  cardName: string;
  bankName: string;
  cardType: string;
  cardNumber: string;
  creditLimit?: string;
  statementClosingDate?: number;
  paymentDueDate?: number;
  cardColor?: string;
}

interface AddBankCardDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface Bank {
  short_name: string;
  logo?: string; // if the API provides it; otherwise it will be undefined
}

export default function AddBankCardDialog({
  onClose,
  onSuccess,
}: AddBankCardDialogProps) {
  const pathname = usePathname();
  const [, maybeLocale] = pathname.split("/");
  const locale: Locale =
    maybeLocale === "en" || maybeLocale === "vn" ? maybeLocale : "en";
  const dict = getDictionary(locale);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CardFormData>({
    cardName: "",
    bankName: "",
    cardType: "VISA",
    cardNumber: "",
    creditLimit: "",
    statementClosingDate: undefined,
    paymentDueDate: undefined,
    cardColor: "#3B82F6",
  });
  const [showCustomCardType, setShowCustomCardType] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const getBanks = async () => {
    try {
      const response = await fetch("https://api.vietqr.io/v2/banks");
      const dataFetch = await response.json();
      if (response.ok) {
        setBanks(dataFetch.data);
      } else {
        console.error("Failed to fetch banks:", dataFetch.error);
      }
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  const validateStep = (s: number) => {
    const errors: Record<string, string> = {};
    if (s === 1) {
      if (!formData.cardName.trim()) errors.cardName = "Card name is required";
      if (!formData.bankName.trim()) errors.bankName = "Bank name is required";
      // if custom type selected, cardType must be provided
      if (showCustomCardType) {
        if (!formData.cardType.trim())
          errors.cardType = "Custom card type is required";
      } else {
        if (!formData.cardType.trim())
          errors.cardType = "Card type is required";
      }
    } else if (s === 2) {
      const digitsOnly = formData.cardNumber.replace(/[^\d]/g, "");
      if (!digitsOnly || digitsOnly.length !== 4)
        errors.cardNumber = "Enter exactly 4 digits";
      if (formData.creditLimit) {
        const creditNum = parseNumberFromFormatted(formData.creditLimit);
        if (isNaN(creditNum) || creditNum < 0)
          errors.creditLimit = "Invalid credit limit";
      }
      const validateDay = (v?: number) => v !== undefined && (v < 1 || v > 31);
      if (validateDay(formData.statementClosingDate))
        errors.statementClosingDate = "Must be between 1 and 31";
      if (validateDay(formData.paymentDueDate))
        errors.paymentDueDate = "Must be between 1 and 31";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(2)) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/bank-cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          cardNumberLast4: formData.cardNumber.slice(-4),
          creditLimit: formData.creditLimit
            ? parseNumberFromFormatted(formData.creditLimit)
            : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? dict.home.errorLoadingCardsTitle);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating card:", error);
      setError(
        error instanceof Error
          ? error.message
          : dict.dialogs.common.genericError,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    getBanks();
  }, []);

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      title={dict.home.addNewCardTitle}
      description={dict.home.addNewCardDescription}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <div className="flex w-full flex-row justify-around gap-3 space-y-6">
          <div className="flex w-full max-w-md flex-1 flex-col space-y-4">
            {step === 1 && (
              <div>
                <TextField
                  label={dict.home.addNewCardTitle}
                  name="cardName"
                  placeholder="e.g. My Travel Card"
                  value={formData.cardName}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, cardName: value }));
                    setValidationErrors((prev) => ({ ...prev, cardName: "" }));
                  }}
                />
                {validationErrors.cardName && (
                  <p className="text-sm text-red-600">
                    {validationErrors.cardName}
                  </p>
                )}
                {/* <TextField
                  label="Bank Name"
                  name="bankName"
                  placeholder="e.g. Chase Bank"
                  value={formData.bankName}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, bankName: value }));
                    setValidationErrors((prev) => ({ ...prev, bankName: "" }));
                  }}
                /> */}
                <ListBox
                  label={dict.qr.bankLabel}
                  value={formData.bankName}
                  listItems={
                    banks.length > 0
                      ? banks.map((bank) => ({
                          value: bank.short_name,
                          label: bank.short_name,
                          iconUrl: bank.logo, // safe if undefined
                        }))
                      : [{ value: "loading", label: "Loading banks..." }]
                  }
                  onChange={(value) => {
                    if (value === "loading") return;
                    setFormData((prev) => ({ ...prev, bankName: value }));
                    setValidationErrors((prev) => ({ ...prev, bankName: "" }));
                  }}
                />
                {validationErrors.bankName && (
                  <p className="text-sm text-red-600">
                    {validationErrors.bankName}
                  </p>
                )}
                <ListBox
                  label="Card Type"
                  value={showCustomCardType ? "CUSTOM" : formData.cardType}
                  listItems={["VISA", "MASTERCARD", "AMEX", "JCB", "CUSTOM"]}
                  onChange={(value) => {
                    if (value === "CUSTOM") {
                      setShowCustomCardType(true);
                      setFormData((prev) => ({ ...prev, cardType: "" }));
                      setValidationErrors((prev) => ({
                        ...prev,
                        cardType: "",
                      }));
                    } else {
                      setShowCustomCardType(false);
                      setFormData((prev) => ({ ...prev, cardType: value }));
                      setValidationErrors((prev) => ({
                        ...prev,
                        cardType: "",
                      }));
                    }
                  }}
                />
                {showCustomCardType && (
                  <TextField
                    label="Custom Card Type"
                    name="cardType"
                    placeholder="Enter custom card type"
                    value={formData.cardType}
                    onChange={(value) => {
                      setFormData((prev) => ({ ...prev, cardType: value }));
                      setValidationErrors((prev) => ({
                        ...prev,
                        cardType: "",
                      }));
                    }}
                  />
                )}
                {validationErrors.cardType && (
                  <p className="text-sm text-red-600">
                    {validationErrors.cardType}
                  </p>
                )}
                <div className="mt-4 flex items-center space-x-4">
                  <TextField
                    label={dict.cards.cardColorTitle}
                    name="cardColor"
                    value={formData.cardColor}
                    onChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        cardColor: value,
                      }));
                    }}
                    placeholder="#RRGGBB"
                  />
                  <input
                    type="color"
                    id="cardColor"
                    name="cardColor"
                    value={formData.cardColor}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        cardColor: e.target.value,
                      }));
                    }}
                    className="mt-6 h-12 w-20 cursor-pointer rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <TextField
                  label="Card Number (Last 4 digits)"
                  name="cardNumber"
                  placeholder="Enter last 4 digits"
                  value={formData.cardNumber}
                  onChange={(value) => {
                    const sanitizedValue = value
                      .replace(/[^\d]/g, "")
                      .slice(0, 4);
                    setFormData((prev) => ({
                      ...prev,
                      cardNumber: sanitizedValue,
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      cardNumber: "",
                    }));
                  }}
                />
                {validationErrors.cardNumber && (
                  <p className="text-sm text-red-600">
                    {validationErrors.cardNumber}
                  </p>
                )}

                <TextField
                  label={dict.cards.creditLimitTitle}
                  name="creditLimit"
                  placeholder="Enter credit limit amount"
                  value={formData.creditLimit}
                  onChange={(value) => {
                    const formattedValue = formatNumberWithDots(
                      value.replace(/[^\d]/g, ""),
                    );
                    setFormData((prev) => ({
                      ...prev,
                      creditLimit: formattedValue,
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      creditLimit: "",
                    }));
                  }}
                  className="mb-4"
                />
                {validationErrors.creditLimit && (
                  <p className="text-sm text-red-600">
                    {validationErrors.creditLimit}
                  </p>
                )}
                <TextField
                  label={dict.cards.statementClosingTitle}
                  name="statementClosingDate"
                  placeholder="Day of month (1-31)"
                  value={
                    formData.statementClosingDate
                      ? formData.statementClosingDate.toString()
                      : ""
                  }
                  onChange={(value) => {
                    const numericValue = parseInt(value.replace(/[^\d]/g, ""));
                    setFormData((prev) => ({
                      ...prev,
                      statementClosingDate: isNaN(numericValue)
                        ? undefined
                        : numericValue,
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      statementClosingDate: "",
                    }));
                  }}
                />
                {validationErrors.statementClosingDate && (
                  <p className="text-sm text-red-600">
                    {validationErrors.statementClosingDate}
                  </p>
                )}
                <TextField
                  label={dict.cards.paymentDueTitle}
                  name="paymentDueDate"
                  placeholder="Day of month (1-31)"
                  value={
                    formData.paymentDueDate
                      ? formData.paymentDueDate.toString()
                      : ""
                  }
                  onChange={(value) => {
                    const numericValue = parseInt(value.replace(/[^\d]/g, ""));
                    setFormData((prev) => ({
                      ...prev,
                      paymentDueDate: isNaN(numericValue)
                        ? undefined
                        : numericValue,
                    }));
                    setValidationErrors((prev) => ({
                      ...prev,
                      paymentDueDate: "",
                    }));
                  }}
                />
                {validationErrors.paymentDueDate && (
                  <p className="text-sm text-red-600">
                    {validationErrors.paymentDueDate}
                  </p>
                )}
              </div>
            )}
          </div>
          <BankCard
            isAdd={true}
            className="w-full max-w-sm"
            cardName={formData.cardName || "Card Name"}
            bankName={formData.bankName || "Bank Name"}
            cardType={formData.cardType || "VISA"}
            cardNumberLast4={formData.cardNumber.slice(-4) || "0000"}
            creditLimit={
              formData.creditLimit
                ? parseNumberFromFormatted(formData.creditLimit)
                : undefined
            }
            cardColor={formData.cardColor}
            onChangeColor={(hex) =>
              setFormData((prev) => ({ ...prev, cardColor: hex }))
            }
          />
        </div>

        <DialogFooter>
          <DialogButton
            variant="secondary"
            onClick={() => {
              if (step === 1) {
                onClose();
              } else {
                setStep((prev) => prev - 1);
                // clear step2 errors when going back
                setValidationErrors({});
              }
            }}
            disabled={isSubmitting}
          >
            {step === 1 ? dict.dialogs.common.cancel : "Back"}
          </DialogButton>
          <DialogButton
            type="button"
            onClick={() => {
              if (step === 1) {
                if (validateStep(1)) {
                  setStep(2);
                  setValidationErrors({});
                }
              } else {
                // validate step 2 before submitting
                if (validateStep(2)) {
                  handleSubmit(
                    new Event("submit") as unknown as React.FormEvent,
                  );
                }
              }
            }}
            disabled={isSubmitting}
          >
            {step === 1 && !isSubmitting && "Next"}
            {step === 2 && !isSubmitting && dict.home.addNewCardTitle}
            {isSubmitting && dict.dialogs.common.adding}
          </DialogButton>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
