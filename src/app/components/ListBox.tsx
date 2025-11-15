import {
  Field,
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

interface TextFieldProps {
  label?: string;
  value?: string;
  className?: string;
  listItems?: string[];
  onChange?: (value: string) => void;
}

export default function ListBox({
  label,
  value,
  className,
  onChange,
  listItems,
}: TextFieldProps) {
  return (
    <div className={clsx("w-full", className)}>
      <Field>
        <Label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </Label>
        <Listbox
          value={value}
          onChange={(value) => {
            onChange?.(value);
          }}
        >
          <ListboxButton
            className={clsx(
              "w-full rounded-lg border border-gray-200 px-3 py-2 transition-shadow focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none",
              "shadow-sm hover:shadow-md",
            )}
          >
            {value}
            <ChevronDownIcon
              className="group fill-gray/60 pointer-events-none absolute top-2.5 right-2.5 size-4"
              aria-hidden="true"
            />
          </ListboxButton>
          <ListboxOptions
            anchor="bottom"
            transition
            className={clsx(
              "mt-1 max-h-60 w-(--button-width) overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg",
              "transition duration-100 ease-in data-leave:data-closed:opacity-0",
            )}
          >
            {listItems?.map((item) => (
              <ListboxOption
                key={item}
                value={item}
                className="group data-focus:bg-gray/10 background-white text-gray/90 hover:bg-gray/10 flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none"
              >
                <CheckIcon className="fill-gray invisible size-4 group-data-selected:visible" />
                <div className="text-gray text-sm/6">{item}</div>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Listbox>
      </Field>
    </div>
  );
}
