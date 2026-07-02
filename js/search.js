// Search tab
function renderSearch() {
  qs('#search').innerHTML =
    `<div class="panel"><div class="controls"><input id="searchQ" class="wide" placeholder="키워드 입력: 강아지, AI, 헬스..."><select id="searchCountry">${Object.entries(
      countries,
    )
      .map(([k, v]) => `<option value="${k}">${v}</option>`)
      .join(
        '',
      )}</select><select id="searchOrder"><option value="date">최신순</option><option value="viewCount">조회수순</option><option value="relevance">관련도순</option></select><label class="check"><input id="searchShorts" type="checkbox" checked>Shorts 포함</label><label class="check"><input id="searchNoise" type="checkbox" checked>뉴스/잡음 제외</label><label class="check"><input id="searchCache" type="checkbox" checked>캐시 사용</label><button class="btn red" onclick="runSearch()">검색</button><button class="btn light" onclick="clearSearchCache();toast('검색 캐시 삭제됨')">캐시 삭제</button></div><div class="chips">${getInterests()
      .map(
        (k) =>
          `<button class="chip" onclick="qs('#searchQ').value='${k}';runSearch()">${k}</button>`,
      )
      .join(
        '',
      )}</div></div><div id="searchResult">${table(seed('', 'GLOBAL', true).slice(0, 8))}</div>`;
}

async function runSearch() {
  let q = qs('#searchQ').value.trim();
  let c = qs('#searchCountry').value;
  let shorts = qs('#searchShorts').checked;
  const excludeNoise = qs('#searchNoise')?.checked ?? true;
  const order = qs('#searchOrder')?.value || 'date';
  const useCache = qs('#searchCache')?.checked ?? true;
  const resultEl = qs('#searchResult');

  if (demo) {
    let vs = seed(q, c, shorts).slice(0, 12);
    resultEl.innerHTML = table(vs);
    return;
  }

  if (!API) {
    toast('API 키를 저장하거나 Demo ON으로 전환해줘');
    return;
  }

  if (!q) {
    toast('검색어를 입력해줘');
    return;
  }

  try {
    resultEl.innerHTML = '<div class="empty">YouTube API 검색 중...</div>';
    const result = await searchYouTubeVideosCached(q, c, shorts, { excludeNoise, order, useCache });
    const vs = result.items;
    const notice = result.fromCache
      ? `<div class="cache-note">캐시 결과 사용 · ${cacheAgeLabel(result.cacheAge)}${result.expired ? ' · 만료 캐시' : ''}${result.error ? ' · API 실패로 캐시 대체' : ''}</div>`
      : '<div class="cache-note">새 API 검색 결과 · 캐시에 저장됨</div>';
    resultEl.innerHTML = notice + table(vs);
    toast(result.fromCache ? `캐시 검색 ${vs.length}개 로드됨` : `실제 검색 ${vs.length}개 로드됨`);
  } catch (err) {
    console.error(err);
    resultEl.innerHTML = `<div class="empty">API 검색 실패: ${err.message}</div>`;
    toast('API 검색 실패');
  }
}
