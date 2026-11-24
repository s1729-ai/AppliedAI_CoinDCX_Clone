export const formatINR = (amount: number, showSign: boolean = false): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0.00';

  const sign = showSign && amount > 0 ? '+' : '';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formatted = '';
  if (absAmount >= 10000000) {
    formatted = (absAmount / 10000000).toFixed(2) + ' Cr';
  } else if (absAmount >= 100000) {
    formatted = (absAmount / 100000).toFixed(2) + ' L';
  } else if (absAmount < 1) {
    formatted = absAmount.toFixed(4);
  } else {
    formatted = absAmount.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }

  return `${isNegative ? '-' : sign}₹${formatted}`;
};

export const formatCurrencyFull = (amount: number): string => {
  if (isNaN(amount)) return '₹0.00';
  return '₹' + amount.toLocaleString('en-IN', {
    maximumFractionDigits: amount < 1 ? 4 : 2,
    minimumFractionDigits: amount < 1 ? 4 : 2,
  });
};

export const formatUSDT = (amount: number): string => {
  if (isNaN(amount)) return '$0.00';
  return '$' + amount.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};

export const formatPercent = (percent: number, showSign: boolean = true): string => {
  if (isNaN(percent) || percent === null) return '0.00%';
  const sign = showSign && percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
};

export const formatQuantity = (qty: number, maxDecimals: number = 6): string => {
  if (isNaN(qty)) return '0';
  return Number(qty.toFixed(maxDecimals)).toString();
};
