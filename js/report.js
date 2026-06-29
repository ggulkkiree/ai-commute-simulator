// ============================================================
// report.js — 교사용 보고서 생성 모듈
// 본앤하이리 출근 마스터 시뮬레이터
// ============================================================

/**
 * 판정 결과를 한국어 레이블로 변환 (내부 유틸리티)
 * @param {string} judgment - 'success' | 'incomplete' | 'late' | 'fail'
 * @returns {{ label: string, emoji: string, cssClass: string }}
 */
function _getJudgmentInfo(judgment) {
  switch (judgment) {
    case 'success':
      return { label: '성공', emoji: '🎉', cssClass: 'judgment-success' };
    case 'incomplete':
      return { label: '준비 부족', emoji: '⚠️', cssClass: 'judgment-incomplete' };
    case 'late':
      return { label: '지각', emoji: '⏰', cssClass: 'judgment-late' };
    case 'fail':
      return { label: '실패', emoji: '❌', cssClass: 'judgment-fail' };
    default:
      return { label: '알 수 없음', emoji: '❓', cssClass: '' };
  }
}

/**
 * 결과 화면에서 여는 간단한 교사용 리포트 데이터를 만든다.
 * 핵심 어려움과 지도 포인트는 각각 하나만 반환한다.
 */
function buildTeacherQuickReport(state) {
  state = state || gameState || {};
  var student = state.student || {};
  var record = state.commuteRecord || {};
  var morning = state.morningPrep || {};
  var activities = Array.isArray(morning.completedActivities)
    ? morning.completedActivities
    : (Array.isArray(morning.routinesDone) ? morning.routinesDone : []);
  var judgment = state.finalJudgment || (typeof normalizeResultJudgment === 'function'
    ? normalizeResultJudgment(getJudgment())
    : getJudgment());

  var priority = [
    'commute_failed',
    'late',
    'wrong_bus_number',
    'missed_bell',
    'wrong_destination',
    'overslept',
    'smartphone_delay',
    'missing_weather_item',
    'bag_missing_item',
    'no_breakfast',
    'no_shower',
    'no_toothbrush',
    'wrong_clothes'
  ];
  var candidates = [];

  if (judgment === 'fail') candidates.push('commute_failed');
  if (judgment === 'late') candidates.push('late');
  if ((record.busNumberMistakes || 0) > 0) candidates.push('wrong_bus_number');
  if ((record.bellMistakes || 0) > 0) candidates.push('missed_bell');
  if ((record.destinationMistakes || 0) > 0) candidates.push('wrong_destination');
  if (morning.wokeUpEarly === false) candidates.push('overslept');
  if (activities.indexOf('sns') > -1) candidates.push('smartphone_delay');

  var feedbackCandidates = morning.feedbackCandidates || [];
  ['missing_weather_item', 'bag_missing_item', 'wrong_clothes'].forEach(function(tag) {
    if (feedbackCandidates.indexOf(tag) > -1) candidates.push(tag);
  });
  if (activities.indexOf('eat') === -1) candidates.push('no_breakfast');
  if (activities.indexOf('shower') === -1) candidates.push('no_shower');
  if (activities.indexOf('brush') === -1) candidates.push('no_toothbrush');
  if (activities.indexOf('dress') === -1 || morning.outfitCorrect === false) candidates.push('wrong_clothes');

  if (state.feedback && Array.isArray(state.feedback.candidates)) {
    state.feedback.candidates.forEach(function(candidate) {
      if (candidate && candidate.tag) candidates.push(candidate.tag);
    });
  }

  candidates.sort(function(a, b) {
    var ai = priority.indexOf(a);
    var bi = priority.indexOf(b);
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
  });

  var primaryTag = candidates.length ? candidates[0] : null;
  var coaching = {
    commute_failed: ['출근 가능 시간을 지나 출근을 완료하지 못했어요.', '출근 준비와 이동 시간을 거꾸로 계산하여 더 일찍 출발하는 연습이 필요해요.'],
    late: ['출근 시간에 맞춰 도착하는 데 어려움이 있었어요.', '현재 시각과 버스 도착 시간을 함께 확인하는 연습이 필요해요.'],
    wrong_bus_number: ['버스 번호를 선택하는 데 어려움이 있었어요.', '200번 버스 번호를 다시 확인하는 연습이 필요해요.'],
    missed_bell: ['내릴 정류장에서 하차벨을 판단하는 데 어려움이 있었어요.', '내릴 정류장 이름을 보고 벨을 누르는 연습이 필요해요.'],
    wrong_destination: ['버스에서 내린 뒤 목적지를 찾는 데 어려움이 있었어요.', '본앤하이리 간판을 확인하는 연습이 필요해요.'],
    overslept: ['알람이 울린 뒤 바로 일어나는 데 어려움이 있었어요.', '알람이 울리면 바로 일어나는 연습이 필요해요.'],
    smartphone_delay: ['스마트폰 사용으로 아침 준비 시간이 지연되었어요.', '출근 준비를 모두 마친 뒤 스마트폰을 사용하는 연습이 필요해요.'],
    missing_weather_item: ['날씨에 필요한 물건을 준비하는 데 어려움이 있었어요.', '날씨와 필요한 준비물을 연결하여 확인하는 연습이 필요해요.'],
    bag_missing_item: ['출발 전 가방에서 빠진 물건이 발견되었어요.', '전날 가방을 미리 챙기고 출발 전에 다시 확인하는 연습이 필요해요.'],
    no_breakfast: ['아침 식사 활동을 빠뜨렸어요.', '출근 전 식사 시간을 계획하고 순서대로 준비하는 연습이 필요해요.'],
    no_shower: ['아침 씻기 활동을 빠뜨렸어요.', '아침 위생 활동 순서를 확인하는 연습이 필요해요.'],
    no_toothbrush: ['출근 전 양치 활동을 빠뜨렸어요.', '샤워와 식사 후 양치까지 이어서 하는 연습이 필요해요.'],
    wrong_clothes: ['날씨에 맞는 옷을 선택하는 데 어려움이 있었어요.', '날씨를 확인하고 알맞은 옷을 고르는 연습이 필요해요.']
  };
  var primary = coaching[primaryTag] || [
    '이번 활동에서 뚜렷한 어려움 없이 출근 과정을 완료했어요.',
    '현재의 출근 준비 순서를 반복하여 독립적으로 수행하는 연습을 이어가요.'
  ];
  var resultLabel = judgment === 'success' ? '출근 성공' : judgment === 'late' ? '지각' : '출근 실패';

  var activityLabels = {
    shower: '샤워',
    eat: '아침 식사',
    brush: '양치',
    dress: '옷 입기'
  };
  var activityRows = Object.keys(activityLabels).map(function(key) {
    return {
      label: activityLabels[key],
      value: activities.indexOf(key) > -1 ? '완료' : '미완료',
      ok: activities.indexOf(key) > -1
    };
  });

  return {
    studentName: student.name || '-',
    level: student.level || '-',
    result: resultLabel,
    resultKey: judgment,
    mainDifficulty: primary[0],
    nextTeachingPoint: primary[1],
    primaryTag: primaryTag,
    details: {
      activities: activityRows,
      bagChecked: morning.bagChecked ? '완료' : '미완료',
      stopMistakes: record.stopMistakes || 0,
      busNumberMistakes: record.busNumberMistakes || 0,
      bellMistakes: record.bellMistakes || 0,
      destinationMistakes: record.destinationMistakes || 0,
      arrivalTime: formatTime((state.commute && state.commute.arrivalTime) || (state.time && state.time.current) || 0),
      result: resultLabel
    }
  };
}

