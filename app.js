const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const navLinks = document.querySelectorAll('.navbar__links');
// --- 5. Logo 點擊粒子特效 (數位煙火) ---
const logo = document.querySelector('#navbar__logo');


// --- 1. Mobile Menu 邏輯 ---
const mobileMenu = () => {
    menu.classList.toggle('is-active');
    menuLinks.classList.toggle('active');
};

// --- 6. 潛行導航欄邏輯 ---
const navbar = document.querySelector('.navbar');
let isScrolled = false;

// 新增以下這段監聽器
logo.addEventListener('click', (e) => {
    // 1. 核心重點：阻止 <a> 標籤的預設行為（即：跳轉/重載網頁）
    e.preventDefault(); 

    // 2. 觸發點擊時的震動效果 (若你有寫 CSS logo-active 類別)
    logo.classList.add('logo-active');
    setTimeout(() => logo.classList.remove('logo-active'), 300);

    // 3. 呼叫你寫好的煙火函數
    // 使用 e.clientX/Y 確保煙火從滑鼠點擊的位置噴發
    for (let i = 0; i < 30; i++) {
        createParticle(e.clientX, e.clientY);
    }
});

menu.addEventListener('click', mobileMenu);

// 點擊選單連結後自動關閉選單 (優化體驗)
navLinks.forEach(n => n.addEventListener('click', () => {
    if(menuLinks.classList.contains('active')) mobileMenu();
}));


// --- 2. 滑鼠追蹤邏輯 (深度修正版) ---
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

// --- 2. 滑鼠追蹤邏輯 (自動隱藏版) ---
document.addEventListener('mousemove', (e) => {
    // 取得不含捲動條的可視寬度
    const viewWidth = document.documentElement.clientWidth;
    
    // 判斷滑鼠是否在內容區內
    // 如果 e.clientX 超過 viewWidth，代表滑鼠正在捲動條上方
    if (e.clientX >= viewWidth - 5) { // 減 5 像素作為緩衝，讓消失更滑順
        cursor.style.opacity = '0';
        follower.style.opacity = '0';
    } else {
        cursor.style.opacity = '1';
        follower.style.opacity = '1';
        
        // 原有的位置更新邏輯
        mouseX = e.clientX;
        mouseY = e.clientY;
    }
});

// 使用動畫幀確保平滑度
const animateCursor = () => {
    // 這裡是平滑跟隨的關鍵公式：當前位置 + (目標位置 - 當前位置) * 延遲係數
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;

    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
    
    follower.style.left = `${cursorX}px`;
    follower.style.top = `${cursorY}px`;

    requestAnimationFrame(animateCursor);
};
animateCursor();


// --- 3. 滑鼠互動效果 (全局委派優化版 - 解決嵌套元件 Bug) ---

// 🚀 使用 window 監聽，確保滑鼠移動時即時校準顏色
window.addEventListener('mouseover', (e) => {
    const target = e.target;

    // 1. 定義所有需要互動的元件清單
    const interactiveSelector = 'a, button, .services__card, .navbar__toggle, .main__content h1, .main__content h2, #navbar__logo, .button, .close-book, .book-page, .book-page-img, #my-flipbook';
    
    // 偵測滑鼠是否處於互動元件內 (包含其子元件)
    const activeEl = target.closest(interactiveSelector);

    if (activeEl) {
        // 放大效果：模擬系統聚焦感
        cursor.style.transform = 'translate(-50%, -50%) scale(1.3)';
        follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
        follower.style.borderColor = 'transparent';

        // --- 核心顏色判定邏輯 ---

        // 🚀 優先判定：白色範圍 (書本相關區塊)
        // 只要滑鼠在這些元件內，follower 永遠保持白色
        if (activeEl.closest('.book-page, .book-page-img, #my-flipbook')) {
            follower.style.background = 'rgba(255, 255, 255, 0.4)'; 
            // 💡 加分題：讓中間紅點也變科技藍，更有層次感
            cursor.style.background = '#000000'; 
        } 
        
        // 🚀 其次判定：科技藍範圍 (系統導航與操作元件)
        else if (
            activeEl.closest('h2, #navbar__logo, .button, .main__btn, .services__card, .navbar__toggle')
        ) {
            follower.style.background = 'rgba(0, 242, 254, 0.4)'; 
            cursor.style.background = '#00f2fe'; 
        } 

        // 🚀 最後判定：預設粉色 (一般連結)
        else {
            follower.style.background = 'rgba(247, 112, 98, 0.3)';
            cursor.style.background = '#ff8177';
        }
    }
});

