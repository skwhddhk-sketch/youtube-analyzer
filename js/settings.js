// Settings tab and interest management
function renderSettings() {
  let ints = getInterests();
  qs("#settings").innerHTML =
    `<div class="panel"><h2 style="margin-top:0">내 관심사 관리</h2><p class="subtle">홈 탭과 검색 추천 칩에 바로 반영됨.</p><div class="controls"><input id="newInterest" class="wide" placeholder="예: 고양이, 쇼츠 편집, 경제뉴스"><button class="btn red" onclick="addInterest()">추가</button><button class="btn light" onclick="resetInterests()">기본값 복원</button></div><div class="chips">${ints.map((k) => `<button class="chip" onclick="removeInterest('${k}')">${k} ×</button>`).join("")}</div></div><div class="panel"><h2 style="margin-top:0">검색 사용 전략</h2><div class="kpi"><div><b>추천 방식</b><p class="subtle">Demo ON에서 화면 테스트 → API 리셋 후 실제 검색</p></div><div><b>쿼터 절약</b><p class="subtle">핫트렌드/채널분석은 필요한 키워드만 실행</p></div><div><b>저장 루틴</b><p class="subtle">좋은 영상은 즐겨찾기 → 기획 보드 → JSON 백업</p></div></div></div><div class="panel"><h2 style="margin-top:0">쿼터 절약 원칙</h2><ul><li>자동 조회 OFF</li><li>Demo ON 상태에서 UI 먼저 테스트</li><li>API 리셋 후 필요한 검색만 실행</li><li>GitHub Pages 배포 전 API 키는 HTML에 넣지 않기</li></ul></div>`;
}

function addInterest() {
  let v = qs("#newInterest").value.trim();
  if (!v) return;
  let ints = getInterests();
  if (!ints.includes(v)) ints.unshift(v);
  setInterests(ints.slice(0, 20));
  renderAll();
  toast("관심사 추가됨");
}

function removeInterest(v) {
  setInterests(getInterests().filter((x) => x !== v));
  renderAll();
  toast("관심사 삭제됨");
}

function resetInterests() {
  setInterests(defaultInterests);
  renderAll();
  toast("기본값 복원됨");
}
