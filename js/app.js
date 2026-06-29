/* ============================================================
   app.js — 본앤하이리 출근 마스터  Main Application Controller
   ============================================================
   No ES modules. All functions are global.
   Depends on globals from: state.js, students.js, tts.js,
   scenarios.js, engine.js, report.js, admin.js
   ============================================================ */

// ── App-level state ───────────────────────────────────────────
var currentScenario = null;
var selectedStudentId = null;
var briefingDaSteps = [];
var briefingDaStepIndex = 0;
var briefingDaSpeech = '';

// ── DOM refs (cached on DOMContentLoaded) ─────────────────────
var dom = {};

function cacheDom() {
  dom = {
    // Top bar
    topBar:            document.getElementById('top-bar'),
    currentTime:       document.getElementById('current-time'),
    remainingTime:     document.getElementById('remaining-time'),
    bagChecklist:      document.getElementById('bag-checklist'),

    // Screens
    screenMain:        document.getElementById('screen-main'),
    screenGame:        document.getElementById('screen-game'),
    screenPhase:       document.getElementById('screen-phase-transition'),
    screenResult:      document.getElementById('screen-result'),
    screenReport:      document.getElementById('screen-report'),
    screenAdmin:       document.getElementById('screen-admin'),

    // Main screen
    studentGrid:       document.getElementById('student-grid'),
    studentSearch:     document.getElementById('student-search'),
    btnStart:          document.getElementById('btn-start'),
    btnAdmin:          document.getElementById('btn-admin'),
    studentConfirmModal: document.getElementById('student-confirm-modal'),
    studentConfirmAvatar: document.getElementById('student-confirm-avatar'),
    studentConfirmName: document.getElementById('student-confirm-name'),
    studentConfirmLevel: document.getElementById('student-confirm-level'),
    studentConfirmCharacter: document.getElementById('student-confirm-character'),
    studentCharacterOptions: document.querySelectorAll('.student-character-option'),
    btnStudentConfirmStart: document.getElementById('btn-student-confirm-start'),
    btnStudentConfirmBack: document.getElementById('btn-student-confirm-back'),

    // Game screen
    scenarioBgImage:   document.getElementById('scenario-bg-image'),
    scenarioPhaseBadge:document.getElementById('scenario-phase-badge'),
    scenarioText:      document.getElementById('scenario-text'),
    scenarioAvatar:    document.getElementById('scenario-avatar'),
    btnTts:            document.getElementById('btn-tts'),
    choicesContainer:  document.getElementById('choices-container'),

    // Phase transition
    phaseIcon:         document.getElementById('phase-icon'),
    phaseTitle:        document.getElementById('phase-title'),
    phaseMessage:      document.getElementById('phase-message'),
    btnPhaseContinue:  document.getElementById('btn-phase-continue'),

    // Result
    resultBadge:       document.getElementById('result-badge'),
    resultBadgeIcon:   document.getElementById('result-badge-icon'),
    resultBadgeTitle:  document.getElementById('result-badge-title'),
    resultPhoto:       document.getElementById('result-photo'),
    resultReason:      document.getElementById('result-reason'),
    resultPrimaryProblem: document.getElementById('result-primary-problem'),
    resultPrimaryRetry: document.getElementById('result-primary-retry'),
    resultGoodList:    document.getElementById('result-good-list'),
    resultStars:       document.getElementById('result-stars'),
    resultStatusText:  document.getElementById('result-status-text'),
    resultHudTargetTime: document.getElementById('result-hud-target-time'),
    resultHudArrivalTime: document.getElementById('result-hud-arrival-time'),
    resultTeacherNote: document.getElementById('result-teacher-note'),
    btnResultTts:      document.getElementById('btn-result-tts'),
    resultContainer:   document.getElementById('result-container'),
    resultCutsceneOverlay: document.getElementById('result-cutscene-overlay'),
    resultCutsceneIcon: document.getElementById('result-cutscene-icon'),
    resultCutsceneImage: document.getElementById('result-cutscene-image'),
    resultCutsceneTitle: document.getElementById('result-cutscene-title'),
    resultCutsceneMessage: document.getElementById('result-cutscene-message'),
    btnResultCutsceneNext: document.getElementById('btn-result-cutscene-next'),
    resultStudentName: document.getElementById('result-student-name'),
    resultWorkStartTime: document.getElementById('result-work-start-time'),
    resultAlarmTime:  document.getElementById('result-alarm-time'),
    resultStartTime:   document.getElementById('result-start-time'),
    resultHomeDepartureTime: document.getElementById('result-home-departure-time'),
    resultBusBoardingTime: document.getElementById('result-bus-boarding-time'),
    resultArrivalTime: document.getElementById('result-arrival-time'),
    resultTotalTime:   document.getElementById('result-total-time'),
    resultBagStatus:   document.getElementById('result-bag-status'),
    timelineToggle:    document.getElementById('timeline-toggle'),
    timelineList:      document.getElementById('timeline-list'),
    reflectionSection: document.getElementById('reflection-section'),
    reflectionOptions: document.getElementById('reflection-options'),
    btnRetry:          document.getElementById('btn-retry'),
    btnViewReport:     document.getElementById('btn-view-report'),
    teacherReportModal: document.getElementById('teacher-report-modal'),
    teacherReportContent: document.getElementById('teacher-report-content'),
    btnTeacherReportClose: document.getElementById('btn-teacher-report-close'),
    btnTeacherReportDetail: document.getElementById('btn-teacher-report-detail'),
    btnGoHome:         document.getElementById('btn-go-home'),

    // Report
    tabIndividual:     document.getElementById('tab-individual'),
    tabSummary:        document.getElementById('tab-summary'),
    panelIndividual:   document.getElementById('panel-individual'),
    panelSummary:      document.getElementById('panel-summary'),
    reportDetail:      document.getElementById('report-detail'),
    reportSummary:     document.getElementById('report-summary'),
    reportTodayDate:   document.getElementById('report-today-date'),
    btnPrintReport:    document.getElementById('btn-print-report'),
    btnReportBack:     document.getElementById('btn-report-back'),
    btnReportRetry:    document.getElementById('btn-report-retry'),
    btnReportHome:     document.getElementById('btn-report-home'),

    // Feedback overlay
    feedbackOverlay:   document.getElementById('feedback-overlay'),
    feedbackIcon:      document.getElementById('feedback-icon'),
    feedbackTitle:     document.getElementById('feedback-title'),
    feedbackConsequence:document.getElementById('feedback-consequence'),
    feedbackTime:      document.getElementById('feedback-time'),
    feedbackBagItem:   document.getElementById('feedback-bag-item'),
    btnFeedbackNext:   document.getElementById('btn-feedback-next'),

    // Briefing screen
    screenBriefing:    document.getElementById('screen-briefing'),
    briefingContentArea:document.getElementById('briefing-content-area'),
    btnBriefingStart:  document.getElementById('btn-briefing-start'),

    // AI assistant
    btnAiAssistant:    document.getElementById('btn-ai-assistant'),
    aiHintOverlay:     document.getElementById('ai-hint-overlay'),
    aiHintText:        document.getElementById('ai-hint-text'),
    btnAiHintClose:    document.getElementById('btn-ai-hint-close'),

    // Planning screen
    screenPlanning:    document.getElementById('screen-planning'),
    btnPlanStart:      document.getElementById('btn-plan-start'),
    calcOptions:       document.querySelectorAll('.btn-calc-option'),
    totalCalcTime:     document.getElementById('total-calc-time'),
    wakeTimeHint:      document.getElementById('wake-time-hint'),
    timeOptions:       document.querySelectorAll('.btn-time-option'),
    bagOptions:        document.querySelectorAll('.draggable-item'),
    bagDropzone:       document.getElementById('bag-dropzone'),

    // V8 elements
    btnGoToDuty:         document.getElementById('btn-go-to-duty'),
    btnPrintStrategy:    document.getElementById('btn-print-strategy'),
    btnDutyDone:         document.getElementById('btn-duty-done'),
    btnDutySkip:         document.getElementById('btn-duty-skip'),
    btnDutyIntroNext:    document.getElementById('btn-duty-intro-next'),
    aiAnalysisContent:   document.getElementById('ai-analysis-content'),
    strategyCardContent: document.getElementById('strategy-card-content')
  };
}


/* ============================================================
   Screen Management
   ============================================================ */
var ALL_SCREENS = [
  'screen-main', 'screen-duty-intro', 'screen-planning', 'screen-briefing', 'screen-ai-plan', 'screen-game', 'screen-phase-transition',
  'screen-result', 'screen-duty', 'screen-report', 'screen-admin', 'screen-eve-prep', 'screen-sleep-transition', 'screen-morning-alarm', 'screen-morning-prep', 'screen-commute'
];

var SCREENS_WITH_TOPBAR = ['screen-game', 'screen-result', 'screen-commute'];

