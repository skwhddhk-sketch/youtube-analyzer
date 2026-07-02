// Right-side video detail drawer
function openVideo(id) {
  let v = findVideo(id);
  if (!v) return;
  qs('#drawer').classList.remove('hidden');
  const youtubeButton = v.url
    ? `<a class="btn light" href="${v.url}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;text-decoration:none">YouTube에서 보기</a>`
    : '';
  qs('#drawerBody').innerHTML =
    `<h2>${v.title}</h2><div class="meta">${v.channel} · ${countries[v.country] || v.country} · ${v.cat} · ${formatDuration(v.duration)}</div><img class="dthumb" src="${v.thumb}"><div class="summary" style="grid-template-columns:repeat(2,1fr)"><div class="stat"><span>AI 점수</span><strong>${v.score}</strong></div><div class="stat"><span>복제 가능성</span><strong>${v.rep}</strong></div><div class="stat"><span>평균 대비</span><strong>${v.rAvg.toFixed(1)}x</strong></div><div class="stat"><span>VPH</span><strong>${fmt(v.vph)}</strong></div></div><div class="insight"><h3>AI 분석</h3><ul>${insights(v)
      .map((x) => `<li>${x}</li>`)
      .join('')}</ul></div><div class="insight"><h3>따라 만들 때 바꿀 포인트</h3><ul><li>제목 구조는 유지하고 대상만 바꾸기: “${remixTitle(v.title)}”</li><li>썸네일은 주인공 1명/1마리 + 큰 감정 + 3~5단어 텍스트가 적합.</li><li>첫 1초는 결과 장면부터 보여주고, 설명은 뒤로 미루기.</li></ul></div><textarea class="memo" placeholder="이 영상에서 배운 점 메모" oninput="saveMemo('${v.id}',this.value)">${getMemo(v.id)}</textarea><br><br><button class="btn red" onclick="favToggle('${v.id}');openVideo('${v.id}')">${isFav(v.id) ? '즐겨찾기 해제' : '즐겨찾기 저장'}</button> <button class="btn light" onclick="addPlan('${v.id}')">기획 보드에 추가</button> ${youtubeButton}`;
}

function closeDrawer() {
  qs('#drawer').classList.add('hidden');
}
