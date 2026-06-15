import { SECTIONS } from "@/lib/constants";
import { MOCK_TOPICS } from "@/lib/mock-data";

export function getSectionSlugParams() {
  return SECTIONS.map((section) => ({ slug: section.slug }));
}

export function getTopicRouteParams() {
  return Object.entries(MOCK_TOPICS).map(([id, topic]) => ({
    slug: topic.sectionSlug,
    id,
  }));
}

export function getUsernameParams() {
  return [{ username: "demo" }];
}
