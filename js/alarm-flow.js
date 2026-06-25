(function () {
  'use strict';

  var timers = [];

  function clearTimers() {
    timers.forEach(function (timer) { window.clearTimeout(timer); });
    timers = [];
  }

  function later(callback, delay) {
    timers.push(window.setTimeout(callback, delay));
  }

  function formatAlarmTime(minutes) {
    if (typeof formatTime === 'function') return formatTime(minutes);
    var hour = Math.floor(minutes / 60) % 24;
    var minute = minutes % 60;
    return String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
  }

  function setStory(stage, image, clock, icon, title, text) {
    var story = document.querySelector('.alarm-story');
    var scene = document.getElementById('alarm-story-image');
    var clockEl = document.getElementById('alarm-story-clock');
    var iconEl = document.getElementById('alarm-story-icon');
    var titleEl = document.getElementById('alarm-story-title');
    var textEl = document.getElementById('alarm-story-text');

    if (story) story.setAttribute('data-alarm-story-stage', stage);
    if (scene) scene.src = image;
    if (clockEl) clockEl.textContent = clock;
    if (iconEl) iconEl.textContent = icon;
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
  }

  function ringAlarm(alarmMinutes) {
    clearTimers();
    if (!gameState.evePrep) gameState.evePrep = {};
    gameState.evePrep.alarmTime = alarmMinutes;
    gameState.alarmTime = alarmMinutes;
    gameState.time.current = alarmMinutes;
    gameState.phase = 'morning-alarm';
    if (typeof initMorningAlarmScreen === 'function') initMorningAlarmScreen();
    if (typeof showScreen === 'function') showScreen('screen-morning-alarm');
  }

  window.startAlarmSleepFlow = function (alarmMinutes, isSnooze) {
    clearTimers();
    if (typeof showScreen === 'function') showScreen('screen-sleep-transition');

    if (isSnooze) {
      setStory(
        'sleeping',
        'assets/images/alarm-sleep-night.png',
        formatAlarmTime(alarmMinutes - 10),
        '💤',
        '10분 더 잘게요',
        '잠깐 눈을 감고 쉬어요.'
      );
      later(function () {
        setStory(
          'dawn',
          'assets/images/alarm-ringing-morning-clean.png',
          formatAlarmTime(alarmMinutes),
          '☀️',
          '10분이 지났어요',
          '알람이 다시 울릴 시간이에요.'
        );
      }, 900);
      later(function () { ringAlarm(alarmMinutes); }, 1800);
      return;
    }

    setStory(
      'confirmed',
      'assets/images/alarm-setting-evening.png',
      '22:00',
      '⏰',
      '알람 설정 완료!',
      formatAlarmTime(alarmMinutes) + '에 알람이 울려요.'
    );

    later(function () {
      setStory(
        'sleeping',
        'assets/images/alarm-sleep-night.png',
        '23:00',
        '💤',
        '캐릭터가 잠들었어요',
        '방이 어두워지고 밤이 깊어져요.'
      );
    }, 1400);

    later(function () {
      setStory(
        'night',
        'assets/images/alarm-sleep-night.png',
        '02:10',
        '🌙',
        '시간이 흐르고 있어요',
        '밤에서 새벽으로 넘어가요.'
      );
    }, 3000);

    later(function () {
      setStory(
        'dawn',
        'assets/images/alarm-ringing-morning-clean.png',
        formatAlarmTime(Math.max(0, alarmMinutes - 10)),
        '🌅',
        '아침이 밝아와요',
        '곧 알람이 울려요.'
      );
    }, 4700);

    later(function () { ringAlarm(alarmMinutes); }, 6500);
  };

  window.showMorningAlarmNow = ringAlarm;
})();