function showScreen(screenId) {
  var target = document.getElementById(screenId);
  if (!target) {
    console.error('화면을 찾을 수 없습니다:', screenId);
    return false;
  }

  // Remove active and background photo classes from all screens
  ALL_SCREENS.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.classList.remove('active');
      el.classList.remove('screen--bg-main', 'screen--bg-success', 'screen--bg-fail');
    }
  });

  // Show target
  target.classList.add('active');

  // Apply specific backgrounds
  if (screenId === 'screen-main' || screenId === 'screen-duty-intro' || screenId === 'screen-planning') {
    target.classList.add('screen--bg-main');
  } else if (screenId === 'screen-duty') {
    target.classList.add('screen--bg-success');
  } else if (screenId === 'screen-result') {
    var judgment = gameState.finalJudgment || normalizeResultJudgment(getJudgment());
    if (judgment === 'success') {
      target.classList.add('screen--bg-success');
    } else {
      target.classList.add('screen--bg-fail');
    }
  }

  // Top bar visibility
  var showTopBar = SCREENS_WITH_TOPBAR.indexOf(screenId) !== -1;
  if (dom.topBar) dom.topBar.style.display = showTopBar ? '' : 'none';
  document.body.classList.toggle('has-top-bar', showTopBar);

  // Hide admin button on non-main screens
  if (dom.btnAdmin) {
    dom.btnAdmin.style.display = (screenId === 'screen-main') ? '' : 'none';
  }

  // Stop TTS when leaving game screen
  if (screenId !== 'screen-game' && typeof stopSpeaking === 'function') {
    stopSpeaking();
  }

  // Scroll to top
  window.scrollTo(0, 0);
  return true;
}


/* ============================================================
   Top Bar Updates
   ============================================================ */
function updateTopBar() {
  if (!gameState) return;

  // Current time
  var currentMins = gameState.time.current;
  var oldTime = dom.currentTime.textContent;
  var newTime = formatTime(currentMins);
  
  if (oldTime !== '' && oldTime !== newTime) {
    dom.currentTime.classList.add('time-flash');
    setTimeout(function() {
      dom.currentTime.classList.remove('time-flash');
    }, 500);
  }
  
  dom.currentTime.textContent = newTime;

  // Remaining time
  var remaining = getRemainingTime();
  dom.remainingTime.textContent = remaining + '분';

  // Warning / danger states
  dom.topBar.classList.remove('top-bar--warning', 'top-bar--danger');
  if (remaining < 15) {
    dom.topBar.classList.add('top-bar--danger');
  } else if (remaining < 30) {
    dom.topBar.classList.add('top-bar--warning');
  }

  // Flash remaining time when low
  if (remaining < 30) {
    dom.remainingTime.classList.add('anim-time-red');
    setTimeout(function() {
      dom.remainingTime.classList.remove('anim-time-red');
    }, 600);
  }

  // Bag checklist
  renderBagChecklist();
}

function renderBagChecklist() {
  var items = typeof getHomeBagItems === 'function' ? getHomeBagItems() : getBagItems();
  var html = '';

  items.forEach(function(item) {
    if (!item.required && !item.checked) return;
    var checkedClass = item.checked ? 'bag-item--checked' : '';
    var indicator = item.checked ? '✅' : '⬜';
    html += '<span class="bag-item ' + checkedClass + '">' +
            '<span class="bag-item__icon">' + indicator + '</span>' +
            '<span>' + item.icon + ' ' + item.name + '</span>' +
            '</span>';
  });

  dom.bagChecklist.innerHTML = html;
}


/* ============================================================
   Main Screen — Student Selection
   ============================================================ */
function buildStudentAvatarMarkup(student) {
  var avatar = typeof getStudentAvatarPresentation === 'function'
    ? getStudentAvatarPresentation(student)
    : {
        key: '',
        src: '',
        fallback: student.emoji || (student.character === 'girl' ? '👩' : '🧑')
      };
  var imageMarkup = avatar.src
    ? '<img class="student-avatar__image" src="' + avatar.src +
        '" alt="" data-avatar-key="' + avatar.key + '">'
    : '';
  return '<span class="student-avatar__fallback" aria-hidden="true">' +
      avatar.fallback + '</span>' + imageMarkup;
}

function getStudentDisplayEmoji(student) {
  if (typeof getStudentFallbackEmoji === 'function') {
    return getStudentFallbackEmoji(student);
  }
  student = student || {};
  return student.emoji || (student.character === 'girl' ? '👩' : '🧑');
}

function activateStudentAvatarImages(root) {
  if (!root) return;
  var images = root.querySelectorAll('.student-avatar__image');
  images.forEach(function(image) {
    var holder = image.parentElement;
    function showLoadedImage() {
      if (image.naturalWidth > 0) holder.classList.add('has-avatar-image');
    }
    image.addEventListener('load', showLoadedImage, { once: true });
    image.addEventListener('error', function() {
      holder.classList.remove('has-avatar-image');
      image.remove();
    }, { once: true });
    if (image.complete) showLoadedImage();
  });
}

function renderMainScreen() {
  var students = getStudents();
  var grid = dom.studentGrid;
  var searchValue = dom.studentSearch ? dom.studentSearch.value.trim().toLowerCase() : '';

  // Reset selection
  selectedStudentId = null;
  dom.btnStart.disabled = true;

  if (!students || students.length === 0) {
    grid.innerHTML =
      '<div class="empty-state" style="grid-column: 1/-1;">' +
        '<div class="empty-state__icon">👩‍🏫</div>' +
        '<p class="empty-state__text">등록된 학생이 없습니다.<br>관리자 설정에서 학생을 추가해주세요.</p>' +
      '</div>';
    return;
  }

  if (searchValue) {
    students = students.filter(function(s) {
      return String(s.name || '').toLowerCase().indexOf(searchValue) > -1;
    });
  }

  if (!students || students.length === 0) {
    grid.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-state__icon">🔎</div>' +
        '<p class="empty-state__text">찾는 학생이 없습니다.<br>이름을 다시 확인해주세요.</p>' +
      '</div>';
    return;
  }

  var html = '';
  students.forEach(function(s) {
    var levelLabel = getLevelLabel(s.level);
    html +=
      '<div class="student-card" role="radio" aria-checked="false" ' +
           'data-student-id="' + s.id + '" data-student-name="' + s.name + '" tabindex="0" ' +
           'aria-label="' + s.name + ' (' + levelLabel + ')">' +
        '<span class="student-card__avatar">' + buildStudentAvatarMarkup(s) + '</span>' +
        '<span class="student-card__name">' + s.name + '</span>' +
        '<span class="student-card__level">수준: ' + s.level + '</span>' +
        '<span class="student-card__selected-label">선택됨</span>' +
      '</div>';
  });

  grid.innerHTML = html;
  activateStudentAvatarImages(grid);

  // Attach click handlers
  var cards = grid.querySelectorAll('.student-card');
  cards.forEach(function(card) {
    card.addEventListener('click', function() {
      selectStudent(card.getAttribute('data-student-id'));
    });
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectStudent(card.getAttribute('data-student-id'));
      }
    });
  });
}

function getLevelLabel(level) {
  var labels = {
    '가': '가 수준',
    '나': '나 수준',
    '다': '다 수준'
  };
  return labels[level] || level;
}

function selectStudent(studentId) {
  selectedStudentId = studentId;

  // Update visual selection
  var cards = dom.studentGrid.querySelectorAll('.student-card');
  cards.forEach(function(card) {
    var isSelected = card.getAttribute('data-student-id') === studentId;
    card.classList.toggle('student-card--selected', isSelected);
    card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  });

  // Enable start button
  dom.btnStart.disabled = false;
  openStudentConfirmation();
}

function getSelectedStudent() {
  if (!selectedStudentId) return null;
  var students = getStudents();
  for (var i = 0; i < students.length; i++) {
    if (String(students[i].id) === String(selectedStudentId)) return students[i];
  }
  return null;
}

function openStudentConfirmation() {
  var student = getSelectedStudent();
  if (!student || !dom.studentConfirmModal) return;
  renderStudentCharacterSelection(student);
  dom.studentConfirmName.textContent = student.name;
  dom.studentConfirmLevel.textContent = getLevelLabel(student.level);
  dom.studentConfirmModal.style.display = 'flex';
  if (dom.btnStudentConfirmStart) dom.btnStudentConfirmStart.focus();
}

