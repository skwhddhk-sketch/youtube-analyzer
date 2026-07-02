// Common DOM and formatting helpers
const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];

function calc(v) {
  v.rSub = v.subs ? v.views / v.subs : 0;
  v.rAvg = v.avg ? v.views / v.avg : 0;
  v.vph = v.hours ? v.views / v.hours : 0;
  v.likeRate = v.views ? (v.likes / v.views) * 100 : 0;
  v.commentRate = v.views ? (v.comments / v.views) * 100 : 0;
  v.score = Math.min(
    99,
    Math.round(
      Math.min(v.rSub, 100) * 0.28 +
        Math.min(v.rAvg, 60) * 0.55 +
        Math.min(v.vph / 1000, 30) * 0.7 +
        (v.duration <= 60 ? 8 : 3) +
        v.commentRate * 22,
    ),
  );
  v.rep = Math.max(
    30,
    Math.min(
      98,
      Math.round(
        70 +
          (v.duration <= 60 ? 10 : -5) +
          (v.subs < 30000 ? 8 : 0) +
          (v.rAvg > 8 ? 8 : 0) -
          (v.cat === "AI" ? 2 : 0),
      ),
    ),
  );
  return v;
}

function fmt(n) {
  if (!n && n !== 0) return "-";
  if (n >= 100000000) return (n / 100000000).toFixed(1) + "억";
  if (n >= 10000) return (n / 10000).toFixed(1) + "만";
  if (n >= 1000) return (n / 1000).toFixed(1) + "천";
  return String(Math.round(n));
}

function scoreCls(s) {
  return s >= 80 ? "" : s >= 60 ? "mid" : "low";
}

function judge(v) {
  if (v.score >= 85) return '<span class="badge hot">🔥 강력</span>';
  if (v.rAvg >= 8) return '<span class="badge good">채널 대비</span>';
  if (v.vph >= 10000) return '<span class="badge warn">VPH</span>';
  return '<span class="badge">보통</span>';
}

function titleType(t) {
  if (/하지마|절대|망|위험|손해/.test(t)) return "금지/경고형";
  if (/TOP|top|\d+/.test(t)) return "리스트형";
  if (/봤|tried|해봤|7일|한달/.test(t)) return "실험/후기형";
  if (/갑자기|순간|모두|nobody|expected/.test(t)) return "반전/순간형";
  return "호기심형";
}

function remixTitle(t) {
  if (t.includes("강아지")) return t.replace("강아지", "고양이");
  if (t.includes("아기")) return t.replace("아기", "강아지");
  if (t.includes("AI")) return t.replace("AI", "쇼츠");
  return t + " 2탄";
}
