// AI Trend Report - analyzes the current search result list in the browser.
const TREND_STOP_WORDS = new Set([
  '강아지','고양이','반려견','반려동물','shorts','short','쇼츠','영상','하는','있는','없는','때문에','그리고','the','this','that','with','from','when','what','why','how','for','you','and','일','것','이유','모습','오늘','진짜'
]);

function safeText(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function percent(value) {
  return `${Math.round(value || 0)}%`;
}

function average(numbers) {
  const clean = numbers.map(Number).filter((n) => Number.isFinite(n));
  if (!clean.length) return 0;
  return clean.reduce((a, b) => a + b, 0) / clean.length;
}

function median(numbers) {
  const clean = numbers.map(Number).filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!clean.length) return 0;
  return clean[Math.floor(clean.length / 2)];
}

function tokenizeTitle(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/#[\w가-힣]+/g, ' ')
    .replace(/[^0-9a-z가-힣]+/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !TREND_STOP_WORDS.has(w));
}

function topWords(videos, limit = 8) {
  const counts = {};
  videos.forEach((v) => tokenizeTitle(v.title).forEach((w) => (counts[w] = (counts[w] || 0) + 1)));
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function detectEmotion(title = '') {
  const t = String(title).toLowerCase();
  if (/ㅋㅋ|웃|웃긴|개웃|funny|lol|귀엽|cute/.test(t)) return 'funny';
  if (/감동|눈물|울|사랑|기특|heart|touch/.test(t)) return 'touch';
  if (/충격|소름|깜짝|갑자기|반전|놀라|unexpected|crazy|wow/.test(t)) return 'surprise';
  if (/방법|이유|팁|주의|알려|how|why|guide|tip/.test(t)) return 'info';
  return 'curiosity';
}

function emotionSummary(videos) {
  const labels = {
    funny: '😂 웃김',
    touch: '🥹 감동',
    surprise: '😲 놀람/반전',
    info: '📚 정보',
    curiosity: '👀 호기심',
  };
  const counts = { funny: 0, touch: 0, surprise: 0, info: 0, curiosity: 0 };
  videos.forEach((v) => counts[detectEmotion(v.title)]++);
  return Object.entries(counts)
    .map(([key, count]) => ({ key, label: labels[key], count, pct: videos.length ? (count / videos.length) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);
}

function detectPattern(title = '') {
  const t = String(title).toLowerCase();
  if (/이유|왜|why/.test(t)) return 'OO하는 이유';
  if (/순간|장면|moment/.test(t)) return 'OO하는 순간';
  if (/갑자기|suddenly|unexpected|nobody expected/.test(t)) return '갑자기 OO';
  if (/top|\d+|가지|best/.test(t)) return 'TOP/리스트형';
  if (/하면|생기는 일|happens/.test(t)) return 'OO하면 생기는 일';
  return '호기심/일상형';
}

function patternSummary(videos) {
  const counts = {};
  videos.forEach((v) => {
    const p = detectPattern(v.title);
    counts[p] = (counts[p] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function viewBucketSummary(videos) {
  const buckets = [
    ['100만+', (v) => v.views >= 1000000],
    ['50만+', (v) => v.views >= 500000 && v.views < 1000000],
    ['10만+', (v) => v.views >= 100000 && v.views < 500000],
    ['1만+', (v) => v.views >= 10000 && v.views < 100000],
    ['1만 미만', (v) => v.views < 10000],
  ];
  return buckets.map(([name, fn]) => [name, videos.filter(fn).length]);
}

function trendStars(score) {
  const count = Math.max(1, Math.min(5, Math.round(score)));
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

function analyzeTrendReport(query, videos) {
  const vs = (videos || []).map((v) => calc({ ...v })).slice(0, 20);
  const total = vs.length;
  const shorts = vs.filter((v) => v.duration > 0 && v.duration <= 60).length;
  const avgViews = average(vs.map((v) => v.views));
  const medViews = median(vs.map((v) => v.views));
  const avgHours = average(vs.map((v) => v.hours));
  const avgDuration = average(vs.map((v) => v.duration));
  const avgScore = average(vs.map((v) => v.score));
  const avgVph = average(vs.map((v) => v.vph));
  const words = topWords(vs, 8);
  const emotions = emotionSummary(vs);
  const patterns = patternSummary(vs);
  const buckets = viewBucketSummary(vs);
  const strongest = vs.slice().sort((a, b) => b.score - a.score)[0];
  const topWord = words[0]?.[0] || query || '핵심 소재';
  const topPattern = patterns[0]?.[0] || '호기심형';
  const mainEmotion = emotions[0]?.label || '👀 호기심';

  const recommendationScore = Math.min(5, Math.max(1, avgScore / 18 + (shorts / Math.max(1, total))));
  const competitionScore = Math.min(5, Math.max(1, Math.log10(avgViews + 10) - 2));
  const copyScore = Math.min(5, Math.max(1, (shorts / Math.max(1, total)) * 3 + (avgDuration <= 90 ? 1.5 : 0.5)));

  return {
    query,
    total,
    shorts,
    shortsPct: total ? (shorts / total) * 100 : 0,
    avgViews,
    medViews,
    avgHours,
    avgDuration,
    avgScore,
    avgVph,
    words,
    emotions,
    patterns,
    buckets,
    strongest,
    topWord,
    topPattern,
    mainEmotion,
    recommendationScore,
    competitionScore,
    copyScore,
  };
}

function renderBars(items, maxValue) {
  return items
    .map(([label, value]) => {
      const width = maxValue ? Math.max(6, Math.round((value / maxValue) * 100)) : 6;
      return `<div class="trend-bar-row"><span>${safeText(label)}</span><div class="trend-bar"><i style="width:${width}%"></i></div><b>${value}</b></div>`;
    })
    .join('');
}

function renderTrendReport(query, videos) {
  const r = analyzeTrendReport(query, videos);
  if (!r.total) return '';
  const maxWord = Math.max(1, ...r.words.map(([, n]) => n));
  const maxBucket = Math.max(1, ...r.buckets.map(([, n]) => n));
  const emotionHtml = r.emotions
    .filter((x) => x.count > 0)
    .slice(0, 4)
    .map((x) => `<div class="trend-pill"><b>${x.label}</b><span>${percent(x.pct)}</span></div>`)
    .join('');
  const patternHtml = r.patterns
    .slice(0, 4)
    .map(([name, count]) => `<li><b>${safeText(name)}</b><span>${count}개</span></li>`)
    .join('');

  return `<div class="trend-report panel">
    <div class="trend-head">
      <div>
        <h2>🔥 AI Trend Report</h2>
        <p><b>${safeText(query || '전체')}</b> 검색 결과 상위 ${r.total}개를 분석한 요약.</p>
      </div>
      <div class="trend-rating"><span>추천도</span><strong>${trendStars(r.recommendationScore)}</strong></div>
    </div>
    <div class="trend-kpis">
      <div><span>평균 조회수</span><strong>${fmt(r.avgViews)}</strong><small>중앙값 ${fmt(r.medViews)}</small></div>
      <div><span>평균 VPH</span><strong>${fmt(r.avgVph)}</strong><small>초기 확산속도</small></div>
      <div><span>Shorts 비율</span><strong>${percent(r.shortsPct)}</strong><small>${r.shorts}/${r.total}개</small></div>
      <div><span>평균 길이</span><strong>${formatDuration(Math.round(r.avgDuration))}</strong><small>평균 ${Math.round(r.avgHours)}시간 전</small></div>
    </div>
    <div class="trend-grid">
      <div class="trend-box"><h3>많이 쓰인 단어</h3>${renderBars(r.words, maxWord)}</div>
      <div class="trend-box"><h3>감정 흐름</h3><div class="trend-pills">${emotionHtml}</div><h3 class="mt">제목 패턴</h3><ul class="trend-list">${patternHtml}</ul></div>
      <div class="trend-box"><h3>조회수 분포</h3>${renderBars(r.buckets, maxBucket)}<h3 class="mt">AI 결론</h3><p class="trend-advice"><b>${safeText(r.topWord)}</b> + <b>${safeText(r.topPattern)}</b> + <b>${safeText(r.mainEmotion.replace(/^\S+\s*/, ''))}</b> 조합이 현재 가장 강하다. 첫 1초는 결과 장면부터 보여주고 설명은 뒤로 미루는 구성이 좋다.</p></div>
    </div>
    ${r.strongest ? `<div class="trend-winner"><span>현재 최고 후보</span><b>${safeText(r.strongest.title)}</b><em>AI ${r.strongest.score}점 · VPH ${fmt(r.strongest.vph)}</em></div>` : ''}
  </div>`;
}
