"use client";

import {
  ReactFlow,
  applyNodeChanges,
  type CoordinateExtent,
  type FitViewOptions,
  type Node,
  type NodeChange,
  type NodeProps,
  type NodeTypes,
  type OnNodeDrag,
  useReactFlow,
  useViewport,
} from "@xyflow/react";
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AxisNodeContent, type AxisNodeData } from "./AxisOverlays";
import { ResearchBlockCard } from "./ResearchBlockCard";
import { BLOCK_CARD, PLOT, WORLD } from "./config";
import { clamp, getBounds, graphToWorld, worldToGraph } from "./geometry";
import { updateSharedBlock } from "./shared-state";
import type { SharedGraphDataSetter } from "@/components/research-graph/types";
import type { GraphMode, ResearchBlock } from "@/lib/types";

type ResearchNodeData = {
  block: ResearchBlock;
};

type FitAnchorNodeData = {
  label: string;
};

type ResearchFlowNode =
  | Node<ResearchNodeData, "researchBlock">
  | Node<AxisNodeData, "axisPlane">
  | Node<FitAnchorNodeData, "fitAnchor">;

const fitAnchorIds = ["fit-anchor-top-left", "fit-anchor-bottom-right"];
const fitViewOptions: FitViewOptions<ResearchFlowNode> = {
  maxZoom: 1,
  minZoom: 0.1,
  nodes: fitAnchorIds.map((id) => ({ id })),
  padding: 0.02,
};
const nodeTypes = {
  researchBlock: ResearchBlockNode,
  axisPlane: AxisPlaneNode,
  fitAnchor: FitAnchorNode,
} satisfies NodeTypes;

