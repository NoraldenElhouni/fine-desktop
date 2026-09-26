export interface BundlePickLine {
  quantity: number;
}

/**
 * Splits one combined bundle price across lines by a uniform per-unit price
 * (combinedPrice / totalQty), rounded to 4dp, with the LAST line absorbing
 * the rounding remainder so the lines sum exactly to combinedPrice.
 *
 * Returns each line's TOTAL (quantity * unit_price) — divide by that line's
 * quantity to get the unit_price to store on it.
 */
export function splitBundlePrice(lines: BundlePickLine[], combinedPrice: number): number[] {
  const totalQty = lines.reduce((sum, l) => sum + l.quantity, 0);
  if (totalQty <= 0 || lines.length === 0) {
    return lines.map(() => 0);
  }

  const unitPrice = combinedPrice / totalQty;
  const totals = lines.map((l) => Math.round(l.quantity * unitPrice * 10000) / 10000);

  const allocated = totals.slice(0, -1).reduce((sum, t) => sum + t, 0);
  totals[totals.length - 1] = Math.round((combinedPrice - allocated) * 10000) / 10000;

  return totals;
}
