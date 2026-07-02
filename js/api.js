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


// Lightweight client-side cache to save YouTube API quota.
const VR_CACHE_PREFIX = 'vr_search_cache_v1:';
const VR_CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

function normalizeCachePart(value) {
  return String(value ?? '').trim().toLowerCase();
}

function makeSearchCacheKey(query, country, includeShorts, options = {}) {
  return (
    VR_CACHE_PREFIX +
    JSON.stringify({
      q: normalizeCachePart(query),
      country: country || 'GLOBAL',
      shorts: !!includeShorts,
      order: options.order || 'date',
      noise: !!options.excludeNoise,
    })
  );
}

function readSearchCache(query, country, includeShorts, options = {}, allowExpired = false) {
  try {
    const raw = localStorage.getItem(makeSearchCacheKey(query, country, includeShorts, options));
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (!cached || !Array.isArray(cached.items)) return null;
    const age = Date.now() - Number(cached.savedAt || 0);
    if (!allowExpired && age > VR_CACHE_TTL_MS) return null;
    return {
      ...cached,
      age,
      expired: age > VR_CACHE_TTL_MS,
    };
  } catch (err) {
    console.warn('캐시 읽기 실패', err);
    return null;
  }
}

function writeSearchCache(query, country, includeShorts, options = {}, items = []) {
  try {
    const payload = {
      savedAt: Date.now(),
      query,
      country,
      includeShorts,
      options,
      items,
    };
    localStorage.setItem(
      makeSearchCacheKey(query, country, includeShorts, options),
      JSON.stringify(payload),
    );
  } catch (err) {
    console.warn('캐시 저장 실패', err);
  }
}

function clearSearchCache() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(VR_CACHE_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}

function cacheAgeLabel(ageMs) {
  const minutes = Math.max(0, Math.round(Number(ageMs || 0) / 60000));
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  return `${Math.round(minutes / 60)}시간 전`;
}

async function searchYouTubeVideosCached(query, country = 'GLOBAL', includeShorts = true, options = {}) {
  const useCache = options.useCache !== false;

  if (useCache) {
    const cached = readSearchCache(query, country, includeShorts, options);
    if (cached) {
      return {
        items: cached.items.map((v) => calc({ ...v })),
        fromCache: true,
        cacheAge: cached.age,
        expired: false,
      };
    }
  }

  try {
    const items = await searchYouTubeVideos(query, country, includeShorts, options);
    writeSearchCache(query, country, includeShorts, options, items);
    return {
      items,
      fromCache: false,
      cacheAge: 0,
      expired: false,
    };
  } catch (err) {
    const fallback = readSearchCache(query, country, includeShorts, options, true);
    if (fallback) {
      return {
        items: fallback.items.map((v) => calc({ ...v })),
        fromCache: true,
        cacheAge: fallback.age,
        expired: fallback.expired,
        error: err,
      };
    }
    throw err;
  }
}
