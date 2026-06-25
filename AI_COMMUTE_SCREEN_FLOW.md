# AI_COMMUTE_SCREEN_FLOW.md
> AI 출근 시뮬레이터 화면 흐름 문서 v1.0  
> 현재 기준: 가수준 플레이 캡처 1차 분석 + 기존 프로젝트 문서 기준

---

## 0. 문서 목적

이 문서는 **AI 출근 시뮬레이터**의 화면 번호, 화면 역할, 화면 간 연결 순서를 정리한 기준 문서이다.

앞으로 Codex 작업 시에는 다음 원칙을 따른다.

1. 화면을 수정할 때는 반드시 화면 번호를 기준으로 지시한다.
2. 요청한 화면 번호 외의 화면은 임의로 수정하지 않는다.
3. 화면 연결을 바꿀 때는 이 문서의 흐름을 기준으로 확인한다.
4. “본앤하이리”는 앱 이름이 아니라 현재 기본 목적지 데이터이다.
5. 앱의 공식 제품명은 **AI 출근 시뮬레이터**이다.

---

## 1. 핵심 개념 정의

### Product

```text
AI 출근 시뮬레이터
```

학생이 출근 전날부터 실제 출근까지의 과정을 연습하는 교육용 게임형 웹앱이다.

### Scenario Data

```text
현재 기본 시나리오 데이터: 본앤하이리
```

본앤하이리는 현재 앱에 들어 있는 첫 번째 출근 목적지 데이터이다.  
향후에는 카페, 도서관, 마트, 농장 등 3~5개의 목적지 데이터로 확장할 수 있다.

### Screen

Screen은 학생이 하나의 큰 단계에서 행동하거나 정보를 확인하는 화면 단위이다.

예:

```text
S007_AlarmSet
S010_MorningPrep
S016_BusInside
```

### Scene

Scene은 하나의 Screen 안에서 이루어지는 세부 행동 또는 짧은 장면이다.

예:

```text
S010_MorningPrep 안의 SC10-01_Shower
S010_MorningPrep 안의 SC10-02_Breakfast
```

### Component

Component는 여러 화면에서 반복 사용되는 UI 부품이다.

예:

```text
GameButton
InfoCard
TimeHUD
GameModal
CharacterBubble
```

---

## 2. 전체 화면 흐름

```text
S001 Main
↓
S002 StudentSelect
↓
S003 Mission
↓
S004 AIInput
↓
S005 AIResult
↓
S006 EveBag
↓
S007 AlarmSet
↓
S008 SleepTransition
↓
S009 WakeupAlarm
↓
S010 MorningPrep
↓
S011 MorningAction
↓
S012 BagCheck
↓
S013 CommuteMap
↓
S014 BusStop
↓
S015 BusSelect
↓
S016 BusInside
↓
S017 Alighting
↓
S018 WalkMap
↓
S019 Arrival
↓
S020 Result
↓
S021 Report
```

관리자 화면은 별도 진입 화면이다.

```text
S022 Admin
```

---

## 3. 화면 번호 목록

| Screen ID | 화면 이름 | 역할 | 현재 상태 |
|---|---|---|---|
| S001 | Main | 앱 시작 / 학생 선택 진입 | 기준 화면 채택 |
| S002 | StudentSelect | 학생 선택 확인 모달 | 기준 화면 채택 |
| S003 | Mission | 출근 미션 확인 | 디자인 보정 필요 |
| S004 | AIInput | AI 출근 정보 입력 | P0 디자인 보정 필요 |
| S005 | AIResult | AI 출근 계획 결과 | P0 디자인 보정 필요 |
| S006 | EveBag | 전날 가방 챙기기 | P0 기능 연결 복구 필요 |
| S007 | AlarmSet | 알람 맞추기 | 기준 화면 채택 |
| S008 | SleepTransition | 잠자기/새벽/아침 전환 연출 | 기준 화면 채택 |
| S009 | WakeupAlarm | 아침 알람 울림 / 일어나기 선택 | 기준 화면 채택 |
| S010 | MorningPrep | 아침 준비 메인 | 기준 화면 채택 |
| S011 | MorningAction | 아침 활동 완료 장면/팝업 | 추가 캡처 필요 |
| S012 | BagCheck | 출발 전 가방 확인 | 기준 화면 채택 |
| S013 | CommuteMap | 출근 경로 지도 | 추가 캡처 필요 |
| S014 | BusStop | 버스 정류장 | 추가 캡처 필요 |
| S015 | BusSelect | 버스 번호 선택 | 추가 캡처 필요 |
| S016 | BusInside | 버스 내부 이동 | 기준 화면 채택 |
| S017 | Alighting | 하차 선택 | 기준 화면 채택 |
| S018 | WalkMap | 회사 찾기 미니지도 | 추가 캡처 필요 |
| S019 | Arrival | 도착 확인 컷신 | 기준 화면 채택 |
| S020 | Result | 결과 화면 | P1 디자인 보정 필요 |
| S021 | Report | 교사용 리포트 | P1 디자인 보정 필요 |
| S022 | Admin | 교사 설정 / 학생 관리 | P2 디자인 보정 필요 |

---

## 4. 현재 기준 화면

다음 화면들은 현재 앱의 핵심 톤앤매너 기준으로 채택한다.

