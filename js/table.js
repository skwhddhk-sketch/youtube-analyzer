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
  return `<div class="row" onclick="openVideo('${v.id}')"><div><b>#${i + 1}</b></div><div class="video"><img class="thumb" src="${v.thumb}"><div><div class="vtitle">${v.title}</div><div class="meta">${v.channel} · ${v.duration <= 60 ? "Shorts" : "Long"} · ${countries[v.country] || v.country}</div></div></div><div><span class="score ${scoreCls(v.score)}">${v.score}</span></div><div class="cell"><strong>${fmt(v.views)}</strong><small>${v.hours}시간 전</small></div><div class="cell"><strong>${fmt(v.vph)}</strong><small>/hour</small></div><div class="cell"><strong>${v.rSub.toFixed(1)}x</strong><small>subs</small></div><div class="cell"><strong>${v.rAvg.toFixed(1)}x</strong><small>avg</small></div><div>${judge(v)}</div><div><button class="star ${isFav(v.id) ? "on" : ""}" onclick="event.stopPropagation();favToggle('${v.id}')">★</button></div></div>`;
}

function findVideo(id) {
  return [...demoVideos.map((x) => calc({ ...x })), ...current].find(
    (v) => v.id === id,
  );
}

function insights(v) {
  let type = titleType(v.title);
  return [
    `제목은 <b>${type}</b>. 클릭 전에 감정 트리거가 명확한 편이다.`,
    `채널 평균 대비 <b>${v.rAvg.toFixed(1)}배</b>라서 기존 구독자빨보다 소재 자체 반응 가능성이 높다.`,
    `VPH <b>${fmt(v.vph)}</b> 기준 초기 확산 속도가 ${v.vph > 10000 ? "매우 강함" : "보통 이상"}이다.`,
    `${v.duration <= 60 ? "쇼츠형이라 복제 난이도가 낮고 빠른 테스트에 적합하다." : "롱폼이라 소재 검증 후 쇼츠로 재가공 가능하다."}`,
  ];
}
