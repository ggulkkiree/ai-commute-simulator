# V2 React Architecture

## 목적

이 문서는 현재 v1 프로젝트 안의 `docs/v2-planning/` 문서를 기준으로 React + Tailwind CSS 기반 v2 개발을 시작하기 전에 작성하는 프로젝트 구조 설계서다.

아직 React 프로젝트를 생성하거나 코딩하지 않는다. v2는 v1 제출본과 분리된 새 폴더에서 별도로 개발한다. v2 MVP는 기존 기획 문서의 `[core]` 항목만 구현 범위로 삼고, `[optional]`과 `[legacy/exclude]` 항목은 핵심 구현 대상에서 제외한다.

## [core] v2 MVP 흐름

v2 핵심 흐름은 아래 순서로 고정한다.

학생 선택 -> 브리핑 -> AI 계획 -> 전날 준비 -> 수면 -> 알람 -> 아침 준비 -> 가방 챙기기 -> 통근 -> 결과 -> 교사용 리포트

제외 범위:

- `[optional]` 오늘의 직무 확인/직무 수행
- `[optional]` 관리자/학생 관리 화면
- `[legacy/exclude]` v1 레거시 시나리오 화면

## 1. v2 기술 스택

### 기본 스택

- React: 화면과 컴포넌트 기반 UI 구현
- Vite: 빠른 개발 서버와 빌드 도구
- Tailwind CSS: 컴포넌트 단위 스타일링
- JavaScript: TypeScript 없이 JavaScript 기준으로 시작
- localStorage: 학생 목록, 게임 히스토리, 설정 저장

### 추천 패키지

- `react`
- `react-dom`
- `vite`
- `tailwindcss`
- `postcss`
- `autoprefixer`

아이콘이 필요하면 v2 시작 시 `lucide-react` 도입을 검토할 수 있다. 단, v2 MVP 설계 단계에서는 필수 의존성으로 고정하지 않는다.

### 추후 확장 가능성

- TypeScript 전환
- 서버 저장소 또는 Firebase/Supabase 연동
- 이미지 생성 결과물의 CDN/asset pipeline 관리
- 다국어/수준별 문장 데이터 분리
- 교사용 리포트 PDF 출력
- 테스트 도구 도입: Vitest, React Testing Library, Playwright

## 2. 추천 v2 폴더 구조

v2는 새 폴더에서 별도로 개발한다. 예시는 `v2/` 또는 별도 저장소 기준이다.

```text
src/
├── assets/
├── components/
├── context/
├── data/
├── hooks/
├── screens/
├── styles/
├── utils/
├── App.jsx
└── main.jsx
```

### `src/assets/`

이미지, 캐릭터, 결과 컷신, 배경 이미지를 둔다.

권장 하위 폴더:

```text
assets/
├── characters/
├── images/
├── results/
└── icons/
```

이미지는 `IMAGE_PROMPTS.md`의 `[core]` 항목부터 준비한다. 직무 관련 이미지는 `[optional]`로 분리한다.

### `src/components/`

여러 화면에서 재사용되는 공통 컴포넌트를 둔다.

예:

- `AppShell.jsx`
- `TopStatusBar.jsx`
- `TTSButton.jsx`
- `GameButton.jsx`
- `Modal.jsx`
- `FeedbackOverlay.jsx`
- `CharacterAvatar.jsx`
- `ImageScene.jsx`
- `ProgressStep.jsx`

### `src/screens/`

화면 단위 컴포넌트를 둔다. 화면 하나는 하나의 주요 목적만 가진다.

예:

- `StudentSelect.jsx`
- `CommuteInfo.jsx`
- `AIPlanInput.jsx`
- `AIPlanResult.jsx`
- `EveningPreparation.jsx`
- `SleepScene.jsx`
- `WakeUpScene.jsx`
- `MorningPrep.jsx`
- `BagPacking.jsx`
- `CommuteScreen.jsx`
- `ResultCutscene.jsx`
- `ResultScreen.jsx`
- `TeacherReport.jsx`

### `src/data/`

게임 규칙, 텍스트, 선택지, 준비물, 버스, 결과 규칙을 둔다. 화면 컴포넌트 내부에 하드코딩하지 않는다.

예:

- `students.js`
- `commute.js`
- `items.js`
- `morningActivities.js`
- `resultRules.js`
- `uiText.js`

### `src/context/`

전역 게임 상태와 상태 변경 로직을 둔다.

예:

