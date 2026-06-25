# AI_COMMUTE_COMPONENT_LIBRARY.md
> AI 출근 시뮬레이터 공통 UI 컴포넌트 라이브러리 v1.1  
> 기준 화면: S010_MorningPrep

---

## 0. 목적

이 문서는 프로젝트 전체에서 재사용해야 하는 UI 부품을 정의한다.

원칙:

```text
새로 만들기보다 재사용한다.
화면마다 다르게 만들지 않는다.
S010_MorningPrep의 컴포넌트를 우선 기준으로 삼는다.
```

---

## 1. Core Layout Components

### C001_GameScreenLayout

용도:

```text
게임형 화면의 기본 레이아웃
```

구조:

```text
배경 이미지
상단 HUD
중앙 캐릭터 영역
말풍선
하단 행동 버튼 영역
```

사용 화면:

```text
S006, S007, S009, S010, S012, S016, S017, S019
```

---

### C002_CharacterCenterStage

용도:

```text
캐릭터를 화면 중앙에 배치하는 영역
```

규칙:

- 캐릭터는 화면의 중심 시각 요소이다.
- 캐릭터는 버튼보다 먼저 보여야 한다.
- 캐릭터는 배경과 분리되도록 그림자 또는 하이라이트를 가진다.

대표 기준:

```text
S010_MorningPrep
```

---

### C003_ActionButtonZone

용도:

```text
학생이 선택할 행동 버튼을 배치하는 영역
```

규칙:

- 2~5개의 큰 버튼을 배치한다.
- 다수준은 1~2개로 줄일 수 있다.
- 버튼은 항상 손쉽게 클릭 가능한 크기여야 한다.

대표 기준:

```text
S010_MorningPrep 하단 행동 버튼
```

---

## 2. HUD Components

### C010_TimeStatusHUD

용도:

```text
현재 시간, 목표 시간, 남은 시간, 위험 상태 표시
```

사용 화면:

```text
S010_MorningPrep
S012_BagCheck
S016_BusInside
S017_Alighting
```

포함 정보:

```text
현재 시간
출근 시간
남은 시간
다음 버스
```

---

### C011_MissionHUD

용도:

```text
현재 단계의 미션 또는 목표 표시
```

예:

```text
아침 준비하기
가방 확인하기
200번 버스 타기
```

---

## 3. Character Components

### C020_MainCharacter

용도:

```text
학생 캐릭터 표시
```

규칙:

- 남학생/여학생 캐릭터 확장 가능
- 표정은 밝고 친근하게 유지
- 생활 장면에 맞는 복장 적용 가능

---

### C021_CharacterSpeechBubble

용도:

```text
캐릭터 또는 AI 코치의 짧은 안내 문구
```

규칙:

- 1~2줄 이하
- 20자 안팎
- TTS 연결 가능
- 행동 유도형 문장 사용

예:

```text
뭘 할까요?
알람을 맞춰요.
이제 출발해요.
```

---

## 4. Button Components

### C030_GamePrimaryButton

용도:

```text
주요 진행 버튼
```

예:

```text
출근 시작하기
확인
다음
출발하기
```

규칙:

- 가장 눈에 잘 띄는 색
- 둥근 모서리
- 그림자
- 큰 글씨
- 아이콘 포함 가능

---

### C031_ActionButton

용도:

```text
학생 행동 선택 버튼
```

예:

```text
샤워하기
밥 먹기
양치하기
옷 입기
벨 누르기
```

규칙:

- 행동 동사로 작성
- 아이콘 + 텍스트
- 버튼 텍스트 2줄 이하

대표 기준:

```text
S010_MorningPrep
```

---

### C032_ChoiceButton

용도:

```text
둘 중 하나를 선택하는 버튼
```

예:

```text
네
아니오
바로 일어나기
10분 더 자기
```

사용 화면:

```text
S009_WakeupAlarm
S017_Alighting
```

---

## 5. Card Components

### C040_InfoCard

용도:

```text
출근 정보, 버스 정보, 준비물 정보 표시
```

규칙:

