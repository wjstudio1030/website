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
/*  🌟 將此區塊全部註解或刪除
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
*/

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
// 進入網站 3 秒 + 下滑觸發：3方向氣流 ➔ 0.5s 極速微霧接班引擎
// =========================================
let isIntroTimeReady = false;
let hasIntroTriggered = false;
const introOverlay = document.getElementById('intro-animation-overlay');
const smokeCanvas = document.getElementById('smokeCanvas');

if (introOverlay && smokeCanvas) {
    setTimeout(() => {
        isIntroTimeReady = true;
        checkIntroTrigger();
    }, 3000);

    window.addEventListener('scroll', () => {
        checkIntroTrigger();
    });
}

function checkIntroTrigger() {
    if (window.innerWidth > 960 && isIntroTimeReady && !hasIntroTriggered) {
        if (window.scrollY > 50) { 
            hasIntroTriggered = true;
            introOverlay.classList.add('intro-active');
            console.log("🚀 [SYSTEM]: True Aerodynamic Stream -> Gentle Mist Engine Triggered!");
            
            startVolumetricSmokeEngine();
        }
    }
}

// 🌟 最終完美版：氣流與輕盈薄霧渲染引擎
function startVolumetricSmokeEngine() {
    const ctx = smokeCanvas.getContext('2d');
    let width = smokeCanvas.width = window.innerWidth;
    let height = smokeCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = smokeCanvas.width = window.innerWidth;
        height = smokeCanvas.height = window.innerHeight;
    });

    const particles = [];
    let isGentleCloudPhase = false;

    // 🌟 0.5 秒極速無縫接班：讓「三方向氣流」衝刺 500ms 後，立即平滑過渡成「淡淡微霧」
    setTimeout(() => {
        isGentleCloudPhase = true;
        console.log("🚀 [SYSTEM]: 0.5s Mark - Streams Rapidly Merging into Gentle Mist!");
        // 溫和地補入 30 個淡淡微霧粒子，維持最後背景輕盈優雅的質感
        for (let i = 0; i < 30; i++) {
            particles.push(new SmokeParticle('cloud', true));
        }
    }, 500);

    class SmokeParticle {
        constructor(type = 'stream', isRespawnOrStage2 = false) {
            this.type = type;
            this.reset(isRespawnOrStage2);
        }

        reset(isRespawnOrStage2 = false) {
            this.angle = Math.random() * Math.PI * 2; 
            this.spinSpeed = (Math.random() - 0.5) * 0.025;

            // ----------------------------------------------------
            // 階段二 (0.5 秒後)：維持最後「微微淡淡、均勻遍布」的優雅薄霧
            // ----------------------------------------------------
            if (this.type === 'cloud') {
                this.x = isRespawnOrStage2 ? Math.random() * width : -200;
                this.y = Math.random() * height;
                this.radius = 180 + Math.random() * 220; 
                this.growthRate = 0.3 + Math.random() * 0.5; // 平緩膨脹
                this.vx = 1.2 + Math.random() * 1.8; // 輕盈平穩向右飄
                this.vy = (Math.random() - 0.5) * 0.8;
                this.alpha = 0;
                // 關鍵透明度：微薄柔和，維持質感絕不遮蔽背景
                this.maxAlpha = 0.04 + Math.random() * 0.04; 
                this.fadeIn = true;
                return;
            }

            // ----------------------------------------------------
            // 階段一 (0 ~ 0.5 秒)：極速銳利的「三方向獨立氣流」
            // ----------------------------------------------------
            const nozzle = Math.floor(Math.random() * 3);
            
            // 🌟 100% 鎖定在螢幕最左邊界外 (-350px ~ -60px) 待命，保證每一條氣流都從最左邊完整吹入！
            this.x = -(60 + Math.random() * 290); 
            
            if (nozzle === 0) {
                // 1. 左上氣流：往右下俯衝
                this.y = Math.random() * (height * 0.22); 
                this.vx = 8 + Math.random() * 4;  
                this.vy = 3 + Math.random() * 3;   
            } else if (nozzle === 1) {
                // 2. 正左氣流：橫掃中央
                this.y = (height * 0.38) + Math.random() * (height * 0.24); 
                this.vx = 9 + Math.random() * 4.5;  
                this.vy = (Math.random() - 0.5) * 1.5;
            } else {
                // 3. 左下氣流：往右上升騰
                this.y = (height * 0.78) + Math.random() * (height * 0.22); 
                this.vx = 8 + Math.random() * 4;  
                this.vy = -(3 + Math.random() * 3); 
            }

            this.radius = 35 + Math.random() * 55; 
            // 🌟 依照你的最新優化設定：收斂擴散速度，保持銳利迷人的氣流線條感！
            this.growthRate = 2 + Math.random() * 0.5; 
            this.alpha = 0;
            this.maxAlpha = 0.06 + Math.random() * 0.06; 
            this.fadeIn = true;
        }

        update() {
            this.x += this.vx;
            
            // 空氣力學：S型正弦波微捲曲
            this.angle += this.spinSpeed;
            this.y += this.vy + Math.sin(this.angle) * 1.5;
            
            this.radius += this.growthRate;
            if (this.radius > 300) this.growthRate = 0.2;

            if (this.fadeIn) {
                this.alpha += 0.012;
                if (this.alpha >= this.maxAlpha) this.fadeIn = false;
            }

            // 飄出右側或上下邊界後重置
            if (this.x - this.radius > width || this.y - this.radius > height || this.y + this.radius < 0) {
                // 🌟 0.5 秒時間一到，飛出去的氣流噴線會順滑轉身，化為淡淡的巡航薄霧
                if (isGentleCloudPhase && this.type === 'stream') {
                    this.type = 'cloud';
                }
                this.reset(true);
            }
        }

        draw() {
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            grad.addColorStop(0, `rgba(255, 255, 255, ${this.alpha})`);
            grad.addColorStop(0.5, `rgba(255, 255, 255, ${this.alpha * 0.4})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.beginPath();
            ctx.fillStyle = grad;
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 初始化：建立 120 個三方向氣流噴線粒子（全鎖定在最左側畫面外）
    for (let i = 0; i < 120; i++) {
        particles.push(new SmokeParticle('stream', false));
    }

    function render() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(render);
    }

    render();
}

// =========================================
// TEDx 舞台：終極防彈版大結局與退場引擎
// =========================================
const presenterImg = document.getElementById('stage-presenter');
const stageVideo = document.getElementById('stage-video');
const staticAudience = document.getElementById('stage-audience');
const clapGif = document.getElementById('stage-clap');
const streamersGif = document.getElementById('stage-streamers');

const poseImages = {};
let presenterInterval = null;
let isFinaleTriggered = false; // 大結局防護鎖
let isSequenceQueued = false;  // 🌟 新增：排程防護鎖 (徹底消滅滾輪滑動造成的加速亂跳 Bug)
let smokeAnimationId = null;   

const speechSequence = [
    1, 2, 3, 4, 5, 4, 3, 4, 5, 6, 7, 6, 7, 6, 5, 6, 7, 8, 7, 8, 7, 6, 7, 8, 7, 8
];

if (presenterImg) {
    for (let i = 1; i <= 9; i++) {
        const img = new Image();
        img.src = `Web_Animation/WJ_Pose${i}.svg`;
        poseImages[i] = img;
    }
}

// 🌟 監聽介紹動畫觸發 (加入雙重防護與劇院鎖屏)
const originalCheckIntroTrigger = typeof checkIntroTrigger === 'function' ? checkIntroTrigger : null;
if (originalCheckIntroTrigger) {
    checkIntroTrigger = function() {
        originalCheckIntroTrigger();
        
        // 🌟 嚴格判定：只有在觸發過、且「從未排程過 (`!isSequenceQueued`)」的情況下才執行一次！
        if (hasIntroTriggered && !isSequenceQueued && !presenterInterval && !isFinaleTriggered) {
            isSequenceQueued = true; // 立刻上鎖！之後滾輪怎麼滑都無法再闖入！
            console.log("🚀 [SYSTEM]: Presenter & Video sequence queued safely...");
            
            // 🌟 劇院鎖屏啟動：暫時停止網頁背景捲動，防止放映時畫面跑位
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                startVideoAndPresenterSequence();
            }, 3600);
        }
    };
}

function startVideoAndPresenterSequence() {
    console.log("🚀 [SYSTEM]: 100% Faded In! Starting Video Playback & Speech Sequence!");
    
    if (presenterImg) {
        let currentStep = 0;
        const frameSpeed = 200; 

        // 確保沒有舊的定時器在前行
        if (presenterInterval) clearInterval(presenterInterval);

        presenterInterval = setInterval(() => {
            const poseNumber = speechSequence[currentStep];
            presenterImg.src = `Web_Animation/WJ_Pose${poseNumber}.svg`;
            
            currentStep++;
            if (currentStep >= speechSequence.length) {
                currentStep = 0; 
            }
        }, frameSpeed);
    }

    if (stageVideo) {
        stageVideo.currentTime = 0;
        stageVideo.play().catch(e => console.log("Video play prevented:", e));
        
        stageVideo.ontimeupdate = () => {
            if (stageVideo.duration > 0 && (stageVideo.duration - stageVideo.currentTime <= 0.6)) {
                triggerGrandFinaleSequence();
            }
        };

        stageVideo.onended = () => {
            triggerGrandFinaleSequence();
        };
    }
}

function triggerGrandFinaleSequence() {
    if (isFinaleTriggered) return; 
    isFinaleTriggered = true;
    console.log("🎉 [SYSTEM]: Triggering Grand Finale Sequence with GIFs!");

    if (presenterInterval) {
        clearInterval(presenterInterval);
        presenterInterval = null;
    }
    if (presenterImg) {
        presenterImg.src = 'Web_Animation/WJ_Pose9.svg';
    }

    if (staticAudience) {
        staticAudience.classList.add('layer-hidden');
    }
    if (clapGif) {
        const clapSrc = clapGif.getAttribute('data-src');
        clapGif.src = `${clapSrc}?t=${new Date().getTime()}`;
        clapGif.classList.remove('layer-hidden');
        clapGif.classList.add('layer-visible');
    }

    setTimeout(() => {
        if (streamersGif) {
            const streamersSrc = streamersGif.getAttribute('data-src');
            streamersGif.src = `${streamersSrc}?t=${new Date().getTime()}`;
            streamersGif.classList.remove('layer-hidden');
            streamersGif.classList.add('layer-visible');

            setTimeout(() => {
                endIntroAnimation();
            }, 3000);
        }
    }, 500);
}

// 🌟 終極退場系統：淡出畫面、停止引擎並解鎖網頁捲動
function endIntroAnimation() {
    console.log("🎬 [SYSTEM]: 3s Streamers completed! Fading out entire intro stage...");
    const introOverlay = document.getElementById('intro-animation-overlay');
    
    if (introOverlay) {
        introOverlay.classList.remove('intro-active');
        
        // 🌟 劇院解鎖：瞬間恢復網頁滾動條與點擊權限，使用者立刻能順暢下滑瀏覽！
        document.body.style.overflow = '';
        
        setTimeout(() => {
            if (smokeAnimationId) {
                cancelAnimationFrame(smokeAnimationId);
                smokeAnimationId = null;
            }
            if (stageVideo) stageVideo.pause();
            introOverlay.style.display = 'none'; 
            console.log("✅ [SYSTEM]: Intro animation fully terminated. Welcome to WJ STUDIO!");
        }, 1500);
    }
}

// =========================================
// 煙霧引擎 (維持不變)
// =========================================
function startVolumetricSmokeEngine() {
    const ctx = smokeCanvas.getContext('2d');
    let width = smokeCanvas.width = window.innerWidth;
    let height = smokeCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = smokeCanvas.width = window.innerWidth;
        height = smokeCanvas.height = window.innerHeight;
    });

    const particles = [];
    let isGentleCloudPhase = false;

    setTimeout(() => {
        isGentleCloudPhase = true;
        for (let i = 0; i < 30; i++) {
            particles.push(new SmokeParticle('cloud', true));
        }
    }, 500);

    class SmokeParticle {
        constructor(type = 'stream', isRespawnOrStage2 = false) {
            this.type = type;
            this.reset(isRespawnOrStage2);
        }

        reset(isRespawnOrStage2 = false) {
            this.angle = Math.random() * Math.PI * 2; 
            this.spinSpeed = (Math.random() - 0.5) * 0.025;

            if (this.type === 'cloud') {
                this.x = isRespawnOrStage2 ? Math.random() * width : -200;
                this.y = Math.random() * height;
                this.radius = 180 + Math.random() * 220; 
                this.growthRate = 0.3 + Math.random() * 0.5; 
                this.vx = 1.2 + Math.random() * 1.8; 
                this.vy = (Math.random() - 0.5) * 0.8;
                this.alpha = 0;
                this.maxAlpha = 0.04 + Math.random() * 0.04; 
                this.fadeIn = true;
                return;
            }

            const nozzle = Math.floor(Math.random() * 3);
            this.x = -(60 + Math.random() * 290); 
            
            if (nozzle === 0) {
                this.y = Math.random() * (height * 0.22); 
                this.vx = 8 + Math.random() * 4;  
                this.vy = 3 + Math.random() * 3;   
            } else if (nozzle === 1) {
                this.y = (height * 0.38) + Math.random() * (height * 0.24); 
                this.vx = 9 + Math.random() * 4.5;  
                this.vy = (Math.random() - 0.5) * 1.5;
            } else {
                this.y = (height * 0.78) + Math.random() * (height * 0.22); 
                this.vx = 8 + Math.random() * 4;  
                this.vy = -(3 + Math.random() * 3); 
            }

            this.radius = 35 + Math.random() * 55; 
            this.growthRate = 2 + Math.random() * 0.5; 
            this.alpha = 0;
            this.maxAlpha = 0.06 + Math.random() * 0.06; 
            this.fadeIn = true;
        }

        update() {
            this.x += this.vx;
            this.angle += this.spinSpeed;
            this.y += this.vy + Math.sin(this.angle) * 1.5;
            this.radius += this.growthRate;
            if (this.radius > 300) this.growthRate = 0.2;

            if (this.fadeIn) {
                this.alpha += 0.012;
                if (this.alpha >= this.maxAlpha) this.fadeIn = false;
            }

            if (this.x - this.radius > width || this.y - this.radius > height || this.y + this.radius < 0) {
                if (isGentleCloudPhase && this.type === 'stream') {
                    this.type = 'cloud';
                }
                this.reset(true);
            }
        }

        draw() {
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            grad.addColorStop(0, `rgba(255, 255, 255, ${this.alpha})`);
            grad.addColorStop(0.5, `rgba(255, 255, 255, ${this.alpha * 0.4})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.beginPath();
            ctx.fillStyle = grad;
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < 120; i++) {
        particles.push(new SmokeParticle('stream', false));
    }

    function render() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        smokeAnimationId = requestAnimationFrame(render);
    }

    render();
}

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

