export const formatNumberWithDots = (number: number | string): string => {
  const num = typeof number === "string" ? number : number.toString();
  if (isNaN(parseFloat(num))) return "0";
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const parseNumberFromFormatted = (formatted: string): number => {
  return parseFloat(formatted.replace(/\./g, ""));
};
