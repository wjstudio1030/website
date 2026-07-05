// =========================================
// WJ STUDIO - 場景 3：全新領域 (scene3.js)
// =========================================

export function initScene3(playerState, switchScene) {
    const scene3 = document.getElementById('scene-3');
    
    // 移除舊的鍵盤事件監聽器
    if (window._scene2KeyDown) {
        window.removeEventListener('keydown', window._scene2KeyDown);
        window.removeEventListener('keyup', window._scene2KeyUp);
    }
    if (window._scene3KeyDown) {
        window.removeEventListener('keydown', window._scene3KeyDown);
        window.removeEventListener('keyup', window._scene3KeyUp);
    }

    // 讀取從 Scene 2 帶過來的狀態
    let ammoOnes = playerState.ammoOnes || 0;
    let ammoZeros = playerState.ammoZeros || 0;
    let hasHammer = playerState.hasHammer || true; // 理論上必定為 true
    let hasSecondManual = playerState.hasSecondManual || true; 

    // 注入場景 3 的核心 CSS 與基礎介面
    scene3.innerHTML = `
        <style>
            /* 走路搖擺動畫 */
            @keyframes walkBounce { 0%, 100% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, calc(-50% - 8px)); } }
            @keyframes armSwingL { 0%, 100% { transform: rotate(40deg); } 50% { transform: rotate(-40deg); } }
            @keyframes armSwingR { 0%, 100% { transform: rotate(-40deg); } 50% { transform: rotate(40deg); } }
            @keyframes legSwingL { 0%, 100% { transform: rotate(45deg); } 50% { transform: rotate(-45deg); } }
            @keyframes legSwingR { 0%, 100% { transform: rotate(-45deg); } 50% { transform: rotate(45deg); } }

            #stickman-body-s3 { animation: walkBounce 0.45s infinite ease-in-out; transform: translate(-50%, -50%); position: absolute; left: 50%; top: 50%; width: 100%; height: 100%; }
            #armL-s3 { animation: armSwingL 0.45s infinite ease-in-out; transform-origin: 40px 56px; }
            #armR-s3 { animation: armSwingR 0.45s infinite ease-in-out; transform-origin: 40px 56px; }
            #legL-s3 { animation: legSwingL 0.45s infinite ease-in-out; transform-origin: 40px 75px; }
            #legR-s3 { animation: legSwingR 0.45s infinite ease-in-out; transform-origin: 40px 75px; }

            /* 閒置狀態 */
            .stand-still #stickman-body-s3 { animation: none !important; transform: translate(-50%, -50%) !important; transition: transform 0.2s; }
            .stand-still #armL-s3 { animation: none !important; transform: rotate(-35deg) !important; transition: transform 0.3s ease; }
            .stand-still #armR-s3 { animation: none !important; transform: rotate(35deg) !important; transition: transform 0.3s ease; }
            .stand-still #legL-s3 { animation: none !important; transform: rotate(-15deg) !important; transition: transform 0.3s ease; }
            .stand-still #legR-s3 { animation: none !important; transform: rotate(15deg) !important; transition: transform 0.3s ease; }

            /* 武器狀態與揮擊動畫 (承襲完美版) */
            #held-hammer-s3 {
                opacity: 0; 
                transform-origin: 40px 85px; 
                transform: rotate(110deg) scale(0.4); 
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease;
                will-change: transform;
            }
            .stand-still:not(.anim-attack) #held-hammer-s3 {
                transform: rotate(60deg) scale(0.4) !important; 
            }

            @keyframes attackSwing {
                0% { transform: rotate(60deg) scale(0.4); }
                25% { transform: rotate(10deg) scale(0.4); } 
                60% { transform: rotate(160deg) scale(0.4); } 
                100% { transform: rotate(60deg) scale(0.4); } 
            }
            .anim-attack #held-hammer-s3 {
                animation: attackSwing 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
                transition: none !important; 
            }
            
            /* 攻擊時手部固定，避免與走路動畫錯亂 */
            .anim-attack #armL-s3 {
                animation: none !important;
                transform: rotate(-35deg) !important;
                transition: transform 0.1s ease;
            }
            .anim-attack #armR-s3 {
                animation: none !important;
                transform: rotate(45deg) !important; 
                transition: transform 0.1s ease;
            }

            /* 說明書 UI */
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
            
            .manual-page { display: none; flex: 1; flex-direction: column; gap: 30px; }
            .manual-page.active-page { display: flex; }
            
            @keyframes techScan {
                0% { opacity: 0; transform: scaleY(1.05); filter: blur(4px) brightness(2) drop-shadow(0 0 20px var(--brand-blue)); clip-path: polygon(0 0, 100% 0, 100% 5%, 0 5%); }
                30% { opacity: 0.6; transform: scaleY(1.02); filter: blur(1px) brightness(1.5); clip-path: polygon(0 0, 100% 0, 100% 40%, 0 40%); }
                100% { opacity: 1; transform: scaleY(1); filter: blur(0) brightness(1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
            }
            .scan-transition { animation: techScan 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards !important; }

            .page-btn { background: rgba(0, 0, 0, 0.5); border: 1px solid var(--brand-blue); color: var(--brand-blue); width: 45px; height: 45px; border-radius: 8px; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 0 10px rgba(0, 242, 254, 0.2); }
            .page-btn:hover { background: rgba(0, 242, 254, 0.2); box-shadow: 0 0 20px rgba(0, 242, 254, 0.6); color: #fff; }
            .page-btn.disabled { opacity: 0.2; pointer-events: none; border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.2); box-shadow: none; }
            .svg-glow { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.4)); }
        </style>

        <div style="width: 100%; height: 100%; background-color: #000; position: relative; overflow: hidden;">
            
            <!-- 場景 3 的環境層 (目前保留空白，未來新增道具、敵人放這裡) -->
            <div id="environment-layer-s3" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; transition: none; pointer-events: none;">
                <!-- 在這裡加入 Scene 3 的地板或裝飾 -->
            </div>

            <!-- 玩家火柴人 -->
            <div id="stickman-s3" class="stand-still" style="position: absolute; top: 50%; left: 20%; transform: translate(-50%, -50%); width: 80px; height: 120px; transition: none; z-index: 5;">
                <svg id="stickman-body-s3" viewBox="0 0 80 120" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round" style="overflow: visible;">
                    <circle cx="40" cy="32" r="16" />
                    <line x1="40" y1="48" x2="40" y2="75" />
                    
                    <g id="armL-s3">
                        <line x1="40" y1="56" x2="40" y2="85" />
                        <text id="held-1-s3" x="10" y="50" dy="0.3em" text-anchor="middle" fill="#fff" font-size="23" font-family="'Orbitron', sans-serif" font-weight="25" opacity="0">1</text>
                        <!-- AND Hammer -->
                        <g id="held-hammer-s3">
                            <line x1="40" y1="85" x2="40" y2="20" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
                            <path d="M 5 -10 L 75 -10 A 35 50 0 0 1 5 -10 Z" fill="#000" stroke="#fff" stroke-width="8" style="filter: drop-shadow(0 0 5px rgba(255,255,255,0.8));"/>
                        </g>
                    </g>
                    
                    <g id="armR-s3">
                        <line x1="40" y1="56" x2="40" y2="85" />
                        <text id="held-0-s3" x="70" y="50" dy="0.3em" text-anchor="middle" fill="#fff" font-size="23" font-family="'Orbitron', sans-serif" font-weight="25" opacity="0">0</text>
                    </g>
                    <line x1="40" y1="75" x2="40" y2="105" id="legL-s3" /> 
                    <line x1="40" y1="75" x2="40" y2="105" id="legR-s3" /> 
                </svg>
            </div>

            <!-- 說明書 (包含兩頁完整內容) -->
            <div id="manual-modal-s3" style="overscroll-behavior: contain; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); width: 85%; max-width: 900px; height: 85vh; background: rgba(10, 10, 15, 0.9); border: 1px solid var(--brand-blue); border-radius: 12px; box-shadow: 0 0 40px rgba(0, 242, 254, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.8); z-index: 250; display: flex; flex-direction: column; opacity: 0; pointer-events: none; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); backdrop-filter: blur(15px);">
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(0, 242, 254, 0.2);">
                    <div style="color: var(--brand-blue); font-family: 'Orbitron', sans-serif; font-size: 1.2rem; letter-spacing: 3px;">CHARACTER_MANUAL.exe</div>
                    <button id="close-manual-s3" style="background: transparent; border: none; outline: none; padding: 0; color: #fff; font-family: 'Orbitron', sans-serif; font-size: 1.5rem; cursor: pointer; transition: 0.2s;" onmouseover="this.style.color='#fff'; this.style.textShadow='0 0 10px #fff'" onmouseout="this.style.color='#fff'; this.style.textShadow='none'">✖</button>
                </div>
                
                <div id="manual-content-s3" style="flex: 1; padding: 30px; overflow-y: auto; overscroll-behavior: contain; display: flex; flex-direction: column;">
                    
                    <!-- 第 1 頁：移動與拾取 -->
                    <div id="manual-page-1-s3" class="manual-page active-page">
                        <div class="manual-layout" style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
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

                    <!-- 第 2 頁：Attack -->
                    <div id="manual-page-2-s3" class="manual-page">
                        <div class="manual-panel" style="width: 100%; flex: 1; justify-content: center;">
                            <div class="action-block" style="border-bottom: none; width: 100%; margin-bottom: 0;">
                                <div class="action-header" style="justify-content: flex-start; margin-bottom: 30px;">
                                    <div class="key-btn" style="border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">J</div>
                                    <div class="action-text" style="font-size: 2rem;">Attack</div>
                                </div>
                                
                                <!-- 完美調校版 AND Hammer 攻擊圖 -->
                                <svg class="svg-glow" viewBox="0 -50 450 250" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 230px; display: block; margin: 0 auto;">
                                    <g transform="rotate(-40, 95, 95)" stroke="#888" fill="none" stroke-dasharray="6 6">
                                        <line x1="95" y1="95" x2="230" y2="95" stroke-width="6"/>
                                        <path d="M 275 55 L 275 135 A 45 40 0 0 1 275 55 Z" stroke-width="3"/>
                                    </g>
                                    <g stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 4" opacity="0.8">
                                        <path d="M 160 35 Q 185 60 185 85" />
                                        <path d="M 190 15 Q 220 45 220 80" />
                                        <path d="M 215 0 Q 250 35 250 75" />
                                    </g>
                                    <g stroke="#fff" fill="none">
                                        <line x1="95" y1="95" x2="230" y2="95" stroke-width="6" stroke-linecap="round"/>
                                        <path d="M 275 55 L 275 135 A 45 40 0 0 1 275 55 Z" fill="#000" stroke-width="4"/>
                                    </g>
                                    <circle cx="75" cy="50" r="16" stroke="#fff" stroke-width="4" fill="none"/>
                                    <line x1="75" y1="66" x2="75" y2="115" stroke="#fff" stroke-width="4"/>
                                    <line x1="75" y1="115" x2="50" y2="160" stroke="#fff" stroke-width="4"/>
                                    <line x1="75" y1="115" x2="100" y2="160" stroke="#fff" stroke-width="4"/>
                                    <line x1="75" y1="80" x2="60" y2="105" stroke="#fff" stroke-width="4"/> 
                                    <line x1="75" y1="80" x2="95" y2="95" stroke="#fff" stroke-width="4"/> 
                                    <g transform="translate(15, 0)" stroke="#fff" stroke-width="4" fill="#000">
                                        <line x1="330" y1="50" x2="330" y2="20" />
                                        <path d="M 265 140 L 265 90 A 60 70 0 0 1 385 90 L 385 140 Z" />
                                        <g stroke-width="3" stroke="#fff" stroke-linecap="round">
                                            <path d="M 292 77 L 308 93 M 308 77 L 292 93" />
                                            <path d="M 342 77 L 358 93 M 358 77 L 342 93" />
                                        </g>
                                        <path d="M 275 140 Q 265 160 255 170" fill="none" stroke-width="4"/>
                                        <path d="M 305 140 Q 300 160 295 175" fill="none" stroke-width="4"/>
                                        <path d="M 345 140 Q 350 160 355 175" fill="none" stroke-width="4"/>
                                        <path d="M 375 140 Q 385 160 395 170" fill="none" stroke-width="4"/>
                                    </g>
                                    <path d="M 275 85 L 285 75 L 280 90 L 295 95 L 280 100 L 285 115 L 275 105 L 265 115 L 270 100 L 255 95 L 270 90 Z" fill="#fff" stroke="none" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pagination-bar" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 40px; border-top: 1px dashed rgba(0, 242, 254, 0.3); background: rgba(0, 0, 0, 0.4); border-radius: 0 0 12px 12px;">
                    <button id="prev-page-btn-s3" class="page-btn disabled" title="Previous Page">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="15,18 9,12 15,6" fill="currentColor"/></svg>
                    </button>
                    <!-- 在 Scene 3 預設就是兩頁 -->
                    <div id="page-indicator-s3" style="font-family: 'Orbitron', sans-serif; color: var(--brand-blue); letter-spacing: 4px; font-size: 1.2rem; text-shadow: 0 0 8px rgba(0,242,254,0.5);">PAGE 1 / 2</div>
                    <button id="next-page-btn-s3" class="page-btn" title="Next Page">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="9,18 15,12 9,6" fill="currentColor"/></svg>
                    </button>
                </div>
            </div>

        </div>
    `;

    // 取得 DOM 元素
    const environmentLayer = document.getElementById('environment-layer-s3');
    const stickman = document.getElementById('stickman-s3');
    const manualModal = document.getElementById('manual-modal-s3');
    const closeManual = document.getElementById('close-manual-s3');
    
    // 說明書分頁元素
    const manualContent = document.getElementById('manual-content-s3');
    const page1 = document.getElementById('manual-page-1-s3'); 
    const page2 = document.getElementById('manual-page-2-s3'); 
    const btnPrev = document.getElementById('prev-page-btn-s3');
    const btnNext = document.getElementById('next-page-btn-s3');
    const pageIndicator = document.getElementById('page-indicator-s3');
    const sfxOpenBook = new Audio('game_audio/game_openbook.mp3');
    const sfxPageTurn = new Audio('game_audio/game_pageturn.mp3');
    let currentManualPage = 1;

    // 根據狀態顯示裝備
    if (hasHammer) {
        document.getElementById('held-hammer-s3').style.opacity = '1';
    }
    if (ammoOnes > 0 && !hasHammer) document.getElementById('held-1-s3').style.opacity = '1';
    if (ammoZeros > 0) document.getElementById('held-0-s3').style.opacity = '1';

    function playActionSfx(audioObj) {
        const volSlider = document.getElementById('volumeSlider');
        if (!volSlider || volSlider.value == 0) return; 
        const sound = audioObj.cloneNode(); 
        sound.volume = volSlider.value / 100;
        sound.play().catch(e => console.log("SFX play prevented:", e));
    }

    // 說明書翻頁邏輯
    function updateManualPage(targetPage, useFlash = true) {
        if (useFlash) {
            manualContent.classList.remove('scan-transition');
            void manualContent.offsetWidth; 
            manualContent.classList.add('scan-transition');
        }

        setTimeout(() => {
            currentManualPage = targetPage;
            if (currentManualPage === 1) {
                page1.classList.add('active-page');
                page2.classList.remove('active-page');
                btnPrev.classList.add('disabled');
                btnNext.classList.remove('disabled'); // 已解鎖第二頁
            } else {
                page1.classList.remove('active-page');
                page2.classList.add('active-page');
                btnPrev.classList.remove('disabled');
                btnNext.classList.add('disabled');
            }
            pageIndicator.innerText = `PAGE ${currentManualPage} / 2`;
        }, useFlash ? 100 : 0); 
    }

    btnPrev.addEventListener('click', () => { 
        if (currentManualPage > 1) {
            playActionSfx(sfxPageTurn); // 🌟 播放翻頁音效
            updateManualPage(currentManualPage - 1); 
        }
    });

    btnNext.addEventListener('click', () => { 
        if (currentManualPage < 2) {
            playActionSfx(sfxPageTurn); // 🌟 播放翻頁音效
            updateManualPage(currentManualPage + 1); 
        }
    });

    // 打開與關閉說明書邏輯 (包含封印圖層功能)
    function openManual() {
        playActionSfx(sfxOpenBook);
        updateManualPage(1, false); 
        manualModal.classList.add('manual-active');
        isPlayerControllable = false; 
        stickman.classList.add('stand-still');
        
        const gameScreen = document.getElementById('gameScreen');
        const sceneManager = document.getElementById('scene-manager');
        const gameControls = document.querySelector('.game-controls');
        if (gameScreen) gameScreen.style.zIndex = 'auto'; 
        if (sceneManager) sceneManager.style.zIndex = '20'; 
        if (gameControls) gameControls.style.pointerEvents = 'none'; 
    }

    closeManual.addEventListener('click', () => {
        manualModal.classList.remove('manual-active');
        isPlayerControllable = true;

        const gameScreen = document.getElementById('gameScreen');
        const sceneManager = document.getElementById('scene-manager');
        const gameControls = document.querySelector('.game-controls');
        if (gameScreen) gameScreen.style.zIndex = '1';
        if (sceneManager) sceneManager.style.zIndex = '2';
        if (gameControls) gameControls.style.pointerEvents = 'auto';
    });

    // 重新綁定右下角按鈕
    let oldBtn = document.getElementById('inventory-manual-btn');
    if (oldBtn) {
        let manualBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(manualBtn, oldBtn);
        manualBtn.addEventListener('click', openManual);
    }

    // 遊戲狀態與鍵盤控制
    let isPlayerControllable = true; 
    let canAttack = true; 
    let worldX = 20; 
    let py = 50; 
    let cameraX = 0; 
    let facing = 1;  
    const keys = { w: false, a: false, s: false, d: false };

    function handleKeyDown(e) {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = true;

        // 打開說明書
        if (key === 'q' && isPlayerControllable) {
            openManual();
        }

        // 揮擊動作
        if (key === 'j' && hasHammer && isPlayerControllable && canAttack) {
            canAttack = false;
            stickman.classList.add('anim-attack');
            
            setTimeout(() => {
                stickman.classList.remove('anim-attack');
            }, 400);
            
            // 1秒冷卻
            setTimeout(() => {
                canAttack = true;
            }, 1000);
        }
    }
    
    function handleKeyUp(e) {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = false;
    }

    window._scene3KeyDown = handleKeyDown;
    window._scene3KeyUp = handleKeyUp;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 場景 3 遊戲主迴圈
    function gameLoopS3() {
        if (!isPlayerControllable) { 
            requestAnimationFrame(gameLoopS3); 
            return; 
        }

        let moved = false; let speedX = 0.4; let speedY = 0.3; 
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

        cameraX = Math.max(0, worldX - 20); 
        let px = worldX - cameraX;
        
        stickman.style.left = `${px}%`; 
        stickman.style.top = `${py}%`;
        stickman.style.transform = `translate(-50%, -50%) scaleX(${facing})`;
        environmentLayer.style.transform = `translateX(-${cameraX}%)`;

        requestAnimationFrame(gameLoopS3);
    }

    requestAnimationFrame(gameLoopS3);
}