import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Поиск — Игровой форум",
  description: "Поиск по темам и обсуждениям на форуме.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
