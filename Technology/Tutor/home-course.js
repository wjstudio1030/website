/* WJ STUDIO | HOME-only registration module. Does not affect Tutor.html or existing scripts. */
(() => {
    'use strict';

    const section = document.getElementById('wj-free-course');
    if (!section || section.dataset.initialized === 'true') return;
    section.dataset.initialized = 'true';

    const byId = (id) => section.querySelector('#' + id);
    const pad = (n) => String(n).padStart(2, '0');
    const hoursDisplay = byId('wjfc-hours');
    const minutesDisplay = byId('wjfc-minutes');
    const secondsDisplay = byId('wjfc-seconds');
    const clock = byId('wjfc-clock');

    // UTC+8 Taiwan local clock, even on computers with a different time zone.
    const taiwanTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit',
        second: '2-digit', hourCycle: 'h23'
    });
    let lastShown = '';
    function updateCountdown() {
        const pieces = Object.fromEntries(
            taiwanTime.formatToParts(new Date())
                .filter(part => part.type === 'hour' || part.type === 'minute' || part.type === 'second')
                .map(part => [part.type, Number(part.value)])
        );
        // At 00:00:00 show 23:59:59. At 23:59:59 show 00:00:00.
        const remaining = 86399 - (pieces.hour * 3600 + pieces.minute * 60 + pieces.second);
        const display = [pad(Math.floor(remaining / 3600)),
            pad(Math.floor((remaining % 3600) / 60)), pad(remaining % 60)];
        const rendered = display.join(':');
        if (rendered === lastShown) return;
        lastShown = rendered;
        hoursDisplay.textContent = display[0];
        minutesDisplay.textContent = display[1];
        secondsDisplay.textContent = display[2];
        clock.setAttribute('aria-label', '台灣時間每日循環倒數 ' + rendered);
    }
    updateCountdown();
    setInterval(updateCountdown, 250);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) updateCountdown();
    });

    const dropdown = byId('wjfc-dropdown');
    const toggle = byId('wjfc-interest-trigger');
    const options = byId('wjfc-interest-options');
    const done = byId('wjfc-dropdown-done');
    const summary = byId('wjfc-interest-summary');
    const hiddenInterests = byId('wjfc-interest-values');
    const checkboxItems = Array.from(options.querySelectorAll('input[type="checkbox"]'));
    const terminal = byId('wjfc-terminal-body');
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const emptyTerminal = '[SYSTEM]: Awaiting interest selection to load project diagnostics...';
    let typingTimeout = null;
    let typedVersion = 0;

    function setDropdownOpen(open) {
        options.hidden = !open;
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        dropdown.dataset.open = open ? 'true' : 'false';
    }
    toggle.addEventListener('click', () => setDropdownOpen(options.hidden));
    done.addEventListener('click', () => {
        setDropdownOpen(false);
        toggle.focus();
    });
    document.addEventListener('pointerdown', (event) => {
        if (!dropdown.contains(event.target)) setDropdownOpen(false);
    });
    dropdown.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !options.hidden) {
            event.preventDefault();
            setDropdownOpen(false);
            toggle.focus();
        }
    });

    const diagnostics = {
        '物聯網與智慧互動應用': '[IOT_INTERACTIVE_SYSTEM] 感測器、電子實作與裝置互動；從想法到可操作的實體專題。',
        '遊戲開發': '[GAME_DEVELOPMENT] 遊戲邏輯、關卡規劃、互動程式與原型作品製作。',
        '程式設計與應用': '[PROGRAMMING_APPLICATIONS] 程式基礎、問題拆解、資料處理與應用實作。',
        '互動式網站設計': '[INTERACTIVE_WEBSITE] 網頁畫面、使用者體驗、前後端協作與互動功能。',
        'VR虛擬實境/AR擴增實境': '[VR_AR_EXPERIENCE] 沉浸式體驗、三維互動與情境式原型設計。',
        'AI整合與應用': '[AI_INTEGRATION] AI 工具、模型應用、跨域整合與實際問題解決。',
        '還在探索': '[DISCOVERY_MODE] 從興趣探索開始，用作品體驗找到適合孩子的方向。'
    };

    function writeTerminal(text) {
        typedVersion += 1;
        const version = typedVersion;
        if (typingTimeout !== null) clearTimeout(typingTimeout);
        typingTimeout = null;
        if (reduceMotion || !text || text === emptyTerminal) {
            terminal.textContent = text;
            return;
        }
        terminal.textContent = '';
        let cursor = 0;
        function step() {
            if (version !== typedVersion) return;
            cursor = Math.min(text.length, cursor + 4);
            terminal.textContent = text.slice(0, cursor);
            terminal.scrollTop = terminal.scrollHeight;
            if (cursor < text.length) typingTimeout = setTimeout(step, 16);
            else typingTimeout = null;
        }
        step();
    }

    function updateInterestSelection() {
        const selected = checkboxItems.filter(item => item.checked).map(item => item.value);
        hiddenInterests.value = selected.join('；');
        if (selected.length) {
            summary.textContent = selected.length === 1 ? selected[0] :
                '已選擇 ' + selected.length + ' 個領域：' + selected.join('、');
            toggle.classList.add('wjfc-has-value');
            const lines = [
                '> [INITIALIZING WJ_STUDIO_ANALYZER.exe]...',
                '> [INTEREST PROFILE] ' + selected.join(' / '),
                '> [MODULE DIAGNOSTICS]'
            ];
            selected.forEach((item, index) => lines.push('> ' + pad(index + 1) + ' ' + diagnostics[item]));
            lines.push('> [SYSTEM READY] 已建立初步諮詢方向，可繼續複選。');
            writeTerminal(lines.join('\n'));
        } else {
            summary.textContent = '請選擇感興趣的領域（可複選）';
            toggle.classList.remove('wjfc-has-value');
            writeTerminal(emptyTerminal);
        }
    }
    checkboxItems.forEach(item => item.addEventListener('change', updateInterestSelection));

    const form = byId('wjCourseForm');
    const contactMethod = byId('wjfc-contact-method');
    const contactInfo = byId('wjfc-contact-info');
    const submit = byId('wjfc-submit');
    const status = byId('wjfc-status');
    const defaultSubmit = submit.innerHTML;
    const contactDescriptions = {
        'LINE': { type: 'text', placeholder: '請填寫您的 LINE ID', autocomplete: 'off' },
        '電子郵件': { type: 'email', placeholder: 'example@email.com', autocomplete: 'email' },
        '電話': { type: 'tel', placeholder: '請填寫方便聯絡的電話號碼', autocomplete: 'tel' },
        'Facebook': { type: 'text', placeholder: '請填寫 Facebook 帳號或個人檔案網址', autocomplete: 'off' }
    };
    function updateContactInput() {
        const current = contactDescriptions[contactMethod.value] ||
            { type: 'text', placeholder: '請先選擇上方聯絡方式', autocomplete: 'off' };
        contactInfo.value = '';
        contactInfo.type = current.type;
        contactInfo.placeholder = current.placeholder;
        contactInfo.autocomplete = current.autocomplete;
        contactInfo.inputMode = current.type === 'tel' ? 'tel' : current.type === 'email' ? 'email' : 'text';
    }
    contactMethod.addEventListener('change', updateContactInput);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!form.reportValidity() || submit.disabled) return;
        submit.disabled = true;
        submit.textContent = 'TRANSMITTING DATA... / 資料傳送中...';
        status.textContent = '';
        delete status.dataset.state;
        setDropdownOpen(false);
        try {
            const submission = new FormData(form);
            submission.set('name', byId('wjfc-parent').value.trim());
            if (contactMethod.value === '電子郵件') {
                submission.set('email', contactInfo.value.trim());
            }
            const response = await fetch(form.action, {
                method: 'POST',
                body: submission,
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) {
                let details = '';
                try {
                    const result = await response.json();
                    if (Array.isArray(result.errors)) details = result.errors.map(x => x.message).join('；');
                } catch (_) { /* keep generic error message */ }
                throw new Error(details || '伺服器未接受這筆資料（HTTP ' + response.status + '）');
            }
            form.reset();
            updateInterestSelection();
            updateContactInput();
            status.dataset.state = 'success';
            status.textContent = '✓ 已送出諮詢資料，WJ STUDIO 將透過您提供的聯絡方式回覆。';
        } catch (error) {
            status.dataset.state = 'error';
            status.textContent = '資料尚未送出，請稍後再試。' + (error && error.message ? '（' + error.message + '）' : '');
        } finally {
            submit.disabled = false;
            submit.innerHTML = defaultSubmit;
        }
    });
})();