- `GameContext.jsx`
- `gameReducer.js`
- `initialGameState.js`
- `gameActions.js`

### `src/hooks/`

화면 또는 기능별 재사용 로직을 둔다.

예:

- `useGameFlow.js`
- `useLocalStorage.js`
- `useTTS.js`
- `useTimer.js`
- `useCommuteProgress.js`

### `src/utils/`

순수 계산 함수와 포맷터를 둔다.

예:

- `time.js`
- `judgment.js`
- `commuteCalc.js`
- `items.js`
- `reportBuilder.js`

### `src/styles/`

Tailwind 진입 CSS와 최소 전역 스타일만 둔다.

예:

- `tailwind.css`
- `tokens.css` 또는 `theme.css`

큰 CSS 파일을 만들지 않는다. 화면별 스타일은 Tailwind class를 컴포넌트 내부에서 관리한다.

## 3. 핵심 화면 컴포넌트 구조

아래 컴포넌트는 `COMPONENT_PLAN.md`의 `[core]` 컴포넌트만 정리한 것이다.

### StudentSelect

- 역할: 학생 목록 표시, 학생 선택, 학생 확인 모달 진입.
- props/state: `students`, `selectedStudentId`, `maxStudents`.
- 주요 이벤트: `onSelectStudent`, `onOpenStudentConfirm`.
- 다음 화면: 학생 확인 후 `CommuteInfo`.

### StudentConfirmModal

- 역할: 선택 학생 확인, 캐릭터/아바타 확인.
- props/state: `selectedStudent`, `character`, `avatar`.
- 주요 이벤트: `onConfirm`, `onCancel`, `onChangeCharacter`.
- 다음 화면: `CommuteInfo`.

### CommuteInfo

- 역할: 출근 시간, 경로, 버스 정보 브리핑.
- props/state: `todayInfo`, `busInfo`, `studentLevel`.
- 주요 이벤트: `onConfirmRoute`, `onReplayTTS`.
- 다음 화면: `AIPlanInput`.

### AIPlanInput

- 역할: 출근 정보 입력/확인, AI 계산 실행.
- props/state: `routeData`, `studentLevel`, `formValues`, `validationState`.
- 주요 이벤트: `onChangeField`, `onCalculatePlan`, `onOpenRouteReview`.
- 다음 화면: `AIPlanResult`.

### AIPlanResult

- 역할: 기상/출발/탑승/도착 계획 타임라인 표시.
- props/state: `aiCommutePlan`.
- 주요 이벤트: `onEditPlan`, `onContinue`.
- 다음 화면: `EveningPreparation`.

### EveningPreparation

- 역할: 전날 버스 확인, 가방 챙기기, 알람 설정을 한 흐름으로 관리.
- props/state: `busInfo`, `bagItems`, `weather`, `studentLevel`, `eveningPackedItems`, `wakeUpTime`.
- 주요 이벤트: `onConfirmBusInfo`, `onPackEveningItem`, `onSetAlarm`.
- 다음 화면: `SleepScene`.

### SleepScene

- 역할: 알람 설정 후 밤에서 아침으로 넘어가는 컷신.
- props/state: `wakeUpTime`, `isSnooze`.
- 주요 이벤트: `onSleepAnimationEnd`.
- 다음 화면: `WakeUpScene`.

### WakeUpScene

- 역할: 바로 일어나기 또는 10분 더 자기 선택.
- props/state: `wakeUpTime`, `snoozeCount`, `wokeUpEarly`.
- 주요 이벤트: `onWakeNow`, `onSnooze`.
- 상태 규칙: 10분 더 자기 선택 시 `wokeUpEarly = false`.
- 다음 화면: 바로 일어나기 -> `MorningPrep`, 10분 더 자기 -> `SleepScene`.

### MorningPrep

- 역할: 샤워, 아침 먹기, 양치, 옷 입기, 가방 챙기기 활동 선택.
- props/state: `currentTime`, `targetArrivalTime`, `morningActivities`, `bagChecked`.
- 주요 이벤트: `onSelectActivity`, `onOpenBagPacking`, `onStartCommute`.
- 다음 화면: 가방 챙기기 -> `BagPacking`, 모든 활동 완료 -> `CommuteScreen`.

### BagPacking

- 역할: 필수/상황 준비물을 챙기고 방해물을 거르는 미니게임.
- props/state: `bagItems`, `weather`, `studentLevel`, `eveningPackedItems`, `bagChecked`.
- 주요 이벤트: `onSelectItem`, `onDropItem`, `onCompleteBag`.
- 상태 규칙: 필수 준비물 완료 + 가방 완료 버튼 클릭 시 `bagChecked = true`.
- 다음 화면: `MorningPrep`.

