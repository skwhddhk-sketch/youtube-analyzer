// Trend tab
function renderTrend() {
  qs("#trend").innerHTML =
    `<div class="panel"><div class="controls"><select id="trendCountry">${Object.entries(
      countries,
    )
      .map(([k, v]) => `<option value="${k}">${v}</option>`)
      .join(
        "",
      )}</select><select id="trendCat"><option value="">전체 주제</option>${[...new Set(demoVideos.map((v) => v.cat))].map((c) => `<option>${c}</option>`).join("")}</select><label class="check"><input id="trendShorts" type="checkbox" checked>Shorts 포함</label><button class="btn red" onclick="runTrend()">트렌드 조회</button></div></div><div id="trendResult"></div>`;
  runTrend();
}

function runTrend() {
  let c = qs("#trendCountry").value,
    cat = qs("#trendCat").value,
    shorts = qs("#trendShorts").checked;
  let vs = seed("", c, shorts)
    .filter((v) => !cat || v.cat === cat)
    .slice(0, 12);
  let topics = {};
  vs.forEach((v) => (topics[v.cat] = (topics[v.cat] || 0) + 1));
  qs("#trendResult").innerHTML = `<div class="cards">${Object.entries(topics)
    .map(
      ([k, n]) =>
        `<div class="mini"><b>${k}</b><p>후보 ${n}개 · 평균 점수 ${Math.round(vs.filter((v) => v.cat === k).reduce((a, b) => a + b.score, 0) / n)}</p></div>`,
    )
    .join("")}</div><br>${table(vs)}`;
}