// 🚀 重置邏輯：當滑鼠徹底離開互動區域時
window.addEventListener('mouseout', (e) => {
    const interactiveSelector = 'a, button, .services__card, .navbar__toggle, .main__content h1, .main__content h2, #navbar__logo, .button, .close-book, .book-page, .book-page-img, #my-flipbook';
    
    // 檢查下一個移入的目標 (relatedTarget) 是否還在互動區域內
    if (!e.relatedTarget || !e.relatedTarget.closest(interactiveSelector)) {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        follower.style.transform = 'translate(-50%, -50%) scale(1)';
        follower.style.background = 'transparent';
        follower.style.borderColor = '#ff8177'; // 恢復粉橘色邊框
        cursor.style.background = '#ff8177';    // 恢復紅點
    }
});

// --- 4. 捲動顯示動畫 (Intersection Observer) ---
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // 如果只需要進場動畫一次，可以取消監測
            // revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal, .services__card, .main__content').forEach(el => {
    el.classList.add('reveal'); // 確保都有動畫類別
    revealObserver.observe(el);
});

document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    follower.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    follower.style.opacity = '1';
});

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    document.body.appendChild(particle);

    // 隨機設定粒子的噴發方向與速度 (利用你擅長的物理運動概念)
    const size = Math.floor(Math.random() * 10 + 5);
    const destinationX = (Math.random() - 0.5) * 300;
    const destinationY = (Math.random() - 0.5) * 300;
    const rotation = Math.random() * 520;
    const delay = Math.random() * 200;

    // 設定初始顏色 (配合你網站的漸層色)
    const color = Math.random() > 0.5 ? '#ff0844' : '#4837ff';
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.background = color;
    particle.style.boxShadow = `0 0 10px ${color}`;
    
    // 定位到點擊處
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    // 啟動動畫
    const animation = particle.animate([
        {
            transform: `translate(-50%, -50%) translate(0, 0) rotate(0deg)`,
            opacity: 1
        },
        {
            transform: `translate(-50%, -50%) translate(${destinationX}px, ${destinationY}px) rotate(${rotation}deg)`,
            opacity: 0
        }
    ], {
        duration: 1000 + Math.random() * 1000,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        delay: delay
    });

    // 動畫結束後移除元素，節省記憶體
    animation.onfinish = () => {
        particle.remove();
    };
}

window.addEventListener('scroll', () => {
    // 當捲動超過 100px 時，進入隱藏模式
    if (window.scrollY > 100) {
        if (!isScrolled) {
            navbar.classList.add('nav-hidden');
            isScrolled = true;
        }
    } else {
        // 回到頁面頂部時，自動顯現
        navbar.classList.remove('nav-hidden');
        isScrolled = false;
    }
});

// 滑鼠靠近頂部或進入 Navbar 時顯現
document.addEventListener('mousemove', (e) => {
    if (isScrolled) {
        // 如果滑鼠座標在螢幕頂部 30px 以內，或是導航欄正在顯示中且滑鼠在上面
        if (e.clientY < 30) {
            navbar.classList.remove('nav-hidden');
        }
    }
});


