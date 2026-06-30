import { SHARED_GRAPH_SCHEMA_VERSION } from "@/components/research-graph/config";
import type {
  Point,
  SharedGraphData,
} from "@/components/research-graph/types";
import type { ResearchBlock } from "@/lib/types";

export function makeSharedGraphData(
  projectId: string,
  blocks: ResearchBlock[],
): SharedGraphData {
  return {
    schemaVersion: SHARED_GRAPH_SCHEMA_VERSION,
    projectId,
    blockIds: blocks.map((block) => block.id),
    blocksById: Object.fromEntries(blocks.map((block) => [block.id, block])),
  };
}

export function getSharedBlocks(data: SharedGraphData): ResearchBlock[] {
  return data.blockIds
    .map((blockId) => data.blocksById[blockId])
    .filter((block): block is ResearchBlock => Boolean(block));
}

export function addSharedBlock(
  data: SharedGraphData,
  block: ResearchBlock,
): void {
  if (!data.blockIds.includes(block.id)) {
    data.blockIds.push(block.id);
  }

  data.blocksById[block.id] = block;
}

export function updateSharedBlockDetails(
  data: SharedGraphData,
  blockId: string,
  patch: Partial<Pick<ResearchBlock, "body" | "kind" | "title" | "url">>,
): void {
  const block = data.blocksById[blockId];

  if (!block) {
    return;
  }

  Object.assign(block, patch, { updatedAt: new Date().toISOString() });
}

export function deleteSharedBlock(
  data: SharedGraphData,
  blockId: string,
): void {
  data.blockIds.splice(
    0,
    data.blockIds.length,
    ...data.blockIds.filter((id) => id !== blockId),
  );
  delete data.blocksById[blockId];
}

export function updateLocalBlockPosition(
  blocks: ResearchBlock[],
  blockId: string,
  graphPoint: Point,
): ResearchBlock[] {
  return blocks.map((block) => {
    if (block.id !== blockId) {
      return block;
    }

    return {
      ...block,
      x: graphPoint.x,
      y: graphPoint.y,
    };
  });
}

export function updateSharedBlock(
  data: SharedGraphData,
  blockId: string,
  graphPoint: Point,
): void {
  const block = data.blocksById[blockId];

  if (!block) {
    return;
  }

  block.x = graphPoint.x;
  block.y = graphPoint.y;
  block.updatedAt = new Date().toISOString();
}