### CommuteScreen

- 역할: 통근 전체 상태 머신 관리.
- props/state: `currentTime`, `targetArrivalTime`, `selectedBus`, `currentStop`, `busInfo`, `commuteRecord`.
- 주요 이벤트: `onChooseStop`, `onChooseBus`, `onResolveTransitCard`, `onPressBell`, `onChooseDestination`, `onArrive`.
- 다음 화면: `ResultCutscene`.

### BusStop

- 역할: 정류장 방향 선택과 버스 번호 선택.
- props/state: `busInfo`, `selectedBus`, `studentLevel`, `mistakeCounts`.
- 주요 이벤트: `onChooseStopDirection`, `onChooseBus`, `onWaitNextBus`.
- 다음 단계: `BusRide`.

### BusRide

- 역할: 버스 내부 이동, 정류장 진행, 하차벨 처리.
- props/state: `routeStops`, `currentStop`, `targetGetOffStop`, `studentLevel`.
- 주요 이벤트: `onMoveNextStop`, `onPressBell`, `onGetOff`.
- 다음 단계: `DestinationMap`.

### DestinationMap

- 역할: 하차 후 본하이리 목적지 찾기.
- props/state: `destinations`, `studentLevel`.
- 주요 이벤트: `onChooseDestination`.
- 다음 단계: 회사 도착 처리 후 `ResultCutscene`.

### ResultCutscene

- 역할: 결과 화면 전 핵심 피드백 컷신 표시.
- props/state: `rawJudgment`, `displayJudgment`, `feedbackTags`, `resultPresentation`.
- 주요 이벤트: `onContinue`.
- 다음 화면: `ResultScreen`.

### ResultScreen

- 역할: 최종 결과, 별점, 피드백, 행동 기록, 리포트 진입.
- props/state: `rawJudgment`, `displayJudgment`, `feedbackTags`, `reportData`, `actionLog`.
- 주요 이벤트: `onRetry`, `onGoHome`, `onOpenTeacherReport`, `onReplayTTS`.
- 다음 화면: `TeacherReport` 또는 학생 선택.

### TeacherReport

- 역할: 교사용 빠른 리포트와 상세 리포트 표시.
- props/state: `reportData`, `history`, `selectedStudent`.
- 주요 이벤트: `onClose`, `onPrint`, `onRetry`, `onGoHome`.
- 다음 화면: 결과 화면 또는 학생 선택.

## 4. 공통 컴포넌트 구조

### AppShell

- 역할: 전체 화면 프레임, 배경, 상단 HUD, 모달 영역 관리.
- 재사용 화면: 전체 앱.

### TopStatusBar

- 역할: 현재 시간, 남은 시간, 준비물 체크 상태 표시.
- 재사용 화면: 아침 준비, 통근, 결과.

### TTSButton

- 역할: 현재 화면 문장 또는 결과 문장 읽어주기.
- 재사용 화면: 브리핑, 전날 버스 확인, 통근 안내, 결과.

### GameButton

- 역할: primary/secondary/danger 버튼 스타일 통합.
- 재사용 화면: 모든 화면.

### Modal

- 역할: 공통 모달 레이아웃.
- 재사용 화면: 학생 확인, 출근 정보 다시 보기, 교사용 빠른 리포트.

### FeedbackOverlay

- 역할: 정답/오답/경고/AI 힌트 피드백.
- 재사용 화면: 가방 챙기기, 통근, 결과 전 피드백.

### CharacterAvatar

- 역할: 학생 아바타 이미지와 fallback 표시.
- 재사용 화면: 학생 선택, 전날 준비, 결과, 리포트.

### ImageScene

- 역할: 배경 이미지, 컷신 이미지, 오버레이 텍스트를 통일.
- 재사용 화면: 수면, 아침 준비 컷신, 통근, 결과 컷신.

### ProgressStep

- 역할: 단계 진행률, 체크포인트, 타임라인 단계 표시.
- 재사용 화면: AI 계획 결과, 전날 준비, 통근 진행, 결과 리포트.

## 5. 데이터 파일 구조

```text
src/data/
├── students.js
├── commute.js
├── items.js
├── morningActivities.js
├── resultRules.js
└── uiText.js
```

### `students.js`

- 기본 학생 데이터 또는 샘플 데이터
- 학생 수준 값
- 캐릭터/아바타 선택지
- 최대 학생 수

