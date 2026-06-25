// ============================================================
// duty.js — 직무 미션 및 체크리스트 미니게임 모듈
// 본앤하이리 출근 마스터 시뮬레이터
// ============================================================

// 직무 풀 정의 (농장 및 카페 직무 8가지)
var DUTY_POOL = [
  { id: 'water_plants', icon: '🌱', name: '화분 물주기', desc: '사무실 화분에 물을 줘요', detail: '농장에 있는 초록 화분들이 마르지 않도록 물뿌리개로 골고루 물을 줍니다.' },
  { id: 'harvest',      icon: '🥬', name: '채소 수확하기', desc: '텃밭에서 채소를 수확해요', detail: '텃밭으로 가서 알맞게 잘 자란 신선한 쌈채소를 상하지 않게 조심조심 수확합니다.' },
  { id: 'cups',         icon: '☕', name: '음료 잔 정리', desc: '카페에서 잔을 정리해요', detail: '카페 손님들이 사용하고 반납한 머그잔과 초록색 플라스틱 컵을 트레이에 모아 정리합니다.' },
  { id: 'feed_animals', icon: '🐄', name: '동물 사료 주기', desc: '동물에게 사료를 줘요', detail: '농장의 소와 귀여운 양들이 배고프지 않게 사료 그릇에 정량의 건초 사료를 담아 줍니다.' },
  { id: 'packages',     icon: '📦', name: '택배 상자 정리', desc: '택배 상자를 정리해요', detail: '갓 포장된 본앤하이리 농산물 배송 상자들을 테이핑하고 배송 구역에 차곡차곡 쌓아둡니다.' },
  { id: 'cleaning',     icon: '🧹', name: '매장 청소하기', desc: '매장을 깨끗이 청소해요', detail: '카페 테이블의 먼지를 닦고 바닥에 흘린 이물질을 빗자루와 걸레로 깨끗하게 청소합니다.' },
  { id: 'garden',       icon: '🌻', name: '꽃밭 가꾸기', desc: '꽃밭에 물을 주고 관리해요', detail: '야외 정원에 만개한 해바라기와 튤립 꽃밭에 잡초를 뽑아주고 시원한 물을 뿌려줍니다.' },
  { id: 'bread',        icon: '🍞', name: '빵 포장하기', desc: '갓 구운 빵을 포장해요', detail: '오븐에서 갓 나와 식은 고소한 쌀빵들을 비닐백에 하나씩 포장하고 철사 끈으로 묶어 밀봉합니다.' }
];

/**
 * 직무 풀에서 무작위 2개를 골라 gameState.todayDuties에 저장한다.
 */
function selectTodayDuties() {
  if (!gameState) return;

  var poolCopy = DUTY_POOL.slice();
  var selected = [];

  // 무작위로 2개 뽑기
  for (var i = 0; i < 2; i++) {
    if (poolCopy.length === 0) break;
    var idx = Math.floor(Math.random() * poolCopy.length);
    var duty = poolCopy.splice(idx, 1)[0];
    
    // 복사하여 checked: false 상태 부여
    selected.push({
      id: duty.id,
      icon: duty.icon,
      name: duty.name,
      desc: duty.desc,
      detail: duty.detail,
      checked: false
    });
  }

  gameState.todayDuties = selected;
}

/**
 * 오늘의 직무 소개 화면(screen-duty-intro)에 직무 카드를 렌더링한다.
 */
function renderDutyIntro() {
  var student = gameState.student;
  var level = student.level;
  var duties = gameState.todayDuties || [];
  
  var introContainer = document.getElementById('duty-intro-missions');
  if (!introContainer) return;

  var html = '';
  for (var i = 0; i < duties.length; i++) {
    var d = duties[i];
    
    html += '<div class="duty-intro-card duty-intro-card--level-' + (level === '다' ? 'da' : level === '나' ? 'na' : 'ga') + '">';
    html += '  <div class="duty-intro-card__icon">' + d.icon + '</div>';
    html += '  <div class="duty-intro-card__content">';
    html += '    <h3 class="duty-intro-card__title">' + d.name + '</h3>';
    
    if (level === '가') {
      html += '    <p class="duty-intro-card__desc">' + d.detail + '</p>';
    } else if (level === '나') {
      html += '    <p class="duty-intro-card__desc">' + d.desc + '</p>';
    } else { // '다' 수준은 생략 또는 아주 간단한 단어만
      html += '    <p class="duty-intro-card__desc">' + d.name + ' 열심히 해요!</p>';
    }
    
    html += '  </div>';
    html += '</div>';
  }

  introContainer.innerHTML = html;

  // 소개 화면 배경 사진 설정
  var introPhoto = document.getElementById('duty-intro-photo');
  if (introPhoto) {
    introPhoto.src = 'assets/photos/main_bg.png';
  }
}

/**
 * 직무 수행 화면(screen-duty)의 체크리스트를 렌더링한다.
 */
