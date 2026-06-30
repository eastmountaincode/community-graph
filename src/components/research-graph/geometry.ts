import { PLOT } from "@/components/research-graph/config";
import type { Bounds, Point } from "@/components/research-graph/types";
import type { GraphMode } from "@/lib/types";

export function getBounds(mode: GraphMode): Bounds {
  if (mode === "quadrant") {
    return { minX: -100, maxX: 100, minY: -100, maxY: 100 };
  }

  return { minX: 0, maxX: 100, minY: 0, maxY: 100 };
}

export function graphToWorld(point: Point, bounds: Bounds): Point {
  return {
    x:
      PLOT.left +
      ((point.x - bounds.minX) / (bounds.maxX - bounds.minX)) * PLOT.width,
    y:
      PLOT.top +
      ((bounds.maxY - point.y) / (bounds.maxY - bounds.minY)) * PLOT.height,
  };
}

export function worldToGraph(point: Point, bounds: Bounds): Point {
  const x =
    bounds.minX +
    ((point.x - PLOT.left) / PLOT.width) * (bounds.maxX - bounds.minX);
  const y =
    bounds.maxY -
    ((point.y - PLOT.top) / PLOT.height) * (bounds.maxY - bounds.minY);

  return {
    x: roundGraphValue(clamp(x, bounds.minX, bounds.maxX)),
    y: roundGraphValue(clamp(y, bounds.minY, bounds.maxY)),
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundGraphValue(value: number): number {
  return Math.round(value * 100) / 100;
}

export function roundCssValue(value: number): number {
  return Math.round(value * 1000) / 1000;
}
