// ============================================================
// students.js — 학생 데이터 관리 모듈 (localStorage)
// 본앤하이리 출근 마스터 시뮬레이터
// ============================================================

// localStorage 키 상수
var STUDENTS_KEY = 'bonHighlee_students';
var HISTORY_KEY = 'bonHighlee_history';
var MAX_STUDENTS = 5;

// 학생 데이터의 avatar 키와 실제 이미지 경로를 한 곳에서 관리한다.
// 이미지 파일이 준비되면 이 경로에 추가하는 것만으로 학생 카드에 반영된다.
var AVATAR_IMAGES = {
  'boy-01': 'assets/characters/boy-01.png',
  'boy-02': 'assets/characters/boy-02.png',
  'boy-03': 'assets/characters/boy-03.png',
  'boy-04': 'assets/characters/boy-04.png',
  'girl-01': 'assets/characters/girl-01.png',
  'girl-02': 'assets/characters/girl-02.png',
  'default': 'assets/characters/default.png'
};

// 기존 localStorage 학생 데이터에 avatar 필드가 없을 때만 적용되는 1회성 데이터 보정표.
// 화면 렌더링에서는 이름을 보지 않고, 보정 후 저장된 student.avatar 값만 사용한다.
var LEGACY_STUDENT_AVATAR_DATA = [
  { name: '강태훈', avatar: 'boy-01' },
  { name: '박소은', avatar: 'girl-01' },
  { name: '이한빈', avatar: 'boy-02' },
  { name: '조현일', avatar: 'boy-03' },
  { name: '서정우', avatar: 'boy-04' }
];

function isAvatarImageKey(avatar) {
  return typeof avatar === 'string' &&
    avatar !== 'default' &&
    Object.prototype.hasOwnProperty.call(AVATAR_IMAGES, avatar);
}

function getAvatarImagePath(avatar) {
  return isAvatarImageKey(avatar) ? AVATAR_IMAGES[avatar] : '';
}

function getStudentFallbackEmoji(student) {
  student = student || {};
  if (student.emoji) return student.emoji;
  if (student.avatar && !isAvatarImageKey(student.avatar)) return student.avatar;
  return student.character === 'girl' || student.gender === '여자' ? '👩' : '🧑';
}

function getStudentAvatarPresentation(student) {
  student = student || {};
  var key = isAvatarImageKey(student.avatar) ? student.avatar : 'default';
  return {
    key: key,
    src: AVATAR_IMAGES[key] || AVATAR_IMAGES.default,
    fallback: getStudentFallbackEmoji(student)
  };
}

function normalizeStudentLevel(level) {
  if (level === 'ga') return '가';
  if (level === 'na') return '나';
  if (level === 'da') return '다';
  return level === '가' || level === '나' || level === '다' ? level : '나';
}

function getStoredLevelKey(level) {
  if (typeof getLevelKey === 'function') return getLevelKey(level);
  if (level === '가') return 'ga';
  if (level === '다') return 'da';
  return 'na';
}

function normalizeStudentCharacter(character, gender) {
  if (character === 'girl' || gender === '여자') return 'girl';
  return 'boy';
}

function normalizeStudentRecord(student) {
  student = student || {};
  var level = normalizeStudentLevel(student.level);
  var character = normalizeStudentCharacter(student.character, student.gender);
  var characterInfo = typeof getCharacterDefinition === 'function'
    ? getCharacterDefinition(character)
    : {
        key: character,
        gender: character === 'girl' ? '여자' : '남자',
        emoji: character === 'girl' ? '👩' : '🧑'
      };
  var avatar = isAvatarImageKey(student.avatar) ? student.avatar : '';
  var fallbackEmoji = student.emoji ||
    (student.avatar && !isAvatarImageKey(student.avatar) ? student.avatar : characterInfo.emoji);

  var normalized = {};
  var keys = Object.keys(student);
  for (var i = 0; i < keys.length; i++) {
    normalized[keys[i]] = student[keys[i]];
  }

  normalized.id = student.id !== undefined && student.id !== null ? student.id : Date.now();
  normalized.name = student.name || '';
  normalized.level = level;
  normalized.levelKey = student.levelKey || getStoredLevelKey(level);
  normalized.character = characterInfo.key;
  normalized.gender = student.gender || characterInfo.gender;
  normalized.emoji = fallbackEmoji;
  normalized.avatar = avatar;

  return normalized;
}

