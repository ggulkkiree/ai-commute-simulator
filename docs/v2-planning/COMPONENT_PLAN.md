# Component Plan

이 문서는 React + Tailwind CSS v2에서 사용할 컴포넌트 초안이다. 실제 개발은 아직 진행하지 않으며, 현재 v1 기능을 빠뜨리지 않기 위한 설계 메모로만 사용한다.

## 범위 태그

- `[core]`: v2 MVP에 반드시 구현한다.
- `[optional]`: 나중에 확장 가능하며 핵심 제출 흐름에는 넣지 않는다.
- `[legacy/exclude]`: v2 핵심 구현 대상에서 제외한다.

## 앱 구조 후보

- `[core] AppShell`: 전체 화면 라우팅, 상단 HUD 표시 여부, 모달 레이어 관리.
- `[core] GameProvider`: 학생, 오늘 정보, 시간, 준비물, 통근 기록, 결과 기록을 관리.
- `[core] ScreenRouter`: 현재 screen key에 따라 화면 컴포넌트를 렌더링.
- `[core] TopStatusBar`: 현재 시간, 남은 시간, 목적지, 준비물 체크 상태.
- `[core] ModalRoot`: 학생 확인, 출근 정보 다시 보기, 피드백, 교사용 빠른 리포트 등 공통 모달.
- `[core] TTSButton`: 읽어주기/중지 처리.

## 컴포넌트 범위 분류

### Core

- StudentSelect
- StudentConfirmModal
- CommuteInfo
- AIPlanInput
- AIPlanResult
- AlarmSetup
- EveningPreparation
- EveningBusInfo
- EveningBagPacking
- SleepScene
- WakeUpScene
- MorningPrep
- MorningActivityCard
- MorningCutscene
- BagPacking
- RouteMap
- BusStop
- BusRide
- DestinationMap
- CommuteScreen
- ResultCutscene
- ResultScreen
- TeacherReport
- 공통 UI: GameButton, FeedbackOverlay, TimeDisplay, ProgressMeter, Avatar

### Teacher/Settings Optional

- AdminStudentManager

### Optional/Post-result

- DutyIntro
- DutyChecklist

### Legacy/Exclude

- 기존 시나리오 선택 화면 컴포넌트
- 기존 단계 전환 화면 컴포넌트
- 기존 단독 계획 화면 컴포넌트

## 화면 컴포넌트

### [core] StudentSelect

- 역할: 학생 목록 렌더링, 학생 선택, 시작 버튼 활성화.
- 필요한 데이터: students, maxStudents, selectedStudentId.
- 이벤트: 학생 선택, 시작 클릭. 관리자 클릭은 `[optional/teacher-settings]` 진입으로 분리한다.
- 하위 컴포넌트: StudentCard, EmptyStudentState.

### [core] StudentConfirmModal

- 역할: 선택 학생 확인과 캐릭터 성별 선택.
- 필요한 데이터: selectedStudent, avatar options.
- 이벤트: 시작, 다시 선택, 캐릭터 변경.

### [optional/teacher-settings] AdminStudentManager

- 역할: 학생 추가/수정/삭제, 수준/성별/아바타 관리.
- 필요한 데이터: students, capacity, avatarCatalog.
- 이벤트: addStudent, updateStudentProfile, removeStudent, back.
- 범위: core 플레이 흐름에서 제외한다.

### [core] CommuteInfo

- 역할: 오늘 출근 경로와 버스 정보를 브리핑.
- 필요한 데이터: todayInfo, busInfo, student.level.
- 이벤트: 다음 화면으로 이동, 다 수준 단계 확인, TTS 재생.
- 하위 컴포넌트: RouteSummary, RouteMapPreview, LevelStepBriefing.

### [core] AIPlanInput

- 역할: 출근 정보 입력 폼과 자동 계산 힌트 제공.
- 필요한 데이터: routeData, student.level, formValues, validationState.
- 이벤트: 시계 조정, select 변경, 계산, 출근 정보 다시 보기.
- 하위 컴포넌트: InlineClockInput, RouteReviewModal, AutomaticTip.

### [core] AIPlanResult

- 역할: AI 계산 결과와 출근 타임라인 표시.
- 필요한 데이터: aiCommutePlan.
- 이벤트: 입력 다시 보기, 전날 준비 시작.
- 하위 컴포넌트: PlanSummaryCard, PlanTimeline.

### [core] AlarmSetup

