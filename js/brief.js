// Shorts brief generator
function briefText(v) {
  v = calc({ ...v });
  let tone = titleType(v.title);
  return `# 쇼츠 제작안\n\n원본 참고: ${v.title}\n채널: ${v.channel}\n판정: AI ${v.score}점 / 복제 가능성 ${v.rep}점 / 평균 대비 ${v.rAvg.toFixed(1)}x\n\n## 1. 핵심 콘셉트\n${tone} 구조를 활용해서 결과 장면을 먼저 보여주는 쇼츠. 감정은 호기심 → 반전 → 공감 순서로 설계.\n\n## 2. 제목 후보\n1) ${remixTitle(v.title)}\n2) 이 장면 보고 다들 멈칫함\n3) 처음엔 평범했는데 마지막이 미쳤다\n\n## 3. 첫 3초 훅\n- 0.0초: 가장 강한 결과 장면 먼저 노출\n- 0.5초: 화면 중앙에 짧은 문구 5~8자\n- 1.5초: 왜 이런 일이 생겼는지 궁금하게 컷 전환\n\n## 4. 컷 구성\n- 0~3초: 결말/리액션 선공개\n- 3~8초: 상황 설명 최소화\n- 8~18초: 핵심 장면 반복/확대\n- 18~25초: 반전 또는 감정 마무리\n- 마지막 1초: 댓글 유도 문장\n\n## 5. 썸네일 가이드\n주인공을 크게 배치하고, 표정/동작이 바로 보이게 잡기. 텍스트는 3~5단어만 사용.\n\n## 6. 자막 톤\n짧게, 크게, 한 줄 위주. 설명보다 반응을 먼저 넣기.\n\n## 7. 댓글 유도\n\"이 장면 다시 봐도 신기하지 않음?\"`;
}

function renderBrief() {
  let ids = [...plans(), ...favs()];
  let vs = ids.map(findVideo).filter(Boolean);
  if (!vs.length) vs = seed("", "GLOBAL", true).slice(0, 5);
  qs("#brief").innerHTML =
    `<div class="panel"><h2 style="margin-top:0">쇼츠 제작안 생성기</h2><p class="subtle">기획 보드/즐겨찾기 영상 기반으로 제목, 훅, 컷 구성, 썸네일 가이드를 자동 작성.</p><div class="controls"><select id="briefPick" class="wide">${vs.map((v) => `<option value="${v.id}">${v.title}</option>`).join("")}</select><button class="btn red" onclick="makeBrief()">제작안 생성</button><button class="btn light" onclick="copyBrief()">복사</button></div></div><textarea id="briefOut" class="memo" style="min-height:520px;font-family:ui-monospace,Consolas,monospace;line-height:1.55" placeholder="제작안 생성 버튼을 눌러줘."></textarea>`;
}

function makeBrief() {
  let id = qs("#briefPick").value;
  let v = findVideo(id);
  qs("#briefOut").value = briefText(v);
  toast("제작안 생성됨");
}

function copyBrief() {
  let el = qs("#briefOut");
  el.select();
  document.execCommand("copy");
  toast("복사됨");
}
