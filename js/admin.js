// ============================================================
// admin.js - 교사 설정 / 학생 관리 화면
// 기존 학생 저장 키와 학생 선택 화면 연결을 그대로 사용합니다.
// ============================================================

var adminEditingStudentId = null;
var adminSelectedAvatar = 'default';

function getAdminAvatarOptions() {
  var preferred = ['boy-01', 'girl-01', 'boy-02', 'boy-03', 'boy-04', 'girl-02', 'default'];
  return preferred.filter(function (key) {
    return AVATAR_IMAGES && AVATAR_IMAGES[key];
  });
}

function getAdminGenderLabel(gender) {
  if (gender === '남자' || gender === '남학생') return '남학생';
  if (gender === '여자' || gender === '여학생') return '여학생';
  return '미설정';
}

function getAdminLevelLabel(level) {
  return (level || '나') + '수준';
}

function renderAdminAvatarChoices(selectedAvatar) {
  var options = getAdminAvatarOptions();
  var html = '';

  options.forEach(function (key, index) {
    var isSelected = key === selectedAvatar || (!selectedAvatar && key === 'default');
    html += '<label class="admin-avatar-option' + (isSelected ? ' is-selected' : '') + '">';
    html += '<input type="radio" name="admin-avatar" value="' + key + '"' + (isSelected ? ' checked' : '') + '>';
    html += '<span class="admin-avatar-option__image">';
    html += '<img src="' + AVATAR_IMAGES[key] + '" alt="캐릭터 ' + (index + 1) + '">';
    html += '</span>';
    html += '<span class="admin-avatar-option__check" aria-hidden="true">✓</span>';
    html += '</label>';
  });

  return html;
}

function renderAdminPanel() {
  var container = document.getElementById('screen-admin');
  if (!container) return;

  adminEditingStudentId = null;
  adminSelectedAvatar = 'default';

  container.innerHTML =
    '<div class="admin-panel">' +
      '<header class="teacher-settings__header">' +
        '<div class="teacher-settings__identity">' +
          '<span class="teacher-settings__icon" aria-hidden="true">👩‍🏫</span>' +
          '<div>' +
            '<h2>교사 설정</h2>' +
            '<p>학생 정보를 등록하고 수준에 맞게 설정해요.</p>' +
          '</div>' +
        '</div>' +
        '<button id="btn-admin-back" class="admin-button admin-button--outline" type="button">⌂ 학생 선택으로</button>' +
      '</header>' +

      '<main class="teacher-settings__workspace">' +
        '<section class="admin-card admin-form-card" aria-labelledby="admin-form-title">' +
          '<div class="admin-card__heading">' +
            '<div>' +
              '<span class="admin-card__eyebrow">학생 정보</span>' +
              '<h3 id="admin-form-title">학생 추가</h3>' +
            '</div>' +
            '<span id="admin-form-mode" class="admin-form-mode">새 학생</span>' +
          '</div>' +

          '<div class="admin-field">' +
            '<label for="admin-student-name">이름</label>' +
            '<input type="text" id="admin-student-name" placeholder="학생 이름을 입력하세요." maxlength="20" autocomplete="off">' +
          '</div>' +

          '<fieldset class="admin-fieldset">' +
            '<legend>수준</legend>' +
            '<div class="admin-choice-group admin-choice-group--level">' +
              '<label><input type="radio" name="admin-level" value="가"><span>가수준</span></label>' +
              '<label><input type="radio" name="admin-level" value="나" checked><span>나수준</span></label>' +
              '<label><input type="radio" name="admin-level" value="다"><span>다수준</span></label>' +
            '</div>' +
          '</fieldset>' +

          '<fieldset class="admin-fieldset">' +
            '<legend>성별</legend>' +
            '<div class="admin-choice-group admin-choice-group--gender">' +
              '<label><input type="radio" name="admin-gender" value="남자"><span>남학생</span></label>' +
              '<label><input type="radio" name="admin-gender" value="여자"><span>여학생</span></label>' +
              '<label><input type="radio" name="admin-gender" value="미설정" checked><span>미설정</span></label>' +
            '</div>' +
          '</fieldset>' +

          '<fieldset class="admin-fieldset admin-avatar-fieldset">' +
            '<legend>캐릭터</legend>' +
            '<div id="admin-avatar-choices" class="admin-avatar-grid">' +
              renderAdminAvatarChoices(adminSelectedAvatar) +
            '</div>' +
          '</fieldset>' +

          '<div class="admin-form-actions">' +
            '<button id="btn-cancel-edit" class="admin-button admin-button--muted" type="button" hidden>수정 취소</button>' +
            '<button id="btn-add-student" class="admin-button admin-button--primary" type="button">＋ 학생 추가</button>' +
          '</div>' +
        '</section>' +

        '<section class="admin-card admin-student-list" aria-labelledby="admin-list-title">' +
          '<div class="admin-card__heading admin-card__heading--list">' +
            '<div>' +
              '<span class="admin-card__eyebrow">학생 관리</span>' +
              '<h3 id="admin-list-title">등록 학생</h3>' +
            '</div>' +
            '<strong id="admin-student-count" class="admin-student-count">0 / ' + MAX_STUDENTS + '</strong>' +
          '</div>' +
          '<div id="student-list-container" class="admin-student-cards"></div>' +
        '</section>' +
      '</main>' +

      '<footer class="teacher-settings__footer">' +
        '<p id="admin-save-status" class="admin-save-status" role="status" aria-live="polite">변경 내용은 학생 선택 화면에도 바로 반영됩니다.</p>' +
        '<div class="teacher-settings__footer-actions">' +
          '<button id="btn-admin-back-footer" class="admin-button admin-button--muted" type="button">← 학생 선택으로 돌아가기</button>' +
          '<button id="btn-admin-save" class="admin-button admin-button--save" type="button">▣ 저장하기</button>' +
        '</div>' +
      '</footer>' +
    '</div>';

  renderStudentList();
  initAdminEvents();
}

