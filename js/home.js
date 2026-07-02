// Home dashboard
function renderHome() {
  let vs = seed("", "GLOBAL", true)
    .filter((v) =>
      getInterests().some((k) =>
        (v.title + v.cat).includes(k.replace(" 영상", "")),
      ),
    )
    .slice(0, 8);
  if (vs.length < 4) vs = seed("", "GLOBAL", true).slice(0, 8);
  qs("#home").innerHTML =
    `<div class="summary"><div class="stat"><span>오늘 추천</span><strong>${vs.length}</strong></div><div class="stat"><span>강력 후보</span><strong>${vs.filter((v) => v.score >= 85).length}</strong></div><div class="stat"><span>평균 VPH</span><strong>${fmt(vs.reduce((a, b) => a + b.vph, 0) / vs.length)}</strong></div><div class="stat"><span>저장 영상</span><strong>${favs().length}</strong></div><div class="stat"><span>데모 상태</span><strong>${demo ? "ON" : "OFF"}</strong></div></div><div class="grid2"><div><div class="titlebar"><div><h2>내 관심사 추천</h2><p>작은 채널인데 크게 튄 영상 우선</p></div></div>${table(vs)}</div><div><div class="panel"><h2 style="margin-top:0">오늘 볼 주제</h2><div class="cards" style="grid-template-columns:1fr">${["동물 순간 포착", "아기 리액션", "AI 쇼츠 편집법", "헬스 초보 루틴"].map((x) => `<div class="mini" onclick="go('search');setTimeout(()=>{qs('#searchQ').value='${x.split(" ")[0]}';runSearch()},50)"><b>${x}</b><p>조회수보다 구독자 대비 반응 확인</p></div>`).join("")}</div></div><div class="panel"><h2 style="margin-top:0">다음 액션</h2><p class="subtle">저장 → 기획 보드 추가 → 제목 변형안 작성 순서로 쓰면 됨.</p></div></div></div>`;
}