function renderStudentCharacterSelection(student) {
  if (!student) return;
  var characterKey = student.character === 'girl' ? 'girl' : 'boy';
  var characterInfo = typeof getCharacterDefinition === 'function'
    ? getCharacterDefinition(characterKey)
    : { gender: characterKey === 'girl' ? '여자' : '남자', emoji: characterKey === 'girl' ? '👩' : '🧑' };
  var character = characterInfo.gender;
  dom.studentConfirmAvatar.innerHTML = buildStudentAvatarMarkup(student);
  activateStudentAvatarImages(dom.studentConfirmAvatar);
  dom.studentConfirmCharacter.textContent = character;
  if (dom.studentCharacterOptions) {
    dom.studentCharacterOptions.forEach(function(button) {
      var selected = button.getAttribute('data-character') === characterKey;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  }
}

function selectStudentCharacter(character) {
  var student = getSelectedStudent();
  if (!student) return;
  var characterKey = character === 'girl' ? 'girl' : 'boy';
  if (typeof updateStudentCharacter === 'function') {
    updateStudentCharacter(student.id, characterKey);
  }
  renderStudentCharacterSelection(getSelectedStudent());
  renderSelectedStudentCard();
}

function renderSelectedStudentCard() {
  var student = getSelectedStudent();
  if (!student || !dom.studentGrid) return;
  var card = dom.studentGrid.querySelector('[data-student-id="' + student.id + '"]');
  if (!card) return;
  var avatar = card.querySelector('.student-card__avatar');
  if (avatar) {
    avatar.innerHTML = buildStudentAvatarMarkup(student);
    activateStudentAvatarImages(avatar);
  }
}

function closeStudentConfirmation(clearSelection) {
  if (dom.studentConfirmModal) dom.studentConfirmModal.style.display = 'none';
  if (!clearSelection) return;
  selectedStudentId = null;
  dom.btnStart.disabled = true;
  var cards = dom.studentGrid.querySelectorAll('.student-card');
  cards.forEach(function(card) {
    card.classList.remove('student-card--selected');
    card.setAttribute('aria-checked', 'false');
  });
}


/* ============================================================
   Game Flow
   ============================================================ */
function startGame() {
  if (!selectedStudentId) return;

  // Find student
  var students = getStudents();
  var student = null;
  for (var i = 0; i < students.length; i++) {
    if (String(students[i].id) === String(selectedStudentId)) {
      student = students[i];
      break;
    }
  }

  if (!student) {
    selectedStudentId = null;
    renderMainScreen();
    return;
  }

  // Initialize game state
  initGame(student);

  // 1. Select duties
  selectTodayDuties();
  if (typeof generateTodayCommuteInfo === 'function') {
    generateTodayCommuteInfo();
  }

  // 2. 학생 선택 직후 출근 경로와 입력 정보를 먼저 확인
  renderBriefing(student);
  showScreen('screen-briefing');
}

/**
 * Render dynamic morning briefing content based on student's level
 */
function renderBriefing(student) {
  if (typeof renderCommuteRouteScreen === 'function') {
    renderCommuteRouteScreen();
    return;
  }
  var info = gameState.todayInfo || {};
  var weather = info.weather || gameState.weather || 'clear';
  var level = student.level;
  var workStartText = formatTime(info.workStartTime || gameState.time.target);
  var homeItems = Array.isArray(info.homeItems) ? info.homeItems : [];
  var workplaceItems = Array.isArray(info.workplaceItems) ? info.workplaceItems : [];
  var duties = Array.isArray(info.duties) && info.duties.length > 0
    ? info.duties
    : (gameState.todayDuties || []);
  var dutyNames = duties.map(function(d) { return d.name || d; });
  
  var weatherVal = '';
  var weatherEmoji = '☀️';

  if (weather === 'rainy') {
    weatherEmoji = '🌧️';
    weatherVal = '비';
  } else if (weather === 'hot') {
    weatherEmoji = '☀️';
    weatherVal = '더움';
  } else if (weather === 'icy') {
    weatherEmoji = '❄️';
    weatherVal = '미끄러운 길';
  } else if (weather === 'cold' || weather === 'snowy') {
    weatherEmoji = '❄️';
    weatherVal = weather === 'snowy' ? '눈' : '추움';
  } else if (weather === 'dusty') {
    weatherEmoji = '😷';
    weatherVal = '미세먼지';
  } else {
    weatherEmoji = '☀️';
    weatherVal = '맑음';
  }

  var html = '';

  if (level === '다') {
    briefingDaSteps = [
      {
        icon: '⏰',
        label: '출근 시간',
        value: workStartText,
        speech: '오늘의 출근 시간은 ' + workStartText + '입니다.'
      },
      {
        icon: weatherEmoji,
        label: '오늘 날씨',
        value: weatherVal,
        speech: '오늘 날씨는 ' + weatherVal + '입니다.'
      },
      {
        icon: '🎒',
        label: '집에서 챙길 것',
        value: homeItems.join(', ') || '기본 준비물',
        speech: '집에서 ' + (homeItems.join(', ') || '필요한 물건') + '을 챙겨요.'
      },
      {
        icon: duties.length > 0 && duties[0].icon ? duties[0].icon : '🛠️',
        label: '오늘 할 일',
        value: dutyNames.join(', ') || '오늘의 직무',
        speech: '오늘 할 일은 ' + (dutyNames.join(', ') || '직무 활동') + '입니다.'
      },
      {
        icon: '🏢',
        label: '도착하면 사용할 것',
        value: workplaceItems.join(', ') || '작업도구 확인',
        speech: '본앤하이리에 도착하면 ' + (workplaceItems.join(', ') || '작업도구') + '을 사용해요.'
      },
      {
        icon: '⚠️',
        label: '주의할 점',
        value: info.caution || '출근 시간을 확인해요.',
        speech: info.caution || '출근 시간을 확인해요.'
      }
    ];
    briefingDaStepIndex = 0;
    html = renderDaBriefingStep();
    if (dom.btnBriefingStart) {
      dom.btnBriefingStart.disabled = true;
      dom.btnBriefingStart.textContent = '버스 정보 확인하기';
    }
  } else {
    var levelClass = level === '나' ? ' briefing-grid--na' : ' briefing-grid--ga';
    html += '<div class="briefing-grid' + levelClass + '">';
    html += buildBriefingInfoCard('⏰', '1. 출근 시간', workStartText, '오늘은 ' + workStartText + '까지 ' + (info.workplace || '본앤하이리') + '에 출근해요.', false);
    html += buildBriefingInfoCard(weatherEmoji, '2. 날씨', weatherVal, info.caution || '날씨를 확인해요.', false);
    html += buildBriefingInfoCard('🎒', '3. 집에서 챙길 것', homeItems.join(', ') || '기본 준비물', '집에서 가방에 넣어 가져가요.', false);
    html += buildBriefingInfoCard('🛠️', '4. 오늘 할 일', dutyNames.join(', ') || '오늘의 직무', '본앤하이리에서 할 일을 확인해요.', false);
    html += buildBriefingInfoCard('🏢', '5. 도착하면 사용할 것', workplaceItems.join(', ') || '작업도구 확인', '직장에 도착한 뒤 사용하는 물건이에요.', false);
    html += buildBriefingInfoCard('⚠️', '6. 주의사항', info.caution || '출근 시간과 버스 시간을 확인해요.', '', true);
    html += '</div>';
    if (dom.btnBriefingStart) {
      dom.btnBriefingStart.disabled = false;
      dom.btnBriefingStart.textContent = '버스 정보 확인하기';
    }
  }

  dom.briefingContentArea.innerHTML = html;
  bindDaBriefingControls();
}

function buildBriefingInfoCard(icon, label, value, description, wide) {
  return '<article class="briefing-info-card' + (wide ? ' briefing-info-card--wide' : '') + '">' +
    '<div class="briefing-info-card__icon" aria-hidden="true">' + icon + '</div>' +
    '<div class="briefing-info-card__body">' +
      '<div class="briefing-info-card__label">' + label + '</div>' +
      '<div class="briefing-info-card__value">' + value + '</div>' +
      (description ? '<p class="briefing-info-card__desc">' + description + '</p>' : '') +
    '</div>' +
  '</article>';
}

function renderDaBriefingStep() {
  var step = briefingDaSteps[briefingDaStepIndex];
  if (!step) return '';
  briefingDaSpeech = step.speech;
  return '<div class="briefing-step-card">' +
    '<div class="briefing-step-card__progress">' + (briefingDaStepIndex + 1) + ' / ' + briefingDaSteps.length + '</div>' +
    '<div class="briefing-step-card__icon" aria-hidden="true">' + step.icon + '</div>' +
    '<div class="briefing-step-card__label">' + step.label + '</div>' +
    '<div class="briefing-step-card__value">' + step.value + '</div>' +
    '<div class="briefing-step-card__actions">' +
      '<button type="button" id="btn-briefing-replay" class="briefing-step-button briefing-step-button--secondary">🔊 다시 듣기</button>' +
      '<button type="button" id="btn-briefing-confirm" class="briefing-step-button">확인</button>' +
    '</div>' +
  '</div>';
}

function bindDaBriefingControls() {
  var replayButton = document.getElementById('btn-briefing-replay');
  var confirmButton = document.getElementById('btn-briefing-confirm');
  if (replayButton) {
    replayButton.addEventListener('click', function() {
      if (typeof speak === 'function') speak(briefingDaSpeech);
    });
  }
  if (confirmButton) {
    confirmButton.addEventListener('click', function() {
      briefingDaStepIndex++;
      if (briefingDaStepIndex >= briefingDaSteps.length) {
        gameState.flags.briefingChecked = true;
        dom.briefingContentArea.innerHTML =
          '<div class="briefing-step-card briefing-step-card--complete">' +
            '<div class="briefing-step-card__icon">✅</div>' +
            '<div class="briefing-step-card__value">출근 정보를 모두 확인했어요.</div>' +
          '</div>';
        if (dom.btnBriefingStart) dom.btnBriefingStart.disabled = false;
        if (typeof speak === 'function') speak('출근 정보를 모두 확인했어요. 이제 버스 정보를 확인해요.');
        return;
      }
      dom.briefingContentArea.innerHTML = renderDaBriefingStep();
      bindDaBriefingControls();
      if (typeof speak === 'function') speak(briefingDaSpeech);
    });
  }
}

function speakCurrentBriefingStep() {
  if (briefingDaSpeech && typeof speak === 'function') {
    speak(briefingDaSpeech);
  }
}

function nextScenario() {
  // Check if game is over
  if (isGameOver(gameState)) {
    endGame();
    return;
  }

  // Check phase transition
  if (shouldTransitionPhase(gameState)) {
    showPhaseTransition();
    return;
  }

  // Select next scenario
  currentScenario = selectNextScenario(gameState, scenarioDB);

  if (!currentScenario) {
    // No more scenarios in current phase → transition or end
    if (gameState.currentPhase === 'arrival' || getNextPhase(gameState.currentPhase) === null) {
      endGame();
    } else {
      showPhaseTransition();
    }
    return;
  }

  // Check auto-resolve (e.g. 비가 와요 / 너무 더워요)
  if (typeof checkAutoResolve === 'function') {
    var autoResolve = checkAutoResolve(gameState, currentScenario);
    if (autoResolve) {
      var result = applyAutoResolve(gameState, currentScenario, autoResolve);
      updateTopBar();
      showFeedback(result, { text: '자동 해결', icon: currentScenario.icon });
      return;
    }
  }

  // Render the scenario
  renderScenario(currentScenario);
}

function renderScenario(scenario) {
  var level = gameState.student.level;

  // Phase badge
  var phaseLabels = {
    'wake_up':  '🏠 기상 준비',
    'prepare':  '🎒 외출 준비',
    'commute':  '🚌 이동 중',
    'arrival':  '🏢 도착'
  };
  dom.scenarioPhaseBadge.textContent = phaseLabels[scenario.phase] || scenario.phase;

  // Background Image
  if (dom.scenarioBgImage && scenario.backgroundImage) {
    dom.scenarioBgImage.src = scenario.backgroundImage;
  }

  // Animation Effect
  var container = dom.screenGame.querySelector('.scenario-container');
  if (container) {
    // Reset animations
    container.classList.remove('anim-fade-in', 'anim-slide-up', 'anim-zoom-in');
    
    // Trigger reflow to restart animation
    void container.offsetWidth;
    
    if (scenario.animationEffect) {
      container.classList.add('anim-' + scenario.animationEffect);
    } else {
      container.classList.add('anim-fade-in'); // Default
    }
  }

  // Student avatar set
  if (dom.scenarioAvatar) {
    dom.scenarioAvatar.textContent = getStudentDisplayEmoji(gameState.student) || '😊';
  }

  // Situation text (level-specific)
  var situationText = getTextForLevel(scenario.situation, level);
  dom.scenarioText.textContent = situationText;

  // Auto-speak for 다 level
  if (level === '다' && typeof autoSpeak === 'function') {
    autoSpeak(situationText, level);
  }

  // Choice buttons
  var choicesHtml = '';
  scenario.choices.forEach(function(choice, index) {
    var choiceText = getTextForLevel(choice.text, level);
    var choiceIcon = choice.icon || '';
    choicesHtml +=
      '<button class="btn-choice" data-choice-index="' + index + '" ' +
              'aria-label="' + choiceText + '">' +
        '<span class="btn-choice__icon">' + choiceIcon + '</span>' +
        '<span class="btn-choice__text">' + choiceText + '</span>' +
      '</button>';
  });
  dom.choicesContainer.innerHTML = choicesHtml;

  // Attach choice handlers
  var choiceBtns = dom.choicesContainer.querySelectorAll('.btn-choice');
  choiceBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var idx = parseInt(btn.getAttribute('data-choice-index'), 10);
      handleChoice(idx);
    });
  });

  // Re-trigger container animation
  var container = document.querySelector('.scenario-container');
  if (container) {
    container.classList.remove('anim-slide-up');
    void container.offsetWidth;
    container.classList.add('anim-slide-up');
  }

  // '다' 수준 학생의 경우 힌트 모달창 자동 팝업 연동
  if (level === '다') {
    setTimeout(function() {
      handleAiAssistantClick();
    }, 450);
  }
}

