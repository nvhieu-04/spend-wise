export const formatNumberWithDots = (number: number | string): string => {
  const num = typeof number === 'string' ? parseFloat(number) : number;
  if (isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseNumberFromFormatted = (formatted: string): number => {
  return parseFloat(formatted.replace(/\./g, ''));
}; 