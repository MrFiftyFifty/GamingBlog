import { SectionPageView } from "@/components/forum/SectionPageView";
import { getSectionSlugParams } from "@/lib/static-params";

export function generateStaticParams() {
  return getSectionSlugParams();
}

export default function SectionPage({
  params,
}: {
  params: { slug: string };
}) {
  return <SectionPageView slug={params.slug} />;
}