/**
 * Get level-appropriate text.
 * If text is an object with keys 가/나/다, return the matching level.
 * Otherwise return the text as-is.
 */
function getTextForLevel(text, level) {
  if (text && typeof text === 'object') {
    var val = text[level] || text['나'] || text['가'] || '';
    if (Object.prototype.toString.call(val) === '[object Array]') {
      var randIdx = Math.floor(Math.random() * val.length);
      return val[randIdx];
    }
    return val;
  }
  return text || '';
}


/* ============================================================
   Choice Handling & Feedback
   ============================================================ */
function handleChoice(choiceIndex) {
  if (!currentScenario || !currentScenario.choices[choiceIndex]) return;

  // Disable choice buttons to prevent double-tap
  var btns = dom.choicesContainer.querySelectorAll('.btn-choice');
  btns.forEach(function(b) { b.disabled = true; });

  // Apply the choice
  var result = applyChoice(gameState, currentScenario, choiceIndex);

  // Apply bus timetable penalty
  if (currentScenario && currentScenario.id === 'comm_01' && choiceIndex === 0 && !gameState.evePrep.busChecked) {
    result.timeCost += 5;
    advanceTime(5);
    result.consequence += " (전날 버스 시간을 미리 확인하지 않아 정류장에서 5분 더 대기해야 했습니다.)";
  }

  // Process bagEffect to actually pack items
  if (result.bagEffect) {
    if (result.bagEffect.action === 'check' && typeof checkItem === 'function') {
      checkItem(result.bagEffect.item);
    } else if (result.bagEffect.action === 'uncheck' && typeof uncheckItem === 'function') {
      uncheckItem(result.bagEffect.item);
    } else if (result.bagEffect.action === 'pack_planned' && typeof checkItem === 'function') {
      var planned = gameState.plan.items || [];
      for (var p = 0; p < planned.length; p++) {
        checkItem(planned[p]);
      }
    }
  }

  // Update top bar
  updateTopBar();

  // Show feedback
  var choice = currentScenario.choices[choiceIndex];
  showFeedback(result, choice);
}

function showFeedback(result, choice) {
  var level = gameState.student.level;

  // Icon
  var feedbackEmoji = result.isOptimal ? '✅' : (result.timeCost > 10 ? '😰' : '⚠️');
  dom.feedbackIcon.textContent = feedbackEmoji;

  // Title
  dom.feedbackTitle.textContent = result.isOptimal ? '잘했어요!' : '앗, 이런!';

  // Consequence text
  var consequenceText = result.consequence || '';
  dom.feedbackConsequence.textContent = consequenceText;

  // Time cost display
  if (result.timeCost && result.timeCost !== 0) {
    dom.feedbackTime.style.display = '';
    if (result.timeCost > 0) {
      dom.feedbackTime.className = 'feedback-card__time feedback-card__time--cost';
      dom.feedbackTime.textContent = '⏱️ ' + result.timeCost + '분 소요';
    } else {
      dom.feedbackTime.className = 'feedback-card__time feedback-card__time--save';
      dom.feedbackTime.textContent = '⏱️ ' + Math.abs(result.timeCost) + '분 절약!';
    }
  } else {
    dom.feedbackTime.style.display = 'none';
  }

  // Bag item acquired
  if (result.bagEffect && result.bagEffect.item && result.bagEffect.action === 'check') {
    var itemKey = result.bagEffect.item;
    var itemName = gameState.bag[itemKey] ? gameState.bag[itemKey].name : '소지품';
    dom.feedbackBagItem.style.display = '';
    dom.feedbackBagItem.textContent = '👜 ' + itemName + ' 획득!';
    // Re-trigger animation
    dom.feedbackBagItem.classList.remove('anim-check');
    void dom.feedbackBagItem.offsetWidth;
    dom.feedbackBagItem.classList.add('anim-check');
  } else {
    dom.feedbackBagItem.style.display = 'none';
  }

  // Auto-speak for 다 level
  if (level === '다' && typeof autoSpeak === 'function') {
    autoSpeak(consequenceText, level);
  }

  // Show overlay
  dom.feedbackOverlay.style.display = '';

  // Focus next button for accessibility
  dom.btnFeedbackNext.focus();
}

function closeFeedback() {
  dom.feedbackOverlay.style.display = 'none';
  nextScenario();
}


/* ============================================================
   Phase Transition
   ============================================================ */
function showPhaseTransition() {
  var from = gameState.currentPhase;
  var to = getNextPhase(from);

  // If we've reached arrival, end the game
  if (!to || to === 'arrival') {
    endGame();
    return;
  }

  // Phase icons
  var phaseIcons = {
    'wake_up': '🌅',
    'prepare': '🎒',
    'commute': '🚌',
    'arrival': '🏢'
  };

  var phaseNames = {
    'wake_up': '기상 준비 단계',
    'prepare': '외출 준비 단계',
    'commute': '이동 단계',
    'arrival': '도착 단계'
  };

  dom.phaseIcon.textContent = phaseIcons[to] || '📍';
  dom.phaseTitle.textContent = phaseNames[to] || to;

  var transMsg = '';
  if (typeof getPhaseTransitionMessage === 'function') {
    transMsg = getPhaseTransitionMessage(from, to);
  }
  dom.phaseMessage.textContent = transMsg || '다음 단계로 넘어갑니다!';

  // Set the new phase in game state
  setPhase(to);

  // Show the phase transition screen
  showScreen('screen-phase-transition');
}


/* ============================================================
   End Game & Result
   ============================================================ */
