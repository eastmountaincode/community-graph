"use client";

import { usePageData } from "@playhtml/react";
import { useCallback, useMemo, useState } from "react";
import { ResearchGraphCanvas } from "@/components/research-graph/ResearchGraphCanvas";
import { ResearchGraphToolbar } from "@/components/research-graph/ResearchGraphToolbar";
import { PLAYHTML_GRAPH, SHARED_GRAPH_SCHEMA_VERSION } from "./config";
import {
  addSharedBlock,
  deleteSharedBlock,
  getSharedBlocks,
  updateSharedBlockDetails,
} from "@/components/research-graph/shared-state";
import type { SharedGraphData } from "@/components/research-graph/types";
import type { ResearchBlock, ResearchState } from "@/lib/types";

export function ResearchGraph({
  initialGraphData,
  project,
}: {
  initialGraphData: SharedGraphData;
  project: ResearchState["project"];
}) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [graphData, setGraphData] = usePageData<SharedGraphData>(
    `${PLAYHTML_GRAPH.stateName}:${project.id}:${PLAYHTML_GRAPH.roomVersion}`,
    initialGraphData,
  );
  const validGraphData =
    graphData.schemaVersion === SHARED_GRAPH_SCHEMA_VERSION &&
    graphData.projectId === project.id
      ? graphData
      : initialGraphData;
  const blocks = useMemo(() => getSharedBlocks(validGraphData), [validGraphData]);
  const selectedBlock =
    blocks.find((block) => block.id === selectedBlockId) ?? null;
  const activeSelectedBlockId = selectedBlock ? selectedBlockId : null;

  const handleAddBlock = useCallback(() => {
    const blockId = `block-${crypto.randomUUID()}`;
    const createdAt = new Date().toISOString();
    const block: ResearchBlock = {
      id: blockId,
      projectId: project.id,
      kind: "text",
      title: "Untitled block",
      body: "",
      url: "",
      x: project.graphMode === "quadrant" ? 0 : 50,
      y: project.graphMode === "quadrant" ? 0 : 50,
      createdAt,
      updatedAt: createdAt,
    };

    setGraphData((draft) => addSharedBlock(draft, block));
    setSelectedBlockId(blockId);
  }, [project.graphMode, project.id, setGraphData]);

  const handleUpdateBlock = useCallback(
    (
      blockId: string,
      patch: Partial<Pick<ResearchBlock, "body" | "kind" | "title" | "url">>,
    ) => {
      setGraphData((draft) => updateSharedBlockDetails(draft, blockId, patch));
    },
    [setGraphData],
  );

  const handleDeleteBlock = useCallback(() => {
    if (!selectedBlock) {
      return;
    }

    setGraphData((draft) => deleteSharedBlock(draft, selectedBlock.id));
    setSelectedBlockId(null);
  }, [selectedBlock, setGraphData]);

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] bg-white text-black">
      <ResearchGraphToolbar
        onAddBlock={handleAddBlock}
        onDeleteBlock={handleDeleteBlock}
        onUpdateBlock={handleUpdateBlock}
        selectedBlock={selectedBlock}
      />
      <ResearchGraphCanvas
        blocks={blocks}
        graphMode={project.graphMode}
        onSelectBlock={setSelectedBlockId}
        projectId={project.id}
        selectedBlockId={activeSelectedBlockId}
        setGraphData={setGraphData}
        xLabel={project.xLabel}
        yLabel={project.yLabel}
      />
    </div>
  );
}
