"use client";

import { PlayProvider } from "@playhtml/react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { PLAYHTML_GRAPH } from "@/components/research-graph/config";
import { initialResearchState } from "@/components/research-graph/initial-state";
import { ResearchGraph } from "@/components/research-graph/ResearchGraph";
import { makeSharedGraphData } from "@/components/research-graph/shared-state";
import { getLocalPlayhtmlCursorIdentity } from "@/lib/playhtml-cursor-identity";

export function ResearchWorkspace() {
  const pathname = usePathname();
  const { blocks, project } = initialResearchState;
  const initialGraphData = makeSharedGraphData(project.id, blocks);
  const playhtmlRoom = `research-graph:${project.id}:${PLAYHTML_GRAPH.roomVersion}`;
  const playhtmlOptions = useMemo(
    () => ({
      cursors: {
        enabled: true,
        playerIdentity: getLocalPlayhtmlCursorIdentity(),
        room: "page" as const,
        shouldRenderCursor: (presence: { page?: string }) =>
          presence.page === window.location.pathname,
      },
      room: playhtmlRoom,
    }),
    [playhtmlRoom],
  );

  return (
    <PlayProvider initOptions={playhtmlOptions} pathname={pathname}>
      <main className="grid h-[100svh] grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-white text-black">
        <header className="min-w-0 border-b border-black">
          <h1 className="m-0 text-2xl leading-none font-bold tracking-normal text-black p-2">
            {project.title}
          </h1>
        </header>

        <section
          className="h-full min-h-0 overflow-hidden bg-white"
          aria-label="Research graph"
        >
          <ResearchGraph initialGraphData={initialGraphData} project={project} />
        </section>
      </main>
    </PlayProvider>
  );
}
