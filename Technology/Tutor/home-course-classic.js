/* WJ STUDIO | Restore original-style HOME form selectors and white pointer.
   The original Tutor.html, Tutor JS and HOME submission handler are untouched. */
(() => {
    'use strict';
    const section = document.getElementById('wj-free-course');
    if (!section || section.dataset.classicUiReady === 'true') return;
    section.dataset.classicUiReady = 'true';

    const selectNames = {
        'wjfc-grade': '孩子目前的年級',
        'wjfc-goal': '目前最希望解決的事情',
        'wjfc-contact-method': '方便聯絡的方式'
    };
    const status = section.querySelector('#wjfc-status');
    const instances = [];
    const closeAll = (except) => {
        instances.forEach(item => {
            if (except && item === except) return;
            item.list.hidden = true;
            item.trigger.setAttribute('aria-expanded', 'false');
        });
        if (except) {
            const interests = section.querySelector('#wjfc-dropdown');
            const interestList = section.querySelector('#wjfc-interest-options');
            const interestTrigger = section.querySelector('#wjfc-interest-trigger');
            if (interests && interestList && !interests.contains(except.trigger)) {
                interestList.hidden = true;
                interestTrigger?.setAttribute('aria-expanded', 'false');
                interests.dataset.open = 'false';
            }
        }
    };

    Object.keys(selectNames).forEach(id => {
        const native = document.getElementById(id);
        if (!native || native.dataset.customized === 'true') return;
        const field = native.closest('.wjfc-field');
        if (!field) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'wjfc-smart-select';
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.id = id + '-visual';
        trigger.className = 'wjfc-smart-trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        const title = document.createElement('span');
        title.className = 'wjfc-smart-value';
        title.textContent = native.options[0]?.textContent || '請選擇';
        const chevron = document.createElement('span');
        chevron.className = 'wjfc-smart-chevron';
        chevron.setAttribute('aria-hidden','true');
        trigger.append(title, chevron);

        const list = document.createElement('ul');
        list.className = 'wjfc-smart-list';
        list.id = id + '-options';
        list.setAttribute('role','listbox');
        list.setAttribute('aria-label',selectNames[id]);
        list.hidden = true;
        trigger.setAttribute('aria-controls',list.id);
        const entries = [];
        Array.from(native.options).filter(opt => opt.value && !opt.disabled).forEach(opt => {
            const li = document.createElement('li');
            li.setAttribute('role','none');
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'wjfc-smart-option';
            button.setAttribute('role','option');
            button.setAttribute('aria-selected','false');
            button.textContent = opt.textContent;
            li.appendChild(button);
            list.appendChild(li);
            entries.push({opt, button});
            button.addEventListener('click', () => {
                native.value = opt.value;
                title.textContent = opt.textContent;
                trigger.classList.add('wjfc-has-value');
                entries.forEach(e => e.button.setAttribute('aria-selected',
                    String(e.opt.value === opt.value)));
                native.dispatchEvent(new Event('change',{bubbles:true}));
                list.hidden = true;
                trigger.setAttribute('aria-expanded','false');
                trigger.focus();
                if (status && status.dataset.state !== 'success') status.textContent = '';
            });
            button.addEventListener('keydown', e => {
                const i = entries.findIndex(x => x.button === button);
                if (e.key === 'Escape') {
                    e.preventDefault();
                    list.hidden = true;
                    trigger.setAttribute('aria-expanded','false');
                    trigger.focus();
                } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    entries[(i + (e.key === 'ArrowDown' ? 1 : entries.length - 1)) % entries.length].button.focus();
                } else if (e.key === 'Home' || e.key === 'End') {
                    e.preventDefault();
                    entries[e.key === 'Home' ? 0 : entries.length - 1].button.focus();
                }
            });
        });

        // Keep original select in the form for required validation,
        // FormData field name, and the original change listeners.
        native.parentNode.insertBefore(wrapper, native);
        wrapper.append(native, trigger, list);
        native.classList.add('wjfc-native-proxy');
        native.dataset.customized = 'true';
        native.tabIndex = -1;
        native.setAttribute('aria-hidden','true');
        const label = field.querySelector('label[for="' + id + '"]');
        if (label) label.htmlFor = trigger.id;
        trigger.setAttribute('aria-label', selectNames[id]);

        const instance = {native,trigger,list};
        instances.push(instance);
        function toggle(open) {
            closeAll(instance);
            list.hidden = !open;
            trigger.setAttribute('aria-expanded', String(open));
        }
        trigger.addEventListener('click', () => toggle(list.hidden));
        trigger.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                toggle(true);
                entries[0]?.button.focus();
            } else if (e.key === 'Escape') {
                toggle(false);
            }
        });
        native.addEventListener('invalid', e => {
            e.preventDefault();
            closeAll();
            trigger.focus();
            if (status) {
                status.dataset.state = 'error';
                status.textContent = '請先選擇「' + selectNames[id] + '」。';
            }
        });
        native.addEventListener('change', () => {
            const chosen = entries.find(e => e.opt.value === native.value);
            if (chosen) {
                title.textContent = chosen.opt.textContent;
                trigger.classList.add('wjfc-has-value');
            } else {
                title.textContent = native.options[0]?.textContent || '請選擇';
                trigger.classList.remove('wjfc-has-value');
            }
        });
    });

    document.addEventListener('pointerdown', e => {
        if (!e.target.closest('.wjfc-smart-select')) closeAll();
    });
    section.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeAll();
    });

    // Match the original Tutor dropdown's luminous white custom cursor.
    const hoverCursor = window.matchMedia &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (hoverCursor) {
        const interactive = 'button, input, select, textarea, label, .wjfc-choice,' +
            ' .wjfc-dropdown-options, .wjfc-smart-list, .wjfc-smart-select,' +
            ' .wjfc-dropdown-toggle';
        const body = document.body;
        document.addEventListener('pointermove', e => {
            const target = e.target instanceof Element ? e.target : null;
            const white = Boolean(target && section.contains(target) && target.closest(interactive));
            body.classList.toggle('wjfc-cursor-white', white);
        }, {passive:true});
        section.addEventListener('pointerleave', () => body.classList.remove('wjfc-cursor-white'));
        window.addEventListener('blur', () => body.classList.remove('wjfc-cursor-white'));
        window.addEventListener('pointercancel', () => body.classList.remove('wjfc-cursor-white'));
    }
})();
