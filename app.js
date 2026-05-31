// =========================================
// 全局元件 (每一頁都有的)
// =========================================
const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const navLinks = document.querySelectorAll('.navbar__links');
const logo = document.querySelector('#navbar__logo');

// --- 1. Mobile Menu 邏輯 ---
const mobileMenu = () => {
    if(menu && menuLinks) {
        menu.classList.toggle('is-active');
        menuLinks.classList.toggle('active');
    }
};

if(logo) {
    logo.addEventListener('click', (e) => {
        e.preventDefault(); 
        logo.classList.add('logo-active');
        setTimeout(() => logo.classList.remove('logo-active'), 300);
        for (let i = 0; i < 30; i++) {
            createParticle(e.clientX, e.clientY);
        }
    });
}

if(menu) {
    menu.addEventListener('click', mobileMenu);
}

navLinks.forEach(n => n.addEventListener('click', () => {
    if(menuLinks && menuLinks.classList.contains('active')) mobileMenu();
}));

// --- 2. 滑鼠追蹤邏輯 (還原安全版本，零副作用) ---
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

if(cursor && follower) {
    document.addEventListener('mousemove', (e) => {
        const viewWidth = document.documentElement.clientWidth;
        if (e.clientX >= viewWidth - 5) {
            cursor.style.opacity = '0';
            follower.style.opacity = '0';
        } else {
            // 💡 僅新增：配合開場動畫隱藏滑鼠的防護機制，其餘完全不動
            if (!document.body.classList.contains('hide-custom-cursor')) {
                cursor.style.opacity = '1';
                follower.style.opacity = '1';
            }
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    });

    const animateCursor = () => {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
        follower.style.left = `${cursorX}px`;
        follower.style.top = `${cursorY}px`;
        requestAnimationFrame(animateCursor);
    };
    animateCursor();
}

// --- 3. 滑鼠互動效果 (全局委派優化版 - 整合自定義選單純白機制) ---
if(cursor && follower) {
    window.addEventListener('mouseover', (e) => {
        const target = e.target;
        // 將自定義選單的主按鈕與選項節點（.cyber-dropdown-selected, .cyber-dropdown-list li）全面納入名單
        const interactiveSelector = 'a, button, .services__card, .navbar__toggle, .main__content h1, .main__content h2, #navbar__logo, .button, .close-book, .book-page, .book-page-img, #my-flipbook, .cyber-switch, .cyber-slider, .play-btn, .control-btn, .cyber-dropdown-selected, .cyber-dropdown-list li';
        const activeEl = target.closest(interactiveSelector);

        if (activeEl) {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.3)';
            follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
            follower.style.borderColor = 'transparent';

            if (activeEl.closest('.book-page, .book-page-img, #my-flipbook')) {
                follower.style.background = 'rgba(255, 255, 255, 0.4)'; 
                cursor.style.background = '#000000'; 
            } 
            // 🚀 核心優化：當滑鼠在遊戲區、或是正在自定義下拉選單內挑選領域時，圈圈一律維持白色發光放大！
            else if (activeEl.closest('.game-wrapper, .cyber-dropdown')) {
                follower.style.background = 'rgba(255, 255, 255, 0.4)'; 
                cursor.style.background = '#ffffff'; 
            } else if (activeEl.closest('h2, #navbar__logo, .button, .main__btn, .services__card, .navbar__toggle')) {
                follower.style.background = 'rgba(0, 242, 254, 0.4)'; 
                cursor.style.background = '#00f2fe'; 
            } else {
                follower.style.background = 'rgba(247, 112, 98, 0.3)';
                cursor.style.background = '#ff8177';
            }
        }
    });

    window.addEventListener('mouseout', (e) => {
        const interactiveSelector = 'a, button, .services__card, .navbar__toggle, .main__content h1, .main__content h2, #navbar__logo, .button, .close-book, .book-page, .book-page-img, #my-flipbook, .cyber-switch, .cyber-slider, .play-btn, .control-btn, .cyber-dropdown-selected, .cyber-dropdown-list li';
        if (!e.relatedTarget || !e.relatedTarget.closest(interactiveSelector)) {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            follower.style.transform = 'translate(-50%, -50%) scale(1)';
            follower.style.background = 'transparent';
            
            // 🔒 離開按鍵後，判定如果滑鼠還在遊戲區或選單內，就維持白色邊框；若徹底離開則還原成原本的粉橘色
            if (e.relatedTarget && e.relatedTarget.closest('.game-wrapper, .cyber-dropdown')) {
                follower.style.borderColor = '#ffffff'; 
                cursor.style.background = '#ffffff';
            } else {
                follower.style.borderColor = '#ff8177'; 
                cursor.style.background = '#ff8177';    
            }
        }
    });
}