function renderTeacherQuickReport(state) {
  var report = buildTeacherQuickReport(state);
  var activityHtml = report.details.activities.map(function(activity) {
    return '<li class="' + (activity.ok ? 'is-complete' : 'is-missing') + '">' +
      '<span>' + _escapeHtml(activity.label) + '</span><strong>' + activity.value + '</strong></li>';
  }).join('');

  return '<div class="teacher-report-student">' +
      '<div><span>학생 이름</span><strong>' + _escapeHtml(report.studentName) + '</strong></div>' +
      '<div><span>수준</span><strong>' + _escapeHtml(report.level) + ' 수준</strong></div>' +
      '<div><span>최종 결과</span><strong class="teacher-result teacher-result--' + report.resultKey + '">' + _escapeHtml(report.result) + '</strong></div>' +
    '</div>' +
    '<div class="teacher-report-priority">' +
      '<article class="teacher-priority-card teacher-priority-card--difficulty">' +
        '<span>핵심 어려움</span><p>' + _escapeHtml(report.mainDifficulty) + '</p>' +
      '</article>' +
      '<article class="teacher-priority-card teacher-priority-card--coaching">' +
        '<span>다음 지도 포인트</span><p>' + _escapeHtml(report.nextTeachingPoint) + '</p>' +
      '</article>' +
    '</div>' +
    '<details class="teacher-report-details">' +
      '<summary>자세히 보기</summary>' +
      '<div class="teacher-detail-grid">' +
        '<section><h3>아침 활동</h3><ul class="teacher-activity-list">' + activityHtml + '</ul>' +
          '<p class="teacher-detail-row"><span>가방 확인</span><strong>' + report.details.bagChecked + '</strong></p></section>' +
        '<section><h3>이동 활동</h3>' +
          '<p class="teacher-detail-row"><span>정류장 방향 오답</span><strong>' + report.details.stopMistakes + '회</strong></p>' +
          '<p class="teacher-detail-row"><span>버스 번호 오답</span><strong>' + report.details.busNumberMistakes + '회</strong></p>' +
          '<p class="teacher-detail-row"><span>하차벨 오답</span><strong>' + report.details.bellMistakes + '회</strong></p>' +
          '<p class="teacher-detail-row"><span>목적지 선택 오답</span><strong>' + report.details.destinationMistakes + '회</strong></p>' +
        '</section>' +
        '<section><h3>최종 기록</h3>' +
          '<p class="teacher-detail-row"><span>도착 시간</span><strong>' + report.details.arrivalTime + '</strong></p>' +
          '<p class="teacher-detail-row"><span>출근 결과</span><strong>' + report.details.result + '</strong></p>' +
        '</section>' +
      '</div>' +
    '</details>';
}

