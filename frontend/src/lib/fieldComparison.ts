export const TOLERANCE_PERCENTAGE = 2.0;

export interface FieldComparisonResult {
  isMismatch: boolean;
  diffPercent: number;
  valANum: number | null;
  valBNum: number | null;
}

export function compareFieldValues(valA: string, valB: string): FieldComparisonResult {
  if (!valA || !valB) {
    return { isMismatch: false, diffPercent: 0, valANum: null, valBNum: null };
  }

  const cleanA = valA.replace(/[^0-9.]/g, "");
  const cleanB = valB.replace(/[^0-9.]/g, "");

  const numA = parseFloat(cleanA);
  const numB = parseFloat(cleanB);

  if (!isNaN(numA) && !isNaN(numB) && numA > 0 && numB > 0) {
    const diff = Math.abs(numA - numB);
    const maxVal = Math.max(numA, numB);
    const diffPercent = (diff / maxVal) * 100;
    const isMismatch = diffPercent > TOLERANCE_PERCENTAGE;
    return { isMismatch, diffPercent, valANum: numA, valBNum: numB };
  }

  const textMismatch = valA.trim().toLowerCase() !== valB.trim().toLowerCase();
  return {
    isMismatch: textMismatch,
    diffPercent: textMismatch ? 100 : 0,
    valANum: null,
    valBNum: null,
  };
}