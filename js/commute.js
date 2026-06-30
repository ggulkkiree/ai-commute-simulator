// ============================================================
// commute.js — 수준별 버스 이용 훈련
// 본앤하이리 출근 마스터 시뮬레이터
// ============================================================

(function() {
  var commuteState = {
    stage: 'start',
    routeIndex: -1,
    rideElapsed: 0,
    busSequence: [],
    busSequenceIndex: 0,
    currentBusNumber: null,
    stopAnswerLocked: false,
    busAnswerLocked: false,
    destinationAnswerLocked: false
  };

  var dom = {};

  function cacheCommuteDom() {
    dom.screen = document.getElementById('screen-commute');
    dom.currentTime = document.getElementById('commute-current-time');
    dom.etaTime = document.getElementById('commute-eta-time');
    dom.remainingTime = document.getElementById('commute-remaining-time');
    dom.targetTime = document.getElementById('commute-target-time');
    dom.warningBanner = document.getElementById('commute-warning-banner');
    dom.progressFill = document.getElementById('commute-progress-fill');
    dom.checkpoints = document.querySelectorAll('.commute-checkpoint');
    dom.statusIcon = document.getElementById('commute-status-icon');
    dom.statusText = document.getElementById('commute-status-text');
    dom.statusDesc = document.getElementById('commute-status-desc');
    dom.feedback = document.getElementById('commute-feedback');
    dom.scene = document.getElementById('commute-scene');
    dom.actions = document.getElementById('commute-actions');
    dom.journeyStatus = document.getElementById('commute-journey-status');
    dom.journeyMarker = document.getElementById('commute-journey-marker');
    dom.container = dom.screen ? dom.screen.querySelector('.commute-container') : null;
  }

  function ensureCommuteState() {
    if (!gameState.commuteRecord && typeof createCommuteRecord === 'function') {
      gameState.commuteRecord = createCommuteRecord();
    }
    if (!gameState.commuteRecord) {
      gameState.commuteRecord = {
        selectedStopId: null,
        stopMistakes: 0,
        selectedBusNumber: null,
        busNumberMistakes: 0,
        pressedBellAtCorrectStop: false,
        bellMistakes: 0,
        selectedDestinationCorrectly: false,
        destinationMistakes: 0,
        transitCardChecked: false,
        transitCardReturnEvent: { occurred: false, extraMinutes: 0, resolved: false },
        choiceLog: []
      };
    }
    if (!gameState.commute) {
      gameState.commute = {
        wakeTime: null,
        homeDepartureTime: gameState.time.current,
        stopArrivalTime: null,
        busBoardingTime: null,
        arrivalTime: null,
        estimatedArrivalTime: null,
        transportMode: 'bus',
        missedBusTimes: [],
        record: gameState.commuteRecord
      };
    }
    gameState.commute.record = gameState.commuteRecord;
    if (!gameState.busInfo && typeof createBusInfo === 'function') {
      gameState.busInfo = createBusInfo(gameState.time.target);
    }
  }

  function getLevel() {
    return gameState.student && gameState.student.level
      ? gameState.student.level
      : '나';
  }

  function getBusInfo() {
    return gameState.busInfo || createBusInfo(gameState.time.target);
  }

  function setStatus(icon, title, desc) {
    if (dom.statusIcon) dom.statusIcon.textContent = icon;
    if (dom.statusText) dom.statusText.textContent = title;
    if (dom.statusDesc) dom.statusDesc.textContent = desc || '';
  }

  function setFeedback(message, tone) {
    if (!dom.feedback) return;
    dom.feedback.textContent = message || '';
    dom.feedback.className = 'commute-feedback' + (tone ? ' commute-feedback--' + tone : '');
  }

  function setScene(html) {
    if (dom.scene) dom.scene.innerHTML = html || '';
  }

  function setActions(buttons) {
    if (!dom.actions) return;
    dom.actions.innerHTML = '';
    (buttons || []).forEach(function(button) {
      var element = document.createElement('button');
      element.type = 'button';
      element.className = 'commute-choice-button' +
        (button.primary ? ' commute-choice-button--primary' : '') +
        (button.danger ? ' commute-choice-button--danger' : '');
      element.textContent = button.label;
      element.setAttribute('data-value', button.value || '');
      element.addEventListener('click', button.onClick);
      dom.actions.appendChild(element);
    });
  }

  function estimateArrival() {
    if (commuteState.stage === 'on-bus') {
      return gameState.time.current +
        Math.max(0, commuteConfig.busRideMinutes - commuteState.rideElapsed) +
        commuteConfig.walkToWorkMinutes;
    }
    if (commuteState.stage === 'destination' || commuteState.stage === 'walk-to-work') {
      return gameState.time.current + commuteConfig.walkToWorkMinutes;
    }
    if (commuteState.stage === 'bus-choice' || commuteState.stage === 'transit-card') {
      return calculateArrivalByBus(getNextBusTime(gameState.time.current));
    }
    return calculateArrivalIfDepartNow(gameState.time.current).arrivalTime;
  }

  function updateDashboard() {
    var eta = estimateArrival();
    if (dom.currentTime) dom.currentTime.textContent = formatTime(gameState.time.current);
    if (dom.etaTime) dom.etaTime.textContent = formatTime(eta);
    if (dom.remainingTime) dom.remainingTime.textContent =
      (gameState.time.target - gameState.time.current) + '분';
    if (dom.targetTime) dom.targetTime.textContent = formatTime(gameState.time.target);

    var status = getArrivalStatus(eta);
    if (dom.warningBanner) {
      if (status.result === 'fail') {
        dom.warningBanner.textContent = '🔴 출근 실패 위험이 큽니다.';
        dom.warningBanner.className = 'commute-warning-banner danger';
      } else if (status.result === 'late') {
        dom.warningBanner.textContent = '⚠️ 지금은 지각 위험이 있어요.';
        dom.warningBanner.className = 'commute-warning-banner danger';
      } else {
        dom.warningBanner.textContent = '✅ 아직 출근 시간에 맞출 수 있어요.';
        dom.warningBanner.className = 'commute-warning-banner';
      }
    }
    gameState.commute.estimatedArrivalTime = eta;
    if (typeof updateTopBar === 'function') updateTopBar();
  }

  function updateProgress(percent) {
    if (dom.progressFill) dom.progressFill.style.width = percent + '%';
    updateJourneyProgress(percent);
    var thresholds = [0, 20, 50, 80, 100];
    dom.checkpoints.forEach(function(checkpoint, index) {
      checkpoint.classList.toggle('active', percent >= thresholds[index]);
    });
  }

  function updateJourneyProgress(percent) {
    if (!dom.container) return;
    var bounded = Math.max(0, Math.min(100, percent || 0));
    dom.container.style.setProperty('--journey-progress', bounded + '%');
    dom.container.setAttribute('data-journey-progress', String(bounded));

    var label = '집에서 출발 준비';
    var marker = '🧑';
    if (bounded >= 100) {
      label = '회사에 도착했어요!';
      marker = '🎉';
    } else if (bounded >= 80) {
      label = '회사까지 걸어가요';
      marker = '🚶';
    } else if (bounded >= 50) {
      label = '버스로 이동 중';
      marker = '🚌';
    } else if (bounded >= 20) {
      label = '정류장에서 버스를 확인해요';
      marker = '🚏';
    }
    if (dom.journeyStatus) dom.journeyStatus.textContent = label;
    if (dom.journeyMarker) dom.journeyMarker.textContent = marker;
  }

  function recordChoice(type, value, correct) {
    if (typeof addCommuteChoiceRecord === 'function') {
      addCommuteChoiceRecord(type, value, correct);
    }
  }

  function autoWalkToStop() {
    if (gameState.commute.stopArrivalTime !== null &&
        gameState.commute.stopArrivalTime !== undefined &&
        gameState.time.current >= gameState.commute.stopArrivalTime) {
      return;
    }
    advanceTime(commuteConfig.walkToStopMinutes);
    gameState.commute.stopArrivalTime = gameState.time.current;
    addLog('🚶', '정류장까지 걷기', '집에서 정류장까지 걸어왔습니다.',
      commuteConfig.walkToStopMinutes, true);
  }

  function renderStart() {
    setFeedback('');
    updateProgress(0);
    if (getLevel() === '가') {
      renderStopDirectionChoice();
      return;
    }

    gameState.commuteRecord.selectedStopId = getBusInfo().correctStop.id;
    recordChoice('stop_direction', getBusInfo().correctStop.id, true);
    autoWalkToStop();
    updateProgress(20);
    setStatus('🚏', '정류장에 도착했어요.',
      getLevel() === '다' ? 'AI 안내를 보고 버스를 타요.' : '탈 버스 번호를 확인해요.');
    if (getLevel() === '다' && typeof speak === 'function') {
      speak('정류장에 도착했어요. 200번 버스를 타요.');
    }
    renderBusNumberChoice();
  }

  function renderStopDirectionChoice() {
    var busInfo = getBusInfo();
    commuteState.stage = 'stop-choice';
    setStatus('🏠', '어느 정류장으로 가야 할까요?',
      '본앤하이리로 가는 방향을 선택해요.');
    setScene('<div class="commute-direction-scene">' +
      '<div class="commute-home-marker">🏠 집</div>' +
      '<div class="commute-direction-arrow">↙</div>' +
      '<div class="commute-direction-arrow">↘</div>' +
    '</div>');
    setActions([
      {
        label: '🚏 ' + busInfo.correctStop.direction,
        value: busInfo.correctStop.id,
        primary: true,
        onClick: function() { handleStopChoice(busInfo.correctStop); }
      },
      {
        label: '🚏 ' + busInfo.wrongStop.direction,
        value: busInfo.wrongStop.id,
        onClick: function() { handleStopChoice(busInfo.wrongStop); }
      }
    ]);
  }

  function handleStopChoice(stop) {
    var record = gameState.commuteRecord;
    var correct = stop.id === getBusInfo().correctStop.id;
    record.selectedStopId = stop.id;
    recordChoice('stop_direction', stop.id, correct);

    if (!correct) {
      record.stopMistakes++;
      setFeedback('반대 방향이에요. ' + getBusInfo().correctStop.direction + '을 다시 확인해요.', 'warning');
      if (record.stopMistakes >= 2) {
        commuteState.stopAnswerLocked = true;
        setFeedback('AI 힌트: ' + getBusInfo().correctStop.name + '으로 가요.', 'hint');
        setActions([{
          label: '🚏 ' + getBusInfo().correctStop.direction + '으로 가기',
          primary: true,
          onClick: function() { handleStopChoice(getBusInfo().correctStop); }
        }]);
      }
      return;
    }

    setFeedback('맞아요! ' + getBusInfo().correctStop.name + '이에요.', 'success');
    setStatus('🚶', '정류장까지 걸어가요.',
      '집에서 정류장까지 ' + commuteConfig.walkToStopMinutes + '분 걸려요.');
    setScene('<div class="commute-walk-scene">🏠 <span>···</span> 🚏</div>');
    setActions([{
      label: '정류장까지 걷기 +' + commuteConfig.walkToStopMinutes + '분',
      primary: true,
      onClick: walkToStop
    }]);
  }

  function walkToStop() {
    autoWalkToStop();
    updateProgress(20);
    setFeedback('');
    setStatus('🚏', '정류장에 도착했어요.', '버스 번호를 보고 골라요.');
    renderBusNumberChoice();
  }

  function renderBusNumberChoice() {
    var busInfo = getBusInfo();
    commuteState.stage = 'bus-choice';
    commuteState.busSequence = (busInfo.distractorBusNumbers || []).slice(0, 2);
    commuteState.busSequence.push(busInfo.correctBusNumber);
    commuteState.busSequenceIndex = 0;
    renderArrivingBus();
  }

  function renderArrivingBus() {
    var busInfo = getBusInfo();
    var number = commuteState.busSequence[commuteState.busSequenceIndex];
    if (number === undefined) number = busInfo.correctBusNumber;
    commuteState.currentBusNumber = number;
    if (dom.scene) dom.scene.classList.remove('is-bus-leaving');
    setCommuteGameMode('bus-stop');
    setFeedback('');
    setStatus('🚌', '버스가 오고 있어요!', '몇 번 버스인지 확인해볼까요?');
    setScene(
      '<div class="commute-game-scene commute-game-scene--stop">' +
        '<img src="assets/images/commute-bus-stop-game.png" alt="가방을 멘 캐릭터가 정류장에서 도착하는 버스를 확인하는 장면">' +
        '<div class="commute-game-scene__shade"></div>' +
        '<button id="btn-commute-info" class="commute-game-scene__info" type="button">🗺 출근 정보 보기</button>' +
        '<div class="commute-game-scene__speech"><strong>버스가 도착했어요!</strong><span>번호를 보고 탈지 정해요.</span></div>' +
        '<div class="commute-arriving-bus is-arriving">' +
          '<span>도착한 버스</span><strong>' + number + '번</strong>' +
        '</div>' +
        '<div id="commute-route-info" class="commute-route-info" hidden>' +
          '<button id="btn-commute-info-close" type="button" aria-label="출근 정보 닫기">×</button>' +
          '<span>오늘 타는 버스</span><strong>' + busInfo.correctBusNumber + '번</strong>' +
          '<p>' + busInfo.correctStop.direction + ' 버스를 확인해요.</p>' +
        '</div>' +
      '</div>'
    );
    bindCommuteInfoButtons();
    setActions([
      {
        label: '🚌 버스 타기',
        value: 'ride',
        primary: number === busInfo.correctBusNumber,
        onClick: function() { handleBusChoice(number); }
      },
      {
        label: '✋ 기다리기',
        value: 'wait',
        onClick: waitForNextArrivingBus
      }
    ]);
  }

  function bindCommuteInfoButtons() {
    var open = document.getElementById('btn-commute-info');
    var close = document.getElementById('btn-commute-info-close');
    var panel = document.getElementById('commute-route-info');
    if (open && panel) open.addEventListener('click', function() { panel.hidden = false; });
    if (close && panel) close.addEventListener('click', function() { panel.hidden = true; });
  }

  function waitForNextArrivingBus() {
    var correctNumber = getBusInfo().correctBusNumber;
    if (commuteState.currentBusNumber === correctNumber) {
      setFeedback(correctNumber + '번은 오늘 탈 버스예요. 버스 번호를 다시 확인해볼까요?', 'hint');
      return;
    }
    setFeedback('잘 확인했어요! 이 버스는 보내고 다음 버스를 기다려요.', 'success');
    if (typeof advanceTime === 'function') advanceTime(2);
    updateDashboard();
    commuteState.busSequenceIndex++;
    if (dom.scene) dom.scene.classList.add('is-bus-leaving');
    setActions([]);
    window.setTimeout(renderArrivingBus, 850);
  }

  function handleBusChoice(number) {
    var busInfo = getBusInfo();
    var record = gameState.commuteRecord;
    var correct = number === busInfo.correctBusNumber;
    record.selectedBusNumber = number;
    recordChoice('bus_number', number, correct);

    if (!correct) {
      record.busNumberMistakes++;
      setFeedback('이 버스는 오늘 탈 버스가 아니에요. ' +
        busInfo.correctBusNumber + '번 버스를 기다려야 해요.', 'warning');
      setStatus('🙂', '다시 선택할 수 있어요.', '출근 정보를 확인하거나 이 버스는 보내주세요.');
      return;
    }

    ensureTransitCardThenBoard();
  }

  function hasTransitCard() {
    return !!(
      (gameState.homeBag && gameState.homeBag.transitCard &&
        gameState.homeBag.transitCard.checked) ||
      (gameState.flags && gameState.flags.transitCardChecked) ||
      (gameState.commuteRecord && gameState.commuteRecord.transitCardChecked)
    );
  }

  function ensureTransitCardThenBoard() {
    if (hasTransitCard()) {
      waitForBusAndBoard();
      return;
    }

    commuteState.stage = 'transit-card';
    setStatus('💳', '교통카드가 없어요.',
      '집으로 돌아가서 교통카드를 챙긴 뒤 다시 정류장으로 와요.');
    setFeedback('교통카드는 결과 감점이 아니라, 지금 해결해야 하는 상황이에요.', 'warning');
    setScene('<div class="commute-card-event">🚏 ↔ 🏠<br><strong>교통카드 챙기기</strong></div>');
    setActions([{
      label: '집에 다녀오기 +' + commuteConfig.transitCardReturnMinutes + '분',
      primary: true,
      onClick: resolveTransitCardEvent
    }]);
  }

  function resolveTransitCardEvent() {
    var extra = commuteConfig.transitCardReturnMinutes;
    var oldNextBus = getNextBusTime(gameState.time.current);
    advanceTime(extra);
    if (typeof checkHomeItem === 'function') checkHomeItem('transitCard');
    gameState.flags.transitCardChecked = true;
    gameState.commuteRecord.transitCardChecked = true;
    gameState.commuteRecord.transitCardReturnEvent = {
      occurred: true,
      extraMinutes: extra,
      resolved: true
    };
    if (gameState.commute.missedBusTimes.indexOf(oldNextBus) === -1) {
      gameState.commute.missedBusTimes.push(oldNextBus);
    }
    addLog('💳', '교통카드 다시 챙기기',
      '교통카드가 없어 집에 다녀온 뒤 다시 정류장으로 왔습니다.', extra, false);
    recordChoice('transit_card_return', 'transitCard', true);
    setFeedback('교통카드를 챙겼어요. 다시 ' + getBusInfo().correctBusNumber + '번 버스를 타요.', 'success');
    updateDashboard();
    commuteState.stage = 'bus-choice';
    commuteState.busSequence = [getBusInfo().correctBusNumber];
    commuteState.busSequenceIndex = 0;
    renderArrivingBus();
  }

  function waitForBusAndBoard() {
    var busTime = getNextBusTime(gameState.time.current);
    var waitTime = busTime - gameState.time.current;
    if (waitTime > 0) {
      advanceTime(waitTime);
      addLog('⏳', '버스 기다리기',
        formatTime(busTime) + ' 버스를 기다렸습니다.', waitTime, true);
    }
    gameState.commute.busBoardingTime = busTime;
    commuteState.stage = 'on-bus';
    commuteState.routeIndex = -1;
    commuteState.rideElapsed = 0;
    updateProgress(50);
    setFeedback(getBusInfo().correctBusNumber + '번 버스를 탔어요.', 'success');
    setStatus('🚌', '버스 탑승!', getBusInfo().correctBusNumber + '번 버스를 탔어요!');
    if (getLevel() === '다' && typeof speak === 'function') {
      speak('200번 버스를 탔어요. 곧 내릴 곳을 알려줄게요.');
    }
    renderBoardingCutscene();
  }

  function renderBoardingCutscene() {
    setCommuteGameMode('boarding');
    setScene(
      '<div class="commute-game-scene commute-game-scene--boarding">' +
        '<img src="assets/images/commute-bus-stop-game.png" alt="캐릭터가 200번 버스에 탑승하는 장면">' +
        '<div class="commute-game-scene__shade"></div>' +
        '<div class="commute-boarding-message"><span>✨</span><h2>버스 탑승!</h2><p>' +
          getBusInfo().correctBusNumber + '번 버스를 탔어요!</p></div>' +
      '</div>'
    );
    setActions([]);
    window.setTimeout(renderNextStopAction, 1500);
  }

  function renderNextStopAction() {
    var route = getBusInfo().routeStops || [];
    var nextStop = route[commuteState.routeIndex + 1];
    if (!nextStop) {
      renderBellPrompt(route[route.length - 1]);
      return;
    }
    setCommuteGameMode('bus-interior');
    setStatus('🚌', '버스가 출발했어요.', '내릴 정류장이 오면 벨을 눌러요.');
    setScene(
      '<div class="commute-game-scene commute-game-scene--inside">' +
        '<img src="assets/images/commute-bus-interior-game.png" alt="캐릭터가 버스 좌석에 안전하게 앉아 이동하는 장면">' +
        '<div class="commute-game-scene__motion"></div>' +
        '<div class="commute-bus-next-stop"><span>다음 정류장</span><strong>' + nextStop.name + '</strong>' +
          '<small>내릴 곳: ' + getBusInfo().targetGetOffStop + '</small></div>' +
        '<div class="commute-game-scene__speech commute-game-scene__speech--inside">' +
          '<strong>창밖 풍경이 움직여요!</strong><span>정류장 안내를 잘 확인해요.</span></div>' +
      '</div>'
    );
    setActions([{
      label: '다음 정류장으로 이동하기',
      primary: true,
      onClick: moveToNextStop
    }]);
  }

  function moveToNextStop() {
    var route = getBusInfo().routeStops || [];
    var nextIndex = commuteState.routeIndex + 1;
    var stop = route[nextIndex];
    if (!stop) return;
    var previousMinutes = commuteState.routeIndex >= 0
      ? route[commuteState.routeIndex].minutesFromBoarding
      : 0;
    var travelMinutes = stop.minutesFromBoarding - previousMinutes;
    advanceTime(travelMinutes);
    commuteState.rideElapsed += travelMinutes;
    commuteState.routeIndex = nextIndex;
    updateDashboard();

    if (getLevel() === '나') {
      renderNaStopQuestion(stop);
    } else if (stop.target) {
      renderBellPrompt(stop);
    } else if (getLevel() === '다') {
      renderDaStopStatus(stop);
    } else {
      renderGaStopStatus(stop);
    }
  }

  function renderDaStopStatus(stop) {
    setCommuteGameMode('bus-interior');
    setStatus('🚌', '현재 정류장: ' + stop.name,
      '아직 내릴 곳이 아니에요. 계속 가요.');
    setScene(buildStopPromptScene(stop, '아직 내릴 곳이 아니에요.'));
    setActions([{
      label: '버스로 계속 가기',
      primary: true,
      onClick: renderNextStopAction
    }]);
    if (typeof speak === 'function') {
      speak('현재 정류장은 ' + stop.name + '입니다. 아직 내리지 않아요.');
    }
  }

  function renderGaStopStatus(stop) {
    setCommuteGameMode('bus-interior');
    setStatus('🚌', '현재 정류장: ' + stop.name,
      '본앤하이리 앞인지 확인하고 벨을 누를지 판단해요.');
    setScene(buildStopPromptScene(stop, '지금 내릴까요?'));
    setActions([
      {
        label: '🔔 하차벨 누르기',
        primary: true,
        onClick: function() { handleBellChoice(stop, true); }
      },
      {
        label: '➡️ 다음 정류장까지 가기',
        onClick: renderNextStopAction
      }
    ]);
  }

  function renderNaStopQuestion(stop) {
    setCommuteGameMode('bus-interior');
    setStatus('🚏', '현재 정류장은 ' + stop.name + '입니다.',
      '여기에서 내릴까요?');
    setScene(buildStopPromptScene(stop, '지금 내릴까요?'));
    setActions([
      {
        label: '🔔 네, 내려요',
        primary: stop.target,
        onClick: function() { handleNaStopAnswer(stop, true); }
      },
      {
        label: '➡️ 아니오, 계속 가요',
        primary: !stop.target,
        onClick: function() { handleNaStopAnswer(stop, false); }
      }
    ]);
  }

  function handleNaStopAnswer(stop, wantsToGetOff) {
    var correct = wantsToGetOff === !!stop.target;
    recordChoice('get_off_decision', stop.id + ':' + wantsToGetOff, correct);
    if (!correct) {
      gameState.commuteRecord.bellMistakes++;
      setFeedback(stop.target
        ? '본앤하이리 앞이에요. 여기에서 내려야 해요.'
        : '아직 본앤하이리 앞이 아니에요. 다음 정류장을 확인해요.', 'hint');
      if (stop.target) {
        setActions([{
          label: '네, 여기에서 내려요',
          primary: true,
          onClick: function() { handleNaStopAnswer(stop, true); }
        }]);
      } else {
        setActions([{
          label: '아니오, 다음 정류장으로 가요',
          primary: true,
          onClick: renderNextStopAction
        }]);
      }
      return;
    }
    if (stop.target) {
      handleBellChoice(stop, true);
    } else {
      setFeedback('맞아요. 아직 내리지 않아요.', 'success');
      renderNextStopAction();
    }
  }

  function renderBellPrompt(stop) {
    setCommuteGameMode('bus-interior');
    setStatus('🔔',
      getLevel() === '다' ? '곧 내려요. 벨을 눌러요.' : '본앤하이리 앞 정류장이에요.',
      '버스에서 내리기 전에 하차벨을 눌러요.');
    setScene(buildStopPromptScene(stop,
      getLevel() === '다' ? '하차벨을 눌러요!' : '지금 내릴까요?',
      'bell'));
    setActions([{
      label: '🔔 하차벨 누르기',
      primary: true,
      onClick: function() { handleBellChoice(stop, true); }
    }]);
    if (getLevel() === '다' && typeof speak === 'function') {
      speak('곧 내려요. 벨을 눌러요.');
    }
  }

  function buildStopPromptScene(stop, question, tone) {
    return '<div class="commute-game-scene commute-game-scene--inside commute-game-scene--stop-prompt">' +
      '<img src="assets/images/commute-bus-interior-game.png" alt="버스 안에서 현재 정류장을 확인하는 장면">' +
      '<div class="commute-stop-prompt__tint" aria-hidden="true"></div>' +
      '<section class="commute-stop-popup' + (tone ? ' commute-stop-popup--' + tone : '') + '">' +
        '<span class="commute-stop-popup__label">🚌 현재 정류장</span>' +
        '<strong>' + stop.name + '</strong>' +
        '<p>' + question + '</p>' +
      '</section>' +
    '</div>';
  }

  function handleBellChoice(stop, pressed) {
    var correct = !!(pressed && stop && stop.target);
    recordChoice('bell', stop ? stop.id : '', correct);
    if (!correct) {
      gameState.commuteRecord.bellMistakes++;
      setFeedback('아직 내릴 정류장이 아니에요.', 'warning');
      if (gameState.commuteRecord.bellMistakes >= 2) {
        setFeedback('AI 힌트: 본앤하이리 앞에서 벨을 눌러요.', 'hint');
      }
      renderNextStopAction();
      return;
    }

    gameState.commuteRecord.pressedBellAtCorrectStop = true;
    setFeedback('알맞은 정류장에서 벨을 눌렀어요.', 'success');
    setStatus('🚏', '본앤하이리 앞에서 내렸어요.',
      '이제 미니 지도에서 본앤하이리를 찾아요.');
    updateProgress(80);
    setActions([{
      label: '버스에서 내리기',
      primary: true,
      onClick: renderDestinationChoice
    }]);
  }

  function renderDestinationChoice() {
    var destinations = getBusInfo().destinations || [];
    var level = getLevel();
    commuteState.stage = 'destination';
    setCommuteGameMode('destination-map');
    setFeedback('');
    setStatus('🗺️',
      level === '다' ? '본앤하이리로 걸어가요.' : '본앤하이리는 어디에 있을까요?',
      level === '가' ? '미니 지도에서 목적지를 선택해요.' : '간판을 보고 본앤하이리를 찾아요.');

    if (level === '다') {
      setScene('<div class="commute-walkmap-reference" aria-label="회사 위치를 찾는 지도">' +
        '<button type="button" class="commute-map-hotspot commute-map-hotspot--bonhiri" data-destination="bonhiri" aria-label="본앤하이리"></button>' +
        '<button type="button" class="commute-map-hotspot commute-map-hotspot--park" data-destination="park" aria-label="동네 공원"></button>' +
        '<button type="button" class="commute-map-hotspot commute-map-hotspot--store" data-destination="store" aria-label="편의점"></button>' +
      '</div>');
      setActions([]);
      dom.scene.querySelectorAll('[data-destination]').forEach(function(button) {
        button.addEventListener('click', function() {
          var id = button.getAttribute('data-destination');
          var selected = destinations.find(function(destination) {
            return destination.id === id;
          });
          handleDestinationChoice(selected);
        });
      });
      if (typeof speak === 'function') speak('본앤하이리로 걸어가요.');
      return;
    }

    setScene('<div class="commute-walkmap-reference" aria-label="회사 위치를 찾는 지도">' +
      destinations.map(function(destination) {
        return '<button type="button" class="commute-map-hotspot commute-map-hotspot--' +
          destination.id + '" data-destination="' + destination.id + '" aria-label="' +
          destination.name + '"></button>';
      }).join('') +
    '</div>');
    setActions([]);
    dom.scene.querySelectorAll('[data-destination]').forEach(function(button) {
      button.addEventListener('click', function() {
        var id = button.getAttribute('data-destination');
        var selected = destinations.find(function(destination) {
          return destination.id === id;
        });
        handleDestinationChoice(selected);
      });
    });
  }

  function handleDestinationChoice(destination) {
    var correct = !!(destination && destination.correct);
    var record = gameState.commuteRecord;
    recordChoice('destination', destination ? destination.id : '', correct);
    if (!correct) {
      record.destinationMistakes++;
      setFeedback('본앤하이리 간판을 다시 찾아봐요.', 'warning');
      var limit = getLevel() === '가' ? 2 : 1;
      if (record.destinationMistakes >= limit) {
        commuteState.destinationAnswerLocked = true;
        setFeedback('AI 힌트: 🏢 본앤하이리 간판을 선택해요.', 'hint');
        var correctDestination = getBusInfo().destinations.find(function(item) {
          return item.correct;
        });
        setActions([{
          label: '🏢 본앤하이리 선택',
          primary: true,
          onClick: function() { handleDestinationChoice(correctDestination); }
        }]);
      }
      return;
    }

    record.selectedDestinationCorrectly = true;
    setCommuteGameMode('');
    setFeedback('본앤하이리를 찾았어요.', 'success');
    setStatus('🚶', '본앤하이리까지 걸어가요.',
      '정류장에서 회사까지 ' + commuteConfig.walkToWorkMinutes + '분 걸려요.');
    setScene('<div class="commute-walk-scene">🚏 <span>···</span> 🏢</div>');
    setActions([{
      label: '회사까지 걷기 +' + commuteConfig.walkToWorkMinutes + '분',
      primary: true,
      onClick: arriveAtWork
    }]);
  }

  function arriveAtWork() {
    advanceTime(commuteConfig.walkToWorkMinutes);
    gameState.commute.arrivalTime = gameState.time.current;
    addLog('🚶', '본앤하이리까지 걷기',
      '정류장에서 본앤하이리까지 걸어서 도착했습니다.',
      commuteConfig.walkToWorkMinutes, true);
    commuteState.stage = 'arrived';
    updateProgress(100);
    updateDashboard();
    setFeedback('본앤하이리에 도착했어요!', 'success');
    setStatus('🏢', '본앤하이리에 도착했습니다!',
      '출근 이동이 끝났습니다. 결과를 확인해요.');
    setScene('<div class="commute-arrival-scene">🎉 🏢 🎉</div>');
    setActions([]);
    if (typeof speak === 'function' && getLevel() === '다') {
      speak('본앤하이리에 도착했어요.');
    }
    if (typeof endGame === 'function') endGame();
  }

  window.initCommuteScreen = function() {
    cacheCommuteDom();
    ensureCommuteState();
    commuteState.stage = 'start';
    commuteState.routeIndex = -1;
    commuteState.rideElapsed = 0;
    commuteState.busSequence = [];
    commuteState.busSequenceIndex = 0;
    commuteState.currentBusNumber = null;
    commuteState.stopAnswerLocked = false;
    commuteState.busAnswerLocked = false;
    commuteState.destinationAnswerLocked = false;
    if (gameState.commute.homeDepartureTime === null ||
        gameState.commute.homeDepartureTime === undefined) {
      gameState.commute.homeDepartureTime = gameState.time.current;
    }
    setCommuteGameMode('');
    showScreen('screen-commute');
    renderStart();
    updateDashboard();
  };

  function setCommuteGameMode(mode) {
    if (!dom.container) return;
    if (mode) {
      dom.container.setAttribute('data-commute-mode', mode);
    } else {
      dom.container.removeAttribute('data-commute-mode');
    }
  }
})();
