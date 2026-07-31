import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { InstagramData } from "@/lib/site-content";
import { SectionHeading } from "@/components/shared/section-heading";

type InstagramGalleryProps = {
  content: InstagramData;
};

export function InstagramGallery({ content }: InstagramGalleryProps) {
  const images = content.images.filter(Boolean);

  return (
    <section className="section-padding">
      <div className="container-tight">
        <SectionHeading
          title={content.title}
          subtitle={content.subtitle}
          align="center"
          className="justify-center"
        />

        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
          {images.map((url, index) => (
            <a
              key={`${url}-${index}`}
              href={content.profileUrl || "https://instagram.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl bg-[var(--muted)]"
              aria-label={`Instagram photo ${index + 1}`}
            >
              <Image
                src={url}
                alt={`${content.title} ${index + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-[var(--foreground)]/0 transition-colors group-hover:bg-[var(--foreground)]/30">
                <ExternalLink className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