function renderStudentList() {
  var listContainer = document.getElementById('student-list-container');
  if (!listContainer) return;

  var students = getStudents();
  var count = document.getElementById('admin-student-count');
  if (count) count.textContent = students.length + ' / ' + MAX_STUDENTS;

  if (students.length === 0) {
    listContainer.innerHTML =
      '<div class="admin-empty-state">' +
        '<span aria-hidden="true">👥</span>' +
        '<strong>등록된 학생이 없습니다.</strong>' +
        '<p>왼쪽에서 첫 학생을 추가해 주세요.</p>' +
      '</div>';
    return;
  }

  listContainer.innerHTML = students.map(function (student) {
    var avatar = getStudentAvatarPresentation(student);
    var genderLabel = getAdminGenderLabel(student.gender);
    var name = typeof _escapeHtml === 'function' ? _escapeHtml(student.name) : student.name;

    return '<article class="admin-student-card" data-student-id="' + student.id + '">' +
      '<div class="admin-student-card__avatar">' +
        '<img src="' + avatar.src + '" alt="">' +
      '</div>' +
      '<div class="admin-student-card__profile">' +
        '<strong>' + name + '</strong>' +
        '<div class="admin-student-card__tags">' +
          '<span class="admin-tag admin-tag--level">' + getAdminLevelLabel(student.level) + '</span>' +
          '<span class="admin-tag admin-tag--gender">' + genderLabel + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="admin-student-card__actions">' +
        '<button class="admin-mini-button admin-mini-button--edit" data-action="edit" data-student-id="' + student.id + '" type="button">✎ 수정</button>' +
        '<button class="admin-mini-button admin-mini-button--delete" data-action="delete" data-student-id="' + student.id + '" type="button">♲ 삭제</button>' +
      '</div>' +
    '</article>';
  }).join('');
}

function getCheckedAdminValue(name, fallback) {
  var checked = document.querySelector('input[name="' + name + '"]:checked');
  return checked ? checked.value : fallback;
}

function setCheckedAdminValue(name, value) {
  var radios = document.querySelectorAll('input[name="' + name + '"]');
  for (var i = 0; i < radios.length; i++) {
    radios[i].checked = radios[i].value === value;
  }
}

function setAdminStatus(message, isError) {
  var status = document.getElementById('admin-save-status');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('is-error', Boolean(isError));
  status.classList.toggle('is-saved', !isError);
}

function resetAdminForm() {
  adminEditingStudentId = null;
  adminSelectedAvatar = 'default';

  var nameInput = document.getElementById('admin-student-name');
  if (nameInput) nameInput.value = '';
  setCheckedAdminValue('admin-level', '나');
  setCheckedAdminValue('admin-gender', '미설정');
  setCheckedAdminValue('admin-avatar', 'default');

  var title = document.getElementById('admin-form-title');
  var mode = document.getElementById('admin-form-mode');
  var submit = document.getElementById('btn-add-student');
  var cancel = document.getElementById('btn-cancel-edit');
  if (title) title.textContent = '학생 추가';
  if (mode) mode.textContent = '새 학생';
  if (submit) submit.textContent = '＋ 학생 추가';
  if (cancel) cancel.hidden = true;

  updateAdminAvatarSelection();
}

function updateAdminAvatarSelection() {
  var options = document.querySelectorAll('.admin-avatar-option');
  for (var i = 0; i < options.length; i++) {
    var radio = options[i].querySelector('input');
    options[i].classList.toggle('is-selected', Boolean(radio && radio.checked));
  }
}

