// 가수준 아침 준비 게임: 전체화면 활동 흐름
(function () {
  'use strict';

  var bound = false;
  var busy = false;
  var dom = {};

  var activities = {
    shower: { label: '샤워하기', icon: '🚿', minutes: 10 },
    eat: { label: '아침 먹기', icon: '🥣', minutes: 10 },
    brush: { label: '양치하기', icon: '🪥', minutes: 5 },
    dress: { label: '옷 입기', icon: '👕', minutes: 5 },
    bag: { label: '가방 챙기기', icon: '🎒', minutes: 5 }
  };

  function cacheDom() {
    dom.alarmTime = document.getElementById('alarm-ring-time');
    dom.alarmCurrentTime = document.getElementById('alarm-current-time');
    dom.alarmSceneClock = document.getElementById('alarm-scene-clock');
    dom.snoozeFeedback = document.getElementById('alarm-snooze-feedback');
    dom.wakeNow = document.getElementById('btn-alarm-wake-now');
    dom.snooze = document.getElementById('btn-alarm-snooze');
    dom.scene = document.getElementById('morning-scene-image');
    dom.currentTime = document.getElementById('morning-current-time-game');
    dom.targetTime = document.getElementById('morning-target-time-game');
    dom.bubbleTitle = document.getElementById('morning-main-bubble-title');
    dom.bubbleText = document.getElementById('morning-main-bubble-text');
    dom.sparkles = document.getElementById('morning-character-sparkles');
    dom.guide = document.getElementById('morning-game-guide');
    dom.next = document.getElementById('btn-morning-next-game');
    dom.activityGrid = document.getElementById('morning-activity-grid-game');
    dom.overlay = document.getElementById('morning-action-overlay-game');
    dom.workInfo = document.getElementById('btn-morning-work-info-game');
    dom.help = document.getElementById('btn-morning-help-game');
  }

  function ensureState() {
    if (!window.gameState) return;
    if (!gameState.morningPrep) gameState.morningPrep = {};
    if (!Array.isArray(gameState.morningPrep.completedActivities)) {
      gameState.morningPrep.completedActivities = [];
    }
    if (!Array.isArray(gameState.morningPrep.routinesDone)) {
      gameState.morningPrep.routinesDone = [];
    }
  }

  function completed() {
    ensureState();
    return gameState && gameState.morningPrep ? gameState.morningPrep.completedActivities : [];
  }

  function addCompleted(id) {
    if (completed().indexOf(id) === -1) completed().push(id);
    if (gameState.morningPrep.routinesDone.indexOf(id) === -1) {
      gameState.morningPrep.routinesDone.push(id);
    }
    if (typeof markMorningActivityCompleted === 'function') markMorningActivityCompleted(id);
  }

  function bindEvents() {
    if (bound) return;
    bound = true;

    if (dom.wakeNow) dom.wakeNow.addEventListener('click', function () { wakeUp(false); });
    if (dom.snooze) dom.snooze.addEventListener('click', function () { wakeUp(true); });
    if (dom.next) dom.next.addEventListener('click', goToCommuteRoute);

    if (dom.activityGrid) {
      dom.activityGrid.addEventListener('click', function (event) {
        var button = event.target.closest('[data-game-activity]');
        if (!button || button.disabled || busy) return;
        var id = button.getAttribute('data-game-activity');
        selectActivity(id, button);
      });
    }

    if (dom.workInfo) {
      dom.workInfo.addEventListener('click', function () {
        showInfoScene('💼', '오늘의 출근 정보', [
          '목표 출근 시간 ' + formatGameTime(getTargetTime()),
          '준비를 마치고 여유 있게 출발해요.',
          '원하는 활동부터 자유롭게 선택할 수 있어요.'
        ]);
      });
    }

    if (dom.help) {
      dom.help.addEventListener('click', function () {
        showInfoScene('❔', '도움말', [
          '아래 활동 카드를 눌러 아침 준비를 해요.',
          '끝난 활동은 체크되고 다시 누를 수 없어요.',
          '샤워 장면은 김과 거품으로 안전하게 표현돼요.'
        ]);
      });
    }

  }

  function wakeUp(snoozed) {
    ensureState();
    if (!gameState.evePrep) gameState.evePrep = {};
    var alarm = getConfiguredAlarmTime();

    if (snoozed) {
      var count = gameState.evePrep.snoozeCount || 0;
      if (count >= 1) return;
      gameState.evePrep.snoozeCount = count + 1;
      gameState.evePrep.alarmTime = alarm + 10;
      gameState.alarmTime = alarm + 10;
      gameState.time.current = alarm + 10;
      if (dom.snoozeFeedback) dom.snoozeFeedback.textContent = '10분 더 잤어요.';
      if (typeof startAlarmSleepFlow === 'function') {
        window.setTimeout(function () {
          startAlarmSleepFlow(alarm + 10, true);
        }, 650);
      }
      return;
    }

    gameState.evePrep.alarmTime = alarm;
    gameState.alarmTime = alarm;
    gameState.time.current = alarm;
    gameState.startTime = alarm;
    if (!gameState.commute) gameState.commute = {};
    gameState.commute.wakeTime = alarm;
    gameState.morningPrep.wokeUpEarly = true;
    gameState.morningPrep.gameRedesignStarted = true;
    gameState.phase = 'morning-prep';
    showScreen('screen-morning-prep');
    window.initMorningPrepScreen();
  }

  function getTargetTime() {
    return gameState && gameState.time && typeof gameState.time.target === 'number'
      ? gameState.time.target
      : 600;
  }

  function getConfiguredAlarmTime() {
    if (gameState && gameState.evePrep && typeof gameState.evePrep.alarmTime === 'number') {
      return gameState.evePrep.alarmTime;
    }
    if (gameState && typeof gameState.alarmTime === 'number') {
      return gameState.alarmTime;
    }
    if (gameState && gameState.time && typeof gameState.time.current === 'number') {
      return gameState.time.current;
    }
    return 500;
  }

  function formatGameTime(minutes) {
    if (typeof formatTime === 'function') return formatTime(minutes);
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    return String(hours).padStart(2, '0') + ':' + String(mins).padStart(2, '0');
  }

  function updateTime() {
    if (!gameState.time) gameState.time = {};
    dom.currentTime.textContent = formatGameTime(gameState.time.current);
    dom.targetTime.textContent = formatGameTime(getTargetTime());
  }

  function renderMain() {
    var dressed = !!gameState.morningPrep.dressedForWork;
    dom.scene.src = dressed ? 'assets/images/morning-room-dressed.png' : 'assets/images/morning-room-game-clean.png';
    dom.scene.alt = dressed
      ? '외출복을 입은 캐릭터가 서 있는 아침 방'
      : '잠옷을 입은 캐릭터가 서 있는 아침 방';
    dom.overlay.hidden = true;
    dom.overlay.innerHTML = '';
    busy = false;

    var hasCompletedActivity = completed().length > 0;
    dom.sparkles.classList.toggle('is-visible', completed().indexOf('shower') !== -1 || dressed);
    dom.bubbleTitle.textContent = hasCompletedActivity ? '다음엔 뭘 할까요?' : '뭘 할까요?';
    dom.bubbleText.textContent = dressed
      ? '외출 준비가 됐어요! 다음 활동을 골라요.'
      : (hasCompletedActivity ? '좋아요! 다음 준비를 골라요.' : '아침 준비를 해봐요!');
    var readyForNext = allActivitiesCompleted();
    var planReady = !!(gameState.flags && gameState.flags.aiPlanCompleted);
    dom.guide.textContent = readyForNext
      ? (planReady ? '아침 준비 완료! 출근을 시작해요.' : '아침 준비 완료! 출근 정보를 확인해요.')
      : (hasCompletedActivity ? '다음 활동을 선택해보세요!' : '원하는 활동을 선택해보세요!');
    if (dom.next) {
      dom.next.disabled = !readyForNext;
      dom.next.classList.toggle('is-ready', readyForNext);
      dom.next.textContent = planReady ? '출근 시작하기' : '출근 정보 확인하기';
    }

    Array.prototype.forEach.call(dom.activityGrid.querySelectorAll('[data-game-activity]'), function (button) {
      var id = button.getAttribute('data-game-activity');
      var done = completed().indexOf(id) !== -1;
      button.disabled = done;
      button.classList.toggle('is-done', done);
      button.classList.remove('is-selected');
    });
    updateTime();
  }

  function allActivitiesCompleted() {
    return Object.keys(activities).every(function (id) {
      return completed().indexOf(id) !== -1;
    });
  }

  function goToCommuteRoute() {
    if (!allActivitiesCompleted() || busy) return;
    if (gameState.flags && gameState.flags.aiPlanCompleted && typeof initCommuteScreen === 'function') {
      gameState.phase = 'commute';
      gameState.flags.morningPrepCompleted = true;
      initCommuteScreen();
      return;
    }
    gameState.phase = 'briefing';
    if (!gameState.flags) gameState.flags = {};
    gameState.flags.morningPrepCompleted = true;
    if (typeof renderBriefing === 'function') {
      renderBriefing(gameState.student || {});
    } else if (typeof renderCommuteRouteScreen === 'function') {
      renderCommuteRouteScreen();
    }
    if (typeof showScreen === 'function') {
      showScreen('screen-briefing');
    }
  }

  function selectActivity(id, button) {
    if (!activities[id]) return;
    busy = true;
    button.classList.add('is-selected');
    dom.guide.textContent = activities[id].label + ' 선택!';

    window.setTimeout(function () {
      if (id === 'shower') runShowerFlow();
      else if (id === 'eat') runBreakfastFlow();
      else if (id === 'brush') runBrushFlow();
      else if (id === 'dress') runDressFlow();
      else if (id === 'bag') runBagTransition();
    }, 500);
  }

  function showCutscene(image, eyebrow, title, message, modifier) {
    dom.overlay.hidden = false;
    dom.overlay.innerHTML =
      '<section class="morning-game__cutscene ' + (modifier || '') + '">' +
        '<img src="' + image + '" alt="">' +
        '<div class="morning-game__cutscene-shade"></div>' +
        '<div class="morning-game__cutscene-copy">' +
          '<span>' + eyebrow + '</span>' +
          '<h2>' + title + '</h2>' +
          '<p>' + message + '</p>' +
        '</div>' +
      '</section>';
  }

  function runShowerFlow() {
    showCutscene(
      gameState.morningPrep.dressedForWork ? getMainScene() : 'assets/images/morning-walk-bathroom.png',
      '욕실로 이동 중',
      '샤워하러 가요!',
      '캐릭터가 욕실로 걸어가고 있어요.',
      'morning-game__cutscene--walk'
    );

    window.setTimeout(function () {
      showCutscene(
        'assets/images/morning-shower-safe.png',
        '쏴아아 · 보글보글',
        '깨끗하게 씻는 중!',
        '풍성한 김과 거품 뒤에서 안전하게 샤워해요.',
        'morning-game__cutscene--shower'
      );
    }, 1500);

    window.setTimeout(function () {
      gameState.time.current += activities.shower.minutes;
      addCompleted('shower');
      if (typeof addLog === 'function') {
        addLog('🚿', '샤워하기', '깨끗하게 씻었어요.', 10, true);
      }
      showShowerComplete();
    }, 3700);
  }

  function showShowerComplete() {
    dom.overlay.hidden = false;
    dom.overlay.innerHTML =
      '<section class="morning-game__complete">' +
        '<img src="' + getMainScene() + '" alt="깨끗하게 씻고 방으로 돌아온 캐릭터">' +
        '<div class="morning-game__complete-shade"></div>' +
        '<div class="morning-game__complete-copy">' +
          '<div class="morning-game__complete-stars">✦ ✨ ✦</div>' +
          '<h2>씻기 완료!</h2>' +
          '<p>깨끗하게 씻고 방으로 돌아왔어요.</p>' +
          '<div class="morning-game__complete-time"><span>현재 시간</span><strong>' + formatGameTime(gameState.time.current) + '</strong></div>' +
          '<button id="btn-shower-complete-confirm" type="button">확인</button>' +
        '</div>' +
      '</section>';

    document.getElementById('btn-shower-complete-confirm').addEventListener('click', function () {
      renderMain();
    }, { once: true });
  }

  function getMainScene() {
    return gameState.morningPrep.dressedForWork
      ? 'assets/images/morning-room-dressed.png'
      : 'assets/images/morning-room-game-clean.png';
  }

  function runBreakfastFlow() {
    var dressed = !!gameState.morningPrep.dressedForWork;
    showCutscene(
      dressed ? 'assets/images/morning-walk-breakfast-dressed.png' : 'assets/images/morning-walk-breakfast.png',
      '식탁으로 이동 중',
      '아침 먹으러 가요!',
      '캐릭터가 식탁으로 걸어가고 있어요.',
      'morning-game__cutscene--walk'
    );
    window.setTimeout(function () {
      showCutscene(
        dressed ? 'assets/images/morning-eating-dressed.png' : 'assets/images/morning-eating.png',
        '냠냠 · 맛있게',
        '아침을 먹는 중!',
        '든든하게 먹고 하루를 시작해요.',
        'morning-game__cutscene--activity'
      );
    }, 1400);
    window.setTimeout(function () {
      completeActivity('eat', '아침 완료!', '든든하게 아침을 먹었어요.');
    }, 3500);
  }

  function runBrushFlow() {
    var dressed = !!gameState.morningPrep.dressedForWork;
    showCutscene(
      dressed ? 'assets/images/morning-walk-brush-dressed.png' : 'assets/images/morning-walk-brush.png',
      '세면대로 이동 중',
      '양치하러 가요!',
      '칫솔과 컵을 들고 세면대로 가요.',
      'morning-game__cutscene--walk'
    );
    window.setTimeout(function () {
      showCutscene(
        dressed ? 'assets/images/morning-brushing-dressed.png' : 'assets/images/morning-brushing.png',
        '치카치카 · 반짝반짝',
        '깨끗하게 양치 중!',
        '칫솔과 거품으로 이를 꼼꼼히 닦아요.',
        'morning-game__cutscene--activity'
      );
    }, 1400);
    window.setTimeout(function () {
      completeActivity('brush', '양치 완료!', '이가 깨끗해졌어요.');
    }, 3500);
  }

  function runDressFlow() {
    showCutscene(
      'assets/images/morning-walk-wardrobe.png',
      '옷장으로 이동 중',
      '옷을 입으러 가요!',
      '잠옷을 갈아입을 준비를 해요.',
      'morning-game__cutscene--walk'
    );
    window.setTimeout(function () {
      showCutscene(
        'assets/images/morning-wardrobe-closed.png',
        '옷장 커튼이 닫혔어요',
        '옷을 갈아입는 중!',
        '캐릭터는 커튼 뒤에 안전하게 가려져 있어요.',
        'morning-game__cutscene--activity'
      );
    }, 1400);
    window.setTimeout(function () {
      gameState.morningPrep.dressedForWork = true;
      completeActivity('dress', '옷 입기 완료!', '잠옷에서 외출복으로 갈아입었어요.');
    }, 3500);
  }

  function completeActivity(id, title, message) {
    var meta = activities[id];
    gameState.time.current += meta.minutes;
    addCompleted(id);
    if (typeof addLog === 'function') {
      addLog(meta.icon, meta.label, message, meta.minutes, true);
    }
    showActivityComplete(id, title, message);
  }

  function showActivityComplete(id, title, message) {
    dom.overlay.hidden = false;
    dom.overlay.innerHTML =
      '<section class="morning-game__complete">' +
        '<img src="' + getMainScene() + '" alt="활동을 마치고 방으로 돌아온 캐릭터">' +
        '<div class="morning-game__complete-shade"></div>' +
        '<div class="morning-game__complete-copy">' +
          '<div class="morning-game__complete-stars">✦ ✨ ✦</div>' +
          '<h2>' + title + '</h2>' +
          '<p>' + message + '</p>' +
          '<div class="morning-game__complete-time"><span>현재 시간</span><strong>' + formatGameTime(gameState.time.current) + '</strong></div>' +
          '<button id="btn-activity-complete-confirm" type="button">확인</button>' +
        '</div>' +
      '</section>';
    document.getElementById('btn-activity-complete-confirm').addEventListener('click', renderMain, { once: true });
  }

  function runBagTransition() {
    showCutscene(
      getMainScene(),
      '다음 준비로 이동',
      '가방을 확인해요!',
      '챙겨야 할 물건이 모두 있는지 살펴봐요.',
      'morning-game__cutscene--activity'
    );
    window.setTimeout(openBagStage, 1100);
  }

  function openBagStage() {
    var bagItems = getBagGameItems();
    var requiredItems = bagItems.filter(function (item) { return item.required; });
    var level = getBagLevel();
    gameState.morningPrep.bagStageChecked = [];
    gameState.morningPrep.bagPackedItems = [];
    dom.overlay.hidden = false;
    dom.overlay.innerHTML =
      '<section class="morning-game__bag-stage morning-game__bag-stage--level-' + level + '">' +
        '<img class="morning-game__bag-stage-bg" src="' + getMainScene() + '" alt="가방을 챙기는 아침 방">' +
        '<div class="morning-game__bag-stage-shade"></div>' +
        '<header class="morning-game__bag-hud">' +
          '<div class="morning-game__bag-title"><span>★</span> 가방 챙기기 미션</div>' +
          '<div class="morning-game__bag-progress">' +
            '<span>출근 준비</span>' +
            '<strong id="morning-game-bag-progress">0/' + requiredItems.length + '</strong>' +
            '<div><i id="morning-game-bag-progress-fill"></i></div>' +
          '</div>' +
          '<div class="morning-game__bag-weather">' + getBagWeatherLabel() + '</div>' +
        '</header>' +
        '<div class="morning-game__bag-speech">' +
          '<strong>가방에 무엇을 넣을까요?</strong>' +
          '<span>출근에 필요한 물건을 챙겨요!</span>' +
        '</div>' +
        '<div id="morning-game-bag-feedback" class="morning-game__bag-feedback" aria-live="polite"></div>' +
        '<div id="morning-game-bag-items" class="morning-game__bag-world" aria-label="방 안 준비물"></div>' +
        '<aside class="morning-game__bag-dock">' +
          '<div id="morning-game-bag-drop" class="morning-game__bag-drop">' +
            '<img src="assets/images/open_backpack.png" alt="크게 열린 가방">' +
            '<div class="morning-game__bag-glow" aria-hidden="true"></div>' +
          '</div>' +
          '<div id="morning-game-bag-slots" class="morning-game__bag-slots"></div>' +
          '<p id="morning-game-bag-hint">가방은 비어 있어요. 물건을 골라보세요.</p>' +
          '<button id="morning-game-bag-complete" class="morning-game__bag-complete" type="button" disabled>가방 다 쌌어요</button>' +
        '</aside>' +
      '</section>';
    dom.bagWorld = document.getElementById('morning-game-bag-items');
    dom.bagSlots = document.getElementById('morning-game-bag-slots');
    dom.bagDrop = document.getElementById('morning-game-bag-drop');
    dom.bagProgress = document.getElementById('morning-game-bag-progress');
    dom.bagProgressFill = document.getElementById('morning-game-bag-progress-fill');
    dom.bagFeedback = document.getElementById('morning-game-bag-feedback');
    dom.bagHint = document.getElementById('morning-game-bag-hint');
    dom.bagComplete = document.getElementById('morning-game-bag-complete');
    dom.bagComplete.addEventListener('click', finishBagStage);
    renderBagGame(bagItems);
    bindBagDrop(bagItems);
    busy = false;
  }

  function getBagLevel() {
    return gameState && gameState.student && gameState.student.level
      ? gameState.student.level
      : '나';
  }

  function getBagWeatherLabel() {
    var weather = gameState.weather || 'clear';
    if (weather === 'rainy') return '☔ 오늘은 비가 와요';
    if (weather === 'cold' || weather === 'icy' || weather === 'snowy') return '❄ 오늘은 추워요';
    if (weather === 'hot') return '☀ 오늘은 더워요';
    return '☀ 맑은 아침이에요';
  }

  function getBagGameItems() {
    var weather = gameState.weather || 'clear';
    return [
      { key: 'transitCard', name: '교통카드', type: 'required', required: true, visual: 'card', place: 'desk' },
      { key: 'phone', name: '스마트폰', type: 'required', required: true, visual: 'phone', place: 'bed' },
      { key: 'waterBottle', name: '물병', type: 'required', required: true, visual: 'water', image: 'assets/images/item_water_bottle.png', place: 'shelf' },
      { key: 'umbrella', name: '우산', type: weather === 'rainy' ? 'required' : 'situational', required: weather === 'rainy', visual: 'umbrella', image: 'assets/images/item_umbrella.png', place: 'door' },
      { key: 'gloves', name: '장갑', type: (weather === 'cold' || weather === 'icy' || weather === 'snowy') ? 'required' : 'situational', required: weather === 'cold' || weather === 'icy' || weather === 'snowy', visual: 'gloves', place: 'chair' },
      { key: 'outerwear', name: '겉옷', type: (weather === 'cold' || weather === 'icy' || weather === 'snowy') ? 'required' : 'situational', required: weather === 'cold' || weather === 'icy' || weather === 'snowy', visual: 'coat', image: 'assets/images/item_work_clothes.png', place: 'chair' },
      { key: 'handFan', name: '손선풍기', type: weather === 'hot' ? 'required' : 'situational', required: weather === 'hot', visual: 'fan', place: 'window' },
      { key: 'mask', name: '마스크', type: (weather === 'dusty' || weather === 'sick') ? 'required' : 'situational', required: weather === 'dusty' || weather === 'sick', visual: 'mask', place: 'shelf' },
      { key: 'gameConsole', name: '게임기', type: 'distractor', required: false, visual: 'game', place: 'rug' },
      { key: 'snacks', name: '과자', type: 'distractor', required: false, visual: 'snack', place: 'nightstand' },
      { key: 'toy', name: '장난감', type: 'distractor', required: false, visual: 'toy', place: 'rug' }
    ];
  }

  function renderBagGame(items) {
    var evePacked = gameState.evePrep && Array.isArray(gameState.evePrep.bagPacked)
      ? gameState.evePrep.bagPacked.slice()
      : [];
    gameState.morningPrep.bagStageChecked = evePacked.slice();
    gameState.morningPrep.bagPackedItems = evePacked.slice();
    dom.bagWorld.innerHTML = '';
    dom.bagSlots.innerHTML = '';
    items.forEach(function (item) {
      var button = document.createElement('button');
      button.type = 'button';
      button.draggable = true;
      button.className = 'morning-game__world-item morning-game__world-item--' + item.place;
      button.classList.add('morning-game__world-item--type-' + item.type);
      if (item.required) button.classList.add('is-required');
      button.dataset.bagItem = item.key;
      button.innerHTML =
        '<span class="morning-game__item-object morning-game__item-object--' + item.visual + '">' +
          (item.image ? '<img src="' + item.image + '" alt="">' : buildCssItemVisual(item.visual)) +
        '</span>' +
        '<strong>' + item.name + '</strong>' +
        '<span class="morning-game__item-check">✓</span>';
      button.addEventListener('click', function () {
        chooseBagItem(item, button, items);
      });
      button.addEventListener('dragstart', function (event) {
        if (button.disabled) {
          event.preventDefault();
          return;
        }
        event.dataTransfer.setData('text/plain', item.key);
        event.dataTransfer.effectAllowed = 'move';
        button.classList.add('is-dragging');
      });
      button.addEventListener('dragend', function () {
        button.classList.remove('is-dragging');
        dom.bagDrop.classList.remove('is-drag-over');
      });
      dom.bagWorld.appendChild(button);
      if (evePacked.indexOf(item.key) !== -1) {
        button.classList.add('is-packed');
        button.disabled = true;
      }
    });
    var packableItemCount = items.filter(function (item) {
      return item.type !== 'distractor';
    }).length;
    var slotCount = Math.max(6, packableItemCount);
    for (var slotIndex = 0; slotIndex < slotCount; slotIndex++) {
      var slot = document.createElement('div');
      slot.className = 'morning-game__bag-slot';
      slot.innerHTML = '<span>+</span>';
      dom.bagSlots.appendChild(slot);
    }
    items.forEach(function (item) {
      if (evePacked.indexOf(item.key) !== -1) addBagSlotItem(item);
    });
    updateBagGameProgress(items);
    if (evePacked.length > 0) {
      dom.bagHint.textContent = '어젯밤에 챙긴 물건이에요. 빠진 것이 없는지 확인해요!';
    }
    updateDaBagHint(items, true);
  }

  function bindBagDrop(items) {
    dom.bagDrop.addEventListener('dragover', function (event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      dom.bagDrop.classList.add('is-drag-over');
    });
    dom.bagDrop.addEventListener('dragleave', function () {
      dom.bagDrop.classList.remove('is-drag-over');
    });
    dom.bagDrop.addEventListener('drop', function (event) {
      event.preventDefault();
      dom.bagDrop.classList.remove('is-drag-over');
      var key = event.dataTransfer.getData('text/plain');
      var item = items.find(function (candidate) { return candidate.key === key; });
      var button = dom.bagWorld.querySelector('[data-bag-item="' + key + '"]');
      if (item && button) chooseBagItem(item, button, items);
    });
  }

  function buildCssItemVisual(visual) {
    if (visual === 'card') return '<i class="bag-object-card"><b>GO</b><span>교통</span></i>';
    if (visual === 'phone') return '<i class="bag-object-phone"><b></b><span></span></i>';
    if (visual === 'fan') return '<i class="bag-object-fan"><b></b><span></span></i>';
    if (visual === 'gloves') return '<i>🧤</i>';
    if (visual === 'mask') return '<i>😷</i>';
    if (visual === 'game') return '<i class="bag-object-game"><b></b><span></span></i>';
    if (visual === 'snack') return '<i class="bag-object-snack"><b>SNACK</b><span></span></i>';
    if (visual === 'toy') return '<i>🧸</i>';
    return '<i></i>';
  }

  function chooseBagItem(item, button, items) {
    if (button.disabled || button.classList.contains('is-selected')) return;
    var level = getBagLevel();
    var daTarget = level === '다' ? getNextRequiredBagItem(items) : null;
    button.classList.add('is-selected');
    if (daTarget && item.key !== daTarget.key) {
      window.setTimeout(function () {
        button.classList.remove('is-selected');
        button.classList.add('is-not-needed');
        showBagFeedback('반짝이는 물건을 골라요!', false);
        if (typeof speak === 'function') speak('반짝이는 물건을 골라요.');
        window.setTimeout(function () { button.classList.remove('is-not-needed'); }, 700);
      }, 220);
      return;
    }
    if (item.type === 'distractor' || (item.type === 'situational' && !item.required)) {
      window.setTimeout(function () {
        button.classList.remove('is-selected');
        button.classList.add('is-not-needed');
        var feedback = getWrongBagFeedback(item, level);
        showBagFeedback(feedback, false);
        if (level === '다' && typeof speak === 'function') speak(feedback);
        window.setTimeout(function () { button.classList.remove('is-not-needed'); }, 700);
      }, 260);
      return;
    }
    button.disabled = true;
    animateItemToBag(button, function () {
      button.classList.remove('is-selected');
      button.classList.add('is-packed');
      button.disabled = true;
      if (item.key && typeof checkHomeItem === 'function') checkHomeItem(item.key);
      gameState.morningPrep.bagStageChecked.push(item.key);
      gameState.morningPrep.bagPackedItems.push(item.key);
      addBagSlotItem(item);
      updateBagGameProgress(items);
      showBagFeedback(item.name + '을(를) 가방에 넣었어요!', true);
      updateDaBagHint(items, true);
    });
  }

  function getWrongBagFeedback(item, level) {
    var base = item.type === 'distractor'
      ? '오늘 출근에는 필요하지 않아요.'
      : '오늘 날씨에는 없어도 괜찮아요.';
    if (level === '나') {
      if (item.key === 'gameConsole' || item.key === 'snacks') {
        return base + ' 버스를 탈 때 필요한 물건을 생각해보세요.';
      }
      return base + ' 오늘 날씨에 필요한 물건을 다시 생각해보세요.';
    }
    if (level === '다') return '반짝이는 물건을 골라요!';
    return base + ' 출근에 꼭 필요한 물건부터 챙겨볼까요?';
  }

  function getNextRequiredBagItem(items) {
    var packed = gameState.morningPrep.bagPackedItems || [];
    return items.find(function (item) {
      return item.required && packed.indexOf(item.key) === -1;
    }) || null;
  }

  function updateDaBagHint(items, announce) {
    if (getBagLevel() !== '다' || !dom.bagWorld) return;
    dom.bagWorld.querySelectorAll('.is-da-target').forEach(function (button) {
      button.classList.remove('is-da-target');
    });
    var target = getNextRequiredBagItem(items);
    if (!target) return;
    var targetButton = dom.bagWorld.querySelector('[data-bag-item="' + target.key + '"]');
    if (targetButton) targetButton.classList.add('is-da-target');
    dom.bagHint.textContent = '반짝이는 물건을 가방에 넣어요.';
    if (announce && typeof speak === 'function') {
      speak(target.name + '을 찾아 가방에 넣어요.');
    }
  }

  function animateItemToBag(button, onDone) {
    var source = button.getBoundingClientRect();
    var target = dom.bagDrop.getBoundingClientRect();
    var flyer = button.querySelector('.morning-game__item-object').cloneNode(true);
    flyer.classList.add('morning-game__item-flyer');
    flyer.style.left = source.left + source.width / 2 - 50 + 'px';
    flyer.style.top = source.top + source.height / 2 - 50 + 'px';
    document.body.appendChild(flyer);
    window.requestAnimationFrame(function () {
      flyer.style.transform =
        'translate(' + (target.left + target.width / 2 - source.left - source.width / 2) + 'px,' +
        (target.top + target.height / 2 - source.top - source.height / 2) + 'px) scale(.35) rotate(14deg)';
      flyer.style.opacity = '0';
    });
    dom.bagDrop.classList.add('is-receiving');
    window.setTimeout(function () {
      flyer.remove();
      dom.bagDrop.classList.remove('is-receiving');
      onDone();
    }, 700);
  }

  function addBagSlotItem(item) {
    var slots = dom.bagSlots.querySelectorAll('.morning-game__bag-slot');
    var slot = Array.prototype.find.call(slots, function (candidate) {
      return !candidate.classList.contains('is-filled');
    });
    if (!slot) return;
    slot.classList.add('is-filled');
    slot.innerHTML =
      '<span class="morning-game__slot-object morning-game__item-object--' + item.visual + '">' +
        (item.image ? '<img src="' + item.image + '" alt="">' : buildCssItemVisual(item.visual)) +
      '</span><strong>' + item.name + '</strong><b>✓</b>';
  }

  function updateBagGameProgress(items) {
    var required = items.filter(function (item) { return item.required; });
    var packedRequired = required.filter(function (item) {
      return gameState.morningPrep.bagPackedItems.indexOf(item.key) !== -1;
    }).length;
    dom.bagProgress.textContent = packedRequired + '/' + required.length;
    dom.bagProgressFill.style.width = Math.round((packedRequired / required.length) * 100) + '%';
    var ready = packedRequired === required.length;
    dom.bagComplete.disabled = !ready;
    if (getBagLevel() !== '다') {
      dom.bagHint.textContent = ready ? '필요한 물건을 모두 챙겼어요!' : '가방에 넣을 물건을 골라보세요.';
    } else if (ready) {
      dom.bagHint.textContent = '필요한 물건을 모두 챙겼어요!';
    }
    if (ready) {
      dom.bagDrop.classList.add('is-ready');
      dom.bagComplete.classList.add('is-ready');
      showBagFeedback('가방 준비 완료! 출근 준비가 더 좋아졌어요!', true);
    }
  }

  function showBagFeedback(message, positive) {
    dom.bagFeedback.textContent = message;
    dom.bagFeedback.className = 'morning-game__bag-feedback is-visible ' + (positive ? 'is-positive' : 'is-gentle');
    window.clearTimeout(dom.bagFeedback.hideTimer);
    dom.bagFeedback.hideTimer = window.setTimeout(function () {
      dom.bagFeedback.classList.remove('is-visible');
    }, 2200);
  }

  function finishBagStage() {
    if (dom.bagComplete.disabled || completed().indexOf('bag') !== -1) return;
    gameState.time.current += activities.bag.minutes;
    addCompleted('bag');
    if (typeof addLog === 'function') addLog('🎒', '가방 챙기기', '필요한 물건을 확인했어요.', activities.bag.minutes, true);
    showActivityComplete('bag', '가방 준비 완료!', '출근 준비가 더 좋아졌어요!');
  }

  function showInfoScene(icon, title, lines) {
    if (busy) return;
    busy = true;
    dom.overlay.hidden = false;
    dom.overlay.innerHTML =
      '<section class="morning-game__info">' +
        '<div class="morning-game__info-icon">' + icon + '</div>' +
        '<h2>' + title + '</h2>' +
        '<ul>' + lines.map(function (line) { return '<li>' + line + '</li>'; }).join('') + '</ul>' +
        '<button id="btn-morning-info-close" type="button">확인</button>' +
      '</section>';
    document.getElementById('btn-morning-info-close').addEventListener('click', renderMain, { once: true });
  }

  window.initMorningAlarmScreen = function () {
    if (!dom.alarmTime) {
      cacheDom();
      bindEvents();
    }
    var alarm = getConfiguredAlarmTime();
    if (!gameState.evePrep) gameState.evePrep = {};
    gameState.evePrep.alarmTime = alarm;
    gameState.alarmTime = alarm;
    gameState.time.current = alarm;
    dom.alarmTime.textContent = formatGameTime(alarm);
    if (dom.alarmCurrentTime) dom.alarmCurrentTime.textContent = formatGameTime(alarm);
    if (dom.alarmSceneClock) dom.alarmSceneClock.textContent = formatGameTime(alarm);
    if (dom.snoozeFeedback) dom.snoozeFeedback.textContent = '';
    if (dom.snooze) {
      var snoozed = gameState.evePrep && (gameState.evePrep.snoozeCount || 0) >= 1;
      dom.snooze.disabled = snoozed;
      dom.snooze.textContent = snoozed ? '10분 더 자기 완료 ✓' : '10분 더 자기';
    }
  };

  window.initMorningPrepScreen = function () {
    cacheDom();
    bindEvents();
    ensureState();
    if (!gameState.morningPrep.gameRedesignStarted) {
      gameState.time.current = getConfiguredAlarmTime();
      gameState.morningPrep.gameRedesignStarted = true;
    }
    renderMain();
    if (typeof updateTopBar === 'function') updateTopBar();
  };
})();
