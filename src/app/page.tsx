"use client";

import dynamic from "next/dynamic";

const ResearchWorkspace = dynamic(
  () =>
    import("@/components/ResearchWorkspace").then(
      (module) => module.ResearchWorkspace,
    ),
  {
    ssr: false,
    loading: () => (
      <main className="grid h-[100svh] content-start bg-white p-3 text-black">
        <p>Loading graph</p>
      </main>
    ),
  },
);

export default function Home() {
  return <ResearchWorkspace />;
}