function endGame() {
  if (!gameState || !gameState.student ||
      gameState.student.id === null || gameState.student.id === undefined) {
    console.error('결과를 만들 학생 정보가 없습니다.');
    return;
  }

  // Calculate judgment
  var judgment = normalizeResultJudgment(getJudgment());
  gameState.finalJudgment = judgment;
  var requiredStatus = getRequiredItemsStatus();
  var commute = gameState.commute || {};
  var missedBusTimes = commute.missedBusTimes || [];
  var aiSummary = buildResultAiSummary(judgment, requiredStatus, missedBusTimes);
  if (typeof collectFeedbackCandidatesFromState === 'function') {
    collectFeedbackCandidatesFromState();
  }
  addWeatherFeedbackCandidate();
  removeTransitCardOnlyFeedback();
  if (typeof resolvePrimaryFeedback === 'function') {
    resolvePrimaryFeedback();
  }

  // Save game result
  if (!gameState.resultSaved && typeof saveGameResult === 'function') {
    saveGameResult({
      studentId: gameState.student.id,
      studentName: gameState.student.name,
      level: gameState.student.level,
      studentAvatar: getStudentDisplayEmoji(gameState.student) || '😊',
      studentGender: gameState.student.gender || '',
      studentCharacter: gameState.student.character || '',
      workStartTime: getWorkStartTime(),
      todayInfo: gameState.todayInfo || {},
      busInfo: gameState.busInfo || null,
      homeBagStatus: typeof getHomeBagItems === 'function' ? getHomeBagItems() : [],
      morningActivities: gameState.morningActivities || [],
      commuteRecord: gameState.commuteRecord || null,
      feedback: gameState.feedback || null,
      teacherReport: gameState.teacherReport || null,
      alarmTime: gameState.evePrep ? gameState.evePrep.alarmTime : null,
      startTime: gameState.startTime,
      currentTime: gameState.time.current,
      wakeTime: commute.wakeTime || gameState.startTime,
      homeDepartureTime: commute.homeDepartureTime,
      stopArrivalTime: commute.stopArrivalTime,
      busBoardingTime: commute.busBoardingTime,
      arrivalTime: commute.arrivalTime || gameState.time.current,
      transportMode: commute.transportMode || 'bus',
      estimatedArrivalTime: commute.estimatedArrivalTime,
      arrivalStatus: getArrivalStatus(gameState.time.current).result,
      missedBusTimes: missedBusTimes,
      requiredItemNames: (gameState.todayInfo && gameState.todayInfo.requiredItems) || [],
      missingItems: requiredStatus.missing || [],
      aiSummary: aiSummary,
      deadline: gameState.time.deadline,
      judgment: judgment,
      bagStatus: typeof getHomeBagItems === 'function' ? getHomeBagItems() : getBagItems(),
      actionLog: gameState.actionLog || [],
      bagItems: typeof getHomeBagItems === 'function' ? getHomeBagItems() : getBagItems(),
      requiredItemsStatus: requiredStatus,
      log: gameState.actionLog || [],
      date: new Date().toISOString()
    });
    gameState.resultSaved = true;
  }

  showResultCutscene(judgment, function() {
    showScreen('screen-result');
    renderResultScreen(judgment);
  });
}

function normalizeResultJudgment(judgment) {
  return judgment === 'incomplete' ? 'success' : judgment;
}

function addWeatherFeedbackCandidate() {
  if (typeof getHomeBagItems !== 'function' || typeof addFeedbackCandidate !== 'function') return;
  var weatherKeys = ['umbrella', 'handFan', 'outerwear', 'mask'];
  var hasMissingWeatherItem = getHomeBagItems().some(function(item) {
    return item.required && !item.checked && weatherKeys.indexOf(item.key) > -1;
  });
  if (hasMissingWeatherItem) addFeedbackCandidate('missing_weather_item');
}

function removeTransitCardOnlyFeedback() {
  if (!gameState.feedback || !Array.isArray(gameState.feedback.candidates)) return;
  var missingKeys = gameState.morningPrep && Array.isArray(gameState.morningPrep.bagMissingItems)
    ? gameState.morningPrep.bagMissingItems
    : [];
  if (missingKeys.length === 0) return;
  var transitCardOnly = missingKeys.every(function(key) { return key === 'transitCard'; });
  if (!transitCardOnly) return;
  gameState.feedback.candidates = gameState.feedback.candidates.filter(function(candidate) {
    return candidate.tag !== 'bag_missing_item';
  });
}

function getResultPresentation(judgment) {
  var primaryTag = gameState.feedback && gameState.feedback.primaryTag;
  var catalog = {
    commute_failed: { icon: '🛑', title: '출근이 어려워졌어요', message: '시간이 너무 늦어 오늘 출근을 마치지 못했어요.', image: 'assets/images/result_fail.png' },
    late: { icon: '⏰', title: '조금 늦었어요', message: '도착했지만 출근 시간을 지나쳤어요.', image: 'assets/images/result_late.png' },
    wrong_bus_number: { icon: '🚌', title: '버스 번호를 다시 확인했어요', message: '200번 버스를 찾는 데 시간이 걸렸어요.', image: 'assets/images/result_unprepared.png' },
    missed_bell: { icon: '🔔', title: '내릴 곳을 놓칠 뻔했어요', message: '정류장을 확인하고 하차벨을 다시 눌렀어요.', image: 'assets/images/result_late.png' },
    wrong_destination: { icon: '🗺️', title: '간판을 다시 확인했어요', message: '본앤하이리 위치를 찾는 데 시간이 걸렸어요.', image: 'assets/images/result_unprepared.png' },
    overslept: { icon: '😲', title: '시계를 보고 놀랐어요', message: '알람을 미뤄 준비 시간이 줄었어요.', image: 'assets/images/result_late.png' },
    smartphone_delay: { icon: '📱', title: '시간이 훌쩍 지났어요', message: '스마트폰을 보는 동안 출발 시간이 가까워졌어요.', image: 'assets/images/anim_sns.png' },
    missing_weather_item: { icon: '🌧️', title: '날씨 물건이 필요했어요', message: '날씨에 필요한 물건이 없어 불편했어요.', image: 'assets/images/result_wet.png' },
    no_breakfast: { icon: '🍽️', title: '배가 고파졌어요', message: '아침밥을 먹지 않아 일할 때 배가 고팠어요.', image: 'assets/images/result_hungry.png' },
    no_shower: { icon: '🚿', title: '몸이 찝찝했어요', message: '씻지 않고 나와 상쾌하지 않았어요.', image: 'assets/images/result_smelly.png' },
    no_toothbrush: { icon: '🪥', title: '입 냄새가 걱정됐어요', message: '양치를 하지 않아 말할 때 신경이 쓰였어요.', image: 'assets/images/result_smelly.png' },
    wrong_clothes: { icon: '👕', title: '옷이 날씨와 맞지 않았어요', message: '오늘 날씨에 더 알맞은 옷이 필요했어요.', image: 'assets/images/result_unprepared.png' },
    bag_missing_item: { icon: '🎒', title: '가방을 다시 확인했어요', message: '빠진 물건을 찾아 출발 전에 다시 챙겼어요.', image: 'assets/images/result_unprepared.png' }
  };

  if (primaryTag && catalog[primaryTag]) return catalog[primaryTag];
  if (judgment === 'late') return catalog.late;
  if (judgment === 'fail') return catalog.commute_failed;
  return { icon: '✨', title: '준비한 대로 잘 도착했어요', message: '나의 선택이 좋은 출근으로 이어졌어요.', image: 'assets/images/result_success.png' };
}

function showResultCutscene(judgment, onComplete) {
  var scene = getResultPresentation(judgment);
  if (!dom.resultCutsceneOverlay) {
    onComplete();
    return;
  }
  var studentAvatar = getStudentDisplayEmoji(gameState.student);
  dom.resultCutsceneIcon.textContent = (studentAvatar || '🧑') + ' ' + scene.icon;
  dom.resultCutsceneImage.src = scene.image;
  dom.resultCutsceneImage.alt = scene.title;
  dom.resultCutsceneTitle.textContent = scene.title;
  dom.resultCutsceneMessage.textContent = scene.message;
  dom.resultCutsceneOverlay.style.display = 'flex';

  var continueResult = function() {
    dom.resultCutsceneOverlay.style.display = 'none';
    dom.btnResultCutsceneNext.removeEventListener('click', continueResult);
    onComplete();
  };
  dom.btnResultCutsceneNext.addEventListener('click', continueResult);
  if (gameState.student && gameState.student.level === '다') speakResultText(scene.title + '. ' + scene.message);
}

function buildResultAiSummary(judgment, requiredStatus, missedBusTimes) {
  var workStartText = formatTime(getWorkStartTime());
  var arrivalText = formatTime(gameState.time.current);
  var missedText = missedBusTimes && missedBusTimes.length > 0
    ? ' 놓친 버스: ' + missedBusTimes.map(function(t) { return formatTime(t); }).join(', ') + '.'
    : '';
  var missingText = requiredStatus && !requiredStatus.allRequired
    ? ' 누락된 준비물: ' + requiredStatus.missing.join(', ') + '.'
    : '';

  if (judgment === 'success' || judgment === 'incomplete') {
    return 'AI 출근 정보의 목표 시간 ' + workStartText + '에 맞춰 ' + arrivalText + '에 도착했습니다.' + missedText + missingText;
  }
  if (judgment === 'late') {
    return '출근 시간이 지났어요. 다음에는 버스 시간을 더 잘 확인해요. 목표 시간은 ' + workStartText + ', 실제 도착은 ' + arrivalText + '입니다.' + missedText + missingText;
  }
  return '오늘은 너무 늦어서 일을 시작하기 어렵겠어요. 목표 시간은 ' + workStartText + ', 실제 도착은 ' + arrivalText + '입니다.' + missedText + missingText;
}