```text
S001_Main
S007_AlarmSet
S008_SleepTransition
S009_WakeupAlarm
S010_MorningPrep
S012_BagCheck
S016_BusInside
S017_Alighting
S019_Arrival
```

공통 특징:

```text
3D 반실사 배경
중앙 캐릭터
큰 버튼
게임 HUD
짧고 명확한 문장
따뜻한 색감
학생이 즉시 이해 가능한 화면 구조
```

---

## 5. 디자인 보정 필요 화면

```text
P0: S004_AIInput
P0: S005_AIResult
P1: S020_Result
P1: S021_Report
P2: S022_Admin
```

보정 방향:

- 웹 양식 느낌을 줄인다.
- 게임형 카드, HUD, 큰 버튼 규칙을 적용한다.
- 한 화면에 들어가는 정보량을 줄인다.
- 기존 기준 화면의 배경, 카드, 버튼, 말풍선 규칙을 따른다.
- 기능 로직은 수정하지 않고 UI 구조만 보정한다.

---

## 6. P0 기능 연결 복구 대상

### S006_EveBag

현재 전날 가방 챙기기 화면은 업데이트 과정에서 메인 진행선과 기능 연결이 끊긴 상태이다.

복구 목표:

```text
S005_AIResult
↓
S006_EveBag
↓
S007_AlarmSet
```

필수 조건:

1. 전날 가방 챙기기 화면이 알람 맞추기 전에 등장해야 한다.
2. 전날 선택한 물건은 gameState에 저장되어야 한다.
3. 전날 챙긴 물건은 다음날 S012_BagCheck에 반영되어야 한다.
4. S006 복구 과정에서 S007 이후 흐름을 변경하지 않는다.
5. 디자인은 현재 기준 화면 톤을 유지한다.

---

## 7. S010 MorningPrep 하위 Scene

```text
S010_MorningPrep
├── SC10-01_Shower
├── SC10-02_Breakfast
├── SC10-03_Toothbrush
├── SC10-04_Dress
└── SC10-05_PhoneCheck
```

현재 캡처 기준에서는 S012_BagCheck는 S010의 하위 Scene이 아니라 독립 Screen으로 관리한다.

```text
S012_BagCheck
```

---

## 8. 수준별 화면 관리 원칙

AI 출근 시뮬레이터는 가/나/다 수준별로 UI와 정보량이 다르다.

### 가수준

- 가장 많은 정보 제공
- 직접 판단 중심
- 선택지 다양
- 오답 후 재도전 가능

### 나수준

- 핵심 정보 중심
- 아이콘과 큰 글씨 병행
- 선택지 축소
- 힌트 제공

### 다수준

- 큰 버튼
- 짧은 문장
- TTS 중심
- 한 화면 한 행동
- 오답 선택지 최소화

캡처/QA 방식:

```text
S007_AlarmSet_Ga
S007_AlarmSet_Na
S007_AlarmSet_Da
```

---

## 9. Codex 작업 시 화면 수정 규칙

```text
이번 작업은 S006_EveBag 기능 연결 복구만 진행합니다.

반드시 다음 문서를 먼저 읽어주세요.
1. AI_COMMUTE_SCREEN_FLOW.md
2. AI_COMMUTE_UI_SYSTEM.md
3. PROJECT_GUIDE_AND_REVISION.md
4. BON_HIGHLEE_SIMULATOR_PLAN.md

수정 범위:
- S006_EveBag
- S005에서 S006으로 이동하는 연결
- S006에서 S007로 이동하는 연결
- S012_BagCheck에 전날 가방 상태가 반영되는 부분

수정 금지:
- S007 이후 흐름
- S010 MorningPrep 디자인
- S016 BusInside 디자인
- 결과 판정 로직
- 관리자 화면
```

---

## 10. 현재 우선순위

### P0

```text
S006_EveBag 기능 연결 복구
S004_AIInput 디자인 톤 보정
S005_AIResult 디자인 톤 보정
```

### P1

```text
S020_Result 결과 화면 리디자인
S021_Report 교사용 리포트 UI 보정
```

### P2

```text
S022_Admin 관리자 화면 정리
누락 화면 캡처 보완
수준별 가/나/다 차이 QA
```

---

## 11. 향후 확장 메모

현재 목적지는 본앤하이리 하나이지만, 장기적으로는 3~5개 목적지 데이터로 확장한다.

향후 목적지 데이터에 포함될 항목:

```text
목적지 이름
도착 목표 시간
출발 정류장
도착 정류장
버스 번호
헷갈리는 버스 번호
이동 시간
하차 후 도보 시간
필수 준비물
상황별 준비물
오늘의 미션
도착 후 활동
결과 메시지
```

이 확장은 현재 마감 이후 작업한다.  
현재 우선순위는 화면 흐름 안정화, 디자인 시스템 정리, 제출 준비이다.

---

## 12. 현재 결론

현재 AI 출근 시뮬레이터는 기능 구현 단계에서 마감 폴리싱 단계로 넘어왔다.

앞으로의 핵심은 다음과 같다.

```text
기능 추가보다 흐름 안정화
새 디자인보다 기존 디자인 시스템 재사용
화면별 수정보다 화면 번호 기준 수정
본앤하이리는 제품명이 아니라 첫 번째 시나리오 데이터
```
