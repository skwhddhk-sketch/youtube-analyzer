// Channel analysis tab
function renderChannel() {
  qs("#channel").innerHTML =
    `<div class="panel"><div class="controls"><input id="chQ" class="wide" placeholder="채널명 입력"><button class="btn red" onclick="runChannel()">채널 분석</button></div></div><div id="chResult"><div class="empty">예: Dog Hero, AI Creator Lab, Local Food</div></div>`;
}

function runChannel() {
  let q = qs("#chQ").value.trim().toLowerCase();
  let vs = demoVideos
    .map((x) => calc({ ...x }))
    .filter((v) => !q || v.channel.toLowerCase().includes(q));
  if (!vs.length) {
    qs("#chResult").innerHTML = '<div class="empty">채널 결과 없음</div>';
    return;
  }
  let avg = vs.reduce((a, b) => a + b.views, 0) / vs.length,
    med = [...vs].sort((a, b) => a.views - b.views)[Math.floor(vs.length / 2)]
      .views,
    shorts = vs.filter((v) => v.duration <= 60).length;
  let best = [...vs].sort((a, b) => b.rAvg - a.rAvg)[0];
  qs("#chResult").innerHTML =
    `<div class="summary"><div class="stat"><span>분석 영상</span><strong>${vs.length}</strong></div><div class="stat"><span>평균 조회수</span><strong>${fmt(avg)}</strong></div><div class="stat"><span>중앙 조회수</span><strong>${fmt(med)}</strong></div><div class="stat"><span>Shorts 비율</span><strong>${Math.round((shorts / vs.length) * 100)}%</strong></div><div class="stat"><span>최고 아웃라이어</span><strong>${best.rAvg.toFixed(1)}x</strong></div></div><div class="panel"><h2 style="margin-top:0">채널 진단</h2><div class="kpi"><div><b>성공 패턴</b><p class="subtle">${titleType(best.title)} 제목이 가장 강함</p></div><div><b>추천 방향</b><p class="subtle">상위 영상의 감정/순간 구조를 반복 테스트</p></div><div><b>주의점</b><p class="subtle">평균 조회수보다 중앙 조회수를 기준선으로 보는 게 안전</p></div></div></div>${table(vs)}`;
}
