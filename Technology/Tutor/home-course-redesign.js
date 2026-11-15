/* WJ ACADEMY | HOME registration section
   Scoped, independent of Tutor.html and existing GAME/IoT/TEDx code.
*/
(() => {
  'use strict';

  const section = document.getElementById('wj-free-course');
  if (!section || section.dataset.wjcourseInitialized) return;
  section.dataset.wjcourseInitialized = '1';

  const $ = (selector, root = section) => root.querySelector(selector);
  const $$ = (selector, root = section) => [...root.querySelectorAll(selector)];
  const form = $('#wjCourseForm');
  const status = $('#wjcourse-status');
  const submit = $('#wjcourse-submit');
  const defaultSubmitText = submit.textContent;
  const pad = n => String(n).padStart(2, '0');

  // Taiwan-time countdown, independent of the visitor's computer time zone.
  const clock = $('#wjcourse-countdown');
  const hh = $('#wjcourse-hh');
  const mm = $('#wjcourse-mm');
  const ss = $('#wjcourse-ss');
  const twFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Taipei',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23'
  });
  let prevClock = '';
  function tick() {
    const parts = Object.fromEntries(
      twFormatter.formatToParts(new Date())
        .filter(p => ['hour', 'minute', 'second'].includes(p.type))
        .map(p => [p.type, Number(p.value)])
    );
    const remaining = 86399 - (parts.hour * 3600 + parts.minute * 60 + parts.second);
    const text = [
      pad(Math.floor(remaining / 3600)),
      pad(Math.floor(remaining % 3600 / 60)),
      pad(remaining % 60)
    ];
    if (prevClock === text.join(':')) return;
    prevClock = text.join(':');
    hh.textContent = text[0];
    mm.textContent = text[1];
    ss.textContent = text[2];
    clock.setAttribute('aria-label', '台灣時間每日循環倒數 ' + prevClock);
  }
  tick();
  window.setInterval(tick, 250);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });

  function clearStatus() {
    status.textContent = '';
    status.removeAttribute('data-state');
  }
  function showStatus(message, state = 'error') {
    status.textContent = message;
    status.dataset.state = state;
  }

  const selectorInstances = $$('.wjcourse__select').map(wrapper => {
    const trigger = $('.wjcourse__select-trigger', wrapper);
    const text = $('.wjcourse__select-text', wrapper);
    const list = $('.wjcourse__select-options', wrapper);
    const input = $('input[type="hidden"]', wrapper);
    const choices = $$('[role="option"]', list);
    const defaultText = text.textContent;
    const obj = { wrapper, trigger, text, list, input, choices, defaultText };
    wrapper.dataset.open = 'false';
    trigger.setAttribute('aria-required', wrapper.dataset.required === 'true');
    trigger.addEventListener('click', () => toggleSelector(obj, list.hidden));
    trigger.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        toggleSelector(obj, true);
        choices[event.key === 'ArrowDown' ? 0 : choices.length - 1]?.focus();
      }
      if (event.key === 'Escape') toggleSelector(obj, false);
    });
    choices.forEach((option, index) => {
      option.addEventListener('click', () => {
        const prevValue = input.value;
        input.value = option.dataset.value || '';
        text.textContent = option.textContent.trim();
        text.classList.remove('wjcourse__placeholder');
        choices.forEach(item => item.setAttribute('aria-selected', String(item === option)));
        toggleSelector(obj, false);
        wrapper.closest('.wjcourse__field')?.classList.remove('wjcourse__error');
        clearStatus();
        trigger.focus();
        if (prevValue !== input.value) input.dispatchEvent(new Event('change', {bubbles:true}));
      });
      option.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          const next = (index + (event.key === 'ArrowDown' ? 1 : choices.length - 1)) % choices.length;
          choices[next].focus();
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          choices[event.key === 'Home' ? 0 : choices.length - 1].focus();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          toggleSelector(obj, false);
          trigger.focus();
        }
      });
    });
    return obj;
  });

  const picker = $('#wjcourse-interest-picker');
  const interestTrigger = $('#wjcourse-interest-trigger');
  const interestOptions = $('#wjcourse-interest-options');
  const interestText = $('#wjcourse-interest-text');
  const interestValue = $('#wjcourse-interests-value');
  const interestCheckboxes = $$('input[type="checkbox"]', interestOptions);
  const terminal = $('#wjcourse-analyzer');
  const interestDone = $('#wjcourse-interest-done');
  const interestCancel = $('#wjcourse-interest-cancel');

  let committedInterests = [];
  let terminalTimer = null;
  let terminalVersion = 0;

  function closeSelectors(except = null) {
    selectorInstances.forEach(s => {
      if (s !== except) {
        s.list.hidden = true;
        s.trigger.setAttribute('aria-expanded', 'false');
        s.wrapper.dataset.open = 'false';
      }
    });
  }
  function toggleSelector(obj, open) {
    if (open) {
      closeSelectors(obj);
      closeInterests(true);
    }
    obj.list.hidden = !open;
    obj.trigger.setAttribute('aria-expanded', String(open));
    obj.wrapper.dataset.open = String(open);
  }
  function resetPendingInterests() {
    interestCheckboxes.forEach(box => { box.checked = committedInterests.includes(box.value); });
  }
  function closeInterests(restorePending = true) {
    if (restorePending) resetPendingInterests();
    interestOptions.hidden = true;
    interestTrigger.setAttribute('aria-expanded', 'false');
  }
  function toggleInterests(open) {
    if (open) {
      closeSelectors();
      resetPendingInterests();
    } else {
      resetPendingInterests();
    }
    interestOptions.hidden = !open;
    interestTrigger.setAttribute('aria-expanded', String(open));
  }
  interestTrigger.addEventListener('click', () => toggleInterests(interestOptions.hidden));
  interestTrigger.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeInterests(true);
  });
  interestCancel.addEventListener('click', () => {
    closeInterests(true);
    interestTrigger.focus();
  });
  document.addEventListener('pointerdown', event => {
    if (!section.contains(event.target)) {
      closeSelectors();
      closeInterests(true);
    } else {
      if (!event.target.closest('.wjcourse__select')) closeSelectors();
      if (!event.target.closest('.wjcourse__interest-picker')) closeInterests(true);
    }
  });
  section.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeSelectors();
      closeInterests(true);
    }
  });

  const learningPaths = {
    '物聯網與智慧互動應用': '感測器、電子實作與智慧裝置專題',
    '遊戲開發': '遊戲邏輯、互動設計與原型製作',
    '程式設計與應用': '程式基礎、問題分析與應用實作',
    '互動式網站設計': '網站介面、使用者體驗與互動功能',
    'VR虛擬實境/AR擴增實境': '沉浸式場景與三維互動原型',
    'AI整合與應用': 'AI 工具應用與跨領域專題整合',
    '還在探索': '從體驗不同技術開始尋找興趣方向'
  };
  const terminalDefault = '[SYSTEM] 等待完成領域選擇...';
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  function renderTerminal(content) {
    terminalVersion++;
    const version = terminalVersion;
    if (terminalTimer !== null) clearTimeout(terminalTimer);
    terminalTimer = null;
    terminal.classList.remove('wjcourse__typing');

    if (reduceMotion || content === terminalDefault) {
      terminal.textContent = content;
      return;
    }

    terminal.textContent = '';
    terminal.classList.add('wjcourse__typing');
    let next = 0;

    function writeCharacter() {
      if (version !== terminalVersion) return;
      if (next >= content.length) {
        terminalTimer = null;
        terminal.classList.remove('wjcourse__typing');
        return;
      }

      const char = content.charAt(next++);
      terminal.textContent += char;

      // Human-scale typing: brief pauses after line breaks and code punctuation.
      const delay = char === '\n' ? 175 :
        /[;:{}()[\]]/.test(char) ? 85 : 42;
      terminalTimer = setTimeout(writeCharacter, delay);
    }

    writeCharacter();
  }

  function commitInterests() {
    committedInterests = interestCheckboxes.filter(box => box.checked).map(box => box.value);
    interestValue.value = committedInterests.join('；');
    if (committedInterests.length === 0) {
      interestText.textContent = '尚未選擇領域（可不選）';
      interestText.classList.remove('wjcourse__placeholder');
      renderTerminal('[SYSTEM] 尚未指定領域，可先從興趣探索開始。');
    } else {
      interestText.textContent = committedInterests.length === 1
        ? committedInterests[0] : `已選擇 ${committedInterests.length} 個領域`;
      interestText.classList.remove('wjcourse__placeholder');
      const lines = [
        '// WJ STUDIO | 學習方向參考',
        `const interests = [${committedInterests.map(s => JSON.stringify(s)).join(', ')}];`,
        ''
      ];
      committedInterests.forEach((value, index) => {
        lines.push(`${pad(index + 1)}  ${value}`);
        lines.push(`    → ${learningPaths[value] || '學習規劃與作品實作'}`);
      });
      lines.push('', '// 後續將依孩子的程度與目標進一步討論。');
      renderTerminal(lines.join('\n'));
    }
    closeInterests(false);
    clearStatus();
    interestTrigger.focus();
  }
  interestDone.addEventListener('click', commitInterests);

  const contactInfo = $('#wjcourse-contact-info');
  const contactSelector = selectorInstances.find(s => s.wrapper.dataset.name === 'contact_method');
  const contactHints = {
    LINE: {type:'text',placeholder:'請填寫您的 LINE ID',autocomplete:'off',inputMode:'text'},
    '電子郵件': {type:'email',placeholder:'example@email.com',autocomplete:'email',inputMode:'email'},
    '電話': {type:'tel',placeholder:'請填寫方便聯絡的電話號碼',autocomplete:'tel',inputMode:'tel'},
    Facebook: {type:'text',placeholder:'請填寫 Facebook 帳號或個人檔案連結',autocomplete:'off',inputMode:'text'}
  };
  function updateContactType() {
    const hint = contactHints[contactSelector?.input.value] ||
      {type:'text',placeholder:'請先選擇上方聯絡方式',autocomplete:'off',inputMode:'text'};
    contactInfo.value = '';
    contactInfo.type = hint.type;
    contactInfo.placeholder = hint.placeholder;
    contactInfo.autocomplete = hint.autocomplete;
    contactInfo.inputMode = hint.inputMode;
  }
  contactSelector?.input.addEventListener('change', updateContactType);

  // Maintain a white HOME cursor only while hovering interactive form items.
  if (window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) {
    const isInteractive = 'button, input, textarea, label, [role="option"]';
    document.addEventListener('pointermove', event => {
      const el = event.target instanceof Element ? event.target : null;
      document.body.classList.toggle('wjc-white-pointer',
        Boolean(el && section.contains(el) && el.closest(isInteractive)));
    }, {passive:true});
    section.addEventListener('pointerleave', () => document.body.classList.remove('wjc-white-pointer'));
    window.addEventListener('blur', () => document.body.classList.remove('wjc-white-pointer'));
  }

  function validateFields() {
    for (const s of selectorInstances) {
      s.wrapper.closest('.wjcourse__field')?.classList.remove('wjcourse__error');
      if (s.wrapper.dataset.required === 'true' && !s.input.value) {
        s.wrapper.closest('.wjcourse__field')?.classList.add('wjcourse__error');
        s.trigger.focus();
        showStatus(`請先選擇「${s.wrapper.dataset.label}」。`);
        return false;
      }
    }
    const firstInvalid = $$('input:not([type="hidden"]):not([type="checkbox"]), textarea', form)
      .find(el => !el.checkValidity());
    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.reportValidity();
      return false;
    }
    return true;
  }

  function resetFields() {
    selectorInstances.forEach(s => {
      s.input.value = '';
      s.text.textContent = s.defaultText;
      s.text.classList.add('wjcourse__placeholder');
      s.choices.forEach(o => o.setAttribute('aria-selected', 'false'));
      s.wrapper.closest('.wjcourse__field')?.classList.remove('wjcourse__error');
      s.list.hidden = true;
      s.trigger.setAttribute('aria-expanded', 'false');
    });
    committedInterests = [];
    interestValue.value = '';
    interestCheckboxes.forEach(box => { box.checked = false; });
    interestText.textContent = '選擇感興趣的領域';
    interestText.classList.add('wjcourse__placeholder');
    renderTerminal(terminalDefault);
    updateContactType();
    closeInterests(true);
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled || !validateFields()) return;
    closeSelectors();
    closeInterests(true);
    submit.disabled = true;
    submit.textContent = '資料傳送中…';
    clearStatus();
    try {
      const values = new FormData(form);
      values.set('name', $('#wjcourse-parent').value.trim());
      if (contactSelector.input.value === '電子郵件') {
        values.set('email', contactInfo.value.trim());
      }
      const response = await fetch(form.action, {
        method: 'POST', body: values,
        headers: {'Accept':'application/json'}
      });
      if (!response.ok) {
        let detail = '';
        try {
          const payload = await response.json();
          detail = Array.isArray(payload.errors) ? payload.errors.map(e => e.message).join('；') : '';
        } catch (_) { /* use generic message */ }
        throw new Error(detail || `HTTP ${response.status}`);
      }
      form.reset();
      resetFields();
      showStatus('✓ 已送出諮詢資料，團隊將透過您填寫的聯絡方式回覆。', 'success');
    } catch (error) {
      showStatus('資料尚未送出，請稍後重試。' +
        (error?.message ? `（${error.message}）` : ''));
    } finally {
      submit.disabled = false;
      submit.textContent = defaultSubmitText;
    }
  });
})();
