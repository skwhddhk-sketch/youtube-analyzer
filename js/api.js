// YouTube Data API helpers - API key is read only from localStorage/input, never hard-coded.
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

function regionCode(country) {
  if (!country || country === "GLOBAL") return "";
  return country;
}

function parseDurationSeconds(isoDuration) {
  const match = String(isoDuration || "").match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

function hoursSince(publishedAt) {
  const published = new Date(publishedAt).getTime();
  if (!published) return 1;
  return Math.max(1, Math.round((Date.now() - published) / 36e5));
}

async function youtubeFetch(path, params = {}) {
  const key = (API || localStorage.getItem("vr_api_key") || "").trim();
  if (!key) throw new Error("API_KEY_REQUIRED");

  const url = new URL(`${YOUTUBE_API_BASE}/${path}`);
  Object.entries({ ...params, key }).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString());
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error?.message || `YouTube API 오류 (${res.status})`;
    throw new Error(message);
  }
  return data;
}

async function searchYouTubeVideos(query, country = "GLOBAL", includeShorts = true) {
  const q = String(query || "").trim();
  if (!q) return [];

  const searchData = await youtubeFetch("search", {
    part: "snippet",
    type: "video",
    maxResults: 20,
    q,
    order: "date",
    regionCode: regionCode(country),
    safeSearch: "none",
  });

  const videoIds = (searchData.items || [])
    .map((item) => item?.id?.videoId)
    .filter(Boolean);

  if (!videoIds.length) return [];

  const videosData = await youtubeFetch("videos", {
    part: "snippet,statistics,contentDetails",
    id: videoIds.join(","),
  });

  const channelIds = [
    ...new Set(
      (videosData.items || [])
        .map((item) => item?.snippet?.channelId)
        .filter(Boolean),
    ),
  ];

  let channelMap = {};
  if (channelIds.length) {
    const channelData = await youtubeFetch("channels", {
      part: "statistics",
      id: channelIds.join(","),
    });
    channelMap = Object.fromEntries(
      (channelData.items || []).map((ch) => [
        ch.id,
        Number(ch?.statistics?.subscriberCount || 0),
      ]),
    );
  }

  return (videosData.items || [])
    .map((item) => {
      const stats = item.statistics || {};
      const snippet = item.snippet || {};
      const durationSeconds = parseDurationSeconds(item?.contentDetails?.duration);
      const views = Number(stats.viewCount || 0);
      const subs = Number(channelMap[snippet.channelId] || 0);
      const hours = hoursSince(snippet.publishedAt);

      // Channel average is not available from one API call. This is a conservative proxy
      // so the existing outlier score can still rank real search results.
      const avgProxy = Math.max(1000, Math.round(views / 8));

      return calc({
        id: item.id,
        title: snippet.title || "제목 없음",
        channel: snippet.channelTitle || "채널 없음",
        subs,
        views,
        avg: avgProxy,
        hours,
        likes: Number(stats.likeCount || 0),
        comments: Number(stats.commentCount || 0),
        duration: Math.max(1, Math.round(durationSeconds / 60)),
        country: country === "GLOBAL" ? "GLOBAL" : country,
        cat: "실제검색",
        thumb:
          snippet?.thumbnails?.high?.url ||
          snippet?.thumbnails?.medium?.url ||
          snippet?.thumbnails?.default?.url ||
          "",
        url: `https://www.youtube.com/watch?v=${item.id}`,
      });
    })
    .filter((v) => includeShorts || v.duration > 1)
    .sort((a, b) => b.score - a.score);
}
