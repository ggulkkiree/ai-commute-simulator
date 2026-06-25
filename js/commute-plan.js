// 출근 경로 안내 + AI 출근 계획 계산
(function () {
  'use strict';

  var dom = {};
  var bound = false;
  var AUTO_READY_MINUTES = 40;
  var AUTO_BUFFER_MINUTES = 10;
  var INPUT_SCREEN_TITLE = '🤖 AI에게 출근 정보를 알려주세요!';
  var RESULT_SCREEN_TITLE = '🎉 AI 출근 계획이 완성됐어요!';

  function getRouteData() {
    var info = gameState.todayInfo || {};
    var bus = gameState.busInfo || createBusInfo(info.workStartTime || gameState.time.target || 600);
    var workTime = info.workStartTime || gameState.time.target || 600;
    var walkToStop = bus.correctStop.walkMinutesFromHome;
    var ride = bus.rideMinutes;
    var walkToWork = bus.walkMinutesAfterBus;
    var total = walkToStop + ride + walkToWork;
    var busTime = workTime - walkToWork - ride;
    return {
      workplace: info.workplace || '본앤하이리',
      workTime: workTime,
      busNumber: bus.correctBusNumber,
      busTime: busTime,
      departureTime: busTime - walkToStop,
      walkToStop: walkToStop,
      ride: ride,
      walkToWork: walkToWork,
      total: total,
      stopName: bus.correctStop.name,
      getOffStop: bus.targetGetOffStop
    };
  }

  function timeText(minutes) {
    return typeof formatTime === 'function' ? formatTime(minutes) : '00:00';
  }

  window.renderCommuteRouteScreen = function () {
    var route = getRouteData();
    var area = document.getElementById('briefing-content-area');
    var button = document.getElementById('btn-briefing-start');
    if (!area) return;
    area.innerHTML =
      '<div class="route-mission__hero">' +
        '<div class="route-mission__title">' +
          '<span>🗺 출근 미션</span>' +
          '<h1>오늘은 이렇게 출근해요!</h1>' +
          '<p><strong>' + timeText(route.workTime) + '</strong>까지 도착하려면 <strong>' +
            timeText(route.departureTime) + '</strong>에 출발해요. <strong>' +
            route.busNumber + '번</strong> 버스를 타고 회사까지 가요!</p>' +
        '</div>' +
        '<div class="route-mission__ai"><b>🤖</b><span>경로 정보를 확인하고<br>다음 화면에서 나에게 알려주세요!</span></div>' +
      '</div>' +
      '<div class="route-mission__summary">' +
        '<div><span>출근 시간</span><strong>' + timeText(route.workTime) + '</strong></div>' +
        '<div class="route-mission__summary--accent"><span>추천 출발 시간</span><strong>' + timeText(route.departureTime) + '</strong></div>' +
        '<div class="route-mission__summary--total"><span>총 이동 시간</span><strong>' + route.total + '분</strong></div>' +
        '<div class="route-mission__bus-number"><span>타는 버스</span><strong>' + route.busNumber + '</strong><em>번</em></div>' +
      '</div>' +
      '<div class="route-mission__map">' +
        '<div class="route-mission__place route-mission__place--home">' +
          '<b class="route-mission__step">1</b><i>🏠</i><span>출발</span><strong>우리 집</strong>' +
        '</div>' +
        '<div class="route-mission__leg route-mission__leg--walk"><span>🚶 도보</span><strong>' + route.walkToStop + '분</strong><i></i></div>' +
        '<div class="route-mission__place route-mission__place--stop">' +
          '<b class="route-mission__step">2</b><i>🚏</i><span>출발 정류장</span><strong>' + route.stopName + '</strong>' +
        '</div>' +
        '<div class="route-mission__leg route-mission__leg--bus"><span>' + timeText(route.busTime) + ' 탑승</span><strong>' + route.ride + '분</strong><i></i></div>' +
        '<div class="route-mission__place route-mission__place--bus">' +
          '<b class="route-mission__step">3</b><i>🚌</i><span>타는 버스</span>' +
          '<strong>' + route.busNumber + '번 버스</strong><em>버스로 이동</em>' +
        '</div>' +
        '<div class="route-mission__leg route-mission__leg--route"><span>정류장 도착</span><strong>→</strong><i></i></div>' +
        '<div class="route-mission__place route-mission__place--arrival">' +
          '<b class="route-mission__step">4</b><i>🚏</i><span>도착 정류장</span><strong>' + route.getOffStop + '</strong>' +
        '</div>' +
        '<div class="route-mission__leg route-mission__leg--walk"><span>🚶 도보</span><strong>' + route.walkToWork + '분</strong><i></i></div>' +
        '<div class="route-mission__place route-mission__place--work">' +
          '<b class="route-mission__step">5</b><i>🏢</i><span>최종 도착</span><strong>' + route.workplace + '</strong>' +
        '</div>' +
      '</div>' +
      '<div class="route-mission__sentence">' +
        '<b>경로 요약</b>' +
        '<span>우리 집 → <strong>' + route.stopName + '</strong></span>' +
        '<span><strong>' + route.busNumber + '번</strong> 버스</span>' +
        '<span><strong>' + route.getOffStop + '</strong> → ' + route.workplace + '</span>' +
      '</div>';
    if (button) {
      button.disabled = false;
      button.textContent = '출근 정보 입력하기';
    }
  };

  function cacheDom() {
    dom.plan = document.querySelector('#screen-ai-plan .ai-plan');
    dom.headerTitle = document.querySelector('#screen-ai-plan .ai-plan__header h2');
    dom.formView = document.getElementById('ai-plan-form-view');
    dom.form = document.getElementById('ai-plan-form');
    dom.thinking = document.getElementById('ai-plan-thinking');
    dom.result = document.getElementById('ai-plan-result');
    dom.review = document.getElementById('btn-ai-plan-info');
    dom.calculate = document.getElementById('btn-ai-calculate');
    dom.modal = document.getElementById('ai-route-review-modal');
    dom.modalContent = document.getElementById('ai-route-review-content');
    dom.modalClose = document.getElementById('btn-ai-route-review-close');
    dom.modalX = document.getElementById('btn-ai-route-review-x');
    dom.formMessage = document.getElementById('ai-plan-form-message');
    dom.tipTotalTime = document.getElementById('ai-tip-total-time');
    dom.tipDepartureTime = document.getElementById('ai-tip-departure-time');
    dom.tipBusNumber = document.getElementById('ai-tip-bus-number');
  }

  function bindEvents() {
    if (bound) return;
    bound = true;
    dom.review.addEventListener('click', openReview);
    dom.modalClose.addEventListener('click', closeReview);
    dom.modalX.addEventListener('click', closeReview);
    dom.modal.addEventListener('click', function (event) {
      if (event.target === dom.modal) closeReview();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (!dom.modal.hidden) {
        closeReview();
      }
    });
    dom.form.addEventListener('click', handleInlineClockClick);
    dom.form.addEventListener('input', updateCalculateState);
    dom.form.addEventListener('change', updateCalculateState);
    dom.calculate.addEventListener('click', calculatePlan);
  }

  window.initAICommutePlanScreen = function () {
    cacheDom();
    bindEvents();
    dom.plan.classList.remove('ai-plan--result');
    dom.headerTitle.textContent = INPUT_SCREEN_TITLE;
    dom.formView.hidden = false;
    dom.thinking.hidden = true;
    dom.result.hidden = true;
    dom.form.reset();
    Array.prototype.forEach.call(dom.form.querySelectorAll('[data-inline-clock]'), syncClockDisplay);
    updateAutomaticTip();
    updateCalculateState();
  };

  function openReview() {
    var route = getRouteData();
    dom.modalContent.innerHTML =
      '<div><span>출근 시간</span><strong>' + timeText(route.workTime) + '</strong></div>' +
      '<div><span>버스 번호</span><strong>' + route.busNumber + '번</strong></div>' +
      '<div><span>버스 도착 시간</span><strong>' + timeText(route.busTime) + '</strong></div>' +
      '<div class="ai-route-review__station"><span>출발 정류장</span><strong>' + route.stopName + '</strong></div>' +
      '<div class="ai-route-review__station"><span>도착 정류장</span><strong>' + route.getOffStop + '</strong></div>' +
      '<div><span>집 → 정류장</span><strong>' + route.walkToStop + '분</strong></div>' +
      '<div><span>버스 이동</span><strong>' + route.ride + '분</strong></div>' +
      '<div><span>정류장 → 회사</span><strong>' + route.walkToWork + '분</strong></div>';
    dom.modal.hidden = false;
    dom.modalX.focus();
  }

  function closeReview() {
    dom.modal.hidden = true;
    dom.review.focus();
  }

  function handleInlineClockClick(event) {
    var button = event.target.closest('[data-clock-part][data-clock-delta]');
    if (!button) return;
    var clock = button.closest('[data-inline-clock]');
    var input = clock ? document.getElementById(clock.getAttribute('data-inline-clock')) : null;
    if (!input) return;

    var parts = String(input.value || '00:00').split(':');
    var hour = parseInt(parts[0], 10) || 0;
    var minute = parseInt(parts[1], 10) || 0;
    var delta = parseInt(button.getAttribute('data-clock-delta'), 10) || 0;

    if (button.getAttribute('data-clock-part') === 'hour') {
      hour = (hour + delta + 24) % 24;
    } else {
      minute = (minute + delta + 60) % 60;
    }

    input.value = String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
    syncClockDisplay(clock);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    clock.classList.remove('is-ticking');
    void clock.offsetWidth;
    clock.classList.add('is-ticking');
  }

  function syncClockDisplay(clock) {
    var input = clock ? document.getElementById(clock.getAttribute('data-inline-clock')) : null;
    if (!input) return;
    var parts = String(input.value || '00:00').split(':');
    var hour = clock.querySelector('[data-clock-output="hour"]');
    var minute = clock.querySelector('[data-clock-output="minute"]');
    if (hour) hour.textContent = String(parseInt(parts[0], 10) || 0).padStart(2, '0');
    if (minute) minute.textContent = String(parseInt(parts[1], 10) || 0).padStart(2, '0');
  }

  function updateAutomaticTip() {
    var route = getRouteData();
    if (dom.tipTotalTime) dom.tipTotalTime.textContent = route.total + '분';
    if (dom.tipDepartureTime) dom.tipDepartureTime.textContent = timeText(route.departureTime);
    if (dom.tipBusNumber) dom.tipBusNumber.textContent = route.busNumber + '번';
  }

  function updateCalculateState() {
    var fields = Array.prototype.slice.call(dom.form.querySelectorAll('input[required], select[required]'));
    var complete = fields.every(function (field) {
      return field.value !== '' && field.checkValidity();
    });
    dom.calculate.disabled = !complete;
    dom.calculate.setAttribute('aria-disabled', String(!complete));
    dom.formMessage.textContent = complete
      ? '입력이 끝났어요. AI가 계산해주기를 눌러주세요!'
      : '출근 정보를 모두 입력해 주세요.';
    dom.formMessage.classList.toggle('is-ready', complete);
  }

  function parseClock(value) {
    var parts = String(value || '').split(':');
    return (parseInt(parts[0], 10) * 60) + parseInt(parts[1], 10);
  }

  function numberValue(id) {
    return Math.max(0, parseInt(document.getElementById(id).value, 10) || 0);
  }

  function calculatePlan() {
    if (!dom.form.checkValidity()) {
      dom.formMessage.textContent = '모르는 정보는 출근 정보 다시 보기에서 확인해 주세요.';
      dom.form.reportValidity();
      return;
    }
    var route = getRouteData();
    var values = {
      workTime: parseClock(document.getElementById('ai-work-time').value),
      startStop: document.getElementById('ai-start-stop').value,
      endStop: document.getElementById('ai-end-stop').value,
      busNumber: numberValue('ai-bus-number'),
      busTime: parseClock(document.getElementById('ai-bus-time').value),
      ride: numberValue('ai-bus-ride'),
      walkToStop: route.walkToStop,
      walkToWork: route.walkToWork,
      ready: AUTO_READY_MINUTES,
      buffer: AUTO_BUFFER_MINUTES
    };
    values.departure = values.busTime - values.walkToStop;
    values.busGetOff = values.busTime + values.ride;
    values.workArrival = values.busGetOff + values.walkToWork;
    values.wake = values.departure - values.ready - values.buffer;

    gameState.aiCommutePlan = values;
    gameState.plan.departureTime = values.departure;
    if (!gameState.flags) gameState.flags = {};
    gameState.flags.aiPlanCompleted = true;
    if (!gameState.evePrep) gameState.evePrep = {};
    if (typeof gameState.evePrep.alarmTime !== 'number') {
      gameState.evePrep.alarmTime = values.wake;
    }

    dom.formView.hidden = true;
    dom.thinking.hidden = false;
    dom.result.hidden = true;
    window.setTimeout(function () {
      showResult(values);
    }, 1500);
  }

  function showResult(values) {
    dom.thinking.hidden = true;
    dom.result.hidden = false;
    dom.plan.classList.add('ai-plan--result');
    dom.headerTitle.textContent = RESULT_SCREEN_TITLE;
    dom.result.innerHTML =
      '<section class="ai-plan__result-coach">' +
        '<div class="ai-plan__result-badge">⭐ AI 출근 계획 완성</div>' +
        '<div class="ai-plan__result-character" aria-hidden="true">🤖</div>' +
        '<div class="ai-plan__result-speech">' +
          '<span>출근 계획 요약</span>' +
          '<h2>오늘의 출근 계획</h2>' +
          '<p>네 가지 시간을 차례로 확인해요.</p>' +
        '</div>' +
        '<div class="ai-plan__result-summary">' +
          resultSummary('⏰', '일어날 시간', timeText(values.wake), 'wake') +
          resultSummary('🏠', '집에서 출발', timeText(values.departure), 'depart') +
          resultSummary('🚌', '버스 타는 시간', timeText(values.busTime), 'bus') +
          resultSummary('🏢', '도착 예상 시간', timeText(values.workArrival), 'work') +
        '</div>' +
        '<p class="ai-plan__result-auto-note">AI 자동 반영: 아침 준비 40분 · 여유 10분</p>' +
      '</section>' +
      '<div class="ai-plan__timeline">' +
        '<div class="ai-plan__timeline-title"><span>📅 오늘의 출근 순서</span><strong>시간대로 따라가요</strong></div>' +
        planStep(1, '⏰', timeText(values.wake), '일어나기', '아침 준비를 시작해요.', 'green') +
        planStep(2, '🏠', timeText(values.departure), '집에서 출발', '정류장으로 이동해요.', 'blue') +
        planStep(3, '🚌', timeText(values.busTime), values.busNumber + '번 버스 탑승', '버스를 타고 이동해요.', 'purple') +
        planStep(4, '🚏', timeText(values.busGetOff), '버스에서 내리기', '회사까지 걸어가요.', 'orange') +
        planStep(5, '🏢', timeText(values.workArrival), '회사 도착', '출근 계획 완료!', 'success') +
      '</div>' +
      '<footer class="ai-plan__result-actions">' +
        '<button id="btn-ai-plan-edit" type="button">↻ 입력 다시 보기</button>' +
        '<button id="btn-ai-plan-continue" type="button">🎒 전날 가방 챙기기</button>' +
      '</footer>';
    document.getElementById('btn-ai-plan-edit').addEventListener('click', function () {
      dom.plan.classList.remove('ai-plan--result');
      dom.headerTitle.textContent = INPUT_SCREEN_TITLE;
      dom.result.hidden = true;
      dom.formView.hidden = false;
    });
    document.getElementById('btn-ai-plan-continue').addEventListener('click', continueToPreparation);
  }

  function resultSummary(icon, label, value, tone) {
    return '<div class="ai-plan__result-summary-card ai-plan__result-summary-card--' + tone + '">' +
      '<i aria-hidden="true">' + icon + '</i><span>' + label + '</span><strong>' + value + '</strong></div>';
  }

  function planStep(number, icon, time, title, detail, tone) {
    return '<div class="ai-plan__timeline-step ai-plan__timeline-step--' + tone + '">' +
      '<b class="ai-plan__timeline-number">' + number + '</b>' +
      '<time>' + time + '</time>' +
      '<i aria-hidden="true">' + icon + '</i>' +
      '<div><strong>' + title + '</strong><span>' + detail + '</span></div></div>';
  }

  function continueToPreparation() {
    if (typeof initEvePrepAfterAIPlan === 'function') {
      initEvePrepAfterAIPlan();
      return;
    }
    console.error('전날 가방 챙기기 화면 초기화 함수를 찾을 수 없습니다.');
  }
})();
