// Planning board
function plans() {
  return JSON.parse(localStorage.getItem("vr_plans") || "[]");
}

function setPlans(p) {
  localStorage.setItem("vr_plans", JSON.stringify(p));
}

function addPlan(id) {
  let p = plans();
  if (!p.includes(id)) p.unshift(id);
  setPlans(p);
  toast("기획 보드에 추가됨");
}

function renderPlanner() {
  let vs = plans()
    .map(findVideo)
    .filter(Boolean)
    .map((x) => calc({ ...x }));
  qs("#planner").innerHTML =
    `<div class="planner">${vs.map((v) => `<div class="plan"><h3>${v.title}</h3><p class="subtle">복제 가능성 ${v.rep}점 · ${titleType(v.title)}</p><ul><li>훅: 결과 장면 먼저</li><li>제목: ${remixTitle(v.title)}</li><li>촬영: 원본 감정 구조만 차용</li></ul><button class="btn light" onclick="setPlans(plans().filter(x=>x!=='${v.id}'));renderPlanner()">삭제</button></div>`).join("") || '<div class="empty">기획 보드에 추가한 영상 없음</div>'}</div>`;
}
