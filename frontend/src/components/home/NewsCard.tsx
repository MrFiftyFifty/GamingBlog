import { assetPath } from "@/lib/asset-path";
import Image from "next/image";
import Link from "next/link";

interface NewsCardProps {
  href: string;
  title: string;
  excerpt: string;
  imageSrc: string;
  imageAlt: string;
  date: string;
}

export function NewsCard({
  href,
  title,
  excerpt,
  imageSrc,
  imageAlt,
  date,
}: NewsCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-lg hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
        <Image
          src={assetPath(imageSrc)}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, min(33vw, 400px)"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-fluid-caption text-muted-foreground">{date}</p>
        <h3 className="mt-1 font-display text-fluid-title font-semibold leading-snug text-foreground group-hover:text-accent-signature transition-colors duration-200">
          {title}
        </h3>
        <p className="mt-2 text-fluid-caption text-muted-foreground line-clamp-2 leading-snug">
          {excerpt}
        </p>
      </div>
    </Link>
  );
}
