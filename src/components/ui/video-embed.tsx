"use client";

interface VideoEmbedProps {
  url: string;
}

function getEmbedUrl(url: string): string | null {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

  const twitchChannelMatch = url.match(
    /twitch\.tv\/([a-zA-Z0-9_]+)$/
  );
  if (twitchChannelMatch)
    return `https://player.twitch.tv/?channel=${twitchChannelMatch[1]}&parent=${typeof window !== "undefined" ? window.location.hostname : "localhost"}`;

  const twitchVideoMatch = url.match(/twitch\.tv\/videos\/(\d+)/);
  if (twitchVideoMatch)
    return `https://player.twitch.tv/?video=v${twitchVideoMatch[1]}&parent=${typeof window !== "undefined" ? window.location.hostname : "localhost"}`;

  return null;
}

export function VideoEmbed({ url }: VideoEmbedProps) {
  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <div className="relative my-4 aspect-video w-full overflow-hidden rounded-lg border border-border">
      <iframe
        src={embedUrl}
        className="absolute inset-0 h-full w-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title="Embedded video"
      />
    </div>
  );
}
