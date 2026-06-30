import type { CSSProperties } from "react";
import { PLOT } from "@/components/research-graph/config";
import { roundCssValue } from "@/components/research-graph/geometry";
import type { GraphMode } from "@/lib/types";

export type AxisNodeData = {
  graphMode: GraphMode;
  xLabel: string;
  yLabel: string;
};

export function AxisNodeContent({
  xLabel,
  yLabel,
}: AxisNodeData) {
  const labelGap = 70;
  const labelFontSize = 64;
  const yLabelCenterOffset = labelGap + labelFontSize / 2;
  const labelClassName =
    "pointer-events-none absolute whitespace-nowrap text-black text-[length:var(--label-size)] leading-none font-bold tracking-normal";
  const labelStyle = {
    "--label-size": `${roundCssValue(labelFontSize)}px`,
  } as CSSProperties;

  return (
    <div
      className="pointer-events-none relative bg-white"
      style={{ height: PLOT.height, width: PLOT.width }}
    >
      <div
        className={`${labelClassName} z-20`}
        style={{
          ...labelStyle,
          transform: `translate(${roundCssValue(PLOT.width / 2)}px, ${roundCssValue(PLOT.height + labelGap)}px) translateX(-50%)`,
        }}
      >
        {xLabel}
      </div>
      <div
        className={`${labelClassName} z-20 origin-center`}
        style={{
          ...labelStyle,
          transform: `translate(${-roundCssValue(yLabelCenterOffset)}px, ${roundCssValue(PLOT.height / 2)}px) translate(-50%, -50%) rotate(-90deg)`,
        }}
      >
        {yLabel}
      </div>
    </div>
  );
}
