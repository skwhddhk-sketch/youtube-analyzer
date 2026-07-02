# Viral Radar v22

## 변경 사항

- 실제 YouTube API 검색 결과의 AI 점수 계산식을 개선했습니다.
- YouTube duration 값을 초 단위로 통일했습니다.
- 검색 결과에서 뉴스성/스팸성 잡음을 제외하는 옵션을 추가했습니다.
- 검색 정렬 옵션을 추가했습니다: 최신순, 조회수순, 관련도순.
- 썸네일 우선순위를 maxres > standard > high > medium > default 순서로 개선했습니다.
- 영상 상세 Drawer에 AI 분석과 YouTube 바로가기 버튼을 강화했습니다.

## API 키 정책

API 키는 코드에 포함하지 않습니다. 입력창에 저장한 키만 localStorage에서 사용합니다.


## v23
- 검색 결과 캐시(localStorage) 추가
- 같은 키워드/국가/정렬/필터 조건은 6시간 동안 API 재호출 없이 표시
- API 쿼터 초과 시 만료 캐시가 있으면 자동 대체
- 검색 탭에 캐시 사용/캐시 삭제 옵션 추가
