type EmbedFrameProps = {
  title: string;
  src: string;
  eyebrow?: string;
  caption?: string;
  /** Aspect ratio utility classes */
  aspectClassName?: string;
};

function youtubeEmbed(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

/** Convert common watch / share URLs to embeddable srcs. */
export function toEmbedSrc(url: string): string | null {
  const raw = url?.trim();
  if (!raw) return null;

  // Direct video files — handled by <video>, not iframe
  if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(raw)) return null;

  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      const v = u.searchParams.get("v");
      if (v) return youtubeEmbed(v);

      const shorts = u.pathname.match(/\/shorts\/([^/?#]+)/);
      if (shorts?.[1]) return youtubeEmbed(shorts[1]);

      const live = u.pathname.match(/\/live\/([^/?#]+)/);
      if (live?.[1]) return youtubeEmbed(live[1]);

      const embed = u.pathname.match(/\/embed\/([^/?#]+)/);
      if (embed?.[1]) return youtubeEmbed(embed[1]);
    }

    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (id) return youtubeEmbed(id);
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      if (host === "player.vimeo.com" && u.pathname.includes("/video/")) {
        return raw;
      }
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) {
        return `https://player.vimeo.com/video/${id}`;
      }
    }

    // Already an embed path, or any other https page (maps, Loom, etc.)
    if (u.protocol === "https:" || u.protocol === "http:") {
      return raw;
    }

    return null;
  } catch {
    return null;
  }
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url.trim());
}

/**
 * Accessible iframe / video embed (lookbook film, map, etc.).
 */
export function EmbedFrame({
  title,
  src,
  eyebrow,
  caption,
  aspectClassName = "aspect-video",
}: EmbedFrameProps) {
  const trimmed = src?.trim() ?? "";
  const directVideo = trimmed ? isDirectVideo(trimmed) : false;
  const embedSrc = trimmed && !directVideo ? toEmbedSrc(trimmed) : null;
  const heading = title?.trim() || "Embedded media";

  return (
    <section className="section-padding" aria-labelledby="embed-frame-heading">
      <div className="container-tight">
        {eyebrow?.trim() ? (
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
            {eyebrow.trim()}
          </p>
        ) : null}
        <h2
          id="embed-frame-heading"
          className="font-display mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl"
        >
          {heading}
        </h2>

        <div
          className={`relative mt-8 overflow-hidden bg-[var(--muted)] ${aspectClassName}`}
        >
          {directVideo ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={trimmed}
              controls
              playsInline
              title={heading}
            />
          ) : embedSrc ? (
            <iframe
              src={embedSrc}
              title={heading}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-[var(--muted-foreground)]">
              {trimmed
                ? "Could not embed this URL. Use a YouTube, Vimeo, or direct .mp4 link."
                : "Add an Embed URL in Site content → Home sections to show media here."}
            </div>
          )}
        </div>

        {caption?.trim() ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            {caption.trim()}
          </p>
        ) : null}
      </div>
    </section>
  );
}
