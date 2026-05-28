// =========================================
// WJ STUDIO - 場景 2：未知領域與邏輯閘 (scene2.js)
// =========================================

export function initScene2(playerState, switchScene) {
    const scene2 = document.getElementById('scene-2');
    
    // 移除舊的鍵盤事件監聽器 (如果有的話)
    if (window._scene2KeyDown) {
        window.removeEventListener('keydown', window._scene2KeyDown);
        window.removeEventListener('keyup', window._scene2KeyUp);
    }
    if (window._scene1KeyDown) {
        window.removeEventListener('keydown', window._scene1KeyDown);
        window.removeEventListener('keyup', window._scene1KeyUp);
    }
    
    // 從 playerState 讀取彈藥數量
    let ammoOnes = playerState.ammoOnes || 0;
    let ammoZeros = playerState.ammoZeros || 0;
    
    scene2.innerHTML = `
        <style>
            @keyframes walkBounce { 0%, 100% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, calc(-50% - 8px)); } }
            @keyframes armSwingL { 0%, 100% { transform: rotate(40deg); } 50% { transform: rotate(-40deg); } }
            @keyframes armSwingR { 0%, 100% { transform: rotate(-40deg); } 50% { transform: rotate(40deg); } }
            @keyframes legSwingL { 0%, 100% { transform: rotate(45deg); } 50% { transform: rotate(-45deg); } }
            @keyframes legSwingR { 0%, 100% { transform: rotate(-45deg); } 50% { transform: rotate(45deg); } }

            #stickman-body-s2 { animation: walkBounce 0.45s infinite ease-in-out; transform: translate(-50%, -50%); position: absolute; left: 50%; top: 50%; width: 100%; height: 100%; }
            #armL-s2 { animation: armSwingL 0.45s infinite ease-in-out; transform-origin: 40px 56px; }
            #armR-s2 { animation: armSwingR 0.45s infinite ease-in-out; transform-origin: 40px 56px; }
            #legL-s2 { animation: legSwingL 0.45s infinite ease-in-out; transform-origin: 40px 75px; }
            #legR-s2 { animation: legSwingR 0.45s infinite ease-in-out; transform-origin: 40px 75px; }

            .stand-still #stickman-body-s2 { animation: none !important; transform: translate(-50%, -50%) !important; transition: transform 0.2s; }
            .stand-still #armL-s2 { animation: none !important; transform: rotate(-35deg) !important; transition: transform 0.3s ease; }
            .stand-still #armR-s2 { animation: none !important; transform: rotate(35deg) !important; transition: transform 0.3s ease; }
            .stand-still #legL-s2 { animation: none !important; transform: rotate(-15deg) !important; transition: transform 0.3s ease; }
            .stand-still #legR-s2 { animation: none !important; transform: rotate(15deg) !important; transition: transform 0.3s ease; }

            .manual-active { opacity: 1 !important; pointer-events: auto !important; transform: translate(-50%, -50%) scale(1) !important; }
            
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
            
            /* 場景物件通用設定 (確保中心點對齊) */
            .env-prop { position: absolute; opacity: 1; z-index: 2; transform: translate(-50%, -50%); }
            .svg-glow { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.4)); }

            /* 玩家死亡倒地動畫 */
            @keyframes playerDie {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(-90deg) translate(-30px, -20px); filter: brightness(0.5); }
            }
            .player-dead { animation: playerDie 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important; }

            /* 怪物死亡倒地動畫 */
            @keyframes monsterDie {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(90deg) translate(20px, 30px); opacity: 0.3; }
            }
            .monster-dead { animation: monsterDie 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

            /* 小巧跑馬燈選擇介面 */
            #marquee-selector {
                position: absolute;
                background: rgba(10, 10, 15, 0.9);
                border: 2px solid var(--brand-blue);
                border-radius: 12px;
                padding: 15px 20px;
                text-align: center;
                backdrop-filter: blur(10px);
                box-shadow: 0 0 20px rgba(0, 242, 254, 0.4);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
                z-index: 200;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }
            #marquee-selector.active { opacity: 1; pointer-events: auto; }
            
            .marquee-title {
                font-family: 'Orbitron', sans-serif;
                font-size: 0.8rem;
                color: rgba(255, 255, 255, 0.7);
                letter-spacing: 2px;
                margin-bottom: 5px;
            }
            
            .marquee-options {
                display: flex;
                gap: 15px;
                justify-content: center;
            }
            
            .marquee-option {
                width: 50px;
                height: 50px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: 'Orbitron', sans-serif;
                font-size: 1.8rem;
                font-weight: 900;
                color: rgba(255, 255, 255, 0.3);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                transition: all 0.15s ease;
            }
            
            .marquee-option.highlight {
                color: #fff;
                border-color: var(--brand-blue);
                background: rgba(0, 242, 254, 0.2);
                box-shadow: 0 0 15px var(--brand-blue);
                transform: scale(1.1);
            }
            
            .marquee-option.disabled {
                opacity: 0.2;
                pointer-events: none;
            }
            
            .marquee-hint {
                font-family: 'Orbitron', sans-serif;
                font-size: 0.7rem;
                color: var(--brand-blue);
                letter-spacing: 1px;
            }
            
            .marquee-key {
                display: inline-flex;
                justify-content: center;
                align-items: center;
                width: 22px;
                height: 22px;
                background: rgba(0, 242, 254, 0.2);
                border: 1px solid var(--brand-blue);
                border-radius: 4px;
                font-size: 0.8rem;
                margin: 0 3px;
            }

            /* 子彈飛入閘門的動畫 */
            @keyframes loadAmmo {
                0% { transform: translateX(-40px) scale(1.5); opacity: 0; }
                50% { transform: translateX(0) scale(1.2); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            .ammo-loaded { animation: loadAmmo 0.4s ease-out forwards; }

            /* 角色填裝子彈的肢體動畫 */
            @keyframes insertAction {
                0% { transform: rotate(-35deg); }
                40% { transform: rotate(-90deg) translateX(-10px); }
                100% { transform: rotate(-35deg); }
            }
            @keyframes bodyThrust {
                0% { transform: translate(-50%, -50%); }
                40% { transform: translate(-35%, -50%) rotate(10deg); }
                100% { transform: translate(-50%, -50%); }
            }
            .anim-insert #armR-s2, .anim-insert #armL-s2 {
                animation: insertAction 0.5s ease-out !important;
            }
            .anim-insert #stickman-body-s2 {
                animation: bodyThrust 0.5s ease-out !important;
            }

        </style>

        <div style="width: 100%; height: 100%; background-color: #000; position: relative; overflow: hidden;">
            
            <div id="environment-layer-s2" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; transition: none; pointer-events: none;">
                
                <svg id="and-gate" class="env-prop svg-glow" viewBox="0 0 140 100" stroke="#fff" stroke-width="5" fill="#000" stroke-linecap="round" stroke-linejoin="round" style="width: 140px; height: 100px; left: 80%; top: 50%;">
                    <line x1="0" y1="30" x2="30" y2="30" stroke-width="4" />
                    <line x1="0" y1="70" x2="30" y2="70" stroke-width="4" />
                    <path d="M 30 10 L 30 90 L 70 90 A 40 40 0 0 0 70 10 L 30 10 Z" fill="#000" />
                    <line x1="110" y1="50" x2="140" y2="50" stroke-width="4" />
                </svg>
                
                <div id="input-a-display" style="position:absolute; left:calc(80% - 95px); top:calc(50% - 33px); color:#fff; font-family:'Orbitron', sans-serif; font-size:20px; font-weight:900; text-shadow:0 0 10px #fff; opacity:0; transition:0.3s; z-index: 5;"></div>
                <div id="input-b-display" style="position:absolute; left:calc(80% - 95px); top:calc(50% + 7px); color:#fff; font-family:'Orbitron', sans-serif; font-size:20px; font-weight:900; text-shadow:0 0 10px #fff; opacity:0; transition:0.3s; z-index: 5;"></div>

                <svg id="or-monster" class="env-prop svg-glow" viewBox="0 0 180 200" stroke="#fff" stroke-width="4" fill="#000" stroke-linecap="round" stroke-linejoin="round" style="width: 160px; height: 200px; left: 130%; top: 50%; transition: transform 0.8s ease;">
                    <line x1="90" y1="40" x2="90" y2="10" stroke-width="6" />
                    <path d="M 30 160 Q 30 80 90 40 Q 150 80 150 160 Q 90 130 30 160 Z" fill="#000" stroke-width="5" />
                    <g id="monster-eyes-alive">
                        <circle cx="70" cy="90" r="6" fill="#fff" stroke="none" />
                        <circle cx="110" cy="90" r="6" fill="#fff" stroke="none" />
                    </g>
                    <g id="monster-eyes-dead" style="opacity: 0;">
                        <path d="M 64 84 L 76 96 M 76 84 L 64 96" stroke-width="3" />
                        <path d="M 104 84 L 116 96 M 116 84 L 104 96" stroke-width="3" />
                    </g>
                    <line x1="50" y1="148" x2="40" y2="190" stroke-width="5" />
                    <line x1="75" y1="138" x2="70" y2="190" stroke-width="5" />
                    <line x1="105" y1="138" x2="110" y2="190" stroke-width="5" />
                    <line x1="130" y1="148" x2="140" y2="190" stroke-width="5" />
                </svg>
            </div>

            <svg id="laser-canvas" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:15; overflow:visible;">
                <path id="blue-laser-path" fill="none" stroke="var(--brand-blue)" stroke-width="8" stroke-linecap="round" filter="drop-shadow(0 0 10px var(--brand-blue))" d="" style="opacity: 0;" />
                <path id="white-laser-path" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" filter="drop-shadow(0 0 15px #fff)" d="" style="opacity: 0;" />
            </svg>

            <div id="marquee-selector">
                <div class="marquee-title" id="marquee-title">INPUT A</div>
                <div class="marquee-options">
                    <div class="marquee-option" id="option-1">1</div>
                    <div class="marquee-option" id="option-0">0</div>
                </div>
                <div class="marquee-hint"><span class="marquee-key">Q</span> SELECT</div>
            </div>

            <div id="stickman-s2" class="stand-still" style="position: absolute; top: 50%; left: 20%; transform: translate(-50%, -50%); width: 80px; height: 120px; transition: none; z-index: 5;">
                <svg id="stickman-body-s2" viewBox="0 0 80 120" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="40" cy="32" r="16" />
                    <line x1="40" y1="48" x2="40" y2="75" />
                    <g id="armL-s2">
                        <line x1="40" y1="56" x2="40" y2="85" />
                        <text id="held-1-s2" x="10" y="50" dy="0.3em" text-anchor="middle" fill="#fff" font-size="23" font-family="'Orbitron', sans-serif" font-weight="25" opacity="0">1</text>
                    </g>
                    <g id="armR-s2">
                        <line x1="40" y1="56" x2="40" y2="85" />
                        <text id="held-0-s2" x="70" y="50" dy="0.3em" text-anchor="middle" fill="#fff" font-size="23" font-family="'Orbitron', sans-serif" font-weight="25" opacity="0">0</text>
                    </g>
                    <line x1="40" y1="75" x2="40" y2="105" id="legL-s2" /> 
                    <line x1="40" y1="75" x2="40" y2="105" id="legR-s2" /> 
                </svg>
            </div>

            <div id="manual-modal-s2" style="overscroll-behavior: contain; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); width: 85%; max-width: 900px; height: 80vh; background: rgba(10, 10, 15, 0.9); border: 1px solid var(--brand-blue); border-radius: 12px; box-shadow: 0 0 40px rgba(0, 242, 254, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.8); z-index: 100; display: flex; flex-direction: column; opacity: 0; pointer-events: none; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); backdrop-filter: blur(15px);">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(0, 242, 254, 0.2);">
                    <div style="color: var(--brand-blue); font-family: 'Orbitron', sans-serif; font-size: 1.2rem; letter-spacing: 3px;">CHARACTER_MANUAL.exe</div>
                    <button id="close-manual-s2" style="background: transparent; border: none; outline: none; padding: 0; color: #fff; font-family: 'Orbitron', sans-serif; font-size: 1.5rem; cursor: pointer; transition: 0.2s;" onmouseover="this.style.color='#ff0844'" onmouseout="this.style.color='#fff'">✖</button>
                </div>
                <div id="manual-content-s2" style="flex: 1; padding: 30px; overflow-y: auto; overscroll-behavior: contain;">
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
                                    <circle cx="130" cy="85" r="10" stroke="#666" stroke-dasharray="4 4" />
                                    <path d="M 120 75 Q 110 58 95 58" stroke="#888" stroke-width="2" fill="none" />
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
                                    <line x1="120" y1="45" x2="140" y2="45" stroke="#ccc" /> 
                                    <line x1="120" y1="65" x2="140" y2="65" stroke="#ccc" /> 
                                    <line x1="140" y1="35" x2="140" y2="75" />
                                    <line x1="140" y1="35" x2="160" y2="35" />
                                    <line x1="140" y1="75" x2="160" y2="75" />
                                    <path d="M 160 35 A 20 20 0 0 1 160 75" />
                                    <line x1="180" y1="55" x2="195" y2="55" stroke="#ccc" />
                                    <path d="M 65 60 Q 85 55 100 65" stroke="#888" stroke-width="2" stroke-dasharray="3 3" />
                                    <polyline points="93,58 100,65 93,68" stroke="#888" stroke-width="2" />
                                    <circle cx="110" cy="65" r="6" stroke="var(--brand-blue)" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const environmentLayer = document.getElementById('environment-layer-s2');
    const stickman = document.getElementById('stickman-s2');
    const manualModal = document.getElementById('manual-modal-s2');
    const closeManual = document.getElementById('close-manual-s2');
    
    const marqueeSelector = document.getElementById('marquee-selector');
    const marqueeTitle = document.getElementById('marquee-title');
    const option1 = document.getElementById('option-1');
    const option0 = document.getElementById('option-0');
    const inA = document.getElementById('input-a-display');
    const inB = document.getElementById('input-b-display');
    const orMonster = document.getElementById('or-monster');
    const eyesAlive = document.getElementById('monster-eyes-alive');
    const eyesDead = document.getElementById('monster-eyes-dead');
    
    const blueLaserPath = document.getElementById('blue-laser-path');
    const whiteLaserPath = document.getElementById('white-laser-path');

    if (ammoOnes > 0) document.getElementById('held-1-s2').style.opacity = '1';
    if (ammoZeros > 0) document.getElementById('held-0-s2').style.opacity = '1';

    let oldBtn = document.getElementById('inventory-manual-btn');
    if (oldBtn) {
        let manualBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(manualBtn, oldBtn);
        manualBtn.addEventListener('click', () => {
            manualModal.classList.add('manual-active');
            isPlayerControllable = false; 
            stickman.classList.add('stand-still');
        });
    }

    closeManual.addEventListener('click', () => {
        manualModal.classList.remove('manual-active');
        isPlayerControllable = true;
    });

    let isPlayerControllable = true; 
    let worldX = 20; 
    let py = 50; 
    let cameraX = 0; 
    let facing = 1;  
    const keys = { w: false, a: false, s: false, d: false };

    let marqueeCurrent = 0; 
    let marqueeInterval = null;
    let marqueeActive = false;
    let inputValues = [];
    let gateTriggered = false;
    let isNearGate = false;

    function startMarquee() {
        const hasOne = ammoOnes > 0;
        const hasZero = ammoZeros > 0;
        
        if (!hasOne && !hasZero) {
            triggerDeath(true);
            return;
        }
        
        if (hasOne && !hasZero) {
            option1.classList.remove('disabled');
            option0.classList.add('disabled');
            marqueeCurrent = 0;
        } else if (!hasOne && hasZero) {
            option1.classList.add('disabled');
            option0.classList.remove('disabled');
            marqueeCurrent = 1;
        } else {
            option1.classList.remove('disabled');
            option0.classList.remove('disabled');
        }
        
        marqueeActive = true;
        updateMarqueeHighlight();
        
        marqueeInterval = setInterval(() => {
            const hasOne = ammoOnes > 0;
            const hasZero = ammoZeros > 0;
            
            if (hasOne && hasZero) {
                marqueeCurrent = (marqueeCurrent + 1) % 2;
                updateMarqueeHighlight();
            }
        }, 400);
    }

    function stopMarquee() {
        marqueeActive = false;
        if (marqueeInterval) {
            clearInterval(marqueeInterval);
            marqueeInterval = null;
        }
    }

    function updateMarqueeHighlight() {
        option1.classList.remove('highlight');
        option0.classList.remove('highlight');
        
        if (marqueeCurrent === 0 && ammoOnes > 0) {
            option1.classList.add('highlight');
        } else if (marqueeCurrent === 1 && ammoZeros > 0) {
            option0.classList.add('highlight');
        }
    }

    function selectCurrentOption() {
        if (!marqueeActive) return;
        
        let selectedValue;
        if (marqueeCurrent === 0 && ammoOnes > 0) {
            selectedValue = 1;
            ammoOnes--;
        } else if (marqueeCurrent === 1 && ammoZeros > 0) {
            selectedValue = 0;
            ammoZeros--;
        } else { return; }
        
        inputValues.push(selectedValue);
        
        stickman.classList.add('anim-insert');
        setTimeout(() => stickman.classList.remove('anim-insert'), 500);

        if (ammoOnes <= 0) document.getElementById('held-1-s2').style.opacity = '0';
        if (ammoZeros <= 0) document.getElementById('held-0-s2').style.opacity = '0';
        
        if (inputValues.length === 1) {
            inA.innerText = selectedValue;
            inA.style.opacity = '1';
            
            inA.classList.remove('ammo-loaded');
            void inA.offsetWidth; 
            inA.classList.add('ammo-loaded');
            
            marqueeTitle.innerText = 'INPUT B';
            
            const hasOne = ammoOnes > 0;
            const hasZero = ammoZeros > 0;
            
            if (!hasOne && !hasZero) {
                stopMarquee();
                marqueeSelector.classList.remove('active');
                setTimeout(() => triggerDeath(true), 500);
                return;
            }
            
            if (hasOne && !hasZero) {
                option1.classList.remove('disabled');
                option0.classList.add('disabled');
                marqueeCurrent = 0;
            } else if (!hasOne && hasZero) {
                option1.classList.add('disabled');
                option0.classList.remove('disabled');
                marqueeCurrent = 1;
            }
            updateMarqueeHighlight();
            
        } else if (inputValues.length === 2) {
            inB.innerText = selectedValue;
            inB.style.opacity = '1';
            
            inB.classList.remove('ammo-loaded');
            void inB.offsetWidth; 
            inB.classList.add('ammo-loaded');
            
            // 第二顆子彈填入後，立刻鎖定玩家走位與轉向
            isPlayerControllable = false;
            stickman.classList.add('stand-still');
            
            stopMarquee();
            marqueeSelector.classList.remove('active');
            
            setTimeout(() => evaluateLogicGate(), 500);
        }
    }

    function fireBlueLaser() {
        const cw = scene2.clientWidth;
        const ch = scene2.clientHeight;
        
        // 怪物的 World X 基準 = 130
        const monsterScreenX = 130 - cameraX;
        const sx = (monsterScreenX * cw) / 100;
        const sy = (50 * ch) / 100 - 90; 

        const playerScreenX = worldX - cameraX;
        const ex = (playerScreenX * cw) / 100;
        const ey = (py * ch) / 100 - 15; 

        const cpx = (sx + ex) / 2;
        const cpy = Math.min(sy, ey) - (cw * 0.2); 

        blueLaserPath.setAttribute('d', `M ${sx},${sy} Q ${cpx},${cpy} ${ex},${ey}`);
        
        const len = blueLaserPath.getTotalLength();
        blueLaserPath.style.strokeDasharray = len;
        blueLaserPath.style.strokeDashoffset = len;
        blueLaserPath.style.opacity = 1;
        blueLaserPath.style.transition = 'none';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                blueLaserPath.style.transition = 'stroke-dashoffset 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53)';
                blueLaserPath.style.strokeDashoffset = 0;
            });
        });

        setTimeout(() => {
            blueLaserPath.style.transition = 'opacity 0.2s';
            blueLaserPath.style.opacity = 0;
        }, 500);
    }

    function fireWhiteLaser() {
        const cw = scene2.clientWidth;
        const ch = scene2.clientHeight;
        
        const andScreenX = 80 - cameraX;
        const sx = (andScreenX * cw) / 100 + 70;
        const sy = (50 * ch) / 100;

        // 怪物的 World X 基準 = 130
        const monsterScreenX = 130 - cameraX;
        const ex = (monsterScreenX * cw) / 100 - 40; 
        const ey = (50 * ch) / 100;

        whiteLaserPath.setAttribute('d', `M ${sx},${sy} L ${ex},${ey}`);
        
        const len = whiteLaserPath.getTotalLength();
        whiteLaserPath.style.strokeDasharray = len;
        whiteLaserPath.style.strokeDashoffset = len;
        whiteLaserPath.style.opacity = 1;
        whiteLaserPath.style.transition = 'none';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                whiteLaserPath.style.transition = 'stroke-dashoffset 0.3s ease-out';
                whiteLaserPath.style.strokeDashoffset = 0;
            });
        });

        setTimeout(() => {
            whiteLaserPath.style.transition = 'opacity 0.2s';
            whiteLaserPath.style.opacity = 0;
        }, 400);
    }

    function triggerDeath(returnToScene1 = false) {
        // 確保控制權被鎖定
        isPlayerControllable = false;
        stickman.classList.add('stand-still');
        
        fireBlueLaser();
        
        setTimeout(() => {
            stickman.classList.add('player-dead');
            setTimeout(() => { 
                if (returnToScene1) {
                    switchScene(2, 1); 
                } else {
                    switchScene(2, 2);
                }
            }, 1500);
        }, 350); 
    }

    function evaluateLogicGate() {
        const result = (inputValues[0] === 1 && inputValues[1] === 1) ? 1 : 0;
        
        setTimeout(() => {
            if (result === 1) {
                fireWhiteLaser();
                
                setTimeout(() => {
                    eyesAlive.style.opacity = '0';
                    eyesDead.style.opacity = '1';
                    orMonster.classList.add('monster-dead');
                    
                    setTimeout(() => { isPlayerControllable = true; }, 1000);
                }, 250); 
            } else {
                const hasEnoughOnes = (playerState.ammoOnes || 0) >= 2;
                triggerDeath(!hasEnoughOnes);
            }
        }, 500);
    }

    function handleKeyDown(e) {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = true;
        
        // 🌟 改為按下 Q 觸發填彈
        if (key === 'q' && marqueeActive) {
            selectCurrentOption();
        }
    }
    
    function handleKeyUp(e) {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = false;
    }

    window._scene2KeyDown = handleKeyDown;
    window._scene2KeyUp = handleKeyUp;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // =========================================
    // 🚀 遊戲主迴圈
    // =========================================
    function gameLoopS2() {
        if (!isPlayerControllable) {
            requestAnimationFrame(gameLoopS2);
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

        if (moved) { stickman.classList.remove('stand-still'); } 
        else { stickman.classList.add('stand-still'); }

        cameraX = Math.max(0, worldX - 20);
        let px = worldX - cameraX;

        stickman.style.left = `${px}%`;
        stickman.style.top = `${py}%`;
        stickman.style.transform = `translate(-50%, -50%) scaleX(${facing})`;

        environmentLayer.style.transform = `translateX(-${cameraX}%)`;

        const gateWorldX = 80; 
        const gateScreenX = gateWorldX - cameraX;
        const distanceToGate = Math.abs(worldX - gateWorldX);
        
        // 同步更新怪物的 World X 基準判斷 = 130
        const monsterWorldX = 130;
        const monsterScreenX = monsterWorldX - cameraX;
        const monsterInView = monsterScreenX <= 100; 
        
        if (distanceToGate < 25 && !gateTriggered && monsterInView) {
            isNearGate = true;
            
            marqueeSelector.style.left = `calc(${gateScreenX}% - 30px)`;
            marqueeSelector.style.top = 'calc(50% + 80px)';
            
            if (!marqueeActive && inputValues.length < 2) {
                marqueeSelector.classList.add('active');
                startMarquee();
            }
        } else if (distanceToGate >= 25 || !monsterInView) {
            isNearGate = false;
            
            if (marqueeActive && inputValues.length < 2) {
                marqueeSelector.classList.remove('active');
                stopMarquee();
            }
        }
        
        if (worldX > 100 && !gateTriggered && inputValues.length < 2) {
            gateTriggered = true;
            stopMarquee();
            marqueeSelector.classList.remove('active');
            
            const hasEnoughOnes = (playerState.ammoOnes || 0) >= 2;
            triggerDeath(!hasEnoughOnes); 
        }

        requestAnimationFrame(gameLoopS2);
    }

    requestAnimationFrame(gameLoopS2);
}
