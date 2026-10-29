import React from "react";
import { CODE128_QUIET_ZONE, code128InnerQuietZone, encodeCode128B } from "../../lib/code128";

interface Code128BarcodeProps {
  value: string;
  /** CSS height of the bars, e.g. "11mm". The width fills the container. */
  height?: string;
  className?: string;
  /**
   * The drawn width (mm) and the blank label margin (mm) each side of it.
   * Given both, the SVG keeps only the part of the quiet zone that the margin
   * does not already provide, so long values get wider bars. Without them it
   * draws the full 10-module quiet zones.
   */
  fit?: { widthMm: number; marginMm: number };
}

/**
 * A Code128 (set B) barcode as an SVG: one rect per bar, scaled to the
 * container's width. A value outside set B renders a short notice instead.
 */
export const Code128Barcode: React.FC<Code128BarcodeProps> = ({ value, height = "12mm", className, fit }) => {
  const encoding = encodeCode128B(value);
  if (!encoding) {
    return (
      <div className={className} style={{ height }}>
        <div className="flex h-full items-center justify-center text-[7pt] text-gray-500">لا يمكن ترميز هذا الرمز</div>
      </div>
    );
  }

  const quiet = fit ? code128InnerQuietZone(encoding.barModules, fit.widthMm, fit.marginMm) : CODE128_QUIET_ZONE;
  const total = encoding.barModules + 2 * quiet;
  const bars: { x: number; w: number }[] = [];
  let x = quiet;
  encoding.widths.forEach((w, i) => {
    if (i % 2 === 0) bars.push({ x, w });
    x += w;
  });

  return (
    <svg
      role="img"
      aria-label={value}
      viewBox={`0 0 ${total} 10`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      className={className}
      style={{ display: "block", width: "100%", height }}
    >
      <rect x={0} y={0} width={total} height={10} fill="#fff" />
      {bars.map((b) => (
        <rect key={b.x} x={b.x} y={0} width={b.w} height={10} fill="#000" />
      ))}
    </svg>
  );
};