관리자 화면은 `[optional]`이므로 core 구현에서는 학생 목록을 localStorage 또는 샘플 데이터로 시작할 수 있다.

### `commute.js`

- 출근 목표 시간 후보: 09:00, 10:00, 13:00
- 버스 번호: 200번
- 방해 버스 번호: 999번, 119번
- 정류장 데이터
- 목적지 데이터
- 이동 시간 상수
- 버스 배차 규칙

### `items.js`

- 기본 준비물: 교통카드, 스마트폰, 물병
- 날씨별 준비물: 우산, 선풍기, 장갑, 겉옷, 마스크
- 방해물: 게임기, 과자, 장난감
- 준비물 표시명, 아이콘, 이미지 key

직무 준비물은 `[optional]` 데이터로 같은 파일 하단에 분리하거나 별도 `dutyItems.js`로 나중에 분리한다.

### `morningActivities.js`

- 샤워: 10분
- 아침 먹기: 10분
- 양치: 5분
- 옷 입기: 5분
- 가방 챙기기: 5분
- 활동별 컷신 이미지 key
- 활동별 완료 메시지

시간 값은 현재 v1 최종 플레이 흐름 기준으로 통일한다.

### `resultRules.js`

- `rawJudgment` 계산 규칙
- `displayJudgment` 변환 규칙
- `rawJudgment = incomplete` -> `displayJudgment = success`
- 피드백 우선순위
- 결과 컷신 매핑
- 별점 규칙

### `uiText.js`

- 화면별 제목/버튼/설명 텍스트
- 학생 수준별 문장
- TTS용 문장
- 결과 메시지
- 리포트 문구

## 6. 상태 관리 구조

### 추천 방식

v2 MVP는 `useReducer + Context` 조합을 추천한다.

이유:

- 화면이 많고 상태 전이가 명확하다.
- 시간, 준비물, 통근, 결과 판정이 서로 연결된다.
- 단순 `useState`만 사용하면 화면 간 상태 전달이 빠르게 복잡해진다.
- 외부 상태 라이브러리는 MVP에서는 과하다.

구조 예:

```text
src/context/
├── GameContext.jsx
├── gameReducer.js
├── initialGameState.js
└── gameActions.js
```

### 반드시 포함할 상태

- `currentScreen`: 현재 화면 key
- `selectedStudent`: 선택 학생 객체
- `studentLevel`: 학생 수준
- `targetArrivalTime`: 목표 출근 시간
- `wakeUpTime`: 알람/기상 예정 시간
- `currentTime`: 현재 게임 시간
- `weather`: 오늘 날씨
- `eveningPackedItems`: 전날 챙긴 물건
- `morningActivities`: 아침 활동 완료 상태
- `bagItems`: 가방 준비물 상태
- `bagChecked`: 필수 준비물 완료 + 완료 버튼 클릭 여부
- `selectedBus`: 선택한 버스 번호
- `currentStop`: 현재 정류장
- `wokeUpEarly`: 바로 일어났는지 여부
- `rawJudgment`: 저장/분석용 원본 결과
- `displayJudgment`: 화면 표시용 결과
- `feedbackTags`: 피드백 후보와 우선순위
- `reportData`: 교사용 리포트 데이터

### 추천 액션

- `SELECT_STUDENT`
- `CONFIRM_STUDENT`
- `SET_TODAY_INFO`
- `SAVE_AI_PLAN`
- `SET_ALARM`
- `SNOOZE_ALARM`
- `WAKE_UP`
- `COMPLETE_MORNING_ACTIVITY`
- `PACK_BAG_ITEM`
- `COMPLETE_BAG_CHECK`
- `CHOOSE_BUS_STOP`
- `CHOOSE_BUS`
- `MOVE_TO_NEXT_STOP`
- `PRESS_BELL`
- `CHOOSE_DESTINATION`
- `ARRIVE_WORKPLACE`
- `CALCULATE_RESULT`
- `BUILD_REPORT`
- `GO_TO_SCREEN`
- `RESET_GAME`

## 7. v2 구현 순서

### 1차: 프로젝트 초기 세팅 + 공통 레이아웃 + 학생 선택

- Vite React 프로젝트 생성
- Tailwind CSS 설정
- `AppShell`, `GameProvider`, `ScreenRouter` 작성
- `StudentSelect`, `StudentConfirmModal` 구현
- localStorage 읽기/쓰기 훅 초안 작성
- QA: 학생 선택 후 다음 화면 이동 확인

