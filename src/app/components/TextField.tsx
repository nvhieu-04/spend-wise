import { Description, Field, Input, Label } from "@headlessui/react";
import clsx from "clsx";

interface TextFieldProps {
  name?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  value?: string;
  className?: string;
  onChange?: (value: string) => void;
}

export default function TextField({
  name,
  label,
  description,
  placeholder,
  value,
  className,
  onChange,
}: TextFieldProps) {
  return (
    <div className={clsx("mb-2 w-full", className)}>
      <Field>
        <Label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </Label>
        <Description className="text-sm/6 text-gray-700">
          {description}
        </Description>
        <Input
          className={clsx(
            "w-full rounded-lg border border-gray-200 px-3 py-2 transition-shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none",
            "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25",
          )}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </Field>
    </div>
  );
}