/**
 * 개별 학생 상세 보고서 HTML 생성
 *
 * @param {Object} state - 현재 게임 상태 (gameState)
 * @returns {string} HTML 문자열
 */
function generateDetailReport(state) {
  state = state || {};
  var student = state.student || { name: '', level: '나' };
  var evePrep = state.evePrep || { alarmTime: null };
  var commute = state.commute || {};
  var time = state.time || { current: state.startTime || 0, target: getWorkStartTime() };
  var actionLog = Array.isArray(state.actionLog) ? state.actionLog : [];
  var judgment = state.finalJudgment || (typeof normalizeResultJudgment === 'function'
    ? normalizeResultJudgment(getJudgment())
    : getJudgment());
  var reqStatus = getRequiredItemsStatus();
  var causeList = getCauseAnalysis(actionLog);
  var primary = state.feedback || {};
  var status = _getReportStatus(judgment, causeList, reqStatus);
  var steps = _buildReportTimelineSteps(state, judgment);
  var completedSteps = steps.filter(function(step) { return step.complete; }).length;
  var stars = status.stars;
  var arrivalTime = (time.current !== null && time.current !== undefined) ? time.current : state.currentTime;
  var startTime = (state.startTime !== null && state.startTime !== undefined) ? state.startTime : commute.wakeTime;
  var totalMinutes = arrivalTime !== null && arrivalTime !== undefined && startTime !== null && startTime !== undefined
    ? Math.max(0, arrivalTime - startTime)
    : null;
  var avatar = typeof getStudentAvatarPresentation === 'function'
    ? getStudentAvatarPresentation(student)
    : null;
  var avatarHtml = avatar && avatar.src
    ? '<img src="' + avatar.src + '" alt="' + _escapeHtml(student.name || '학생') + ' 프로필">'
    : '<span>' + _escapeHtml((avatar && avatar.fallback) || student.emoji || '🙂') + '</span>';
  var studentId = student.id !== undefined && student.id !== null ? String(student.id) : '-';
  var gender = student.gender || (student.character === 'girl' ? '여자' : '남자');
  var goodItems = _buildReportGoodItems(judgment, reqStatus);
  var retryItems = _buildReportRetryItems(judgment, primary, status);

  return '' +
    '<div class="teacher-dashboard teacher-dashboard--' + status.key + '">' +
      '<section class="teacher-dashboard__top">' +
        '<article class="teacher-student-card">' +
          '<div class="teacher-student-card__avatar">' + avatarHtml + '</div>' +
          '<div class="teacher-student-card__info">' +
            '<h3>' + _escapeHtml(student.name || '학생') + '</h3>' +
            '<div class="teacher-student-card__chips">' +
              '<span>수준 <strong>' + _escapeHtml(student.level || '-') + '수준</strong></span>' +
              '<span>성별 <strong>' + _escapeHtml(gender || '-') + '</strong></span>' +
              '<span>학생 ID <strong>' + _escapeHtml(studentId) + '</strong></span>' +
            '</div>' +
          '</div>' +
        '</article>' +
        '<article class="teacher-result-card">' +
          '<div class="teacher-result-card__status">' +
            '<span class="teacher-result-icon">' + status.icon + '</span>' +
            '<strong>' + status.label + '</strong>' +
            '<div class="teacher-result-stars">' + _buildReportStars(stars) + '</div>' +
          '</div>' +
          '<div class="teacher-result-card__metrics">' +
            _buildReportMetric('🎯', '목표 출근 시간', _formatReportTime(getWorkStartTime())) +
            _buildReportMetric('🕘', '실제 도착 시간', _formatReportTime(arrivalTime)) +
            _buildReportMetric('⏱️', '소요 시간', totalMinutes === null ? '-' : totalMinutes + '분') +
            _buildReportMetric('🏅', '결과 평가', status.shortLabel) +
          '</div>' +
        '</article>' +
        '<article class="teacher-summary-card">' +
          '<h3>한눈에 보는 요약</h3>' +
          '<div class="teacher-summary-grid">' +
            _buildReportSummaryTile('✅', '완료한 단계', completedSteps + ' / ' + steps.length, '단계') +
            _buildReportSummaryTile('⭐', '획득 별점', stars + ' / 3', '개') +
            _buildReportSummaryTile('🕒', '지각 여부', status.lateLabel, '') +
          '</div>' +
          '<p class="teacher-summary-comment">👍 ' + status.summary + '</p>' +
        '</article>' +
      '</section>' +
      '<section class="teacher-dashboard__middle">' +
        '<article class="teacher-timeline-card">' +
          '<h3>오늘의 출근 과정</h3>' +
          '<div class="teacher-timeline-list">' + steps.map(_buildReportTimelineStep).join('') + '</div>' +
          '<p class="teacher-timeline-note">✅ 완료된 단계는 초록 표시로 확인할 수 있어요.</p>' +
        '</article>' +
        '<article class="teacher-late-card">' +
          '<div class="teacher-late-card__header">' +
            '<h3>지각 발생 정보</h3>' +
            '<span>' + status.lateLabel + '</span>' +
          '</div>' +
          _buildReportLateRow('지각 여부', status.lateLabel) +
          _buildReportLateRow('지각 원인', status.reason) +
          _buildReportLateRow('추천 개선 방법', status.recommendation) +
          _buildReportLateRow('현재 상태', status.currentState) +
        '</article>' +
      '</section>' +
      '<section class="teacher-feedback-row">' +
        '<article class="teacher-feedback-card teacher-feedback-card--good">' +
          '<h3>잘한 점 👍</h3>' +
          '<ul>' + goodItems.map(function(item) { return '<li>✅ ' + _escapeHtml(item) + '</li>'; }).join('') + '</ul>' +
        '</article>' +
        '<article class="teacher-feedback-card teacher-feedback-card--next">' +
          '<h3>내일 해볼 점 💡</h3>' +
          '<ul>' + retryItems.map(function(item) { return '<li>' + _escapeHtml(item) + '</li>'; }).join('') + '</ul>' +
        '</article>' +
        '<article class="teacher-feedback-card teacher-feedback-card--memo">' +
          '<h3>교사 메모 ✎</h3>' +
          '<textarea aria-label="교사 메모" placeholder="메모를 입력해주세요."></textarea>' +
        '</article>' +
      '</section>' +
    '</div>';
}

