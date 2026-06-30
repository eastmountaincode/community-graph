"use client";

import { usePageData } from "@playhtml/react";
import { ResearchGraphCanvas } from "@/components/research-graph/ResearchGraphCanvas";
import { PLAYHTML_GRAPH, SHARED_GRAPH_SCHEMA_VERSION } from "./config";
import { getSharedBlocks } from "@/components/research-graph/shared-state";
import type { SharedGraphData } from "@/components/research-graph/types";
import type { ResearchState } from "@/lib/types";

export function ResearchGraph({
  initialGraphData,
  project,
}: {
  initialGraphData: SharedGraphData;
  project: ResearchState["project"];
}) {
  const [graphData, setGraphData] = usePageData<SharedGraphData>(
    `${PLAYHTML_GRAPH.stateName}:${project.id}:${PLAYHTML_GRAPH.roomVersion}`,
    initialGraphData,
  );
  const validGraphData =
    graphData.schemaVersion === SHARED_GRAPH_SCHEMA_VERSION &&
    graphData.projectId === project.id
      ? graphData
      : initialGraphData;

  return (
    <ResearchGraphCanvas
      blocks={getSharedBlocks(validGraphData)}
      graphMode={project.graphMode}
      projectId={project.id}
      setGraphData={setGraphData}
      xLabel={project.xLabel}
      yLabel={project.yLabel}
    />
  );
}