- 역할: 전날 알람 시간 설정.
- 필요한 데이터: recommendedAlarmTime, alarmOptions, student.level, workStartTime.
- 이벤트: 알람 선택, 가 수준 +/- 10분 조정, 알람 저장.

### [core] EveningPreparation

- 역할: 전날 준비의 상위 화면. 버스 확인, 가방 챙기기, 알람 설정 단계 제어.
- 필요한 데이터: busInfo, homeBag, todayInfo, student.level, evePrep.
- 이벤트: 버스 확인 완료, 가방 완료, 알람 완료.
- 하위 컴포넌트: EveningBusInfo, EveningBagPacking, AlarmSetup, BedTransitionPrompt.

### [core] EveningBusInfo

- 역할: 버스 정보 확인.
- 필요한 데이터: correctStop, direction, busNumber, busArrivalTime, getOffStop, travelTimes.
- 이벤트: 확인, 다 수준 다음 단계, 다시 듣기.

### [core] EveningBagPacking

- 역할: 전날 가방에 필수 준비물 챙기기.
- 필요한 데이터: homeBagItems, weather, level, distractorItems.
- 이벤트: 물건 선택/드롭, 다 수준 필요 여부 답변, 완료.
- 하위 컴포넌트: BagItem, BagDropZone, RequiredItemProgress, DaBagQuiz.

### [core] SleepScene

- 역할: 밤에서 아침으로 넘어가는 컷신.
- 필요한 데이터: alarmTime, isSnooze.
- 이벤트: 타이머 완료 후 아침 알람 이동.

### [core] WakeUpScene

- 역할: 아침 알람 선택.
- 필요한 데이터: alarmTime, snoozeCount.
- 이벤트: 바로 일어나기, 10분 더 자기.
- 하위 컴포넌트: AnalogClock, SnoozeFeedback.
- 상태 확정: 10분 더 자기 선택 시 `wokeUpEarly = false`.

### [core] MorningPrep

- 역할: 아침 준비 활동 메인 화면.
- 필요한 데이터: currentTime, targetTime, completedActivities, dressedForWork, aiPlanCompleted.
- 이벤트: 활동 선택, 오늘 출근 정보, 도움말, 다음 화면 이동.
- 하위 컴포넌트: MorningActivityGrid, MorningCutsceneOverlay, MorningInfoPanel.

### [core] MorningActivityCard

- 역할: 샤워/식사/양치/옷/가방 활동 버튼.
- 필요한 데이터: id, label, icon, completed, disabled.
- 이벤트: selectActivity.

### [core] MorningCutscene

- 역할: 활동별 이동/수행/완료 컷신 표시.
- 필요한 데이터: image, eyebrow, title, message, currentTime.
- 이벤트: 확인.

### [core] BagPacking

- 역할: 아침 가방 챙기기 미니게임.
- 필요한 데이터: bagItems, weather, level, evePackedItems.
- 이벤트: 물건 선택, 드롭, 완료.
- 하위 컴포넌트: BagWorldItem, BackpackDropArea, BagSlotList, BagFeedback.
- 상태 확정: 필수 준비물 완료 + 가방 완료 버튼 클릭 시 `bagChecked = true`.

### [core] RouteMap

- 역할: 출근 경로 시각화.
- 필요한 데이터: progressPercent, checkpoints, currentStage.
- 이벤트: 없음 또는 목적지 hotspot 선택.

### [core] BusStop

- 역할: 정류장 방향 선택과 버스 번호 선택.
- 필요한 데이터: busInfo, currentBusNumber, level, mistake counts.
- 이벤트: 정류장 선택, 버스 타기, 기다리기, 정보 보기.
- 하위 컴포넌트: BusNumberDisplay, CommuteInfoPopup.

### [core] BusRide

- 역할: 버스 내부 이동, 정류장 진행, 하차벨 판단.
- 필요한 데이터: routeStops, currentStop, targetGetOffStop, level.
- 이벤트: 다음 정류장, 내릴지 판단, 하차벨 누르기, 내리기.
- 하위 컴포넌트: NextStopPanel, BellButton, StopQuestion.

### [core] DestinationMap

- 역할: 하차 후 본하이리 목적지 찾기.
- 필요한 데이터: destinations, level.
- 이벤트: destination 선택.
- 하위 컴포넌트: MapHotspot.

### [core] CommuteScreen