export function ResearchGraphCanvas({
  blocks,
  graphMode,
  projectId,
  setGraphData,
  xLabel,
  yLabel,
}: {
  blocks: ResearchBlock[];
  graphMode: GraphMode;
  projectId: string;
  setGraphData: SharedGraphDataSetter;
  xLabel: string;
  yLabel: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const pendingDragFrameRef = useRef(0);
  const pendingDragNodeRef = useRef<Node<ResearchNodeData, "researchBlock"> | null>(
    null,
  );
  const draggingNodeIdRef = useRef<string | null>(null);
  const bounds = useMemo(() => getBounds(graphMode), [graphMode]);
  const blockExtent = useMemo<CoordinateExtent>(
    () => [
      [PLOT.left, PLOT.top],
      [PLOT.left + PLOT.width, PLOT.top + PLOT.height],
    ],
    [],
  );
  const [nodes, setNodes] = useState<ResearchFlowNode[]>(() =>
    makeFlowNodes(blocks, bounds, blockExtent, graphMode, xLabel, yLabel),
  );

  useEffect(() => {
    setNodes((currentNodes) =>
      reconcileFlowNodes({
        blockExtent,
        blocks,
        bounds,
        currentNodes,
        draggingNodeId: draggingNodeIdRef.current,
        graphMode,
        xLabel,
        yLabel,
      }),
    );
  }, [blockExtent, blocks, bounds, graphMode, xLabel, yLabel]);

  const handleNodesChange = useCallback(
    (changes: NodeChange<ResearchFlowNode>[]) => {
      setNodes((currentNodes) => applyNodeChanges(changes, currentNodes));
    },
    [],
  );

  const writeNodePositionToShared = useCallback(
    (node: Node<ResearchNodeData, "researchBlock">) => {
      const graphPoint = worldToGraph(
        {
          x: node.position.x + BLOCK_CARD.width / 2,
          y: node.position.y + BLOCK_CARD.height / 2,
        },
        bounds,
      );
      setGraphData((draft) =>
        updateSharedBlock(draft, node.data.block.id, graphPoint),
      );
    },
    [bounds, setGraphData],
  );

  const handleNodeDrag = useCallback<OnNodeDrag<ResearchFlowNode>>(
    (_event, node) => {
      if (!isResearchBlockNode(node)) {
        return;
      }

      draggingNodeIdRef.current = node.id;
      pendingDragNodeRef.current = node;

      if (pendingDragFrameRef.current) {
        return;
      }

      pendingDragFrameRef.current = requestAnimationFrame(() => {
        const pendingNode = pendingDragNodeRef.current;
        pendingDragFrameRef.current = 0;
        pendingDragNodeRef.current = null;

        if (pendingNode) {
          writeNodePositionToShared(pendingNode);
        }
      });
    },
    [writeNodePositionToShared],
  );

  const handleNodeDragStop = useCallback<OnNodeDrag<ResearchFlowNode>>(
    (_event, node) => {
      if (!isResearchBlockNode(node)) {
        return;
      }

      if (pendingDragFrameRef.current) {
        cancelAnimationFrame(pendingDragFrameRef.current);
        pendingDragFrameRef.current = 0;
        pendingDragNodeRef.current = null;
      }

      writeNodePositionToShared(node);
      draggingNodeIdRef.current = null;
    },
    [writeNodePositionToShared],
  );

  useEffect(() => {
    return () => {
      if (pendingDragFrameRef.current) {
        cancelAnimationFrame(pendingDragFrameRef.current);
      }
      draggingNodeIdRef.current = null;
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="relative h-full min-h-0 w-full cursor-grab touch-none overflow-hidden bg-white select-none active:cursor-grabbing [-webkit-tap-highlight-color:transparent]"
      data-playhtml-graph-state
      id={`research-graph-state-${projectId}`}
    >
      <ReactFlow
        className="bg-white"
        colorMode="light"
        edges={[]}
        elementsSelectable
        fitView
        fitViewOptions={fitViewOptions}
        maxZoom={WORLD.maxScale}
        minZoom={0.1}
        nodeTypes={nodeTypes}
        nodes={nodes}
        nodesConnectable={false}
        nodesDraggable
        nodesFocusable={false}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        onNodesChange={handleNodesChange}
        panOnDrag
        proOptions={{ hideAttribution: true }}
        selectNodesOnDrag={false}
        translateExtent={[
          [0, 0],
          [WORLD.width, WORLD.height],
        ]}
        zoomOnDoubleClick={false}
        zoomOnPinch
        zoomOnScroll
      >
        <ViewportResizeFitter containerRef={stageRef} />
        <GraphLineOverlay graphMode={graphMode} />
      </ReactFlow>
    </div>
  );
}

function makeFlowNodes(
  blocks: ResearchBlock[],
  bounds: ReturnType<typeof getBounds>,
  blockExtent: CoordinateExtent,
  graphMode: GraphMode,
  xLabel: string,
  yLabel: string,
): ResearchFlowNode[] {
  const blockNodes = blocks.map<ResearchFlowNode>((block) => ({
    data: { block },
    extent: blockExtent,
    id: block.id,
    position: blockToNodePosition(block, bounds),
    type: "researchBlock",
    zIndex: 10,
  }));

  return [
    {
      data: { label: "Top left canvas fit anchor" },
      draggable: false,
      focusable: false,
      id: fitAnchorIds[0],
      position: { x: 0, y: 0 },
      selectable: false,
      type: "fitAnchor",
    },
    {
      data: { graphMode, xLabel, yLabel },
      draggable: false,
      focusable: false,
      id: "axis-plane",
      position: {
        x: PLOT.left,
        y: PLOT.top,
      },
      selectable: false,
      type: "axisPlane",
      zIndex: 0,
    },
    {
      data: { label: "Bottom right canvas fit anchor" },
      draggable: false,
      focusable: false,
      id: fitAnchorIds[1],
      position: { x: WORLD.width, y: WORLD.height },
      selectable: false,
      type: "fitAnchor",
    },
    ...blockNodes,
  ];
}

function reconcileFlowNodes({
  blockExtent,
  blocks,
  bounds,
  currentNodes,
  draggingNodeId,
  graphMode,
  xLabel,
  yLabel,
}: {
  blockExtent: CoordinateExtent;
  blocks: ResearchBlock[];
  bounds: ReturnType<typeof getBounds>;
  currentNodes: ResearchFlowNode[];
  draggingNodeId: string | null;
  graphMode: GraphMode;
  xLabel: string;
  yLabel: string;
}): ResearchFlowNode[] {
  const nextNodes = makeFlowNodes(
    blocks,
    bounds,
    blockExtent,
    graphMode,
    xLabel,
    yLabel,
  );
  const currentNodesById = new Map(
    currentNodes.map((node) => [node.id, node] as const),
  );

  return nextNodes.map((nextNode) => {
    const currentNode = currentNodesById.get(nextNode.id);

    if (!currentNode || currentNode.type !== nextNode.type) {
      return nextNode;
    }

    if (isResearchBlockNode(nextNode) && isResearchBlockNode(currentNode)) {
      if (nextNode.id === draggingNodeId) {
        return {
          ...currentNode,
          extent: nextNode.extent,
          zIndex: nextNode.zIndex,
        };
      }

      return {
        ...currentNode,
        data: nextNode.data,
        extent: nextNode.extent,
        position: nextNode.position,
        zIndex: nextNode.zIndex,
      };
    }

    return {
      ...currentNode,
      data: nextNode.data,
      position: nextNode.position,
      zIndex: nextNode.zIndex,
    } as ResearchFlowNode;
  });
}

function AxisPlaneNode({ data }: NodeProps<Node<AxisNodeData>>) {
  return <AxisNodeContent {...data} />;
}

function blockToNodePosition(block: ResearchBlock, bounds: ReturnType<typeof getBounds>) {
  const center = graphToWorld(block, bounds);

  return clampBlockNodePosition({
    x: center.x - BLOCK_CARD.width / 2,
    y: center.y - BLOCK_CARD.height / 2,
  });
}

function clampBlockNodePosition(position: { x: number; y: number }) {
  return {
    x: clamp(
      position.x,
      PLOT.left,
      PLOT.left + PLOT.width - BLOCK_CARD.width,
    ),
    y: clamp(
      position.y,
      PLOT.top,
      PLOT.top + PLOT.height - BLOCK_CARD.height,
    ),
  };
}

function ResearchBlockNode({ data }: NodeProps<Node<ResearchNodeData>>) {
  const viewport = useViewport();

  return <ResearchBlockCard block={data.block} outlineWidth={1 / viewport.zoom} />;
}

function FitAnchorNode() {
  return <div className="size-px opacity-0" />;
}

function GraphLineOverlay({
  graphMode,
}: {
  graphMode: GraphMode;
}) {
  const viewport = useViewport();
  const plotLeft = viewport.x + PLOT.left * viewport.zoom;
  const plotTop = viewport.y + PLOT.top * viewport.zoom;
  const plotRight = viewport.x + (PLOT.left + PLOT.width) * viewport.zoom;
  const plotBottom = viewport.y + (PLOT.top + PLOT.height) * viewport.zoom;
  const plotMidX = viewport.x + (PLOT.left + PLOT.width / 2) * viewport.zoom;
  const plotMidY = viewport.y + (PLOT.top + PLOT.height / 2) * viewport.zoom;
  const isQuadrant = graphMode === "quadrant";

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 size-full overflow-visible"
    >
      <rect
        data-graph-outline
        fill="none"
        height={plotBottom - plotTop}
        shapeRendering="crispEdges"
        stroke="black"
        strokeWidth={1}
        width={plotRight - plotLeft}
        x={plotLeft}
        y={plotTop}
      />
      {isQuadrant ? (
        <>
          <line
            shapeRendering="crispEdges"
            stroke="black"
            strokeWidth={1}
            x1={plotLeft}
            x2={plotRight}
            y1={plotMidY}
            y2={plotMidY}
          />
          <line
            shapeRendering="crispEdges"
            stroke="black"
            strokeWidth={1}
            x1={plotMidX}
            x2={plotMidX}
            y1={plotTop}
            y2={plotBottom}
          />
        </>
      ) : null}
    </svg>
  );
}

function isResearchBlockNode(
  node: ResearchFlowNode,
): node is Node<ResearchNodeData, "researchBlock"> {
  return node.type === "researchBlock";
}

function ViewportResizeFitter({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const reactFlow = useReactFlow<ResearchFlowNode>();
  const lastSizeRef = useRef("");

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !reactFlow.viewportInitialized) {
      return;
    }

    let frame = 0;
    const fitToCurrentSize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const { height, width } = container.getBoundingClientRect();
        const sizeKey = `${Math.round(width)}x${Math.round(height)}`;

        if (height <= 0 || width <= 0 || sizeKey === lastSizeRef.current) {
          return;
        }

        lastSizeRef.current = sizeKey;
        void reactFlow.fitView(fitViewOptions);
      });
    };

    fitToCurrentSize();

    const observer = new ResizeObserver(fitToCurrentSize);
    observer.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [containerRef, reactFlow]);

  return null;
}
