"use client";

import { Plus, Trash2 } from "lucide-react";
import type { BlockKind, ResearchBlock } from "@/lib/types";

export function ResearchGraphToolbar({
  onAddBlock,
  onDeleteBlock,
  onUpdateBlock,
  selectedBlock,
}: {
  onAddBlock: () => void;
  onDeleteBlock: () => void;
  onUpdateBlock: (
    blockId: string,
    patch: Partial<Pick<ResearchBlock, "body" | "kind" | "title" | "url">>,
  ) => void;
  selectedBlock: ResearchBlock | null;
}) {
  return (
    <header className="flex min-h-12 flex-wrap items-center gap-2 border-b border-black bg-white px-2 py-2 text-black">
      <button
        aria-label="Add block"
        className="inline-flex h-8 items-center gap-1 border border-black bg-white px-2 text-sm leading-none font-bold text-black hover:bg-black hover:text-white"
        onClick={onAddBlock}
        title="Add block"
        type="button"
      >
        <Plus aria-hidden="true" className="size-4" strokeWidth={2} />
        Block
      </button>

      {selectedBlock ? (
        <>
          <select
            aria-label="Block kind"
            className="h-8 border border-black bg-white px-2 text-sm leading-none text-black"
            onChange={(event) =>
              onUpdateBlock(selectedBlock.id, {
                kind: event.currentTarget.value as BlockKind,
              })
            }
            value={selectedBlock.kind}
          >
            <option value="text">Text</option>
            <option value="link">Link</option>
          </select>

          <input
            aria-label="Block title"
            className="h-8 min-w-0 flex-[1_1_160px] border border-black bg-white px-2 text-sm leading-none text-black placeholder:text-black/45"
            onChange={(event) =>
              onUpdateBlock(selectedBlock.id, {
                title: event.currentTarget.value,
              })
            }
            placeholder="Title"
            value={selectedBlock.title}
          />

          <input
            aria-label={selectedBlock.kind === "link" ? "Block URL" : "Block text"}
            className="h-8 min-w-0 flex-[2_1_260px] border border-black bg-white px-2 text-sm leading-none text-black placeholder:text-black/45"
            onChange={(event) =>
              onUpdateBlock(selectedBlock.id, {
                [selectedBlock.kind === "link" ? "url" : "body"]:
                  event.currentTarget.value,
              })
            }
            placeholder={selectedBlock.kind === "link" ? "URL" : "Text"}
            value={
              selectedBlock.kind === "link" ? selectedBlock.url : selectedBlock.body
            }
          />

          <button
            aria-label="Delete selected block"
            className="inline-flex size-8 items-center justify-center border border-black bg-white text-black hover:bg-black hover:text-white"
            onClick={onDeleteBlock}
            title="Delete selected block"
            type="button"
          >
            <Trash2 aria-hidden="true" className="size-4" strokeWidth={2} />
          </button>
        </>
      ) : (
        <span className="text-sm leading-none text-black/55">No block selected</span>
      )}
    </header>
  );
}
