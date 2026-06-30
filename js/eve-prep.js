(function() {
  var dom = {};
  var itemsPacked = [];
  var addedItemsCount = 0;
  var daBagQuestions = [];
  var daBagQuestionIndex = 0;
  var daBusSteps = [];
  var daBusStepIndex = 0;
  var daBusSpeech = '';

  function cacheEveDom() {
    dom.screenEvePrep = document.getElementById('screen-eve-prep');
    dom.eveBgImage = document.getElementById('eve-bg-image');
    
    // Phases
    dom.phaseBus = document.getElementById('eve-phase-bus');
    dom.phaseBag = document.getElementById('eve-phase-bag');
    dom.phaseBed = document.getElementById('eve-phase-bed');
    dom.phaseAlarm = document.getElementById('eve-phase-alarm');

    // Buttons
    dom.btnBusOk = document.getElementById('btn-eve-bus-ok');
    dom.busInfoContent = document.getElementById('eve-bus-info-content');
    dom.btnBagDone = document.getElementById('btn-eve-bag-done');
    dom.alarmOptions = document.getElementById('eve-alarm-options');
    dom.alarmChoices = document.querySelectorAll('.btn-eve-alarm-choice');
    dom.alarmTitle = dom.phaseAlarm ? dom.phaseAlarm.querySelector('h3') : null;
    dom.alarmDescription = dom.phaseAlarm ? dom.phaseAlarm.querySelector('p') : null;

    // Bag Packing
    dom.deskItems = document.querySelectorAll('.eve-item');
    dom.deskItemsContainer = document.getElementById('eve-desk-items');
    dom.bagDropzone = document.getElementById('eve-bag-dropzone');
    dom.bagItemsGrid = document.getElementById('eve-bag-items-grid');
    dom.bagRequiredList = document.getElementById('eve-bag-required-list');
    dom.bagRequiredCount = document.getElementById('eve-bag-required-count');
    dom.bagPackedCount = document.getElementById('eve-bag-packed-count');
    dom.bagStatusTitle = document.getElementById('eve-bag-status-title');
    dom.bagStatusText = document.getElementById('eve-bag-status-text');
    dom.bagCoachText = document.getElementById('eve-bag-coach-text');
    dom.bagPlayerAvatar = document.getElementById('eve-bag-player-avatar');
    dom.bagWorkTime = document.getElementById('eve-bag-work-time');
    dom.bagWeather = document.getElementById('eve-bag-weather');
    dom.bagBus = document.getElementById('eve-bag-bus');

    // Bed Animation
    dom.bedCharacter = document.getElementById('eve-bed-character');
    dom.bedBubble = document.getElementById('eve-bed-bubble');
  }

  function renderAlarmOptions() {
    if (!dom.alarmOptions || typeof getAlarmOptionsForWorkStart !== 'function') return;

    var level = gameState.student && gameState.student.level;
    var workStartTime = (gameState.todayInfo && gameState.todayInfo.workStartTime) || 540;
    if (level === '가') {
      if (dom.alarmTitle) dom.alarmTitle.innerHTML = '몇 시에<br>일어나야 할까?';
      if (dom.alarmDescription) {
        dom.alarmDescription.textContent = '출근 시간을 생각해서 알람을 맞춰요!';
      }
      renderGaAlarmSetter(workStartTime);
      return;
    }
    if (dom.alarmTitle) dom.alarmTitle.innerHTML = '몇 시에<br>일어나야 할까?';
    if (dom.alarmDescription) dom.alarmDescription.textContent = '출근 시간을 생각해서 알람을 맞춰요!';

    var plannedWakeTime = getPlannedWakeTime(workStartTime);
    var options = [
      { time: plannedWakeTime - 20, label: '여유 있어요', badge: 'green' },
      { time: plannedWakeTime, label: 'AI 추천', badge: 'blue' },
      { time: plannedWakeTime + 20, label: '늦을 수 있어요', badge: 'orange' },
      { time: plannedWakeTime + 40, label: '너무 늦어요', badge: 'red' }
    ];
    var badges = {
      green: { bg: '#dcfce7', color: '#166534' },
      blue: { bg: '#dbeafe', color: '#1e40af' },
      orange: { bg: '#ffedd5', color: '#9a3412' },
      red: { bg: '#fee2e2', color: '#991b1b' }
    };

    dom.alarmOptions.innerHTML = '';
    options.forEach(function(option) {
      var badge = badges[option.badge] || badges.blue;
      var btn = document.createElement('button');
      btn.className = 'btn-action-choice btn-eve-alarm-choice';
      btn.setAttribute('data-time', option.time);
      btn.innerHTML = formatTime(option.time) +
        ' <span style="margin-left: 10px; padding: 4px 8px; border-radius: 12px; font-size: 0.9rem; background: ' +
        badge.bg + '; color: ' + badge.color + ';">' + option.label + '</span>';
      dom.alarmOptions.appendChild(btn);
    });

    dom.alarmChoices = document.querySelectorAll('.btn-eve-alarm-choice');
  }

  function renderGaAlarmSetter(workStartTime) {
    var recommendedTime = getPlannedWakeTime(workStartTime);
    recommendedTime = Math.round(recommendedTime / 10) * 10;

    dom.alarmOptions.innerHTML =
      '<div class="ga-alarm-setter">' +
        '<div class="ga-alarm-setter__guide">' +
          '<span>목표 출근 시간</span><strong>' + formatTime(workStartTime) + '</strong>' +
        '</div>' +
        '<div class="ga-alarm-direct" data-alarm-minutes="' + recommendedTime + '">' +
          '<button type="button" class="ga-alarm-adjust" data-alarm-delta="-10" aria-label="알람 시간을 10분 줄이기">−10분</button>' +
          '<div class="ga-alarm-clock" aria-live="polite">' +
            '<span>내 알람 시간</span><strong id="ga-alarm-time">' + formatTime(recommendedTime) + '</strong>' +
          '</div>' +
          '<button type="button" class="ga-alarm-adjust" data-alarm-delta="10" aria-label="알람 시간을 10분 늘리기">+10분</button>' +
        '</div>' +
        '<p class="ga-alarm-hint">버튼을 눌러 10분씩 직접 맞춰보세요.</p>' +
        '<button type="button" class="btn-eve-alarm-submit">⏰ 알람 맞추기</button>' +
      '</div>';
    dom.alarmChoices = document.querySelectorAll('.btn-eve-alarm-choice');
  }

  function getPlannedWakeTime(workStartTime) {
    if (gameState.aiCommutePlan && typeof gameState.aiCommutePlan.wake === 'number') {
      return gameState.aiCommutePlan.wake;
    }
    if (gameState.evePrep && typeof gameState.evePrep.alarmTime === 'number') {
      return gameState.evePrep.alarmTime;
    }
    return typeof getRecommendedAlarmTime === 'function'
      ? getRecommendedAlarmTime(workStartTime)
      : workStartTime - 80;
  }

  function getBusTravelText(busInfo) {
    return '정류장까지 ' + busInfo.correctStop.walkMinutesFromHome +
      '분 + 버스 ' + busInfo.rideMinutes +
      '분 + 회사까지 ' + busInfo.walkMinutesAfterBus + '분';
  }

  function renderBusInfo() {
    if (!dom.busInfoContent) return;
    var busInfo = gameState.busInfo || (typeof createBusInfo === 'function'
      ? createBusInfo(gameState.time.target)
      : null);
    if (!busInfo) return;

    gameState.busInfo = busInfo;
    var level = gameState.student && gameState.student.level;
    var arrivalText = formatTime(busInfo.busArrivalTime);
    var scheduleText = (busInfo.busArrivalTimes || []).map(function(time) {
      return formatTime(time);
    }).join(', ');

    if (level === '다') {
      daBusSteps = [
        {
          icon: '🚏',
          label: '가야 할 정류장',
          value: busInfo.correctStop.name,
          speech: busInfo.correctStop.name + '으로 가요.'
        },
        {
          icon: '➡️',
          label: '정류장 방향',
          value: busInfo.correctStop.direction,
          speech: busInfo.correctStop.direction + ' 정류장으로 가요.'
        },
        {
          icon: '🚌',
          label: '탈 버스',
          value: busInfo.correctBusNumber + '번',
          speech: busInfo.correctBusNumber + '번 버스를 타요.'
        },
        {
          icon: '⏰',
          label: '버스 시간',
          value: arrivalText,
          speech: buildBusArrivalSpeech(arrivalText)
        },
        {
          icon: '🏢',
          label: '내릴 곳',
          value: busInfo.targetGetOffStop,
          speech: busInfo.targetGetOffStop + ' 정류장에서 내려요.'
        },
        {
          icon: '🚶',
          label: '이동 시간',
          value: getBusTravelText(busInfo),
          speech: '정류장까지 걷고, 버스를 타고, 다시 회사까지 걸어가요.'
        }
      ];
      daBusStepIndex = 0;
      dom.busInfoContent.innerHTML = renderDaBusStep();
      bindDaBusControls();
      if (dom.btnBusOk) dom.btnBusOk.style.display = 'none';
      return;
    }

    var compactClass = level === '나' ? ' eve-bus-info-grid--na' : ' eve-bus-info-grid--ga';
    var html = '<div class="eve-bus-info-grid' + compactClass + '">';
    html += buildBusInfoItem('🚏', '가야 할 정류장', busInfo.correctStop.name);
    html += buildBusInfoItem('➡️', '정류장 방향', busInfo.correctStop.direction);
    html += buildBusInfoItem('🚌', '탈 버스', busInfo.correctBusNumber + '번');
    html += buildBusInfoItem('⏰', '버스 도착 시간', arrivalText);
    html += buildBusInfoItem('🏢', '내릴 정류장', busInfo.targetGetOffStop);
    html += buildBusInfoItem('🚶', '이동 시간', getBusTravelText(busInfo));
    if (level === '가') {
      html += '<div class="eve-bus-schedule"><strong>버스 시간표</strong><span>' +
        scheduleText + '</span></div>';
    }
    html += '</div>';
    dom.busInfoContent.innerHTML = html;
    if (dom.btnBusOk) dom.btnBusOk.style.display = '';
  }

  function buildBusInfoItem(icon, label, value) {
    return '<div class="eve-bus-info-item">' +
      '<span class="eve-bus-info-item__icon" aria-hidden="true">' + icon + '</span>' +
      '<span class="eve-bus-info-item__label">' + label + '</span>' +
      '<strong class="eve-bus-info-item__value">' + value + '</strong>' +
    '</div>';
  }

  function buildBusArrivalSpeech(timeText) {
    return '버스는 ' + timeText + '에 와요.';
  }

  function renderDaBusStep() {
    var step = daBusSteps[daBusStepIndex];
    if (!step) return '';
    daBusSpeech = step.speech;
    return '<div class="eve-bus-step-card">' +
      '<div class="eve-bus-step-card__progress">' + (daBusStepIndex + 1) + ' / ' + daBusSteps.length + '</div>' +
      '<div class="eve-bus-step-card__icon" aria-hidden="true">' + step.icon + '</div>' +
      '<div class="eve-bus-step-card__label">' + step.label + '</div>' +
      '<div class="eve-bus-step-card__value">' + step.value + '</div>' +
      '<div class="eve-bus-step-card__actions">' +
        '<button type="button" id="btn-eve-bus-replay" class="briefing-step-button briefing-step-button--secondary">🔊 다시 듣기</button>' +
        '<button type="button" id="btn-eve-bus-next" class="briefing-step-button">확인</button>' +
      '</div>' +
    '</div>';
  }

  function bindDaBusControls() {
    var replayButton = document.getElementById('btn-eve-bus-replay');
    var nextButton = document.getElementById('btn-eve-bus-next');
    if (replayButton) {
      replayButton.addEventListener('click', function() {
        if (typeof speak === 'function') speak(daBusSpeech);
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function() {
        daBusStepIndex++;
        if (daBusStepIndex >= daBusSteps.length) {
          completeBusInfoCheck();
          return;
        }
        dom.busInfoContent.innerHTML = renderDaBusStep();
        bindDaBusControls();
        if (typeof speak === 'function') speak(daBusSpeech);
      });
    }
  }

  function completeBusInfoCheck() {
    if (!gameState.evePrep) gameState.evePrep = {};
    if (!gameState.flags) gameState.flags = {};
    gameState.evePrep.busChecked = true;
    gameState.flags.busInfoChecked = true;
    showPhase('bag');
  }

  function startEvePrepFlow() {
    itemsPacked = [];
    addedItemsCount = 0;
    daBagQuestions = [];
    daBagQuestionIndex = 0;
    resetBagSlots();
    if (!gameState.evePrep) gameState.evePrep = {};
    if (typeof getHomeBagItems === 'function') gameState.evePrep.bagItems = getHomeBagItems();
    gameState.evePrep.bagPacked = [];
    
    // Reset items
    if (dom.deskItems) {
      dom.deskItems.forEach(function(item) {
        item.style.display = shouldShowEveItem(item) ? 'flex' : 'none';
        item.classList.remove('done', 'selected', 'dragging', 'is-correct', 'is-optional', 'is-wrong');
        item.disabled = false;
        item.style.opacity = '1';
        item.style.pointerEvents = 'auto';
        item.setAttribute('draggable', 'true');
        updateItemRequiredBadge(item);
      });
    }
    if (dom.deskItemsContainer) dom.deskItemsContainer.style.display = '';
    var quiz = document.getElementById('eve-da-bag-quiz');
    if (quiz) quiz.style.display = 'none';
    if (dom.btnBagDone) dom.btnBagDone.style.display = '';
    renderBagGameStatus();

    renderBusInfo();
    showPhase('bus');
    if (typeof speak === 'function') {
      speak(gameState.student && gameState.student.level === '다'
        ? daBusSpeech
        : "내일 탈 버스 정보를 확인하세요.");
    }
  }

  function showPhase(phase) {
    if (dom.phaseBus) dom.phaseBus.style.display = 'none';
    if (dom.phaseBag) dom.phaseBag.style.display = 'none';
    if (dom.phaseBed) dom.phaseBed.style.display = 'none';
    if (dom.phaseAlarm) dom.phaseAlarm.style.display = 'none';

    if (phase === 'bus') {
      if (dom.phaseBus) dom.phaseBus.style.display = 'flex';
    } else if (phase === 'bag') {
      if (dom.phaseBag) dom.phaseBag.style.display = 'flex';
      if (dom.eveBgImage) {
        dom.eveBgImage.src = 'assets/images/alarm-setting-evening.png';
        dom.eveBgImage.alt = '따뜻한 조명이 켜진 전날 저녁 방';
      }
      renderBagGameStatus();
      if (gameState.student && gameState.student.level === '다') {
        startDaBagQuiz();
      } else {
        if (dom.deskItemsContainer) dom.deskItemsContainer.style.display = '';
        var quiz = document.getElementById('eve-da-bag-quiz');
        if (quiz) quiz.style.display = 'none';
        if (dom.btnBagDone) dom.btnBagDone.style.display = '';
      }
      if (typeof speak === 'function') {
        speak(gameState.student && gameState.student.level === '다'
          ? "필요한 물건인지 골라보세요."
          : "내일 챙길 물건을 가방에 미리 넣어보세요.");
      }
    } else if (phase === 'bed') {
      if (dom.phaseBed) {
        dom.phaseBed.style.display = 'flex';
        playBedAnimation();
      }
    } else if (phase === 'alarm') {
      if (dom.phaseAlarm) dom.phaseAlarm.style.display = 'flex';
      if (typeof speak === 'function') {
        speak("내일 일어날 알람 시간을 설정하세요.");
      }
    }
  }

  function playBedAnimation() {
    // Reset
    if (dom.bedCharacter) {
      var avatar = typeof getStudentFallbackEmoji === 'function'
        ? getStudentFallbackEmoji(gameState.student)
        : (gameState.student && gameState.student.emoji);
      dom.bedCharacter.textContent = (avatar || '🧑') + '💤';
      dom.bedCharacter.style.opacity = '0';
      dom.bedCharacter.style.transform = 'translateY(100px)';
    }
    if (dom.bedBubble) {
      dom.bedBubble.style.opacity = '0';
      dom.bedBubble.style.transform = 'translateY(20px)';
    }

    // Trigger
    setTimeout(function() {
      if (dom.bedCharacter) {
        dom.bedCharacter.style.opacity = '1';
        dom.bedCharacter.style.transform = 'translateY(0)';
      }
    }, 100);

    setTimeout(function() {
      if (dom.bedBubble) {
        dom.bedBubble.style.opacity = '1';
        dom.bedBubble.style.transform = 'translateY(0)';
      }
      if (typeof speak === 'function') {
        speak("내일 몇 시에 일어나지?");
      }
    }, 1000);

    // Auto transition to alarm after 3.5 seconds
    setTimeout(function() {
      showPhase('alarm');
    }, 4000);
  }

  function handleItemPacking(itemName, itemEl) {
    var isTrap = itemEl.classList.contains('trap-item');
    var level = gameState.student.level;
    var bagItem = gameState.homeBag && gameState.homeBag[itemName];
    var isRequired = bagItem && bagItem.required;

    if (isTrap) {
      var itemNameTxt = itemEl.querySelector('.desk-item-label').textContent;
      if (typeof showSpeechBubble === 'function') {
        showSpeechBubble(itemNameTxt + "은(는) 내일 가방에 필요하지 않아요.", 3000);
      }
      itemEl.style.animation = 'shake 0.5s ease';
      itemEl.classList.add('is-wrong');
      setTimeout(function(){ itemEl.style.animation = ''; }, 500);
      if (dom.bagStatusText) dom.bagStatusText.textContent = itemNameTxt + ' 말고 필요한 물건을 골라요.';
      return; 
    }

    if (!isTrap && bagItem && !isRequired && level === '나') {
      if (typeof showSpeechBubble === 'function') {
        showSpeechBubble("오늘 꼭 필요한 물건은 아니에요. 필요한 물건을 먼저 챙겨요.", 3000);
      }
    }

    // Valid or Trap for Level Ga
    itemsPacked.push(itemName);
    if (typeof checkHomeItem === 'function' && bagItem) {
      checkHomeItem(itemName);
    }
    
    // Hide item from desk
    itemEl.style.opacity = '0';
    itemEl.style.pointerEvents = 'none';
    
    // Add to bag grid
    addedItemsCount++;
    var emoji = '🎒';
    if (itemName === 'transitCard') emoji = '💳';
    if (itemName === 'phone') emoji = '📱';
    if (itemName === 'umbrella') emoji = '☔';
    if (itemName === 'waterBottle') emoji = '💧';
    if (itemName === 'handFan') emoji = '🌬️';
    if (itemName === 'gloves') emoji = '🧤';
    if (itemName === 'outerwear') emoji = '🧥';
    if (itemName === 'mask') emoji = '😷';
    if (itemName === 'gameConsole') emoji = '🎮';
    if (itemName === 'snacks') emoji = '🍪';
    if (itemName === 'toy') emoji = '🧸';

    var itemNameKr = itemEl.querySelector('.desk-item-label').textContent;
    
    var div = document.createElement('div');
    div.className = 'packed-item-icon';
    div.setAttribute('data-item', itemName);
    if (isRequired) div.classList.add('is-required');
    else if (isTrap) div.classList.add('is-trap');
    else div.classList.add('is-optional');
    div.textContent = emoji;
    div.title = itemNameKr;
    appendPackedIcon(div);

    // Update GameState
    if (!gameState.evePrep) gameState.evePrep = {};
    if (!gameState.evePrep.bagPacked) gameState.evePrep.bagPacked = [];
    if (gameState.evePrep.bagPacked.indexOf(itemName) === -1) {
      gameState.evePrep.bagPacked.push(itemName);
    }
    if (!gameState.evePrep.bagItems && typeof getHomeBagItems === 'function') {
      gameState.evePrep.bagItems = getHomeBagItems();
    }
    if (gameState.evePrep && gameState.evePrep.bagItems) {
      var idx = gameState.evePrep.bagItems.findIndex(function(i) { return i.key === itemName; });
      if (idx > -1) {
        gameState.evePrep.bagItems[idx].checked = true;
      } else {
        // dynamic addition
        gameState.evePrep.bagItems.push({ key: itemName, label: itemNameKr, required: false, checked: true });
      }
    }

    if (typeof showSpeechBubble === 'function') {
      showSpeechBubble("🎒 " + itemNameKr + "을(를) 챙겼습니다.", 2000);
    }
    itemEl.classList.add(isRequired ? 'is-correct' : (isTrap ? 'is-wrong' : 'is-optional'));
    renderBagGameStatus();
    if (typeof updateTopBar === 'function') updateTopBar();
  }

  function renderBagGameStatus() {
    var bag = gameState.homeBag || {};
    var keys = Object.keys(bag);
    var requiredKeys = keys.filter(function(key) { return bag[key] && bag[key].required; });
    var packed = gameState.evePrep && gameState.evePrep.bagPacked
      ? gameState.evePrep.bagPacked
      : itemsPacked;
    var packedRequired = requiredKeys.filter(function(key) {
      return packed.indexOf(key) > -1 || (bag[key] && bag[key].checked);
    });

    if (dom.bagRequiredList) {
      dom.bagRequiredList.innerHTML = requiredKeys.map(function(key) {
        var item = bag[key];
        var checked = packedRequired.indexOf(key) > -1;
        return '<span class="' + (checked ? 'is-packed' : '') + '" data-item="' + key + '">' +
          '<i aria-hidden="true">' + (item.icon || '🎒') + '</i>' +
          '<b>' + item.name + '</b>' +
          '<em aria-hidden="true">' + (checked ? '✓' : '○') + '</em></span>';
      }).join('');
    }
    if (dom.bagRequiredCount) {
      dom.bagRequiredCount.textContent = packedRequired.length + ' / ' + requiredKeys.length;
    }
    if (dom.bagPackedCount) {
      dom.bagPackedCount.textContent = packed.length + '개 챙김';
    }

    var complete = requiredKeys.length > 0 && packedRequired.length === requiredKeys.length;
    renderBagHud();
    if (dom.bagStatusTitle) dom.bagStatusTitle.textContent = complete ? '필수 준비 완료!' : '준비 중';
    if (dom.bagStatusText) {
      dom.bagStatusText.textContent = complete
        ? '좋아요! 이제 알람을 맞춰요.'
        : '필수 물건을 ' + (requiredKeys.length - packedRequired.length) + '개 더 찾아요.';
    }
    if (dom.bagCoachText) {
      dom.bagCoachText.textContent = complete
        ? '준비물을 모두 챙겼어요!'
        : getBagCoachMessage();
    }
    if (dom.btnBagDone) dom.btnBagDone.disabled = !complete;
    if (dom.phaseBag) dom.phaseBag.classList.toggle('is-bag-complete', complete);
    renderBagPlayerAvatar();
  }

  function renderBagHud() {
    var weather = gameState.weather || (gameState.todayInfo && gameState.todayInfo.weather) || 'clear';
    var weatherLabels = {
      rainy: '비',
      hot: '더움',
      cold: '추움',
      icy: '추움',
      snowy: '눈·추움',
      dusty: '미세먼지',
      sick: '감기',
      clear: '맑음'
    };
    var workTime = (gameState.todayInfo && gameState.todayInfo.workStartTime) ||
      (gameState.time && gameState.time.target) || 540;
    var busNumber = gameState.busInfo && gameState.busInfo.correctBusNumber
      ? gameState.busInfo.correctBusNumber
      : 200;
    if (dom.bagWorkTime) dom.bagWorkTime.textContent = formatTime(workTime);
    if (dom.bagWeather) dom.bagWeather.textContent = weatherLabels[weather] || '맑음';
    if (dom.bagBus) dom.bagBus.textContent = busNumber + '번';
  }

  function resetBagSlots() {
    if (!dom.bagItemsGrid) return;
    dom.bagItemsGrid.innerHTML = '';
    for (var i = 0; i < 6; i++) {
      var slot = document.createElement('div');
      slot.className = 'eve-bag-slot';
      slot.setAttribute('aria-hidden', 'true');
      dom.bagItemsGrid.appendChild(slot);
    }
  }

  function appendPackedIcon(icon) {
    if (!dom.bagItemsGrid || !icon) return;
    var slot = dom.bagItemsGrid.querySelector('.eve-bag-slot:not(.is-filled)');
    if (slot) {
      slot.classList.add('is-filled');
      slot.appendChild(icon);
      return;
    }
    dom.bagItemsGrid.appendChild(icon);
  }

  function getBagCoachMessage() {
    var weather = gameState.weather || (gameState.todayInfo && gameState.todayInfo.weather) || 'clear';
    if (weather === 'rainy') return '비가 올 수 있어요. 우산을 확인해요!';
    if (weather === 'hot') return '더운 날이에요. 손선풍기를 확인해요!';
    if (weather === 'icy' || weather === 'cold' || weather === 'snowy') {
      return '추운 날이에요. 장갑과 겉옷을 확인해요!';
    }
    if (weather === 'dusty' || weather === 'sick') return '마스크를 확인해요!';
    return '미리 챙기면 아침이 편해져요!';
  }

  function renderBagPlayerAvatar() {
    if (!dom.bagPlayerAvatar) return;
    var student = gameState.student || {};
    var presentation = typeof getStudentAvatarPresentation === 'function'
      ? getStudentAvatarPresentation(student)
      : null;
    if (presentation && presentation.src) {
      dom.bagPlayerAvatar.innerHTML =
        '<img src="' + presentation.src + '" alt="' + (student.name || '학생') + ' 캐릭터">';
      return;
    }
    dom.bagPlayerAvatar.textContent = presentation && presentation.fallback
      ? presentation.fallback
      : (typeof getStudentFallbackEmoji === 'function' ? getStudentFallbackEmoji(student) : '🧑');
  }

  function updateItemRequiredBadge(itemEl) {
    if (!itemEl) return;
    var itemKey = itemEl.getAttribute('data-item');
    var badge = itemEl.querySelector('.desk-item-badge');
    var bagItem = gameState.homeBag && gameState.homeBag[itemKey];

    if (bagItem && bagItem.required) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'desk-item-badge';
        itemEl.appendChild(badge);
      }
      badge.textContent = '필수';
      badge.style.display = '';
    } else if (badge) {
      badge.style.display = 'none';
    }
  }

  function getItemLabelFromKey(itemKey) {
    if (gameState.homeBag && gameState.homeBag[itemKey]) return gameState.homeBag[itemKey].name;
    if (itemKey === 'gameConsole') return '게임기';
    if (itemKey === 'snacks') return '과자';
    if (itemKey === 'toy') return '장난감';
    return itemKey;
  }

  function shouldShowEveItem(itemEl) {
    var key = itemEl.getAttribute('data-item');
    var level = gameState.student && gameState.student.level;
    var homeItem = gameState.homeBag && gameState.homeBag[key];
    var isTrap = itemEl.classList.contains('trap-item');
    if (level === '가') return true;
    if (level === '나') return (!homeItem || homeItem.required || isTrap);
    return !!(homeItem && homeItem.required);
  }

  function getDaQuestionText(itemKey, isRequired) {
    var itemName = getItemLabelFromKey(itemKey);
    var weather = gameState.weather || 'clear';
    if (itemKey === 'umbrella') return '비가 와요. 우산이 필요할까요?';
    if (itemKey === 'handFan') return '오늘은 더워요. 손선풍기가 필요할까요?';
    if (itemKey === 'waterBottle') return '출근할 때 물병이 필요할까요?';
    if (itemKey === 'gloves') return '오늘은 추워요. 장갑이 필요할까요?';
    if (itemKey === 'outerwear') return '춥거나 눈길이에요. 겉옷이 필요할까요?';
    if (itemKey === 'mask') return '미세먼지나 감기에 마스크가 필요할까요?';
    return itemName + '이(가) 출근 가방에 필요할까요?';
  }

  function getOrCreateDaQuizPanel() {
    var panel = document.getElementById('eve-da-bag-quiz');
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'eve-da-bag-quiz';
    panel.style.display = 'none';
    panel.style.flexDirection = 'column';
    panel.style.alignItems = 'center';
    panel.style.justifyContent = 'center';
    panel.style.gap = '20px';
    panel.style.minHeight = '360px';
    panel.style.textAlign = 'center';
    if (dom.deskItemsContainer && dom.deskItemsContainer.parentNode) {
      dom.deskItemsContainer.parentNode.insertBefore(panel, dom.deskItemsContainer);
    }
    return panel;
  }

  function startDaBagQuiz() {
    var panel = getOrCreateDaQuizPanel();
    if (dom.deskItemsContainer) dom.deskItemsContainer.style.display = 'none';
    if (dom.btnBagDone) dom.btnBagDone.style.display = 'none';
    panel.style.display = 'flex';

    daBagQuestions = [];
    if (dom.deskItems) {
      dom.deskItems.forEach(function(itemEl) {
        var key = itemEl.getAttribute('data-item');
        if (itemEl.style.display === 'none') return;
        var bagItem = gameState.homeBag && gameState.homeBag[key];
        var isRequired = !!(bagItem && bagItem.required);
        if (isRequired || itemEl.classList.contains('trap-item')) {
          daBagQuestions.push({
            key: key,
            label: getItemLabelFromKey(key),
            required: isRequired,
            icon: bagItem ? bagItem.icon : (key === 'gameConsole' ? '🎮' : key === 'toy' ? '🧸' : '🍪')
          });
        }
      });
    }
    daBagQuestionIndex = 0;
    renderDaBagQuestion();
  }

  function renderDaBagQuestion() {
    var panel = getOrCreateDaQuizPanel();
    var q = daBagQuestions[daBagQuestionIndex];

    if (!q) {
      panel.innerHTML = '<div style="font-size:4rem;">🎒</div>' +
        '<h3 style="font-size:2rem; margin:0;">가방 확인 끝!</h3>' +
        '<p style="font-size:1.3rem;">필요한 물건을 확인했어요.</p>';
      if (dom.btnBagDone) dom.btnBagDone.style.display = '';
      if (typeof updateTopBar === 'function') updateTopBar();
      return;
    }

    var questionText = getDaQuestionText(q.key, q.required);
    panel.innerHTML = '' +
      '<div style="font-size:5rem;">' + q.icon + '</div>' +
      '<h3 style="font-size:2rem; line-height:1.35; margin:0;">' + questionText + '</h3>' +
      '<div style="display:flex; gap:18px; width:100%; max-width:520px;">' +
        '<button type="button" data-answer="yes" class="btn-action-choice" style="flex:1; font-size:1.6rem; min-height:90px;">필요해요</button>' +
        '<button type="button" data-answer="no" class="btn-action-choice" style="flex:1; font-size:1.6rem; min-height:90px;">필요 없어요</button>' +
      '</div>' +
      '<p id="eve-da-bag-feedback" style="min-height:1.6em; font-size:1.2rem; font-weight:700;"></p>';

    panel.querySelectorAll('button[data-answer]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        handleDaBagAnswer(btn.getAttribute('data-answer') === 'yes');
      });
    });

    if (typeof speak === 'function') speak(questionText);
  }

  function handleDaBagAnswer(answerNeeded) {
    var q = daBagQuestions[daBagQuestionIndex];
    if (!q) return;

    var feedback = document.getElementById('eve-da-bag-feedback');
    var correct = answerNeeded === q.required;

    if (answerNeeded && q.required) {
      checkHomeItem(q.key);
      if (!gameState.evePrep.bagPacked) gameState.evePrep.bagPacked = [];
      if (gameState.evePrep.bagPacked.indexOf(q.key) === -1) gameState.evePrep.bagPacked.push(q.key);
      if (gameState.evePrep.bagItems) {
        var idx = gameState.evePrep.bagItems.findIndex(function(i) { return i.key === q.key; });
        if (idx > -1) gameState.evePrep.bagItems[idx].checked = true;
      }
      addPackedIcon(q.key, q.label);
    }

    if (feedback) {
      if (correct) {
        feedback.textContent = answerNeeded ? '좋아요. 가방에 넣었어요.' : '맞아요. 오늘은 필요 없어요.';
        feedback.style.color = 'var(--color-success)';
      } else {
        feedback.textContent = q.required ? '오늘은 필요한 물건이에요. 다음에는 챙겨요.' : '오늘은 필요 없는 물건이에요.';
        feedback.style.color = 'var(--color-danger)';
      }
    }

    addLog(correct ? '✅' : '⚠️', '준비물 필요 여부 선택', q.label + ': ' + (answerNeeded ? '필요해요' : '필요 없어요'), 0, correct);
    daBagQuestionIndex++;
    setTimeout(renderDaBagQuestion, 900);
  }

  function addPackedIcon(itemName, itemNameKr) {
    var emoji = '🎒';
    if (gameState.homeBag && gameState.homeBag[itemName]) emoji = gameState.homeBag[itemName].icon;

    var div = document.createElement('div');
    div.className = 'packed-item-icon';
    div.setAttribute('data-item', itemName);
    div.classList.add('is-required');
    div.textContent = emoji;
    div.title = itemNameKr;
    appendPackedIcon(div);
    renderBagGameStatus();
  }

  function bindEveEvents() {
    if (dom.btnBusOk && dom.btnBusOk.dataset.eveBound !== 'true') {
      dom.btnBusOk.dataset.eveBound = 'true';
      dom.btnBusOk.addEventListener('click', function() {
        completeBusInfoCheck();
      });
    }

    if (dom.btnBagDone && dom.btnBagDone.dataset.eveBound !== 'true') {
      dom.btnBagDone.dataset.eveBound = 'true';
      dom.btnBagDone.addEventListener('click', function() {
        if (dom.btnBagDone.disabled) {
          renderBagGameStatus();
          return;
        }
        gameState.phase = 'alarm-setting';
        if (typeof addLog === 'function') {
          addLog('🎒', '전날 가방 챙기기', '필요한 물건을 미리 챙겼습니다.', 0, true);
        }
        showPhase('alarm');
      });
    }

    // Drag and Drop
    if (dom.deskItems && dom.deskItems.length > 0) {
      dom.deskItems.forEach(function(item) {
        if (item.dataset.eveBound === 'true') return;
        item.dataset.eveBound = 'true';
        // Drag
        item.addEventListener('dragstart', function(e) {
          if (item.style.opacity === '0') {
            e.preventDefault();
            return;
          }
          var itemType = item.getAttribute('data-item');
          e.dataTransfer.setData('text/plain', itemType);
          item.style.opacity = '0.5';
        });

        item.addEventListener('dragend', function(e) {
          if (item.style.pointerEvents !== 'none') {
            item.style.opacity = '1';
          }
        });

        // Click to pack
        item.addEventListener('click', function() {
          if (item.style.opacity === '0') return;
          var itemType = item.getAttribute('data-item');
          handleItemPacking(itemType, item);
        });
      });
    }

    if (dom.bagDropzone) {
      if (dom.bagDropzone.dataset.eveBound === 'true') {
        bindAlarmChoiceEvents();
        return;
      }
      dom.bagDropzone.dataset.eveBound = 'true';
      dom.bagDropzone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dom.bagDropzone.classList.add('drag-over');
      });

      dom.bagDropzone.addEventListener('dragleave', function(e) {
        dom.bagDropzone.classList.remove('drag-over');
      });

      dom.bagDropzone.addEventListener('drop', function(e) {
        e.preventDefault();
        dom.bagDropzone.classList.remove('drag-over');

        var itemType = e.dataTransfer.getData('text/plain');
        if (itemType) {
          // Find item element
          var itemEl = null;
          for(var i=0; i<dom.deskItems.length; i++){
            if(dom.deskItems[i].getAttribute('data-item') === itemType) {
              itemEl = dom.deskItems[i];
              break;
            }
          }
          if (itemEl && itemEl.style.opacity !== '0') {
            handleItemPacking(itemType, itemEl);
          }
        }
      });
    }

    bindAlarmChoiceEvents();
  }

  function bindAlarmChoiceEvents() {
    if (!dom.alarmOptions || dom.alarmOptions.dataset.eveAlarmBound === 'true') return;
    dom.alarmOptions.dataset.eveAlarmBound = 'true';
    dom.alarmOptions.addEventListener('click', function(e) {
      var adjustBtn = e.target.closest('.ga-alarm-adjust');
      if (adjustBtn) {
        var direct = dom.alarmOptions.querySelector('.ga-alarm-direct');
        var display = document.getElementById('ga-alarm-time');
        if (!direct || !display) return;
        var current = parseInt(direct.getAttribute('data-alarm-minutes'), 10);
        var delta = parseInt(adjustBtn.getAttribute('data-alarm-delta'), 10);
        current = Math.max(0, Math.min(1430, current + delta));
        direct.setAttribute('data-alarm-minutes', current);
        display.textContent = formatTime(current);
        display.classList.remove('is-ticking');
        void display.offsetWidth;
        display.classList.add('is-ticking');
        return;
      }

      var submitBtn = e.target.closest('.btn-eve-alarm-submit');
      if (submitBtn) {
        var directSetter = dom.alarmOptions.querySelector('.ga-alarm-direct');
        if (!directSetter) return;
        saveAlarmAndContinue(parseInt(directSetter.getAttribute('data-alarm-minutes'), 10));
        return;
      }

      var btn = e.target.closest('.btn-eve-alarm-choice');
      if (!btn) return;
      var timeVal = parseInt(btn.getAttribute('data-time'), 10);
      saveAlarmAndContinue(timeVal);
    });
  }

  function saveAlarmAndContinue(timeVal) {
      if (!gameState.evePrep) gameState.evePrep = {};

      if (timeVal === -1) {
        gameState.evePrep.alarmTime = null;
        gameState.alarmTime = null;
        addLog('🎲', '알람 설정 안 함', '내일 아침 운에 맡기고 잠들었습니다.', 0, false);
      } else {
        gameState.evePrep.alarmTime = timeVal;
        gameState.alarmTime = timeVal;
        addLog('⏰', '알람 설정', formatTime(timeVal) + '으로 기상 알람을 맞췄습니다.', 0, true);
      }

      advanceTime(10);
      gameState.day = (typeof gameState.day === 'number' ? gameState.day : 0) + 1;
      gameState.phase = 'sleeping';
      gameState.evePrep.snoozeCount = 0;

      if (typeof startAlarmSleepFlow === 'function') {
        startAlarmSleepFlow(timeVal);
      }
  }

  window.initEvePrepScreen = function() {
    cacheEveDom();
    renderAlarmOptions();
    renderBusInfo();
    bindEveEvents();
    startEvePrepFlow();
  };

  window.initAlarmFirstFlow = function() {
    cacheEveDom();
    renderAlarmOptions();
    bindEveEvents();
    if (!gameState.evePrep) gameState.evePrep = {};
    if (typeof showScreen === 'function') {
      showScreen('screen-eve-prep');
    }
    gameState.phase = 'alarm-setting';
    showPhase('alarm');
  };

  window.initEvePrepAfterAIPlan = function() {
    cacheEveDom();
    renderAlarmOptions();
    bindEveEvents();
    if (!gameState.evePrep) gameState.evePrep = {};
    if (typeof showScreen === 'function') {
      showScreen('screen-eve-prep');
    }
    startEvePrepFlow();
    gameState.evePrep.busChecked = true;
    gameState.flags.busInfoChecked = true;
    gameState.phase = 'eve-bag';
    showPhase('bag');
  };

})();
