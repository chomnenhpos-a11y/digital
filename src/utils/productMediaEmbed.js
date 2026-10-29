const VIDEO_HOSTS = {
  youtube: ["youtube.com", "youtu.be"],
  tiktok: ["tiktok.com"],
  instagram: ["instagram.com"],
};

const YOUTUBE_ID = /^[\w-]{11}$/;

function isHostAllowed(host, allowedHosts) {
  return allowedHosts.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
}

function iframe(url) {
  return { type: "iframe", url };
}

const RESOLVERS = {
  youtube(parsed, host) {
    let videoId = null;

    if (host === "youtu.be") {
      videoId = parsed.pathname.split("/").filter(Boolean)[0];
    } else if (parsed.pathname === "/watch") {
      videoId = parsed.searchParams.get("v");
    } else {
      // /shorts/ID, /embed/ID, /live/ID, /v/ID
      const match = parsed.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/);
      videoId = match?.[1] ?? null;
    }

    if (!videoId || !YOUTUBE_ID.test(videoId)) return null;
    const rawStart =
      parsed.searchParams.get("t") ?? parsed.searchParams.get("start");
    const start = rawStart ? parseInt(rawStart, 10) : NaN;
    const query = Number.isFinite(start) && start > 0 ? `?start=${start}` : "";

    // youtube-nocookie avoids setting tracking cookies until the user plays
    return iframe(`https://www.youtube-nocookie.com/embed/${videoId}${query}`);
  },


  tiktok(parsed) {
    const match = parsed.pathname.match(/\/video\/(\d+)/);
    return match ? iframe(`https://www.tiktok.com/embed/v2/${match[1]}`) : null;
  },

  instagram(parsed) {
    // Supports /reel/ID, /reels/ID, /p/ID, /tv/ID and /username/reel/ID etc.
    const match = parsed.pathname.match(
      /^\/(?:[^/]+\/)?(reel|reels|p|tv)\/([\w-]+)/
    );
    if (!match) return null;

    const kind = match[1] === "reels" ? "reel" : match[1];
    return iframe(`https://www.instagram.com/${kind}/${match[2]}/embed`);
  },
};

function detectPlatform(host) {
  return (
    Object.keys(VIDEO_HOSTS).find((name) =>
      isHostAllowed(host, VIDEO_HOSTS[name])
    ) ?? null
  );
}

export function getProductMediaEmbed(url, platform) {
  try {
    if (typeof url !== "string") return null;

    const parsed = new URL(url.trim());

    if (!["http:", "https:"].includes(parsed.protocol)) return null;

    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const resolvedPlatform = platform ?? detectPlatform(host);

    const resolver = RESOLVERS[resolvedPlatform];
    if (!resolver || !isHostAllowed(host, VIDEO_HOSTS[resolvedPlatform])) {
      return null;
    }

    return resolver(parsed, host, parsed.href);
  } catch {
    return null;
  }
}