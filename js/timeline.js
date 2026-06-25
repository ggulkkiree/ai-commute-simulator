/* Timeline Logic Overrides for V12 */

document.addEventListener('DOMContentLoaded', function() {
  // Save original functions
  if (typeof renderScenario === 'function') {
    var originalRenderScenario = window.renderScenario;
    window.renderScenario = function(scenario) {
      originalRenderScenario(scenario);
      
      var dialogWrapper = document.querySelector('.vn-dialog-wrapper');
      var choicesContainer = document.querySelector('#choices-container');
      var bgImage = document.querySelector('#scenario-bg-image');
      
      if (scenario.timeline && scenario.timeline.hasTimeline) {
        if (dialogWrapper) { dialogWrapper.style.opacity = '0'; dialogWrapper.style.pointerEvents = 'none'; }
        if (choicesContainer) { choicesContainer.style.opacity = '0'; choicesContainer.style.pointerEvents = 'none'; }
        if (bgImage) { bgImage.classList.remove('anim-shake'); }
        
        setTimeout(function() {
          if (bgImage) bgImage.classList.add('anim-shake');
        }, scenario.timeline.initialDelay);
        
        setTimeout(function() {
          if (bgImage) bgImage.classList.remove('anim-shake');
          if (dialogWrapper) { dialogWrapper.style.opacity = '1'; dialogWrapper.style.pointerEvents = 'auto'; }
          if (choicesContainer) { choicesContainer.style.opacity = '1'; choicesContainer.style.pointerEvents = 'auto'; }
        }, scenario.timeline.initialDelay + scenario.timeline.actionDelay);
      } else {
        if (dialogWrapper) { dialogWrapper.style.opacity = '1'; dialogWrapper.style.pointerEvents = 'auto'; }
        if (choicesContainer) { choicesContainer.style.opacity = '1'; choicesContainer.style.pointerEvents = 'auto'; }
        if (bgImage) bgImage.classList.remove('anim-shake');
      }
      
      // Update VN HUD
      var hud = document.getElementById('vn-hud');
      if (hud) {
        hud.style.display = 'flex';
        var hudClock = document.getElementById('vn-hud-clock');
        if (hudClock) hudClock.textContent = formatTime(gameState.time.current);
        
        var hudItems = document.getElementById('vn-hud-items');
        if (hudItems) {
          var items = getBagItems();
          var html = '';
          items.forEach(function(item) {
            if (item.checked) {
              html += '<div>✅ ' + item.icon + ' ' + item.name + '</div>';
            } else {
              html += '<div style="color: #aaa;">⬜ ' + item.icon + ' ' + item.name + '</div>';
            }
          });
          hudItems.innerHTML = html;
        }
      }
    };
  }

  if (typeof handleChoice === 'function') {
    var originalHandleChoice = window.handleChoice;
    window.handleChoice = function(choiceIndex) {
      if (!currentScenario || !currentScenario.choices[choiceIndex]) return;
      var choice = currentScenario.choices[choiceIndex];
      
      if (choice.id === 'wake_01_a') {
        var btns = dom.choicesContainer.querySelectorAll('.btn-choice');
        btns.forEach(function(b) { b.disabled = true; });
        var bgImage = document.querySelector('#scenario-bg-image');
        if (bgImage) bgImage.src = 'assets/images/wake_stretch.svg';
        
        setTimeout(function() {
          originalHandleChoice(choiceIndex);
        }, 1500);
        return;
      } else if (choice.id === 'wake_01_b') {
        var btns2 = dom.choicesContainer.querySelectorAll('.btn-choice');
        btns2.forEach(function(b) { b.disabled = true; });
        var bgImage2 = document.querySelector('#scenario-bg-image');
        if (bgImage2) bgImage2.src = 'assets/images/wake_blanket.svg';
        
        var hudClock = document.getElementById('vn-hud-clock');
        if (hudClock) {
          hudClock.textContent = formatTime(gameState.time.current + choice.timeCost);
          hudClock.classList.add('anim-clock-flash');
        }
        
        setTimeout(function() {
          if (hudClock) hudClock.classList.remove('anim-clock-flash');
          originalHandleChoice(choiceIndex);
        }, 1500);
        return;
      }
      
      originalHandleChoice(choiceIndex);
    };
  }
});
