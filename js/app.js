// Application bootstrap and navigation
let API = localStorage.getItem("vr_api_key") || "";
let demo = localStorage.getItem("vr_demo") !== "off";
let current = [];

function nav() {
  qs("#nav").innerHTML = TABS.map(
    ([id, n]) =>
      `<button onclick="go('${id}')" data-tab="${id}" class="${id === "home" ? "active" : ""}">${n}</button>`,
  ).join("");
}

function go(id) {
  qsa(".tabs").forEach((x) => x.classList.remove("active"));
  qs("#" + id).classList.add("active");
  qsa("#nav button").forEach((b) =>
    b.classList.toggle("active", b.dataset.tab === id),
  );

  const map = {
    home: ["홈", "내 관심사 기반 기본 피드"],
    search: ["검색", "키워드로 아웃라이어 영상 찾기"],
    trend: ["Hot Trend", "나라별 지금 뜨는 주제 보기"],
    channel: ["채널 분석", "궁금한 채널의 성공 패턴 분석"],
    fav: ["즐겨찾기", "저장한 영상 다시 보기"],
    planner: ["기획 보드", "따라 만들 소재를 기획안으로 바꾸기"],
    brief: ["제작안", "저장한 영상을 쇼츠 제작안으로 변환"],
    settings: ["설정", "관심사와 API 설정"],
  };

  qs("#pageTitle").textContent = map[id][0];
  qs("#pageDesc").textContent = map[id][1];

  if (id === "fav") renderFav();
  if (id === "planner") renderPlanner();
  if (id === "brief") renderBrief();
}

function renderAll() {
  renderHome();
  renderSearch();
  renderTrend();
  renderChannel();
  renderFav();
  renderPlanner();
  renderBrief();
  renderSettings();
  updateDemoBtn();
}

document.addEventListener("DOMContentLoaded", () => {
  qs("#apiKey").value = API;
  nav();
  renderAll();
});