function applyLegacyStudentAvatarData(students) {
  var avatarByName = {};
  var changed = false;

  LEGACY_STUDENT_AVATAR_DATA.forEach(function(profile) {
    avatarByName[profile.name] = profile.avatar;
  });

  students.forEach(function(student) {
    if (!student.avatar && avatarByName[student.name]) {
      student.avatar = avatarByName[student.name];
      changed = true;
    }
  });

  return changed;
}

/**
 * 전체 학생 목록 조회
 * @returns {Array<Object>} 학생 배열. 비어있으면 빈 배열 반환.
 */
function getStudents() {
  try {
    var data = localStorage.getItem(STUDENTS_KEY);
    if (!data) return [];
    var students = JSON.parse(data);
    if (!Array.isArray(students)) return [];
    var normalized = students.map(normalizeStudentRecord);
    if (applyLegacyStudentAvatarData(normalized)) {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(normalized));
    }
    return normalized;
  } catch (e) {
    console.error('학생 목록 로드 실패:', e);
    return [];
  }
}

/**
 * 학생 목록 저장
 * @param {Array<Object>} students - 저장할 학생 배열
 */
function saveStudents(students) {
  try {
    var normalized = Array.isArray(students)
      ? students.map(normalizeStudentRecord)
      : [];
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(normalized));
  } catch (e) {
    console.error('학생 목록 저장 실패:', e);
  }
}

/**
 * 학생 추가 — 자동 생성 ID (Date.now()) 와 기본 이모지 부여
 * @param {string} name - 학생 이름
 * @param {string} level - 수준 ('가', '나', '다')
 * @param {string} character - 캐릭터 ('boy' | 'girl'), 생략 시 boy
 * @returns {Object} 추가된 학생 객체
 */
function addStudent(name, level, character) {
  var students = getStudents();
  if (students.length >= MAX_STUDENTS) {
    return null;
  }
  var newStudent = normalizeStudentRecord({
    id: Date.now(),
    name: name,
    level: level || '나',
    character: character || 'boy'
  });

  students.push(newStudent);
  saveStudents(students);

  return newStudent;
}

/**
 * 학생 삭제
 * @param {number|string} id - 삭제할 학생 ID
 */
function removeStudent(id) {
  var students = getStudents();
  var filtered = [];

  for (var i = 0; i < students.length; i++) {
    if (String(students[i].id) !== String(id)) {
      filtered.push(students[i]);
    }
  }

  saveStudents(filtered);
}

/**
 * 학생 수준 변경
 * @param {number|string} id - 학생 ID
 * @param {string} newLevel - 새 수준 ('가', '나', '다')
 */
function updateStudentLevel(id, newLevel) {
  var students = getStudents();

  for (var i = 0; i < students.length; i++) {
    if (String(students[i].id) === String(id)) {
      students[i].level = normalizeStudentLevel(newLevel);
      students[i].levelKey = getStoredLevelKey(students[i].level);
      break;
    }
  }

  saveStudents(students);
}

function updateStudentCharacter(id, character) {
  var students = getStudents();

  for (var i = 0; i < students.length; i++) {
    if (String(students[i].id) === String(id)) {
      var updatedData = {};
      Object.keys(students[i]).forEach(function(key) {
        updatedData[key] = students[i][key];
      });
      updatedData.character = character;
      updatedData.gender = character === 'girl' ? '여자' : '남자';
      updatedData.emoji = character === 'girl' ? '👩' : '🧑';
      var updated = normalizeStudentRecord(updatedData);
      students[i] = updated;
      break;
    }
  }

  saveStudents(students);
}

function updateStudentAvatar(id, avatar) {
  var students = getStudents();

  for (var i = 0; i < students.length; i++) {
    if (String(students[i].id) === String(id)) {
      students[i].avatar = isAvatarImageKey(avatar) ? avatar : '';
      break;
    }
  }

  saveStudents(students);
}