- 역할: 통근 게임 전체 단계 관리.
- 필요한 데이터: currentTime, eta, targetTime, commuteRecord, busInfo, level.
- 이벤트: 단계별 액션.
- 하위 컴포넌트: CommuteDashboard, RouteProgress, BusStop, BusRide, DestinationMap, CommuteActions.

### [core] ResultCutscene

- 역할: 최종 결과 전 핵심 피드백 컷신.
- 필요한 데이터: resultPresentation, studentAvatar.
- 이벤트: 결과 확인.

### [core] ResultScreen

- 역할: 최종 결과, 별점, 피드백, 상세 기록, 리포트 진입.
- 필요한 데이터: rawJudgment, displayJudgment, feedback, resultPresentation, times, requiredItemsStatus, actionLog.
- 이벤트: 다시 듣기, 기록 열기, 다시 하기, 처음으로, 리포트 열기. 직무 화면 이동은 `[optional/post-result]`로 분리한다.
- 하위 컴포넌트: ResultBadge, ResultFeedbackPanel, ResultTimeline, ResultActions.
- 결과 확정: `rawJudgment = incomplete`이면 `displayJudgment = success`로 표시 가능하다.

### [core] TeacherReport

- 역할: 빠른 리포트 모달과 상세 리포트 화면을 구성.
- 필요한 데이터: gameState snapshot, history.
- 이벤트: 닫기, 상세 보기, 탭 전환, 인쇄, 다시 하기, 홈.
- 하위 컴포넌트: TeacherQuickReportModal, TeacherDetailReport, ReportSummaryTable, ReportTabs.

### [optional/post-result] DutyIntro

- 역할: 오늘의 직무 2개 소개.
- 필요한 데이터: todayDuties, level, workplace photo.
- 이벤트: 다음.
- 범위: v2 MVP 핵심 흐름에서 제외한다.

### [optional/post-result] DutyChecklist

- 역할: 도착 후 직무 수행 체크리스트.
- 필요한 데이터: todayDuties, level.
- 이벤트: 직무 체크, 완료, 처음으로.
- 범위: v2 MVP 핵심 흐름에서 제외한다.

## [core] 공통 UI 컴포넌트

### [core] GameButton

- 역할: primary/secondary/danger 버튼 스타일 통합.
- 필요한 데이터: variant, disabled, icon, label.

### [core] FeedbackOverlay

- 역할: 선택 피드백, 경고, AI 힌트 모달.
- 필요한 데이터: icon, title, message, detail, tone.
- 이벤트: 닫기/다음.

### [core] TimeDisplay

- 역할: 분 단위 시간을 `HH:MM`으로 표시.
- 필요한 데이터: minutes.

### [core] ProgressMeter

- 역할: 준비물/경로/단계 진행률 표시.
- 필요한 데이터: value, max 또는 percent.

### [core] Avatar

- 역할: 학생 아바타 이미지와 fallback 표시.
- 필요한 데이터: avatarKey, character, fallbackEmoji, name.

## [core] 상태 데이터 초안

### [core] GameState

- student
- time: current, target, deadline
- todayInfo
- busInfo
- homeBag
- flags
- evePrep
- morningPrep
- commuteRecord
- commute
- feedback
- teacherReport
- actionLog
- rawJudgment
- displayJudgment
- resultSaved

### [core] 파생 데이터

- routeData: workTime, busTime, departureTime, total, stopName, getOffStop.
- requiredItemsStatus: allRequired, missing, missingKeys, total, checked.
- arrivalStatus: success/late/fail 위험도와 남은 시간.
- resultPresentation: primary feedback tag 기반 이미지/문구.
- teacherQuickReport: 핵심 어려움과 지도 포인트.
- displayJudgment: 화면 표시용 결과. `rawJudgment = incomplete`이면 success 표시 가능.
- bagChecked: 필수 준비물 완료 + 가방 완료 버튼 클릭 시 true.
- wokeUpEarly: 10분 더 자기 선택 시 false.

## 자체 검증

- 사용자 요청 예시 컴포넌트(StudentSelect, CommuteInfo, AIPlanInput, AIPlanResult, AlarmSetup, SleepScene, WakeUpScene, MorningPrep, BagPacking, RouteMap, BusStop, BusRide, ResultScreen, TeacherReport)를 모두 포함했다.
- v1에 존재하는 관리자와 직무 기능은 `[optional]`로 분리했고, 결과 컷신, 공통 모달, TTS/HUD 기능은 `[core]`로 유지했다.
- 각 컴포넌트에 역할, 필요한 데이터, 이벤트를 함께 기록했다.
