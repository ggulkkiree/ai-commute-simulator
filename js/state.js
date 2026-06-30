// ============================================================
// state.js — 핵심 상태 관리 모듈
// 본앤하이리 출근 마스터 시뮬레이터
// ============================================================

// 출근 시간관리 중앙 설정
var commuteConfig = {
  allowedWorkStartTimes: [540, 600, 780], // 09:00, 10:00, 13:00
  busInterval: 10,
  walkToStopMinutes: 10,
  busRideMinutes: 30,
  walkToWorkMinutes: 10,
  taxiRideMinutes: 20,
  transitCardReturnMinutes: 20,
  fullMorningRoutineMinutes: 47,
  alarmBufferMinutes: 10
};

// 앞으로 각 화면이 함께 참조할 중앙 데이터 정의
var studentDataConfig = {
  maxStudents: 5,
  levels: {
    '가': { key: 'ga', label: '가 수준' },
    '나': { key: 'na', label: '나 수준' },
    '다': { key: 'da', label: '다 수준' }
  },
  characters: {
    boy: { key: 'boy', gender: '남자', emoji: '🧑' },
    girl: { key: 'girl', gender: '여자', emoji: '👩' }
  }
};

var itemCatalog = {
  transitCard: { name: '교통카드', icon: '💳', location: 'home', category: 'base' },
  phone: { name: '스마트폰', icon: '📱', location: 'home', category: 'base' },
  waterBottle: { name: '물병', icon: '🧴', location: 'home', category: 'base' },
  umbrella: { name: '우산', icon: '🌂', location: 'home', category: 'weather' },
  handFan: { name: '손선풍기', icon: '🌬️', location: 'home', category: 'weather' },
  gloves: { name: '장갑', icon: '🧤', location: 'home', category: 'weather' },
  outerwear: { name: '겉옷', icon: '🧥', location: 'home', category: 'weather' },
  mask: { name: '마스크', icon: '😷', location: 'home', category: 'weather' },

  nameBadge: { name: '명찰', icon: '📛', location: 'workplace', category: 'work' },
  hat: { name: '모자', icon: '🧢', location: 'workplace', category: 'work' },
  apron: { name: '앞치마', icon: '🥼', location: 'workplace', category: 'work' },
  workGloves: { name: '작업장갑', icon: '🧤', location: 'workplace', category: 'work' },
  workClothes: { name: '작업복', icon: '👔', location: 'workplace', category: 'work' },
  farmTools: { name: '농장도구', icon: '🧰', location: 'workplace', category: 'work' },
  cafeTools: { name: '카페도구', icon: '☕', location: 'workplace', category: 'work' },
  workTools: { name: '작업도구', icon: '🛠️', location: 'workplace', category: 'work' }
};

var homeItemRules = {
  base: ['transitCard', 'phone', 'waterBottle'],
  rainy: ['umbrella'],
  cold: ['gloves', 'outerwear'],
  icy: ['gloves', 'outerwear'],
  snowy: ['gloves', 'outerwear'],
  hot: ['handFan'],
  dusty: ['mask'],
  sick: ['mask'],
  clear: []
};

var dutyWorkplaceItemRules = {
  water_plants: ['workGloves', 'farmTools'],
  garden: ['workGloves', 'farmTools'],
  harvest: ['workGloves', 'farmTools'],
  feed_animals: ['workClothes', 'workGloves', 'farmTools'],
  bread: ['apron', 'cafeTools'],
  cups: ['apron', 'cafeTools'],
  cleaning: ['apron', 'workGloves', 'workTools'],
  packages: ['workGloves', 'workTools']
};

var morningActivityCatalog = [
  {
    id: 'shower',
    label: '샤워하기',
    minutes: 15,
    requiredFor: ['나', '다'],
    availableFor: ['가', '나', '다'],
    feedbackTag: 'no_shower'
  },
  {
    id: 'eat',
    label: '밥 먹기',
    minutes: 20,
    requiredFor: ['나', '다'],
    availableFor: ['가', '나', '다'],
    feedbackTag: 'no_breakfast'
  },
  {
    id: 'brush',
    label: '양치하기',
    minutes: 5,
    requiredFor: ['나', '다'],
    availableFor: ['가', '나', '다'],
    feedbackTag: 'no_toothbrush'
  },
  {
    id: 'dress',
    label: '옷 입기',
    minutes: 5,
    requiredFor: ['나', '다'],
    availableFor: ['가', '나', '다'],
    feedbackTag: 'wrong_clothes'
  },
  {
    id: 'sns',
    label: '스마트폰 보기',
    minutes: 10,
    requiredFor: [],
    availableFor: ['가'],
    levelOnly: ['가'],
    feedbackTag: 'smartphone_delay'
  }
];

var feedbackPriority = [
  'commute_failed',
  'late',
  'wrong_bus_number',
  'missed_bell',
  'wrong_destination',
  'overslept',
  'smartphone_delay',
  'missing_weather_item',
  'no_breakfast',
  'no_shower',
  'no_toothbrush',
  'wrong_clothes',
  'bag_missing_item'
];

var resultTypeCatalog = {
  success: { key: 'success', label: '출근 성공' },
  late: { key: 'late', label: '지각' },
  fail: { key: 'fail', label: '출근 실패' },
  incomplete: { key: 'incomplete', label: '준비 부족', legacy: true }
};

