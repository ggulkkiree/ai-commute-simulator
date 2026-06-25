// ============================================================
// strategy.js — AI 행동 분석 및 출근 전략 카드 생성 모듈
// 본앤하이리 출근 마스터 시뮬레이터
// ============================================================

/**
 * 행동 로그를 4대 영역으로 분류하고 성공/실패 행동을 추출한다.
 * @param {Object} state - 현재 게임 상태 (gameState)
 * @returns {Object} 영역별 분석 데이터
 */
function analyzeActions(state) {
  var log = state.actionLog || [];
  
  var analysis = {
    successActions: [],
    failureActions: [],
    domains: {
      wake: { actions: [], successCount: 0, totalCount: 0, score: 100, feedback: '' },
      prepare: { actions: [], successCount: 0, totalCount: 0, score: 100, feedback: '' },
      commute: { actions: [], successCount: 0, totalCount: 0, score: 100, feedback: '' },
      social: { actions: [], successCount: 0, totalCount: 0, score: 100, feedback: '' }
    }
  };

  // 영역 매핑 함수
  function getDomainKey(category) {
    if (category === 'A_WAKE_UP') return 'wake';
    if (category === 'B_PREPARE') return 'prepare';
    if (category === 'C_COMMUTE' || category === 'D_ENVIRONMENT') return 'commute';
    if (category === 'E_SOCIAL') return 'social';
    return null;
  }

  for (var i = 0; i < log.length; i++) {
    var entry = log[i];
    var domainKey = getDomainKey(entry.category);
    
    if (!domainKey) continue;

    var actionInfo = {
      action: entry.action,
      consequence: entry.consequence,
      icon: entry.icon || '📋',
      timeCost: entry.timeCost || 0,
      isOptimal: entry.isOptimal !== false
    };

    if (actionInfo.isOptimal) {
      analysis.successActions.push(actionInfo);
      analysis.domains[domainKey].successCount++;
    } else {
      analysis.failureActions.push(actionInfo);
    }
    analysis.domains[domainKey].totalCount++;
    analysis.domains[domainKey].actions.push(actionInfo);
  }

  // 각 영역별 점수 및 피드백 산출
  var domains = analysis.domains;
  var level = state.student.level;

  // 1. 기상 영역
  if (domains.wake.totalCount > 0) {
    domains.wake.score = Math.round((domains.wake.successCount / domains.wake.totalCount) * 100);
  }
  if (domains.wake.score === 100) {
    domains.wake.feedback = level === '다' ? '⏰ 일어나는 시간이 아주 좋았어요! 👍' : '알람 소리에 늦지 않고 제시간에 일어나 아침을 활기차게 시작했습니다! 👍';
  } else {
    domains.wake.feedback = level === '다' ? '⏰ 알람 소리에 바로 일어나 봐요!' : '알람이 울리거나 피곤하더라도 조금 더 힘내서 즉시 일어나는 연습을 해봅시다. ⏰';
  }

  // 2. 준비 영역
  if (domains.prepare.totalCount > 0) {
    domains.prepare.score = Math.round((domains.prepare.successCount / domains.prepare.totalCount) * 100);
  }
  if (domains.prepare.score === 100) {
    domains.prepare.feedback = level === '다' ? '🎒 필요한 준비물을 잘 챙겼어요! 👔' : '가방을 꼼꼼히 점검하고 필수 준비물(작업복 등)을 빠짐없이 준비했습니다! 🎒';
  } else {
    domains.prepare.feedback = level === '다' ? '🎒 가방 싸기 전에 꼭 다 챙겼는지 봐요!' : '출발하기 전에 준비물(작업복, 가방, 명찰 등)이 잘 챙겨져 있는지 다시 점검하는 습관이 필요해요. 🎒';
  }

  // 3. 이동 영역
  if (domains.commute.totalCount > 0) {
    domains.commute.score = Math.round((domains.commute.successCount / domains.commute.totalCount) * 100);
  }
  if (domains.commute.score === 100) {
    domains.commute.feedback = level === '다' ? '🚌 안전하게 버스를 타고 잘 왔어요! 🚶' : '날씨 상황에 침착하게 대처하고 알맞은 노선의 대중교통을 이용해 안전하게 이동했습니다! 🚌';
  } else {
    domains.commute.feedback = level === '다' ? '🚌 멈춘 버스에서 내리고 조심히 걸어요!' : '지각하지 않기 위해 무리하게 뛰지 말고, 날씨와 버스 노선을 미리 잘 확인해 여유를 가져보아요. 🚶';
  }

  // 4. 대인관계 및 안전 영역
  if (domains.social.totalCount > 0) {
    domains.social.score = Math.round((domains.social.successCount / domains.social.totalCount) * 100);
  }
  if (domains.social.score === 100) {
    domains.social.feedback = level === '다' ? '🤝 사장님 전화를 받고 인사를 잘했어요! 👋' : '회사 연락에 신속하게 대처하고, 모르는 사람의 위험한 접근을 잘 대처하며 반갑게 인사했습니다! 👋';
  } else {
    domains.social.feedback = level === '다' ? '🚨 모르는 사람 차 타면 안 돼요!' : '선생님이나 사장님의 전화를 꼭 확인하며, 특히 모르는 사람의 무리한 요구는 단호히 거절해야 합니다. 🚨';
  }

  return analysis;
}

