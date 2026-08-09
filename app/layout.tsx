import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Superwhisper — Concept Mockups",
  description: "Visual concept proposal for Superwhisper's redesigned settings UX",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
