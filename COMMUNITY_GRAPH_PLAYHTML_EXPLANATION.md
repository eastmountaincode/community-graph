# Community Graph: How the Prototype Works

This is a small collaborative graph prototype. The page has a site header,
a project title, a block toolbar, and a graph canvas. The current project is
`Bandwidth vs IRL`, with the x-axis labeled `Bandwidth of expression` and the
y-axis labeled `Proximity to IRL`.

The main interaction is simple: people place blocks on an x/y graph. A block can
be text or a link. The meaning of a block comes partly from its content and
partly from where it sits on the graph.

## What Each Library Does

The app uses two different systems together:

1. **React Flow** handles the whiteboard/canvas behavior.
   It gives us panning, zooming, draggable nodes, mobile pointer handling, and
   node selection.

2. **PlayHTML** handles shared state and presence.
   It keeps the graph data synced between browsers in the same room, so when one
   person adds, edits, deletes, or moves a block, everyone else can receive the
   same updated graph data.

A short way to explain it:

> React Flow is the canvas. PlayHTML is the shared state layer.

## The Shared Data Model

The graph data is stored as one shared object:

```ts
type SharedGraphData = {
  schemaVersion: number;
  projectId: string;
  blockIds: string[];
  blocksById: Record<string, ResearchBlock>;
};
```

Each block has:

```ts
type ResearchBlock = {
  id: string;
  projectId: string;
  kind: "text" | "link";
  title: string;
  body: string;
  url: string;
  x: number;
  y: number;
  createdAt: string;
  updatedAt: string;
};
```

The important part is that `x` and `y` are stored as graph coordinates, not raw
screen pixels. That means the block still has a meaningful position even if the
viewer pans, zooms, resizes the window, or opens the site on mobile.

## How PlayHTML Is Set Up

The whole workspace is wrapped in `PlayProvider` in:

```txt
src/components/ResearchWorkspace.tsx
```

The room name is based on the current project:

```ts
const playhtmlRoom = `research-graph:${project.id}:${PLAYHTML_GRAPH.roomVersion}`;
```

That room name is the shared namespace. Everyone in the same room sees the same
shared graph state.

The provider also enables cursors:

```ts
cursors: {
  enabled: true,
  playerIdentity: getLocalPlayhtmlCursorIdentity(),
  room: "page",
  shouldRenderCursor: (presence) =>
    presence.page === window.location.pathname,
}
```

So PlayHTML is also being used for presence: other users' cursors can be shown
on the same page.

## How CRUD Works

The graph component uses PlayHTML's `usePageData` hook:

```ts
const [graphData, setGraphData] = usePageData<SharedGraphData>(
  `${PLAYHTML_GRAPH.stateName}:${project.id}:${PLAYHTML_GRAPH.roomVersion}`,
  initialGraphData,
);
```

This gives the app:

- `graphData`: the current shared graph object
- `setGraphData`: a way to update that shared object

CRUD operations are normal object mutations inside `setGraphData`.

### Create

When the user clicks the add button, the app creates a new block object and
adds it to the shared data:

```ts
setGraphData((draft) => addSharedBlock(draft, block));
```

`addSharedBlock` adds the block ID to `blockIds` and stores the full block in
`blocksById`.

### Read

The UI reads the shared data with:

```ts
const blocks = getSharedBlocks(validGraphData);
```

That turns `blockIds` plus `blocksById` into an ordered array of blocks that
React Flow can render.

### Update

When a selected block is edited in the toolbar, the app updates that block in
shared data:

```ts
setGraphData((draft) =>
  updateSharedBlockDetails(draft, blockId, patch),
);
```

The patch can change the block title, text body, URL, or kind.

### Delete

When the delete button is clicked, the selected block is removed from the shared
data:

```ts
setGraphData((draft) => deleteSharedBlock(draft, selectedBlock.id));
```

The delete operation removes the ID from `blockIds` and removes the block from
`blocksById`.

## How Moving Blocks Works

Dragging is handled by React Flow in:

```txt
src/components/research-graph/ResearchGraphCanvas.tsx
```

React Flow emits drag events when a node moves:

```ts
onNodeDrag={handleNodeDrag}
onNodeDragStop={handleNodeDragStop}
```

During drag, the app converts the React Flow node position back into graph
coordinates:

```ts
const graphPoint = worldToGraph(
  {
    x: node.position.x + BLOCK_CARD.width / 2,
    y: node.position.y + BLOCK_CARD.height / 2,
  },
  bounds,
);
```

Then it writes those graph coordinates into PlayHTML shared state:

```ts
setGraphData((draft) =>
  updateSharedBlock(draft, node.data.block.id, graphPoint),
);
```

That means moving a card is just another update to the shared block object:

```ts
block.x = graphPoint.x;
block.y = graphPoint.y;
```

Other browsers receive the updated `x` and `y`, then React Flow re-renders the
block at the new position.

## Why Drag Updates Are Throttled

Dragging can fire many events per second. To avoid constantly writing state too
fast, the drag handler batches movement through `requestAnimationFrame`.

The practical explanation:

> While a block is being dragged, we only write its latest position once per
> animation frame. That keeps real-time movement responsive without flooding
> the shared state layer.

On drag stop, the app writes the final position one more time so the saved
position is exact.

## How Boundaries Work

React Flow is told that block nodes can only move inside the plot area:

```ts
extent: blockExtent
```

The app also clamps block positions so the whole card stays inside the graph,
not just the card's center point. This is why the card cannot be dragged outside
the graph border.

## How Selection Works

Selection is local UI state, not shared PlayHTML state.

When a user clicks a block, the app stores:

```ts
selectedBlockId
```

That selected block's details appear in the toolbar. Editing those details does
go into shared PlayHTML data, but the fact that "I currently selected this
block" is local to the browser.

That is intentional for now. One user selecting a block should not necessarily
force everyone else to select the same block.

## How Cursors Work

PlayHTML cursor support is enabled in `PlayProvider`. The graph canvas also
registers itself as a cursor zone:

```ts
useCursorZone(stageRef);
```

That tells PlayHTML to track cursor positions relative to the graph area. This
matters because the graph can pan and zoom; the cursor system needs to know what
area it is tracking.

## What Is Not Implemented Yet

This prototype currently focuses on the graph interaction. It does not yet have:

- project switching
- a real D1-backed project list
- authentication
- moderation
- chat
- permanent database persistence for every graph operation

PlayHTML is currently the collaboration layer for the prototype. Later, D1 can
be added as a durable database layer for projects and saved graph state.

## One-Sentence Explanation

This prototype uses React Flow for the zoomable draggable graph, while PlayHTML
provides a shared room and shared data object; adding, editing, deleting, and
moving blocks are all implemented as updates to that shared object, so other
people in the same room can see the graph change in real time.
