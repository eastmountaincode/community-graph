export type GraphMode = "origin" | "quadrant";

export type BlockKind = "text" | "link";

export type ResearchProject = {
  id: string;
  title: string;
  slug: string;
  xLabel: string;
  yLabel: string;
  graphMode: GraphMode;
  createdAt: string;
  updatedAt: string;
};

export type ResearchBlock = {
  id: string;
  projectId: string;
  kind: BlockKind;
  title: string;
  body: string;
  url: string;
  x: number;
  y: number;
  createdAt: string;
  updatedAt: string;
};

export type ResearchState = {
  project: ResearchProject;
  blocks: ResearchBlock[];
};