var feedbackCatalog = {
  commute_failed: {
    difficulty: '출근 이동을 끝까지 완료하는 데 어려움이 있었어요.',
    teachingPoint: '출근 이동 순서를 한 단계씩 다시 연습해요.'
  },
  late: {
    difficulty: '출근 시간에 맞춰 도착하는 데 어려움이 있었어요.',
    teachingPoint: '현재 시간과 버스 시간을 함께 확인하는 연습이 필요해요.'
  },
  wrong_bus_number: {
    difficulty: '버스 번호를 고르는 데 어려움이 있었어요.',
    teachingPoint: '200번 버스 번호를 다시 확인하는 연습이 필요해요.'
  },
  missed_bell: {
    difficulty: '내릴 정류장에서 하차벨을 누르는 데 어려움이 있었어요.',
    teachingPoint: '현재 정류장과 다음 정류장을 확인하는 연습이 필요해요.'
  },
  wrong_destination: {
    difficulty: '버스에서 내린 뒤 목적지를 찾는 데 어려움이 있었어요.',
    teachingPoint: '본앤하이리 간판과 길 안내를 확인하는 연습이 필요해요.'
  },
  smartphone_delay: {
    difficulty: '스마트폰을 보며 출발 준비 시간이 늦어졌어요.',
    teachingPoint: '출근 준비를 마친 뒤 스마트폰을 사용하는 연습이 필요해요.'
  },
  overslept: {
    difficulty: '알람 후 바로 일어나는 데 어려움이 있었어요.',
    teachingPoint: '알람이 울리면 바로 일어나는 연습이 필요해요.'
  },
  no_breakfast: {
    difficulty: '아침 식사를 하지 않고 출발했어요.',
    teachingPoint: '출근 전 식사 시간을 계획하는 연습이 필요해요.'
  },
  no_shower: {
    difficulty: '출근 전 씻는 활동을 빠뜨렸어요.',
    teachingPoint: '아침 준비 순서를 확인하는 연습이 필요해요.'
  },
  no_toothbrush: {
    difficulty: '출근 전 양치 활동을 빠뜨렸어요.',
    teachingPoint: '아침 위생 활동을 순서대로 확인하는 연습이 필요해요.'
  },
  wrong_clothes: {
    difficulty: '날씨와 출근 상황에 맞는 옷을 준비하는 데 어려움이 있었어요.',
    teachingPoint: '날씨를 보고 알맞은 옷을 고르는 연습이 필요해요.'
  },
  bag_missing_item: {
    difficulty: '출발 전 가방에서 빠진 물건을 발견했어요.',
    teachingPoint: '전날과 출발 직전에 가방 물건을 확인하는 연습이 필요해요.'
  },
  missing_weather_item: {
    difficulty: '날씨에 필요한 물건을 챙기는 데 어려움이 있었어요.',
    teachingPoint: '날씨와 준비물을 연결하여 확인하는 연습이 필요해요.'
  }
};

var busTrainingConfig = {
  correctStop: {
    id: 'stop_correct',
    name: '전주은화학교 방향 정류장',
    direction: '전주은화학교 방향'
  },
  wrongStop: {
    id: 'stop_wrong',
    name: '반대 방향 정류장',
    direction: '반대 방향'
  },
  correctBusNumber: '200',
  distractorBusNumbers: ['999', '119'],
  targetGetOffStop: '본앤하이리 앞',
  routeStops: [
    { id: 'stop_market', name: '중앙시장', minutesFromBoarding: 10 },
    { id: 'stop_terminal', name: '완주터미널', minutesFromBoarding: 20 },
    { id: 'stop_bonhiri', name: '본앤하이리 앞', minutesFromBoarding: 30, target: true }
  ],
  destinations: [
    { id: 'bonhiri', name: '본앤하이리', icon: '🏢', correct: true },
    { id: 'park', name: '동네 공원', icon: '🌳', correct: false },
    { id: 'store', name: '편의점', icon: '🏪', correct: false }
  ]
};

function getLevelKey(level) {
  return studentDataConfig.levels[level] ? studentDataConfig.levels[level].key : 'na';
}

function getCharacterDefinition(character) {
  return studentDataConfig.characters[character] || studentDataConfig.characters.boy;
}

function getCatalogItemNames(keys) {
  var names = [];
  var list = keys || [];
  for (var i = 0; i < list.length; i++) {
    if (itemCatalog[list[i]]) names.push(itemCatalog[list[i]].name);
  }
  return names;
}

function buildHomeItemKeys(weather) {
  return uniqueItemKeys(
    homeItemRules.base.concat(homeItemRules[weather] || [])
  );
}

function buildWorkplaceItemKeys(duties) {
  var keys = [];
  var list = duties || [];
  for (var i = 0; i < list.length; i++) {
    keys = keys.concat(dutyWorkplaceItemRules[list[i].id] || ['workTools']);
  }
  return uniqueItemKeys(keys);
}

function createDefaultHomeBagItems(weather) {
  var requiredKeys = buildHomeItemKeys(weather);
  var result = {};
  var keys = Object.keys(itemCatalog);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var item = itemCatalog[key];
    if (item.location !== 'home') continue;
    result[key] = {
      name: item.name,
      icon: item.icon,
      checked: false,
      required: requiredKeys.indexOf(key) > -1,
      category: item.category
    };
  }
  return result;
}

function createBusInfo(workStartTime) {
  var target = workStartTime || 540;
  var arrivalTimes = [];
  for (var t = target - 60; t <= target - 20; t += commuteConfig.busInterval) {
    arrivalTimes.push(t);
  }
  return {
    correctStop: {
      id: busTrainingConfig.correctStop.id,
      name: busTrainingConfig.correctStop.name,
      direction: busTrainingConfig.correctStop.direction,
      walkMinutesFromHome: commuteConfig.walkToStopMinutes
    },
    wrongStop: {
      id: busTrainingConfig.wrongStop.id,
      name: busTrainingConfig.wrongStop.name,
      direction: busTrainingConfig.wrongStop.direction,
      walkMinutesFromHome: commuteConfig.walkToStopMinutes
    },
    correctBusNumber: busTrainingConfig.correctBusNumber,
    distractorBusNumbers: busTrainingConfig.distractorBusNumbers.slice(),
    busArrivalTimes: arrivalTimes,
    busArrivalTime: target - 50,
    latestOnTimeBusTime: target - 40,
    rideMinutes: commuteConfig.busRideMinutes,
    targetGetOffStop: busTrainingConfig.targetGetOffStop,
    walkMinutesAfterBus: commuteConfig.walkToWorkMinutes,
    routeStops: busTrainingConfig.routeStops.map(function(stop) {
      return {
        id: stop.id,
        name: stop.name,
        minutesFromBoarding: stop.minutesFromBoarding,
        target: !!stop.target
      };
    }),
    destinations: busTrainingConfig.destinations.map(function(destination) {
      return {
        id: destination.id,
        name: destination.name,
        icon: destination.icon,
        correct: destination.correct
      };
    })
  };
}

