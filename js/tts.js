// ============================================================
// tts.js — 음성 합성(TTS) 모듈
// 본앤하이리 출근 마스터 시뮬레이터
// Web Speech API 기반 한국어 음성 출력
// ============================================================

/**
 * 텍스트를 한국어로 읽어준다.
 * 특수교육 대상 학생을 위해 약간 느린 속도(0.85)로 설정.
 * 이미 재생 중인 음성이 있으면 먼저 중단한다.
 *
 * @param {string} text - 읽어줄 텍스트
 * @param {Function} [callback] - 읽기 완료 후 호출할 콜백 (선택)
 */
function speak(text, callback) {
  // 음성 합성 API 지원 여부 확인
  if (!window.speechSynthesis) {
    console.warn('이 브라우저는 음성 합성을 지원하지 않습니다.');
    if (callback) callback();
    return;
  }

  // 현재 재생 중인 음성 중단
  stopSpeaking();

  var utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.85;   // 특수교육 대상자를 위한 약간 느린 속도
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // 한국어 음성이 있으면 우선 선택
  var voices = window.speechSynthesis.getVoices();
  for (var i = 0; i < voices.length; i++) {
    if (voices[i].lang === 'ko-KR' || voices[i].lang.indexOf('ko') === 0) {
      utterance.voice = voices[i];
      break;
    }
  }

  // 완료 콜백
  if (callback) {
    utterance.onend = function () {
      callback();
    };
  }

  // 에러 처리
  utterance.onerror = function (event) {
    console.error('음성 합성 오류:', event.error);
    if (callback) callback();
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * 현재 재생 중인 음성을 중단한다.
 */
function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * 현재 음성이 재생 중인지 확인한다.
 * @returns {boolean}
 */
function isSpeaking() {
  if (!window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}

/**
 * 자동 음성 출력 — '다' 수준 학생에게만 자동으로 읽어준다.
 * '가', '나' 수준 학생에게는 아무 동작도 하지 않는다.
 *
 * @param {string} text - 읽어줄 텍스트
 * @param {string} level - 학생 수준 ('가', '나', '다')
 */
function autoSpeak(text, level) {
  if (level === '다') {
    speak(text);
  }
}
