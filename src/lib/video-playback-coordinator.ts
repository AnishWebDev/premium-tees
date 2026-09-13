/** Ensures only one storefront video player is active at a time. */

type PlayerEntry = {
  pause: () => void;
};

const players = new Map<string, PlayerEntry>();

export function registerVideoPlayer(
  id: string,
  pause: () => void
): () => void {
  players.set(id, { pause });
  return () => {
    players.delete(id);
  };
}

export function activateVideoPlayer(activeId: string): void {
  for (const [id, entry] of players) {
    if (id === activeId) continue;
    try {
      entry.pause();
    } catch {
      /* ignore pause failures */
    }
  }
}

export function pauseYouTubeEmbed(iframe: HTMLIFrameElement): void {
  iframe.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func: "pauseVideo", args: "" }),
    "*"
  );
}

export function pauseVimeoEmbed(iframe: HTMLIFrameElement): void {
  iframe.contentWindow?.postMessage(JSON.stringify({ method: "pause" }), "*");
}

export function pauseEmbedIframe(
  iframe: HTMLIFrameElement,
  embedSrc: string
): void {
  try {
    const host = new URL(embedSrc).hostname.replace(/^www\./, "").toLowerCase();
    if (host.includes("youtube")) {
      pauseYouTubeEmbed(iframe);
      return;
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      pauseVimeoEmbed(iframe);
    }
  } catch {
    /* ignore */
  }
}

/** YouTube posts player state when enablejsapi=1 (1 = playing). */
export function isYoutubePlayingMessage(
  event: MessageEvent,
  iframe: HTMLIFrameElement
): boolean {
  if (event.source !== iframe.contentWindow) return false;
  try {
    const data =
      typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    return data?.event === "onStateChange" && data?.info === 1;
  } catch {
    return false;
  }
}