function renderResultScreen(judgment) {
  // Badge configuration
  var badgeConfig = {
    success: {
      icon: '⭐',
      title: '출근 성공!',
      className: 'result-badge--success',
      statusText: '출근 성공!',
      speech: '시간에 맞춰 잘 도착했어요!',
      teacherNote: '계획대로 잘 실천했어요! 내일도 화이팅!',
      stars: 3
    },
    late: {
      icon: '⚠️',
      title: '조금 늦었어요',
      className: 'result-badge--late',
      statusText: '조금 늦었어요',
      speech: '내일은 조금 더 일찍 출발해요.',
      teacherNote: '다시 도전할 수 있어요. 출발 시간을 기억해요.',
      stars: 2
    },
    fail: {
      icon: '🔁',
      title: '다시 연습해봐요',
      className: 'result-badge--fail',
      statusText: '다시 연습',
      speech: '출근 순서를 다시 확인해볼까요?',
      teacherNote: '순서를 하나씩 다시 연습하면 더 좋아져요.',
      stars: 1
    }
  };

  var config = badgeConfig[judgment] || badgeConfig.fail;
  var primary = gameState.feedback || {};
  var level = gameState.student && gameState.student.level ? gameState.student.level : '나';
  var reasonText = config.speech;
  var problemText = primary.primaryMessage || '출근 과정을 한 번 더 확인해요.';
  var retryText = primary.retryMessage || '내일은 차근차근 다시 해봐요.';

  if (level === '다') {
    reasonText = judgment === 'success' ? '잘 도착했어요.' : judgment === 'late' ? '조금 늦었어요.' : '다시 연습해요.';
    problemText = getShortResultText(primary.primaryTag, false);
    retryText = getShortResultText(primary.primaryTag, true);
  }
  if (dom.resultContainer) dom.resultContainer.className = 'result-container-simple result-level-' + level + ' result-' + judgment;
  if (dom.resultReason) dom.resultReason.textContent = reasonText;
  if (dom.resultPrimaryProblem) dom.resultPrimaryProblem.textContent = problemText;
  if (dom.resultPrimaryRetry) dom.resultPrimaryRetry.textContent = retryText;
  if (dom.resultStatusText) dom.resultStatusText.textContent = config.statusText;
  if (dom.resultTeacherNote) dom.resultTeacherNote.textContent = config.teacherNote;
  if (dom.resultStars) dom.resultStars.innerHTML = buildResultStars(config.stars);
  if (dom.resultGoodList) dom.resultGoodList.innerHTML = buildResultGoodList(judgment);
  gameState.resultSpeech = config.title + '. ' + reasonText + ' 아쉬운 점. ' + problemText + ' 내일 해볼 점. ' + retryText;

  // Set badge
  dom.resultBadge.className = 'result-badge ' + config.className;
  dom.resultBadgeIcon.textContent = config.icon;
  dom.resultBadgeTitle.textContent = config.title;

  // Set result photo dynamically
  if (dom.resultPhoto) {
    var presentation = getResultPresentation(judgment);
    dom.resultPhoto.src = presentation.image;
    dom.resultPhoto.alt = presentation.title;
    dom.resultPhoto.style.display = 'block';
  }

  // Details
  if (dom.resultStudentName) {
    dom.resultStudentName.textContent =
      (getStudentDisplayEmoji(gameState.student) || '🙂') + ' ' + gameState.student.name;
  }
  if (dom.resultWorkStartTime) {
    dom.resultWorkStartTime.textContent = formatTime(getWorkStartTime());
  }
  if (dom.resultHudTargetTime) {
    dom.resultHudTargetTime.textContent = formatTime(getWorkStartTime());
  }
  if (dom.resultAlarmTime) {
    var resultAlarmTime = gameState.evePrep ? gameState.evePrep.alarmTime : null;
    dom.resultAlarmTime.textContent = resultAlarmTime === -1 || resultAlarmTime === null
      ? '알람 없음'
      : formatTime(resultAlarmTime);
  }
  if (dom.resultStartTime) dom.resultStartTime.textContent = formatTime(gameState.commute.wakeTime || gameState.startTime);
  if (dom.resultHomeDepartureTime) {
    dom.resultHomeDepartureTime.textContent = gameState.commute.homeDepartureTime !== null && gameState.commute.homeDepartureTime !== undefined
      ? formatTime(gameState.commute.homeDepartureTime)
      : '-';
  }
  if (dom.resultBusBoardingTime) {
    if (gameState.commute.transportMode === 'taxi') {
      dom.resultBusBoardingTime.textContent = '택시 이동';
    } else {
      dom.resultBusBoardingTime.textContent = gameState.commute.busBoardingTime !== null && gameState.commute.busBoardingTime !== undefined
        ? formatTime(gameState.commute.busBoardingTime)
        : '-';
    }
  }
  if (dom.resultArrivalTime) dom.resultArrivalTime.textContent = formatTime(gameState.time.current);
  if (dom.resultHudArrivalTime) dom.resultHudArrivalTime.textContent = formatTime(gameState.time.current);

  var totalMinutes = gameState.time.current - gameState.startTime;
  if (dom.resultTotalTime) dom.resultTotalTime.textContent = totalMinutes + '분';

  // Bag status: required items checked count
  var requiredBagStatus = getRequiredItemsStatus();
  var checkedCount = requiredBagStatus.checked;
  var totalCount = requiredBagStatus.total;
  if (dom.resultBagStatus) dom.resultBagStatus.textContent = checkedCount + '/' + totalCount + '개 챙김';

  // Timeline
  renderTimeline();

  // Reflections
  renderReflections();

  // V8 additions - AI Analysis & Strategy Card
  var analysis = analyzeActions(gameState);
  var scoreInfo = calculateScore(analysis, gameState);

  // 1. AI Analysis Content
  var analysisHtml = '<div class="ai-analysis-comments" style="display:flex; flex-direction:column; gap:var(--space-sm);">';
  analysisHtml += '  <p class="ai-analysis-comment">📌 <strong>오늘 출근 요약:</strong> ' + buildResultAiSummary(judgment, getRequiredItemsStatus(), (gameState.commute && gameState.commute.missedBusTimes) || []) + '</p>';
  analysisHtml += '  <p class="ai-analysis-comment">⏰ <strong>기상 준비:</strong> ' + analysis.domains.wake.feedback + '</p>';
  analysisHtml += '  <p class="ai-analysis-comment">🎒 <strong>준비 과정:</strong> ' + analysis.domains.prepare.feedback + '</p>';
  analysisHtml += '  <p class="ai-analysis-comment">🚌 <strong>이동 과정:</strong> ' + analysis.domains.commute.feedback + '</p>';
  analysisHtml += '  <p class="ai-analysis-comment">💬 <strong>사회성/안전:</strong> ' + analysis.domains.social.feedback + '</p>';
  analysisHtml += '</div>';
  if (dom.aiAnalysisContent) dom.aiAnalysisContent.innerHTML = analysisHtml;

  // 2. Strategy Card Content
  var strategyHtml = generateStrategyCard(analysis, gameState.student, scoreInfo.score, scoreInfo.stars);
  if (dom.strategyCardContent) dom.strategyCardContent.innerHTML = strategyHtml;

  // 3. Show/hide Go to Duty button
  if (dom.btnGoToDuty) {
    if (judgment === 'success') {
      dom.btnGoToDuty.style.display = '';
    } else {
      dom.btnGoToDuty.style.display = 'none';
    }
  }

  if (level === '다') speakResultText(gameState.resultSpeech);
}

function buildResultStars(count) {
  var html = '';
  for (var i = 0; i < 3; i++) {
    html += '<span class="' + (i < count ? 'is-filled' : 'is-empty') + '" aria-hidden="true">★</span>';
  }
  return html;
}

function buildResultGoodList(judgment) {
  var items = judgment === 'success'
    ? ['알람을 잘 맞췄어요', '준비물을 챙겼어요', '200번 버스를 탔어요']
    : judgment === 'late'
      ? ['끝까지 이동했어요', '버스를 잘 확인했어요', '회사까지 잘 왔어요']
      : ['출근 순서를 확인했어요', '다시 연습할 수 있어요', '내일 다시 해볼 수 있어요'];
  return items.map(function(item) {
    return '<li><span aria-hidden="true">✓</span>' + item + '</li>';
  }).join('');
}

function getShortResultText(tag, retry) {
  var shortText = {
    commute_failed: ['시간이 너무 늦었어요.', '더 일찍 출발해요.'],
    late: ['조금 늦게 도착했어요.', '더 일찍 출발해요.'],
    wrong_bus_number: ['버스 번호가 어려웠어요.', '200번을 확인해요.'],
    missed_bell: ['벨 누르기가 어려웠어요.', '정류장을 보고 벨을 눌러요.'],
    wrong_destination: ['회사를 찾기 어려웠어요.', '간판을 확인해요.'],
    overslept: ['늦게 일어났어요.', '알람에 바로 일어나요.'],
    smartphone_delay: ['스마트폰을 오래 봤어요.', '준비를 먼저 해요.'],
    missing_weather_item: ['날씨 물건이 없었어요.', '날씨를 확인해요.'],
    no_breakfast: ['아침밥을 안 먹었어요.', '아침밥을 먹어요.'],
    no_shower: ['샤워를 안 했어요.', '샤워를 해요.'],
    no_toothbrush: ['양치를 안 했어요.', '양치를 해요.'],
    wrong_clothes: ['옷이 날씨와 안 맞았어요.', '날씨에 맞는 옷을 입어요.'],
    bag_missing_item: ['가방에 빠진 물건이 있었어요.', '가방을 다시 확인해요.']
  };
  var pair = shortText[tag] || ['아쉬운 점 없이 잘했어요.', '내일도 잘 준비해요.'];
  return pair[retry ? 1 : 0];
}

function speakResultText(text) {
  if (!text) return;
  if (typeof speak === 'function') {
    speak(text);
    return;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    window.speechSynthesis.speak(utterance);
  }
}

function renderTimeline() {
  var log = gameState.actionLog || [];
  var html = '';

  log.forEach(function(entry) {
    html +=
      '<div class="timeline-item" role="listitem">' +
        '<span class="timeline-item__icon">' + (entry.icon || '•') + '</span>' +
        '<span class="timeline-item__text">' + (entry.action || '') +
          (entry.consequence ? ' — ' + entry.consequence : '') + '</span>' +
        (entry.timeCost ? '<span class="timeline-item__time">' +
          (entry.timeCost > 0 ? '+' : '') + entry.timeCost + '분</span>' : '') +
      '</div>';
  });

  if (log.length === 0) {
    html = '<div class="timeline-item"><span class="timeline-item__text">기록이 없습니다.</span></div>';
  }

  if (dom.timelineList) dom.timelineList.innerHTML = html;
}

