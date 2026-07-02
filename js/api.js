// YouTube Data API helpers - API key is read only from localStorage/input, never hard-coded.
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

function regionCode(country) {
  if (!country || country === 'GLOBAL') return '';
  return country;
}

function parseDurationSeconds(isoDuration) {
  const match = String(isoDuration || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
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

function bestThumbnail(thumbnails = {}) {
  return (
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    ''
  );
}

function estimateChannelAverage(views, subs, durationSeconds) {
  // YouTube API does not expose channel average views in one cheap call.
  // This proxy is deliberately conservative: subscriber base + current result scale.
  const isShort = durationSeconds > 0 && durationSeconds <= 60;
  const subBaseline = subs ? subs * (isShort ? 0.18 : 0.08) : 1000;
  const viewBaseline = views ? views * 0.22 : 1000;
  return Math.max(500, Math.round(Math.max(subBaseline, viewBaseline)));
}

function isLikelyNoiseVideo(video, query = '') {
  const q = String(query || '').toLowerCase();
  const text = `${video.title || ''} ${video.channel || ''}`.toLowerCase();
  const newsLike = /뉴스|속보|기자|브리핑|정치|사건|사고|신문|news|knn|ytn|sbs|mbc|kbs|jtbc|연합뉴스/.test(text);
  const userWantsNews = /뉴스|news|속보|사건|정치/.test(q);
  if (newsLike && !userWantsNews) return true;

  const spamLike = /#.{40,}|먹튀|바카라|카지노|성인|19금|대출|토토/.test(text);
  if (spamLike) return true;

  return false;
}

async function youtubeFetch(path, params = {}) {
  const key = (API || localStorage.getItem('vr_api_key') || '').trim();
  if (!key) throw new Error('API_KEY_REQUIRED');

  const url = new URL(`${YOUTUBE_API_BASE}/${path}`);
  Object.entries({ ...params, key }).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString());
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error?.message || `YouTube API 오류 (${res.status})`;
    throw new Error(message);
  }
  return data;
}

async function searchYouTubeVideos(query, country = 'GLOBAL', includeShorts = true, options = {}) {
  const q = String(query || '').trim();
  if (!q) return [];

  const searchData = await youtubeFetch('search', {
    part: 'snippet',
    type: 'video',
    maxResults: 35,
    q,
    order: options.order || 'date',
    regionCode: regionCode(country),
    safeSearch: 'none',
    videoEmbeddable: 'any',
  });

  const videoIds = (searchData.items || [])
    .map((item) => item?.id?.videoId)
    .filter(Boolean);

  if (!videoIds.length) return [];

  const videosData = await youtubeFetch('videos', {
    part: 'snippet,statistics,contentDetails',
    id: videoIds.join(','),
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
    const channelData = await youtubeFetch('channels', {
      part: 'statistics',
      id: channelIds.join(','),
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
      const avgProxy = estimateChannelAverage(views, subs, durationSeconds);

      return calc({
        id: item.id,
        title: snippet.title || '제목 없음',
        channel: snippet.channelTitle || '채널 없음',
        subs,
        views,
        avg: avgProxy,
        hours,
        likes: Number(stats.likeCount || 0),
        comments: Number(stats.commentCount || 0),
        duration: durationSeconds,
        country: country === 'GLOBAL' ? 'GLOBAL' : country,
        cat: durationSeconds > 0 && durationSeconds <= 60 ? '실제검색 Shorts' : '실제검색',
        thumb: bestThumbnail(snippet.thumbnails),
        url: `https://www.youtube.com/watch?v=${item.id}`,
        publishedAt: snippet.publishedAt,
      });
    })
    .filter((v) => includeShorts || v.duration > 60)
    .filter((v) => !options.excludeNoise || !isLikelyNoiseVideo(v, q))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}
