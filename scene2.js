// =========================================
// WJ STUDIO - 場景 2：未知領域 (scene2.js)
// =========================================

export function initScene2(playerState, switchScene) {
    const scene2 = document.getElementById('scene-2');
    
    // 注入與場景 1 相同的樣式與介面
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
            
            /* 說明書樣式 (繼承 S1) */
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
        </style>

        <div style="width: 100%; height: 100%; background-color: #000; position: relative; overflow: hidden;">
            
            <div id="environment-layer-s2" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; transition: none; pointer-events: none;">
            </div>

            <div id="stickman-s2" class="stand-still" style="position: absolute; top: 50%; left: 20%; transform: translate(-50%, -50%); width: 80px; height: 120px; transition: none; z-index: 5;">
                <svg id="stickman-body-s2" viewBox="0 0 80 120" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="40" cy="32" r="16" />
                    <line x1="40" y1="48" x2="40" y2="75" />
                    
                    <g id="armL-s2">
                        <line x1="40" y1="56" x2="40" y2="85" />
                        <text id="held-1-s2" x="10" y="50" dy="0.3em" text-anchor="middle" fill="#fff" font-size="23" font-family="'Orbitron', sans-serif" font-weight="25" style="text-shadow: 0 0 0px rgba(255, 255, 255, 0.8);" opacity="0">1</text>
                    </g>
                    <g id="armR-s2">
                        <line x1="40" y1="56" x2="40" y2="85" />
                        <text id="held-0-s2" x="70" y="50" dy="0.3em" text-anchor="middle" fill="#fff" font-size="23" font-family="'Orbitron', sans-serif" font-weight="25" style="text-shadow: 0 0 0px rgba(255, 255, 255, 0.8);" opacity="0">0</text>
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

    // 🌟 同步你測試好的完美座標 (X: 10/70, Y: 50) 
    if (playerState.hasOne) {
        const heldOne = document.getElementById('held-1-s2');
        heldOne.style.opacity = '1';
        heldOne.setAttribute("x", "10"); 
        heldOne.setAttribute("y", "50"); 
    }
    if (playerState.hasZero) {
        const heldZero = document.getElementById('held-0-s2');
        heldZero.style.opacity = '1';
        heldZero.setAttribute("x", "70"); 
        heldZero.setAttribute("y", "50"); 
    }

    // 重新綁定右下角的書本按鈕 (確保它不會去控制已經被隱藏的第一關說明書)
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

    let isPlayerControllable = true; // 場景2一開始就能控制
    let worldX = 20; // 從左邊開始
    let py = 50; 
    let cameraX = 0; 
    let facing = 1;  
    const keys = { w: false, a: false, s: false, d: false };

    // 綁定新的鍵盤事件
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = true;
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = false;
    });

    // =========================================
    // 🚀 場景 2 專屬遊戲迴圈
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

        requestAnimationFrame(gameLoopS2);
    }

    // 啟動迴圈
    requestAnimationFrame(gameLoopS2);
}