function createMorningActivitiesState() {
  return morningActivityCatalog.map(function(activity) {
    return {
      id: activity.id,
      label: activity.label,
      minutes: activity.minutes,
      requiredFor: activity.requiredFor.slice(),
      availableFor: activity.availableFor.slice(),
      levelOnly: activity.levelOnly ? activity.levelOnly.slice() : [],
      feedbackTag: activity.feedbackTag,
      completed: false
    };
  });
}

function createCommuteRecord() {
  return {
    selectedStopId: null,
    stopMistakes: 0,
    selectedBusNumber: null,
    busNumberMistakes: 0,
    pressedBellAtCorrectStop: false,
    bellMistakes: 0,
    selectedDestinationCorrectly: false,
    destinationMistakes: 0,
    transitCardChecked: false,
    transitCardReturnEvent: {
      occurred: false,
      extraMinutes: 0,
      resolved: false
    },
    choiceLog: []
  };
}

function createFeedbackState() {
  return {
    priority: feedbackPriority.slice(),
    candidates: [],
    primaryTag: null,
    primaryMessage: '',
    retryMessage: ''
  };
}

function createTeacherReportState() {
  return {
    mainDifficulty: '',
    nextTeachingPoint: '',
    primaryFeedbackTag: null,
    detailLogs: []
  };
}

// 전역 게임 상태 객체
var gameState = {
  student: {
    id: null,
    name: '',
    level: '나',
    levelKey: 'na',
    emoji: '😊',
    avatar: '😊',
    gender: '남자',
    character: 'boy'
  },
  startTime: 420,   // 시작 시각 (07:00)
  time: {
    current: 420,    // 07:00 (분 단위)
    target: 540,
    deadline: 550
  },
  todayInfo: {
    workStartTime: 540,
    workplace: '본앤하이리',
    weather: 'clear',
    duties: [],
    homeItemKeys: ['transitCard', 'phone', 'waterBottle'],
    homeItems: ['교통카드', '스마트폰', '물병'],
    workplaceItemKeys: [],
    workplaceItems: [],
    requiredItemKeys: ['transitCard', 'phone', 'waterBottle'],
    requiredItems: ['교통카드', '스마트폰', '물병'],
    caution: '오늘 출근 시간과 버스 시간을 잘 확인하세요.'
  },
  busInfo: createBusInfo(540),
  homeBag: createDefaultHomeBagItems('clear'),
  bag: {
    workClothes: { name: '작업복', icon: '👔', checked: false, required: true, points: 25 },
    backpack:    { name: '가방',   icon: '🎒', checked: false, required: false, points: 25 },
    umbrella:    { name: '우산',   icon: '🌂', checked: false, required: false, points: 15 },
    waterBottle: { name: '물병',   icon: '🧴', checked: false, required: false, points: 15 },
    nameBadge:   { name: '명찰',   icon: '📛', checked: false, required: true, points: 10 },
    gloves:      { name: '장갑',   icon: '🧤', checked: false, required: false, points: 15 },
    apron:       { name: '앞치마', icon: '🥼', checked: false, required: false, points: 15 },
    outerwear:   { name: '겉옷',   icon: '🧥', checked: false, required: false, points: 15 }
  },
  flags: {
    weatherChecked: false,
    transitCardChecked: false,
    briefingChecked: false,
    busInfoChecked: false,
    aiPlanCompleted: false,
    morningPrepCompleted: false
  },
  weather: 'clear',     // rainy, hot, icy, clear
  actionLog: [],        // { time, action, consequence, timeCost, icon }
  currentPhase: 'wake_up',  // wake_up, prepare, commute, arrival
  phaseProgress: { wake_up: 0, prepare: 0, commute: 0 },
  scenarioHistory: [],
  reflections: [],       // 최종 선택된 반성 항목들
  todayDuties: [],       // 오늘의 직무 미션들
  plan: {
    departureTime: 480,  // 계획한 집 출발 시각 (기본값 08:00)
    items: []            // 계획한 준비물 목록
  },
  currentStage: 1,        // 현재 진행 중인 시나리오 단계 (1~9)
  day: 0,
  phase: 'idle',
  resultSaved: false,
  evePrep: {
    alarmTime: null,     // 설정한 알람 시각 (분)
    bagPacked: [],       // 전날 미리 가방에 챙긴 아이템 목록
    busChecked: false    // 버스 시간 확인 여부
  },
  morningPrep: {
    wokeUpEarly: true,   // 바로 일어났는지 여부 (10분 더 자기 안 했는지)
    routinesDone: [],    // 이전 화면과 결과 판정을 위한 호환 필드
    completedActivities: [],
    skippedActivities: [],
    outfitChoice: null,
    outfitCorrect: null,
    bagChecked: false,
    bagMissingItems: [],
    feedbackCandidates: []
  },
  morningActivities: createMorningActivitiesState(),
  commuteRecord: createCommuteRecord(),
  feedback: createFeedbackState(),
  teacherReport: createTeacherReportState(),
  commute: {
    wakeTime: null,
    homeDepartureTime: null,
    stopArrivalTime: null,
    busBoardingTime: null,
    arrivalTime: null,
    estimatedArrivalTime: null,
    transportMode: 'bus',
    missedBusTimes: [],
    record: null
  }
};