function _getReportStatus(judgment, causeList, reqStatus) {
  var firstCause = causeList && causeList.length ? causeList[0].action : '';
  if (judgment === 'success' || judgment === 'incomplete') {
    return {
      key: 'success',
      label: '출근 성공',
      shortLabel: '성공',
      icon: '😊',
      stars: 3,
      lateLabel: '지각 아님',
      summary: '시간에 맞춰 출근에 성공했어요.',
      reason: '해당 없음',
      recommendation: '현재 생활 습관을 유지하면 좋아요.',
      currentState: '지금의 생활 습관을 잘 유지하면 좋아요!'
    };
  }
  if (judgment === 'late') {
    return {
      key: 'late',
      label: '지각',
      shortLabel: '지각',
      icon: '⏰',
      stars: 2,
      lateLabel: '지각',
      summary: '출근은 완료했지만 목표 시간보다 늦었어요.',
      reason: firstCause || '출발 시간이 늦었어요.',
      recommendation: '출발 시간을 조금 여유 있게 맞추면 더 좋아요.',
      currentState: '출근 순서는 완료했어요. 시간 조절을 연습해요.'
    };
  }
  return {
    key: 'fail',
    label: '출근 실패',
    shortLabel: '실패',
    icon: '🔁',
    stars: 1,
    lateLabel: '실패',
    summary: '출근 과정 중 다시 연습이 필요해요.',
    reason: firstCause || (reqStatus && !reqStatus.allRequired ? '필수 준비물이 부족했어요.' : '출근 가능 시간이 지났어요.'),
    recommendation: '출근 순서와 시간을 한 단계씩 다시 확인해요.',
    currentState: '재도전 연습이 필요해요.'
  };
}