/**
 * 100점 만점의 전체 출근 점수 및 별점 개수를 계산한다.
 * @param {Object} analysis - analyzeActions 결과
 * @param {Object} state - 현재 게임 상태
 * @returns {Object} { score: 0~100, stars: 1~5 }
 */
function calculateScore(analysis, state) {
  var judgment = getJudgment();
  var readiness = getReadiness(); // 0~100

  // 1. 도착 상태 점수 (최대 40점)
  var arrivalPoints = 0;
  if (judgment === 'success' || judgment === 'incomplete') {
    arrivalPoints = 40;
  } else if (judgment === 'late') {
    arrivalPoints = 20;
  } else { // fail
    arrivalPoints = 0;
  }

  // 2. 준비물 준비도 점수 (최대 30점)
  var prepPoints = Math.round((readiness / 100) * 30);

  // 3. 행동의 최적화 비율 점수 (최대 30점)
  var choicePoints = 0;
  var totalActions = analysis.successActions.length + analysis.failureActions.length;
  if (totalActions > 0) {
    choicePoints = Math.round((analysis.successActions.length / totalActions) * 30);
  } else {
    choicePoints = 30;
  }

  var score = arrivalPoints + prepPoints + choicePoints;
  if (score < 10) score = 10; // 최소 점수 10점

  // 별점 매핑 (1~5개)
  var stars = 1;
  if (score >= 90) stars = 5;
  else if (score >= 80) stars = 4;
  else if (score >= 60) stars = 3;
  else if (score >= 40) stars = 2;
  else stars = 1;

  return {
    score: score,
    stars: stars
  };
}

/**
 * 분석 결과를 토대로 학생 수준별 맞춤 3대 전략을 생성한다.
 * @param {Object} analysis - 분석 데이터
 * @returns {Array<string>} 3가지 출근 전략 문자열
 */
function getStrategySteps(analysis) {
  var steps = [];
  var failDomains = [];

  // 실패가 있는 영역 탐지
  if (analysis.domains.wake.score < 100) failDomains.push('wake');
  if (analysis.domains.prepare.score < 100) failDomains.push('prepare');
  if (analysis.domains.commute.score < 100) failDomains.push('commute');
  if (analysis.domains.social.score < 100) failDomains.push('social');

  // 1. 첫 번째 전략: 기상 관련
  if (analysis.domains.wake.score < 100) {
    steps.push('⏰ 알람이 울리면 망설이지 말고 즉시 일어나기');
  } else {
    steps.push('⏰ 전날 밤에 일찍 자서 개운하게 기상하기');
  }

  // 2. 두 번째 전략: 준비 관련
  if (analysis.domains.prepare.score < 100) {
    steps.push('🎒 가방을 싸기 전 필요한 물건이 다 들어있는지 꼭 눈으로 확인하기');
  } else {
    steps.push('👔 출근 필수품인 가방과 작업복은 항상 전날 밤 미리 준비하기');
  }

  // 3. 세 번째 전략: 이동 및 사회성 안전 관련
  if (analysis.domains.commute.score < 100) {
    steps.push('🚌 출발 전에 스마트폰으로 목적지 날씨와 버스 노선을 먼저 검색해보기');
  } else if (analysis.domains.social.score < 100) {
    steps.push('🚨 출근길에 모르는 사람이 같이 타자고 해도 단호히 거절하고 가던 길 가기');
  } else {
    steps.push('👋 도착했을 때 사장님과 직장 동료들에게 소리 높여 밝게 인사하기');
  }

  // 만약 3줄이 안 차면 보충
  if (steps.length < 3) {
    steps.push('🚶 뛰어가면 위험하니 항상 여유 있게 10분 일찍 출발하기');
  }

  return steps.slice(0, 3);
}

