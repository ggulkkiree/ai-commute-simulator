// ============================================================
// engine.js — 순차적 시나리오 엔진 (V9 개편)
// 본앤하이리 출근 마스터 시뮬레이터
// ============================================================

/**
 * 메인 시나리오 선택 함수
 * 엄격한 9단계 순차적 흐름에 따라 현재 단계(currentStage)에 맞는 시나리오를 반환한다.
 * @param {Object} state - 현재 게임 상태 (gameState)
 * @param {Array<Object>} scenarioDB - 시나리오 데이터베이스
 * @returns {Object|null} 선택된 시나리오
 */
function selectNextScenario(state, scenarioDB) {
  if (!scenarioDB || scenarioDB.length === 0) return null;

  var targetSequence = state.currentStage;
  
  for (var i = 0; i < scenarioDB.length; i++) {
    if (scenarioDB[i].sequence === targetSequence) {
      return scenarioDB[i];
    }
  }
  
  return null; // 매칭되는 시나리오가 없으면 null 반환
}

/**
 * 페이즈 전환 여부 판단
 * 현재 진행할 Stage 번호에 맞춰 페이즈가 변경되어야 하는지 판단한다.
 * @param {Object} state - 현재 게임 상태
 * @returns {boolean} 페이즈 전환이 필요하면 true
 */
function shouldTransitionPhase(state) {
  var stage = state.currentStage;
  var phase = state.currentPhase;

  if (stage === 2 && phase === 'wake_up') return true; // 기상 -> 준비
  if (stage === 5 && phase === 'prepare') return true; // 준비 -> 이동
  if (stage === 9 && phase === 'commute') return true; // 이동 -> 도착

  return false;
}

/**
 * 다음 페이즈 반환
 * @param {string} currentPhase - 현재 페이즈
 * @returns {string} 다음 페이즈 이름
 */
function getNextPhase(currentPhase) {
  switch (currentPhase) {
    case 'wake_up': return 'prepare';
    case 'prepare': return 'commute';
    case 'commute': return 'arrival';
    default: return 'arrival';
  }
}

/**
 * 게임 종료 여부 판단
 * @param {Object} state - 현재 게임 상태
 * @returns {boolean} 게임이 끝났으면 true
 */
function isGameOver(state) {
  // 11단계까지 모두 완료했거나 마감 시한을 초과했을 때
  return state.currentStage > 11 || state.time.current > state.time.deadline;
}

/**
 * 선택지 적용 — 플레이어의 선택을 게임 상태에 반영한다.
 *
 * @param {Object} state - 현재 게임 상태 (gameState)
 * @param {Object} scenario - 현재 시나리오 객체
 * @param {number} choiceIndex - 선택한 선택지 인덱스 (0부터)
 * @returns {Object} { consequence, timeCost, bagEffect, isOptimal }
 */
function applyChoice(state, scenario, choiceIndex) {
  var choice = scenario.choices[choiceIndex];
  if (!choice) {
    console.error('유효하지 않은 선택지 인덱스:', choiceIndex);
    return { consequence: '오류 발생', timeCost: 0, bagEffect: null, isOptimal: false };
  }

  var timeCost = choice.timeCost || 0;
  var level = state.student.level;

  // 수준별 피드백 텍스트 추출
  var consequence = '';
  if (choice.consequence) {
    if (typeof choice.consequence === 'object') {
      consequence = choice.consequence[level] || choice.consequence['나'] || choice.consequence['가'] || '';
    } else {
      consequence = choice.consequence;
    }
  }

  var bagEffect = choice.bagEffect || null;
  var isOptimal = choice.isOptimal !== undefined ? choice.isOptimal : true;

  // 시간 진행
  advanceTime(timeCost);

  // 행동 로그 기록 (수준별 선택지 텍스트 사용)
  var actionText = '';
  if (choice.text) {
    if (typeof choice.text === 'object') {
      actionText = choice.text[level] || choice.text['나'] || choice.text['가'] || '';
    } else {
      actionText = choice.text;
    }
  }

  addLog(
    choice.icon || scenario.icon || '📋',
    actionText,
    consequence,
    timeCost,
    isOptimal
  );

  var lastEntry = state.actionLog[state.actionLog.length - 1];
  if (lastEntry) {
    lastEntry.category = scenario.category;
  }

  // 시나리오 히스토리에 추가
  state.scenarioHistory.push(scenario.id);

  // 진행 단계(Stage) 증가
  state.currentStage++;

  return {
    consequence: consequence,
    timeCost: timeCost,
    bagEffect: bagEffect,
    isOptimal: isOptimal
  };
}