function _buildReportTimelineSteps(state, judgment) {
  var commute = state.commute || {};
  var evePrep = state.evePrep || {};
  var wakeTime = commute.wakeTime || state.startTime;
  var busRideMinutes = typeof commuteConfig !== 'undefined' ? commuteConfig.busRideMinutes : 30;
  var walkToWorkMinutes = typeof commuteConfig !== 'undefined' ? commuteConfig.walkToWorkMinutes : 10;
  var busBoarding = commute.busBoardingTime;
  var busEnd = busBoarding !== null && busBoarding !== undefined ? busBoarding + busRideMinutes : null;
  var arrival = commute.arrivalTime || (state.time && state.time.current);
  var finalComplete = judgment === 'success' || judgment === 'late' || !!arrival;
  var hasAlarm = evePrep.alarmTime !== null && evePrep.alarmTime !== undefined && evePrep.alarmTime !== -1;
  var hasWake = wakeTime !== null && wakeTime !== undefined;
  var hasHomeDeparture = commute.homeDepartureTime !== null && commute.homeDepartureTime !== undefined;
  var hasStopArrival = commute.stopArrivalTime !== null && commute.stopArrivalTime !== undefined;
  var hasBusBoarding = busBoarding !== null && busBoarding !== undefined;
  var hasArrival = arrival !== null && arrival !== undefined;
  return [
    { icon: '⏰', label: '알람 맞추기', time: hasAlarm ? _formatReportTime(evePrep.alarmTime) : '-', complete: hasAlarm },
    { icon: '🌙', label: '잠자기', time: '22:00', complete: true },
    { icon: '☀️', label: '기상하기', time: hasWake ? _formatReportTime(wakeTime) : '-', complete: hasWake },
    { icon: '🪥', label: '아침 준비', time: hasWake ? _formatReportTime(wakeTime) : '-', complete: !!(state.morningPrep && state.morningPrep.completedActivities && state.morningPrep.completedActivities.length) },
    { icon: '🎒', label: '가방 챙기기', time: hasHomeDeparture ? _formatReportTime(commute.homeDepartureTime) : '-', complete: !!(state.morningPrep && state.morningPrep.bagChecked) },
    { icon: '🗺️', label: '출근 경로 확인', time: hasHomeDeparture ? _formatReportTime(commute.homeDepartureTime) : '-', complete: hasHomeDeparture },
    { icon: '🚏', label: '버스 정류장', time: hasStopArrival ? _formatReportTime(commute.stopArrivalTime) : '-', complete: hasStopArrival },
    { icon: '🚌', label: '버스 탑승', time: hasBusBoarding ? _formatReportTime(busBoarding) : '-', complete: hasBusBoarding || commute.transportMode === 'taxi' },
    { icon: '💺', label: '버스 이동', time: hasBusBoarding && busEnd ? _formatReportTime(busBoarding) + '~' + _formatReportTime(busEnd) : '-', complete: !!busEnd || commute.transportMode === 'taxi' },
    { icon: '🔔', label: '버스 하차', time: busEnd ? _formatReportTime(busEnd) : '-', complete: !!busEnd || commute.transportMode === 'taxi' },
    { icon: '🚶', label: '회사 가는 길', time: busEnd && hasArrival ? _formatReportTime(busEnd) + '~' + _formatReportTime(arrival) : (hasArrival && walkToWorkMinutes ? _formatReportTime(arrival - walkToWorkMinutes) + '~' + _formatReportTime(arrival) : '-'), complete: hasArrival },
    { icon: '🏢', label: '회사 도착', time: hasArrival ? _formatReportTime(arrival) : '-', complete: finalComplete }
  ];
}

function _formatReportTime(value) {
  if (typeof value !== 'number' || !isFinite(value)) return '-';
  return formatTime(value);
}

function _buildReportMetric(icon, label, value) {
  return '<div class="teacher-report-metric"><span>' + icon + ' ' + label + '</span><strong>' + _escapeHtml(value) + '</strong></div>';
}

function _buildReportSummaryTile(icon, label, value, unit) {
  return '<div class="teacher-summary-tile"><span>' + icon + '</span><small>' + label + '</small><strong>' + _escapeHtml(value) + '</strong><em>' + _escapeHtml(unit) + '</em></div>';
}

function _buildReportStars(count) {
  var html = '';
  for (var i = 0; i < 3; i++) {
    html += '<span class="' + (i < count ? 'is-on' : 'is-off') + '">★</span>';
  }
  return html;
}

function _buildReportTimelineStep(step) {
  return '<div class="teacher-timeline-step ' + (step.complete ? 'is-complete' : 'is-pending') + '">' +
    '<span class="teacher-timeline-step__icon">' + step.icon + '</span>' +
    '<strong>' + _escapeHtml(step.label) + '</strong>' +
    '<em>' + _escapeHtml(step.time) + '</em>' +
    '<b>' + (step.complete ? '✓' : '-') + '</b>' +
  '</div>';
}

function _buildReportLateRow(label, value) {
  return '<div class="teacher-late-row"><span>' + _escapeHtml(label) + '</span><strong>' + _escapeHtml(value) + '</strong></div>';
}

function _buildReportGoodItems(judgment, reqStatus) {
  if (judgment === 'success' || judgment === 'incomplete') {
    return ['알람을 맞추고 일어났어요.', '필요한 준비물을 확인했어요.', '회사에 시간에 맞춰 도착했어요.'];
  }
  if (judgment === 'late') {
    return ['출근 과정을 끝까지 완료했어요.', '버스와 정류장 정보를 확인했어요.', '회사까지 이동했어요.'];
  }
  var missing = reqStatus && reqStatus.missing && reqStatus.missing.length ? '누락 준비물: ' + reqStatus.missing.join(', ') : '출근 순서를 다시 확인했어요.';
  return ['출근 연습을 끝까지 시도했어요.', missing, '다시 연습할 준비가 되었어요.'];
}

function _buildReportRetryItems(judgment, primary, status) {
  var retry = primary && primary.retryMessage ? primary.retryMessage : status.recommendation;
  if (judgment === 'success' || judgment === 'incomplete') {
    return ['오늘처럼 출발 시간을 기억해요.', '가방 확인을 계속 유지해요.'];
  }
  if (judgment === 'late') {
    return [retry, '내릴 정류장을 한 번 더 확인해요.'];
  }
  return [retry, '출근 순서를 카드처럼 하나씩 따라가요.'];
}

