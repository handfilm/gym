// app.js
(function () {
  const STORAGE_KEY = 'gym_hh_30day_state_v1';
  const LANG_KEY = 'gym_hh_lang_v1';
  const TOTAL_DAYS = 30;

  // STATE: 0 = pending, 1 = done, 2 = failed
  let dayStates = loadState();
  let currentLang = localStorage.getItem(LANG_KEY) || 'en';

  const gridEl = document.getElementById('dayGrid');
  const countEl = document.getElementById('completedCount');
  const meterFillEl = document.getElementById('meterFill');
  const resetBtn = document.getElementById('resetBtn');
  const langBtns = document.querySelectorAll('.lang-btn');

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === TOTAL_DAYS) return parsed;
      }
    } catch (e) {}
    return new Array(TOTAL_DAYS).fill(0);
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dayStates));
  }

  function cycleState(index) {
    dayStates[index] = (dayStates[index] + 1) % 3;
    saveState();
    renderBlock(index);
    updateStatus();
  }

  function renderBlock(index) {
    const block = gridEl.children[index];
    const state = dayStates[index];
    block.classList.remove('done', 'failed');
    const markEl = block.querySelector('.day-mark');

    if (state === 1) {
      block.classList.add('done');
      markEl.textContent = 'X';
    } else if (state === 2) {
      block.classList.add('failed');
      markEl.textContent = '–';
    } else {
      markEl.textContent = '';
    }
  }

  function buildGrid() {
    gridEl.innerHTML = '';
    for (let i = 0; i < TOTAL_DAYS; i++) {
      const block = document.createElement('div');
      block.className = 'day-block';
      block.setAttribute('role', 'button');
      block.setAttribute('tabindex', '0');
      block.setAttribute('aria-label', `Day ${i + 1}`);

      const num = document.createElement('span');
      num.className = 'day-num';
      num.textContent = String(i + 1).padStart(2, '0');

      const mark = document.createElement('span');
      mark.className = 'day-mark';

      block.appendChild(num);
      block.appendChild(mark);

      block.addEventListener('click', () => cycleState(i));
      block.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          cycleState(i);
        }
      });

      gridEl.appendChild(block);
      renderBlock(i);
    }
  }

  function updateStatus() {
    const completed = dayStates.filter((s) => s === 1).length;
    countEl.textContent = completed;
    const pct = (completed / TOTAL_DAYS) * 100;
    meterFillEl.style.width = pct + '%';
  }

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute('data-lang', lang);
    document.body.setAttribute('data-lang-active', lang);

    document.querySelectorAll('[data-en]').forEach((el) => {
      el.textContent = lang === 'bn' ? el.getAttribute('data-bn') : el.getAttribute('data-en');
    });

    langBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  function initLangToggle() {
    langBtns.forEach((btn) => {
      btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
    });
  }

  function initReset() {
    let confirmArmed = false;
    resetBtn.addEventListener('click', () => {
      if (!confirmArmed) {
        confirmArmed = true;
        resetBtn.textContent = currentLang === 'bn' ? '[ নিশ্চিত করুন? ]' : '[ CONFIRM WIPE? ]';
        setTimeout(() => {
          confirmArmed = false;
          resetBtn.textContent = resetBtn.getAttribute('data-' + currentLang);
        }, 3000);
        return;
      }
      dayStates = new Array(TOTAL_DAYS).fill(0);
      saveState();
      buildGrid();
      updateStatus();
      confirmArmed = false;
      resetBtn.textContent = resetBtn.getAttribute('data-' + currentLang);
    });
  }

  // INIT
  buildGrid();
  updateStatus();
  initLangToggle();
  initReset();
  applyLanguage(currentLang);
})();
