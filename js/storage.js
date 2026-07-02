// LocalStorage, API key, demo mode, and toast helpers
function getInterests() {
  return JSON.parse(
    localStorage.getItem("vr_interests") || JSON.stringify(defaultInterests),
  );
}

function setInterests(v) {
  localStorage.setItem("vr_interests", JSON.stringify(v));
}
function saveKey() {
  API = qs("#apiKey").value.trim();
  localStorage.setItem("vr_api_key", API);
  toast("API 키 저장됨");
}

function toggleDemo() {
  demo = !demo;
  localStorage.setItem("vr_demo", demo ? "on" : "off");
  updateDemoBtn();
  toast(demo ? "Demo ON" : "Demo OFF");
}

function updateDemoBtn() {
  setTimeout(() => {
    let b = qs("#demoBtn");
    if (b) b.textContent = demo ? "Demo ON" : "Demo OFF";
  }, 0);
}

function toast(t) {
  let el = qs("#toast");
  el.textContent = t;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1600);
}

function getMemo(id) {
  return JSON.parse(localStorage.getItem("vr_memo") || "{}")[id] || "";
}

function saveMemo(id, t) {
  let m = JSON.parse(localStorage.getItem("vr_memo") || "{}");
  m[id] = t;
  localStorage.setItem("vr_memo", JSON.stringify(m));
}
