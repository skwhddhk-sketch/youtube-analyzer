// Favorites and import/export
function favs() {
  return JSON.parse(localStorage.getItem("vr_favs") || "[]");
}

function setFavs(x) {
  localStorage.setItem("vr_favs", JSON.stringify(x));
}

function isFav(id) {
  return favs().includes(id);
}

function favToggle(id) {
  let f = favs();
  f = f.includes(id) ? f.filter((x) => x !== id) : [id, ...f];
  setFavs(f);
  toast(f.includes(id) ? "저장됨" : "해제됨");
  renderAll();
}

function renderFav() {
  let vs = favs()
    .map(findVideo)
    .filter(Boolean)
    .map((x) => calc({ ...x }));
  qs("#fav").innerHTML =
    `<div class="panel"><div class="controls"><button class="btn light" onclick="setFavs([]);renderFav();toast('전체 삭제됨')">전체 삭제</button><button class="btn light" onclick="exportFavorites()">내보내기</button></div></div>${vs.length ? table(vs) : '<div class="empty">저장한 영상 없음</div>'}`;
}

function exportFavorites() {
  let data = {
    favs: favs(),
    plans: plans(),
    memo: JSON.parse(localStorage.getItem("vr_memo") || "{}"),
  };
  let blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "viral-radar-data.json";
  a.click();
}

function importFavorites(e) {
  let f = e.target.files[0];
  if (!f) return;
  let r = new FileReader();
  r.onload = () => {
    try {
      let d = JSON.parse(r.result);
      if (d.favs) setFavs(d.favs);
      if (d.plans) setPlans(d.plans);
      if (d.memo) localStorage.setItem("vr_memo", JSON.stringify(d.memo));
      renderAll();
      toast("가져오기 완료");
    } catch (err) {
      toast("파일 오류");
    }
  };
  r.readAsText(f);
}