/**
 * 교사 설정 화면에서 사용하는 확장형 학생 추가 함수.
 * 기존 addStudent 함수와 저장 키는 그대로 유지합니다.
 */
function addStudentProfile(profile) {
  profile = profile || {};
  var students = getStudents();
  if (students.length >= MAX_STUDENTS) return null;

  var gender = profile.gender || '미설정';
  var character = gender === '여자' || gender === '여학생' ? 'girl' : 'boy';
  var newStudent = normalizeStudentRecord({
    id: Date.now(),
    name: profile.name || '',
    level: profile.level || '나',
    character: character,
    gender: gender,
    avatar: isAvatarImageKey(profile.avatar) ? profile.avatar : ''
  });

  newStudent.gender = gender;
  students.push(newStudent);
  saveStudents(students);
  return newStudent;
}

/**
 * 학생 id를 유지한 채 이름/수준/성별/아바타를 수정합니다.
 */
function updateStudentProfile(id, profile) {
  profile = profile || {};
  var students = getStudents();
  var updatedStudent = null;

  for (var i = 0; i < students.length; i++) {
    if (String(students[i].id) !== String(id)) continue;

    var current = students[i];
    var gender = profile.gender !== undefined ? profile.gender : current.gender;
    var character = current.character;
    if (gender === '여자' || gender === '여학생') character = 'girl';
    if (gender === '남자' || gender === '남학생') character = 'boy';

    var merged = {};
    Object.keys(current).forEach(function (key) {
      merged[key] = current[key];
    });

    merged.id = current.id;
    merged.name = profile.name !== undefined ? profile.name : current.name;
    merged.level = profile.level !== undefined ? profile.level : current.level;
    merged.levelKey = getStoredLevelKey(merged.level);
    merged.gender = gender || '미설정';
    merged.character = character;
    merged.avatar = isAvatarImageKey(profile.avatar)
      ? profile.avatar
      : (profile.avatar === 'default' ? '' : current.avatar);

    updatedStudent = normalizeStudentRecord(merged);
    updatedStudent.gender = merged.gender;
    students[i] = updatedStudent;
    break;
  }

  saveStudents(students);
  return updatedStudent;
}

function getStudentCapacity() {
  return {
    maximum: MAX_STUDENTS,
    current: getStudents().length,
    remaining: Math.max(0, MAX_STUDENTS - getStudents().length)
  };
}

/**
 * ID로 학생 조회
 * @param {number|string} id - 학생 ID
 * @returns {Object|null} 학생 객체 또는 null
 */
function getStudentById(id) {
  var students = getStudents();

  for (var i = 0; i < students.length; i++) {
    if (String(students[i].id) === String(id)) {
      return students[i];
    }
  }

  return null;
}

/**
 * 전체 게임 기록 조회
 * @returns {Array<Object>} 게임 기록 배열
 */
function getGameHistory() {
  try {
    var data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error('게임 기록 로드 실패:', e);
    return [];
  }
}

/**
 * 게임 결과 저장 — 기존 기록에 추가
 * @param {Object} result - 저장할 게임 결과
 *   { studentId, studentName, level, date, judgment, arrivalTime,
 *     bagStatus, actionLog, reflections }
 */
function saveGameResult(result) {
  var history = getGameHistory();

  // 날짜 자동 기록
  if (!result.date) {
    result.date = new Date().toISOString();
  }

  history.push(result);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('게임 결과 저장 실패:', e);
  }
}

/**
 * 전체 게임 기록 삭제
 */
function clearGameHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('게임 기록 삭제 실패:', e);
  }
}

/**
 * 특정 학생의 게임 기록 조회
 * @param {number} studentId - 학생 ID
 * @returns {Array<Object>} 해당 학생의 게임 기록
 */
function getHistoryForStudent(studentId) {
  var history = getGameHistory();
  var result = [];

  for (var i = 0; i < history.length; i++) {
    if (history[i].studentId === studentId) {
      result.push(history[i]);
    }
  }

  return result;
}
