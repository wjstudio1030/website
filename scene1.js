// =========================================
// WJ STUDIO - 場景 1：開場劇情動畫 (scene1.js)
// =========================================

export function initScene1(playerState, switchScene) {
    const scene1 = document.getElementById('scene-1');
    
    // 移除舊的鍵盤事件監聽器 (如果有的話)
    if (window._scene1KeyDown) {
        window.removeEventListener('keydown', window._scene1KeyDown);
        window.removeEventListener('keyup', window._scene1KeyUp);
    }
    if (window._scene2KeyDown) {
        window.removeEventListener('keydown', window._scene2KeyDown);
        window.removeEventListener('keyup', window._scene2KeyUp);
    }
    
    // 重置 playerState 確保不會卡住
    playerState.ammoOnes = 0;
    playerState.ammoZeros = 0;
    
    // 動態注入 CSS 
    scene1.innerHTML = `
        <style>
            @keyframes walkBounce { 0%, 100% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, calc(-50% - 8px)); } }
            @keyframes armSwingL { 0%, 100% { transform: rotate(40deg); } 50% { transform: rotate(-40deg); } }
            @keyframes armSwingR { 0%, 100% { transform: rotate(-40deg); } 50% { transform: rotate(40deg); } }
            @keyframes legSwingL { 0%, 100% { transform: rotate(45deg); } 50% { transform: rotate(-45deg); } }
            @keyframes legSwingR { 0%, 100% { transform: rotate(-45deg); } 50% { transform: rotate(45deg); } }

            #stickman-body { animation: walkBounce 0.45s infinite ease-in-out; transform: translate(-50%, -50%); position: absolute; left: 50%; top: 50%; width: 100%; height: 100%; }
            #armL { animation: armSwingL 0.45s infinite ease-in-out; transform-origin: 40px 56px; }
            #armR { animation: armSwingR 0.45s infinite ease-in-out; transform-origin: 40px 56px; }
            #legL { animation: legSwingL 0.45s infinite ease-in-out; transform-origin: 40px 75px; }
            #legR { animation: legSwingR 0.45s infinite ease-in-out; transform-origin: 40px 75px; }

            .stand-still #stickman-body { animation: none !important; transform: translate(-50%, -50%) !important; transition: transform 0.2s; }
            .stand-still #armL { animation: none !important; transform: rotate(-35deg) !important; transition: transform 0.3s ease; }
            .stand-still #armR { animation: none !important; transform: rotate(35deg) !important; transition: transform 0.3s ease; }
            .stand-still #legL { animation: none !important; transform: rotate(-15deg) !important; transition: transform 0.3s ease; }
            .stand-still #legR { animation: none !important; transform: rotate(15deg) !important; transition: transform 0.3s ease; }

            @keyframes floatPrompt { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
            
            .manual-active { opacity: 1 !important; pointer-events: auto !important; transform: translate(-50%, -50%) scale(1) !important; }
            @keyframes iconPopIn { 0% { transform: scale(0) rotate(-20deg); opacity: 0; box-shadow: 0 0 0 transparent; } 50% { transform: scale(1.3) rotate(10deg); opacity: 1; box-shadow: 0 0 25px var(--brand-blue); } 100% { transform: scale(1) rotate(0deg); opacity: 1; box-shadow: 0 0 0 transparent; } }

            .manual-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; height: 100%; }
            .manual-panel { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(0, 242, 254, 0.2); border-radius: 8px; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
            .panel-title { color: var(--brand-blue); font-family: 'Orbitron', sans-serif; font-size: 1.2rem; letter-spacing: 2px; margin-bottom: 20px; text-align: center; text-shadow: 0 0 10px rgba(0, 242, 254, 0.5); }
            .key-btn { display: inline-flex; justify-content: center; align-items: center; width: 40px; height: 40px; background: rgba(0, 0, 0, 0.6); border: 2px solid #fff; border-radius: 6px; color: #fff; font-family: 'Orbitron', sans-serif; font-size: 1.2rem; font-weight: bold; box-shadow: 0 4px 0 #888, 0 0 10px rgba(255,255,255,0.2); margin: 4px; }
            .key-group-wasd { display: flex; flex-direction: column; align-items: center; margin-top: 15px; }
            .key-row { display: flex; gap: 5px; }
            .action-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; width: 100%; }
            .action-text { font-family: 'Orbitron', sans-serif; font-size: 1.5rem; color: #fff; letter-spacing: 2px; }
            .action-block { width: 100%; border-bottom: 1px dashed rgba(255,255,255,0.2); padding-bottom: 20px; margin-bottom: 20px; }
            .action-block:last-child { border-bottom: none; margin-bottom: 0; }
            
            .svg-glow { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.4)); }
            /* 🌟 在這裡加上 overflow: visible，解決動畫超出邊界被裁切的問題 */
            .env-prop { position: absolute; opacity: 1; z-index: 2; transform: translate(-50%, -50%); overflow: visible; }
            .env-grass path { transition: transform 0.2s ease; }
            .env-grass path:nth-child(1) { transform-origin: 10px 30px; } 
            .env-grass path:nth-child(2) { transform-origin: 20px 30px; }
            .env-grass path:nth-child(3) { transform-origin: 30px 30px; }

            @keyframes grassLeft { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-30deg); } }
            @keyframes grassMid { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.3) translateY(-2px); } }
            @keyframes grassRight { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(30deg); } }
            .env-grass.bump-anim path:nth-child(1) { animation: grassLeft 0.4s ease-out; }
            .env-grass.bump-anim path:nth-child(2) { animation: grassMid 0.4s ease-out; }
            .env-grass.bump-anim path:nth-child(3) { animation: grassRight 0.4s ease-out; }

            .env-stone { transform-origin: 50% 100%; } 
            @keyframes stoneSquash { 0%, 100% { transform: translate(-50%, -50%) scale(1, 1); } 40% { transform: translate(-50%, -50%) scale(0.9, 1.2); } 70% { transform: translate(-50%, -50%) scale(1.05, 0.95); } }
            .env-stone.bump-anim { animation: stoneSquash 0.4s ease-out; }

            .ammo-item { position: absolute; font-family: 'Orbitron', sans-serif; font-size: 2rem; font-weight: 900; transform: translate(-50%, -50%); transition: all 0.3s ease; z-index: 3; animation: floatAmmo 2s infinite ease-in-out; color: #fff; text-shadow: 0 0 15px rgba(255, 255, 255, 0.8); }
            @keyframes floatAmmo { 0%, 100% { transform: translate(-50%, -50%) translateY(0); } 50% { transform: translate(-50%, -50%) translateY(-10px); } }

            #ammo-modal { position: absolute; top: 40%; left: 50%; filter: blur(15px) brightness(2); transform: translate(-50%, -50%) scale(1.5) perspective(600px) rotateX(45deg); opacity: 0; pointer-events: none; background: rgba(10, 10, 15, 0.85); border: 1px solid transparent; border-radius: 8px; padding: 30px 60px; text-align: center; backdrop-filter: blur(10px); z-index: 200; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.4s ease; }
            #ammo-modal.ammo-show { filter: blur(0px) brightness(1); transform: translate(-50%, -50%) scale(1) perspective(600px) rotateX(0deg); opacity: 1; }
            #ammo-title { font-family: 'Orbitron', sans-serif; font-size: 3rem; font-weight: 900; margin-bottom: 5px; letter-spacing: 5px; }
            #ammo-subtitle { font-family: 'Kumbh Sans', sans-serif; font-size: 1.2rem; font-weight: bold; margin-bottom: 15px; color: #fff; }
            #ammo-desc { color: rgba(255,255,255,0.7); font-size: 1rem; letter-spacing: 2px; }
        </style>

        <div style="width: 100%; height: 100%; background-color: #000; position: relative; overflow: hidden;">
            
            <div id="environment-layer" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; transition: none; pointer-events: none;">
                <svg class="env-prop env-grass" data-x="130" data-y="40" viewBox="0 0 40 30" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" style="width: 50px; height: 35px; left: 130%; top: 40%;"><path d="M 10 30 Q 5 15 2 10" /><path d="M 20 30 Q 20 15 20 5" /><path d="M 30 30 Q 35 15 38 10" /></svg>
                <svg class="env-prop env-stone" data-x="170" data-y="75" viewBox="0 0 100 80" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" style="width: 110px; height: 88px; left: 170%; top: 75%;"><path d="M 10 45 C -5 20 20 0 40 10 C 60 -5 90 5 95 25 C 105 45 80 55 50 50 C 25 55 5 55 10 45 Z" fill="#000" /><path d="M 30 75 L 70 75 Q 65 50 65 45 L 35 45 Q 35 50 30 75 Z" fill="#000" /></svg>
                <svg class="env-prop env-grass" data-x="220" data-y="25" viewBox="0 0 40 30" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" style="width: 45px; height: 30px; left: 220%; top: 25%;"><path d="M 10 30 Q 5 15 2 10" /><path d="M 20 30 Q 20 15 20 5" /><path d="M 30 30 Q 35 15 38 10" /></svg>
                <svg class="env-prop env-stone" data-x="270" data-y="35" viewBox="0 0 100 80" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" style="width: 80px; height: 64px; left: 270%; top: 35%;"><path d="M 10 45 C -5 20 20 0 40 10 C 60 -5 90 5 95 25 C 105 45 80 55 50 50 C 25 55 5 55 10 45 Z" fill="#000" /><path d="M 30 75 L 70 75 Q 65 50 65 45 L 35 45 Q 35 50 30 75 Z" fill="#000" /></svg>
                <svg class="env-prop env-grass" data-x="300" data-y="85" viewBox="0 0 40 30" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" style="width: 55px; height: 40px; left: 300%; top: 85%;"><path d="M 10 30 Q 5 15 2 10" /><path d="M 20 30 Q 20 15 20 5" /><path d="M 30 30 Q 35 15 38 10" /></svg>

                <div class="ammo-item" data-type="1" data-x="145" data-y="60" style="left: 145%; top: 60%;">1</div>
                <div class="ammo-item" data-type="1" data-x="190" data-y="30" style="left: 190%; top: 30%;">1</div>
                <div class="ammo-item" data-type="1" data-x="240" data-y="75" style="left: 240%; top: 75%;">1</div>
                <div class="ammo-item" data-type="1" data-x="275" data-y="45" style="left: 275%; top: 45%;">1</div>
                <div class="ammo-item" data-type="1" data-x="315" data-y="85" style="left: 315%; top: 85%;">1</div>
                <div class="ammo-item" data-type="0" data-x="350" data-y="35" style="left: 350%; top: 35%;">0</div>

                <div id="falling-book" style="position: absolute; top: -150px; left: calc(20% - 22px); width: 45px; height: 60px; background-color: #094b8e; border: 2px solid #fff; border-left: 8px solid #042a53; border-radius: 2px 6px 6px 2px; box-shadow: inset -4px 0 0 #ddd, 0 0 15px rgba(0, 242, 254, 0.5); display: flex; justify-content: center; align-items: center; opacity: 0; z-index: 4; pointer-events: auto;">
                    <span style="color: #fff; font-family: 'Orbitron', sans-serif; font-size: 14px; font-weight: 900; transform: rotate(-90deg); letter-spacing: 2px;">C++</span>
                </div>

                <div id="e-prompt" style="position: absolute; top: calc(50% + 5px); left: calc(20% + 35px); width: 30px; height: 30px; background: rgba(0, 242, 254, 0.15); border: 2px solid var(--brand-blue); border-radius: 6px; color: #fff; font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 14px; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s; z-index: 20; box-shadow: 0 0 10px var(--brand-blue); animation: floatPrompt 1.5s infinite ease-in-out;">E</div>

                <div id="item-e-prompt" style="position: absolute; width: 24px; height: 24px; background: rgba(255, 255, 255, 0.15); border: 2px solid #fff; border-radius: 4px; color: #fff; font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 12px; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.2s; z-index: 20; box-shadow: 0 0 10px #fff; pointer-events: none;">E</div>
            </div>

            <div id="stickman" style="position: absolute; top: 50%; left: -100px; transform: translate(-50%, -50%); width: 80px; height: 120px; transition: left 2.5s linear, transform 0.1s ease-out; z-index: 5;">
                <svg id="stickman-body" viewBox="0 0 80 120" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="40" cy="32" r="16" />
                    <line x1="40" y1="48" x2="40" y2="75" />
                    
                    <g id="armL">
                        <line x1="40" y1="56" x2="40" y2="85" />
                        <text id="held-1" x="10" y="50" dy="0.3em" text-anchor="middle" fill="#fff" font-size="23" font-family="'Orbitron', sans-serif" font-weight="25" style="text-shadow: 0 0 0px rgba(255, 255, 255, 0.8);" opacity="0">1</text>
                    </g>
                    <g id="armR">
                        <line x1="40" y1="56" x2="40" y2="85" />
                        <text id="held-0" x="70" y="50" dy="0.3em" text-anchor="middle" fill="#fff" font-size="23" font-family="'Orbitron', sans-serif" font-weight="25" style="text-shadow: 0 0 0px rgba(255, 255, 255, 0.8);" opacity="0">0</text>
                    </g>

                    <line x1="40" y1="75" x2="40" y2="105" id="legL" /> 
                    <line x1="40" y1="75" x2="40" y2="105" id="legR" /> 
                </svg>
            </div>

            <div id="manual-modal" style="overscroll-behavior: contain; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); width: 85%; max-width: 900px; height: 80vh; background: rgba(10, 10, 15, 0.9); border: 1px solid var(--brand-blue); border-radius: 12px; box-shadow: 0 0 40px rgba(0, 242, 254, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.8); z-index: 100; display: flex; flex-direction: column; opacity: 0; pointer-events: none; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); backdrop-filter: blur(15px);">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(0, 242, 254, 0.2);">
                    <div style="color: var(--brand-blue); font-family: 'Orbitron', sans-serif; font-size: 1.2rem; letter-spacing: 3px;">CHARACTER_MANUAL.exe</div>
                    <button id="close-manual" style="background: transparent; border: none; outline: none; padding: 0; color: #fff; font-family: 'Orbitron', sans-serif; font-size: 1.5rem; cursor: pointer; transition: 0.2s;" onmouseover="this.style.color='#fff'; this.style.textShadow='0 0 10px #fff'" onmouseout="this.style.color='#fff'; this.style.textShadow='none'">✖</button>
                </div>
                <div id="manual-content" style="flex: 1; padding: 30px; overflow-y: auto; overscroll-behavior: contain;">
                    <div class="manual-layout">
                        <div class="manual-panel">
                            <div class="panel-title">MOVEMENT</div>
                            <div style="position: relative; width: 160px; height: 160px; margin: 20px 0;">
                                <svg class="svg-glow" viewBox="0 0 160 160" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="80" cy="40" r="14" />
                                    <line x1="80" y1="54" x2="80" y2="95" />
                                    <line x1="80" y1="65" x2="55" y2="85" />
                                    <line x1="80" y1="65" x2="105" y2="85" />
                                    <line x1="80" y1="95" x2="60" y2="130" />
                                    <line x1="80" y1="95" x2="100" y2="130" />
                                    <line x1="80" y1="20" x2="80" y2="4" />
                                    <polyline points="72,12 80,4 88,12" />
                                    <line x1="80" y1="140" x2="80" y2="156" />
                                    <polyline points="72,148 80,156 88,148" />
                                    <line x1="25" y1="80" x2="5" y2="80" />
                                    <polyline points="15,70 5,80 15,90" />
                                    <line x1="135" y1="80" x2="155" y2="80" />
                                    <polyline points="145,70 155,80 145,90" />
                                </svg>
                            </div>
                            <div class="key-group-wasd">
                                <div class="key-row"><div class="key-btn">W</div></div>
                                <div class="key-row"><div class="key-btn">A</div><div class="key-btn">S</div><div class="key-btn">D</div></div>
                            </div>
                        </div>
                        <div class="manual-panel" style="justify-content: flex-start;">
                            <div class="action-block">
                                <div class="action-header">
                                    <div class="key-btn" style="border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">E</div>
                                    <div class="action-text">Pick up</div>
                                </div>
                                <svg class="svg-glow" viewBox="0 0 200 100" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 120px;">
                                    <circle cx="50" cy="30" r="12" />
                                    <line x1="50" y1="42" x2="50" y2="70" />
                                    <line x1="50" y1="50" x2="35" y2="80" /> 
                                    <line x1="50" y1="50" x2="80" y2="60" /> 
                                    <line x1="50" y1="70" x2="35" y2="95" /> 
                                    <line x1="50" y1="70" x2="65" y2="95" /> 
                                    <circle cx="85" cy="55" r="8" stroke="var(--brand-blue)" />
                                    <circle cx="130" cy="85" r="10" stroke="#888" stroke-dasharray="4 4" />
                                    <path d="M 120 75 Q 110 58 95 58" stroke="#888" stroke-width="2" fill="none" stroke-dasharray="3 3" />
                                    <polyline points="102,52 95,58 102,64" stroke="#888" stroke-width="2" fill="none" />
                                </svg>
                            </div>
                            <div class="action-block" style="border-bottom: none;">
                                <div class="action-header">
                                    <div class="key-btn" style="border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">Q</div>
                                    <div class="action-text">USE</div>
                                </div>
                                <svg class="svg-glow" viewBox="0 0 200 100" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 120px;">
                                    <circle cx="40" cy="40" r="10" />
                                    <line x1="40" y1="50" x2="40" y2="75" />
                                    <line x1="40" y1="55" x2="25" y2="80" />
                                    <line x1="40" y1="55" x2="60" y2="60" /> 
                                    <line x1="40" y1="75" x2="25" y2="95" />
                                    <line x1="40" y1="75" x2="55" y2="95" />
                                    <line x1="120" y1="45" x2="140" y2="45" stroke="#fff" /> 
                                    <line x1="120" y1="65" x2="140" y2="65" stroke="#fff" /> 
                                    <line x1="140" y1="35" x2="140" y2="75" />
                                    <line x1="140" y1="35" x2="160" y2="35" />
                                    <line x1="140" y1="75" x2="160" y2="75" />
                                    <path d="M 160 35 A 20 20 0 0 1 160 75" />
                                    <line x1="180" y1="55" x2="195" y2="55" stroke="#fff" />
                                    
                                    <path d="M 65 60 Q 85 55 100 65" stroke="#888" stroke-width="2" stroke-dasharray="3 3" />
                                    <polyline points="93,58 100,65 93,68" stroke="#888" stroke-width="2" />
                                    <circle cx="110" cy="65" r="6" stroke="var(--brand-blue)" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="ammo-modal">
                <div id="ammo-title"></div>
                <div id="ammo-subtitle"></div>
                <div id="ammo-desc"></div>
            </div>
        </div>
    `;

    const environmentLayer = document.getElementById('environment-layer');
    const stickman = document.getElementById('stickman');
    const book = document.getElementById('falling-book');
    const ePrompt = document.getElementById('e-prompt');
    const itemEPrompt = document.getElementById('item-e-prompt'); 
    const manualModal = document.getElementById('manual-modal');
    const closeManual = document.getElementById('close-manual');
    const envProps = document.querySelectorAll('.env-prop');

    // 🌟 1. 載入互動音效 (請確認路徑與檔名一致)
    const sfxGrass = new Audio('game_audio/game_grass.mp3');
    const sfxStone = new Audio('game_audio/game_mushroomstone.mp3');
    const sfxPickup = new Audio('game_audio/game_pickup_01.mp3');
    const sfxOpenBook = new Audio('game_audio/game_openbook.mp3');

    // 🌟 2. 專屬播放函式：支援音量拉桿與多重音效重疊
    function playActionSfx(audioObj) {
        const volSlider = document.getElementById('volumeSlider');
        if (!volSlider || volSlider.value == 0) return; 
        const sound = audioObj.cloneNode(); 
        sound.volume = volSlider.value / 100;
        sound.play().catch(e => console.log("SFX play prevented:", e));
    }

    let manualBtn = document.getElementById('inventory-manual-btn');
    if (!manualBtn) {
        manualBtn = document.createElement('button');
        manualBtn.id = 'inventory-manual-btn';
        manualBtn.className = 'control-btn'; 
        manualBtn.title = "Character Manual";
        manualBtn.innerHTML = '<i class="fas fa-book"></i>';
        manualBtn.style.display = 'none';

        const gameControls = document.querySelector('.game-controls');
        const volumeWrapper = document.querySelector('.volume-wrapper');
        if (gameControls && volumeWrapper) {
            gameControls.insertBefore(manualBtn, volumeWrapper);
        }
    }

    manualBtn.addEventListener('click', () => {
        playActionSfx(sfxOpenBook);
        manualModal.classList.add('manual-active');
        isPlayerControllable = false; 
        stickman.classList.add('stand-still');
    });

    let canPickUp = false; 
    let eventListenerAdded = false;
    
    // 🌟 明確記錄彈藥數量
    let ammoOnes = 0;
    let ammoZeros = 0;
    let hasFirstOne = false;
    let hasFirstZero = false;
    let nearbyAmmo = null;

    let isPlayerControllable = false;
    let worldX = 20; 
    let py = 50; 
    let cameraX = 0; 
    let facing = 1;  
    const keys = { w: false, a: false, s: false, d: false };
    
    setTimeout(() => { stickman.style.left = '20%'; }, 100);
    setTimeout(() => { stickman.classList.add('stand-still'); }, 2600); 

    setTimeout(() => {
        book.style.opacity = '1';
        book.style.transition = 'top 0.35s ease-in, transform 0.35s ease-in'; 
        book.style.top = 'calc(50% - 95px)'; 
        book.style.transform = 'rotate(10deg)'; 
        
        setTimeout(() => {
            stickman.style.transition = 'transform 0.1s ease-out';
            stickman.style.transform = 'translate(-50%, -50%) scaleY(0.7) translateY(20px)';
        }, 320); 
    }, 2900); 

    setTimeout(() => {
        stickman.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; 
        stickman.style.transform = 'translate(-50%, -50%) scaleY(1) translateY(0)';

        book.style.transition = 'top 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53), transform 0.4s linear, left 0.4s linear';
        book.style.top = 'calc(50% + 50px)'; 
        book.style.left = 'calc(20% + 45px)'; 
        book.style.transform = 'rotate(85deg)'; 
    }, 3400); 

    setTimeout(() => {
        ePrompt.style.opacity = '1';
        canPickUp = true;

        // 儲存事件處理函數到 window 以便之後移除
        window._scene1KeyDown = handleKeyDown;
        window._scene1KeyUp = handleKeyUp;
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        eventListenerAdded = true;
        
        // 啟動遊戲迴圈，但不給予控制權 (isPlayerControllable 依然是 false)
        // 這樣可以讓畫面保持更新，等待玩家按下 E
        requestAnimationFrame(gameLoop);
    }, 4000);

    function showAmmoModal(type, title, subtitle, desc, color) {
        const modal = document.getElementById('ammo-modal');
        const titleEl = document.getElementById('ammo-title');
        const subtitleEl = document.getElementById('ammo-subtitle');
        const descEl = document.getElementById('ammo-desc');

        titleEl.innerText = title;
        titleEl.style.color = '#fff'; // 🚀 強制將大字 0 與 1 改為純白色
        titleEl.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.8)'; // 🚀 改為白色發光特效
        subtitleEl.innerText = subtitle;
        descEl.innerText = desc;
        
        // 外框與面板本體依然保留原本設定的科技藍線條與發光，維持整體 UI 層次感
        modal.style.borderColor = color;
        modal.style.boxShadow = `0 0 40px ${color}44, inset 0 0 20px ${color}88`;

        modal.classList.add('ammo-show');
        
        setTimeout(() => {
            modal.classList.remove('ammo-show');
        }, 3000);
    }

    function handleKeyDown(e) {
        const key = e.key.toLowerCase();
        
        if (keys.hasOwnProperty(key)) keys[key] = true;

        if (key === 'e') {
            if (canPickUp) {
                canPickUp = false; 
                ePrompt.style.opacity = '0';
                
                book.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
                book.style.transform = 'rotate(85deg) scale(0)';
                book.style.opacity = '0';

                setTimeout(() => {
                    playActionSfx(sfxOpenBook); 
                    manualModal.classList.add('manual-active');
                }, 400); 
            }
            else if (nearbyAmmo) {
                const type = nearbyAmmo.dataset.type;
                playActionSfx(sfxPickup);
                nearbyAmmo.classList.add('picked'); 
                nearbyAmmo.style.opacity = '0';
                nearbyAmmo.style.transform = 'translate(-50%, -50%) scale(0)';
                
                itemEPrompt.style.opacity = '0'; 

                // 🌟 更新彈藥數量
                if (type === '1') {
                    ammoOnes++;
                    const heldOne = document.getElementById('held-1');
                    heldOne.style.opacity = '1';
                    heldOne.setAttribute("x", "10");
                    heldOne.setAttribute("y", "50");
                    
                    if (!hasFirstOne) {
                        hasFirstOne = true;
                        showAmmoModal('1', '1', '實彈 ( LIVE AMMO )', '具備邏輯力量的實體訊號，可用於觸發機關', 'var(--brand-blue)');
                    }
                } else if (type === '0') {
                    ammoZeros++;
                    const heldZero = document.getElementById('held-0');
                    heldZero.style.opacity = '1';
                    heldZero.setAttribute("x", "70");
                    heldZero.setAttribute("y", "50");
                    
                    if (!hasFirstZero) {
                        hasFirstZero = true;
                        showAmmoModal('0', '0', '空包彈 ( BLANK AMMO )', '無效的虛無訊號，可用於阻斷或佔位', 'var(--brand-blue)');
                    }
                }
                
                nearbyAmmo = null; 
            }
        }
    }

    function handleKeyUp(e) {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = false;
    }

    closeManual.addEventListener('click', () => {
        manualModal.classList.remove('manual-active');
        
        if (manualBtn.style.display === 'none') {
            setTimeout(() => {
                manualBtn.style.display = 'flex';
                manualBtn.style.animation = 'iconPopIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                
                // 說明書關閉且按鈕彈出後，正式賦予玩家控制權
                stickman.style.transition = 'none'; 
                isPlayerControllable = true;
            }, 300);
        } else {
            // 如果說明書按鈕已經存在 (例如玩家遊戲中途再次打開)，關閉後直接恢復控制
            isPlayerControllable = true;
        }
    });

    // =========================================
    // 4. 🚀 遊戲主迴圈 (包含過關無縫切換機制)
    // =========================================
    function gameLoop() {
        if (!isPlayerControllable) {
            requestAnimationFrame(gameLoop);
            return; 
        }

        // 當走到最後一顆彈藥 (350%) 後面一點點時觸發切換
        if (worldX > 380) {
            isPlayerControllable = false; // 鎖定角色
            stickman.classList.add('stand-still');
            
            // 🌟 將明確的彈藥數量存入 playerState
            playerState.ammoOnes = ammoOnes;
            playerState.ammoZeros = ammoZeros;
            
            // 直接呼叫 switchScene！它會自動產生非常平滑的 CSS 淡入淡出！
            switchScene(1, 2);
            return; 
        }

        let moved = false;
        let speedX = 0.4; 
        let speedY = 0.3; 

        if (keys.w) { py -= speedY; moved = true; }
        if (keys.s) { py += speedY; moved = true; }
        if (keys.a) { worldX -= speedX; moved = true; facing = -1; }
        if (keys.d) { worldX += speedX; moved = true; facing = 1; }

        py = Math.max(10, Math.min(90, py)); 
        worldX = Math.max(5, worldX); 

        if (moved) {
            stickman.classList.remove('stand-still');
        } else {
            stickman.classList.add('stand-still');
        }

        let px = worldX;
        if (worldX > 50) { px = 50; cameraX = worldX - 50; } 
        else { cameraX = 0; }

        stickman.style.left = `${px}%`;
        stickman.style.top = `${py}%`;
        stickman.style.transform = `translate(-50%, -50%) scaleX(${facing})`;

        environmentLayer.style.transform = `translateX(-${cameraX}%)`;

        envProps.forEach(prop => {
            const propX = parseFloat(prop.getAttribute('data-x'));
            const propY = parseFloat(prop.getAttribute('data-y'));
            const dx = worldX - propX;
            const dy = py - propY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 8) {
                if (prop.dataset.bumped !== 'true') {
                    prop.dataset.bumped = 'true';
                    
                    // 🌟 4. 判斷撞到的是草還是石頭，播放對應音效
                    if (prop.classList.contains('env-grass')) {
                        playActionSfx(sfxGrass);
                    } else if (prop.classList.contains('env-stone')) {
                        playActionSfx(sfxStone);
                    }

                    prop.classList.remove('bump-anim');
                    void prop.offsetWidth; 
                    prop.classList.add('bump-anim');
                    setTimeout(() => { prop.classList.remove('bump-anim'); }, 400); 
                }
            } else {
                prop.dataset.bumped = 'false';
            }
        });

        let closestItem = null;
        let minDist = 12; 
        document.querySelectorAll('.ammo-item:not(.picked)').forEach(item => {
            const ix = parseFloat(item.dataset.x);
            const iy = parseFloat(item.dataset.y);
            const dx = worldX - ix;
            const dy = py - iy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < minDist) {
                minDist = dist;
                closestItem = item; 
            }
        });

        if (closestItem) {
            nearbyAmmo = closestItem;
            itemEPrompt.style.opacity = '1';
            itemEPrompt.style.left = `calc(${closestItem.dataset.x}% - 12px)`;
            itemEPrompt.style.top = `calc(${closestItem.dataset.y}% - 40px)`;
        } else {
            nearbyAmmo = null;
            itemEPrompt.style.opacity = '0';
        }

        requestAnimationFrame(gameLoop);
    }
}
