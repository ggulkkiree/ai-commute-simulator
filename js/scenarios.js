// ============================================================
//  본앤하이리 출근 마스터 - V9 시나리오 데이터베이스
// ============================================================
//
//  총 9단계 엄격한 순차적 시나리오
//  선택지들은 장단점이 있는 Trade-off 구조로 구성됨
// ============================================================

const CATEGORY = {
  A_WAKE_UP: "A_WAKE_UP",
  B_PREPARE: "B_PREPARE",
  C_COMMUTE: "C_COMMUTE",
  D_ENVIRONMENT: "D_ENVIRONMENT",
  E_SOCIAL: "E_SOCIAL"
};

const PHASE = {
  WAKE_UP: "wake_up",
  PREPARE: "prepare",
  COMMUTE: "commute",
  ARRIVAL: "arrival"
};

const scenarioDB = [
  // ── Stage 1: 기상 ─────────────────────────────────────────
  {
    id: "wake_01",
    category: CATEGORY.A_WAKE_UP,
    phase: PHASE.WAKE_UP,
    sequence: 1,
    timeline: {
      hasTimeline: true,
      initialDelay: 1500, // 1.5s delay before alarm shake
      actionDelay: 1000 // 1s after shake to show choices
    },
    backgroundImage: "assets/images/waking_up.png",
    animationEffect: "fade-in",
    difficulty: 1,
    situation: {
      "가": "아침 알람 소리가 울립니다. 오늘은 본앤하이리에 출근하는 날입니다. 어떻게 하시겠습니까?",
      "나": "알람이 울려요! 오늘은 출근하는 날이에요. 어떻게 할까요?",
      "다": "⏰ 알람이 울려요!"
    },
    icon: "⏰",
    choices: [
      {
        id: "wake_01_a",
        text: {
          "가": "바로 일어나기 (+0분)",
          "나": "바로 일어나기 (+0분)",
          "다": "🌅 바로 일어나기 (+0분)"
        },
        icon: "🌅",
        timeCost: 0,
        consequence: {
          "가": "조금 피곤하지만 늦지 않게 일어났습니다.",
          "나": "조금 피곤하지만 바로 일어났어요.",
          "다": "👍 잘했어요!"
        },
        isOptimal: true
      },
      {
        id: "wake_01_b",
        text: {
          "가": "10분 더 누워있기 (+10분)",
          "나": "10분 더 누워있기 (+10분)",
          "다": "😴 10분 더 누워있기 (+10분)"
        },
        icon: "😴",
        timeCost: 10,
        consequence: {
          "가": "몸은 개운해졌지만 시간이 10분 지체되었습니다.",
          "나": "개운하지만 시간이 줄었어요.",
          "다": "⏳ 시간이 지났어요!"
        },
        isOptimal: false
      }
    ],
    conditions: { minRemainingTime: 0, phase: PHASE.WAKE_UP, requiresWeatherCheck: false, requiresItem: null }
  },

  // ── Stage 2: 씻기 ─────────────────────────────────────────
  {
    id: "prep_wash",
    category: CATEGORY.B_PREPARE,
    phase: PHASE.PREPARE,
    sequence: 2,
    backgroundImage: "assets/images/bg_wash.svg",
    animationEffect: "slide-up",
    difficulty: 1,
    situation: {
      "가": "아침에 일어났습니다. 씻으러 화장실에 갔습니다. 어떻게 씻을까요?",
      "나": "화장실에 왔어요. 어떻게 씻을까요?",
      "다": "🚿 씻을 시간!"
    },
    icon: "🚿",
    choices: [
      {
        id: "prep_wash_a",
        text: {
          "가": "깨끗하게 샤워하기 (+15분)",
          "나": "깨끗하게 샤워하기 (+15분)",
          "다": "🚿 샤워하기 (+15분)"
        },
        icon: "🚿",
        timeCost: 15,
        consequence: {
          "가": "단정하고 깨끗해졌지만 시간이 조금 걸렸습니다.",
          "나": "깨끗해졌지만 시간이 걸렸어요.",
          "다": "✨ 깨끗해요!"
        },
        isOptimal: true
      },
      {
        id: "prep_wash_b",
        text: {
          "가": "세수만 대충 하기 (+5분)",
          "나": "세수만 빨리 하기 (+5분)",
          "다": "💦 세수만 하기 (+5분)"
        },
        icon: "💦",
        timeCost: 5,
        consequence: {
          "가": "시간은 아꼈지만 직장에서 단정해 보이지 않을 수 있습니다.",
          "나": "빠르지만 단정하지 않아요.",
          "다": "🏃 빠르지만 꼬질!"
        },
        isOptimal: false
      }
    ],
    conditions: { minRemainingTime: 0, phase: PHASE.PREPARE, requiresWeatherCheck: false, requiresItem: null }
  },

  // ── Stage 3: 아침 식사 ─────────────────────────────────────────
  {
    id: "prep_01",
    category: CATEGORY.B_PREPARE,
    phase: PHASE.PREPARE,
    sequence: 3,
    backgroundImage: "assets/images/bg_breakfast.svg",
    animationEffect: "zoom-in",
    difficulty: 1,
    situation: {
      "가": "식탁 위에 아침밥이 차려져 있습니다. 어떻게 하시겠습니까?",
      "나": "아침밥이 차려져 있어요. 어떻게 할까요?",
      "다": "🍚 아침밥 시간이에요!"
    },
    icon: "🍚",
    choices: [
      {
        id: "prep_01_a",
        text: {
          "가": "든든하게 다 먹기 (+20분)",
          "나": "든든하게 다 먹기 (+20분)",
          "다": "🍳 다 먹기 (+20분)"
        },
        icon: "🍳",
        timeCost: 20,
        consequence: {
          "가": "배가 든든해졌지만 밥 먹는 데 시간이 많이 걸렸습니다.",
          "나": "든든하지만 시간이 많이 걸렸어요.",
          "다": "😋 든든해요!"
        },
        isOptimal: true
      },
      {
        id: "prep_01_b",
        text: {
          "가": "우유 한 잔만 먹기 (+5분)",
          "나": "우유만 마시기 (+5분)",
          "다": "🥛 우유만 마시기 (+5분)"
        },
        icon: "🥛",
        timeCost: 5,
        consequence: {
          "가": "배는 조금 고프지만 밥 먹는 시간을 절약했습니다.",
          "나": "조금 배고프지만 시간을 절약했어요.",
          "다": "🏃 시간 절약!"
        },
        isOptimal: true
      }
    ],
    conditions: { minRemainingTime: 0, phase: PHASE.PREPARE, requiresWeatherCheck: false, requiresItem: null }
  },

  // ── Stage 4: 옷 입기 ─────────────────────────────────────────
  {
    id: "prep_dress",
    category: CATEGORY.B_PREPARE,
    phase: PHASE.PREPARE,
    sequence: 4,
    backgroundImage: "assets/images/bg_prepare_generic.svg",
    animationEffect: "fade-in",
    difficulty: 1,
    situation: {
      "가": "외출 준비를 해야 합니다. 옷을 어떻게 입을까요?",
      "나": "옷을 갈아입을 시간이에요.",
      "다": "👕 옷 입기!"
    },
    icon: "👕",
    choices: [
      {
        id: "prep_dress_a",
        text: {
          "가": "미리 정해둔 작업복 바로 입기 (+5분)",
          "나": "작업복 바로 입기 (+5분)",
          "다": "👕 바로 입기 (+5분)"
        },
        icon: "👕",
        timeCost: 5,
        consequence: {
          "가": "시간을 아끼며 깔끔하게 옷을 갈아입었습니다.",
          "나": "빨리 옷을 갈아입었어요.",
          "다": "👍 빨라요!"
        },
        isOptimal: true
      },
      {
        id: "prep_dress_b",
        text: {
          "가": "어떤 옷을 입을지 옷장에서 한참 고르기 (+15분)",
          "나": "옷을 한참 고르기 (+15분)",
          "다": "🤔 옷 고르기 (+15분)"
        },
        icon: "🤔",
        timeCost: 15,
        consequence: {
          "가": "원하는 옷은 입었지만 시간을 많이 썼습니다.",
          "나": "마음에 들지만 시간이 늦어졌어요.",
          "다": "⏳ 늦어졌어요!"
        },
        isOptimal: false
      }
    ],
    conditions: { minRemainingTime: 0, phase: PHASE.PREPARE, requiresWeatherCheck: false, requiresItem: null }
  },

  // ── Stage 5: 가방 싸기 (더미) ──────────────────────────────────
  {
    id: "prep_packing",
    category: CATEGORY.B_PREPARE,
    phase: PHASE.PREPARE,
    sequence: 5,
    backgroundImage: "assets/images/bg_prepare_generic.svg",
    animationEffect: "fade-in",
    difficulty: 1,
    situation: {
      "가": "이제 가방을 챙길 시간입니다.",
      "나": "가방을 챙겨요.",
      "다": "🎒 가방 싸기!"
    },
    icon: "🎒",
    choices: [
      {
        id: "prep_packing_a",
        text: {
          "가": "계획한 대로 가방을 챙겨서 다 쌌어요! (+0분)",
          "나": "계획대로 다 쌌어요! (+0분)",
          "다": "🎒 가방 다 쌌어요! (+0분)"
        },
        icon: "🎒",
        timeCost: 0,
        consequence: {
          "가": "출근 계획 단계에서 선택한 준비물들을 꼼꼼하게 챙겼습니다.",
          "나": "계획한 준비물을 모두 가방에 넣었습니다.",
          "다": "👍 꼼꼼해요!"
        },
        isOptimal: true,
        bagEffect: { action: 'pack_planned' }
      }
    ],
    conditions: { minRemainingTime: 0, phase: PHASE.PREPARE, requiresWeatherCheck: false, requiresItem: null }
  },

  // ── Stage 6: 집 출발 전 점검 ──────────────────────────────────────
  {
    id: "prep_02",
    category: CATEGORY.B_PREPARE,
    phase: PHASE.PREPARE,
    sequence: 6,
    backgroundImage: "assets/images/bg_prepare_generic.svg",
    animationEffect: "fade-in",
    difficulty: 1,
    situation: {
      "가": "이제 현관문을 나서야 합니다. 가방을 다시 확인하시겠습니까?",
      "나": "현관문을 나서기 전이에요. 가방을 다시 볼까요?",
      "다": "🚪 출발 전!"
    },
    icon: "🚪",
    choices: [
      {
        id: "prep_02_a",
        text: {
          "가": "가방을 열어 확인한다 (+3분)",
          "나": "가방 확인하기 (+3분)",
          "다": "🔎 가방 확인 (+3분)"
        },
        icon: "🔎",
        timeCost: 3,
        consequence: {
          "가": "시간은 조금 걸렸지만 마음이 든든합니다.",
          "나": "시간이 걸렸지만 마음이 든든해요.",
          "다": "👍 든든해요!"
        },
        isOptimal: true
      },
      {
        id: "prep_02_b",
        text: {
          "가": "바로 출발한다 (+0분)",
          "나": "바로 출발하기 (+0분)",
          "다": "🏃 바로 출발 (+0분)"
        },
        icon: "🏃",
        timeCost: 0,
        consequence: {
          "가": "빠르게 출발했지만 혹시 놓고 온 물건이 있을 수 있습니다.",
          "나": "빠르게 출발했어요.",
          "다": "💨 빨라요!"
        },
        isOptimal: false
      }
    ],
    conditions: { minRemainingTime: 0, phase: PHASE.PREPARE, requiresWeatherCheck: false, requiresItem: null }
  },

  // ── Stage 7: 정류장 대기 ────────────────────────────────────────
  {
    id: "comm_01",
    category: CATEGORY.C_COMMUTE,
    phase: PHASE.COMMUTE,
    sequence: 7,
    backgroundImage: "assets/images/bg_commute.svg",
    animationEffect: "slide-up",
    difficulty: 1,
    situation: {
      "가": "전광판을 보니 버스가 10분 뒤에 도착한다고 합니다. 어떻게 할까요?",
      "나": "버스가 10분 뒤에 와요. 어떻게 할까요?",
      "다": "🚏 10분 기다려요!"
    },
    icon: "🚏",
    choices: [
      {
        id: "comm_01_a",
        text: {
          "가": "정류장에서 기다린다 (+10분)",
          "나": "정류장에서 기다리기 (+10분)",
          "다": "🪑 기다리기 (+10분)"
        },
        icon: "🪑",
        timeCost: 10,
        consequence: {
          "가": "기다리는 시간은 걸리지만 확실하게 버스를 탈 수 있습니다.",
          "나": "기다려서 버스를 탈 수 있어요.",
          "다": "👍 확실해요!"
        },
        isOptimal: true
      },
      {
        id: "comm_01_b",
        text: {
          "가": "다음 정류장으로 걸어간다 (+5분)",
          "나": "다음 정류장으로 걷기 (+5분)",
          "다": "🚶 걸어가기 (+5분)"
        },
        icon: "🚶",
        timeCost: 5,
        consequence: {
          "가": "시간은 아꼈지만 다른 정류장으로 이동하다 헷갈릴 수 있습니다.",
          "나": "시간은 아꼈지만 헷갈릴 수 있어요.",
          "다": "🤔 헷갈려요!"
        },
        isOptimal: false
      }
    ],
    conditions: { minRemainingTime: 0, phase: PHASE.COMMUTE, requiresWeatherCheck: false, requiresItem: null }
  },

  // ── Stage 8: 버스 탑승 ──────────────────────────────────────────
  {
    id: "comm_02",
    category: CATEGORY.C_COMMUTE,
    phase: PHASE.COMMUTE,
    sequence: 8,
    backgroundImage: "assets/images/bg_commute.svg",
    animationEffect: "fade-in",
    difficulty: 1,
    situation: {
      "가": "드디어 버스에 탔습니다! 하지만 사람이 꽉 차서 앉을 자리가 없습니다.",
      "나": "버스에 탔지만 사람이 꽉 차서 자리가 없어요.",
      "다": "🚌 만원 버스예요!"
    },
    icon: "🚌",
    choices: [
      {
        id: "comm_02_a",
        text: {
          "가": "서서 안전하게 가기 (+15분)",
          "나": "서서 조심해서 가기 (+15분)",
          "다": "🧍 서서 가기 (+15분)"
        },
        icon: "🧍",
        timeCost: 15,
        consequence: {
          "가": "서서 가는 건 힘들지만 안전하게 가고 있습니다.",
          "나": "힘들지만 안전하게 가고 있어요.",
          "다": "👍 안전해요!"
        },
        isOptimal: true
      },
      {
        id: "comm_02_b",
        text: {
          "가": "택시를 타기 위해 내리기 (+5분)",
          "나": "택시 타려고 내리기 (+5분)",
          "다": "🚕 내려서 택시 타기 (+5분)"
        },
        icon: "🚕",
        timeCost: 5,
        consequence: {
          "가": "요금이 많이 들고 오히려 차가 막힐 위험이 있습니다.",
          "나": "돈이 많이 들고 길이 막힐 수 있어요.",
          "다": "😱 길이 막혀요!"
        },
        isOptimal: false
      }
    ],
    conditions: { minRemainingTime: 0, phase: PHASE.COMMUTE, requiresWeatherCheck: false, requiresItem: null }
  },

  // ── Stage 9: 환승 지점 ──────────────────────────────────────────
  {
    id: "comm_03",
    category: CATEGORY.C_COMMUTE,
    phase: PHASE.COMMUTE,
    sequence: 9,
    backgroundImage: "assets/images/bg_commute.svg",
    animationEffect: "fade-in",
    difficulty: 1,
    situation: {
      "가": "이제 버스에서 내려 갈아타야 합니다. 어떤 수단을 이용하시겠습니까?",
      "나": "갈아타야 해요. 무엇을 탈까요?",
      "다": "🔄 환승 시간이에요!"
    },
    icon: "🔄",
    choices: [
      {
        id: "comm_03_a",
        text: {
          "가": "지하철 환승 (+15분)",
          "나": "지하철 환승하기 (+15분)",
          "다": "🚇 지하철 타기 (+15분)"
        },
        icon: "🚇",
        timeCost: 15,
        consequence: {
          "가": "계단을 오르내려야 하지만 차가 막히지 않아 확실합니다.",
          "나": "계단이 있지만 늦지 않게 도착해요.",
          "다": "👍 확실해요!"
        },
        isOptimal: true
      },
      {
        id: "comm_03_b",
        text: {
          "가": "버스 환승 (+10분)",
          "나": "버스 환승하기 (+10분)",
          "다": "🚌 버스 타기 (+10분)"
        },
        icon: "🚌",
        timeCost: 10,
        consequence: {
          "가": "걷는 거리가 짧아 편하지만 도로 상황에 따라 늦을 수 있습니다.",
          "나": "편하지만 길이 막히면 늦을 수 있어요.",
          "다": "🤔 늦을 수 있어요!"
        },
        isOptimal: true
      }
    ],
    conditions: { minRemainingTime: 0, phase: PHASE.COMMUTE, requiresWeatherCheck: false, requiresItem: null }
  },

  // ── Stage 10: 하차 후 도보 ───────────────────────────────────────
  {
    id: "comm_04",
    category: CATEGORY.C_COMMUTE,
    phase: PHASE.COMMUTE,
    sequence: 10,
    backgroundImage: "assets/images/bg_commute.svg",
    animationEffect: "fade-in",
    difficulty: 1,
    situation: {
      "가": "버스에서 내렸습니다. 본앤하이리로 가는 길을 선택해 주세요.",
      "나": "버스에서 내렸어요. 어떻게 갈까요?",
      "다": "🏢 다 와가요!"
    },
    icon: "🚶",
    choices: [
      {
        id: "comm_04_a",
        text: {
          "가": "안전한 큰길로 돌아서 가기 (+8분)",
          "나": "안전한 큰길로 가기 (+8분)",
          "다": "🛣️ 큰길로 가기 (+8분)"
        },
        icon: "🛣️",
        timeCost: 8,
        consequence: {
          "가": "조금 멀지만 안전하게 보도와 횡단보도로 걸어왔습니다.",
          "나": "멀지만 안전하게 왔어요.",
          "다": "👍 안전해요!"
        },
        isOptimal: true
      },
      {
        id: "comm_04_b",
        text: {
          "가": "공사장 옆 지름길로 가기 (+3분)",
          "나": "공사장 지름길로 가기 (+3분)",
          "다": "🚧 지름길로 가기 (+3분)"
        },
        icon: "🚧",
        timeCost: 3,
        consequence: {
          "가": "빠르게 왔지만 낙하물 등 공사장 주변은 위험할 수 있습니다.",
          "나": "빠르지만 공사장 주변이라 위험해요.",
          "다": "😱 위험해요!"
        },
        isOptimal: false
      }
    ],
    conditions: { minRemainingTime: 0, phase: PHASE.COMMUTE, requiresWeatherCheck: false, requiresItem: null }
  },

  // ── Stage 11: 사업장 도착 ───────────────────────────────────────
  {
    id: "arrival_01",
    category: CATEGORY.E_SOCIAL,
    phase: PHASE.ARRIVAL,
    sequence: 11,
    backgroundImage: "assets/images/bg_arrival.svg",
    animationEffect: "zoom-in",
    difficulty: 1,
    situation: {
      "가": "드디어 본앤하이리에 도착했습니다! 입구에서 사장님과 동료를 마주쳤습니다.",
      "나": "본앤하이리에 도착했어요! 사장님이 계시네요.",
      "다": "🏢 도착했어요!"
    },
    icon: "🏢",
    choices: [
      {
        id: "arrival_01_a",
        text: {
          "가": "큰 소리로 밝게 인사하기 (+0분)",
          "나": "큰 소리로 인사하기 (+0분)",
          "다": "👋 인사하기 (+0분)"
        },
        icon: "👋",
        timeCost: 0,
        consequence: {
          "가": "밝게 인사하여 모두 기분 좋게 하루를 시작합니다!",
          "나": "인사를 잘해서 칭찬받았어요!",
          "다": "👍 잘했어요!"
        },
        isOptimal: true
      },
      {
        id: "arrival_01_b",
        text: {
          "가": "쑥스러우니 조용히 들어가기 (+0분)",
          "나": "조용히 들어가기 (+0분)",
          "다": "🤫 조용히 가기 (+0분)"
        },
        icon: "🤫",
        timeCost: 0,
        consequence: {
          "가": "인사를 하지 않아 사장님과 동료들이 조금 서운해하셨습니다.",
          "나": "인사를 안 해서 아쉬워요.",
          "다": "🤔 아쉬워요!"
        },
        isOptimal: false
      }
    ],
    conditions: { minRemainingTime: 0, phase: PHASE.ARRIVAL, requiresWeatherCheck: false, requiresItem: null }
  }
];

// Helper functions (kept for compatibility with engine.js expectations)
function getScenarioById(id) {
  for (var i = 0; i < scenarioDB.length; i++) {
    if (scenarioDB[i].id === id) {
      return scenarioDB[i];
    }
  }
  return null;
}
