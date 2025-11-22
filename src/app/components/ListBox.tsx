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
import { useEffect, useMemo, useRef, useState } from "react";

type ListItem = {
  value: string;
  label: string;
  iconUrl?: string;
};

interface ListBoxProps {
  label?: string;
  value?: string;
  className?: string;
  listItems?: Array<string | ListItem>;
  onChange?: (value: string) => void;
  placeholder?: string;
  // Infinite scroll additions
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  // Optional: disable auto load while searching
  disableLoadOnSearch?: boolean;
}

export default function ListBox({
  label,
  value,
  className,
  onChange,
  listItems,
  placeholder = "Select...",
  onLoadMore,
  hasMore,
  isLoadingMore,
  disableLoadOnSearch = true,
}: ListBoxProps) {
  const [query, setQuery] = useState("");
  const normalized: ListItem[] = (listItems ?? []).map((it) =>
    typeof it === "string" ? { value: it, label: it } : it,
  );
  const filtered = useMemo(
    () =>
      query
        ? normalized.filter((it) =>
            it.label.toLowerCase().includes(query.toLowerCase()),
          )
        : normalized,
    [normalized, query],
  );

  const selected = normalized.find((it) => it.value === value) ?? null;

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!onLoadMore || !hasMore) return;
    if (disableLoadOnSearch && query) return;

    const el = sentinelRef.current;
    if (!el) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0] ?? null;
        if (first?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: el.parentElement, // scroll container
        threshold: 0.1,
      },
    );
    observerRef.current.observe(el);

    return () => observerRef.current?.disconnect();
  }, [onLoadMore, hasMore, query, disableLoadOnSearch, filtered.length]);

  return (
    <div className={clsx("w-full", className)}>
      <Field>
        {label && (
          <Label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </Label>
        )}
        <Listbox
          value={value ?? ""}
          onChange={(val: string) => onChange?.(val)}
        >
          <div className="relative">
            <ListboxButton
              className={clsx(
                "relative w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left transition-shadow",
                "focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none",
                "shadow-sm hover:shadow-md",
              )}
            >
              <span className="flex items-center gap-2 truncate pr-6">
                {selected?.iconUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selected.iconUrl}
                    alt=""
                    className="h-5 w-5 rounded-sm object-contain"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                )}
                <span className={clsx(!selected && "text-gray-400")}>
                  {selected ? selected.label : placeholder}
                </span>
              </span>
              <ChevronDownIcon
                className="pointer-events-none absolute top-2.5 right-2.5 size-4 fill-gray-500"
                aria-hidden="true"
              />
            </ListboxButton>

            <ListboxOptions
              anchor="bottom"
              transition
              className={clsx(
                "mt-1 w-[var(--button-width)] rounded-lg border border-gray-200 bg-white py-1 shadow-lg",
                // Increase height for scrolling
                "max-h-64 overflow-y-auto focus:outline-none",
                "transition duration-100 ease-in data-leave:data-closed:opacity-0",
              )}
              style={{ "--anchor-max-height": "16rem" } as React.CSSProperties}
            >
              {normalized.length > 15 && (
                <div className="px-3 pb-2">
                  <input
                    className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              )}
              {filtered.map((item) => {
                const selectedState = item.value === value;
                return (
                  <ListboxOption
                    key={item.value}
                    value={item.value}
                    className={clsx(
                      "group flex cursor-default items-center gap-2 rounded-lg px-3 py-1.5 select-none",
                      "text-gray-900 hover:bg-gray-50 data-[focus]:bg-gray-50",
                    )}
                  >
                    <CheckIcon
                      className={clsx(
                        "size-4",
                        selectedState ? "visible fill-gray-700" : "invisible",
                      )}
                    />
                    {item.iconUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.iconUrl}
                        alt=""
                        className="h-5 w-5 rounded-sm object-contain"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="text-sm leading-6">{item.label}</div>
                  </ListboxOption>
                );
              })}
              {/* Sentinel for infinite scroll */}
              {onLoadMore && (
                <div ref={sentinelRef} className="px-3 py-2 text-center">
                  {isLoadingMore ? (
                    <span className="text-xs text-gray-500">Loading...</span>
                  ) : hasMore ? (
                    <span className="text-xs text-gray-400">Load more...</span>
                  ) : (
                    <span className="text-xs text-gray-300">End</span>
                  )}
                </div>
              )}
            </ListboxOptions>
          </div>
        </Listbox>
      </Field>
    </div>
  );
}
