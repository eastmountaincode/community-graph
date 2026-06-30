import type { Metadata } from "next";
import "./globals.css";
import "@xyflow/react/dist/style.css";

export const metadata: Metadata = {
  title: "Bandwidth vs IRL",
  description: "A community research graph.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen overscroll-none bg-white font-sans text-black antialiased">
        {children}
      </body>
    </html>
  );
}