// 等待網頁載入完成
document.addEventListener('DOMContentLoaded', () => {
    const jarvisText = document.querySelectorAll('.main__content h1, .main__content h2');
    const overlay = document.getElementById('gif-overlay');

    // 1. 點擊文字顯示 GIF
    jarvisText.forEach(text => {
        text.addEventListener('click', () => {
            overlay.classList.add('active');
            
            // 可選：播放音效 (如果你有 jarvis_voice.mp3)
            let audio = new Audio('audio/HI_WJ.mp3');
            audio.play();

            // 3秒後自動關閉（或者是演完 GIF 的時間）
            setTimeout(() => {
                overlay.classList.remove('active');
            }, 7500);
        });
    });

    // 2. 點擊 GIF 任何地方也可以手動關閉
    overlay.addEventListener('click', () => {
        overlay.classList.remove('active');
    });
});

// --- 3. 滑鼠互動效果 ---
// 在這裡加入 .main__content h1 和 .main__content h2




// 當滑鼠離開 Navbar 區域後，如果還是在捲動狀態，就把它藏回去
navbar.addEventListener('mouseleave', () => {
    if (isScrolled) {
        navbar.classList.add('nav-hidden');
    }
});


// --- 讓指標也支援手機觸控 ---
document.addEventListener('touchmove', (e) => {
    // 取得第一根手指的座標
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
}, { passive: true });

// 當手指離開螢幕時，隱藏指標 (選配)
document.addEventListener('touchend', () => {
    cursor.style.opacity = '0';
    follower.style.opacity = '0';
});

// 當手指觸碰螢幕時，顯示指標
document.addEventListener('touchstart', (e) => {
    cursor.style.opacity = '1';
    follower.style.opacity = '1';
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
}, { passive: true });


// --- 7. 捲動條動態亮起邏輯 ---
let isScrolling;

window.addEventListener('scroll', () => {
    // 捲動時，為 body 加上「正在捲動」的標籤
    document.body.classList.add('is-scrolling');

    // 清除定時器，確保只有停止滾動後才會移除標籤
    window.clearTimeout(isScrolling);

    // 0.5 秒沒滾動後，能量感消失
    isScrolling = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
    }, 500);
});


// --- 8. 數位記憶之書：3D 物理翻頁系統 (簡化路徑版) ---

let currentGallery = [];  
let currentPageIndex = 0; 
let isPageAnimating = false; // 🚀 防止動畫中重複點擊

const bookOverlay = document.getElementById('book-overlay');
const bookContainer = document.getElementById('flipbook-container');
const bookContent = document.getElementById('my-flipbook');

/**
 * 🚀 升級版：開啟書本並初始化頁面
 * @param {string|Array} input - 檔案前綴 (如 'topics') 或 完整路徑陣列
 * @param {number} totalPages - (選填) 總頁數，若傳入則自動生成路徑
 */
/**
 * 🚀 升級版：開啟書本、生成路徑並預載入所有圖片
 */
/**
 * 🚀 專業級預載入版本：開啟書本
 */
/**
 * 🚀 WJ STUDIO 終極版：全量預載入 + Loading 狀態
 */
async function openBook(input, totalPages = null) {
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // 1. 生成路徑邏輯
    if (totalPages !== null && typeof input === 'string') {
        currentGallery = [];
        for (let i = 1; i <= totalPages; i++) {
            currentGallery.push(`MyBooks/${input}_p${i}.png`);
        }
    } else {
        currentGallery = Array.isArray(input) ? input : [input];
    }

    // --- 🚀 啟動全量預載入 ---
    // 顯示「加載中」
    loadingOverlay.style.display = 'flex';
    console.log(`WJ STUDIO: 開始預載全數 ${currentGallery.length} 張圖片...`);

    try {
        // 使用 Promise.all 等待「所有」圖片載入完成
        await Promise.all(currentGallery.map(path => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = path;
                img.onload = () => {
                    // 使用 decode() 確保圖片已經被瀏覽器解析到記憶體，翻頁才不卡
                    if (img.decode) {
                        img.decode().then(resolve).catch(resolve);
                    } else {
                        resolve();
                    }
                };
                img.onerror = resolve; // 即使某張圖掉圖也不要卡死程式
            });
        }));
    } catch (e) {
        console.error("預載入過程發生錯誤", e);
    }

    // 載入完成，關閉 Loading 畫面
    loadingOverlay.style.display = 'none';
    // -----------------------

    currentPageIndex = 0;
    bookOverlay.style.display = 'flex';
    
    bookContent.classList.remove('flipping-next', 'flipping-prev');
    renderBookPage();
    
    // 執行 3D 出場動畫
    bookContainer.classList.remove('book-animate');
    void bookContainer.offsetWidth; 
    bookContainer.classList.add('book-animate');
}
/**
 * 核心：執行 3D 翻頁動作 (0.6s 動畫)
 */