// --- 4. 捲動顯示動畫 ---
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal, .services__card, .main__content').forEach(el => {
    el.classList.add('reveal'); 
    revealObserver.observe(el);
});

// 粒子特效
function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    document.body.appendChild(particle);

    const size = Math.floor(Math.random() * 10 + 5);
    const destinationX = (Math.random() - 0.5) * 300;
    const destinationY = (Math.random() - 0.5) * 300;
    const rotation = Math.random() * 520;
    const delay = Math.random() * 200;
    const color = Math.random() > 0.5 ? '#ff0844' : '#4837ff';
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.background = color;
    particle.style.boxShadow = `0 0 10px ${color}`;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    const animation = particle.animate([
        { transform: `translate(-50%, -50%) translate(0, 0) rotate(0deg)`, opacity: 1 },
        { transform: `translate(-50%, -50%) translate(${destinationX}px, ${destinationY}px) rotate(${rotation}deg)`, opacity: 0 }
    ], { duration: 1000 + Math.random() * 1000, easing: 'cubic-bezier(0, .9, .57, 1)', delay: delay });

    animation.onfinish = () => { particle.remove(); };
}

// --- 6. 潛行導航欄邏輯 ---
const navbar = document.querySelector('.navbar');
let isScrolled = false;

if(navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            if (!isScrolled) { navbar.classList.add('nav-hidden'); isScrolled = true; }
        } else {
            navbar.classList.remove('nav-hidden'); isScrolled = false;
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isScrolled && e.clientY < 30) { navbar.classList.remove('nav-hidden'); }
    });

    navbar.addEventListener('mouseleave', () => {
        if (isScrolled) { navbar.classList.add('nav-hidden'); }
    });
}

// --- 首頁 JARVIS 影片動畫邏輯 ---
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('gif-overlay');
    if (overlay) {
        const video = overlay.querySelector('video');
        const jarvisText = document.querySelectorAll('.main__content h1, .main__content h2');

        if(video && jarvisText.length > 0) {
            jarvisText.forEach(text => {
                text.addEventListener('click', () => {
                    overlay.classList.add('active');
                    video.currentTime = 0; 
                    video.play();
                    let audio = new Audio('audio/HI_WJ.mp3');
                    audio.play().catch(e => console.log("Audio play prevented", e));
                });
            });

            video.addEventListener('ended', () => {
                overlay.classList.remove('active');
            });
        }
        overlay.addEventListener('click', () => {
            overlay.classList.remove('active');
            if(video) video.pause(); 
        });
    }
});

// --- 7. 捲動條動態亮起 ---
let isScrolling;
window.addEventListener('scroll', () => {
    document.body.classList.add('is-scrolling');
    window.clearTimeout(isScrolling);
    isScrolling = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
    }, 500);
});

// =========================================
// 8. 數位記憶之書邏輯 (Flipbook)
// =========================================
let currentGallery = [];  
let currentPageIndex = 0; 
let isPageAnimating = false; 

const bookOverlay = document.getElementById('book-overlay');
const bookContainer = document.getElementById('flipbook-container');
const bookContent = document.getElementById('my-flipbook');

// 🔒 防護鎖：只在有書本的頁面才綁定點擊事件
if (bookContent) {
    bookContent.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const clickX = e.clientX - rect.left; 
        const bookWidth = rect.width;
        if (clickX < bookWidth / 2) {
            performPageTurn('prev');
        } else {
            performPageTurn('next');
        }
    });
}

if (bookOverlay) {
    bookOverlay.addEventListener('click', (e) => {
        if (e.target === bookOverlay) closeBook();
    });
}

