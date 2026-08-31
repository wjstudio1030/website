// =========================================
// WJ STUDIO - 遊戲核心引擎 (game_core.js)
// =========================================

// 🚀 匯入第一關邏輯
import { initScene1 } from './scene1.js';
// 🌟 匯入 Scene 2
import { initScene2 } from './scene2.js';
// 🌟 匯入 Scene 3 (你接下來要建立的檔案)
import { initScene3 } from './scene3.js';

let inputManager = null;
let createResourceScope = null;
let scene1Controller = null;
let scene2Controller = null;

export function configureGameCore(options) {
    inputManager = options.inputManager;
    createResourceScope = options.createResourceScope;
}

// 🚀 全局玩家資料庫
export const playerState = {
    playerName: "WJ_GUEST",
    inventory: [],      // 獲得的道具
    score: 0,           // 總積分
    currentLevel: 0,    // 目前場景編號
    // 🌟 預先加入這些屬性，用來把 scene2 的狀態帶進 scene3
    ammoOnes: 0,
    ammoZeros: 0,
    hasHammer: false,
    hasSecondManual: false
};

// 🚀 場景切換引擎 (Scene Switcher)
export function switchScene(fromId, toId) {
    const fromScene = document.getElementById(`scene-${fromId}`);
    const toScene = document.getElementById(`scene-${toId}`);
    
    if(!fromScene || !toScene) return;

    if (fromId === 1 && scene1Controller) {
        inputManager?.deactivate();
        scene1Controller.destroy();
        scene1Controller = null;
    }

    if (fromId === 2 && scene2Controller) {
        inputManager?.deactivate();
        scene2Controller = null;
    }

    fromScene.style.opacity = '0';
    
    setTimeout(() => {
        fromScene.classList.remove('active');
        toScene.classList.add('active');
        toScene.style.opacity = '1';
        
        playerState.currentLevel = toId;

        // 初始化對應場景
        if (toId === 1) {
            const resourceScope = createResourceScope?.();

            scene1Controller = initScene1(
                playerState,
                switchScene,
                resourceScope
            );

            inputManager?.activate(scene1Controller);
        }

        if (toId === 2) {
            const resourceScope = createResourceScope?.();
            scene2Controller = initScene2(playerState, switchScene, resourceScope);

            inputManager?.activate(scene2Controller);
        }

        if (toId === 3) initScene3(playerState, switchScene); // 🌟 初始化 Scene 3
    }, 500);
}

// ----------------------------------------------------
// UI 控制系統 (包含音量、全螢幕、滑鼠管理)
// ----------------------------------------------------
const fullscreenBtn = document.getElementById('fullscreenBtn');
const gameWrapper = document.getElementById('gameWrapper');
const volumeBtn = document.getElementById('volumeBtn');
const startGameBtn = document.getElementById('startGameBtn');
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

// 1. 滑鼠進入遊戲區變色邏輯
gameWrapper.addEventListener('mouseenter', () => {
    if(follower && cursor) { follower.style.borderColor = '#ffffff'; cursor.style.background = '#ffffff'; }
});
gameWrapper.addEventListener('mouseleave', () => {
    if(follower && cursor) { follower.style.borderColor = '#ff8177'; cursor.style.background = '#ff8177'; }
});

// 2. 全螢幕防崩潰與滑鼠搬遷邏輯
const handleFullscreenChange = () => {
    const fScreen = document.fullscreenElement || document.webkitFullscreenElement;
    if (fScreen) {
        fScreen.appendChild(cursor);
        fScreen.appendChild(follower);
        cursor.style.zIndex = '999999';
        follower.style.zIndex = '999998';
    } else {
        document.body.appendChild(cursor);
        document.body.appendChild(follower);
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
};
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

fullscreenBtn.addEventListener('click', () => {
    const fScreen = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fScreen) {
        const req = gameWrapper.requestFullscreen || gameWrapper.webkitRequestFullscreen;
        if(req) req.call(gameWrapper).catch(err => console.log(err));
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if(exit) exit.call(document);
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
});

// 3. 音量控制邏輯 (終極修正版)
const volumeSlider = document.getElementById('volumeSlider');
let isMuted = false;
let prevVolume = 100;

// 統一管理 Icon 與顏色的函數
function updateVolumeIcon(val) {
    const isCurrentlyMuted = (val == 0);
    
    if (isCurrentlyMuted) {
        // 靜音時，強制使用紅色
        volumeBtn.style.color = '#fff';
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        // 🌟 關鍵修復：恢復聲音時，清除強制顏色，讓 CSS 的 Hover 科技藍重新生效！
        volumeBtn.style.color = '';
        volumeBtn.innerHTML = (val > 50) ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-down"></i>';
    }
}

// 按鈕點擊切換
volumeBtn.addEventListener('click', () => {
    if (!isMuted) {
        prevVolume = volumeSlider.value;
        volumeSlider.value = 0;
        isMuted = true;
    } else {
        volumeSlider.value = (prevVolume == 0) ? 50 : prevVolume;
        isMuted = false;
    }
    updateVolumeIcon(volumeSlider.value);
});

// 拉桿拖動
volumeSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    isMuted = (val == 0);
    updateVolumeIcon(val);
});