/**
 * 학급 전체 요약 테이블 HTML 생성
 *
 * @param {Array<Object>} history - 게임 기록 배열
 * @returns {string} HTML 문자열
 */
function generateSummaryTable(history) {
  if (!history || history.length === 0) {
    return '<p class="no-data">아직 기록이 없습니다.</p>';
  }

  var html = '';
  html += '<div class="report-summary">';
  html += '<h2 class="report-title">📊 학급 출근 시뮬레이션 요약</h2>';

  // 통계 계산
  var stats = { success: 0, incomplete: 0, late: 0, fail: 0, total: history.length };
  for (var s = 0; s < history.length; s++) {
    var j = history[s].judgment;
    if (stats[j] !== undefined) {
      stats[j]++;
    }
  }

  // 통계 요약
  html += '<div class="summary-stats">';
  html += '<span class="stat-item stat-success">🎉 성공: ' + stats.success + '</span>';
  html += '<span class="stat-item stat-incomplete">⚠️ 준비부족: ' + stats.incomplete + '</span>';
  html += '<span class="stat-item stat-late">⏰ 지각: ' + stats.late + '</span>';
  html += '<span class="stat-item stat-fail">❌ 실패: ' + stats.fail + '</span>';
  html += '<span class="stat-item stat-total">📊 총: ' + stats.total + '회</span>';
  html += '</div>';

  // 테이블
  html += '<table class="summary-table">';
  html += '<thead>';
  html += '<tr>';
  html += '<th>이름</th>';
  html += '<th>수준</th>';
  html += '<th>결과</th>';
  html += '<th>도착시간</th>';
  html += '<th>가방상태</th>';
  html += '<th>날짜</th>';
  html += '</tr>';
  html += '</thead>';
  html += '<tbody>';

  for (var i = 0; i < history.length; i++) {
    var record = history[i];
    var judgmentInfo = _getJudgmentInfo(record.judgment);
    var bagStatusStr = _formatBagStatus(record.bagStatus);
    var dateDisplay = '';

    if (record.date) {
      var d = new Date(record.date);
      dateDisplay = (d.getMonth() + 1) + '/' + d.getDate();
    }

    html += '<tr class="' + judgmentInfo.cssClass + '">';
    html += '<td>' + _escapeHtml(record.studentName || '') + '</td>';
    html += '<td>' + _escapeHtml(record.level || '') + '</td>';
    html += '<td>' + judgmentInfo.emoji + ' ' + judgmentInfo.label + '</td>';
    html += '<td>' + (record.arrivalTime ? formatTime(record.arrivalTime) : '-') + '</td>';
    html += '<td>' + bagStatusStr + '</td>';
    html += '<td>' + dateDisplay + '</td>';
    html += '</tr>';
  }

  html += '</tbody>';
  html += '</table>';
  html += '</div>';

  return html;
}

/**
 * 인쇄 실행
 */
function printReport() {
  window.print();
}

/**
 * 행동 로그에서 비최적 선택으로 인한 지연 원인 분석
 *
 * @param {Array<Object>} actionLog - 행동 로그 배열
 * @returns {Array<Object>} { action, timeCost } 배열 — 비최적 선택 중 시간 소요가 있는 것
 */
function getCauseAnalysis(actionLog) {
  var causes = [];

  if (!actionLog) return causes;

  for (var i = 0; i < actionLog.length; i++) {
    var entry = actionLog[i];

    // timeCost가 양수이고, 결과 텍스트에 부정적 키워드가 있으면 비최적 선택으로 간주
    if (entry.timeCost > 0) {
      var consequence = (entry.consequence || '').toLowerCase();
      var isNonOptimal = false;

      // 부정적 키워드 체크
      var negativeKeywords = ['늦', '지각', '놓', '잃', '잊', '빠뜨', '실수', '다시', '돌아'];
      for (var k = 0; k < negativeKeywords.length; k++) {
        if (consequence.indexOf(negativeKeywords[k]) >= 0) {
          isNonOptimal = true;
          break;
        }
      }

      // 소요 시간이 15분 이상이면 비최적으로 간주
      if (entry.timeCost >= 15) {
        isNonOptimal = true;
      }

      if (isNonOptimal) {
        causes.push({
          action: entry.action,
          timeCost: entry.timeCost
        });
      }
    }
  }

  return causes;
}

/**
 * 가방 상태를 간략 문자열로 변환 (내부 유틸리티)
 * @param {Object|Array} bagStatus - 가방 상태 (다양한 형태 대응)
 * @returns {string}
 */
