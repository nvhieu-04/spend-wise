import { en } from "./en";
import { vn } from "./vn";

export const dictionaries = { en, vn };

export type Locale = keyof typeof dictionaries;

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.en;
}

