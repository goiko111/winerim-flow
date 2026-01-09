export const BANK_DETAILS = {
  iban: "ES11 0081 5455 8800 0266 5278",
  ibanRaw: "ES1100815455880002665278",
  accountHolder: "Basque Highlands S.L.",
  bankName: "Banco Sabadell",
};

export const BILLING_INTERVALS = [
  { value: 'monthly', label: 'Mensual', months: 1 },
  { value: 'quarterly', label: 'Trimestral', months: 3 },
  { value: 'semestral', label: 'Semestral', months: 6 },
  { value: 'annual', label: 'Anual', months: 12 },
] as const;

export type BillingInterval = typeof BILLING_INTERVALS[number]['value'];

export const getIntervalLabel = (interval: string): string => {
  return BILLING_INTERVALS.find(i => i.value === interval)?.label || interval;
};

export const getIntervalMonths = (interval: string): number => {
  return BILLING_INTERVALS.find(i => i.value === interval)?.months || 1;
};