function _formatBagStatus(bagStatus) {
  if (!bagStatus) return '-';

  // 배열인 경우 ([ { name, checked } ... ])
  if (Array.isArray(bagStatus)) {
    var checked = 0;
    var total = 0;
    for (var i = 0; i < bagStatus.length; i++) {
      if (bagStatus[i].required) {
        total++;
        if (bagStatus[i].checked) checked++;
      }
    }
    if (total === 0) {
      total = bagStatus.length;
      for (var a = 0; a < bagStatus.length; a++) {
        if (bagStatus[a].checked) checked++;
      }
    }
    return checked + '/' + total;
  }

  // 객체인 경우 (bag 구조)
  if (typeof bagStatus === 'object') {
    var keys = Object.keys(bagStatus);
    var requiredTotal = 0;
    var done = 0;
    for (var j = 0; j < keys.length; j++) {
      var item = bagStatus[keys[j]];
      if (item && item.required) {
        requiredTotal++;
        if (item.checked || item === true) {
          done++;
        }
      }
    }
    return done + '/' + requiredTotal;
  }

  return String(bagStatus);
}

/**
 * HTML 이스케이프 (XSS 방지 — 내부 유틸리티)
 * @param {string} str
 * @returns {string}
 */
function _escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 행동 로그 및 최종 상태를 분석하여 교사용 AI 맞춤 피드백 보고서를 생성한다.
 * @param {Object} state - 현재 게임 상태
 * @returns {string} HTML 및 마크다운이 가미된 피드백 문자열
 */