function performPageTurn(direction) {
    if (isPageAnimating) return; 
    isPageAnimating = true;

    let targetIndex;
    if (direction === 'next') {
        if (currentPageIndex + 2 >= currentGallery.length) {
            isPageAnimating = false; return;
        }
        targetIndex = currentPageIndex + 2;
        bookContent.classList.add('flipping-next');
    } else {
        if (currentPageIndex <= 0) {
            isPageAnimating = false; return;
        }
        targetIndex = currentPageIndex - 2;
        bookContent.classList.add('flipping-prev');
    }

    // 在動畫中途 (300ms) 切換內容，達到流暢翻頁感
    setTimeout(() => {
        currentPageIndex = targetIndex;
        renderBookPage();

        bookContent.classList.remove('flipping-next', 'flipping-prev');
        
        setTimeout(() => {
            isPageAnimating = false;
        }, 350);
    }, 300);
}

/**
 * 渲染雙頁內容 (白底黑字風格)
 */
function renderBookPage() {
    const leftIndex = currentPageIndex;
    const rightIndex = currentPageIndex + 1;
    
    const leftPath = currentGallery[leftIndex];
    const rightPath = currentGallery[rightIndex];
    
    let leftHTML = leftPath 
        ? `<img src="${leftPath}" alt="Memory Left" class="book-page-img">` 
        : `<div class="empty-page-placeholder">// END //</div>`;

    let rightHTML = rightPath 
        ? `<img src="${rightPath}" alt="Memory Right" class="book-page-img">` 
        : `<div class="empty-page-placeholder"></div>`;

    const maxPage = currentGallery.length;
    // 頁碼顯示：例如 1-2 / 4
    const counterText = `DATA SOURCE: ${leftIndex + 1}-${Math.min(rightIndex + 1, maxPage)} / ${maxPage}`;

    bookContent.innerHTML = `
        <div class="page-counter">${counterText}</div>
        <div class="book-page page-left">${leftHTML}</div>
        <div class="book-page page-right">${rightHTML}</div>
        <div class="click-hint left-hint">PREV</div>
        <div class="click-hint right-hint">NEXT</div>
    `;
}

/**
 * 點擊事件：判定左右半邊觸發翻頁
 */
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

/**
 * 關閉書本
 */
function closeBook() {
    bookOverlay.style.display = 'none';
}

bookOverlay.addEventListener('click', (e) => {
    if (e.target === bookOverlay) closeBook();
});

/**
 * 🚀 鍵盤控制擴充：使用左右方向鍵翻頁
 */
window.addEventListener('keydown', (e) => {
    // 只有在電子書視窗開啟時，按鍵才有效
    if (bookOverlay.style.display === 'flex') {
        
        if (e.key === 'ArrowRight') {
            // 按下 → 往後翻
            performPageTurn('next');
        } 
        else if (e.key === 'ArrowLeft') {
            // 按下 ← 往前翻
            performPageTurn('prev');
        } 
        else if (e.key === 'Escape') {
            // 按下 Esc 直接關閉書本，這也是很貼心的設計
            closeBook();
        }
    }
});
