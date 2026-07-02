// Common DOM and formatting helpers
const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function titleSignal(title = '') {
  const t = String(title).toLowerCase();
  let score = 0;
  if (/갑자기|순간|충격|반전|소름|미쳤|레전드|역대급|이유|왜|how|why|nobody|unexpected|crazy/.test(t)) score += 10;
  if (/top|\d+|가지|best|rank|순위/.test(t)) score += 5;
  if (/강아지|고양이|아기|동물|군인|ai|쇼츠|shorts|헬스|다이어트/.test(t)) score += 4;
  if (/뉴스|속보|기자|브리핑|정치|사건|사고/.test(t)) score -= 8;
  if (String(title).length > 65) score -= 3;
  return clamp(score, -10, 18);
}

function calc(v) {
  const views = Number(v.views || 0);
  const subs = Number(v.subs || 0);
  const avg = Number(v.avg || 0);
  const hours = Math.max(1, Number(v.hours || 1));
  const likes = Number(v.likes || 0);
  const comments = Number(v.comments || 0);
  const duration = Number(v.duration || 0); // seconds

  v.views = views;
  v.subs = subs;
  v.avg = avg;
  v.hours = hours;
  v.likes = likes;
  v.comments = comments;
  v.duration = duration;

  v.rSub = subs ? views / subs : views >= 10000 ? 1 : 0;
  v.rAvg = avg ? views / avg : 0;
  v.vph = views / hours;
  v.likeRate = views ? (likes / views) * 100 : 0;
  v.commentRate = views ? (comments / views) * 100 : 0;

  const vphScore = clamp(Math.log10(v.vph + 1) * 13, 0, 52);
  const subScore = clamp(Math.log10(v.rSub + 1) * 16, 0, 34);
  const avgScore = clamp(Math.log10(v.rAvg + 1) * 18, 0, 35);
  const engagementScore = clamp(v.likeRate * 1.4 + v.commentRate * 9, 0, 22);
  const formatScore = duration > 0 && duration <= 60 ? 8 : duration <= 180 ? 4 : 0;
  const freshnessScore = hours <= 6 ? 7 : hours <= 24 ? 4 : hours <= 72 ? 1 : 0;
  const hookScore = titleSignal(v.title);

  v.score = clamp(
    Math.round(vphScore + subScore + avgScore + engagementScore + formatScore + freshnessScore + hookScore),
    1,
    99,
  );

  v.rep = clamp(
    Math.round(
      55 +
        (duration > 0 && duration <= 60 ? 14 : -4) +
        (subs && subs < 30000 ? 8 : 0) +
        (v.rAvg > 4 ? 7 : 0) +
        (titleSignal(v.title) > 5 ? 6 : 0) -
        (/뉴스|정치|사건|사고/.test(v.title || '') ? 12 : 0),
    ),
    20,
    98,
  );

  return v;
}

function fmt(n) {
  if (!n && n !== 0) return '-';
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '억';
  if (n >= 10000) return (n / 10000).toFixed(1) + '만';
  if (n >= 1000) return (n / 1000).toFixed(1) + '천';
  return String(Math.round(n));
}

function formatDuration(seconds) {
  seconds = Number(seconds || 0);
  if (!seconds) return '-';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function scoreCls(s) {
  return s >= 80 ? '' : s >= 60 ? 'mid' : 'low';
}

function judge(v) {
  if (/뉴스|정치|사건|사고/.test(v.title || '') || /news|뉴스|knn|ytn|sbs|mbc|kbs|jtbc/i.test(v.channel || '')) {
    return '<span class="badge">뉴스성</span>';
  }
  if (v.score >= 85) return '<span class="badge hot">🔥 강력</span>';
  if (v.rAvg >= 5) return '<span class="badge good">채널 대비</span>';
  if (v.vph >= 10000) return '<span class="badge warn">VPH</span>';
  return '<span class="badge">보통</span>';
}

function titleType(t) {
  if (/하지마|절대|망|위험|손해/.test(t)) return '금지/경고형';
  if (/TOP|top|\d+/.test(t)) return '리스트형';
  if (/봤|tried|해봤|7일|한달/.test(t)) return '실험/후기형';
  if (/갑자기|순간|모두|nobody|expected/.test(t)) return '반전/순간형';
  return '호기심형';
}

function remixTitle(t) {
  if (t.includes('강아지')) return t.replace('강아지', '고양이');
  if (t.includes('아기')) return t.replace('아기', '강아지');
  if (t.includes('AI')) return t.replace('AI', '쇼츠');
  return t + ' 2탄';
}