- 흰색 또는 밝은 배경
- 둥근 모서리
- 정보는 짧게
- 아이콘과 키워드 중심

---

### C041_TimeCard

용도:

```text
시간 관련 정보 표시
```

예:

```text
현재 시간
출근 시간
추천 출발 시간
버스 도착 시간
```

---

### C042_ItemCard

용도:

```text
가방에 넣을 준비물 표시
```

예:

```text
교통카드
휴대폰
물병
우산
손선풍기
```

---

## 6. Modal / Popup Components

### C050_GameModal

용도:

```text
게임 진행 중 선택 또는 확인 팝업
```

예:

```text
학생 선택 확인
아침 활동 완료
하차 여부 확인
```

규칙:

- 배경을 너무 어둡게 하지 않는다.
- 팝업은 크고 명확하게 만든다.
- 버튼은 1~2개 중심으로 배치한다.

---

### C051_ActionCompletePopup

용도:

```text
아침 활동 완료 후 시간 증가 안내
```

예:

```text
샤워를 했어요!
+15분
현재 시각 08:15
```

사용 Scene:

```text
SC10-01_Shower
SC10-02_Breakfast
SC10-03_Toothbrush
SC10-04_Dress
```

---

## 7. Bag Components

### C060_BagSlot

용도:

```text
가방 안에 들어간 물건 표시
```

규칙:

- 최소 6칸 이상
- 빈 슬롯과 채워진 슬롯이 명확히 구분되어야 한다.

---

### C061_BagReviewPanel

용도:

```text
출발 전 가방 확인 영역
```

사용 화면:

```text
S012_BagCheck
```

---

## 8. Bus Components

### C070_BusInteriorScene

용도:

```text
버스 내부 이동 화면
```

대표 기준:

```text
S016_BusInside
```

---

### C071_StopNameDisplay

용도:

```text
현재 정류장 이름 표시
```

규칙:

- 현재 정류장은 크고 명확하게 표시한다.
- 가수준은 실시간 텍스트 변화 중심
- 나/다수준은 팝업 또는 안내형으로 단순화 가능

---

### C072_BellButton

용도:

```text
하차벨 누르기
```

사용 화면:

```text
S017_Alighting
```

규칙:

- 버튼은 매우 크게
- 빨간색 또는 주의 색상 사용 가능
- 누르는 행동이 명확해야 한다.

---

## 9. Result Components

### C080_ResultHero

용도:

```text
성공/지각/실패 결과를 크게 보여주는 중심 영역
```

보정 대상:

```text
S020_Result
```

---

### C081_StarRatingCard

용도:

```text
별점 또는 성취도 표시
```

---

### C082_TeacherReportButton

용도:

```text
교사용 리포트 진입 버튼
```

규칙:

- 학생용 결과 화면에서는 보조 버튼으로 배치한다.
- 결과보다 먼저 시선을 빼앗지 않는다.

---

## 10. Component 사용 원칙

새 화면을 만들 때 순서:

```text
1. 기존 Component로 만들 수 있는지 확인
2. S010의 구조와 맞는지 확인
3. 필요한 경우에만 새 Component 추가
4. 새 Component는 이 문서에 등록
```

---

## 11. 금지 사항

- 같은 기능의 버튼을 화면마다 다르게 만들지 않는다.
- 기본 HTML 버튼 스타일을 그대로 사용하지 않는다.
- 카드와 버튼의 모서리, 그림자, 폰트 크기를 임의로 바꾸지 않는다.
- 학생 화면에 관리자 UI 스타일을 섞지 않는다.
- 본앤하이리를 제품명처럼 보이게 하는 컴포넌트명을 만들지 않는다.

---

## 12. 현재 핵심 기준

현재 가장 중요한 컴포넌트 기준은 다음이다.

```text
C001_GameScreenLayout
C002_CharacterCenterStage
C003_ActionButtonZone
C010_TimeStatusHUD
C021_CharacterSpeechBubble
C031_ActionButton
```

이 컴포넌트들은 S010_MorningPrep을 기준으로 정의한다.