function renderReflections() {
  var options = [];
  if (typeof generateReflectionOptions === 'function') {
    options = generateReflectionOptions(gameState) || [];
  }

  if (options.length === 0) {
    // Default reflections
    options = [
      '아침에 일찍 일어나는 것이 중요해요',
      '소지품을 미리 챙기면 좋아요',
      '시간을 잘 확인해야 해요',
      '교통수단을 잘 선택해야 해요',
      '다음에는 더 잘할 수 있어요!'
    ];
  }

  var html = '';
  options.forEach(function(opt, index) {
    html +=
      '<label class="reflection-option" for="reflection-' + index + '">' +
        '<input type="checkbox" id="reflection-' + index + '" class="reflection-checkbox">' +
        '<span class="reflection-option__text">' + opt + '</span>' +
      '</label>';
  });

  dom.reflectionOptions.innerHTML = html;
}


/* ============================================================
   Report Screen
   ============================================================ */
function renderReportScreen() {
  if (dom.reportTodayDate) {
    var today = new Date();
    var weekday = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];
    dom.reportTodayDate.textContent = '📅 ' + today.getFullYear() + '.' +
      String(today.getMonth() + 1).padStart(2, '0') + '.' +
      String(today.getDate()).padStart(2, '0') + ' (' + weekday + ')';
  }

  // Individual tab
  if (typeof generateDetailReport === 'function') {
    var detailHtml = generateDetailReport(gameState);
    dom.reportDetail.innerHTML = detailHtml || '<p>리포트 데이터가 없습니다.</p>';
  } else {
    // Fallback: build a simple report
    dom.reportDetail.innerHTML = buildSimpleDetailReport();
  }

  // Summary tab
  if (typeof generateSummaryTable === 'function' && typeof getGameHistory === 'function') {
    var history = getGameHistory();
    var summaryHtml = generateSummaryTable(history);
    dom.reportSummary.innerHTML = summaryHtml || '<p>기록이 없습니다.</p>';
  } else {
    dom.reportSummary.innerHTML = '<p>기록 데이터가 없습니다.</p>';
  }

  // Activate individual tab by default
  switchReportTab('individual');
}

function buildSimpleDetailReport() {
  if (!gameState || !gameState.student) return '<p>데이터 없음</p>';

  var judgment = getJudgment();
  var reqItems = getRequiredItemsStatus();
  var checked = reqItems.checked;

  return '' +
    '<h3 class="report-detail-card__title">📋 ' + gameState.student.name + ' 개별 리포트</h3>' +
    '<div class="report-field">' +
      '<span class="report-field__label">학생 이름</span>' +
      '<span class="report-field__value">' + gameState.student.name + '</span>' +
    '</div>' +
    '<div class="report-field">' +
      '<span class="report-field__label">수준</span>' +
      '<span class="report-field__value">' + getLevelLabel(gameState.student.level) + '</span>' +
    '</div>' +
    '<div class="report-field">' +
      '<span class="report-field__label">출발 시각</span>' +
      '<span class="report-field__value">' + formatTime(gameState.startTime) + '</span>' +
    '</div>' +
    '<div class="report-field">' +
      '<span class="report-field__label">도착 시각</span>' +
      '<span class="report-field__value">' + formatTime(gameState.currentTime) + '</span>' +
    '</div>' +
    '<div class="report-field">' +
      '<span class="report-field__label">소지품</span>' +
      '<span class="report-field__value">' + checked + '/' + reqItems.total + '</span>' +
    '</div>' +
    '<div class="report-field">' +
      '<span class="report-field__label">결과</span>' +
      '<span class="report-field__value"><span class="status-badge status-badge--' + judgment + '">' +
        getJudgmentLabel(judgment) + '</span></span>' +
    '</div>';
}

function getJudgmentLabel(j) {
  var labels = {
    success: '✅ 성공',
    incomplete: '⚠️ 소지품 부족',
    late: '⏰ 지각',
    fail: '❌ 실패'
  };
  return labels[j] || j;
}

function switchReportTab(tab) {
  if (tab === 'individual') {
    dom.tabIndividual.classList.add('active');
    dom.tabIndividual.setAttribute('aria-selected', 'true');
    dom.tabSummary.classList.remove('active');
    dom.tabSummary.setAttribute('aria-selected', 'false');
    dom.panelIndividual.classList.add('active');
    dom.panelSummary.classList.remove('active');
  } else {
    dom.tabSummary.classList.add('active');
    dom.tabSummary.setAttribute('aria-selected', 'true');
    dom.tabIndividual.classList.remove('active');
    dom.tabIndividual.setAttribute('aria-selected', 'false');
    dom.panelSummary.classList.add('active');
    dom.panelIndividual.classList.remove('active');
  }
}


/* ============================================================
   Admin Screen (Delegated to admin.js)
   ============================================================ */
function renderAdminScreen() {
  if (typeof renderAdminPanel === 'function') {
    renderAdminPanel();
  }
}


/* ============================================================
   TTS Button Handler
   ============================================================ */
function handleTtsClick() {
  if (!currentScenario) return;

  var level = gameState.student.level;
  var text = getTextForLevel(currentScenario.situation, level);

  if (typeof speak === 'function') {
    speak(text);
  }
}

/* ============================================================
   AI Assistant Hint Handler
   ============================================================ */
function handleAiAssistantClick() {
  if (!currentScenario) return;

  var hint = '';
  if (typeof getAIHint === 'function') {
    hint = getAIHint(currentScenario, gameState);
  } else {
    hint = '소지품 준비와 도로 안전을 점검해보세요!';
  }

  dom.aiHintText.textContent = hint;
  dom.aiHintOverlay.style.display = '';

  // Speak AI Hint for student
  if (typeof speak === 'function') {
    speak(hint);
  }
}


/* ============================================================
   Event Binding
   ============================================================ */
