export const PLOT = {
  left: 280,
  top: 80,
  width: 2200,
  height: 1500,
  rightGutter: 180,
  bottomGutter: 240,
} as const;

export const WORLD = {
  width: PLOT.left + PLOT.width + PLOT.rightGutter,
  height: PLOT.top + PLOT.height + PLOT.bottomGutter,
  maxScale: 2,
} as const;

export const BLOCK_CARD = {
  width: 190,
  height: 104,
} as const;

export const PLAYHTML_GRAPH = {
  roomVersion: "display-v4-react-flow",
  stateName: "research-graph-state",
} as const;

export const SHARED_GRAPH_SCHEMA_VERSION = 1 as const;