function handleAddStudent() {
  var nameInput = document.getElementById('admin-student-name');
  if (!nameInput) return;

  var name = nameInput.value.trim();
  if (!name) {
    setAdminStatus('학생 이름을 입력해 주세요.', true);
    nameInput.focus();
    return;
  }

  var profile = {
    name: name,
    level: getCheckedAdminValue('admin-level', '나'),
    gender: getCheckedAdminValue('admin-gender', '미설정'),
    avatar: getCheckedAdminValue('admin-avatar', 'default')
  };

  if (adminEditingStudentId !== null) {
    updateStudentProfile(adminEditingStudentId, profile);
    setAdminStatus(name + ' 학생의 정보를 수정했습니다.');
  } else {
    var added = addStudentProfile(profile);
    if (!added) {
      setAdminStatus('학생은 최대 ' + MAX_STUDENTS + '명까지 등록할 수 있습니다.', true);
      return;
    }
    setAdminStatus(name + ' 학생을 추가했습니다.');
  }

  resetAdminForm();
  renderStudentList();
  if (typeof renderMainScreen === 'function') renderMainScreen();
  nameInput.focus();
}

function handleDeleteStudent(id) {
  var student = getStudentById(id);
  var studentName = student ? student.name : '이 학생';

  if (!confirm('정말 ' + studentName + ' 학생을 삭제할까요?')) return;

  removeStudent(id);
  if (String(adminEditingStudentId) === String(id)) resetAdminForm();
  renderStudentList();
  if (typeof renderMainScreen === 'function') renderMainScreen();
  setAdminStatus(studentName + ' 학생을 삭제했습니다.');
}

function handleEditStudent(id) {
  var student = getStudentById(id);
  if (!student) return;

  adminEditingStudentId = student.id;
  adminSelectedAvatar = student.avatar || 'default';

  var nameInput = document.getElementById('admin-student-name');
  if (nameInput) nameInput.value = student.name || '';
  setCheckedAdminValue('admin-level', student.level || '나');
  setCheckedAdminValue('admin-gender', getAdminGenderLabel(student.gender) === '남학생' ? '남자' :
    getAdminGenderLabel(student.gender) === '여학생' ? '여자' : '미설정');
  setCheckedAdminValue('admin-avatar', adminSelectedAvatar);

  var title = document.getElementById('admin-form-title');
  var mode = document.getElementById('admin-form-mode');
  var submit = document.getElementById('btn-add-student');
  var cancel = document.getElementById('btn-cancel-edit');
  if (title) title.textContent = '학생 수정';
  if (mode) mode.textContent = '수정 중';
  if (submit) submit.textContent = '✓ 수정 저장';
  if (cancel) cancel.hidden = false;

  updateAdminAvatarSelection();
  setAdminStatus(student.name + ' 학생 정보를 수정하고 있습니다.');
  if (nameInput) {
    nameInput.focus();
    nameInput.select();
  }
}

function returnToStudentSelection() {
  if (typeof renderMainScreen === 'function') renderMainScreen();
  if (typeof showScreen === 'function') showScreen('screen-main');
}

function saveAdminStudents() {
  saveStudents(getStudents());
  if (typeof renderMainScreen === 'function') renderMainScreen();
  setAdminStatus('학생 정보를 저장했습니다.');
}

function initAdminEvents() {
  var submit = document.getElementById('btn-add-student');
  if (submit) submit.addEventListener('click', handleAddStudent);

  var cancel = document.getElementById('btn-cancel-edit');
  if (cancel) cancel.addEventListener('click', function () {
    resetAdminForm();
    setAdminStatus('수정을 취소했습니다.');
  });

  var nameInput = document.getElementById('admin-student-name');
  if (nameInput) {
    nameInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') handleAddStudent();
    });
  }

  var avatarChoices = document.getElementById('admin-avatar-choices');
  if (avatarChoices) {
    avatarChoices.addEventListener('change', function () {
      adminSelectedAvatar = getCheckedAdminValue('admin-avatar', 'default');
      updateAdminAvatarSelection();
    });
  }

  var back = document.getElementById('btn-admin-back');
  var backFooter = document.getElementById('btn-admin-back-footer');
  if (back) back.addEventListener('click', returnToStudentSelection);
  if (backFooter) backFooter.addEventListener('click', returnToStudentSelection);

  var save = document.getElementById('btn-admin-save');
  if (save) save.addEventListener('click', saveAdminStudents);

  var list = document.getElementById('student-list-container');
  if (list) {
    list.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-action]');
      if (!button) return;
      var id = button.getAttribute('data-student-id');
      if (button.getAttribute('data-action') === 'edit') handleEditStudent(id);
      if (button.getAttribute('data-action') === 'delete') handleDeleteStudent(id);
    });
  }
}