// 翻頁函式
async function openBook(input, totalPages = null) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if(loadingOverlay) {
        const spinner = loadingOverlay.querySelector('.loader-spinner'); 
        if (spinner) {
            const newSpinner = spinner.cloneNode(true);
            spinner.parentNode.replaceChild(newSpinner, spinner);
        }
    }
    
    if (totalPages !== null && typeof input === 'string') {
        currentGallery = [];
        for (let i = 1; i <= totalPages; i++) {
            currentGallery.push(`MyBooks/${input}_p${i}.png`);
        }
    } else {
        currentGallery = Array.isArray(input) ? input : [input];
    }

    const preloadBatch = async (paths) => {
        return Promise.all(paths.map(path => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = path;
                img.onload = () => { if (img.decode) { img.decode().then(resolve).catch(resolve); } else { resolve(); } };
                img.onerror = resolve; 
            });
        }));
    };
    
    if(loadingOverlay) loadingOverlay.style.display = 'flex';
    
    const initialPages = currentGallery.slice(0, 10);
    const remainingPages = currentGallery.slice(10);

    await preloadBatch(initialPages);

    if(loadingOverlay) loadingOverlay.style.display = 'none';
    
    currentPageIndex = 0;
    if(bookOverlay) bookOverlay.style.display = 'flex';
    if(bookContent) bookContent.classList.remove('flipping-next', 'flipping-prev');
    renderBookPage();
    
    if(bookContainer) {
        bookContainer.classList.remove('book-animate');
        void bookContainer.offsetWidth; 
        bookContainer.classList.add('book-animate');
    }

    if (remainingPages.length > 0) {
        preloadBatch(remainingPages);
    }
}

function performPageTurn(direction) {
    if (isPageAnimating || !bookContent) return; 
    isPageAnimating = true;

    const isMobile = window.innerWidth <= 960;
    const step = isMobile ? 1 : 2;
    let targetIndex;
    
    if (direction === 'next') {
        if (currentPageIndex + step >= currentGallery.length) { isPageAnimating = false; return; }
        targetIndex = currentPageIndex + step;
        bookContent.classList.add('flipping-next');
    } else {
        if (currentPageIndex <= 0) { isPageAnimating = false; return; }
        targetIndex = currentPageIndex - step;
        bookContent.classList.add('flipping-prev');
    }

    setTimeout(() => {
        currentPageIndex = targetIndex;
        renderBookPage(); 
        bookContent.classList.remove('flipping-next', 'flipping-prev');
        setTimeout(() => { isPageAnimating = false; }, 350);
    }, 300);
}

function renderBookPage() {
    if(!bookContent) return;
    const isMobile = window.innerWidth <= 960;
    const maxPage = currentGallery.length;

    if (isMobile) {
        const pagePath = currentGallery[currentPageIndex];
        let pageHTML = pagePath ? `<img src="${pagePath}" alt="Memory Page" class="book-page-img">` : `<div class="empty-page-placeholder">// END //</div>`;
        const counterText = `DATA SOURCE: ${currentPageIndex + 1} / ${maxPage}`;
        bookContent.innerHTML = `
            <div class="page-counter">${counterText}</div>
            <div class="book-page mobile-page">${pageHTML}</div>
            <div class="click-hint left-hint">PREV</div>
            <div class="click-hint right-hint">NEXT</div>
        `;
    } else {
        const leftIndex = currentPageIndex;
        const rightIndex = currentPageIndex + 1;
        const leftPath = currentGallery[leftIndex];
        const rightPath = currentGallery[rightIndex];
        
        let leftHTML = leftPath ? `<img src="${leftPath}" alt="Memory Left" class="book-page-img">` : `<div class="empty-page-placeholder">// END //</div>`;
        let rightHTML = rightPath ? `<img src="${rightPath}" alt="Memory Right" class="book-page-img">` : `<div class="empty-page-placeholder"></div>`;
        const counterText = `DATA SOURCE: ${leftIndex + 1}-${Math.min(rightIndex + 1, maxPage)} / ${maxPage}`;

        bookContent.innerHTML = `
            <div class="page-counter">${counterText}</div>
            <div class="book-page page-left">${leftHTML}</div>
            <div class="book-page page-right">${rightHTML}</div>
            <div class="click-hint left-hint">PREV</div>
            <div class="click-hint right-hint">NEXT</div>
        `;
    }
}

function closeBook() {
    if(bookOverlay) bookOverlay.style.display = 'none';
}

window.addEventListener('keydown', (e) => {
    if (bookOverlay && bookOverlay.style.display === 'flex') {
        if (e.key === 'ArrowRight') { performPageTurn('next'); } 
        else if (e.key === 'ArrowLeft') { performPageTurn('prev'); } 
        else if (e.key === 'Escape') { closeBook(); }
    }
});