/**
 * 분석 결과를 카드 폼으로 변환해 HTML 문자열로 생성한다.
 * @param {Object} analysis - 분석 결과
 * @param {Object} student - 학생 정보 { name, level }
 * @param {number} finalScore - 전체 출근 점수
 * @param {number} starsCount - 별 개수
 * @returns {string} HTML 템플릿 스트링
 */
function generateStrategyCard(analysis, student, finalScore, starsCount) {
  var level = student.level;
  var name = student.name;
  var strategies = getStrategySteps(analysis);

  // 별점 이모지 생성
  var starHtml = '';
  for (var s = 0; s < 5; s++) {
    if (s < starsCount) {
      starHtml += '<span class="star star--active">⭐</span>';
    } else {
      starHtml += '<span class="star star--empty">☆</span>';
    }
  }

  var isDa = (level === '다');
  var isNa = (level === '나');

  var html = '';
  
  // 전체 카드 래퍼
  html += '<div class="strategy-card strategy-card--level-' + (isDa ? 'da' : isNa ? 'na' : 'ga') + '">';
  
  // 헤더 (이름 및 수준)
  html += '  <div class="strategy-card__header">';
  html += '    <div class="strategy-card__avatar">😊</div>';
  html += '    <div class="strategy-card__meta">';
  html += '      <h4 class="strategy-card__name">' + name + ' 학생</h4>';
  html += '      <span class="strategy-card__level-badge badge--' + (isDa ? 'da' : isNa ? 'na' : 'ga') + '">수준: ' + level + '</span>';
  html += '    </div>';
  html += '    <div class="strategy-card__score-box">';
  html += '      <div class="strategy-card__stars">' + starHtml + '</div>';
  html += '      <div class="strategy-card__score-num">' + finalScore + '점</div>';
  html += '    </div>';
  html += '  </div>';

  html += '  <div class="strategy-card__body">';

  // 0. 계획 vs 실제 비교 (V9 신설)
  var planTime = formatTime(gameState.plan.departureTime || 480);
  
  var actualTimeMin = 480;
  for(var a = 0; a < gameState.actionLog.length; a++) {
    if(gameState.actionLog[a].category === 'B_PREPARE') {
      actualTimeMin = gameState.actionLog[a].time;
    }
  }
  var actualTimeStr = formatTime(actualTimeMin);
  
  var planItemsStr = '';
  if (gameState.plan.items && gameState.plan.items.length > 0) {
    var pNames = [];
    for(var p=0; p<gameState.plan.items.length; p++) {
      var pk = gameState.plan.items[p];
      if (gameState.bag[pk]) pNames.push(gameState.bag[pk].name);
    }
    planItemsStr = pNames.join(', ');
  } else {
    planItemsStr = '없음';
  }
  
  var actualItems = [];
  var bagKeys = Object.keys(gameState.bag);
  for(var b=0; b<bagKeys.length; b++) {
    if(gameState.bag[bagKeys[b]].checked) {
      actualItems.push(gameState.bag[bagKeys[b]].name);
    }
  }
  var actualItemsStr = actualItems.length > 0 ? actualItems.join(', ') : '없음';

  html += '    <div class="strategy-card__section strategy-card__section--plan-vs-actual" style="background-color: #FFF8E1; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px dashed #8D6E63;">';
  html += '      <h5 class="strategy-card__section-title" style="margin-top: 0; color: #795548; font-size: 1em;">📊 나의 계획 되돌아보기</h5>';
  html += '      <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.95em; color: #424242;">';
  html += '        <li style="margin-bottom: 6px;">⏱️ <strong>출발 시각</strong> <br> - 계획: <span style="color: #2E7D32; font-weight: bold;">' + planTime + '</span><br> - 실제: <span style="color: #c62828; font-weight: bold;">' + actualTimeStr + '</span></li>';
  html += '        <li>🎒 <strong>가방 속 준비물</strong> <br> - 계획: <span style="color: #2E7D32;">' + planItemsStr + '</span><br> - 실제: <span style="color: #1565C0;">' + actualItemsStr + '</span></li>';
  html += '      </ul>';
  html += '    </div>';


  // 1. 성공 행동 분석 리스트 (잘한 행동)
  html += '    <div class="strategy-card__section strategy-card__section--success">';
  html += '      <h5 class="strategy-card__section-title">✅ 오늘 참 잘했어요!</h5>';
  html += '      <ul class="strategy-card__list">';
  
  var maxSuccessToShow = isDa ? 2 : 4;
  var successShown = 0;
  
  if (analysis.successActions.length > 0) {
    for (var i = 0; i < analysis.successActions.length; i++) {
      if (successShown >= maxSuccessToShow) break;
      var act = analysis.successActions[i];
      // 다 수준은 짧게, 가/나 수준은 원래 글
      var text = isDa ? act.icon + ' 잘 대처했어요!' : act.action;
      html += '        <li class="strategy-card__item strategy-card__item--success">';
      html += '          <span class="item-icon">' + act.icon + '</span>';
      html += '          <span class="item-text">' + text + '</span>';
      html += '        </li>';
      successShown++;
    }
  } else {
    html += '        <li class="strategy-card__item strategy-card__item--empty">오늘 첫 단추부터 다시 연습해보아요!</li>';
  }
  html += '      </ul>';
  html += '    </div>';

  // 2. 실패 행동 분석 리스트 (주의 행동) - 실패 행동이 있을 때만 렌더
  if (analysis.failureActions.length > 0) {
    html += '    <div class="strategy-card__section strategy-card__section--warning">';
    html += '      <h5 class="strategy-card__section-title">⚠️ 다음에는 조심해요!</h5>';
    html += '      <ul class="strategy-card__list">';
    
    var maxFailuresToShow = isDa ? 2 : 3;
    var failuresShown = 0;
    
    for (var j = 0; j < analysis.failureActions.length; j++) {
      if (failuresShown >= maxFailuresToShow) break;
      var actFail = analysis.failureActions[j];
      var textFail = isDa ? actFail.icon + ' 다음에는 다르게 해봐요' : actFail.action;
      html += '        <li class="strategy-card__item strategy-card__item--fail">';
      html += '          <span class="item-icon">' + actFail.icon + '</span>';
      html += '          <span class="item-text">' + textFail + '</span>';
      if (!isDa) {
        html += '          <small class="item-penalty">(시간 지체 +' + actFail.timeCost + '분)</small>';
      }
      html += '        </li>';
      failuresShown++;
    }
    html += '      </ul>';
    html += '    </div>';
  }

  // 3. 나만의 3줄 출근 전략 (수준에 맞게 크기 조절)
  html += '    <div class="strategy-card__section strategy-card__section--rules">';
  html += '      <h5 class="strategy-card__section-title">🎯 나만의 ' + (isDa ? '약속' : '3줄 출근 전략') + '</h5>';
  html += '      <ol class="strategy-card__rules-list">';
  for (var k = 0; k < strategies.length; k++) {
    var strategyText = strategies[k];
    // 다 수준에서는 문장을 조금 단축 및 단순화
    if (isDa) {
      if (strategyText.indexOf('알람') >= 0) strategyText = '⏰ 알람 소리가 나면 바로 일어나기';
      else if (strategyText.indexOf('가방') >= 0) strategyText = '🎒 가방과 옷은 전날 준비하기';
      else if (strategyText.indexOf('날씨') >= 0) strategyText = '☀️ 버스 타기 전에 날씨 확인하기';
      else if (strategyText.indexOf('모르는 사람') >= 0) strategyText = '🚨 모르는 사람 차 타지 말기';
      else if (strategyText.indexOf('인사') >= 0) strategyText = '👋 만나면 반갑게 인사하기';
    }
    html += '        <li class="strategy-card__rule-item">' + strategyText + '</li>';
  }
  html += '      </ol>';
  html += '    </div>';

  html += '  </div>'; // body
  
  // 푸터
  html += '  <div class="strategy-card__footer">';
  html += '    <p class="strategy-card__tag">🌿 본앤하이리 출근 마스터 카드</p>';
  html += '    <small class="strategy-card__date">' + new Date().toLocaleDateString('ko-KR') + ' 발행</small>';
  html += '  </div>';

  html += '</div>'; // card wrapper

  return html;
}