gameState.commute.record = gameState.commuteRecord;

/**
 * 게임 초기화 — 학생 정보를 받아 gameState를 리셋한다.
 * @param {Object} student - { id, name, level }
 */
function initGame(student) {
  student = student || {};
  var character = student.character || (student.gender === '여자' ? 'girl' : 'boy');
  var characterInfo = getCharacterDefinition(character);
  var studentAvatarKey = student.avatar || '';
  var studentEmoji = typeof getStudentFallbackEmoji === 'function'
    ? getStudentFallbackEmoji(student)
    : (student.emoji || characterInfo.emoji);
  gameState.student = {
    id: student.id !== undefined && student.id !== null ? student.id : null,
    name: student.name || '',
    level: student.level || '나',
    levelKey: student.levelKey || getLevelKey(student.level || '나'),
    emoji: studentEmoji,
    avatar: studentAvatarKey,
    gender: student.gender || characterInfo.gender,
    character: characterInfo.key
  };

  gameState.startTime = 420;
  gameState.time = {
    current: 420,
    target: 540,
    deadline: 550
  };

  // 날씨 무작위 설정 (rainy, hot, icy, cold, clear)
  var weatherOptions = ['rainy', 'hot', 'icy', 'cold', 'clear'];
  var randomWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
  gameState.weather = randomWeather;

  gameState.bag = createDefaultBagItems();

  gameState.flags = {
    weatherChecked: false,
    transitCardChecked: false,
    briefingChecked: false,
    busInfoChecked: false,
    aiPlanCompleted: false,
    morningPrepCompleted: false
  };

  gameState.actionLog = [];
  gameState.currentPhase = 'wake_up';
  gameState.phaseProgress = { wake_up: 0, prepare: 0, commute: 0 };
  gameState.scenarioHistory = [];
  gameState.reflections = [];
  gameState.todayDuties = [];
  gameState.todayInfo = {
    workStartTime: 540,
    workplace: '본앤하이리',
    weather: randomWeather,
    duties: [],
    homeItemKeys: buildHomeItemKeys(randomWeather),
    homeItems: getCatalogItemNames(buildHomeItemKeys(randomWeather)),
    workplaceItemKeys: [],
    workplaceItems: [],
    requiredItemKeys: buildHomeItemKeys(randomWeather),
    requiredItems: getCatalogItemNames(buildHomeItemKeys(randomWeather)),
    caution: '오늘 출근 시간과 버스 시간을 잘 확인하세요.'
  };
  gameState.busInfo = createBusInfo(540);
  gameState.homeBag = createDefaultHomeBagItems(randomWeather);
  gameState.plan = { departureTime: 480, items: [] };
  gameState.currentStage = 1;
  gameState.day = 0;
  gameState.phase = 'idle';
  gameState.resultSaved = false;
  
  // 신규 전날 저녁 및 아침 루틴 상태 초기화
  gameState.evePrep = {
    alarmTime: null,
    bagPacked: [],
    busChecked: false
  };
  gameState.morningPrep = {
    wokeUpEarly: true,
    routinesDone: [],
    completedActivities: [],
    skippedActivities: [],
    outfitChoice: null,
    outfitCorrect: null,
    bagChecked: false,
    bagMissingItems: [],
    feedbackCandidates: []
  };
  gameState.morningActivities = createMorningActivitiesState();
  gameState.commuteRecord = createCommuteRecord();
  gameState.feedback = createFeedbackState();
  gameState.teacherReport = createTeacherReportState();
  gameState.commute = {
    wakeTime: null,
    homeDepartureTime: null,
    stopArrivalTime: null,
    busBoardingTime: null,
    arrivalTime: null,
    estimatedArrivalTime: null,
    transportMode: 'bus',
    missedBusTimes: [],
    record: gameState.commuteRecord
  };
}

function createDefaultBagItems() {
  return {
    workClothes: { name: '작업복', icon: '👔', checked: false, required: true, points: 25 },
    backpack:    { name: '가방',   icon: '🎒', checked: false, required: false, points: 0 },
    umbrella:    { name: '우산',   icon: '🌂', checked: false, required: false, points: 15 },
    waterBottle: { name: '물병',   icon: '🧴', checked: false, required: false, points: 15 },
    nameBadge:   { name: '명찰',   icon: '📛', checked: false, required: true, points: 10 },
    gloves:      { name: '장갑',   icon: '🧤', checked: false, required: false, points: 15 },
    apron:       { name: '앞치마', icon: '🥼', checked: false, required: false, points: 15 },
    outerwear:   { name: '겉옷',   icon: '🧥', checked: false, required: false, points: 15 }
  };
}

function uniqueItemKeys(keys) {
  var seen = {};
  var result = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!key || seen[key]) continue;
    seen[key] = true;
    result.push(key);
  }
  return result;
}

function getWeatherRequiredItemKeys(weather) {
  if (weather === 'rainy') return ['umbrella'];
  if (weather === 'hot') return ['handFan'];
  if (weather === 'icy' || weather === 'cold' || weather === 'snowy') return ['outerwear'];
  return [];
}

function getDutyRequiredItemKeys(duties) {
  var dutyKeys = [];
  var list = duties || [];

  for (var i = 0; i < list.length; i++) {
    var id = list[i].id;
    if (id === 'water_plants' || id === 'garden' || id === 'harvest' || id === 'feed_animals') {
      dutyKeys.push('gloves');
    }
    if (id === 'bread' || id === 'cups') {
      dutyKeys.push('apron');
    }
    if (id === 'cleaning') {
      dutyKeys.push('gloves');
      dutyKeys.push('apron');
    }
  }

  return uniqueItemKeys(dutyKeys);
}