function generateAICoachingFeedback(state) {
  var studentName = state.student.name || '학생';
  var log = state.actionLog || [];
  var weather = state.weather || 'clear';
  var reqStatus = getRequiredItemsStatus();
  
  var lateWakeCount = 0;
  var weatherChecked = state.flags.weatherChecked;
  var dangerousChoiceCount = 0;
  var greeted = false;
  
  for (var i = 0; i < log.length; i++) {
    var entry = log[i];
    var action = entry.action || '';
    
    // 늦은 기상 체크
    if (action.indexOf('10분 더') >= 0 || action.indexOf('계속 자기') >= 0 || action.indexOf('5분만') >= 0) {
      lateWakeCount++;
    }
    // 위험 행동 체크 (낯선 사람 차 탑승 등)
    if (entry.consequence && (entry.consequence.indexOf('위험') >= 0 || entry.consequence.indexOf('절대 안') >= 0)) {
      dangerousChoiceCount++;
    }
    // 인사 예절 체크
    if (action.indexOf('인사') >= 0 && entry.consequence && entry.consequence.indexOf('반갑게') >= 0) {
      greeted = true;
    }
  }

  var feedbackText = '';
  
  // 1. 기상 영역 피드백
  if (lateWakeCount === 0) {
    feedbackText += '⏰ <strong>기상 및 시간 관리</strong>: 알람이 울렸을 때 즉시 일어나는 매우 높은 자조 능력을 보였습니다. 규칙적인 아침 출근 습관이 매우 잘 형성되어 있습니다. ';
  } else {
    feedbackText += '⏰ <strong>기상 및 시간 관리</strong>: 기상 시 알람을 미루거나 이불 속에서 더 머무는 등 기상 지연이 관찰되었습니다. 정시 출근을 위해 알람 소리를 듣자마자 몸을 움직이는 반복 자립 훈련이 필요합니다. ';
  }
  
  // 2. 소지품 준비 피드백
  feedbackText += '<br><br>🎒 <strong>소지품 준비</strong>: ';
  if (weatherChecked) {
    feedbackText += '출발 전에 오늘의 날씨 정보 브리핑을 스스로 확인하고 계획적으로 대응한 점이 훌륭합니다. ';
  } else {
    feedbackText += '출발 전에 날씨 상황을 주도적으로 확인하는 단계를 누락했습니다. 날씨에 맞게 준비물을 챙기기 위해 날씨 확인을 생활화하는 훈련을 권장합니다. ';
  }
  
  if (reqStatus.allRequired) {
    feedbackText += '오늘 필요한 준비물을 빠짐없이 철저하게 지참하여 준비도 부문에서 좋은 성취도를 보였습니다. ';
  } else {
    feedbackText += '금일 출근 필수 물품인 ' + reqStatus.missing.join(', ') + '을(를) 누락했습니다. 외출 전 체크리스트 카드를 짚으며 물건을 더블 체크하는 보완 훈련이 효과적일 것입니다. ';
  }
  
  // 3. 이동 및 보행 안전 피드백
  feedbackText += '<br><br>🚶 <strong>이동 및 위급 대처</strong>: ';
  if (dangerousChoiceCount > 0) {
    feedbackText += '이동 중 낯선 사람의 차량 탑승 유혹이나 미끄러운 눈길 보행 등 안전에 위협이 되는 비최적 선택지를 고르는 모습이 확인되었습니다. 위급 상황 시 거절하기 의사표현 및 보행 안전 수칙에 관한 구체적 지도를 추천합니다. ';
  } else {
    feedbackText += '눈길 보행, 공사장 우회, 낯선 사람의 위험한 차량 탑승 유혹 차단 등 통학로 상의 돌발 위험 요소에 직면했을 때 안전 수칙을 완벽하게 준수하여 올바르게 대처했습니다. ';
  }
  
  // 4. 도착 사회성 피드백
  feedbackText += '<br><br>👋 <strong>도착 및 직장 생활 태도</strong>: ';
  if (greeted) {
    feedbackText += '직장에 도착하여 사장님과 직장 동료들에게 우렁차고 쾌활한 목소리로 인사를 건네며 매우 훌륭한 대인관계 소양과 직장인 기본 에티켓을 증명했습니다. ';
  } else {
    feedbackText += '도착 후 대인관계 소통에서 먼저 다가가 인사를 적극적으로 건네는 훈련을 지속한다면 실제 직장 배치 시 동료들과 원만한 관계를 맺는 데 큰 도움이 될 것입니다. ';
  }
  
  // 5. 종합 AI 처방 피드백
  feedbackText += '<br><br>💡 <strong>AI 종합 처방</strong>: ' + studentName + ' 학생은 ';
  var judgment = getJudgment();
  var iepSuggestion = '';

  if (judgment === 'success') {
    feedbackText += '시간 관리, 준비도, 돌발 상황 대처 및 대인 관계 모든 면에서 무결점의 뛰어난 출근 성과를 얻었습니다. 실제 근로 환경에서도 성공적인 독립 생활과 직장 적응이 기대됩니다.';
    iepSuggestion = '<strong>독립적 통근 심화 교육</strong>: 현재 최상위 성취도를 보이므로, 향후 버스 지연/노선 우회 등 난이도 높은 돌발 변수를 추가한 모의 훈련으로 심화하고 직업 실습 파견 시 주도적인 교통수단 변경 훈련을 IEP 장기 목표로 설정할 것을 제안합니다.';
  } else if (judgment === 'incomplete') {
    feedbackText += '시간 약속은 준수하였으나 준비물 수집에서 아쉬운 점이 남습니다. 가정과 연계하여 등교(출근) 전날 밤 가방을 미리 싸두는 보완 행동 훈련을 제안합니다.';
    iepSuggestion = '<strong>소지품 체크리스트 형성 루틴</strong>: 등교(출근) 전 스스로 소지품을 짚어가며 확인할 수 있는 픽토그램 카드나 체크리스트 시각 자료 활용을 권장합니다. 전날 밤 가방을 미리 싸놓고 아침에 더블체크하는 구조화 훈련을 IEP 핵심 목표로 제안합니다.';
  } else if (judgment === 'late') {
    feedbackText += '준비물 수집과 대인 태도는 좋았으나 출근 지연 시간이 누적되어 지각하게 되었습니다. 아침 기상 알람 소리에 맞추어 신속히 행동하는 순발력 훈련을 집중 시행할 것을 제안합니다.';
    iepSuggestion = '<strong>시간 인지 및 속도 감각 훈련</strong>: 기상 및 출근 준비 루틴에 빨간색 아날로그 시각 타이머(Time Timer 등)를 도입하여 줄어드는 시간을 시각적으로 체감하도록 돕습니다. 준비 시간을 5분씩 단축하는 보상 행동 치료를 IEP에 연계할 것을 제안합니다.';
  } else {
    feedbackText += '시간 소요가 심각하게 지연되거나 안전에 중대한 위협이 되는 선택을 하였습니다. 보행 안전 및 소지품 챙기기에 대한 교사의 개별 밀착형 지도 교육을 제안합니다.';
    iepSuggestion = '<strong>보행 안전 및 1:1 관찰 지도</strong>: 낯선 사람 거절하기 의사소통 수칙 및 공사장 우회 등 안전 수칙을 명확하게 카드화하여 인지시키고, 가상 시뮬레이션 반복과 더불어 실제 등교길에 보조 교사가 동행하는 1:1 현장 실태 관찰 중심의 IEP 목표 수립을 추천합니다.';
  }

  // 6. IEP 학생 수준별 연동 팁 추가
  feedbackText += '<br><br>🏫 <strong>IEP 특수교육 연동 제안 (수준 \'' + state.student.level + '\' 맞춤)</strong>: ';
  feedbackText += iepSuggestion + ' ';
  if (state.student.level === '다') {
    feedbackText += '특히 본 학생은 다 수준(텍스트 해득 보조 필요)이므로, 글자로 된 안내보다는 소지품 가방에 체크리스트 링카드를 부착해 촉각적/시각적으로 짚어가며 훈련시키는 물리적 비계(Visual Scaffolding)를 수업 시 우선 배치해주십시오.';
  } else if (state.student.level === '나') {
    feedbackText += '본 학생은 나 수준(아이콘+단순 텍스트 매치)이므로, 핵심 행동이 적힌 그림 카드를 순서대로 배열해보는 놀이 중심의 시연 수업(Role Play)을 병행해주십시오.';
  } else {
    feedbackText += '본 학생은 가 수준(상세 문장 이해 가능)이므로, 행동에 따른 논리적 실패 시나리오 결과를 서술식으로 성찰 일지에 적어보게 하는 메타 인지 반성 작성을 제안합니다.';
  }

  return feedbackText;
}
