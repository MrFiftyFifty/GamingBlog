import type { MetadataRoute } from "next";
import { SECTIONS } from "@/lib/constants";
import { MOCK_TOPICS } from "@/lib/mock-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();

  const staticPaths = ["", "/forum", "/auth/login", "/auth/register", "/search"].map(
    (p) => ({
      url: `${base}${p}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: p === "" ? 1.0 : 0.8,
    })
  );

  const sectionPaths = SECTIONS.map((s) => ({
    url: `${base}/forum/${s.slug}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.7,
  }));

  const topicPaths = Object.entries(MOCK_TOPICS).map(([id, t]) => ({
    url: `${base}/forum/${t.sectionSlug}/topic/${id}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [...staticPaths, ...sectionPaths, ...topicPaths];
}
