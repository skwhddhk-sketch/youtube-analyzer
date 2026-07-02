// Search tab
function renderSearch() {
  qs("#search").innerHTML =
    `<div class="panel"><div class="controls"><input id="searchQ" class="wide" placeholder="키워드 입력: 강아지, AI, 헬스..."><select id="searchCountry">${Object.entries(
      countries,
    )
      .map(([k, v]) => `<option value="${k}">${v}</option>`)
      .join(
        "",
      )}</select><label class="check"><input id="searchShorts" type="checkbox" checked>Shorts 포함</label><button class="btn red" onclick="runSearch()">검색</button></div><div class="chips">${getInterests()
      .map(
        (k) =>
          `<button class="chip" onclick="qs('#searchQ').value='${k}';runSearch()">${k}</button>`,
      )
      .join(
        "",
      )}</div></div><div id="searchResult">${table(seed("", "GLOBAL", true).slice(0, 8))}</div>`;
}

async function runSearch() {
  let q = qs("#searchQ").value.trim();
  let c = qs("#searchCountry").value;
  let shorts = qs("#searchShorts").checked;
  if (!demo && !API) {
    toast("API 키가 필요함");
    return;
  }
  let vs = seed(q, c, shorts).slice(0, 12);
  qs("#searchResult").innerHTML = table(vs);
}
