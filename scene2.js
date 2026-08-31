// =========================================
// WJ STUDIO - 場景 2：未知領域與邏輯閘 (scene2.js)
// =========================================

export function initScene2(playerState, switchScene, resourceScope = null) {
    const scene2 = document.getElementById('scene-2');
    
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

            #held-hammer-s2 {
                opacity: 0; 
                transform-origin: 40px 85px; 
                transform: rotate(110deg) scale(0.4); 
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease;
                will-change: transform; /* 解決多重影像問題 */
            }
            
            /* 只有在「非攻擊狀態」的站立時，才強制鎖定預備角度 */
            .stand-still:not(.anim-attack) #held-hammer-s2 {
                transform: rotate(60deg) scale(0.4) !important; 
            }

            @keyframes attackSwing {
                0% { transform: rotate(60deg) scale(0.4); }
                25% { transform: rotate(10deg) scale(0.4); } /* 蓄力 */
                60% { transform: rotate(160deg) scale(0.4); } /* 重砸 */
                100% { transform: rotate(60deg) scale(0.4); } /* 回正 */
            }
            
            .anim-attack #held-hammer-s2 {
                animation: attackSwing 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
                transition: none !important;
            }
            
            /* 攻擊時：左手（持武手）瞬間穩固住重心角度 */
            .anim-attack #armL-s2 {
                animation: none !important;
                transform: rotate(-35deg) !important;
                transition: transform 0.1s ease;
            }

            /* 🌟 核心修復：解決邊走邊揮擊時，右手會消失或錯亂的 Bug */
            /* 攻擊時：右手（不拿武器的手）也同步暫停走路動畫，固定在帥氣的戰鬥平衡姿勢 */
            .anim-attack #armR-s2 {
                animation: none !important;
                transform: rotate(45deg) !important; /* 讓右手維持自然的擺幅平衡 */
                transition: transform 0.1s ease;
            }

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

            .env-prop { position: absolute; opacity: 1; z-index: 2; transform: translate(-50%, -50%); }
            .svg-glow { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.4)); }

            @keyframes playerDie { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(-90deg) translate(-30px, -20px); filter: brightness(0.5); } }
            .player-dead { animation: playerDie 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important; }

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
            @keyframes monsterDie { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(90deg) translate(20px, 30px); opacity: 0.3; } }

            #marquee-selector { position: absolute; background: rgba(10, 10, 15, 0.9); border: 2px solid var(--brand-blue); border-radius: 12px; padding: 15px 20px; text-align: center; backdrop-filter: blur(10px); box-shadow: 0 0 20px rgba(0, 242, 254, 0.4); opacity: 0; pointer-events: none; transition: opacity 0.3s ease; z-index: 200; display: flex; flex-direction: column; align-items: center; gap: 10px; }
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

            @keyframes chestDrop { 0% { transform: translate(-50%, -50%) scale(0.2) translateY(-40px); opacity: 0; } 60% { transform: translate(-50%, -50%) scale(1.2) translateY(10px); opacity: 1; } 80% { transform: translate(-50%, -50%) scale(0.9) translateY(-5px); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(1) translateY(0); opacity: 1; } }
            .chest-dropped { animation: chestDrop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important; }
            @keyframes chestJump { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 20% { transform: translate(-50%, -60%) scale(0.9, 1.1); } 40% { transform: translate(-50%, -50%) scale(1.1, 0.9); } 60% { transform: translate(-50%, -55%) scale(0.95, 1.05); } 80% { transform: translate(-50%, -50%) scale(1.05, 0.95); } }
            @keyframes chestGlowAnim { 0%, 100% { filter: drop-shadow(0 0 5px rgba(255,255,255,0.4)); stroke: #fff; } 50% { filter: drop-shadow(0 0 25px #0ff) drop-shadow(0 0 40px #0ff); stroke: #0ff; } }
            .chest-opening { animation: chestJump 0.8s ease-in-out, chestGlowAnim 0.8s infinite alternate !important; }
            @keyframes floatPrompt { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

            @keyframes circuitBreak {
                0% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.4)); stroke: #fff; transform: translate(-50%, -50%) scale(1); }
                20% { filter: drop-shadow(0 0 20px #f00); stroke: #f00; transform: translate(-52%, -48%) scale(1.05); }
                40% { filter: brightness(2) drop-shadow(0 0 30px #f00); stroke: #fff; transform: translate(-48%, -52%) scale(1.05); }
                100% { filter: brightness(0.2) drop-shadow(0 0 0 transparent); stroke: #444; transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
            }
            .circuit-broken { animation: circuitBreak 0.8s forwards !important; }

            @keyframes textBreak {
                0% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.4)); color: #fff; transform: scale(1); opacity: 1; }
                20% { filter: drop-shadow(0 0 20px #f00); color: #f00; transform: scale(1.3) translate(-2px, 2px); opacity: 1; }
                40% { filter: brightness(2) drop-shadow(0 0 30px #f00); color: #fff; transform: scale(1.3) translate(2px, -2px); opacity: 1; }
                100% { filter: brightness(0.2) drop-shadow(0 0 0 transparent); color: #444; transform: scale(1); opacity: 0; }
            }
            .text-broken { animation: textBreak 0.8s forwards !important; }

            /* 🌟 1. 面板樣式微調 (保留 overflow: hidden 完美裁切邊界) */
            #loot-panel { 
                position: absolute; top: 40%; left: 50%; filter: blur(15px) brightness(2); 
                transform: translate(-50%, -50%) scale(1.5) perspective(600px) rotateX(45deg); 
                opacity: 0; pointer-events: none; background: rgba(10, 10, 15, 0.85); 
                border: 1px solid var(--brand-blue); border-radius: 8px; 
                padding: 40px 80px; min-width: 650px; text-align: center; backdrop-filter: blur(10px); z-index: 300; 
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.4s ease; 
                box-shadow: 0 0 40px rgba(0, 242, 254, 0.3), inset 0 0 20px rgba(0, 242, 254, 0.2);
                overflow: hidden; 
            }
            #loot-panel.loot-show { filter: blur(0px) brightness(1); transform: translate(-50%, -50%) scale(1) perspective(600px) rotateX(0deg); opacity: 1; }

            /* ===================================================
               🌟 寶箱怪 (Mimic) 三軸獨立物理引擎
               =================================================== */

            /* 💥 X 軸：只負責橫向移動與翻轉，強制等速 (linear) */
            @keyframes mimicMoveX {
                /* 前三跳向右飛出 */
                0%    { transform: translateX(-500px) scaleX(1); opacity: 0; }
                1%    { transform: translateX(-500px) scaleX(1); opacity: 1; }
                85.7% { transform: translateX(500px) scaleX(1); opacity: 1; }
                
                /* 瞬間移動到畫面右側外，並翻轉開口朝左 */
                85.8% { transform: translateX(250px) scaleX(-1); opacity: 0; }
                86%   { transform: translateX(250px) scaleX(-1); opacity: 1; } 
                
                /* 最終橫向滑行到正中央 0px 停止 */
                100%  { transform: translateX(0px) scaleX(-1); opacity: 1; }
            }

            /* 💥 Y 軸：只負責重力下墜，嚴格執行拋物線高度 */
            @keyframes mimicMoveY {
                /* 前三跳的地板高度皆為 120px，頂點為 -30px */
                0%    { transform: translateY(120px); animation-timing-function: ease-out; }
                14.3% { transform: translateY(-30px); animation-timing-function: ease-in; }
                28.6% { transform: translateY(120px); animation-timing-function: ease-out; }
                
                42.9% { transform: translateY(-30px); animation-timing-function: ease-in; }
                57.1% { transform: translateY(120px); animation-timing-function: ease-out; }
                
                71.4% { transform: translateY(-30px); animation-timing-function: ease-in; }
                85.7% { transform: translateY(120px); animation-timing-function: linear; }
                
                /* 🌟 最終下墜：從頂點 -30px 完美落回到同一個地板高度 120px (介面最下方) */
                85.8% { transform: translateY(-30px); animation-timing-function: ease-in; }
                100%  { transform: translateY(100px); } 
            }

            /* 💥 旋轉軸：獨立掛載於 iframe，強制等速轉向，徹底解決落地暴衝的錯覺 */
            @keyframes mimicRotate {
                0%, 85.7% { transform: rotate(0deg); }
                85.8%     { transform: rotate(0deg); }
                100%      { transform: rotate(90deg); }
            }

            /* 容器設定 */
            .mimic-jump-x {
                position: absolute; top: 50%; left: 50%; 
                margin-top: -90px; margin-left: -90px;
                opacity: 0; z-index: 5;
            }
            .mimic-jump-y {
                width: 100%; height: 100%;
            }

            /* 🌟 同步觸發三軸動畫，延遲 0.5 秒，總時長 5.25 秒 */
            #loot-panel.loot-show .mimic-jump-x {
                animation: mimicMoveX 5.25s 0.5s forwards linear; 
            }
            #loot-panel.loot-show .mimic-jump-y {
                animation: mimicMoveY 5.25s 0.5s forwards; 
            }
            #loot-panel.loot-show #mimic-iframe {
                animation: mimicRotate 5.25s 0.5s forwards linear; /* 獨立的等速旋轉 */
            }

            @keyframes hammerBreath {
                0%, 100% { filter: drop-shadow(0 0 5px rgba(255,255,255,0.6)) brightness(0.9); transform: translateY(-25px) scale(1); }
                50% { filter: drop-shadow(0 0 20px #fff) drop-shadow(0 0 35px var(--brand-blue)) brightness(1.3); transform: translateY(-30px) scale(1.02); }
            }
            .hammer-breath { animation: hammerBreath 2.5s infinite ease-in-out !important; }

            @keyframes btnPulseShake {
                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 242, 254, 0.8); }
                15% { transform: scale(1.15) rotate(-5deg); box-shadow: 0 0 20px 10px rgba(0, 242, 254, 0); }
                30% { transform: scale(1.1) rotate(5deg); }
                45% { transform: scale(1.15) rotate(-5deg); }
                60% { transform: scale(1.1) rotate(5deg); }
                75% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 242, 254, 0); }
                100% { transform: scale(1); }
            }
            
            .manual-btn-notice {
                animation: btnPulseShake 0.8s ease-in-out !important;
                /* 🌟 已經移除了 border-color，不再出現白色框框 */
                color: var(--brand-blue) !important;
                text-shadow: 0 0 8px var(--brand-blue) !important;
            }

        
            /* Modal Animation CSS */
            .anim-modal {
                position: absolute; top: 40%; left: 50%;
                transform: translate(-50%, -50%) scale(1.5) perspective(600px) rotateX(45deg);
                opacity: 0; pointer-events: none;
                background: rgba(10, 10, 15, 0); 
                padding: 40px 60px;
                text-align: center; backdrop-filter: blur(0px);
                z-index: 500;
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease;
                border-radius: 12px;
                min-width: 420px;
            }
            
            .anim-modal.show-init {
                transform: translate(-50%, -50%) scale(1) perspective(600px) rotateX(0deg);
                opacity: 1;
            }

            .anim-modal.show-bg {
                background: rgba(10, 10, 15, 0.9);
                backdrop-filter: blur(15px);
                transition: background 0.4s ease, backdrop-filter 0.4s ease;
                box-shadow: 0 0 40px rgba(0, 242, 254, 0.2), inset 0 0 20px rgba(0, 242, 254, 0.1);
            }

            /* Animated Borders */
            .anim-border { position: absolute; background: var(--brand-blue); box-shadow: 0 0 10px var(--brand-blue); }
            .top-border { top: 0; left: 50%; right: 50%; height: 2px; transition: left 0.25s ease-out, right 0.25s ease-out; }
            .right-border { top: 0; right: 0; width: 2px; height: 0; transition: height 0.25s ease-out 0.25s; }
            .left-border { top: 0; left: 0; width: 2px; height: 0; transition: height 0.25s ease-out 0.25s; }
            .bottom-right-border { bottom: 0; right: 0; width: 0; height: 2px; transition: width 0.25s ease-out 0.5s; }
            .bottom-left-border { bottom: 0; left: 0; width: 0; height: 2px; transition: width 0.25s ease-out 0.5s; }

            .anim-modal.draw-borders .top-border { left: 0; right: 0; }
            .anim-modal.draw-borders .right-border { height: 100%; }
            .anim-modal.draw-borders .left-border { height: 100%; }
            .anim-modal.draw-borders .bottom-right-border { width: 50%; }
            .anim-modal.draw-borders .bottom-left-border { width: 50%; }
            
            /* Content Elements */
            .modal-text-top {
                font-family: 'Orbitron', sans-serif; font-size: 1.2rem; color: var(--brand-blue);
                letter-spacing: 5px; margin-bottom: 25px;
                transform: translateY(-10px); transition: all 0.3s ease;
            }
            .modal-separator-container { width: 100%; height: 1px; margin-bottom: 20px; display: flex; justify-content: flex-start; }
            .anim-separator { width: 0; height: 1px; background: rgba(0, 242, 254, 0.5); box-shadow: 0 0 5px var(--brand-blue); transition: width 0.4s ease-out; }
            
            .modal-text-desc {
                color: rgba(255,255,255,0.6); font-size: 1rem; letter-spacing: 2px;
                transform: translateY(10px); transition: all 0.3s ease; line-height: 1.5;
            }

            /* Spectacular Entry */
            .spectacular-entry {
                animation: propExplosion 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }

            @keyframes propExplosion {
                0% { transform: scale(0.2) translateY(-40px); opacity: 0; filter: brightness(3) blur(5px); }
                40% { transform: scale(1.3) translateY(10px); opacity: 1; filter: brightness(2) blur(0px) drop-shadow(0 0 30px #fff); }
                70% { transform: scale(0.9) translateY(-5px); opacity: 1; filter: brightness(1.2) drop-shadow(0 0 15px var(--brand-blue)); }
                100% { transform: scale(1) translateY(0); opacity: 1; filter: drop-shadow(0 0 10px rgba(255,255,255,0.2)); }
            }

            /* ===================================================
               🌟 目標 AND 寶箱 (被咬替身) 動畫與圖層系統
               =================================================== */
            @keyframes targetChestPopAndBounce {
                /* 0%~25% (第 4.8s~5.2s)：寶箱怪飛出右邊界時，AND 寶箱在中央底部彈出 */
                /* 🌟 將 translateY 從原本的 80px 下移到 95px (數值越大位置越低) */
                0%   { transform: translate(-50%, -50%) translateY(95px) scale(0); opacity: 0; }
                25%  { transform: translate(-50%, -50%) translateY(95px) scale(1); opacity: 1; }
                /* 25%~60% (第 5.2s~5.75s)：乖乖靜止在地面，等待上空的泰山壓頂 */
                60%  { transform: translate(-50%, -50%) translateY(95px) scale(1); opacity: 1; }
                
                /* 🌟 60.1% (第 5.75s)：寶箱怪咬下！觸發重壓彈跳與擠壓變形！ */
                70%  { transform: translate(-50%, -50%) translateY(80px) scale(0.9, 1.1); opacity: 1; }
                80%  { transform: translate(-50%, -50%) translateY(95px) scale(1.1, 0.9); opacity: 1; }
                90%  { transform: translate(-50%, -50%) translateY(88px) scale(0.95, 1.05); opacity: 1; }
                100% { transform: translate(-50%, -50%) translateY(95px) scale(1); opacity: 1; }
            }

            #target-and-chest {
                position: absolute;
                top: 50%; left: 50%;
                width: 100px; height: 120px;
                opacity: 0; /* 預設完全隱藏 */
                /* 🌟 核心層級修改：設為 z-index: 6，高於寶箱怪的 z-index: 5！
                     這會讓寶箱怪從後方咬住它時，AND 寶箱維持在畫面前方，立體透視感拉滿！ */
                z-index: 6; 
                transform: translate(-50%, -50%) translateY(95px) scale(0);
            }

            /* 4.8秒時彈出，5.75秒觸發被咬發光閃爍 */
            #loot-panel.loot-show #target-and-chest {
                animation: targetChestPopAndBounce 1.6s 4.8s forwards, chestGlowAnim 0.8s 5.75s infinite alternate;
            }

            /* ===================================================
               🌟 戰利品文字 (0, 1彈藥) 絕對同步彈出特效
               =================================================== */
            @keyframes lootTextPopIn {
                0%   { opacity: 0; transform: translateX(-50%) scale(0.7) translateY(20px); filter: blur(10px); }
                60%  { opacity: 1; transform: translateX(-50%) scale(1.08) translateY(-5px); filter: blur(0px); }
                100% { opacity: 1; transform: translateX(-50%) scale(1) translateY(0px); filter: blur(0px); }
            }

            /* 🌟 核心同步魔法：延遲 5.75 秒 (與寶箱怪咬下、寶箱彈起的那一毫秒完全一致)，
                 以具有彈性的 cubic-bezier 曲線滑順彈出字樣！ */
            #loot-panel.loot-show #loot-text-group {
                animation: lootTextPopIn 0.6s 5.75s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
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
                            <path id="xor-tip-1" d="M -12 -35 L -4 -45 L -15 -55 L -5 -70" fill="none" stroke="var(--brand-blue)" stroke-width="3" stroke-linejoin="miter" style="filter: drop-shadow(0 0 6px var(--brand-blue));" />
                            <path id="xor-tip-2" d="M 12 -35 L 20 -45 L 9 -55 L 19 -70" fill="none" stroke="var(--brand-blue)" stroke-width="3" stroke-linejoin="miter" style="filter: drop-shadow(0 0 6px var(--brand-blue));" />
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

                <svg id="circuit-3" class="env-prop svg-glow" viewBox="0 0 400 300" stroke="#fff" stroke-width="5" fill="#000" stroke-linecap="round" stroke-linejoin="round" style="width: 320px; height: 240px; left: 380%; top: 50%;">
                    <path d="M 0 50 L 30 50" fill="none" />
                    <path d="M 30 30 L 70 50 L 30 70 Z" fill="#000" />
                    <circle cx="75" cy="50" r="5" fill="#000" />
                    <path d="M 80 50 L 200 50 L 200 100 L 250 100" fill="none" />
                    <path d="M 0 130 L 30 130" fill="none" />
                    <path d="M 0 170 L 30 170" fill="none" />
                    <path d="M 20 110 Q 40 150 20 190" fill="none" />
                    <path d="M 30 110 Q 50 150 30 190 Q 90 190 110 150 Q 90 110 30 110 Z" fill="#000" />
                    <path d="M 110 150 L 250 150" fill="none" />
                    <path d="M 0 230 L 30 230" fill="none" />
                    <path d="M 0 270 L 30 270" fill="none" />
                    <path d="M 20 210 Q 40 250 20 290" fill="none" />
                    <path d="M 30 210 Q 50 250 30 290 Q 90 290 110 250 Q 90 210 30 210 Z" fill="#000" />
                    <circle cx="115" cy="250" r="5" fill="#000" />
                    <path d="M 120 250 L 200 250 L 200 200 L 250 200" fill="none" />
                    <path d="M 250 70 L 250 230 Q 360 230 360 150 Q 360 70 250 70 Z" fill="#000" />
                    <path d="M 360 150 L 400 150" fill="none" />
                </svg>

                <div id="input-d1-display" style="position:absolute; left:calc(380% - 175px); top:calc(50% - 90px); color:#fff; font-family:'Orbitron', sans-serif; font-size:18px; font-weight:900; text-shadow:0 0 10px #fff; opacity:0; transition:0.3s; z-index: 5;"></div>
                <div id="input-d2-display" style="position:absolute; left:calc(380% - 175px); top:calc(50% - 26px); color:#fff; font-family:'Orbitron', sans-serif; font-size:18px; font-weight:900; text-shadow:0 0 10px #fff; opacity:0; transition:0.3s; z-index: 5;"></div>
                <div id="input-d3-display" style="position:absolute; left:calc(380% - 175px); top:calc(50% + 6px); color:#fff; font-family:'Orbitron', sans-serif; font-size:18px; font-weight:900; text-shadow:0 0 10px #fff; opacity:0; transition:0.3s; z-index: 5;"></div>
                <div id="input-d4-display" style="position:absolute; left:calc(380% - 175px); top:calc(50% + 54px); color:#fff; font-family:'Orbitron', sans-serif; font-size:18px; font-weight:900; text-shadow:0 0 10px #fff; opacity:0; transition:0.3s; z-index: 5;"></div>
                <div id="input-d5-display" style="position:absolute; left:calc(380% - 175px); top:calc(50% + 86px); color:#fff; font-family:'Orbitron', sans-serif; font-size:18px; font-weight:900; text-shadow:0 0 10px #fff; opacity:0; transition:0.3s; z-index: 5;"></div>

                <svg id="final-boss" class="env-prop svg-glow" viewBox="-250 0 650 500" stroke="#fff" stroke-width="4" fill="#000" stroke-linecap="round" stroke-linejoin="round" style="width: 650px; height: 500px; left: 430%; top: 50%; overflow: visible;">
                    <g transform="translate(-170, 150)">
                        <g id="boss-weapon-and" style="transform-origin: 90px 100px; transition: transform 0.1s ease-out, filter 0.1s ease-out;">
                            <path d="M 20 70 L 60 70" fill="none" />
                            <path d="M 20 100 L 60 100" fill="none" />
                            <path d="M 20 130 L 60 130" fill="none" />
                            <path id="boss-and-body" d="M 60 50 C 80 50, 100 50, 120 50 C 150 50, 170 75, 170 100 C 170 125, 150 150, 120 150 C 100 150, 80 150, 60 150 Z" fill="#000" stroke-width="5" style="transition: d 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);" />
                        </g>
                    </g>
                    <path d="M 0 250 L 100 250" fill="none" stroke-width="5" />
                    <path d="M 100 250 L 100 180 L 176 180 L 176 140.4" fill="none" stroke-width="5" /> 
                    <path d="M 100 250 L 245 250" fill="none" stroke-width="5" /> 
                    <path d="M 100 250 L 100 320 L 176 320 L 176 359.6" fill="none" stroke-width="5" /> 
                    <g>
                        <line x1="200" y1="40" x2="200" y2="10" stroke-width="6" /> 
                        <path d="M 160 150 Q 200 120 240 150" fill="none" stroke-width="5" /> 
                        <path d="M 160 140 Q 200 110 240 140 Q 250 70 200 40 Q 150 70 160 140 Z" fill="#000" stroke-width="4" />
                        <path d="M 176 140.4 L 176 160" fill="none" stroke-width="4" />
                        <path d="M 200 135 L 200 160 L 215 170" fill="none" stroke-width="4" />
                        <path d="M 224 140.4 L 235 160 L 255 165" fill="none" stroke-width="4" />
                        <circle cx="188" cy="90" r="3" fill="#fff" stroke="none" class="boss-eyes-alive" />
                        <circle cx="212" cy="90" r="3" fill="#fff" stroke="none" class="boss-eyes-alive" />
                        <g class="boss-eyes-dead" style="opacity: 0;">
                            <path d="M 185 87 L 191 93 M 191 87 L 185 93" stroke="#fff" stroke-width="2" />
                            <path d="M 209 87 L 215 93 M 215 87 L 209 93" stroke="#fff" stroke-width="2" />
                        </g>
                    </g>
                    <g>
                        <line x1="340" y1="250" x2="370" y2="250" stroke-width="6" /> 
                        <path d="M 230 210 Q 260 250 230 290" fill="none" stroke-width="5" />
                        <path d="M 240 210 Q 270 250 240 290 Q 310 300 340 250 Q 310 200 240 210 Z" fill="#000" stroke-width="4" />
                        <path d="M 239.6 226 L 220 215 L 210 200" fill="none" stroke-width="4" />
                        <path d="M 239.6 274 L 220 285 L 210 300" fill="none" stroke-width="4" />
                        <circle cx="290" cy="238" r="3" fill="#fff" stroke="none" class="boss-eyes-alive" />
                        <circle cx="290" cy="262" r="3" fill="#fff" stroke="none" class="boss-eyes-alive" />
                        <g class="boss-eyes-dead" style="opacity: 0;">
                            <path d="M 287 235 L 293 241 M 293 235 L 287 241" stroke="#fff" stroke-width="2" />
                            <path d="M 287 259 L 293 265 M 293 259 L 287 265" stroke="#fff" stroke-width="2" />
                        </g>
                    </g>
                    <g>
                        <line x1="200" y1="460" x2="200" y2="490" stroke-width="6" /> 
                        <path d="M 240 350 Q 200 380 160 350" fill="none" stroke-width="5" />
                        <path d="M 240 360 Q 200 390 160 360 Q 150 430 200 460 Q 250 430 240 360 Z" fill="#000" stroke-width="4" />
                        <path d="M 176 359.6 L 176 340" fill="none" stroke-width="5" />
                        <path d="M 200 365 L 200 340 L 185 330" fill="none" stroke-width="4" />
                        <path d="M 224 359.6 L 235 340 L 255 335" fill="none" stroke-width="4" />
                        <circle cx="188" cy="410" r="3" fill="#fff" stroke="none" class="boss-eyes-alive" />
                        <circle cx="212" cy="410" r="3" fill="#fff" stroke="none" class="boss-eyes-alive" />
                        <g class="boss-eyes-dead" style="opacity: 0;">
                            <path d="M 185 407 L 191 413 M 191 407 L 185 413" stroke="#fff" stroke-width="2" />
                            <path d="M 209 407 L 215 413 M 215 407 L 209 413" stroke="#fff" stroke-width="2" />
                        </g>
                    </g>
                </svg>

                <div id="chest-3-container" class="env-prop" style="left: 430%; top: 50%; z-index: 5; opacity: 0; pointer-events: none; transition: opacity 0.5s; width: 240px; height: 240px; overflow: visible;">
                    
                    <svg id="chest-inputs" viewBox="-120 -120 240 240" style="position:absolute; width:100%; height:100%; left:0; top:0; z-index:1; overflow:visible;">
                        <line id="in1" x1="-15" y1="-30" x2="-15" y2="-50" stroke="#fff" stroke-width="4" stroke-linecap="round" style="transition: all 0.4s ease-in-out;" />
                        <line id="in2" x1="0" y1="-30" x2="0" y2="-50" stroke="#fff" stroke-width="4" stroke-linecap="round" style="transition: opacity 0s;" />
                        <line id="in3" x1="15" y1="-30" x2="15" y2="-50" stroke="#fff" stroke-width="4" stroke-linecap="round" style="transition: all 0.4s ease-in-out;" />
                    </svg>

                    <svg id="and-hammer-drawn" viewBox="-120 -120 240 240" style="position:absolute; width:100%; height:100%; left:0; top:0; opacity:0; z-index:3; transition: transform 0.6s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0s; overflow:visible;">
                        <path d="M -20 -65 L 20 -65 A 20 30 0 0 1 -20 -65 Z" fill="#000" stroke="#fff" stroke-width="4" style="filter: drop-shadow(0 0 8px #fff);"/>
                        <line x1="0" y1="-35" x2="0" y2="5" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
                    </svg>

                    <svg id="hammer-motion" viewBox="-120 -120 240 240" style="position:absolute; width:100%; height:100%; left:0; top:0; opacity:0; z-index:1; pointer-events:none; overflow:visible; transition: opacity 0.3s;">
                        <path d="M 20 -40 Q 55 -55 75 -20" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" style="filter: drop-shadow(0 0 6px #fff);"/>
                        <path d="M 25 -25 Q 60 -40 80 -5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" style="filter: drop-shadow(0 0 6px #fff);"/>
                        <path d="M 30 -10 Q 65 -25 85 10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" style="filter: drop-shadow(0 0 6px #fff);"/>
                    </svg>

                    <svg id="and-chest-3" viewBox="-120 -120 240 240" style="width: 100%; height: 100%; position: absolute; left:0; top:0; z-index: 3; overflow:visible;">
                        <path id="chest-3-body" d="M -30 -30 L 30 -30 C 30 -10, 30 30, 0 30 C -30 30, -30 -10, -30 -30 Z" fill="#000" stroke="#fff" stroke-width="4" stroke-linejoin="round" style="transition: d 0.4s ease-in-out, filter 0.4s;" />
                    </svg>
                </div>

                <div id="chest-e-prompt-3" style="position: absolute; left: calc(430% - 15px); top: calc(50% - 80px); width: 30px; height: 30px; background: rgba(0, 242, 254, 0.15); border: 2px solid var(--brand-blue); border-radius: 6px; color: #fff; font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 14px; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s; z-index: 20; box-shadow: 0 0 10px var(--brand-blue); animation: floatPrompt 1.5s infinite ease-in-out; pointer-events: none;">E</div>

                <div id="hammer-e-prompt" style="position: absolute; left: calc(430% - 15px); top: calc(50% - 145px); width: 30px; height: 30px; background: rgba(0, 242, 254, 0.15); border: 2px solid var(--brand-blue); border-radius: 6px; color: #fff; font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 14px; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s; z-index: 20; box-shadow: 0 0 10px var(--brand-blue); animation: floatPrompt 1.5s infinite ease-in-out; pointer-events: none;">E</div>

                <div id="falling-book-s2" style="position: absolute; left: 430%; top: 50%; width: 45px; height: 60px; background-color: #094b8e; border: 2px solid #fff; border-left: 8px solid #042a53; border-radius: 2px 6px 6px 2px; box-shadow: inset -4px 0 0 #ddd, 0 0 15px rgba(0, 242, 254, 0.5); display: flex; justify-content: center; align-items: center; opacity: 0; z-index: 4; transform: translate(-50%, -50%) scale(0.1); pointer-events: none;">
                    <span style="color: #fff; font-family: 'Orbitron', sans-serif; font-size: 14px; font-weight: 900; transform: rotate(-90deg); letter-spacing: 2px;">C++</span>
                </div>
                <div id="book-e-prompt-s2" style="position: absolute; left: calc(430% + 115px); top: calc(50% + 25px); width: 30px; height: 30px; background: rgba(0, 242, 254, 0.15); border: 2px solid var(--brand-blue); border-radius: 6px; color: #fff; font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 14px; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s; z-index: 20; box-shadow: 0 0 10px var(--brand-blue); animation: floatPrompt 1.5s infinite ease-in-out; pointer-events: none;">E</div>

            </div>

            <svg id="laser-canvas" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:15; overflow:visible;">
                <path id="blue-laser-path" fill="none" stroke="var(--brand-blue)" stroke-width="8" stroke-linecap="round" filter="drop-shadow(0 0 10px var(--brand-blue))" d="" style="opacity: 0;" />
                <path id="white-laser-path" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" filter="drop-shadow(0 0 15px #fff)" d="" style="opacity: 0;" />
                <path id="lightning-path" fill="none" stroke="#0ff" stroke-width="5" stroke-linejoin="miter" filter="drop-shadow(0 0 10px #0ff) drop-shadow(0 0 20px #fff)" d="" style="opacity: 0;" />
                <path id="mega-blue-laser" fill="none" stroke="#0ff" stroke-width="160" stroke-linecap="round" filter="drop-shadow(0 0 80px #0ff) drop-shadow(0 0 40px #fff) brightness(1.5)" d="" style="opacity: 0;" />
                <path id="mega-blue-laser-core" fill="none" stroke="#fff" stroke-width="60" stroke-linecap="round" filter="drop-shadow(0 0 20px #fff)" d="" style="opacity: 0;" />
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
                <svg id="stickman-body-s2" viewBox="0 0 80 120" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round" style="overflow: visible;">
                    <circle cx="40" cy="32" r="16" />
                    <line x1="40" y1="48" x2="40" y2="75" />
                    
                    <g id="armL-s2">
                        <line x1="40" y1="56" x2="40" y2="85" />
                        <text id="held-1-s2" x="10" y="50" dy="0.3em" text-anchor="middle" fill="#fff" font-size="23" font-family="'Orbitron', sans-serif" font-weight="25" opacity="0">1</text>
                        <g id="held-hammer-s2">
                            <line x1="40" y1="85" x2="40" y2="20" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
                            <path d="M 5 -10 L 75 -10 A 35 50 0 0 1 5 -10 Z" fill="#000" stroke="#fff" stroke-width="8" style="filter: drop-shadow(0 0 5px rgba(255,255,255,0.8));"/>
                        </g>
                    </g>
                    
                    <g id="armR-s2">
                        <line x1="40" y1="56" x2="40" y2="85" />
                        <text id="held-0-s2" x="70" y="50" dy="0.3em" text-anchor="middle" fill="#fff" font-size="23" font-family="'Orbitron', sans-serif" font-weight="25" opacity="0">0</text>
                    </g>
                    <line x1="40" y1="75" x2="40" y2="105" id="legL-s2" /> 
                    <line x1="40" y1="75" x2="40" y2="105" id="legR-s2" /> 
                </svg>
            </div>

            <div id="loot-panel">
                
                <!-- 🌟 戰利品道具 (top 已經大膽下推至 80px，真正來到畫面中間偏上的黃金位置！) -->
                <div id="loot-text-group" style="position: absolute; top: 80px; left: 50%; transform: translateX(-50%); display: flex; gap: 60px; font-family: 'Orbitron', sans-serif; z-index: 10; opacity: 0; transition: opacity 0.5s ease;">
                    
                    <!-- 【實彈區塊】採用 inline-flex 與 align-items: center 確保中英文 Y 軸精準置中對齊 -->
                    <div style="display: inline-flex; align-items: center; gap: 14px;">
                        <!-- 01 實體方塊 ICON (維持原樣) -->
                        <span style="border: 2px solid #fff; border-radius: 4px; width: 45px; height: 45px; display: inline-flex; justify-content: center; align-items: center; font-size: 1.8rem; font-family: 'Orbitron', sans-serif; font-weight: bold; color: #fff; box-shadow: 0 0 10px rgba(255,255,255,0.4); line-height: 1;">1</span>
                        
                        <!-- 中文字與 x1 的群組容器 (強制 Y 軸垂直居中) -->
                        <span style="display: inline-flex; align-items: center; gap: 8px;">
                            <!-- 中文字：維持 1.3rem、正常粗細與白色發光 -->
                            <span style="font-size: 1.3rem; color: #fff; font-family: 'Kumbh Sans', sans-serif; font-weight: normal; text-shadow: 0 0 15px rgba(255,255,255,0.8); white-space: nowrap; line-height: 1;">實彈</span>
                            <!-- 🌟 x1：為它穿上獨立 span！強制取消發光(text-shadow: none)、改用細體(font-weight: 300)與適中大小 -->
                            <span style="font-size: 1.2rem; color: rgba(255,255,255,0.85); font-family: 'Orbitron', sans-serif; font-weight: 300; text-shadow: none; white-space: nowrap; line-height: 1;">x1</span>
                        </span>
                    </div>

                    <!-- 【空包彈區塊】採用相同的高精度對齊設定 -->
                    <div style="display: inline-flex; align-items: center; gap: 14px;">
                        <!-- 00 實體方塊 ICON (維持原樣) -->
                        <span style="border: 2px solid #fff; border-radius: 4px; width: 45px; height: 45px; display: inline-flex; justify-content: center; align-items: center; font-size: 1.8rem; font-family: 'Orbitron', sans-serif; font-weight: bold; color: #fff; box-shadow: 0 0 10px rgba(255,255,255,0.4); line-height: 1;">0</span>
                        
                        <!-- 中文字與 x4 的群組容器 (強制 Y 軸垂直居中) -->
                        <span style="display: inline-flex; align-items: center; gap: 8px;">
                            <!-- 中文字：維持 1.3rem、正常粗細與白色發光 -->
                            <span style="font-size: 1.3rem; color: #fff; font-family: 'Kumbh Sans', sans-serif; font-weight: normal; text-shadow: 0 0 15px rgba(255,255,255,0.8); white-space: nowrap; line-height: 1;">空包彈</span>
                            <!-- 🌟 x4：強制取消發光(text-shadow: none)、改用細體(font-weight: 300)與適中大小 -->
                            <span style="font-size: 1.2rem; color: rgba(255,255,255,0.85); font-family: 'Orbitron', sans-serif; font-weight: 300; text-shadow: none; white-space: nowrap; line-height: 1;">x4</span>
                        </span>
                    </div>

                </div>

                <!-- 🌟 跳躍空間 -->
                <div style="position: relative; width: 100%; height: 260px; margin-top: 20px;">
                    
                    <!-- 🌟 新增：等待被咬的 AND 寶箱 (長相與關卡完全一致) -->
                    <svg id="target-and-chest" class="svg-glow" viewBox="-50 -80 100 120" stroke="#fff" stroke-width="4" fill="#000" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="-15" y1="-70" x2="-15" y2="-30" />
                        <line x1="15" y1="-70" x2="15" y2="-30" />
                        <path d="M -30 -30 L 30 -30 L 30 0 A 30 30 0 0 1 -30 0 Z" fill="#000" />
                    </svg>

                    <!-- 原本的雙層跳躍寶箱怪 -->
                    <div class="mimic-jump-x">
                        <div class="mimic-jump-y">
                            <iframe id="mimic-iframe" src="draw_svg/mimic.html" style="width: 180px; height: 180px; border: none; overflow: hidden; pointer-events: none; filter: drop-shadow(0 0 20px rgba(0, 242, 254, 0.8));"></iframe>
                        </div>
                    </div>
                    
                </div>

            </div>

            <div id="hammer-loot-modal" class="anim-modal">
                <div style="position: absolute; top:0; left:0; width:100%; height:100%; border-radius: 12px; overflow: hidden; pointer-events:none;">
                    <div class="anim-border top-border"></div>
                    <div class="anim-border right-border"></div>
                    <div class="anim-border left-border"></div>
                    <div class="anim-border bottom-right-border"></div>
                    <div class="anim-border bottom-left-border"></div>
                </div>

                <div style="position:relative; z-index: 10;">
                    <!-- 1. 最上方的提示字 -->
                    <div id="hammer-top-text" class="modal-text-top" style="opacity:0;">NEW WEAPON ACQUIRED</div>
                    
                    <!-- 🌟 2. ICON 放在這裡（維持原本的中間位置），但等一下動畫會最後才顯示 -->
                    <div id="hammer-center-content" style="opacity:0; height: 70px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: center;">
                            <svg viewBox="-50 -30 100 120" style="width: 50px; height: 60px; filter: drop-shadow(0 0 10px rgba(255,255,255,0.8));">
                                <line x1="0" y1="80" x2="0" y2="-5" stroke="#fff" stroke-width="16" stroke-linecap="round"/>
                                <path d="M -35 -20 L 35 -20 A 35 50 0 0 1 -35 -20 Z" fill="#000" stroke="#fff" stroke-width="12" />
                            </svg>
                        </div>
                    </div>

                    <!-- 3. 武器名稱在 ICON 下面 -->
                    <div id="hammer-title" style="font-family: 'Kumbh Sans', sans-serif; font-size: 1.8rem; font-weight: bold; color: #fff; margin-bottom: 20px; opacity: 0; transform: translateY(-10px); transition: all 0.3s ease;">AND槌 (AND HAMMER)</div>
                    
                    <!-- 4. 分隔線 -->
                    <div class="modal-separator-container">
                        <div id="hammer-separator" class="anim-separator"></div>
                    </div>
                    
                    <!-- 5. 說明文字 -->
                    <div id="hammer-desc" class="modal-text-desc" style="opacity:0;">
                        [ 系統分析 ]：具備邏輯改寫能力的重型裝備。<br>可用於粉碎錯誤的邏輯屏障。
                    </div>
                </div>
            </div>

            <div id="manual-modal-s2" style="overscroll-behavior: contain; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); width: 85%; max-width: 900px; height: 85vh; background: rgba(10, 10, 15, 0.9); border: 1px solid var(--brand-blue); border-radius: 12px; box-shadow: 0 0 40px rgba(0, 242, 254, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.8); z-index: 250; display: flex; flex-direction: column; opacity: 0; pointer-events: none; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); backdrop-filter: blur(15px);">
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; border-bottom: 1px solid rgba(0, 242, 254, 0.2);">
                    <div style="color: var(--brand-blue); font-family: 'Orbitron', sans-serif; font-size: 1.2rem; letter-spacing: 3px;">CHARACTER_MANUAL.exe</div>
                    <button id="close-manual-s2" style="background: transparent; border: none; outline: none; padding: 0; color: #fff; font-family: 'Orbitron', sans-serif; font-size: 1.5rem; cursor: pointer; transition: 0.2s;" onmouseover="this.style.color='#fff'; this.style.textShadow='0 0 10px #fff'" onmouseout="this.style.color='#fff'; this.style.textShadow='none'">✖</button>
                </div>
                
                <div id="manual-content-s2" style="flex: 1; padding: 30px; overflow-y: auto; overscroll-behavior: contain; display: flex; flex-direction: column;">
                    
                    <div id="manual-page-1" class="manual-page active-page">
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

                    <div id="manual-page-2" class="manual-page">
                        <div class="manual-panel" style="width: 100%; flex: 1; justify-content: center;">
                            <div class="action-block" style="border-bottom: none; width: 100%; margin-bottom: 0;">
                                <div class="action-header" style="justify-content: flex-start; margin-bottom: 30px;">
                                    <div class="key-btn" style="border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">J</div>
                                    <div class="action-text" style="font-size: 2rem;">Attack</div>
                                </div>
                                
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
                    <button id="prev-page-btn" class="page-btn disabled" title="Previous Page">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="15,18 9,12 15,6" fill="currentColor"/></svg>
                    </button>
                    <div id="page-indicator" style="font-family: 'Orbitron', sans-serif; color: var(--brand-blue); letter-spacing: 4px; font-size: 1.2rem; text-shadow: 0 0 8px rgba(0,242,254,0.5);">PAGE 1 / 1</div>
                    <button id="next-page-btn" class="page-btn" title="Next Page">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="9,18 15,12 9,6" fill="currentColor"/></svg>
                    </button>
                </div>

            </div>

        </div>
    `;

    const environmentLayer = document.getElementById('environment-layer-s2');
    const stickman = document.getElementById('stickman-s2');
    const manualModal = document.getElementById('manual-modal-s2');
    const closeManual = document.getElementById('close-manual-s2');
    
    const manualContent = document.getElementById('manual-content-s2');
    const page1 = document.getElementById('manual-page-1');
    const page2 = document.getElementById('manual-page-2');
    const btnPrev = document.getElementById('prev-page-btn');
    const btnNext = document.getElementById('next-page-btn');
    const pageIndicator = document.getElementById('page-indicator');
    // 🌟 載入音效與輔助函式
    const sfxOpenBook = new Audio('game_audio/game_openbook.mp3');
    const sfxPageTurn = new Audio('game_audio/game_pageturn.mp3');
    const sfxPickupWeapon = new Audio('game_audio/game_pickup_weapon.mp3');
    
    // 🌟 射擊音效
    const sfxShoot1and2 = new Audio('game_audio/game_shoot_enemy1and2.mp3');
    
    // ==============================================================
    // 🌟 終極修復：使用 Web Audio API 處理高頻率連發的子彈音效
    // ==============================================================
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let shoot3Buffer = null;
    let destroyed = false;

    const scheduleSceneFrame = (callback) => {
        if (resourceScope) {
            return resourceScope.requestAnimationFrame(callback);
        }

        return globalThis.requestAnimationFrame(callback);
    };

    // 預先抓取音效檔案並解碼成 Buffer (純數據)
    fetch('game_audio/game_shoot_enemy3.mp3')
        .then(response => response.arrayBuffer())
        .then(data => audioCtx.decodeAudioData(data))
        .then(buffer => { shoot3Buffer = buffer; })
        .catch(e => console.error("Audio decode error:", e));

    // 專屬的高頻連發播放函式
    function playShoot3Rapid(volume) {
        if (!shoot3Buffer) return; // 如果還沒載入完就不播
        
        // 喚醒音效引擎 (突破瀏覽器的自動靜音限制)
        if (audioCtx.state === 'suspended') audioCtx.resume();

        // 每次播放都建立一個無負擔的數據發射源
        const source = audioCtx.createBufferSource();
        source.buffer = shoot3Buffer;

        // 連接音量控制器
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = volume;

        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        source.start(0); // 零延遲瞬間播放！
    }
    // ==============================================================
    
    // 🌟 邏輯怪的攻擊音效
    const sfxAttack1 = new Audio('game_audio/game_attack_enemy1.mp3');
    const sfxAttack2 = new Audio('game_audio/game_attack_enemy2.mp3');
    const sfxAttack3 = new Audio('game_audio/game_attack_enemy3.mp3');

    // 🌟 新增：邏輯怪 3 專屬的三重爆炸音效
    const sfxExplosion1 = new Audio('game_audio/game_enemy3_explosion1.mp3');
    const sfxExplosion2 = new Audio('game_audio/game_enemy3_explosion2.mp3');
    const sfxExplosion3 = new Audio('game_audio/game_enemy3_explosion3.mp3');

    // 🌟 新增：寶箱相關音效
    const sfxOpenChest = new Audio('game_audio/openchest.mp3'); // 第一個寶箱打開
    const sfxChestPop = new Audio('game_audio/chestpop.mp3');   // AND Hammer 彈出

    // 🌟 新增：輸入邏輯訊號 (0與1) 的音效
    const sfxPut0 = new Audio('game_audio/put0.mp3');
    const sfxPut1 = new Audio('game_audio/put1.mp3');

    let currentManualPage = 1;
    let hasSecondManual = false; 

    // 🌟 保留一個乾淨的播放輔助函式即可
    function playActionSfx(audioObj) {
        const volSlider = document.getElementById('volumeSlider');
        if (!volSlider || volSlider.value == 0) return; 
        const sound = audioObj.cloneNode(); 
        sound.volume = volSlider.value / 100;
        sound.play().catch(e => console.log("SFX play prevented:", e));
    }

    // 🌟 更新翻頁功能，加入 hasSecondManual 的判斷
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
                
                // 🌟 根據是否已撿起第二本書 (bookPickedUp)，決定下一頁按鈕是否啟用
                if (bookPickedUp) {
                    btnNext.classList.remove('disabled');
                } else {
                    btnNext.classList.add('disabled');
                }
            } else {
                page1.classList.remove('active-page');
                page2.classList.add('active-page');
                btnPrev.classList.remove('disabled');
                btnNext.classList.add('disabled');
            }
            // 🌟 動態顯示總頁數：拿到書就顯示 /2，沒拿到就顯示 /1
            pageIndicator.innerText = `PAGE ${currentManualPage} / ${bookPickedUp ? 2 : 1}`;
        }, useFlash ? 100 : 0); 
    }

    btnPrev.addEventListener('click', () => { 
        if (currentManualPage > 1) {
            playActionSfx(sfxPageTurn); // 🌟 播放翻頁音效
            updateManualPage(currentManualPage - 1); 
        }
    });

    btnNext.addEventListener('click', () => { 
        if (currentManualPage < 2 && bookPickedUp) {
            playActionSfx(sfxPageTurn); // 🌟 播放翻頁音效
            updateManualPage(currentManualPage + 1); 
        }
    });

    function openManual() {
        playActionSfx(sfxOpenBook);
        updateManualPage(1, false); 
        manualModal.classList.add('manual-active');
        isPlayerControllable = false; 
        stickman.classList.add('stand-still');
        
        // 🌟 1. 解除 gameScreen 圖層封印，並提升場景層級，讓說明書完美蓋過 Icon
        const gameScreen = document.getElementById('gameScreen');
        const sceneManager = document.getElementById('scene-manager');
        const gameControls = document.querySelector('.game-controls');
        
        if (gameScreen) gameScreen.style.zIndex = 'auto';   // 解除父層的 stacking context
        if (sceneManager) sceneManager.style.zIndex = '20'; // 提升場景層級 (高於按鈕的 10)
        
        // 🌟 2. 鎖定右下角的 Icon，使其在說明書開啟期間完全無法被點擊或 Hover
        if (gameControls) gameControls.style.pointerEvents = 'none'; 
    }

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
    
    const inD1 = document.getElementById('input-d1-display');
    const inD2 = document.getElementById('input-d2-display');
    const inD3 = document.getElementById('input-d3-display');
    const inD4 = document.getElementById('input-d4-display');
    const inD5 = document.getElementById('input-d5-display');

    const orMonster = document.getElementById('or-monster');
    const xorMonster = document.getElementById('xor-monster');
    const finalBoss = document.getElementById('final-boss');
    
    const blueLaserPath = document.getElementById('blue-laser-path');
    const whiteLaserPath = document.getElementById('white-laser-path');
    const lightningPath = document.getElementById('lightning-path');

    if (ammoOnes > 0) document.getElementById('held-1-s2').style.opacity = '1';
    if (ammoZeros > 0) document.getElementById('held-0-s2').style.opacity = '1';

    let oldBtn = document.getElementById('inventory-manual-btn');
    if (oldBtn) {
        let manualBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(manualBtn, oldBtn);
        manualBtn.addEventListener('click', openManual);
    }
    closeManual.addEventListener('click', () => {
        manualModal.classList.remove('manual-active');
        isPlayerControllable = true;

        // 🌟 3. 關閉說明書時，將所有的圖層設定與點擊權限恢復原狀
        const gameScreen = document.getElementById('gameScreen');
        const sceneManager = document.getElementById('scene-manager');
        const gameControls = document.querySelector('.game-controls');

        if (gameScreen) gameScreen.style.zIndex = '1';
        if (sceneManager) sceneManager.style.zIndex = '2';
        if (gameControls) gameControls.style.pointerEvents = 'auto';

        // 檢查是否需要觸發閃爍動畫
        if (needsManualNotice) {
            needsManualNotice = false; // 重置狀態
            const manualBtn = document.getElementById('inventory-manual-btn');
            
            if (manualBtn) {
                manualBtn.classList.remove('manual-btn-notice');
                void manualBtn.offsetWidth; // 重新觸發 DOM 渲染
                manualBtn.classList.add('manual-btn-notice');
                
                // 動畫結束後乾淨俐落地移除
                setTimeout(() => {
                    manualBtn.classList.remove('manual-btn-notice');
                }, 850); 
            }
        }
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
    let inputValues3 = []; 
    let gate1Triggered = false;
    let gate2Triggered = false;
    let gate3Triggered = false; 
    let isNearGate = false;
    
    let isNearChest = false;
    let chestOpened = false;
    
    let isNearChest3 = false;
    let chest3Opened = false;
    
    let isNearHammer = false;
    let hammerPickedUp = false;
    let hammerReadyToPick = false; 
    let canAttack = true;

    let bookReadyToPick = false;
    let isNearBook = false;
    let bookPickedUp = false;
    let needsManualNotice = false; // 🌟 新增：用來記錄關閉時是否要閃爍
    const bookEPrompt = document.getElementById('book-e-prompt-s2');

    let marqueeCurrent = 0; 
    let marqueeInterval = null;
    let marqueeActive = false;

    function startMarquee() {
        const hasOne = ammoOnes > 0;
        const hasZero = ammoZeros > 0;
        
        if (!hasOne && !hasZero) {
            if (activePuzzle === 1) triggerBlueLaserDeath(true);
            else triggerLightningDeath(true, activePuzzle === 2 ? 280 : 430);
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
        if (marqueeCurrent === 0 && ammoOnes > 0) { 
            selectedValue = 1; 
            ammoOnes--; 
            playActionSfx(sfxPut1); // 🌟 播放放入 1 的音效
        } 
        else if (marqueeCurrent === 1 && ammoZeros > 0) { 
            selectedValue = 0; 
            ammoZeros--; 
            playActionSfx(sfxPut0); // 🌟 播放放入 0 的音效
        } 
        else { return; }
        
        stickman.classList.add('anim-insert');
        setTimeout(() => stickman.classList.remove('anim-insert'), 500);

        if (ammoOnes <= 0) document.getElementById('held-1-s2').style.opacity = '0';
        if (ammoZeros <= 0) document.getElementById('held-0-s2').style.opacity = '0';
        
        if (activePuzzle === 1) {
            inputValues1.push(selectedValue);
            if (inputValues1.length === 1) {
                inA.innerText = selectedValue; inA.style.opacity = '1';
                inA.classList.remove('ammo-loaded'); void inA.offsetWidth; inA.classList.add('ammo-loaded');
                marqueeTitle.innerText = 'INPUT B';
                if (ammoOnes <= 0 && ammoZeros <= 0) { stopMarquee(); marqueeSelector.classList.remove('active'); setTimeout(() => triggerCircuitDestruction(true), 500); return; }
                if (ammoOnes > 0 && ammoZeros <= 0) { option1.classList.remove('disabled'); option0.classList.add('disabled'); marqueeCurrent = 0; }
                else if (ammoOnes <= 0 && ammoZeros > 0) { option1.classList.add('disabled'); option0.classList.remove('disabled'); marqueeCurrent = 1; }
                updateMarqueeHighlight();
            } else if (inputValues1.length === 2) {
                inB.innerText = selectedValue; inB.style.opacity = '1';
                inB.classList.remove('ammo-loaded'); void inB.offsetWidth; inB.classList.add('ammo-loaded');
                isPlayerControllable = false; stickman.classList.add('stand-still'); stopMarquee(); marqueeSelector.classList.remove('active');
                setTimeout(() => evaluatePuzzle1(), 500);
            }
        } 
        else if (activePuzzle === 2) {
            inputValues2.push(selectedValue);
            const len = inputValues2.length;
            const targetDisplays = [inC1, inC2, inC3, inC4];
            const nextTitles = ['OR INPUT 2', 'AND INPUT 1', 'AND INPUT 2', 'COMPUTING...'];
            const display = targetDisplays[len - 1];
            display.innerText = selectedValue; display.style.opacity = '1';
            display.classList.remove('ammo-loaded'); void display.offsetWidth; display.classList.add('ammo-loaded');
            
            if (len < 4) {
                marqueeTitle.innerText = nextTitles[len - 1];
                if (ammoOnes <= 0 && ammoZeros <= 0) { stopMarquee(); marqueeSelector.classList.remove('active'); setTimeout(() => triggerLightningDeath(true, 280), 500); return; }
                if (ammoOnes > 0 && ammoZeros <= 0) { option1.classList.remove('disabled'); option0.classList.add('disabled'); marqueeCurrent = 0; }
                else if (ammoOnes <= 0 && ammoZeros > 0) { option1.classList.add('disabled'); option0.classList.remove('disabled'); marqueeCurrent = 1; }
                updateMarqueeHighlight();
            } else {
                isPlayerControllable = false; stickman.classList.add('stand-still'); stopMarquee(); marqueeSelector.classList.remove('active');
                setTimeout(() => evaluatePuzzle2(), 500);
            }
        }
        else if (activePuzzle === 4) {
            inputValues3.push(selectedValue);
            const len = inputValues3.length;
            const targetDisplays = [inD1, inD2, inD3, inD4, inD5];
            const nextTitles = ['XOR INPUT 1', 'XOR INPUT 2', 'XNOR INPUT 1', 'XNOR INPUT 2', 'COMPUTING...'];
            const display = targetDisplays[len - 1];
            display.innerText = selectedValue; display.style.opacity = '1';
            display.classList.remove('ammo-loaded'); void display.offsetWidth; display.classList.add('ammo-loaded');
            
            if (len < 5) {
                marqueeTitle.innerText = nextTitles[len - 1];
                if (ammoOnes <= 0 && ammoZeros <= 0) { stopMarquee(); marqueeSelector.classList.remove('active'); setTimeout(() => triggerLightningDeath(true, 430), 500); return; }
                if (ammoOnes > 0 && ammoZeros <= 0) { option1.classList.remove('disabled'); option0.classList.add('disabled'); marqueeCurrent = 0; }
                else if (ammoOnes <= 0 && ammoZeros > 0) { option1.classList.add('disabled'); option0.classList.remove('disabled'); marqueeCurrent = 1; }
                updateMarqueeHighlight();
            } else {
                isPlayerControllable = false; stickman.classList.add('stand-still'); stopMarquee(); marqueeSelector.classList.remove('active');
                setTimeout(() => evaluateFinalPuzzle(), 500);
            }
        }
    }

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

    function fireLightningAttack(sourceWorldX) {
        const cw = scene2.clientWidth; 
        const ch = scene2.clientHeight;
        const ex = ((worldX - cameraX) * cw) / 100;
        const ey = (py * ch) / 100 - 15;

        const lightningInterval = setInterval(() => {
            let d = "";
            let startPoints = [];

            if (sourceWorldX === 280) {
                const tip1 = document.getElementById('xor-tip-1');
                const tip2 = document.getElementById('xor-tip-2');
                if (tip1 && tip2) {
                    const rect1 = tip1.getBoundingClientRect();
                    const rect2 = tip2.getBoundingClientRect();
                    const sceneRect = scene2.getBoundingClientRect();
                    startPoints.push({ x: rect1.left + rect1.width / 2 - sceneRect.left, y: rect1.top - sceneRect.top });
                    startPoints.push({ x: rect2.left + rect2.width / 2 - sceneRect.left, y: rect2.top - sceneRect.top });
                }
            } else if (sourceWorldX === 430) {
                startPoints.push({ x: ((430 - cameraX) * cw) / 100 - 250, y: (50 * ch) / 100 });
            } else {
                startPoints.push({ x: ((sourceWorldX - cameraX) * cw) / 100 - 70, y: (50 * ch) / 100 + 10 });
            }

            startPoints.forEach(sp => {
                let sx = sp.x;
                let sy = sp.y;
                d += `M ${sx},${sy} `;
                const segments = 6;
                for(let i = 1; i < segments; i++) {
                    let px = sx + (ex - sx) * (i / segments) + (Math.random() - 0.5) * 60;
                    let py = sy + (ey - sy) * (i / segments) + (Math.random() - 0.5) * 60;
                    d += `L ${px},${py} `;
                }
                d += `L ${ex},${ey} `;
            });
            lightningPath.setAttribute('d', d);
        }, 50); 

        lightningPath.style.opacity = 1;
        setTimeout(() => { 
            clearInterval(lightningInterval); 
            lightningPath.style.opacity = 0; 
            lightningPath.setAttribute('d', ''); 
        }, 600);
    }

    function fireEnergyBalls(sourceWorldX, targetWorldX, outputXOffset = 0) {
        const cw = scene2.clientWidth; const ch = scene2.clientHeight;
        const sx = ((sourceWorldX - cameraX) * cw) / 100 + outputXOffset; 
        const sy = (50 * ch) / 100;
        const ex = ((targetWorldX - cameraX) * cw) / 100 - 75; 
        const ey = (50 * ch) / 100;

        const canvas = document.getElementById('laser-canvas');
        const bossWeaponAnd = document.getElementById('boss-weapon-and');
        const bossAndBody = document.getElementById('boss-and-body');
        const finalBossSVG = document.getElementById('final-boss');

        const bulges = [25, 55, 95, 140]; 

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                
                // 🌟 直接呼叫 Web Audio API 播放器，無延遲、無限制連發！
                const volSlider = document.getElementById('volumeSlider');
                if (volSlider && volSlider.value > 0) {
                    playShoot3Rapid(volSlider.value / 100);
                }

                const ball = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                ball.setAttribute('cx', sx);
                ball.setAttribute('cy', sy);
                ball.setAttribute('r', '16'); 
                ball.setAttribute('fill', 'none');
                ball.setAttribute('stroke', '#fff');
                ball.setAttribute('stroke-width', '5');
                ball.style.filter = 'drop-shadow(0 0 10px #fff) drop-shadow(0 0 25px #0ff)';
                ball.style.transition = 'transform 0.4s ease-in, opacity 0.1s ease-out';
                
                canvas.appendChild(ball);
                void ball.getBoundingClientRect(); 

                ball.style.transform = `translate(${ex - sx}px, ${ey - sy}px)`;

                setTimeout(() => {
                    ball.style.opacity = '0';
                    setTimeout(() => ball.remove(), 200);

                    if (i < 4) {
                        let b = bulges[i];
                        let pathData = `M 60 50 C 80 50, 100 ${50 - b}, 120 ${50 - b} C 150 ${50 - b}, 170 ${75 - b*0.3}, 170 100 C 170 ${125 + b*0.3}, 150 ${150 + b}, 120 ${150 + b} C 100 ${150 + b}, 80 150, 60 150 Z`;
                        bossAndBody.setAttribute('d', pathData);
                        
                        bossWeaponAnd.style.filter = 'drop-shadow(0 0 30px #fff) brightness(1.5)';
                        
                        let shake = setInterval(() => { scene2.style.transform = `translate(${(Math.random()-0.5)*10}px, ${(Math.random()-0.5)*10}px)`; }, 40);
                        setTimeout(() => {
                            clearInterval(shake);
                            scene2.style.transform = 'none';
                            bossWeaponAnd.style.filter = 'none';
                        }, 150);
                    } else {
                        // 🌟 第 5 顆子彈擊中！瞬間同時觸發三重爆炸音效！
                        playActionSfx(sfxExplosion1);
                        playActionSfx(sfxExplosion2);
                        playActionSfx(sfxExplosion3);

                        let megaJaggedPath = `M 60 50 L 150 -150 L 500 -400 L 250 -50 L 800 -100 L 350 50 L 1000 100 L 350 150 L 800 300 L 250 250 L 500 600 L 150 350 L 60 150 Z`;
                        
                        Array.from(finalBossSVG.children).forEach((child, index) => {
                            if (index > 0) child.style.display = 'none';
                        });

                        bossAndBody.style.transition = 'd 0.05s ease-out, fill 0.05s ease-out';
                        bossAndBody.setAttribute('d', megaJaggedPath);
                        bossAndBody.setAttribute('fill', '#fff'); 
                        bossWeaponAnd.style.filter = 'drop-shadow(0 0 150px #fff) drop-shadow(0 0 80px #fff) brightness(5)';
                        
                        let bigShake = setInterval(() => { scene2.style.transform = `translate(${(Math.random()-0.5)*40}px, ${(Math.random()-0.5)*40}px)`; }, 40);
                        
                        setTimeout(() => {
                            clearInterval(bigShake);
                            scene2.style.transform = 'none';
                            finalBossSVG.remove();
                            
                            const chest3Container = document.getElementById('chest-3-container');
                            chest3Container.style.opacity = '1';
                            
                            isPlayerControllable = true;
                            activePuzzle = 5; 
                        }, 800);
                    }
                }, 400); 

            }, i * 350); 
        }
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
        playActionSfx(sfxAttack1);
        fireBlueLaser();
        setTimeout(() => { stickman.classList.add('player-dead'); setTimeout(() => { switchScene(2, returnToScene1 ? 1 : 2); }, 1500); }, 350); 
    }

    function triggerLightningDeath(returnToScene1 = false, sourceX = 280) {
        isPlayerControllable = false; stickman.classList.add('stand-still');
        playActionSfx(sfxAttack2);
        fireLightningAttack(sourceX);
        setTimeout(() => {
            stickman.classList.add('electrocuted'); 
            setTimeout(() => {
                stickman.classList.remove('electrocuted'); stickman.classList.add('burnt-dead'); 
                setTimeout(() => { switchScene(2, returnToScene1 ? 1 : 2); }, 1500);
            }, 600); 
        }, 100); 
    }

    function fireMegaBlueLaser(sourceWorldX) {
        const cw = scene2.clientWidth; const ch = scene2.clientHeight;
        const sx = ((sourceWorldX - cameraX) * cw) / 100 - 120; 
        const sy = (50 * ch) / 100;
        const ex = -cw; 
        const ey = (50 * ch) / 100;

        const megaLaser = document.getElementById('mega-blue-laser');
        const megaLaserCore = document.getElementById('mega-blue-laser-core');
        
        const pathData = `M ${sx},${sy} L ${ex},${ey}`;
        
        megaLaser.setAttribute('d', pathData);
        megaLaser.style.opacity = 1;
        megaLaser.style.transition = 'none';
        
        if (megaLaserCore) {
            megaLaserCore.setAttribute('d', pathData);
            megaLaserCore.style.opacity = 1;
            megaLaserCore.style.transition = 'none';
        }

        let shake = setInterval(() => {
            scene2.style.transform = `translate(${(Math.random()-0.5)*25}px, ${(Math.random()-0.5)*25}px)`;
        }, 40);

        setTimeout(() => { 
            clearInterval(shake);
            scene2.style.transform = 'none';
            megaLaser.style.transition = 'opacity 0.6s ease-out'; 
            megaLaser.style.opacity = 0; 
            if (megaLaserCore) {
                megaLaserCore.style.transition = 'opacity 0.6s ease-out'; 
                megaLaserCore.style.opacity = 0; 
            }
        }, 600);
    }

    function triggerCircuitDestruction(returnToScene1 = false) {
        isPlayerControllable = false; stickman.classList.add('stand-still');
        playActionSfx(sfxAttack3);
        fireMegaBlueLaser(430);
        setTimeout(() => {
            document.getElementById('circuit-3').classList.add('circuit-broken');
            for(let i=1; i<=5; i++){
                let disp = document.getElementById(`input-d${i}-display`);
                if(disp && disp.innerText !== "") {
                    disp.style.transition = 'none'; 
                    disp.classList.add('text-broken'); 
                }
            }
            setTimeout(() => { switchScene(2, returnToScene1 ? 1 : 2); }, 1500);
        }, 150); 
    }

    function evaluatePuzzle1() {
        const result = (inputValues1[0] === 1 && inputValues1[1] === 1) ? 1 : 0;
        setTimeout(() => {
            if (result === 1) {
                playActionSfx(sfxShoot1and2);
                fireWhiteLaser(80, 130, 70);
                setTimeout(() => {
                    document.getElementById('monster-eyes-alive').style.opacity = '0'; 
                    document.getElementById('monster-eyes-dead').style.opacity = '1';
                    document.getElementById('or-monster').classList.add('monster-dead');
                    setTimeout(() => { isPlayerControllable = true; activePuzzle = 2; marqueeTitle.innerText = 'OR INPUT 1'; }, 1000);
                }, 250); 
            } else { triggerBlueLaserDeath((playerState.ammoOnes || 0) + (playerState.ammoZeros || 0) < 6); }
        }, 500);
    }

    function evaluatePuzzle2() {
        const orResult = (inputValues2[0] === 1 || inputValues2[1] === 1) ? 1 : 0;
        const andResult = (inputValues2[2] === 1 && inputValues2[3] === 1) ? 1 : 0;
        const finalResult = (orResult === 1 && andResult === 1) ? 1 : 0;

        setTimeout(() => {
            if (finalResult === 1) {
                playActionSfx(sfxShoot1and2);
                fireWhiteLaser(230, 280, 122);
                setTimeout(() => {
                    const xorM = document.getElementById('xor-monster');
                    xorM.style.opacity = '0.3'; xorM.style.transform = 'translate(-50%, -50%) rotate(90deg) translate(20px, 30px)';
                    document.getElementById('xor-monster-eyes-alive').style.opacity = '0'; 
                    document.getElementById('xor-monster-eyes-dead').style.opacity = '1';
                    setTimeout(() => { document.getElementById('and-chest').style.opacity = '1'; document.getElementById('and-chest').classList.add('chest-dropped'); }, 400); 
                    setTimeout(() => { isPlayerControllable = true; activePuzzle = 3; }, 1000);
                }, 250); 
            } else { triggerLightningDeath((playerState.ammoOnes || 0) + (playerState.ammoZeros || 0) < 6, 280); }
        }, 500);
    }

    function evaluateFinalPuzzle() {
        const notResult = (inputValues3[0] === 0) ? 1 : 0;
        const xorResult = (inputValues3[1] !== inputValues3[2]) ? 1 : 0;
        const xnorResult = (inputValues3[3] === inputValues3[4]) ? 1 : 0;
        const finalResult = (notResult === 1 && xorResult === 1 && xnorResult === 1) ? 1 : 0;

        setTimeout(() => {
            if (finalResult === 1) {
                document.querySelectorAll('.boss-eyes-alive').forEach(el => el.style.opacity = '0');
                document.querySelectorAll('.boss-eyes-dead').forEach(el => el.style.opacity = '1');
                fireEnergyBalls(380, 430, 160);
            } else { 
                const totalAmmo = (playerState.ammoOnes || 0) + (playerState.ammoZeros || 0) + (ammoOnes + ammoZeros);
                triggerCircuitDestruction(totalAmmo < 5);
            } 
        }, 500);
    }

    function handleKeyDown(e) {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = true;
        
        if (key === 'p') {
            playerState.ammoOnes = 5; playerState.ammoZeros = 1;
            isPlayerControllable = false; stickman.classList.add('stand-still');
            switchScene(1, 2); return;
        }

        if (key === 'q' && marqueeActive) selectCurrentOption();

        // 🌟 新增 bookPickedUp 條件：沒撿起第二本書前，按 J 無效
        if (key === 'j' && hammerPickedUp && bookPickedUp && isPlayerControllable && canAttack) {
            canAttack = false;

            stickman.classList.add('anim-attack');
            
            setTimeout(() => {
                stickman.classList.remove('anim-attack');
            }, 400);
            
            setTimeout(() => {
                canAttack = true;
            }, 1000);
        }

        if (key === 'e') {
            if (activePuzzle === 3 && isNearChest && !chestOpened) {
                chestOpened = true; isPlayerControllable = false; stickman.classList.add('stand-still');
                document.getElementById('chest-e-prompt').style.opacity = '0';
                
                playActionSfx(sfxOpenChest);

                const chest = document.getElementById('and-chest');
                chest.classList.remove('chest-dropped'); chest.classList.add('chest-opening');
                
                setTimeout(() => {
                    chest.classList.remove('chest-opening'); chest.style.filter = 'drop-shadow(0 0 15px #fff)'; chest.style.stroke = '#fff';
                    
                    // 🌟 核心同步魔法：重載 iframe
                    const mimicIframe = document.getElementById('mimic-iframe');
                    if (mimicIframe) mimicIframe.src = mimicIframe.src;

                    const lootPanel = document.getElementById('loot-panel');
                    lootPanel.classList.add('loot-show');
                    
                    ammoOnes += 1; ammoZeros += 4;
                    document.getElementById('held-1-s2').style.opacity = '1'; document.getElementById('held-0-s2').style.opacity = '1';

                    // 🌟 將介面停留時間由 8000 延長到 8500 (比原本多停留 0.5 秒)
                    setTimeout(() => {
                        lootPanel.classList.remove('loot-show');
                        isPlayerControllable = true; activePuzzle = 4; marqueeTitle.innerText = 'NOT INPUT'; 
                    }, 8500);

                }, 800);
            }

            if (activePuzzle === 5 && isNearChest3 && !chest3Opened) {
                chest3Opened = true; 
                isPlayerControllable = false; 
                stickman.classList.add('stand-still');
                document.getElementById('chest-e-prompt-3').style.opacity = '0';
                
                const chest3Body = document.getElementById('chest-3-body');
                const andHammer = document.getElementById('and-hammer-drawn');
                const motionLines = document.getElementById('hammer-motion');
                const book = document.getElementById('falling-book-s2');
                const in1 = document.getElementById('in1');
                const in2 = document.getElementById('in2');
                const in3 = document.getElementById('in3');
                
                chest3Body.style.filter = 'drop-shadow(0 0 15px #fff)';

                setTimeout(() => {
                    chest3Body.setAttribute('d', 'M -30 -30 L 30 -30 C 30 -10, 55 55, 0 55 C -55 55, -30 -10, -30 -30 Z');
                    chest3Body.style.filter = 'drop-shadow(0 0 25px #0ff)';
                    chest3Body.style.stroke = '#0ff';
                }, 100);

                setTimeout(() => {
                    chest3Body.setAttribute('d', 'M -30 -30 L 30 -30 C 75 -15, 75 35, 0 35 C -75 35, -75 -15, -30 -30 Z');
                }, 500);

                setTimeout(() => {
                    chest3Body.setAttribute('d', 'M -30 -30 L 30 -30 C -10 -5, 60 40, 0 45 C -60 40, 10 -5, -30 -30 Z');
                }, 900);

                setTimeout(() => {
                    chest3Body.setAttribute('d', 'M -35 -10 L 35 -10 C 35 30, 20 50, 0 50 C -20 50, -35 30, -35 -10 Z');
                    chest3Body.style.filter = 'drop-shadow(0 0 15px rgba(255,255,255,0.8))';
                    chest3Body.style.stroke = '#fff';

                    in1.style.transformOrigin = '-15px -30px';
                    in1.style.transform = 'translate(-20px, 20px) rotate(-45deg)';
                    in3.style.transformOrigin = '15px -30px';
                    in3.style.transform = 'translate(20px, 20px) rotate(45deg)';

                    in2.style.opacity = '0';
                    
                    // 🌟 在 AND Hammer 彈出的這瞬間播放音效！
                    playActionSfx(sfxChestPop);
                    
                    andHammer.style.opacity = '1';
                    andHammer.style.transform = 'translateY(-25px)'; 

                    motionLines.style.opacity = '1';

                    book.style.transition = 'top 0.4s cubic-bezier(0.1, 0.8, 0.3, 1), left 0.4s linear, transform 0.4s linear, opacity 0.1s';
                    book.style.opacity = '1';
                    book.style.top = 'calc(50% - 20px)';
                    book.style.left = 'calc(430% + 60px)';
                    book.style.transform = 'translate(-50%, -50%) rotate(360deg) scale(1)';

                    setTimeout(() => {
                        motionLines.style.opacity = '0'; 
                        andHammer.classList.add('hammer-breath');

                        book.style.transition = 'top 0.3s cubic-bezier(0.5, 0, 0.8, 0.5), left 0.3s linear, transform 0.3s linear';
                        book.style.top = 'calc(50% + 50px)';
                        book.style.left = 'calc(430% + 80px)';
                        book.style.transform = 'translate(-50%, -50%) rotate(375deg) scale(1)';
                        
                        setTimeout(() => {
                            isPlayerControllable = true;
                            hammerReadyToPick = true; 
                            bookReadyToPick = true; 
                        }, 400);
                    }, 400);

                }, 1300);
            }

            if (activePuzzle === 5 && isNearHammer && !hammerPickedUp && hammerReadyToPick) {
                playActionSfx(sfxPickupWeapon);
                hammerPickedUp = true;
                isNearHammer = false;
                isPlayerControllable = false; 
                stickman.classList.add('stand-still');
                
                document.getElementById('hammer-e-prompt').style.opacity = '0';
                
                const andHammer = document.getElementById('and-hammer-drawn');
                andHammer.style.transition = 'all 0.5s cubic-bezier(0.55, 0.055, 0.675, 0.19)';
                andHammer.style.transform = 'translateY(-150px) scale(0)';
                andHammer.style.opacity = '0';

                const modal = document.getElementById('hammer-loot-modal');
                const topText = document.getElementById('hammer-top-text');
                const titleEl = document.getElementById('hammer-title'); // 🌟 新增綁定
                const separator = document.getElementById('hammer-separator');
                const descEl = document.getElementById('hammer-desc');
                const centerContent = document.getElementById('hammer-center-content');

                // 初始化隱藏狀態
                topText.style.opacity = '0'; topText.style.transform = 'translateY(-10px)';
                titleEl.style.opacity = '0'; titleEl.style.transform = 'translateY(-10px)';
                separator.style.width = '0';
                descEl.style.opacity = '0'; descEl.style.transform = 'translateY(10px)';
                centerContent.style.opacity = '0';
                centerContent.classList.remove('spectacular-entry');

                modal.classList.add('show-init');
                
                setTimeout(() => {
                    modal.classList.add('draw-borders');
                    modal.classList.add('show-bg');
                }, 100);

                // 動畫 1：顯示文字與名稱
                setTimeout(() => { 
                    topText.style.opacity = '1'; topText.style.transform = 'translateY(0)'; 
                    titleEl.style.opacity = '1'; titleEl.style.transform = 'translateY(0)';
                }, 800);
                // 動畫 2：畫線
                setTimeout(() => { separator.style.width = '100%'; }, 1100);
                // 動畫 3：顯示說明
                setTimeout(() => { descEl.style.opacity = '1'; descEl.style.transform = 'translateY(0)'; }, 1400);
                // 動畫 4：最後顯示 ICON
                setTimeout(() => { centerContent.classList.add('spectacular-entry'); }, 1700);

                setTimeout(() => {
                    modal.style.opacity = '0';
                    setTimeout(() => { modal.classList.remove('show-init', 'draw-borders', 'show-bg'); }, 400);
                    
                    setTimeout(() => {
                        isPlayerControllable = true;
                        
                        const heldOne = document.getElementById('held-1-s2');
                        if (heldOne) heldOne.style.opacity = '0';
                        
                        const heldHammer = document.getElementById('held-hammer-s2');
                        heldHammer.style.opacity = '1';
                        
                    }, 500); 
                }, 5500);
             
            }
            if (activePuzzle === 5 && isNearBook && !bookPickedUp && bookReadyToPick) {
                bookPickedUp = true;
                needsManualNotice = true; // 🌟 告訴系統：等等關閉說明書時要閃爍！
                isNearBook = false;
                bookEPrompt.style.opacity = '0';
                
                const book = document.getElementById('falling-book-s2');
                book.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
                book.style.transform = 'translate(-50%, -50%) rotate(375deg) scale(0)';
                book.style.opacity = '0';

                setTimeout(() => {
                    openManual(); 
                    updateManualPage(2, false); // 🌟 打開說明書的同時，直接幫玩家翻到新獲得的第二頁！
                }, 400); 
            }
        }
    }
    
    function handleKeyUp(e) {
        const key = e.key.toLowerCase();
        if (keys.hasOwnProperty(key)) keys[key] = false;
    }

    function gameLoopS2() {

        if (destroyed) {
            return;
        }

        if (!isPlayerControllable) { scheduleSceneFrame(gameLoopS2); return; }

        let moved = false; let speedX = 0.4; let speedY = 0.3; 
        if (keys.w) { py -= speedY; moved = true; }
        if (keys.s) { py += speedY; moved = true; }
        if (keys.a) { worldX -= speedX; moved = true; facing = -1; }
        if (keys.d) { worldX += speedX; moved = true; facing = 1; }

        py = Math.max(10, Math.min(90, py)); worldX = Math.max(5, worldX); 

        if (moved) { stickman.classList.remove('stand-still'); } else { stickman.classList.add('stand-still'); }

        cameraX = Math.max(0, worldX - 20); let px = worldX - cameraX;
        stickman.style.left = `${px}%`; stickman.style.top = `${py}%`;
        stickman.style.transform = `translate(-50%, -50%) scaleX(${facing})`;
        environmentLayer.style.transform = `translateX(-${cameraX}%)`;

        if (activePuzzle === 1) {
            const distanceToGate1 = Math.abs(worldX - 80);
            const distanceY = Math.abs(py - 50); // 🌟 新增 Y 軸距離判斷
            const monster1InView = (130 - cameraX) <= 100; 
            
            // 🌟 加入 distanceY < 15，限制上下距離
            if (distanceToGate1 < 25 && distanceY < 15 && !gate1Triggered && monster1InView) {
                isNearGate = true; marqueeSelector.style.left = `calc(${80 - cameraX}% - 30px)`; marqueeSelector.style.top = 'calc(50% + 80px)';
                if (!marqueeActive && inputValues1.length < 2) { marqueeSelector.classList.add('active'); startMarquee(); }
            } else if (distanceToGate1 >= 25 || distanceY >= 15 || !monster1InView) {
                isNearGate = false; if (marqueeActive && inputValues1.length < 2) { marqueeSelector.classList.remove('active'); stopMarquee(); }
            }
            if (worldX > 100 && !gate1Triggered && inputValues1.length < 2) {
                gate1Triggered = true; stopMarquee(); marqueeSelector.classList.remove('active');
                triggerBlueLaserDeath((ammoOnes + ammoZeros) < (2 - inputValues1.length)); 
            }
        } 
        else if (activePuzzle === 2) {
            const distanceToGate2 = Math.abs(worldX - 230);
            const distanceY = Math.abs(py - 50); // 🌟 新增 Y 軸距離判斷
            const monster2InView = (280 - cameraX) <= 100; 
            
            if (distanceToGate2 < 30 && distanceY < 15 && !gate2Triggered && monster2InView) {
                isNearGate = true; marqueeSelector.style.left = `calc(${230 - cameraX}% - 30px)`; marqueeSelector.style.top = 'calc(50% + 100px)';
                if (!marqueeActive && inputValues2.length < 4) { marqueeSelector.classList.add('active'); startMarquee(); }
            } else if (distanceToGate2 >= 30 || distanceY >= 15 || !monster2InView) {
                isNearGate = false; if (marqueeActive && inputValues2.length < 4) { marqueeSelector.classList.remove('active'); stopMarquee(); }
            }
            if (worldX > 250 && !gate2Triggered && inputValues2.length < 4) {
                gate2Triggered = true; stopMarquee(); marqueeSelector.classList.remove('active');
                triggerLightningDeath((ammoOnes + ammoZeros) < (4 - inputValues2.length), 280); 
            }
        }
        else if (activePuzzle === 3) {
            const distanceToChest = Math.abs(worldX - 285);
            const distanceY = Math.abs(py - 58); // 🌟 第一個寶箱的位置偏低 (58%)
            const ePrompt = document.getElementById('chest-e-prompt');
            
            if (distanceToChest < 30 && distanceY < 15 && !chestOpened) { 
                isNearChest = true; ePrompt.style.opacity = '1'; 
            } else { 
                isNearChest = false; ePrompt.style.opacity = '0'; 
            }

            if (worldX > 400 && !chestOpened) {
                chestOpened = true; 
                triggerCircuitDestruction(false); 
            }
        }
        else if (activePuzzle === 4) {
            const distanceToGate3 = Math.abs(worldX - 380);
            const distanceY = Math.abs(py - 50); // 🌟 新增 Y 軸距離判斷

            if (distanceToGate3 < 35 && distanceY < 15 && !gate3Triggered) {
                isNearGate = true; 
                marqueeSelector.style.left = `calc(${380 - cameraX}% - 30px)`; 
                marqueeSelector.style.top = 'calc(50% + 130px)'; 
                if (!marqueeActive && inputValues3.length < 5) { marqueeSelector.classList.add('active'); startMarquee(); }
            } else if (distanceToGate3 >= 35 || distanceY >= 15) {
                isNearGate = false; if (marqueeActive && inputValues3.length < 5) { marqueeSelector.classList.remove('active'); stopMarquee(); }
            }
            if (worldX > 400 && !gate3Triggered && inputValues3.length < 5) {
                gate3Triggered = true; stopMarquee(); marqueeSelector.classList.remove('active');
                const hasEnoughAmmo = (ammoOnes + ammoZeros) >= (5 - inputValues3.length);
                triggerCircuitDestruction(!hasEnoughAmmo);
            }
        }
        else if (activePuzzle === 5) {
            const distanceToChest3 = Math.abs(worldX - 430);
            const distanceY = Math.abs(py - 50); 
            const ePrompt3 = document.getElementById('chest-e-prompt-3');
            const hPrompt = document.getElementById('hammer-e-prompt');
            
            if (distanceToChest3 < 30 && distanceY < 15 && !chest3Opened) { 
                isNearChest3 = true; ePrompt3.style.opacity = '1'; 
            } else { 
                isNearChest3 = false; ePrompt3.style.opacity = '0'; 
            }

            if (chest3Opened && hammerReadyToPick && !hammerPickedUp) {
                if (distanceToChest3 < 25 && distanceY < 15) { 
                    isNearHammer = true;
                    hPrompt.style.opacity = '1';
                } else {
                    isNearHammer = false;
                    hPrompt.style.opacity = '0';
                }
            }

            if (chest3Opened && bookReadyToPick && !bookPickedUp) {
                const distanceToBook = Math.abs(worldX - 438); 
                if (distanceToBook < 20 && distanceY < 15) { 
                    isNearBook = true;
                    bookEPrompt.style.opacity = '1';
                } else { 
                    isNearBook = false;
                    bookEPrompt.style.opacity = '0';
                }
            }

            // 🌟 觸發切換到 Scene 3 的過場邏輯
            // 當玩家往右走超過 480 且已經拿到了書跟槌子（可以根據需求放寬條件）
            if (worldX > 480) { 
                isPlayerControllable = false;
                stickman.classList.add('stand-still');
                
                // 🌟 把重要狀態存入 playerState，讓 scene3 可以無縫讀取
                playerState.ammoOnes = ammoOnes;
                playerState.ammoZeros = ammoZeros;
                playerState.hasHammer = hammerPickedUp;
                playerState.hasSecondManual = bookPickedUp;
                
                switchScene(2, 3);
                return; // 停止 scene2 的迴圈
            }
        }

        scheduleSceneFrame(gameLoopS2);
    }

    scheduleSceneFrame(gameLoopS2);

    function destroy() {
        if (destroyed) {
            return;
        }

        destroyed = true;
        isPlayerControllable = false;

        keys.w = false;
        keys.a = false;
        keys.s = false;
        keys.d = false;

        resourceScope?.dispose();
    }

    return {
        handleKeyDown,
        handleKeyUp,
        destroy
    };
}