// 4. 開場動畫啟動器
startGameBtn.addEventListener('click', () => {
    startGameBtn.style.transform = 'scale(0.8)';
    startGameBtn.style.opacity = '0';
    document.body.classList.add('hide-custom-cursor');

    setTimeout(() => {
        startGameBtn.style.display = 'none';
        playGameIntro(); 
    }, 300);
});

function playGameIntro() {
    // 🌟 載入你的專屬音效 (路徑已更新)
    const sfxTyping = new Audio('game_audio/typing.mp3');  // 1. 打字音效
    const sfxBinary = new Audio('game_audio/binary.mp3');  // 2. 01 跑動音效
    const sfxGlitch = new Audio('game_audio/glitchA.mp3'); // 3. 顯示標題音效 A
    const sfxImpact = new Audio('game_audio/glitchB.mp3'); // 4. 新增的標題音效 B

    function playSound(audioObj, loop = false) {
        if (isMuted) return; 
        audioObj.volume = (volumeSlider.value / 100); 
        audioObj.loop = loop;
        audioObj.currentTime = 0;
        audioObj.play().catch(e => console.log("Audio play prevented:", e));
    }

    function stopSound(audioObj) {
        audioObj.pause();
        audioObj.currentTime = 0;
    }

    const scene0 = document.getElementById('scene-0');
    const terminal = document.createElement('div');
    terminal.className = 'boot-terminal';
    scene0.appendChild(terminal);

    const getHex = () => '[0x' + Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0') + ']';
    const bootSequence = [
        { hex: getHex(), text: "INITIALIZING WJ_CORE_SYSTEM v2.0.4..." },
        { hex: getHex(), text: "KERNEL LOADED. SECURING MEMORY PAGING... [OK]" },
        { hex: getHex(), text: "LOADING LOGIC GATES (AND, OR, XOR, NAND)..." },
        { hex: getHex(), text: "COMPILING CIRCUIT ASSETS... SUCCESS" },
        { hex: getHex(), text: "SYSTEM OVERRIDE COMPLETE. READY FOR INPUT." }
    ];

    let lineIndex = 0; let charIndex = 0;
    
    playSound(sfxTyping, true);

    function typeBootSequence() {
        if (lineIndex < bootSequence.length) {
            let htmlContent = "";
            for (let i = 0; i < lineIndex; i++) htmlContent += `<span class="boot-line"><span class="sys-hex">${bootSequence[i].hex}</span>${bootSequence[i].text}</span>`;
            let currentObj = bootSequence[lineIndex];
            htmlContent += `<span class="boot-line"><span class="sys-hex">${currentObj.hex}</span>${currentObj.text.substring(0, charIndex + 1)}<span class="terminal-cursor"></span></span>`;
            terminal.innerHTML = htmlContent; charIndex++;

            if (charIndex < currentObj.text.length) setTimeout(typeBootSequence, Math.random() > 0.75 ? 0 : Math.random() * 20 + 10);
            else { lineIndex++; charIndex = 0; setTimeout(typeBootSequence, 150); }
        } else { 
            stopSound(sfxTyping);
            setTimeout(() => { terminal.style.display = 'none'; startBinaryRain(); }, 500); 
        }
    }
    typeBootSequence();

    function startBinaryRain() {
        playSound(sfxBinary);

        let rainInterval = setInterval(() => {
            for(let i=0; i<3; i++) {
                let binary = document.createElement('div');
                binary.className = 'binary-particle'; binary.innerText = Math.random() > 0.5 ? '1' : '0';
                binary.style.left = Math.random() * 100 + '%'; binary.style.top = Math.random() * 100 + '%';
                scene0.appendChild(binary);
                setTimeout(() => { if(binary.parentNode) binary.remove(); }, 1000);
            }
        }, 50);
        setTimeout(() => { clearInterval(rainInterval); showGlitchTitle(); }, 1500);
    }

    function showGlitchTitle() {
        const gameScreen = document.getElementById('gameScreen');
        gameScreen.style.backgroundColor = '#fff';
        setTimeout(() => { gameScreen.style.backgroundColor = '#050505'; }, 50);

        // 🌟 瞬間切斷 01 跑動音效，營造系統突變的駭客感！
        stopSound(sfxBinary);

        // 🌟 同時播放兩個 Glitch / 撞擊音效
        playSound(sfxGlitch);
        playSound(sfxImpact);

        const title = document.createElement('div');
        title.className = 'glitch-title glitch-active';
        title.innerHTML = "WJ STUDIO<br>ECE WORLD";
        title.style.textAlign = "center";
        scene0.appendChild(title);

        setTimeout(() => {
            title.remove();
            document.body.classList.remove('hide-custom-cursor');
            switchScene(0, 1); 
        }, 2500);
    }
}