function renderDutyScreen() {
  var student = gameState.student;
  var level = student.level;
  var duties = gameState.todayDuties || [];

  // 직무 수행 화면 사진 설정
  var dutyPhoto = document.getElementById('duty-workplace-photo');
  if (dutyPhoto) {
    dutyPhoto.src = 'assets/photos/success_bg.png';
  }

  var listContainer = document.getElementById('duty-mission-list');
  if (!listContainer) return;

  var html = '';
  for (var i = 0; i < duties.length; i++) {
    var d = duties[i];
    var isChecked = d.checked;
    
    html += '<div class="duty-card' + (isChecked ? ' duty-card--checked' : '') + ' duty-card--level-' + (level === '다' ? 'da' : level === '나' ? 'na' : 'ga') + '" ';
    html += '     onclick="handleDutyClick(\'' + d.id + '\')" id="duty-card-' + d.id + '" role="checkbox" aria-checked="' + isChecked + '" tabindex="0">';
    html += '  <div class="duty-card__checkbox">' + (isChecked ? '✅' : '⬜') + '</div>';
    html += '  <div class="duty-card__icon">' + d.icon + '</div>';
    html += '  <div class="duty-card__content">';
    html += '    <h3 class="duty-card__title">' + d.name + '</h3>';
    
    if (level === '가') {
      html += '    <p class="duty-card__desc">' + d.detail + '</p>';
    } else if (level === '나') {
      html += '    <p class="duty-card__desc">' + d.desc + '</p>';
    }
    
    html += '  </div>';
    html += '</div>';
  }

  listContainer.innerHTML = html;

  // 상태 초기화
  var doneBtn = document.getElementById('btn-duty-done');
  if (doneBtn) {
    doneBtn.disabled = !isAllDutiesDone();
  }

  var overlay = document.getElementById('duty-complete-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.innerHTML = '';
  }
}

/**
 * 특정 직무의 체크 여부를 토글하고 피드백을 제공한다.
 * @param {string} dutyId - 직무 ID
 */
function handleDutyClick(dutyId) {
  var duties = gameState.todayDuties || [];
  var targetDuty = null;
  
  for (var i = 0; i < duties.length; i++) {
    if (duties[i].id === dutyId) {
      targetDuty = duties[i];
      break;
    }
  }

  if (!targetDuty) return;

  // 체크 상태 토글
  targetDuty.checked = !targetDuty.checked;

  // 소리 효과 및 바운스 애니메이션을 위해 DOM 탐색
  var cardDom = document.getElementById('duty-card-' + dutyId);
  if (cardDom) {
    cardDom.setAttribute('aria-checked', targetDuty.checked);
    
    // 바운스 효과 클래스 추가
    cardDom.classList.add('duty-card--bounce');
    
    // 체크 토글
    if (targetDuty.checked) {
      cardDom.classList.add('duty-card--checked');
      cardDom.querySelector('.duty-card__checkbox').innerHTML = '✅';
      
      // 완료 소리 피드백 (TTS)
      speak(targetDuty.name + ' 완료!');
    } else {
      cardDom.classList.remove('duty-card--checked');
      cardDom.querySelector('.duty-card__checkbox').innerHTML = '⬜';
    }

    // 애니메이션 클래스 제거 (반복 가능하도록)
    setTimeout(function() {
      cardDom.classList.remove('duty-card--bounce');
    }, 500);
  }

  // 완료 버튼 상태 변경
  var doneBtn = document.getElementById('btn-duty-done');
  var allDone = isAllDutiesDone();
  if (doneBtn) {
    doneBtn.disabled = !allDone;
  }

  // 전체 직무 완료 시 축하 애니메이션
  if (allDone) {
    showDutyComplete();
  }
}

/**
 * 모든 직무가 완료되었는지 확인한다.
 * @returns {boolean}
 */
function isAllDutiesDone() {
  var duties = gameState.todayDuties || [];
  if (duties.length === 0) return false;

  for (var i = 0; i < duties.length; i++) {
    if (!duties[i].checked) return false;
  }
  return true;
}

/**
 * 꽃가루 Confetti 애니메이션을 순수 JS/CSS로 생성하여 보여준다.
 */
function showDutyComplete() {
  var overlay = document.getElementById('duty-complete-overlay');
  if (!overlay) return;

  // 축하 TTS
  setTimeout(function() {
    speak('수고하셨습니다! 오늘의 모든 직무를 완수했습니다!');
  }, 500);

  overlay.style.display = 'flex';
  overlay.innerHTML = '';

  var container = document.createElement('div');
  container.className = 'confetti-container';
  overlay.appendChild(container);

  var card = document.createElement('div');
  card.className = 'duty-complete-card';
  card.innerHTML = '<h2>🎊 오늘의 미션 완료! 🎊</h2><p>오늘의 직무를 모두 훌륭히 마쳤습니다.<br>수고 많으셨어요!</p>';
  overlay.appendChild(card);

  // 꽃가루 조각 60개 무작위 생성
  for (var i = 0; i < 60; i++) {
    var particle = document.createElement('div');
    particle.className = 'confetti-particle';
    
    // 무작위 속성 설정
    var colors = ['#FFC107', '#FF5722', '#E91E63', '#4CAF50', '#00BCD4', '#9C27B0', '#FFEB3B'];
    var randomColor = colors[Math.floor(Math.random() * colors.length)];
    var randomLeft = Math.random() * 100; // 0% ~ 100%
    var randomDelay = Math.random() * 2; // 0s ~ 2s
    var randomSize = Math.random() * 10 + 6; // 6px ~ 16px
    var randomRotation = Math.random() * 360;

    particle.style.backgroundColor = randomColor;
    particle.style.left = randomLeft + '%';
    particle.style.animationDelay = randomDelay + 's';
    particle.style.width = randomSize + 'px';
    particle.style.height = randomSize + 'px';
    particle.style.transform = 'rotate(' + randomRotation + 'deg)';

    // 꽃가루 모양 다양성 (원 또는 사각형)
    if (Math.random() > 0.5) {
      particle.style.borderRadius = '50%';
    }

    container.appendChild(particle);
  }
}