/**
 * 페이즈 전환 메시지 — 한국어 안내 문구 반환
 * @param {string} fromPhase - 이전 페이즈
 * @param {string} toPhase - 다음 페이즈
 * @returns {string} 전환 안내 메시지
 */
function getPhaseTransitionMessage(fromPhase, toPhase) {
  if (fromPhase === 'wake_up' && toPhase === 'prepare') {
    return '이제 출근 준비를 시작해요! 🧹';
  }
  if (fromPhase === 'prepare' && toPhase === 'commute') {
    return '준비 완료! 이제 출발해요! 🚶';
  }
  if (fromPhase === 'commute' && toPhase === 'arrival') {
    return '거의 다 왔어요! 직장에 도착합니다! 🏢';
  }
  return '다음 단계로 이동합니다.';
}

/**
 * 반성(회고) 선택지 생성 — 행동 로그를 분석하여 반성 문구를 생성한다.
 * @param {Object} state - 현재 게임 상태
 * @returns {Array<string>} 반성 선택지 문자열 배열
 */
function generateReflectionOptions(state) {
  var options = [];
  var log = state.actionLog;

  var reflectionPool = [
    '알람이 울리면 바로 일어나기',
    '아침밥을 먹을 때 시간 분배 잘하기',
    '전날 밤에 가방을 미리 싸 놓기',
    '집을 나서기 전 가방 확인하기',
    '정류장에서 침착하게 버스 기다리기',
    '버스 안에서는 안전하게 손잡이 잡기',
    '환승할 때 안전하고 확실한 수단 이용하기',
    '공사장 등 위험한 길은 피하고 큰길로 가기',
    '직장에 도착하면 큰 소리로 밝게 인사하기'
  ];

  for (var i = 0; i < log.length; i++) {
    var entry = log[i];
    if (!entry.isOptimal || entry.timeCost >= 10) {
      if (entry.action.indexOf('누워') >= 0) options.push('알람이 울리면 바로 일어나기');
      if (entry.action.indexOf('다 먹기') >= 0) options.push('아침밥을 먹을 때 시간 분배 잘하기');
      if (entry.action.indexOf('바로 출발') >= 0) options.push('집을 나서기 전 가방 확인하기');
      if (entry.action.indexOf('다음 정류장') >= 0) options.push('정류장에서 침착하게 버스 기다리기');
      if (entry.action.indexOf('택시') >= 0) options.push('버스 안에서는 안전하게 손잡이 잡기');
      if (entry.action.indexOf('지름길') >= 0) options.push('공사장 등 위험한 길은 피하고 큰길로 가기');
      if (entry.action.indexOf('조용히') >= 0) options.push('직장에 도착하면 큰 소리로 밝게 인사하기');
    }
  }

  // 중복 제거
  var unique = [];
  for (var u = 0; u < options.length; u++) {
    if (unique.indexOf(options[u]) === -1) unique.push(options[u]);
  }

  // 풀에서 랜덤 추가
  var poolCopy = reflectionPool.slice();
  while (unique.length < 4 && poolCopy.length > 0) {
    var randIdx = Math.floor(Math.random() * poolCopy.length);
    var candidate = poolCopy.splice(randIdx, 1)[0];
    if (unique.indexOf(candidate) === -1) unique.push(candidate);
  }

  return unique.slice(0, 6);
}

