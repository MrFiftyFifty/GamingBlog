import { assetPath } from "@/lib/asset-path";
import Image from "next/image";
import Link from "next/link";

interface FeaturedCardProps {
  href: string;
  title: string;
  excerpt: string;
  imageSrc: string;
  imageAlt: string;
  category?: string;
}

export function FeaturedCard({
  href,
  title,
  excerpt,
  imageSrc,
  imageAlt,
  category,
}: FeaturedCardProps) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-xl border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="aspect-[21/9] w-full sm:aspect-[2/1]">
        <Image
          src={assetPath(imageSrc)}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6 md:p-8">
          {category && (
            <span className="text-fluid-caption font-medium uppercase tracking-wider text-white/90">
              {category}
            </span>
          )}
          <h2 className="mt-1 font-display text-fluid-display font-bold leading-tight tracking-[-0.02em] text-white drop-shadow-sm sm:text-2xl md:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-fluid-caption text-white/85 line-clamp-2">
            {excerpt}
          </p>
        </div>
      </div>
    </Link>
  );
}