function buildRequiredItemKeys(weather, duties) {
  return buildHomeItemKeys(weather);
}

function getItemNamesByKeys(keys) {
  var names = [];
  for (var i = 0; i < keys.length; i++) {
    if (itemCatalog[keys[i]]) names.push(itemCatalog[keys[i]].name);
    else if (gameState.bag[keys[i]]) names.push(gameState.bag[keys[i]].name);
  }
  return names;
}

/**
 * AI 출근 정보 생성 — 허용된 범위 안에서 오늘의 출근 정보를 만든다.
 * 외부 AI 호출 없이 로컬 규칙으로 생성하되, 역할은 "오늘의 출근 정보" 생성에 한정한다.
 */
function generateTodayCommuteInfo() {
  var allowed = commuteConfig.allowedWorkStartTimes;
  var workStartTime = allowed[Math.floor(Math.random() * allowed.length)];
  var weather = gameState.weather || 'clear';
  var duties = gameState.todayDuties || [];

  var requiredKeys = buildRequiredItemKeys(weather, duties);
  var homeItemKeys = buildHomeItemKeys(weather);
  var workplaceItemKeys = buildWorkplaceItemKeys(duties);
  var caution = '오늘 출근 시간과 버스 시간을 잘 확인하세요.';
  if (weather === 'rainy') {
    caution = '비가 오기 때문에 우산을 챙기는 것이 좋습니다.';
  } else if (weather === 'hot') {
    caution = '날씨가 더우므로 물병과 손선풍기를 챙기고 천천히 이동하세요.';
  } else if (weather === 'icy' || weather === 'cold') {
    caution = '눈길이나 추운 날씨에 대비해 겉옷을 챙기고 천천히 걸으세요.';
  }

  var requiredNames = getItemNamesByKeys(requiredKeys);

  gameState.todayInfo = {
    workStartTime: workStartTime,
    workplace: '본앤하이리',
    weather: weather,
    duties: duties.slice(),
    homeItemKeys: homeItemKeys,
    homeItems: getCatalogItemNames(homeItemKeys),
    workplaceItemKeys: workplaceItemKeys,
    workplaceItems: getCatalogItemNames(workplaceItemKeys),
    requiredItemKeys: requiredKeys,
    requiredItems: requiredNames,
    caution: caution
  };

  gameState.busInfo = createBusInfo(workStartTime);
  gameState.homeBag = createDefaultHomeBagItems(weather);
  applyTodayInfoToState();
  return gameState.todayInfo;
}

/**
 * AI 출근 정보를 실제 판정/준비물 상태에 반영한다.
 */
function applyTodayInfoToState() {
  var info = gameState.todayInfo || {};
  var target = info.workStartTime || 540;

  gameState.time.target = target;
  gameState.time.deadline = target + 10;
  gameState.weather = info.weather || gameState.weather || 'clear';
  gameState.busInfo = createBusInfo(target);

  if (!Array.isArray(info.homeItemKeys) || info.homeItemKeys.length === 0) {
    info.homeItemKeys = buildHomeItemKeys(gameState.weather);
  }
  info.homeItems = getCatalogItemNames(info.homeItemKeys);

  if (!Array.isArray(info.workplaceItemKeys)) {
    info.workplaceItemKeys = buildWorkplaceItemKeys(info.duties || gameState.todayDuties);
  }
  info.workplaceItems = getCatalogItemNames(info.workplaceItemKeys);

  if (!gameState.homeBag) {
    gameState.homeBag = createDefaultHomeBagItems(gameState.weather);
  }
  var homeBagKeys = Object.keys(gameState.homeBag);
  for (var h = 0; h < homeBagKeys.length; h++) {
    var homeKey = homeBagKeys[h];
    gameState.homeBag[homeKey].required = info.homeItemKeys.indexOf(homeKey) > -1;
  }

  var required = info.requiredItemKeys || [];
  if (required.length === 0) {
    required = buildRequiredItemKeys(gameState.weather, gameState.todayDuties);
    info.requiredItemKeys = required;
  }
  var keys = Object.keys(gameState.bag);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    gameState.bag[key].required = required.indexOf(key) > -1;
  }
  gameState.todayInfo.requiredItems = getItemNamesByKeys(required);
}

function getHomeBagItems() {
  var items = [];
  var bag = gameState.homeBag || {};
  var keys = Object.keys(bag);
  for (var i = 0; i < keys.length; i++) {
    var item = bag[keys[i]];
    items.push({
      key: keys[i],
      name: item.name,
      icon: item.icon,
      checked: item.checked,
      required: item.required,
      category: item.category
    });
  }
  return items;
}

function checkHomeItem(itemKey) {
  if (gameState.homeBag && gameState.homeBag[itemKey]) {
    gameState.homeBag[itemKey].checked = true;
    if (itemKey === 'transitCard') {
      gameState.flags.transitCardChecked = true;
      if (gameState.commuteRecord) gameState.commuteRecord.transitCardChecked = true;
    }
  }
}

function markMorningActivityCompleted(activityId) {
  var activities = gameState.morningActivities || [];
  for (var i = 0; i < activities.length; i++) {
    if (activities[i].id === activityId) {
      activities[i].completed = true;
      return activities[i];
    }
  }
  return null;
}

function addCommuteChoiceRecord(type, value, correct) {
  if (!gameState.commuteRecord) gameState.commuteRecord = createCommuteRecord();
  gameState.commuteRecord.choiceLog.push({
    time: gameState.time.current,
    type: type,
    value: value,
    correct: !!correct
  });
}

function addFeedbackCandidate(tag, detail) {
  if (!feedbackCatalog[tag]) return;
  if (!gameState.feedback) gameState.feedback = createFeedbackState();

  var exists = gameState.feedback.candidates.some(function(candidate) {
    return candidate.tag === tag;
  });
  if (!exists) {
    gameState.feedback.candidates.push({
      tag: tag,
      detail: detail || '',
      priority: feedbackPriority.indexOf(tag)
    });
  }
}

