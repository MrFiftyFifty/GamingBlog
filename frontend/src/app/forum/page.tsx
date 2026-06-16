import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { assetPath } from "@/lib/asset-path";
import { SECTIONS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Форумы — Игровой форум",
  description: "Разделы форума по играм, жанрам и платформам.",
};

export default function ForumListPage() {
  return (
    <div className="container px-4 py-8 md:px-6">
      <h1 className="mb-6 font-display text-fluid-display font-bold tracking-tight text-foreground">Форумы</h1>
      <p className="mb-8 text-fluid-body text-muted-foreground">
        Выберите раздел по играм, жанрам или платформам.
      </p>
      <ul className="space-y-4">
        {SECTIONS.map((section) => (
          <li key={section.slug}>
            <Link
              href={`/forum/${section.slug}`}
              className="group flex overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-[transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent/30 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="relative hidden w-40 shrink-0 overflow-hidden bg-muted sm:block sm:w-48 md:w-56">
                <Image
                  src={assetPath(section.imageSrc)}
                  alt={section.imageAlt}
                  fill
                  className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                  sizes="(max-width: 640px) 0px, 224px"
                />
              </div>
              <div className="flex flex-1 flex-col justify-center p-4 md:p-6">
                <h2 className="font-display text-fluid-title font-semibold text-foreground">{section.name}</h2>
                <p className="mt-1 text-fluid-caption text-muted-foreground">{section.description}</p>
                <p className="mt-2 text-fluid-caption text-muted-foreground">{section.topicCount} тем</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