// =========================================
// 9. Tutor 頁面專屬互動邏輯
// =========================================
const tutorForm = document.getElementById('tutorForm');
const courseSelect = document.getElementById('courseSelect');
const terminalBody = document.getElementById('terminalBody');
const submitBtn = document.getElementById('submitBtn');
const cyberDropdown = document.getElementById('cyberDropdown');
const dropdownSelected = document.getElementById('dropdownSelected');
const dropdownList = document.getElementById('dropdownList');

    if (cyberDropdown && dropdownSelected && dropdownList) {
        // 點擊主框體：展開或收合選單
        dropdownSelected.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            cyberDropdown.classList.toggle('open');
        });

        // 監聽選項清單點擊
        dropdownList.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                const selectedValue = this.getAttribute('data-value');
                const selectedText = this.innerText;

                // 1. 將選中的文字塞回顯示主視窗，並掛上 .has-value 發光白框類別
                dropdownSelected.innerText = selectedText;
                dropdownSelected.classList.add('has-value');

                // 2. 將值填入隱藏的 input 欄位以利 Formspree 讀取
                courseSelect.value = selectedValue;

                // 3. 收合面板
                cyberDropdown.classList.remove('open');

                // 4. 重要核心：手動向隱藏欄位發送 change 訊號，完美喚醒下方的 JARVIS 終端機打字特效！
                courseSelect.dispatchEvent(new Event('change'));
            });
        });

        // 點擊網頁其他任何地方時，自動收合下拉選單
        document.addEventListener('click', () => {
            cyberDropdown.classList.remove('open');
        });
    }


// 🔒 防護鎖：只在家教頁面才執行終端機與表單邏輯
if (tutorForm && courseSelect && terminalBody) {
    const diagnostics = {
        ece: "> [LOADING ECE_CORE_SYS]...\n> 載入核心模組：基本電學、電子學。\n> 診斷分析：鎖定統測資電類命題核心，微處理機與數位邏輯波形深度拆解。系統已準備好為您重構邏輯脈絡...",
        unity: "> [INITIALIZING UNITY_ENGINE_AI]...\n> 載入虛擬實境與互動感測器 API...\n> 偵測到 AI 整合模組。診斷分析：結合實體感測硬體與智慧模型，本課程將啟動高階遊戲專案建構製程...",
        'web-app': "> [DEPLOYING FULL_STACK_DEV]...\n> 正在載入 DOM 渲染引擎與跨平台外掛...\n> 診斷分析：從靜態網頁美學重構（CSS Flexbox/Grid 深度優化）到跨平台 APP 封裝。系統架構已就緒...",
        custom: "> [Custom Module Setup]...\n> 啟動 WJ STUDIO 客製化排程器...\n> 診斷分析：專屬學習進度雷達已開啟。涵蓋客製化宣傳圖製程指導與專題開發除錯。期待與您共同創造..."
    };

    let typingTimer;

    function typeWriter(text, i) {
        if (i < text.length) {
            if (text.substring(i, i + 1) === "\n") {
                terminalBody.innerHTML += "<br>";
            } else {
                terminalBody.innerHTML += text.charAt(i);
            }
            terminalBody.scrollTop = terminalBody.scrollHeight;
            typingTimer = setTimeout(() => {
                typeWriter(text, i + 1);
            }, 15);
        }
    }

    courseSelect.addEventListener('change', function () {
        clearTimeout(typingTimer);
        terminalBody.innerHTML = "";
        const selected = this.value;
        if (diagnostics[selected]) {
            typeWriter(diagnostics[selected], 0);
        }
    });

    tutorForm.addEventListener('submit', function (e) {
        if (this.action.includes('your_id')) {
            e.preventDefault(); 
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> TRANSMITTING DATA... / 核心資料傳輸中...`;
            submitBtn.style.opacity = '0.8';
            submitBtn.style.pointerEvents = 'none';

            setTimeout(() => {
                alert('🚀 [SYSTEM NOTIFICATION]\n\nDATA TRANSMISSION SUCCESSFUL!\n資料已成功寫入虛擬主機！');
                submitBtn.innerHTML = originalText;
                submitBtn.style.opacity = '1';
                submitBtn.style.pointerEvents = 'auto';
                tutorForm.reset();
                terminalBody.innerHTML = "[SYSTEM]: Awaiting course selection to load syllabus diagnostics...";
            }, 1200);
        }
    });
}