function resolvePrimaryFeedback() {
  if (!gameState.feedback) gameState.feedback = createFeedbackState();
  var candidates = gameState.feedback.candidates.slice();
  candidates.sort(function(a, b) {
    var aPriority = a.priority < 0 ? 999 : a.priority;
    var bPriority = b.priority < 0 ? 999 : b.priority;
    return aPriority - bPriority;
  });

  var primary = candidates.length > 0 ? candidates[0] : null;
  gameState.feedback.primaryTag = primary ? primary.tag : null;
  gameState.feedback.primaryMessage = primary && feedbackCatalog[primary.tag]
    ? feedbackCatalog[primary.tag].difficulty
    : '';
  gameState.feedback.retryMessage = primary && feedbackCatalog[primary.tag]
    ? feedbackCatalog[primary.tag].teachingPoint
    : '';

  gameState.teacherReport = {
    mainDifficulty: gameState.feedback.primaryMessage,
    nextTeachingPoint: gameState.feedback.retryMessage,
    primaryFeedbackTag: gameState.feedback.primaryTag,
    detailLogs: []
  };
  var commuteLogs = (gameState.commuteRecord && gameState.commuteRecord.choiceLog)
    ? gameState.commuteRecord.choiceLog
    : [];
  for (var i = 0; i < commuteLogs.length; i++) {
    gameState.teacherReport.detailLogs.push({
      source: 'commute',
      time: commuteLogs[i].time,
      type: commuteLogs[i].type,
      value: commuteLogs[i].value,
      correct: commuteLogs[i].correct
    });
  }
  var actionLogs = gameState.actionLog || [];
  for (var j = 0; j < actionLogs.length; j++) {
    gameState.teacherReport.detailLogs.push({
      source: 'action',
      time: actionLogs[j].time,
      action: actionLogs[j].action,
      consequence: actionLogs[j].consequence,
      timeCost: actionLogs[j].timeCost,
      isOptimal: actionLogs[j].isOptimal
    });
  }

  return primary;
}

function collectFeedbackCandidatesFromState() {
  var judgment = getJudgment();
  var record = gameState.commuteRecord || createCommuteRecord();
  var routines = gameState.morningPrep && Array.isArray(gameState.morningPrep.routinesDone)
    ? gameState.morningPrep.routinesDone
    : [];

  if (judgment === 'fail') addFeedbackCandidate('commute_failed');
  if (judgment === 'late') addFeedbackCandidate('late');
  if (record.busNumberMistakes > 0) addFeedbackCandidate('wrong_bus_number');
  if (record.bellMistakes > 0) addFeedbackCandidate('missed_bell');
  if (record.destinationMistakes > 0) addFeedbackCandidate('wrong_destination');
  if (routines.indexOf('sns') > -1) addFeedbackCandidate('smartphone_delay');
  if (gameState.morningPrep && gameState.morningPrep.wokeUpEarly === false) {
    addFeedbackCandidate('overslept');
  }
  if (routines.indexOf('eat') === -1) addFeedbackCandidate('no_breakfast');
  if (routines.indexOf('shower') === -1) addFeedbackCandidate('no_shower');
  if (routines.indexOf('brush') === -1) addFeedbackCandidate('no_toothbrush');
  if (gameState.morningPrep && Array.isArray(gameState.morningPrep.feedbackCandidates)) {
    gameState.morningPrep.feedbackCandidates.forEach(function(tag) {
      addFeedbackCandidate(tag);
    });
  }

  return resolvePrimaryFeedback();
}

function getWorkStartTime() {
  return (gameState.todayInfo && gameState.todayInfo.workStartTime) || gameState.time.target || 540;
}

function getFailureTime() {
  return getWorkStartTime() + 10;
}

function getBusStartTime() {
  return getWorkStartTime() - 60;
}

function getBusEndTime() {
  return getWorkStartTime() - 20;
}

function roundDownToInterval(minutes, interval) {
  return Math.floor(minutes / interval) * interval;
}

/**
 * 샤워, 식사, 옷 입기, 양치, 가방 확인을 모두 하는 학생 기준 권장 기상 시각.
 * 최신 정시 도착 버스를 타기 위해 집을 나서야 하는 시각에서 전체 루틴과 여유 시간을 뺀다.
 */
function getRecommendedAlarmTime(workStartTime) {
  var target = workStartTime || getWorkStartTime();
  return target - 80;
}

function getAlarmOptionsForWorkStart(workStartTime) {
  var base = getRecommendedAlarmTime(workStartTime);
  return [
    { time: base - 20, label: '여유 있어요', badge: 'green' },
    { time: base, label: '딱 좋아요', badge: 'blue' },
    { time: base + 20, label: '늦을 수 있어요', badge: 'orange' },
    { time: base + 40, label: '너무 늦어요', badge: 'red' }
  ];
}

/**
 * 학생이 출근 계획 단계에서 설정한 계획을 저장한다.
 * @param {number} departureTime - 출발 시각 (분)
 * @param {string[]} items - 선택한 가방 아이템 키 목록
 */
function savePlan(departureTime, items) {
  gameState.plan.departureTime = departureTime;
  gameState.plan.items = items;
}

/**
 * 시간 진행 — 현재 시각에 분 단위를 더한다.
 * @param {number} minutes - 추가할 분 수
 * @returns {number} 갱신된 현재 시각
 */
function advanceTime(minutes) {
  gameState.time.current += minutes;
  return gameState.time.current;
}

/**
 * 가방 아이템 체크 — 해당 아이템을 챙긴 것으로 표시한다.
 * @param {string} itemKey - bag 객체의 키 (예: 'workClothes')
 */
