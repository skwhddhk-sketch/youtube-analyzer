// Shared video table rendering and demo filtering
function seed(q = "", country = "GLOBAL", shorts = true) {
  let arr = demoVideos.map((x) => calc({ ...x }));
  if (country !== "GLOBAL") arr = arr.filter((v) => v.country === country);
  if (q)
    arr = arr.filter((v) =>
      (v.title + v.channel + v.cat).toLowerCase().includes(q.toLowerCase()),
    );
  if (!shorts) arr = arr.filter((v) => v.duration > 60);
  return arr.sort((a, b) => b.score - a.score);
}

function table(vs) {
  current = vs;
  if (!vs.length) return '<div class="empty">결과 없음</div>';
  return `<div class="table"><div class="thead"><div>순위</div><div>영상</div><div>점수</div><div>조회수</div><div>VPH</div><div>구독자比</div><div>평균比</div><div>판정</div><div>저장</div></div>${vs.map((v, i) => row(v, i)).join("")}</div>`;
}

function row(v, i) {
  return `<div class="row" onclick="openVideo('${v.id}')"><div><b>#${i + 1}</b></div><div class="video"><img class="thumb" src="${v.thumb}"><div><div class="vtitle">${v.title}</div><div class="meta">${v.channel} · ${v.duration <= 60 ? "Shorts" : "Long"} · ${formatDuration(v.duration)} · ${countries[v.country] || v.country}</div></div></div><div><span class="score ${scoreCls(v.score)}">${v.score}</span></div><div class="cell"><strong>${fmt(v.views)}</strong><small>${v.hours}시간 전</small></div><div class="cell"><strong>${fmt(v.vph)}</strong><small>/hour</small></div><div class="cell"><strong>${v.rSub.toFixed(1)}x</strong><small>subs</small></div><div class="cell"><strong>${v.rAvg.toFixed(1)}x</strong><small>avg</small></div><div>${judge(v)}</div><div><button class="star ${isFav(v.id) ? "on" : ""}" onclick="event.stopPropagation();favToggle('${v.id}')">★</button></div></div>`;
}

function findVideo(id) {
  return [...demoVideos.map((x) => calc({ ...x })), ...current].find(
    (v) => v.id === id,
  );
}

function insightLevel(v) {
  if (v.score >= 85) return '강력 추천';
  if (v.score >= 70) return '테스트 추천';
  if (v.score >= 50) return '관찰 후보';
  return '보류';
}

function insights(v) {
  let type = titleType(v.title);
  const level = insightLevel(v);
  const reasons = [];
  if (v.vph >= 10000) reasons.push(`초기 확산 속도 VPH가 <b>${fmt(v.vph)}</b>로 높다.`);
  if (v.rSub >= 1) reasons.push(`구독자 대비 조회수 <b>${v.rSub.toFixed(1)}배</b>라 채널 규모보다 크게 반응했다.`);
  if (v.rAvg >= 3) reasons.push(`예상 평균 대비 <b>${v.rAvg.toFixed(1)}배</b>로 아웃라이어 가능성이 있다.`);
  if (v.commentRate >= 0.25) reasons.push(`댓글률이 <b>${v.commentRate.toFixed(2)}%</b>로 반응 유도력이 있다.`);
  if (!reasons.length) reasons.push('아직 수치상 강한 폭발 신호는 약하다. 제목/소재 참고용으로 보는 편이 안전하다.');

  return [
    `종합 판정은 <b>${level}</b>. AI 점수 ${v.score}점, 복제 가능성 ${v.rep}점이다.`,
    `제목은 <b>${type}</b>. ${titleSignal(v.title) > 5 ? '후킹 단어가 포함되어 클릭 유도력이 있다.' : '후킹은 보통이라 제목 변형이 필요하다.'}`,
    ...reasons.slice(0, 3),
    `${v.duration <= 60 ? '쇼츠형이라 빠른 복제 테스트에 적합하다.' : '롱폼이므로 핵심 장면만 쇼츠로 재가공하는 방식이 적합하다.'}`,
  ];
}
