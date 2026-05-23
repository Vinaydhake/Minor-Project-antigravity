export function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(' ');
}

export function formatMt(value: number) {
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value)} MtCO2e`;
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPopulation(value: number) {
  return `${formatCompact(value)}M`;
}

export function formatGdp(value: number) {
  return `$${formatCompact(value)}B`;
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function formatTonnesFromKg(value: number) {
  return `${(value / 1000).toFixed(2)} tCO2e`;
}

export function formatKg(value: number) {
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value)} kg CO2e`;
}

export function titleCase(value: string) {
  return value.replace(/(^|\s|-)\w/g, (match) => match.toUpperCase());
}