function checkItem(itemKey) {
  if (gameState.bag[itemKey]) {
    gameState.bag[itemKey].checked = true;
  }
  if (gameState.homeBag && gameState.homeBag[itemKey]) {
    checkHomeItem(itemKey);
  }
}

/**
 * 가방 아이템 체크 해제 — 해당 아이템을 챙기지 않은 것으로 표시한다.
 * @param {string} itemKey - bag 객체의 키
 */
function uncheckItem(itemKey) {
  if (gameState.bag[itemKey]) {
    gameState.bag[itemKey].checked = false;
  }
  if (gameState.homeBag && gameState.homeBag[itemKey]) {
    gameState.homeBag[itemKey].checked = false;
    if (itemKey === 'transitCard') {
      gameState.flags.transitCardChecked = false;
      if (gameState.commuteRecord) gameState.commuteRecord.transitCardChecked = false;
    }
  }
}

/**
 * 행동 로그 추가 — 현재 시각 기준으로 행동을 기록한다.
 * @param {string} icon - 이모지 아이콘
 * @param {string} action - 행동 설명
 * @param {string} consequence - 결과/피드백
 * @param {number} timeCost - 소요 시간 (분)
 */
function addLog(icon, action, consequence, timeCost, isOptimal) {
  gameState.actionLog.push({
    time: gameState.time.current,
    icon: icon,
    action: action,
    consequence: consequence,
    timeCost: timeCost,
    isOptimal: isOptimal !== undefined ? isOptimal : true
  });
}

/**
 * 남은 시간 계산 — 목표 시각까지 남은 분 수를 반환한다.
 * 음수일 경우 이미 지각 상태.
 * @returns {number}
 */
function getRemainingTime() {
  return gameState.time.target - gameState.time.current;
}

/**
 * 마감 시한까지 남은 시간 계산
 * @returns {number}
 */
function getDeadlineRemaining() {
  return gameState.time.deadline - gameState.time.current;
}

/**
 * 중앙 버스 시간표 반환 — 출근 목표 1시간 전부터 20분 전까지 10분 간격.
 * @returns {number[]}
 */
function getBusSchedule() {
  var times = [];
  for (var t = getBusStartTime(); t <= getBusEndTime(); t += commuteConfig.busInterval) {
    times.push(t);
  }
  return times;
}

/**
 * 기준 시각 이후 가장 빠른 버스 시각을 반환한다.
 * 정각에 도착하면 해당 버스를 탈 수 있는 것으로 본다.
 * @param {number} currentTime
 * @returns {number}
 */
function getNextBusTime(currentTime) {
  var schedule = getBusSchedule();
  for (var i = 0; i < schedule.length; i++) {
    if (schedule[i] >= currentTime) {
      return schedule[i];
    }
  }
  var last = schedule[schedule.length - 1];
  var extra = Math.ceil((currentTime - last) / commuteConfig.busInterval);
  return last + (extra * commuteConfig.busInterval);
}

/**
 * 집에서 지금 출발했을 때 정류장에서 실제로 탈 수 있는 버스 시각.
 * @param {number} currentTime
 * @returns {number}
 */
function getCatchableBusTime(currentTime) {
  var stopArrivalTime = currentTime + commuteConfig.walkToStopMinutes;
  return getNextBusTime(stopArrivalTime);
}

/**
 * 버스 탑승 시각 기준 최종 도착 시각.
 * @param {number} busTime
 * @returns {number}
 */
function calculateArrivalByBus(busTime) {
  return busTime + commuteConfig.busRideMinutes + commuteConfig.walkToWorkMinutes;
}

/**
 * 지금 집에서 출발할 때의 정류장 도착, 탑승 버스, 최종 도착 정보를 반환한다.
 * @param {number} currentTime
 * @returns {Object}
 */
function calculateArrivalIfDepartNow(currentTime) {
  var stopArrivalTime = currentTime + commuteConfig.walkToStopMinutes;
  var busTime = getNextBusTime(stopArrivalTime);
  var arrivalTime = calculateArrivalByBus(busTime);
  return {
    departureTime: currentTime,
    stopArrivalTime: stopArrivalTime,
    busBoardingTime: busTime,
    arrivalTime: arrivalTime,
    status: getArrivalStatus(arrivalTime)
  };
}

/**
 * 택시를 바로 탔을 때의 도착 정보를 반환한다.
 * @param {number} currentTime
 * @returns {Object}
 */
function calculateTaxiArrival(currentTime) {
  var arrivalTime = currentTime + commuteConfig.taxiRideMinutes;
  return {
    departureTime: currentTime,
    arrivalTime: arrivalTime,
    status: getArrivalStatus(arrivalTime)
  };
}

/**
 * 도착 시각 기준 결과와 아침 화면 위험 상태를 계산한다.
 * @param {number} arrivalTime
 * @returns {Object}
 */
function getArrivalStatus(arrivalTime) {
  var targetTime = getWorkStartTime();
  var failureTime = getFailureTime();
  var diff = targetTime - arrivalTime;

  if (arrivalTime > failureTime) {
    return {
      result: 'fail',
      label: '지각 위험',
      icon: '🔴',
      tone: 'danger',
      minutesFromTarget: diff
    };
  }

  if (arrivalTime > targetTime) {
    return {
      result: 'late',
      label: '지각 위험',
      icon: '🔴',
      tone: 'danger',
      minutesFromTarget: diff
    };
  }

  if (diff >= 10) {
    return {
      result: 'success',
      label: '여유 있음',
      icon: '🟢',
      tone: 'safe',
      minutesFromTarget: diff
    };
  }

  if (diff >= 5) {
    return {
      result: 'success',
      label: '서둘러야 함',
      icon: '🟡',
      tone: 'warning',
      minutesFromTarget: diff
    };
  }

  return {
    result: 'success',
    label: '매우 급함',
    icon: '🟠',
    tone: 'urgent',
    minutesFromTarget: diff
  };
}

