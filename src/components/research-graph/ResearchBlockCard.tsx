import type { ResearchBlock } from "@/lib/types";
import { BLOCK_CARD } from "./config";

export function ResearchBlockCard({
  block,
  outlineWidth,
}: {
  block: ResearchBlock;
  outlineWidth: number;
}) {
  return (
    <div
      className="grid cursor-grab touch-none gap-4 overflow-hidden rounded-none bg-white p-5 text-black shadow-none outline-0 select-none active:cursor-grabbing [-webkit-tap-highlight-color:transparent]"
      data-block-id={block.id}
      style={{
        boxShadow: `inset 0 0 0 ${outlineWidth}px #000`,
        minHeight: BLOCK_CARD.height,
        width: BLOCK_CARD.width,
      }}
    >
      <strong className="text-[40px] leading-[1.05] font-bold tracking-normal text-black">
        {block.title}
      </strong>
      {block.kind === "link" ? (
        <p className="m-0 text-[28px] leading-tight tracking-normal text-black underline">
          {linkHost(block.url)}
        </p>
      ) : (
        <p className="m-0 text-[28px] leading-tight tracking-normal text-black">
          {block.body}
        </p>
      )}
    </div>
  );
}

function linkHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url || "No URL";
  }
}
