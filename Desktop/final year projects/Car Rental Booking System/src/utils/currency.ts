/**
 * Formats a number as Indian Rupees with proper comma separation
 * @param amount - The amount to format
 * @returns Formatted string with ₹ symbol and Indian number formatting
 */
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a number as Indian Rupees without currency symbol
 * @param amount - The amount to format
 * @returns Formatted string with Indian number formatting (no symbol)
 */
export const formatINRNumber = (amount: number): string => {
  return new Intl.NumberFormat('en-IN').format(amount);
};