/**
 * 아침 준비 화면에 필요한 시간관리 정보를 한 번에 반환한다.
 * @param {number} currentTime
 * @returns {Object}
 */
function getMorningTimeSnapshot(currentTime) {
  var nextBus = getNextBusTime(currentTime);
  var departNow = calculateArrivalIfDepartNow(currentTime);
  return {
    currentTime: currentTime,
    targetTime: getWorkStartTime(),
    nextBusTime: nextBus,
    nextBusRemaining: nextBus - currentTime,
    walkToStopMinutes: commuteConfig.walkToStopMinutes,
    stopArrivalTime: departNow.stopArrivalTime,
    catchableBusTime: departNow.busBoardingTime,
    estimatedArrivalTime: departNow.arrivalTime,
    arrivalStatus: departNow.status
  };
}

/**
 * 특정 시간 범위 동안 학생이 집에 있어 놓친 버스 목록을 반환한다.
 * @param {number} fromTime
 * @param {number} toTime
 * @returns {number[]}
 */
function getMissedBusTimes(fromTime, toTime) {
  var schedule = getBusSchedule();
  var missed = [];
  for (var i = 0; i < schedule.length; i++) {
    if (schedule[i] >= fromTime && schedule[i] < toTime) {
      missed.push(schedule[i]);
    }
  }
  return missed;
}

/**
 * 준비도 백분율 계산 — 오늘 필요한 준비물 점수 기반
 * @returns {number} 0~100 사이의 준비도 퍼센트
 */
function getReadiness() {
  var totalPoints = 0;
  var earnedPoints = 0;

  var bag = gameState.homeBag || {};
  var keys = Object.keys(bag);
  for (var i = 0; i < keys.length; i++) {
    var item = bag[keys[i]];
    if (!item.required) continue;
    totalPoints += item.points || 1;
    if (item.checked) {
      earnedPoints += item.points;
    }
  }

  if (totalPoints === 0) return 0;
  return Math.round((earnedPoints / totalPoints) * 100);
}

/**
 * 필수 아이템 상태 확인
 * @returns {{ allRequired: boolean, missing: string[] }}
 */
function getRequiredItemsStatus() {
  var missing = [];
  var missingKeys = [];
  var requiredItems = [];
  var checkedRequired = 0;
  var bag = gameState.homeBag || {};
  var keys = Object.keys(bag);

  for (var i = 0; i < keys.length; i++) {
    var item = bag[keys[i]];
    if (item.required) {
      requiredItems.push({
        key: keys[i],
        name: item.name,
        icon: item.icon,
        checked: item.checked,
        required: item.required,
        points: item.points
      });
      if (item.checked) {
        checkedRequired++;
      } else {
        missing.push(item.name);
        missingKeys.push(keys[i]);
      }
    }
  }

  return {
    allRequired: missing.length === 0,
    missing: missing,
    missingKeys: missingKeys,
    items: requiredItems,
    total: requiredItems.length,
    checked: checkedRequired
  };
}

function getRequiredBagItems() {
  return getRequiredItemsStatus().items;
}

/**
 * 가방 아이템 목록 반환 — 키 포함
 * @returns {Array<Object>}
 */
function getBagItems() {
  var items = [];
  var keys = Object.keys(gameState.bag);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var item = gameState.bag[key];
    items.push({
      key: key,
      name: item.name,
      icon: item.icon,
      checked: item.checked,
      required: item.required,
      points: item.points,
    });
  }

  return items;
}

/**
 * 최종 판정 — 도착 시각과 가방 상태, 아침 루틴을 기반으로 결과를 판정한다.
 * @returns {'success'|'incomplete'|'late'|'fail'}
 *   - success: 정시 도착 + 필수 아이템 전부 챙김 + 루틴 완료
 *   - incomplete: 정시 도착이지만 필수 아이템 누락
 *   - late: 목표 시각 초과, 마감 시한 이내
 *   - fail: 마감 시한 초과, 혹은 필수 루틴 완전 미달(옷 안 입음 등)
 */
function getJudgment() {
  var current = gameState.time.current;
  var target = getWorkStartTime();
  var deadline = getFailureTime();
  var requiredStatus = getRequiredItemsStatus();

  if (current > deadline) {
    return 'fail'; // 09:10 이후 도착
  }
  if (current > target && current <= deadline) {
    return 'late'; // 09:01~09:10 도착
  }
  if (current <= target && !requiredStatus.allRequired) {
    return 'incomplete';
  }
  return 'success';
}

/**
 * 시각 포맷 변환 — 분 단위를 'HH:MM' 문자열로 변환한다.
 * @param {number} minutes - 분 단위 시각 (예: 420 → '07:00')
 * @returns {string}
 */
function formatTime(minutes) {
  if (typeof minutes !== 'number' || !isFinite(minutes)) {
    return '--:--';
  }
  var hours = Math.floor(minutes / 60);
  var mins = minutes % 60;
  var hh = hours < 10 ? '0' + hours : '' + hours;
  var mm = mins < 10 ? '0' + mins : '' + mins;
  return hh + ':' + mm;
}

/**
 * 게임 완전 리셋 — 모든 상태를 초기값으로 되돌린다.
 */
function resetGame() {
  initGame({ id: null, name: '', level: '나' });
}

/**
 * 현재 페이즈 설정
 * @param {string} phase - 'wake_up' | 'prepare' | 'commute' | 'arrival'
 */
function setPhase(phase) {
  gameState.currentPhase = phase;
}

/**
 * 현재 페이즈의 진행 카운터를 1 증가시킨다.
 */
function incrementPhaseProgress() {
  var phase = gameState.currentPhase;
  if (gameState.phaseProgress[phase] !== undefined) {
    gameState.phaseProgress[phase]++;
  }
}
