// =========================================
// WJ STUDIO - 場景 2：未知領域與邏輯閘 (scene2.js)
// =========================================

export function initScene2(playerState, switchScene) {
    const scene2 = document.getElementById('scene-2');
    
    // 移除舊的鍵盤事件監聽器
    if (window._scene2KeyDown) {
        window.removeEventListener('keydown', window._scene2KeyDown);
        window.removeEventListener('keyup', window._scene2KeyUp);
    }
    if (window._scene1KeyDown) {
        window.removeEventListener('keydown', window._scene1KeyDown);
        window.removeEventListener('keyup', window._scene1KeyUp);
    }
    
    // 從 playerState 讀取剛進入 scene2 時的彈藥數量
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
            
            .env-prop { position: absolute; opacity: 1; z-index: 2; transform: translate(-50%, -50%); }
            .svg-glow { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.4)); }

            /* 倒地動畫 */
            @keyframes playerDie {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(-90deg) translate(-30px, -20px); filter: brightness(0.5); }
            }
            .player-dead { animation: playerDie 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important; }

            /* 雷擊顫抖與焦黑死亡動畫 */
            @keyframes electrocuteAnim {
                0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); filter: invert(0) brightness(1); }
                25% { transform: translate(-52%, -48%) rotate(5deg) scale(1.05); filter: invert(1) brightness(2) drop-shadow(0 0 15px #0ff); }
                50% { transform: translate(-48%, -52%) rotate(-5deg) scale(1.05); filter: invert(0) brightness(1); }
                75% { transform: translate(-52%, -52%) rotate(5deg) scale(1.05); filter: invert(1) brightness(2) drop-shadow(0 0 15px #0ff); }
                100% { transform: translate(-50%, -50%) rotate(0deg) scale(1); filter: invert(0) brightness(1); }
            }
            .electrocuted { animation: electrocuteAnim 0.1s infinite !important; }
            .burnt-dead { animation: playerDie 0.4s forwards !important; filter: brightness(0.1) drop-shadow(0 0 5px #000) !important; }

            .monster-dead { animation: monsterDie 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            @keyframes monsterDie {
                0% { transform: translate(-50%, -50%) rotate(0deg); }
                100% { transform: translate(-50%, -50%) rotate(90deg) translate(20px, 30px); opacity: 0.3; }
            }

            #marquee-selector {
                position: absolute; background: rgba(10, 10, 15, 0.9); border: 2px solid var(--brand-blue); border-radius: 12px; padding: 15px 20px; text-align: center; backdrop-filter: blur(10px); box-shadow: 0 0 20px rgba(0, 242, 254, 0.4); opacity: 0; pointer-events: none; transition: opacity 0.3s ease; z-index: 200; display: flex; flex-direction: column; align-items: center; gap: 10px;
            }
            #marquee-selector.active { opacity: 1; pointer-events: auto; }
            .marquee-title { font-family: 'Orbitron', sans-serif; font-size: 0.8rem; color: rgba(255, 255, 255, 0.7); letter-spacing: 2px; margin-bottom: 5px; }
            .marquee-options { display: flex; gap: 15px; justify-content: center; }
            .marquee-option { width: 50px; height: 50px; display: flex; justify-content: center; align-items: center; font-family: 'Orbitron', sans-serif; font-size: 1.8rem; font-weight: 900; color: rgba(255, 255, 255, 0.3); border: 2px solid rgba(255, 255, 255, 0.2); border-radius: 8px; transition: all 0.15s ease; }
            .marquee-option.highlight { color: #fff; border-color: var(--brand-blue); background: rgba(0, 242, 254, 0.2); box-shadow: 0 0 15px var(--brand-blue); transform: scale(1.1); }
            .marquee-option.disabled { opacity: 0.2; pointer-events: none; }
            .marquee-hint { font-family: 'Orbitron', sans-serif; font-size: 0.7rem; color: var(--brand-blue); letter-spacing: 1px; }
            .marquee-key { display: inline-flex; justify-content: center; align-items: center; width: 22px; height: 22px; background: rgba(0, 242, 254, 0.2); border: 1px solid var(--brand-blue); border-radius: 4px; font-size: 0.8rem; margin: 0 3px; }

            @keyframes loadAmmo { 0% { transform: translateX(-40px) scale(1.5); opacity: 0; } 50% { transform: translateX(0) scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
            .ammo-loaded { animation: loadAmmo 0.4s ease-out forwards; }
            @keyframes insertAction { 0% { transform: rotate(-35deg); } 40% { transform: rotate(-90deg) translateX(-10px); } 100% { transform: rotate(-35deg); } }
            @keyframes bodyThrust { 0% { transform: translate(-50%, -50%); } 40% { transform: translate(-35%, -50%) rotate(10deg); } 100% { transform: translate(-50%, -50%); } }
            .anim-insert #armR-s2, .anim-insert #armL-s2 { animation: insertAction 0.5s ease-out !important; }
            .anim-insert #stickman-body-s2 { animation: bodyThrust 0.5s ease-out !important; }

            /* 寶箱噴出掉落動畫 */
            @keyframes chestDrop {
                0% { transform: translate(-50%, -50%) scale(0.2) translateY(-40px); opacity: 0; }
                60% { transform: translate(-50%, -50%) scale(1.2) translateY(10px); opacity: 1; }
                80% { transform: translate(-50%, -50%) scale(0.9) translateY(-5px); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1) translateY(0); opacity: 1; }
            }
            .chest-dropped { animation: chestDrop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important; }

            /* 寶箱跳動與發光特效 */
            @keyframes chestJump {
                0%, 100% { transform: translate(-50%, -50%) scale(1); }
                20% { transform: translate(-50%, -60%) scale(0.9, 1.1); }
                40% { transform: translate(-50%, -50%) scale(1.1, 0.9); }
                60% { transform: translate(-50%, -55%) scale(0.95, 1.05); }
                80% { transform: translate(-50%, -50%) scale(1.05, 0.95); }
            }
            @keyframes chestGlowAnim {
                0%, 100% { filter: drop-shadow(0 0 5px rgba(255,255,255,0.4)); stroke: #fff; }
                50% { filter: drop-shadow(0 0 25px #0ff) drop-shadow(0 0 40px #0ff); stroke: #0ff; }
            }
            .chest-opening { animation: chestJump 0.8s ease-in-out, chestGlowAnim 0.8s infinite alternate !important; }
            
            @keyframes floatPrompt { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
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

                <svg id="or-monster" class="env-prop svg-glow" viewBox="0 0 300 300" stroke="#fff" stroke-width="4" fill="#000" stroke-linecap="round" stroke-linejoin="round" style="width: 250px; height: 250px; left: 130%; top: 50%; transition: transform 0.8s ease;">
                    <g transform="translate(150, 120) scale(1.2)">
                        <line x1="0" y1="-60" x2="0" y2="-90" stroke-width="6" />
                        <path d="M -45 45 Q 0 15 45 45 Q 60 -5 0 -60 Q -60 -5 -45 45 Z" fill="#000" stroke-width="4" />
                        <g id="monster-eyes-alive">
                            <circle cx="-12" cy="-5" r="3" fill="#fff" stroke="none" />
                            <circle cx="12" cy="-5" r="3" fill="#fff" stroke="none" />
                        </g>
                        <g id="monster-eyes-dead" style="opacity: 0;">
                            <path d="M -16 -9 L -8 -1 M -8 -9 L -16 -1" stroke="#fff" stroke-width="2" />
                            <path d="M 8 -9 L 16 -1 M 16 -9 L 8 -1" stroke="#fff" stroke-width="2" />
                        </g>
                        <line x1="-30" y1="37" x2="-40" y2="80" stroke-width="4" />
                        <line x1="-10" y1="28" x2="-15" y2="85" stroke-width="4" />
                        <line x1="10" y1="28" x2="15" y2="85" stroke-width="4" />
                        <line x1="30" y1="37" x2="40" y2="80" stroke-width="4" />
                    </g>
                </svg>

                <svg id="combo-circuit" class="env-prop svg-glow" viewBox="0 0 300 200" stroke="#fff" stroke-width="5" fill="#000" stroke-linecap="round" stroke-linejoin="round" style="width: 280px; height: 180px; left: 230%; top: 50%;">
                    <path d="M 100 50 L 130 50 L 130 80 L 160 80" fill="none" />
                    <path d="M 90 150 L 130 150 L 130 120 L 160 120" fill="none" />
                    <path d="M 0 30 L 25 30" fill="none" />
                    <path d="M 0 70 L 25 70" fill="none" />
                    <path d="M 0 130 L 20 130" fill="none" />
                    <path d="M 0 170 L 20 170" fill="none" />
                    <path d="M 230 100 L 280 100" fill="none" />
                    <path d="M 20 10 Q 40 50 20 90 Q 60 90 100 50 Q 60 10 20 10 Z" fill="#000" />
                    <path d="M 20 110 L 50 110 A 40 40 0 0 1 50 190 L 20 190 Z" fill="#000" />
                    <path d="M 160 60 L 190 60 A 40 40 0 0 1 190 140 L 160 140 Z" fill="#000" />
                </svg>

                <div id="input-c1-display" style="position:absolute; left:calc(230% - 175px); top:calc(50% - 73px); color:#fff; font-family:'Orbitron', sans-serif; font-size:18px; font-weight:900; text-shadow:0 0 10px #fff; opacity:0; transition:0.3s; z-index: 5;"></div>
                <div id="input-c2-display" style="position:absolute; left:calc(230% - 175px); top:calc(50% - 37px); color:#fff; font-family:'Orbitron', sans-serif; font-size:18px; font-weight:900; text-shadow:0 0 10px #fff; opacity:0; transition:0.3s; z-index: 5;"></div>
                <div id="input-c3-display" style="position:absolute; left:calc(230% - 175px); top:calc(50% + 17px); color:#fff; font-family:'Orbitron', sans-serif; font-size:18px; font-weight:900; text-shadow:0 0 10px #fff; opacity:0; transition:0.3s; z-index: 5;"></div>
                <div id="input-c4-display" style="position:absolute; left:calc(230% - 175px); top:calc(50% + 53px); color:#fff; font-family:'Orbitron', sans-serif; font-size:18px; font-weight:900; text-shadow:0 0 10px #fff; opacity:0; transition:0.3s; z-index: 5;"></div>

                <svg id="xor-monster" class="env-prop svg-glow" viewBox="-40 -20 340 320" stroke="#fff" stroke-width="4" fill="#000" stroke-linecap="round" stroke-linejoin="round" style="width: 270px; height: 260px; left: 280%; top: 50%; overflow: visible; transition: transform 0.8s ease;">
                    <g transform="translate(150, 120) scale(1.2)">
                        <line x1="0" y1="-60" x2="0" y2="-90" stroke-width="6" />
                        <path d="M -25 47 Q -70 80 -100 30" fill="none" stroke-width="5" />
                        <g transform="translate(-100, 30) rotate(-25)">
                            <path d="M -25 0 L 25 0 A 25 25 0 0 1 -25 0 Z" fill="#000" stroke-width="4" />
                            <line x1="-12" y1="0" x2="-12" y2="-35" stroke-width="5" />
                            <line x1="12" y1="0" x2="12" y2="-35" stroke-width="5" />
                            <path d="M -12 -35 L -4 -45 L -15 -55 L -5 -70" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="miter" />
                            <path d="M 12 -35 L 20 -45 L 9 -55 L 19 -70" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="miter" />
                        </g>
                        <path d="M 15 44 L 15 80 L 30 110" fill="none" stroke-width="4" />
                        <path d="M 35 51 L 45 90 L 65 115" fill="none" stroke-width="4" />
                        <path d="M -45 57 Q 0 27 45 57" fill="none" stroke-width="5" />
                        <path d="M -45 45 Q 0 15 45 45 Q 60 -5 0 -60 Q -60 -5 -45 45 Z" fill="#000" stroke-width="4" />
                        
                        <g id="xor-monster-eyes-alive">
                            <circle cx="-12" cy="-5" r="3" fill="#fff" stroke="none" />
                            <circle cx="12" cy="-5" r="3" fill="#fff" stroke="none" />
                        </g>
                        <g id="xor-monster-eyes-dead" style="opacity: 0;">
                            <path d="M -16 -9 L -8 -1 M -8 -9 L -16 -1" stroke="#fff" stroke-width="2" />
                            <path d="M 8 -9 L 16 -1 M 16 -9 L 8 -1" stroke="#fff" stroke-width="2" />
                        </g>
                    </g>
                </svg>

                <svg id="and-chest" class="env-prop svg-glow" viewBox="-50 -80 100 120" stroke="#fff" stroke-width="4" fill="#000" stroke-linecap="round" stroke-linejoin="round" style="width: 100px; height: 120px; left: 285%; top: 58%; opacity: 0;">
                    <line x1="-15" y1="-70" x2="-15" y2="-30" />
                    <line x1="15" y1="-70" x2="15" y2="-30" />
                    <path d="M -30 -30 L 30 -30 L 30 0 A 30 30 0 0 1 -30 0 Z" fill="#000" />
                </svg>
                
                <div id="chest-e-prompt" style="position: absolute; left: calc(285% - 15px); top: calc(58% - 80px); width: 30px; height: 30px; background: rgba(0, 242, 254, 0.15); border: 2px solid var(--brand-blue); border-radius: 6px; color: #fff; font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 14px; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s; z-index: 20; box-shadow: 0 0 10px var(--brand-blue); animation: floatPrompt 1.5s infinite ease-in-out; pointer-events: none;">E</div>

            </div>

            <svg id="laser-canvas" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:15; overflow:visible;">
                <path id="blue-laser-path" fill="none" stroke="var(--brand-blue)" stroke-width="8" stroke-linecap="round" filter="drop-shadow(0 0 10px var(--brand-blue))" d="" style="opacity: 0;" />
                <path id="white-laser-path" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" filter="drop-shadow(0 0 15px #fff)" d="" style="opacity: 0;" />
                <path id="lightning-path" fill="none" stroke="#0ff" stroke-width="5" stroke-linejoin="miter" filter="drop-shadow(0 0 10px #0ff) drop-shadow(0 0 20px #fff)" d="" style="opacity: 0;" />
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

            <div id="loot-panel" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.8); opacity: 0; pointer-events: none; background: rgba(10,10,15,0.95); border: 2px solid var(--brand-blue); border-radius: 12px; padding: 40px 60px; box-shadow: 0 0 40px rgba(0,242,254,0.4), inset 0 0 20px rgba(0,242,254,0.2); text-align: center; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 300; backdrop-filter: blur(10px);">
                <div style="color: var(--brand-blue); font-family: 'Orbitron', sans-serif; font-size: 1.5rem; letter-spacing: 3px; margin-bottom: 30px; text-shadow: 0 0 10px rgba(0,242,254,0.5);">CHEST OPENED</div>
                <div style="display: flex; justify-content: center; gap: 40px; font-family: 'Orbitron', sans-serif; font-size: 2.5rem; font-weight: 900; color: #fff;">
                    <div style="text-shadow: 0 0 15px rgba(255,255,255,0.8);">0 : x4</div>
                    <div style="text-shadow: 0 0 15px rgba(255,255,255,0.8);">1 : x1</div>
                </div>
            </div>

            <div id="manual-modal-s2" style="overscroll-behavior: contain; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); width: 85%; max-width: 900px; height: 80vh; background: rgba(10, 10, 15, 0.9); border: 1px solid var(--brand-blue); border-radius: 12px; box-shadow: 0 0 40px rgba(0, 242, 254, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.8); z-index: 100; display: flex; flex-direction: column; opacity: 0; pointer-events: none; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); backdrop-filter: blur(15px);">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(0, 242, 254, 0.2);">
                    <div style="color: var(--brand-blue); font-family: 'Orbitron', sans-serif; font-size: 1.2rem; letter-spacing: 3px;">CHARACTER_MANUAL.exe</div>
                    <button id="close-manual-s2" style="background: transparent; border: none; outline: none; padding: 0; color: #fff; font-family: 'Orbitron', sans-serif; font-size: 1.5rem; cursor: pointer; transition: 0.2s;" onmouseover="this.style.color='#ff0844'" onmouseout="this.style.color='#fff'">✖</button>
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
    const inC1 = document.getElementById('input-c1-display');
    const inC2 = document.getElementById('input-c2-display');
    const inC3 = document.getElementById('input-c3-display');
    const inC4 = document.getElementById('input-c4-display');

    const orMonster = document.getElementById('or-monster');
    const xorMonster = document.getElementById('xor-monster');
    const eyesAlive = document.getElementById('monster-eyes-alive');
    const eyesDead = document.getElementById('monster-eyes-dead');
    const xorEyesAlive = document.getElementById('xor-monster-eyes-alive');
    const xorEyesDead = document.getElementById('xor-monster-eyes-dead');
    
    const blueLaserPath = document.getElementById('blue-laser-path');
    const whiteLaserPath = document.getElementById('white-laser-path');
    const lightningPath = document.getElementById('lightning-path');

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

    let activePuzzle = 1;
    let inputValues1 = []; 
    let inputValues2 = []; 
    let gate1Triggered = false;
    let gate2Triggered = false;
    let isNearGate = false;
    
    // 寶箱相關狀態
    let isNearChest = false;
    let chestOpened = false;
    
    let marqueeCurrent = 0; 
    let marqueeInterval = null;
    let marqueeActive = false;

    function startMarquee() {
        const hasOne = ammoOnes > 0;
        const hasZero = ammoZeros > 0;
        
        if (!hasOne && !hasZero) {
            if (activePuzzle === 1) triggerBlueLaserDeath(true);
            else triggerLightningDeath(true);
            return;
        }
        
        if (hasOne && !hasZero) {
            option1.classList.remove('disabled'); option0.classList.add('disabled'); marqueeCurrent = 0;
        } else if (!hasOne && hasZero) {
            option1.classList.add('disabled'); option0.classList.remove('disabled'); marqueeCurrent = 1;
        } else {
            option1.classList.remove('disabled'); option0.classList.remove('disabled');
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
        if (marqueeCurrent === 0 && ammoOnes > 0) option1.classList.add('highlight');
        else if (marqueeCurrent === 1 && ammoZeros > 0) option0.classList.add('highlight');
    }

    function selectCurrentOption() {
        if (!marqueeActive) return;
        
        let selectedValue;
        if (marqueeCurrent === 0 && ammoOnes > 0) { selectedValue = 1; ammoOnes--; } 
        else if (marqueeCurrent === 1 && ammoZeros > 0) { selectedValue = 0; ammoZeros--; } 
        else { return; }
        
        stickman.classList.add('anim-insert');
        setTimeout(() => stickman.classList.remove('anim-insert'), 500);

        if (ammoOnes <= 0) document.getElementById('held-1-s2').style.opacity = '0';
        if (ammoZeros <= 0) document.getElementById('held-0-s2').style.opacity = '0';
        
        // 第一關 (AND 閘)
        if (activePuzzle === 1) {
            inputValues1.push(selectedValue);
            
            if (inputValues1.length === 1) {
                inA.innerText = selectedValue; inA.style.opacity = '1';
                inA.classList.remove('ammo-loaded'); void inA.offsetWidth; inA.classList.add('ammo-loaded');
                marqueeTitle.innerText = 'INPUT B';
                
                if (ammoOnes <= 0 && ammoZeros <= 0) {
                    stopMarquee(); marqueeSelector.classList.remove('active');
                    setTimeout(() => triggerBlueLaserDeath(true), 500); return;
                }
                
                if (ammoOnes > 0 && ammoZeros <= 0) { option1.classList.remove('disabled'); option0.classList.add('disabled'); marqueeCurrent = 0; }
                else if (ammoOnes <= 0 && ammoZeros > 0) { option1.classList.add('disabled'); option0.classList.remove('disabled'); marqueeCurrent = 1; }
                updateMarqueeHighlight();
                
            } else if (inputValues1.length === 2) {
                inB.innerText = selectedValue; inB.style.opacity = '1';
                inB.classList.remove('ammo-loaded'); void inB.offsetWidth; inB.classList.add('ammo-loaded');
                
                isPlayerControllable = false; stickman.classList.add('stand-still');
                stopMarquee(); marqueeSelector.classList.remove('active');
                setTimeout(() => evaluatePuzzle1(), 500);
            }
        } 
        // 第二關 (複合電路)
        else if (activePuzzle === 2) {
            inputValues2.push(selectedValue);
            const len = inputValues2.length;
            
            const targetDisplays = [inC1, inC2, inC3, inC4];
            const nextTitles = ['OR INPUT 2', 'AND INPUT 1', 'AND INPUT 2', 'COMPUTING...'];
            
            const display = targetDisplays[len - 1];
            display.innerText = selectedValue;
            display.style.opacity = '1';
            display.classList.remove('ammo-loaded'); void display.offsetWidth; display.classList.add('ammo-loaded');
            
            if (len < 4) {
                marqueeTitle.innerText = nextTitles[len - 1];
                if (ammoOnes <= 0 && ammoZeros <= 0) {
                    stopMarquee(); marqueeSelector.classList.remove('active');
                    setTimeout(() => triggerLightningDeath(true), 500); return;
                }
                if (ammoOnes > 0 && ammoZeros <= 0) { option1.classList.remove('disabled'); option0.classList.add('disabled'); marqueeCurrent = 0; }
                else if (ammoOnes <= 0 && ammoZeros > 0) { option1.classList.add('disabled'); option0.classList.remove('disabled'); marqueeCurrent = 1; }
                updateMarqueeHighlight();
            } else {
                isPlayerControllable = false; stickman.classList.add('stand-still');
                stopMarquee(); marqueeSelector.classList.remove('active');
                setTimeout(() => evaluatePuzzle2(), 500);
            }
        }
    }

    // =========================================
    // 動畫與結局系統
    // =========================================
    
    function fireBlueLaser() {
        const cw = scene2.clientWidth; const ch = scene2.clientHeight;
        const sx = ((130 - cameraX) * cw) / 100; const sy = (50 * ch) / 100 - 115; 
        const ex = ((worldX - cameraX) * cw) / 100; const ey = (py * ch) / 100 - 15; 
        const cpx = (sx + ex) / 2; const cpy = Math.min(sy, ey) - (cw * 0.2); 

        blueLaserPath.setAttribute('d', `M ${sx},${sy} Q ${cpx},${cpy} ${ex},${ey}`);
        const len = blueLaserPath.getTotalLength();
        blueLaserPath.style.strokeDasharray = len; blueLaserPath.style.strokeDashoffset = len;
        blueLaserPath.style.opacity = 1; blueLaserPath.style.transition = 'none';

        requestAnimationFrame(() => { requestAnimationFrame(() => {
            blueLaserPath.style.transition = 'stroke-dashoffset 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53)';
            blueLaserPath.style.strokeDashoffset = 0;
        });});
        setTimeout(() => { blueLaserPath.style.transition = 'opacity 0.2s'; blueLaserPath.style.opacity = 0; }, 500);
    }

    function fireLightningAttack() {
        const cw = scene2.clientWidth; const ch = scene2.clientHeight;
        const sx = ((280 - cameraX) * cw) / 100 - 70; 
        const sy = (50 * ch) / 100 + 10;
        const ex = ((worldX - cameraX) * cw) / 100;
        const ey = (py * ch) / 100 - 15;

        const lightningInterval = setInterval(() => {
            let d = `M ${sx},${sy} `;
            const segments = 6;
            for(let i=1; i<segments; i++) {
                let px = sx + (ex - sx) * (i/segments) + (Math.random() - 0.5) * 60;
                let py = sy + (ey - sy) * (i/segments) + (Math.random() - 0.5) * 60;
                d += `L ${px},${py} `;
            }
            d += `L ${ex},${ey}`;
            lightningPath.setAttribute('d', d);
        }, 50); 

        lightningPath.style.opacity = 1;
        setTimeout(() => { clearInterval(lightningInterval); lightningPath.style.opacity = 0; lightningPath.setAttribute('d', ''); }, 600);
    }

    function fireWhiteLaser(sourceWorldX, targetWorldX, outputXOffset = 0) {
        const cw = scene2.clientWidth; const ch = scene2.clientHeight;
        const sx = ((sourceWorldX - cameraX) * cw) / 100 + outputXOffset; 
        const sy = (50 * ch) / 100;
        const ex = ((targetWorldX - cameraX) * cw) / 100 - 40; 
        const ey = (50 * ch) / 100;

        whiteLaserPath.setAttribute('d', `M ${sx},${sy} L ${ex},${ey}`);
        const len = whiteLaserPath.getTotalLength();
        whiteLaserPath.style.strokeDasharray = len; whiteLaserPath.style.strokeDashoffset = len;
        whiteLaserPath.style.opacity = 1; whiteLaserPath.style.transition = 'none';

        requestAnimationFrame(() => { requestAnimationFrame(() => {
            whiteLaserPath.style.transition = 'stroke-dashoffset 0.3s ease-out';
            whiteLaserPath.style.strokeDashoffset = 0;
        });});
        setTimeout(() => { whiteLaserPath.style.transition = 'opacity 0.2s'; whiteLaserPath.style.opacity = 0; }, 400);
    }

    function triggerBlueLaserDeath(returnToScene1 = false) {
        isPlayerControllable = false; stickman.classList.add('stand-still');
        fireBlueLaser();
        setTimeout(() => {
            stickman.classList.add('player-dead');
            setTimeout(() => { switchScene(2, returnToScene1 ? 1 : 2); }, 1500);
        }, 350); 
    }

    function triggerLightningDeath(returnToScene1 = false) {
        isPlayerControllable = false; stickman.classList.add('stand-still');
        fireLightningAttack();
        
        setTimeout(() => {
            stickman.classList.add('electrocuted'); 
            setTimeout(() => {
                stickman.classList.remove('electrocuted');
                stickman.classList.add('burnt-dead'); 
                setTimeout(() => { switchScene(2, returnToScene1 ? 1 : 2); }, 1500);
            }, 600); 
        }, 100); 
    }

    function evaluatePuzzle1() {
        const result = (inputValues1[0] === 1 && inputValues1[1] === 1) ? 1 : 0;
        setTimeout(() => {
            if (result === 1) {
                fireWhiteLaser(80, 130, 70);
                setTimeout(() => {
                    eyesAlive.style.opacity = '0'; eyesDead.style.opacity = '1';
                    orMonster.classList.add('monster-dead');
                    setTimeout(() => { 
                        isPlayerControllable = true; 
                        activePuzzle = 2; 
                        marqueeTitle.innerText = 'OR INPUT 1'; 
                    }, 1000);
                }, 250); 
            } else {
                const totalInitialAmmo = (playerState.ammoOnes || 0) + (playerState.ammoZeros || 0);
                triggerBlueLaserDeath(totalInitialAmmo < 6);
            }
        }, 500);
    }

    function evaluatePuzzle2() {
        const orResult = (inputValues2[0] === 1 || inputValues2[1] === 1) ? 1 : 0;
        const andResult = (inputValues2[2] === 1 && inputValues2[3] === 1) ? 1 : 0;
        const finalResult = (orResult === 1 && andResult === 1) ? 1 : 0;

        setTimeout(() => {
            if (finalResult === 1) {
                fireWhiteLaser(230, 280, 122);
                setTimeout(() => {
                    xorMonster.style.opacity = '0.3';
                    xorMonster.style.transform = 'translate(-50%, -50%) rotate(90deg) translate(20px, 30px)';
                    
                    // 🌟 怪物死亡後，眼睛變成 X
                    xorEyesAlive.style.opacity = '0';
                    xorEyesDead.style.opacity = '1';
                    
                    // 🌟 怪物死掉後，顯示寶箱掉落動畫
                    setTimeout(() => { 
                        const chest = document.getElementById('and-chest');
                        chest.style.opacity = '1'; // 確保動畫前就不會透明
                        chest.classList.add('chest-dropped');
                    }, 400); 
                    
                    setTimeout(() => { 
                        isPlayerControllable = true; 
                        activePuzzle = 3; 
                    }, 1000);
                }, 250); 
            } else {
                const totalInitialAmmo = (playerState.ammoOnes || 0) + (playerState.ammoZeros || 0);
                triggerLightningDeath(totalInitialAmmo < 6);
            }
        }, 500);
    }

    // =========================================
    // ⌨️ 按鍵與互動控制
    // =========================================
    function handleKeyDown(e) {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = true;
        
        if (key === 'q' && marqueeActive) {
            selectCurrentOption();
        }

        // 🌟 寶箱開啟互動
        if (key === 'e') {
            if (activePuzzle === 3 && isNearChest && !chestOpened) {
                chestOpened = true;
                isPlayerControllable = false;
                stickman.classList.add('stand-still');
                document.getElementById('chest-e-prompt').style.opacity = '0';
                
                const chest = document.getElementById('and-chest');
                // 移除掉落動畫，觸發寶箱跳動與發光動畫，這樣就不會閃爍了
                chest.classList.remove('chest-dropped');
                chest.classList.add('chest-opening');
                
                setTimeout(() => {
                    // 動畫結束，保持發光狀態
                    chest.classList.remove('chest-opening');
                    chest.style.filter = 'drop-shadow(0 0 15px #0ff)';
                    chest.style.stroke = '#0ff';
                    
                    // 顯示戰利品面板
                    const lootPanel = document.getElementById('loot-panel');
                    lootPanel.style.opacity = '1';
                    lootPanel.style.transform = 'translate(-50%, -50%) scale(1)';
                    
                    // 正式發放彈藥
                    ammoOnes += 1;
                    ammoZeros += 4;
                    document.getElementById('held-1-s2').style.opacity = '1';
                    document.getElementById('held-0-s2').style.opacity = '1';

                    // 🌟 3 秒後自動關閉面板並恢復控制
                    setTimeout(() => {
                        lootPanel.style.opacity = '0';
                        lootPanel.style.transform = 'translate(-50%, -50%) scale(0.8)';
                        isPlayerControllable = true; // 恢復控制
                        activePuzzle = 4; // 進入可以通往下個場景的狀態
                    }, 3000);
                    
                }, 800); // 配合跳動動畫時間
            } 
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

        let moved = false; let speedX = 0.4; let speedY = 0.3; 
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

        if (activePuzzle === 1) {
            const distanceToGate1 = Math.abs(worldX - 80);
            const monster1InView = (130 - cameraX) <= 100; 
            
            if (distanceToGate1 < 25 && !gate1Triggered && monster1InView) {
                isNearGate = true;
                marqueeSelector.style.left = `calc(${80 - cameraX}% - 30px)`;
                marqueeSelector.style.top = 'calc(50% + 80px)';
                if (!marqueeActive && inputValues1.length < 2) { marqueeSelector.classList.add('active'); startMarquee(); }
            } else if (distanceToGate1 >= 25 || !monster1InView) {
                isNearGate = false;
                if (marqueeActive && inputValues1.length < 2) { marqueeSelector.classList.remove('active'); stopMarquee(); }
            }
            
            if (worldX > 100 && !gate1Triggered && inputValues1.length < 2) {
                gate1Triggered = true; stopMarquee(); marqueeSelector.classList.remove('active');
                const hasEnoughAmmo = (ammoOnes + ammoZeros) >= (2 - inputValues1.length);
                triggerBlueLaserDeath(!hasEnoughAmmo); 
            }
        } 
        else if (activePuzzle === 2) {
            const distanceToGate2 = Math.abs(worldX - 230);
            const monster2InView = (280 - cameraX) <= 100; 
            
            if (distanceToGate2 < 30 && !gate2Triggered && monster2InView) {
                isNearGate = true;
                marqueeSelector.style.left = `calc(${230 - cameraX}% - 30px)`;
                marqueeSelector.style.top = 'calc(50% + 100px)';
                if (!marqueeActive && inputValues2.length < 4) { marqueeSelector.classList.add('active'); startMarquee(); }
            } else if (distanceToGate2 >= 30 || !monster2InView) {
                isNearGate = false;
                if (marqueeActive && inputValues2.length < 4) { marqueeSelector.classList.remove('active'); stopMarquee(); }
            }
            
            if (worldX > 250 && !gate2Triggered && inputValues2.length < 4) {
                gate2Triggered = true; stopMarquee(); marqueeSelector.classList.remove('active');
                const hasEnoughAmmo = (ammoOnes + ammoZeros) >= (4 - inputValues2.length);
                triggerLightningDeath(!hasEnoughAmmo); 
            }
        }
        // 🌟 第三階段：靠近並開啟寶箱
        else if (activePuzzle === 3) {
            const distanceToChest = Math.abs(worldX - 285);
            const ePrompt = document.getElementById('chest-e-prompt');
            
            // 🌟 直接透過世界座標判斷，確保 E 提示永遠準確浮現！
            if (distanceToChest < 30 && !chestOpened) {
                isNearChest = true;
                ePrompt.style.opacity = '1';
            } else {
                isNearChest = false;
                ePrompt.style.opacity = '0';
            }
        }

        requestAnimationFrame(gameLoopS2);
    }

    requestAnimationFrame(gameLoopS2);
}
