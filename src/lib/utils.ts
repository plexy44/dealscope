import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPriceDisplay(priceString?: string): string | undefined {
  if (!priceString) {
    return undefined;
  }

  const parts = priceString.trim().split(/\s+/);
  // Expecting "CURRENCY_CODE VALUE" e.g. "USD 1234.56"
  if (parts.length === 2) {
    const currencyCode = parts[0];
    const valueString = parts[1];
    const numericValue = parseFloat(valueString);

    if (!isNaN(numericValue)) {
      // Use 'en-US' locale to ensure comma separators for thousands,
      // and standard currency formatting practices.
      const formattedNumber = numericValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return `${currencyCode} ${formattedNumber}`;
    }
  }
  
  // Fallback for if it's just a number string or unexpected format
  // Try to remove any non-numeric characters except for decimal point and minus sign
  const numericValueOnly = parseFloat(priceString.replace(/[^0-9.-]+/g, ""));
  if (!isNaN(numericValueOnly)) {
      return numericValueOnly.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
      });
  }

  return priceString; // Return original if specific formatting couldn't be applied
}
