// =========================================
// WJ STUDIO - 場景 3：全新領域 (scene3.js)
// =========================================

export function initScene3(playerState, switchScene) {
    const scene3 = document.getElementById('scene-3');
    
    if (window._scene2KeyDown) {
        window.removeEventListener('keydown', window._scene2KeyDown);
        window.removeEventListener('keyup', window._scene2KeyUp);
    }
    if (window._scene3KeyDown) {
        window.removeEventListener('keydown', window._scene3KeyDown);
        window.removeEventListener('keyup', window._scene3KeyUp);
    }

    let ammoOnes = playerState.ammoOnes || 0;
    let ammoZeros = playerState.ammoZeros || 0;
    let hasHammer = playerState.hasHammer || true; 
    let bookPickedUp = playerState.hasSecondManual || true; 

    scene3.innerHTML = `
        <style>
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

            .stand-still #stickman-body-s3 { animation: none !important; transform: translate(-50%, -50%) !important; transition: transform 0.2s; }
            .stand-still #armL-s3 { animation: none !important; transform: rotate(-35deg) !important; transition: transform 0.3s ease; }
            .stand-still #armR-s3 { animation: none !important; transform: rotate(35deg) !important; transition: transform 0.3s ease; }
            .stand-still #legL-s3 { animation: none !important; transform: rotate(-15deg) !important; transition: transform 0.3s ease; }
            .stand-still #legR-s3 { animation: none !important; transform: rotate(15deg) !important; transition: transform 0.3s ease; }

            #held-hammer-s3 { opacity: 0; transform-origin: 40px 85px; transform: rotate(110deg) scale(0.4); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease; will-change: transform; }
            .stand-still:not(.anim-attack) #held-hammer-s3 { transform: rotate(60deg) scale(0.4) !important; }

            @keyframes attackSwing { 0% { transform: rotate(60deg) scale(0.4); } 25% { transform: rotate(10deg) scale(0.4); } 60% { transform: rotate(160deg) scale(0.4); } 100% { transform: rotate(60deg) scale(0.4); } }
            .anim-attack #held-hammer-s3 { animation: attackSwing 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important; transition: none !important; }
            .anim-attack #armL-s3 { animation: none !important; transform: rotate(-35deg) !important; transition: transform 0.1s ease; }
            .anim-attack #armR-s3 { animation: none !important; transform: rotate(45deg) !important; transition: transform 0.1s ease; }

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
            
            @keyframes techScan { 0% { opacity: 0; transform: scaleY(1.05); filter: blur(4px) brightness(2) drop-shadow(0 0 20px var(--brand-blue)); clip-path: polygon(0 0, 100% 0, 100% 5%, 0 5%); } 30% { opacity: 0.6; transform: scaleY(1.02); filter: blur(1px) brightness(1.5); clip-path: polygon(0 0, 100% 0, 100% 40%, 0 40%); } 100% { opacity: 1; transform: scaleY(1); filter: blur(0) brightness(1); clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); } }
            .scan-transition { animation: techScan 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards !important; }

            .page-btn { background: rgba(0, 0, 0, 0.5); border: 1px solid var(--brand-blue); color: var(--brand-blue); width: 45px; height: 45px; border-radius: 8px; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 0 10px rgba(0, 242, 254, 0.2); }
            .page-btn:hover { background: rgba(0, 242, 254, 0.2); box-shadow: 0 0 20px rgba(0, 242, 254, 0.6); color: #fff; }
            .page-btn.disabled { opacity: 0.2; pointer-events: none; border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.2); box-shadow: none; }
            
            /* =========================================
               🌟 三角形怪核心動畫引擎
               ========================================= */
            .triangle-enemy { position: absolute; z-index: 4; transform: translate(-50%, -50%); filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.2)); }
            
            .tri-jump { animation: triJumpMotion 1.5s infinite; animation-delay: var(--jump-delay, 0s); }
            @keyframes triJumpMotion {
                0%, 15% { transform: translate(-50%, -50%) scaleX(var(--facing, 1)); animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1); }
                50% { transform: translate(-50%, calc(-50% - var(--jump-height))) scaleX(var(--facing, 1)); animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0); }
                85%, 100% { transform: translate(-50%, -50%) scaleX(var(--facing, 1)); }
            }
            
            .tri-eye-open { animation: triEyeOpenAnim 1.5s infinite step-end; animation-delay: var(--jump-delay, 0s); }
            .tri-eye-closed { animation: triEyeClosedAnim 1.5s infinite step-end; animation-delay: var(--jump-delay, 0s); opacity: 0; }
            @keyframes triEyeOpenAnim { 0% { opacity: 1; } 15% { opacity: 0; } 85% { opacity: 1; } 100% { opacity: 1; } }
            @keyframes triEyeClosedAnim { 0% { opacity: 0; } 15% { opacity: 1; } 85% { opacity: 0; } 100% { opacity: 0; } }

            .tri-leg-smooth { animation: triLegSmoothAnim 1.5s infinite; animation-delay: var(--jump-delay, 0s); fill: none; }
            @keyframes triLegSmoothAnim {
                0%, 10% { d: path('M 65 90 L 65 105 Q 65 112 73 112'); animation-timing-function: ease-in; }
                15%     { d: path('M 65 90 L 65 118 Q 65 118 65 118'); animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1); }
                50%     { d: path('M 65 90 L 65 102 Q 65 102 78 102'); animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0); }
                85%     { d: path('M 65 90 L 65 118 Q 65 118 65 118'); animation-timing-function: ease-out; }
                95%, 100% { d: path('M 65 90 L 65 105 Q 65 112 73 112'); }
            }
        </style>

        <div style="width: 100%; height: 100%; background-color: #000; position: relative; overflow: hidden;">
            
            <div id="environment-layer-s3" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; transition: none; pointer-events: none;">
                
                <svg id="enemy-small" class="triangle-enemy tri-jump" style="--jump-height: 50px; --jump-delay: 0s; --facing: 1; width: 70px; height: 70px; left: 100%; top: 60%;" viewBox="0 0 130 130" stroke="#fff" stroke-width="6" fill="#000" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="65" y1="20" x2="65" y2="5" />
                    <polygon points="65,20 6.5,90 123.5,90" />
                    <g class="tri-eye-open"><circle cx="56" cy="55" r="3" fill="#fff" stroke="none" /><circle cx="74" cy="55" r="3" fill="#fff" stroke="none" /></g>
                    <g class="tri-eye-closed"><polyline points="50,51 56,55 50,59" fill="none" stroke-linejoin="round"/><polyline points="80,51 74,55 80,59" fill="none" stroke-linejoin="round"/></g>
                    <path class="tri-leg-smooth" d="M 65 90 L 65 105 Q 65 112 73 112" />
                </svg>

                <svg id="enemy-medium" class="triangle-enemy tri-jump" style="--jump-height: 80px; --jump-delay: 0.2s; --facing: 1; width: 120px; height: 120px; left: 140%; top: 40%;" viewBox="0 0 130 130" stroke="#fff" stroke-width="5" fill="#000" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="65" y1="20" x2="65" y2="5" />
                    <polygon points="65,20 6.5,90 123.5,90" />
                    <g class="tri-eye-open"><circle cx="54" cy="55" r="3.5" fill="#fff" stroke="none" /><circle cx="76" cy="55" r="3.5" fill="#fff" stroke="none" /></g>
                    <g class="tri-eye-closed"><polyline points="48,50 55,55 48,60" fill="none" stroke-linejoin="round"/><polyline points="82,50 75,55 82,60" fill="none" stroke-linejoin="round"/></g>
                    <path class="tri-leg-smooth" d="M 65 90 L 65 105 Q 65 112 73 112" />
                </svg>

                <svg id="enemy-large" class="triangle-enemy tri-jump" style="--jump-height: 120px; --jump-delay: 0.5s; --facing: 1; width: 200px; height: 200px; left: 190%; top: 70%;" viewBox="0 0 130 130" stroke="#fff" stroke-width="4" fill="#000" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="65" y1="20" x2="65" y2="5" />
                    <polygon points="65,20 6.5,90 123.5,90" />
                    <g class="tri-eye-open"><circle cx="57" cy="55" r="4" fill="#fff" stroke="none" /><circle cx="73" cy="55" r="4" fill="#fff" stroke="none" /></g>
                    <g class="tri-eye-closed"><polyline points="51,51 60,55 51,59" fill="none" stroke-linejoin="round"/><polyline points="79,51 70,55 79,59" fill="none" stroke-linejoin="round"/></g>
                    <path class="tri-leg-smooth" d="M 65 90 L 65 105 Q 65 112 73 112" />
                </svg>

            </div>

            <div id="stickman-s3" class="stand-still" style="position: absolute; top: 50%; left: 20%; transform: translate(-50%, -50%); width: 80px; height: 120px; transition: none; z-index: 5;">
                <svg id="stickman-body-s3" viewBox="0 0 80 120" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round" style="overflow: visible;">
                    <circle cx="40" cy="32" r="16" />
                    <line x1="40" y1="48" x2="40" y2="75" />
                    <g id="armL-s3">
                        <line x1="40" y1="56" x2="40" y2="85" />
                        <text id="held-1-s3" x="10" y="50" dy="0.3em" text-anchor="middle" fill="#fff" font-size="23" font-family="'Orbitron', sans-serif" font-weight="25" opacity="0">1</text>
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

            <!-- 說明書 UI -->
            <div id="manual-modal-s3" style="overscroll-behavior: contain; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); width: 85%; max-width: 900px; height: 85vh; background: rgba(10, 10, 15, 0.9); border: 1px solid var(--brand-blue); border-radius: 12px; box-shadow: 0 0 40px rgba(0, 242, 254, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.8); z-index: 250; display: flex; flex-direction: column; opacity: 0; pointer-events: none; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); backdrop-filter: blur(15px);">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(0, 242, 254, 0.2);">
                    <div style="color: var(--brand-blue); font-family: 'Orbitron', sans-serif; font-size: 1.2rem; letter-spacing: 3px;">CHARACTER_MANUAL.exe</div>
                    <button id="close-manual-s3" style="background: transparent; border: none; outline: none; padding: 0; color: #fff; font-family: 'Orbitron', sans-serif; font-size: 1.5rem; cursor: pointer; transition: 0.2s;" onmouseover="this.style.color='#fff'; this.style.textShadow='0 0 10px #fff'" onmouseout="this.style.color='#fff'; this.style.textShadow='none'">✖</button>
                </div>
                <div id="manual-content-s3" style="flex: 1; padding: 30px; overflow-y: auto; overscroll-behavior: contain; display: flex; flex-direction: column;">
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
                                    <div class="action-header"><div class="key-btn" style="border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">E</div><div class="action-text">Pick up</div></div>
                                    <svg class="svg-glow" viewBox="0 0 200 100" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 120px;">
                                        <circle cx="50" cy="30" r="12" />
                                        <line x1="50" y1="42" x2="50" y2="70" />
                                        <line x1="50" y1="50" x2="35" y2="80" /> <line x1="50" y1="50" x2="80" y2="60" /> <line x1="50" y1="70" x2="35" y2="95" /> <line x1="50" y1="70" x2="65" y2="95" /> 
                                        <circle cx="85" cy="55" r="8" stroke="var(--brand-blue)" />
                                        <circle cx="130" cy="85" r="10" stroke="#888" stroke-dasharray="4 4" />
                                        <path d="M 120 75 Q 110 58 95 58" stroke="#888" stroke-width="2" fill="none" stroke-dasharray="3 3" />
                                        <polyline points="102,52 95,58 102,64" stroke="#888" stroke-width="2" fill="none" />
                                    </svg>
                                </div>
                                <div class="action-block" style="border-bottom: none;">
                                    <div class="action-header"><div class="key-btn" style="border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">Q</div><div class="action-text">USE</div></div>
                                    <svg class="svg-glow" viewBox="0 0 200 100" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 120px;">
                                        <circle cx="40" cy="40" r="10" />
                                        <line x1="40" y1="50" x2="40" y2="75" />
                                        <line x1="40" y1="55" x2="25" y2="80" /> <line x1="40" y1="55" x2="60" y2="60" /> <line x1="40" y1="75" x2="25" y2="95" /> <line x1="40" y1="75" x2="55" y2="95" />
                                        <line x1="120" y1="45" x2="140" y2="45" stroke="#fff" /> <line x1="120" y1="65" x2="140" y2="65" stroke="#fff" /> 
                                        <line x1="140" y1="35" x2="140" y2="75" /> <line x1="140" y1="35" x2="160" y2="35" /> <line x1="140" y1="75" x2="160" y2="75" />
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

                    <div id="manual-page-2-s3" class="manual-page">
                        <div class="manual-panel" style="width: 100%; flex: 1; justify-content: center;">
                            <div class="action-block" style="border-bottom: none; width: 100%; margin-bottom: 0;">
                                <div class="action-header" style="justify-content: flex-start; margin-bottom: 30px;">
                                    <div class="key-btn" style="border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">J</div>
                                    <div class="action-text" style="font-size: 2rem;">Attack</div>
                                </div>
                                <svg class="svg-glow" viewBox="0 -50 450 250" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 230px; display: block; margin: 0 auto;">
                                    <g transform="rotate(-40, 95, 95)" stroke="#888" fill="none" stroke-dasharray="6 6"><line x1="95" y1="95" x2="230" y2="95" stroke-width="6"/><path d="M 275 55 L 275 135 A 45 40 0 0 1 275 55 Z" stroke-width="3"/></g>
                                    <g stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 4" opacity="0.8"><path d="M 160 35 Q 185 60 185 85" /><path d="M 190 15 Q 220 45 220 80" /><path d="M 215 0 Q 250 35 250 75" /></g>
                                    <g stroke="#fff" fill="none"><line x1="95" y1="95" x2="230" y2="95" stroke-width="6" stroke-linecap="round"/><path d="M 275 55 L 275 135 A 45 40 0 0 1 275 55 Z" fill="#000" stroke-width="4"/></g>
                                    <circle cx="75" cy="50" r="16" stroke="#fff" stroke-width="4" fill="none"/>
                                    <line x1="75" y1="66" x2="75" y2="115" stroke="#fff" stroke-width="4"/>
                                    <line x1="75" y1="115" x2="50" y2="160" stroke="#fff" stroke-width="4"/>
                                    <line x1="75" y1="115" x2="100" y2="160" stroke="#fff" stroke-width="4"/>
                                    <line x1="75" y1="80" x2="60" y2="105" stroke="#fff" stroke-width="4"/> <line x1="75" y1="80" x2="95" y2="95" stroke="#fff" stroke-width="4"/> 
                                    <g transform="translate(15, 0)" stroke="#fff" stroke-width="4" fill="#000"><line x1="330" y1="50" x2="330" y2="20" /><path d="M 265 140 L 265 90 A 60 70 0 0 1 385 90 L 385 140 Z" /><g stroke-width="3" stroke="#fff" stroke-linecap="round"><path d="M 292 77 L 308 93 M 308 77 L 292 93" /><path d="M 342 77 L 358 93 M 358 77 L 342 93" /></g><path d="M 275 140 Q 265 160 255 170" fill="none" stroke-width="4"/><path d="M 305 140 Q 300 160 295 175" fill="none" stroke-width="4"/><path d="M 345 140 Q 350 160 355 175" fill="none" stroke-width="4"/><path d="M 375 140 Q 385 160 395 170" fill="none" stroke-width="4"/></g>
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
                    <div id="page-indicator-s3" style="font-family: 'Orbitron', sans-serif; color: var(--brand-blue); letter-spacing: 4px; font-size: 1.2rem; text-shadow: 0 0 8px rgba(0,242,254,0.5);">PAGE 1 / 2</div>
                    <button id="next-page-btn-s3" class="page-btn" title="Next Page">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="9,18 15,12 9,6" fill="currentColor"/></svg>
                    </button>
                </div>
            </div>

        </div>
    `;

    const environmentLayer = document.getElementById('environment-layer-s3');
    const stickman = document.getElementById('stickman-s3');
    const manualModal = document.getElementById('manual-modal-s3');
    const closeManual = document.getElementById('close-manual-s3');
    
    const manualContent = document.getElementById('manual-content-s3');
    const page1 = document.getElementById('manual-page-1-s3'); 
    const page2 = document.getElementById('manual-page-2-s3'); 
    const btnPrev = document.getElementById('prev-page-btn-s3');
    const btnNext = document.getElementById('next-page-btn-s3');
    const pageIndicator = document.getElementById('page-indicator-s3');
    let currentManualPage = 1;

    const sfxOpenBook = new Audio('game_audio/game_openbook.mp3');
    const sfxPageTurn = new Audio('game_audio/game_pageturn.mp3');

    function playActionSfx(audioObj) {
        const volSlider = document.getElementById('volumeSlider');
        if (!volSlider || volSlider.value == 0) return; 
        const sound = audioObj.cloneNode(); 
        sound.volume = volSlider.value / 100;
        sound.play().catch(e => console.log("SFX play prevented:", e));
    }

    if (hasHammer) {
        document.getElementById('held-hammer-s3').style.opacity = '1';
        document.getElementById('held-1-s3').style.opacity = '0';
        document.getElementById('held-0-s3').style.opacity = '0';
    } else {
        if (ammoOnes > 0) document.getElementById('held-1-s3').style.opacity = '1';
        if (ammoZeros > 0) document.getElementById('held-0-s3').style.opacity = '1';
    }

    function updateManualPage(targetPage, useFlash = true) {
        if (useFlash) {
            manualContent.classList.remove('scan-transition');
            void manualContent.offsetWidth; 
            manualContent.classList.add('scan-transition');
        }

        setTimeout(() => {
            currentManualPage = targetPage;
            if (currentManualPage === 1) {
                page1.classList.add('active-page'); page2.classList.remove('active-page');
                btnPrev.classList.add('disabled');
                if (bookPickedUp) btnNext.classList.remove('disabled'); else btnNext.classList.add('disabled');
            } else {
                page1.classList.remove('active-page'); page2.classList.add('active-page');
                btnPrev.classList.remove('disabled'); btnNext.classList.add('disabled');
            }
            pageIndicator.innerText = `PAGE ${currentManualPage} / ${bookPickedUp ? 2 : 1}`;
        }, useFlash ? 100 : 0); 
    }

    btnPrev.addEventListener('click', () => { if (currentManualPage > 1) { playActionSfx(sfxPageTurn); updateManualPage(currentManualPage - 1); } });
    btnNext.addEventListener('click', () => { if (currentManualPage < 2 && bookPickedUp) { playActionSfx(sfxPageTurn); updateManualPage(currentManualPage + 1); } });

    function openManual() {
        playActionSfx(sfxOpenBook);
        updateManualPage(1, false); 
        manualModal.classList.add('manual-active');
        isPlayerControllable = false; stickman.classList.add('stand-still');
        
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

    let manualBtn = document.getElementById('inventory-manual-btn');
    if (!manualBtn) {
        manualBtn = document.createElement('button'); manualBtn.id = 'inventory-manual-btn';
        manualBtn.className = 'control-btn'; manualBtn.title = "Character Manual";
        manualBtn.innerHTML = '<i class="fas fa-book"></i>';
        const gameControls = document.querySelector('.game-controls'); const volumeWrapper = document.querySelector('.volume-wrapper');
        if (gameControls && volumeWrapper) gameControls.insertBefore(manualBtn, volumeWrapper);
    } else {
        let newBtn = manualBtn.cloneNode(true);
        manualBtn.parentNode.replaceChild(newBtn, manualBtn); manualBtn = newBtn;
    }
    manualBtn.style.display = 'flex'; manualBtn.addEventListener('click', openManual);


    let isPlayerControllable = true; 
    let canAttack = true; 
    let worldX = 20; 
    let py = 50; 
    let cameraX = 0; 
    let facing = 1;  
    const keys = { w: false, a: false, s: false, d: false };

    // =========================================
    // 🌟 獨立精準追蹤 AI (Hitbox Edge Tracking)
    // 透過精確的 sideOffset，決定角尖剛好碰觸到玩家的最佳防守距離
    // =========================================
    const enemies = [
        { el: document.getElementById('enemy-small'), worldX: 100, worldY: 60, speed: 0.25, facing: 1, alive: true, sideOffset: 5 },
        { el: document.getElementById('enemy-medium'), worldX: 140, worldY: 40, speed: 0.18, facing: 1, alive: true, sideOffset: 8 },
        { el: document.getElementById('enemy-large'), worldX: 190, worldY: 70, speed: 0.12, facing: 1, alive: true, sideOffset: 12 }
    ];

    function handleKeyDown(e) {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = true;

        if (key === 'j' && hasHammer && isPlayerControllable && canAttack) {
            canAttack = false; stickman.classList.add('anim-attack');
            setTimeout(() => { stickman.classList.remove('anim-attack'); }, 400);
            setTimeout(() => { canAttack = true; }, 1000);
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

    function gameLoopS3() {
        if (!isPlayerControllable) { requestAnimationFrame(gameLoopS3); return; }

        let moved = false; let speedX = 0.4; let speedY = 0.3; 
        if (keys.w) { py -= speedY; moved = true; }
        if (keys.s) { py += speedY; moved = true; }
        if (keys.a) { worldX -= speedX; moved = true; facing = -1; }
        if (keys.d) { worldX += speedX; moved = true; facing = 1; }

        py = Math.max(10, Math.min(90, py)); 
        worldX = Math.max(5, worldX); 

        if (moved) stickman.classList.remove('stand-still'); else stickman.classList.add('stand-still');

        cameraX = Math.max(0, worldX - 20); 
        let px = worldX - cameraX;
        
        stickman.style.left = `${px}%`; stickman.style.top = `${py}%`;
        stickman.style.transform = `translate(-50%, -50%) scaleX(${facing})`;
        environmentLayer.style.transform = `translateX(-${cameraX}%)`;

        let activeEnemies = enemies.filter(e => e.alive);

        activeEnemies.forEach(enemy => {
            // 🌟 1. 決定要前往角色的「左側」還是「右側」
            // 根據目前怪物在玩家的哪一邊，繼續鎖定那一邊，不互相干擾
            let side = (enemy.worldX < worldX) ? -1 : 1; 

            // 🌟 2. 計算最佳碰撞距離點 (最適當位置)
            // 玩家座標 (worldX) 加上怪物專屬的半徑偏移量 (sideOffset)
            let targetX = worldX + (side * enemy.sideOffset);
            let targetY = py; // 完美跟隨上下移動

            // 防止目標點超界，這樣怪物就不會一直去撞牆壁
            targetX = Math.max(5, targetX);

            let dx = targetX - enemy.worldX;
            let dy = targetY - enemy.worldY;
            let distToTarget = Math.hypot(dx, dy);

            // 🌟 3. 移動邏輯：只要還沒到達專屬的完美側邊位置，就繼續移動
            // 給予 0.5 的緩衝 (deadzone)，避免到位後原地瘋狂抖動
            if (distToTarget > 0.5) { 
                enemy.worldX += (dx / distToTarget) * enemy.speed;
                enemy.worldY += (dy / distToTarget) * enemy.speed;
            }

            // 絕對邊界限制 (防止怪物本體超線)
            enemy.worldY = Math.max(10, Math.min(90, enemy.worldY));
            enemy.worldX = Math.max(5, enemy.worldX); 

            // 🌟 4. 完美動態轉向：眼睛與臉永遠盯著玩家的「真實中心點」
            let realDx = worldX - enemy.worldX;
            // 留有 1.0 的轉向死區，解決原地左右翻轉閃爍的問題
            if (realDx > 1.0) enemy.facing = -1; // 玩家在右，怪物朝右
            else if (realDx < -1.0) enemy.facing = 1; // 玩家在左，怪物朝左

            enemy.el.style.left = `${enemy.worldX}%`;
            enemy.el.style.top = `${enemy.worldY}%`;
            enemy.el.style.setProperty('--facing', enemy.facing);
        });

        requestAnimationFrame(gameLoopS3);
    }

    requestAnimationFrame(gameLoopS3);
}