### 2차: 브리핑 + AI 계획 입력/결과

- `CommuteInfo` 구현
- `AIPlanInput` 구현
- `AIPlanResult` 구현
- `commute.js`, `uiText.js` 데이터 연결
- QA: 출근 시간, 버스 정보, 계산 결과가 일관되는지 확인

### 3차: 전날 준비 + 수면 + 알람

- `EveningPreparation` 구현
- `EveningBusInfo`, `EveningBagPacking`, `AlarmSetup` 구현
- `SleepScene`, `WakeUpScene` 구현
- `wokeUpEarly = false` 규칙 반영
- QA: 알람 설정, 수면 전환, 10분 더 자기 흐름 확인

### 4차: 아침 준비 + 가방 챙기기

- `MorningPrep` 구현
- `MorningActivityCard`, `MorningCutscene` 구현
- `BagPacking` 구현
- `bagChecked = true` 규칙 반영
- QA: 활동 시간 증가, 가방 필수 준비물 완료 조건 확인

### 5차: 통근/버스/하차/목적지

- `CommuteScreen` 구현
- `BusStop`, `BusRide`, `DestinationMap` 구현
- 교통카드 이벤트, 하차벨, 목적지 선택 구현
- QA: 성공/지각/실패 시간을 강제로 만들어 판정 확인

### 6차: 결과 + 교사용 리포트

- `ResultCutscene` 구현
- `ResultScreen` 구현
- `TeacherReport` 구현
- `rawJudgment`, `displayJudgment`, `feedbackTags`, `reportData` 연결
- QA: `incomplete` 표시, 피드백 우선순위, 인쇄 화면 확인

### 7차: QA + 디자인 디테일

- 모바일/데스크톱 반응형 점검
- 텍스트 넘침 점검
- TTS 버튼 동작 점검
- 이미지 누락 fallback 점검
- localStorage 저장/초기화 점검
- 전체 core 흐름 회귀 테스트

## 8. 개발 원칙

- v1 `[core]` 기능 누락 금지.
- `[core]` 흐름을 먼저 완성한다.
- `[optional]`과 `[legacy/exclude]`는 MVP에서 구현하지 않는다.
- 한 단계 구현 후 반드시 QA한다.
- 화면 하나는 하나의 주요 역할만 가진다.
- 큰 CSS 파일을 만들지 않는다.
- Tailwind class는 컴포넌트 내부에서 관리한다.
- 반복되는 UI는 공통 컴포넌트로 분리한다.
- 데이터는 화면에 하드코딩하지 않고 `src/data/`로 분리한다.
- 시간/결과/버스 계산은 `src/utils/`의 순수 함수로 분리한다.
- 이미지 경로와 텍스트는 데이터 key로 관리한다.
- localStorage 접근은 hook 또는 storage utility로 제한한다.
- React 컴포넌트에서 직접 복잡한 판정 로직을 작성하지 않는다.

## 9. v2 시작 전 체크리스트

- v1 제출본이 GitHub에 보관되어 있는지 확인한다.
- v2를 개발할 새 폴더 또는 새 저장소 위치를 확정한다.
- `docs/v2-planning/` 핵심 문서를 v2 작업 폴더로 복사할지 결정한다.
- `[core]` 문서만 MVP 구현 기준으로 삼는지 확인한다.
- `[optional]`과 `[legacy/exclude]`를 이번 구현에서 제외하기로 재확인한다.
- `IMAGE_PROMPTS.md`의 `[core]` 이미지 목록을 확인한다.
- 이미지 생성/수급 전 필요한 화면 우선순위를 정한다.
- 첫 구현 범위를 1차 단계로 제한한다.
- 샤워/아침 먹기 시간 10분 기준을 다시 확인한다.
- `rawJudgment`와 `displayJudgment` 분리 기준을 팀 내에서 공유한다.

## 자체 검증

- `[core]` 흐름만 v2 MVP 기준으로 정리했다.
- 오늘의 직무 확인/직무 수행은 포함하지 않고 `[optional]`로 남겼다.
- 관리자/학생 관리 화면은 core 플레이 흐름에서 제외했다.
- 레거시 시나리오는 `[legacy/exclude]`로 제외했다.
- 상태 목록에 요청된 필수 상태를 모두 포함했다.
- 구현 순서는 한 번에 전체를 만들지 않도록 7단계로 나눴다.
- React 프로젝트 생성이나 코드 구현 지시는 포함하지 않았다.