/**
 * 현재 시나리오와 게임 상태를 분석하여 수준별 AI 비서 조언(힌트)을 반환한다.
 * @param {Object} scenario - 시나리오 객체
 * @param {Object} state - 현재 게임 상태
 * @returns {string} AI 조언 텍스트
 */
function getAIHint(scenario, state) {
  var level = state.student.level;
  var id = scenario.id;
  var hints = {
    'wake_01': {
      '가': '알람 소리가 울릴 때 지체하지 않고 바로 일어나는 것이 가장 좋습니다. 누워있으면 시간을 뺏깁니다.',
      '나': '알람이 울리면 바로 일어나도록 해요.',
      '다': '⏰ 알람 소리! 🌅 바로 일어나요!'
    },
    'prep_01': {
      '가': '아침밥을 든든히 먹는 것도 좋지만, 시간이 너무 늦었다면 간단히 먹는 것이 지각을 피하는 방법입니다.',
      '나': '시간을 보면서 밥을 먹어요.',
      '다': '⏰ 시간 보면서 밥 먹기!'
    },
    'prep_packing': {
      '가': '가방에 오늘 출근에 필요한 가장 중요한 물품이 잘 챙겨져 있는지 최종 점검해보세요.',
      '나': '출근에 필요한 물품들이 잘 들어있는지 확인해봐요.',
      '다': '🎒 가방 물건 확인하기!'
    },
    'prep_02': {
      '가': '출발 전 잠깐 시간을 내어 가방을 점검하면 중요한 물건을 빠뜨리는 실수를 막을 수 있습니다.',
      '나': '나가기 전에 가방을 확인해요.',
      '다': '🔎 출발 전 가방 확인!'
    },
    'comm_01': {
      '가': '버스가 늦게 온다고 무작정 다른 정류장으로 걷다 보면 길을 잃거나 버스를 놓칠 수 있습니다.',
      '나': '기다리던 정류장에서 버스를 타는 게 안전해요.',
      '다': '🚏 제자리에서 기다리기!'
    },
    'comm_02': {
      '가': '만원 버스에서는 힘들더라도 손잡이를 꼭 잡고 서서 가는 것이 택시를 타는 것보다 확실합니다.',
      '나': '버스에서는 손잡이를 잡고 안전하게 가요.',
      '다': '🧍 버스 손잡이 꼭 잡기!'
    },
    'comm_03': {
      '가': '환승할 때에는 교통 정체가 없는 지하철이 시간이 조금 더 걸리더라도 확실한 수단이 될 수 있습니다.',
      '나': '길이 막히지 않는 확실한 교통수단을 선택해요.',
      '다': '🚇 안 막히는 지하철 타기!'
    },
    'comm_04': {
      '가': '지름길이라도 공사장 주변은 위험물이 많습니다. 조금 멀어도 안전한 큰길이나 횡단보도를 이용하세요.',
      '나': '조금 멀어도 위험하지 않은 큰길로 가요.',
      '다': '🛣️ 안전한 큰길로 가기!'
    },
    'arrival_01': {
      '가': '직장에 도착하면 쑥스럽더라도 큰 목소리로 밝게 인사하세요. 인사성은 직장 생활의 기본입니다.',
      '나': '회사에 도착하면 반갑게 인사해요.',
      '다': '👋 큰 소리로 안녕하세요!'
    }
  };

  var scenarioHint = hints[id];
  if (scenarioHint) {
    return scenarioHint[level] || scenarioHint['나'] || scenarioHint['가'] || '';
  }
  return '준비물과 시간, 그리고 안전을 먼저 고려해보세요!';
}

// checkAutoResolve와 applyAutoResolve는 V9 순차 엔진에서는 사용되지 않으나 하위 호환성을 위해 유지
function checkAutoResolve(state, scenario) { return null; }
function applyAutoResolve(state, scenario, autoResolve) { return null; }
