import type { ResearchBlock } from "@/lib/types";

export type Point = {
  x: number;
  y: number;
};

export type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type SharedGraphData = {
  schemaVersion: number;
  projectId: string;
  blockIds: string[];
  blocksById: Record<string, ResearchBlock>;
};

export type SharedGraphDataSetter = (
  data: SharedGraphData | ((draft: SharedGraphData) => void),
) => void;