function bindEvents() {
  // Main screen
  if (dom.btnStart) dom.btnStart.addEventListener('click', openStudentConfirmation);
  if (dom.btnStudentConfirmStart) dom.btnStudentConfirmStart.addEventListener('click', function() {
    closeStudentConfirmation(false);
    startGame();
  });
  if (dom.btnStudentConfirmBack) dom.btnStudentConfirmBack.addEventListener('click', function() {
    closeStudentConfirmation(true);
  });
  if (dom.studentCharacterOptions) {
    dom.studentCharacterOptions.forEach(function(button) {
      button.addEventListener('click', function() {
        selectStudentCharacter(button.getAttribute('data-character'));
      });
    });
  }
  if (dom.studentConfirmModal) {
    dom.studentConfirmModal.addEventListener('click', function(e) {
      if (e.target === dom.studentConfirmModal) closeStudentConfirmation(true);
    });
  }
  if (dom.studentSearch) {
    dom.studentSearch.addEventListener('input', renderMainScreen);
  }
  if (dom.btnAdmin) {
    dom.btnAdmin.addEventListener('click', function() {
      showScreen('screen-admin');
      renderAdminScreen();
    });
  }

  // Duty Intro Screen Next Button
  if (dom.btnDutyIntroNext) {
    dom.btnDutyIntroNext.addEventListener('click', function() {
      if (typeof stopSpeaking === 'function') {
        stopSpeaking();
      }

      if (typeof initAlarmFirstFlow === 'function') {
        initAlarmFirstFlow();
        return;
      }
      console.error('알람 맞추기 화면 초기화 함수를 찾을 수 없습니다.');
    });
  }

  // Planning Screen Time Calculator
  if (dom.calcOptions && dom.totalCalcTime) {
    var calcTotal = 0;
    for (var c = 0; c < dom.calcOptions.length; c++) {
      dom.calcOptions[c].addEventListener('click', function(e) {
        var btn = e.currentTarget;
        var timeCost = parseInt(btn.getAttribute('data-time'), 10);
        
        if (btn.classList.contains('selected')) {
          btn.classList.remove('selected');
          calcTotal -= timeCost;
        } else {
          btn.classList.add('selected');
          calcTotal += timeCost;
        }
        
        dom.totalCalcTime.textContent = calcTotal + '분';
        
        // Update hint based on total time
        if (dom.wakeTimeHint) {
          if (calcTotal > 30) {
            dom.wakeTimeHint.textContent = "시간이 많이 필요해요. 07:30에 일어나는 게 어떨까요?";
          } else if (calcTotal > 15) {
            dom.wakeTimeHint.textContent = "여유있게 08:00에 일어나면 어떨까요?";
          } else if (calcTotal > 0) {
            dom.wakeTimeHint.textContent = "빨리 준비할 수 있어요. 08:20에 일어나도 될 것 같아요.";
          } else {
            dom.wakeTimeHint.textContent = "출근 시간에 늦지 않으려면 언제 일어나야 할까요?";
          }
        }
      });
    }
  }

  // Planning Screen Time Options
  if (dom.timeOptions) {
    for (var t = 0; t < dom.timeOptions.length; t++) {
      dom.timeOptions[t].addEventListener('click', function(e) {
        var btn = e.currentTarget;
        for (var i = 0; i < dom.timeOptions.length; i++) {
          dom.timeOptions[i].classList.remove('selected');
        }
        btn.classList.add('selected');
        checkPlanningComplete();
      });
    }
  }

  // Planning Screen Bag Options (Drag and Drop)
  if (dom.bagOptions && dom.bagDropzone) {
    var draggedItem = null;

    for (var b = 0; b < dom.bagOptions.length; b++) {
      var item = dom.bagOptions[b];
      
      item.addEventListener('dragstart', function(e) {
        if (this.classList.contains('selected')) {
          e.preventDefault();
          return;
        }
        draggedItem = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.getAttribute('data-item'));
      });

      item.addEventListener('dragend', function() {
        this.classList.remove('dragging');
        draggedItem = null;
      });
      
      // Fallback click for accessibility or if drag fails
      item.addEventListener('click', function(e) {
        if (!this.classList.contains('selected')) {
          this.classList.add('selected');
          checkPlanningComplete();
        }
      });
    }

    dom.bagDropzone.addEventListener('dragover', function(e) {
      e.preventDefault(); // Necessary to allow dropping
      e.dataTransfer.dropEffect = 'move';
      this.classList.add('drag-over');
    });

    dom.bagDropzone.addEventListener('dragleave', function(e) {
      this.classList.remove('drag-over');
    });

    dom.bagDropzone.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      
      if (draggedItem && !draggedItem.classList.contains('selected')) {
        draggedItem.classList.add('selected');
        // Optional: you could clone the photo into the dropzone here if you want visual feedback
        checkPlanningComplete();
      }
    });
  }

  function checkPlanningComplete() {
    var hasTime = false;
    for (var i = 0; i < dom.timeOptions.length; i++) {
      if (dom.timeOptions[i].classList.contains('selected')) {
        hasTime = true;
        break;
      }
    }
    dom.btnPlanStart.disabled = !hasTime;
  }

  // Planning Screen Start Button
  if (dom.btnPlanStart) {
    dom.btnPlanStart.addEventListener('click', function() {
      // Get selected time
      var departureTime = 480; // default
      for (var i = 0; i < dom.timeOptions.length; i++) {
        if (dom.timeOptions[i].classList.contains('selected')) {
          departureTime = parseInt(dom.timeOptions[i].getAttribute('data-time'), 10);
          break;
        }
      }
      // Get selected bag items
      var items = [];
      for (var j = 0; j < dom.bagOptions.length; j++) {
        if (dom.bagOptions[j].classList.contains('selected')) {
          items.push(dom.bagOptions[j].getAttribute('data-item'));
        }
      }

      // Save plan
      savePlan(departureTime, items);

      // Transition to Morning Alarm instead of Game
      if (typeof initMorningAlarmScreen === 'function') {
        initMorningAlarmScreen();
        showScreen('screen-morning-alarm');
      } else {
        showScreen('screen-game');
        updateTopBar();
        nextScenario();
      }
    });
  }

  // Briefing Screen Start Button
  if (dom.btnBriefingStart) dom.btnBriefingStart.addEventListener('click', function() {
    if (typeof stopSpeaking === 'function') {
      stopSpeaking();
    }
    
    gameState.flags.weatherChecked = true;
    gameState.flags.briefingChecked = true;
    
    if (typeof initAICommutePlanScreen === 'function') {
      initAICommutePlanScreen();
      showScreen('screen-ai-plan');
      return;
    }
    console.error('AI 출근 계획 화면 초기화 함수를 찾을 수 없습니다.');
  });

  // TTS
  if (dom.btnTts) dom.btnTts.addEventListener('click', handleTtsClick);

  // AI Assistant Button Click
  if (dom.btnAiAssistant) dom.btnAiAssistant.addEventListener('click', handleAiAssistantClick);

  // Close AI Hint Modal
  if (dom.btnAiHintClose) dom.btnAiHintClose.addEventListener('click', function() {
    if (typeof stopSpeaking === 'function') {
      stopSpeaking();
    }
    dom.aiHintOverlay.style.display = 'none';
  });

  // Phase transition continue
  if (dom.btnPhaseContinue) dom.btnPhaseContinue.addEventListener('click', function() {
    showScreen('screen-game');
    nextScenario();
  });

  // Feedback next
  if (dom.btnFeedbackNext) dom.btnFeedbackNext.addEventListener('click', closeFeedback);

  // Go to Duty Button click (V8)
  if (dom.btnGoToDuty) {
    dom.btnGoToDuty.addEventListener('click', function() {
      renderDutyScreen();
      showScreen('screen-duty');
    });
  }

  // Print Strategy Card Button click (V8)
  if (dom.btnPrintStrategy) {
    dom.btnPrintStrategy.addEventListener('click', function() {
      document.body.classList.add('print-strategy-only');
      window.print();
      setTimeout(function() {
        document.body.classList.remove('print-strategy-only');
      }, 500);
    });
  }

  // Duty done & skip (V8)
  if (dom.btnDutyDone) {
    dom.btnDutyDone.addEventListener('click', function() {
      speak('오늘 하루도 참 잘했습니다. 수고하셨어요!');
      currentScenario = null;
      selectedStudentId = null;
      if (typeof resetGame === 'function') resetGame();
      showScreen('screen-main');
      renderMainScreen();
    });
  }

  if (dom.btnDutySkip) {
    dom.btnDutySkip.addEventListener('click', function() {
      if (typeof stopSpeaking === 'function') {
        stopSpeaking();
      }
      currentScenario = null;
      selectedStudentId = null;
      if (typeof resetGame === 'function') resetGame();
      showScreen('screen-main');
      renderMainScreen();
    });
  }

  // Result screen buttons
  if (dom.btnRetry) dom.btnRetry.addEventListener('click', function() {
    // Restart with same student
    if (gameState && gameState.student) {
      initGame(gameState.student);
      startGame(); // restarts from duty intro
    }
  });

  if (dom.btnViewReport) {
    dom.btnViewReport.addEventListener('click', function() {
      if (!dom.teacherReportModal || !dom.teacherReportContent) return;
      dom.teacherReportContent.innerHTML = typeof renderTeacherQuickReport === 'function'
        ? renderTeacherQuickReport(gameState)
        : '<p>리포트를 불러오지 못했습니다.</p>';
      dom.teacherReportModal.style.display = 'flex';
      if (dom.btnTeacherReportClose) dom.btnTeacherReportClose.focus();
    });
  }

  if (dom.btnTeacherReportClose) {
    dom.btnTeacherReportClose.addEventListener('click', function() {
      dom.teacherReportModal.style.display = 'none';
    });
  }

  if (dom.btnTeacherReportDetail) {
    dom.btnTeacherReportDetail.addEventListener('click', function() {
      if (dom.teacherReportModal) dom.teacherReportModal.style.display = 'none';
      renderReportScreen();
      showScreen('screen-report');
    });
  }

  if (dom.teacherReportModal) {
    dom.teacherReportModal.addEventListener('click', function(e) {
      if (e.target === dom.teacherReportModal) dom.teacherReportModal.style.display = 'none';
    });
  }

  if (dom.btnGoHome) {
    dom.btnGoHome.addEventListener('click', function() {
      currentScenario = null;
      selectedStudentId = null;
      if (typeof resetGame === 'function') resetGame();
      showScreen('screen-main');
      renderMainScreen();
    });
  }

  if (dom.btnResultTts) {
    dom.btnResultTts.addEventListener('click', function() {
      speakResultText(gameState.resultSpeech || '');
    });
  }

  // Timeline toggle
  if (dom.timelineToggle) {
    dom.timelineToggle.addEventListener('click', function() {
      if (!dom.timelineList) return;
      var isOpen = dom.timelineList.classList.toggle('open');
      dom.timelineToggle.classList.toggle('open', isOpen);
      dom.timelineToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Report tabs
  if (dom.tabIndividual) dom.tabIndividual.addEventListener('click', function() { switchReportTab('individual'); });
  if (dom.tabSummary) dom.tabSummary.addEventListener('click', function() { switchReportTab('summary'); });

  // Print
  if (dom.btnPrintReport) dom.btnPrintReport.addEventListener('click', function() {
    if (typeof printReport === 'function') {
      printReport();
    } else {
      window.print();
    }
  });

  // Report back / home
  if (dom.btnReportBack) dom.btnReportBack.addEventListener('click', function() {
    showScreen('screen-result');
  });

  if (dom.btnReportRetry) dom.btnReportRetry.addEventListener('click', function() {
    if (gameState.student) {
      initGame(gameState.student);
      startGame();
    }
  });

  if (dom.btnReportHome) dom.btnReportHome.addEventListener('click', function() {
    currentScenario = null;
    selectedStudentId = null;
    if (typeof resetGame === 'function') resetGame();
    showScreen('screen-main');
    renderMainScreen();
  });

  // Close feedback overlay on backdrop click (outside the card)
  if (dom.feedbackOverlay) dom.feedbackOverlay.addEventListener('click', function(e) {
    if (e.target === dom.feedbackOverlay) {
      closeFeedback();
    }
  });

  // Keyboard: Escape to close feedback
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && dom.feedbackOverlay && dom.feedbackOverlay.style.display !== 'none') {
      closeFeedback();
    }
    if (e.key === 'Escape' && dom.teacherReportModal && dom.teacherReportModal.style.display !== 'none') {
      dom.teacherReportModal.style.display = 'none';
    }
    if (e.key === 'Escape' && dom.studentConfirmModal && dom.studentConfirmModal.style.display !== 'none') {
      closeStudentConfirmation(true);
    }
  });
}


/* ============================================================
   Initialize Application
   ============================================================ */
function initApp() {
  cacheDom();
  bindEvents();
  renderMainScreen();

  // Initialize admin if available
  if (typeof renderAdminPanel === 'function') {
    renderAdminPanel();
  }
}

// Start on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
