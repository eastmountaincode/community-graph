import type { ResearchBlock } from "@/lib/types";
import { BLOCK_CARD } from "./config";

export function ResearchBlockCard({
  block,
  outlineWidth,
}: {
  block: ResearchBlock;
  outlineWidth: number;
}) {
  const linkHref = block.kind === "link" ? normalizedUrl(block.url) : null;

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
        linkHref ? (
          <a
            className="nodrag nopan m-0 w-fit cursor-pointer text-[28px] leading-tight tracking-normal text-black underline"
            href={linkHref}
            onClick={(event) => event.stopPropagation()}
            onDoubleClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            rel="noreferrer"
            target="_blank"
          >
            {linkHost(linkHref)}
          </a>
        ) : (
          <p className="m-0 text-[28px] leading-tight tracking-normal text-black">
            No URL
          </p>
        )
      ) : (
        <p className="m-0 text-[28px] leading-tight tracking-normal text-black">
          {block.body}
        </p>
      )}
    </div>
  );
}

function normalizedUrl(url: string): string | null {
  try {
    return new URL(url).href;
  } catch {
    return null;
  }
}

function linkHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url || "No URL";
  }
}
