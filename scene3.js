// =========================================
// WJ STUDIO - 場景 3：全新領域 (scene3.js)
// =========================================

export function initScene3(playerState, switchScene) {
    const scene3 = document.getElementById('scene-3');
    const scene3InstanceToken = Symbol('scene3-instance');
    window._scene3InstanceToken = scene3InstanceToken;
    
    if (window._scene2KeyDown) {
        window.removeEventListener('keydown', window._scene2KeyDown);
        window.removeEventListener('keyup', window._scene2KeyUp);
    }
    if (window._scene3KeyDown) {
        window.removeEventListener('keydown', window._scene3KeyDown);
        window.removeEventListener('keyup', window._scene3KeyUp);
    }

    // =========================================================
    // 🌟 核心修復：重置全局 UI，清除上一局遺留的背包/營地 Icon
    // =========================================================
    const existingBpBtn = document.getElementById('inventory-backpack-btn');
    if (existingBpBtn) {
        existingBpBtn.remove();
    }

    let ammoOnes = Math.max(0, Number(playerState.ammoOnes) || 0);
    let ammoZeros = Math.max(0, Number(playerState.ammoZeros) || 0);
    let hasHammer = playerState.hasHammer ?? true; 
    let bookPickedUp = playerState.hasSecondManual ?? true; 

    // ==========================================
    // 🌟 新增：雙手與背包裝備資料庫
    // ==========================================
    let hand1Item = 'hammer'; // 主手 (槌子專武)
    let hand2Item = null;     // 副手 (專門拿三角怪 'body')
    let headItem = null;      // 頭部 (專門戴三角形 'hat')
    let backpackGrid = new Array(17).fill(null); 
    let nearbyDropItem = null;

    // 🌟 輔助函式：根據物品類型產生對應的 SVG 標籤
    function getItemSVG(itemType) {
        if (itemType === 'body') {
            // 無眼睛的三角身體 (附天線與勾勾腳)
            return `<line x1="65" y1="30" x2="65" y2="15" stroke="#fff" stroke-width="8" stroke-linecap="round"/><polygon points="65,30 5,90 125,90" fill="#000" stroke="#fff" stroke-width="8" stroke-linejoin="round"/><path d="M 65 90 L 65 105 Q 65 112 73 112" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`;
        } else if (itemType === 'hat') {
            // 純粹的三角帽
            return `<polygon points="65,30 5,90 125,90" fill="#000" stroke="#fff" stroke-width="8" stroke-linejoin="round"/>`;
        }
        return '';
    }

    // 🌟 中型三角怪的模板 (用於大怪分裂後動態生成)
    function getMediumEnemySVG(id) {
        return `
        <svg id="${id}" class="triangle-enemy tri-jump" style="--jump-height: 80px; --jump-delay: 0s; --facing: 1; width: 120px; height: 120px;" viewBox="0 0 130 130" stroke="#fff" stroke-width="5" fill="#000" stroke-linecap="round" stroke-linejoin="round">
            <line x1="65" y1="30" x2="65" y2="15" />
            <polygon points="65,30 5,90 125,90" />
            <g class="tri-eye-open"><circle cx="54" cy="55" r="3.5" fill="#fff" stroke="none" /><circle cx="76" cy="55" r="3.5" fill="#fff" stroke="none" /></g>
            <g class="tri-eye-closed"><polyline points="48,50 55,55 48,60" fill="none" stroke-linejoin="round"/><polyline points="82,50 75,55 82,60" fill="none" stroke-linejoin="round"/></g>
            <g class="tri-eye-attack-prep"><line x1="49" y1="52" x2="59" y2="59" stroke-width="4" /><line x1="81" y1="52" x2="71" y2="59" stroke-width="4" /></g>
            <g class="tri-eye-attack-dash">
                <path class="dizzy-spin" style="transform-origin: 54px 55px;" d="M 54 55 A 1.2 1.2 0 0 1 56.4 55 A 2.4 2.4 0 0 1 51.6 55 A 3.6 3.6 0 0 1 58.8 55 A 4.8 4.8 0 0 1 49.2 55" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>
                <path class="dizzy-spin" style="transform-origin: 76px 55px;" d="M 76 55 A 1.2 1.2 0 0 1 78.4 55 A 2.4 2.4 0 0 1 73.6 55 A 3.6 3.6 0 0 1 80.8 55 A 4.8 4.8 0 0 1 71.2 55" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>
            </g>
            <path class="tri-leg-smooth" d="M 65 90 L 65 105 Q 65 112 73 112" />
        </svg>`;
    }

    // 🌟 小型三角怪的模板 (修正為與 #enemy-small 外觀 100% 一致)
    function getSmallEnemySVG(id) {
        return `
        <svg id="${id}" class="triangle-enemy tri-jump" style="--jump-height: 50px; --jump-delay: 0s; --facing: 1; width: 70px; height: 70px;" viewBox="0 0 130 130" stroke="#fff" stroke-width="6" fill="#000" stroke-linecap="round" stroke-linejoin="round">
            <line x1="65" y1="30" x2="65" y2="15" />
            <polygon points="65,30 5,90 125,90" />
            <g class="tri-eye-open"><circle cx="56" cy="55" r="3" fill="#fff" stroke="none" /><circle cx="74" cy="55" r="3" fill="#fff" stroke="none" /></g>
            <g class="tri-eye-closed"><polyline points="50,51 56,55 50,59" fill="none" stroke-linejoin="round"/><polyline points="80,51 74,55 80,59" fill="none" stroke-linejoin="round"/></g>
            <g class="tri-eye-attack-prep"><line x1="52" y1="52" x2="60" y2="58" stroke-width="4" /><line x1="78" y1="52" x2="70" y2="58" stroke-width="4" /></g>
            <g class="tri-eye-attack-dash">
                <path class="dizzy-spin" style="transform-origin: 56px 55px;" d="M 56 55 A 1 1 0 0 1 58 55 A 2 2 0 0 1 54 55 A 3 3 0 0 1 60 55 A 4 4 0 0 1 52 55" fill="none" stroke="#fff" stroke-width="1.0" stroke-linecap="round"/>
                <path class="dizzy-spin" style="transform-origin: 74px 55px;" d="M 74 55 A 1 1 0 0 1 76 55 A 2 2 0 0 1 72 55 A 3 3 0 0 1 78 55 A 4 4 0 0 1 70 55" fill="none" stroke="#fff" stroke-width="1.0" stroke-linecap="round"/>
            </g>
            <path class="tri-leg-smooth" d="M 65 90 L 65 105 Q 65 112 73 112" />
        </svg>`;
    }


    // ==============================================================
    // 🌟 精準 BOSS 外觀：保留六枝、AND 閘、Buffer 與雙六邊形結構。
    // 臉部改為直接依照內六邊形座標繪製的動漫風表情，避免縮放舊圖造成幼稚與扁平感。
    // BOSS 名稱：冰霜風之瞬・斷頭台
    // ==============================================================
    function getBossSVG() {
        return `
            <svg id="scene3-boss-svg" viewBox="-250 -250 500 500" role="img" aria-label="冰霜風之瞬 斷頭台">
                <defs>
                    <!-- AND 閘：幾何保持使用者提供版本；加前綴避免與其他場景重複 ID。 -->
                    <path id="boss-precise-and-gate" d="M 0,-15 L 0,15 Q 26,15 26,0 Q 26,-15 0,-15 Z" fill="#000" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>

                    <!-- 上下兩根：上下頂點、兩層 AND 閘與最外端 Buffer。 -->
                    <g id="boss-precise-branch-v">
                        <line x1="0" y1="0" x2="0" y2="-165" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
                        <polygon points="-17,-165 17,-165 0,-195" fill="#000" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>

                        <line x1="0" y1="-125" x2="-25" y2="-150" stroke="#fff" stroke-width="3"/>
                        <g transform="translate(-25, -150) rotate(-135)"><use href="#boss-precise-and-gate"/></g>
                        <line x1="0" y1="-125" x2="25" y2="-150" stroke="#fff" stroke-width="3"/>
                        <g transform="translate(25, -150) rotate(-45)"><use href="#boss-precise-and-gate"/></g>

                        <line x1="0" y1="-90" x2="-25" y2="-115" stroke="#fff" stroke-width="3"/>
                        <g transform="translate(-25, -115) rotate(-135)"><use href="#boss-precise-and-gate"/></g>
                        <line x1="0" y1="-90" x2="25" y2="-115" stroke="#fff" stroke-width="3"/>
                        <g transform="translate(25, -115) rotate(-45)"><use href="#boss-precise-and-gate"/></g>
                    </g>

                    <!-- 左右四根：側邊頂點、兩層 AND 閘與最外端 Buffer。 -->
                    <g id="boss-precise-branch-h">
                        <line x1="0" y1="0" x2="0" y2="-150" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
                        <polygon points="-17,-150 17,-150 0,-180" fill="#000" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>

                        <line x1="0" y1="-110" x2="-25" y2="-135" stroke="#fff" stroke-width="3"/>
                        <g transform="translate(-25, -135) rotate(-135)"><use href="#boss-precise-and-gate"/></g>
                        <line x1="0" y1="-110" x2="25" y2="-135" stroke="#fff" stroke-width="3"/>
                        <g transform="translate(25, -135) rotate(-45)"><use href="#boss-precise-and-gate"/></g>

                        <line x1="0" y1="-75" x2="-25" y2="-100" stroke="#fff" stroke-width="3"/>
                        <g transform="translate(-25, -100) rotate(-135)"><use href="#boss-precise-and-gate"/></g>
                        <line x1="0" y1="-75" x2="25" y2="-100" stroke="#fff" stroke-width="3"/>
                        <g transform="translate(25, -100) rotate(-45)"><use href="#boss-precise-and-gate"/></g>
                    </g>
                </defs>

                <!-- 六枝配置與角度完整保留。 -->
                <g id="boss-branches">
                    <use href="#boss-precise-branch-v" />
                    <use href="#boss-precise-branch-v" transform="rotate(180)" />
                    <use href="#boss-precise-branch-h" transform="rotate(53.13)" />
                    <use href="#boss-precise-branch-h" transform="rotate(126.87)" />
                    <use href="#boss-precise-branch-h" transform="rotate(-126.87)" />
                    <use href="#boss-precise-branch-h" transform="rotate(-53.13)" />
                </g>

                <!-- 核心雙六邊形：比例與座標保持不變。 -->
                <polygon id="boss-core-outer" points="0,-90 60,-45 60,45 0,90 -60,45 -60,-45" fill="#0a0a0f" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
                <polygon id="boss-core-inner" points="0,-70 45,-35 45,35 0,70 -45,35 -45,-35" fill="#000" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>

                <!-- ===================================================
                     冰霜風之瞬・斷頭台：無眼球動漫表情系統
                     僅保留銳利眼瞼、嘴型與必要的吹氣輪廓；刪除瞳孔、眼球高光、
                     多餘臉頰刻線，讓表情更像冷酷的動漫執行者。
                     =================================================== -->
                <g id="boss-face-container">
                    <!-- 草圖固定識別：只保留額頭菱形，不加入鼻樑、臉頰刻線或眼球。 -->
                    <path id="boss-face-crest" d="M 0 -58 L -6 -49 L 0 -40 L 6 -49 Z" />

                    <!--
                        表情 1：開場／表情 7：離場共用。
                        眼睛依放大草圖改為左右各一個約 45° 的半月形兇眼；
                        嘴巴保留上揚嘴角、長直側壁與上下兩排完整五齒結構。
                    -->
                    <g class="boss-expression active" data-expression="arrival">
                        <path class="boss-sketch-eye" d="M -38 -32 C -30 -29 -18 -20 -7 -10 C -14 -5 -23 -3 -30 -8 C -36 -14 -39 -23 -38 -32 Z" />
                        <path class="boss-sketch-eye" d="M 38 -32 C 30 -29 18 -20 7 -10 C 14 -5 23 -3 30 -8 C 36 -14 39 -23 38 -32 Z" />

                        <path class="boss-sketch-mouth" d="M -34 10 C -31 4 -27 3 -23 9 C -10 18 10 18 23 8 C 27 3 31 4 34 10 C 30 10 28 13 27 18 L 24 44 C 11 50 -11 50 -24 44 L -27 18 C -28 13 -30 10 -34 10 Z" />

                        <!-- 上排：左彎獠牙、三顆尖刺牙、右彎獠牙。 -->
                        <g class="boss-sketch-teeth" style="fill:#020305; stroke:#fff; stroke-width:1.55; stroke-linecap:round; stroke-linejoin:round;">
                            <path d="M -25 16 C -25 23 -22 31 -15 34 C -17 27 -15 21 -10 18" />
                            <path d="M -11 18 L -7 28 L -2 18 L 0 29 L 5 18 L 9 28 L 12 18" fill="none" />
                            <path d="M 25 16 C 25 23 22 31 15 34 C 17 27 15 21 10 18" />
                        </g>

                        <!-- 下排：左彎獠牙、三顆尖刺牙、右彎獠牙。 -->
                        <g class="boss-sketch-teeth" style="fill:#020305; stroke:#fff; stroke-width:1.55; stroke-linecap:round; stroke-linejoin:round;">
                            <path d="M -24 44 C -24 37 -21 29 -15 26 C -17 33 -15 39 -10 42" />
                            <path d="M -11 42 L -7 34 L -2 42 L 0 33 L 5 42 L 9 34 L 12 42" fill="none" />
                            <path d="M 24 44 C 24 37 21 29 15 26 C 17 33 15 39 10 42" />
                        </g>
                    </g>

                    <!--
                        表情 2：雙葉片形眼睛。
                        嘴巴比第一張窄且短，嘴角仍上揚；獠牙與三顆尖刺牙同步縮小。
                    -->
                    <g class="boss-expression" data-expression="glare">
                        <path class="boss-sketch-eye" d="M -38 -20 C -31 -31 -18 -33 -6 -21 C -15 -8 -29 -7 -38 -20 Z" />
                        <path class="boss-sketch-eye" d="M 38 -20 C 31 -31 18 -33 6 -21 C 15 -8 29 -7 38 -20 Z" />

                        <path class="boss-sketch-mouth" d="M -29 14 C -26 8 -23 8 -19 13 C -9 20 9 20 19 12 C 23 8 26 8 29 14 C 26 14 24 17 23 21 L 20 39 C 10 44 -10 44 -20 39 L -23 21 C -24 17 -26 14 -29 14 Z" />

                        <g class="boss-sketch-teeth" style="fill:#020305; stroke:#fff; stroke-width:1.55; stroke-linecap:round; stroke-linejoin:round;">
                            <path d="M -22 17 C -22 23 -19 29 -14 32 C -15 26 -13 21 -9 19" />
                            <path d="M -9 19 L -6 26 L -2 19 L 0 27 L 4 19 L 7 26 L 9 19" fill="none" />
                            <path d="M 22 17 C 22 23 19 29 14 32 C 15 26 13 21 9 19" />
                        </g>

                        <g class="boss-sketch-teeth" style="fill:#020305; stroke:#fff; stroke-width:1.55; stroke-linecap:round; stroke-linejoin:round;">
                            <path d="M -20 39 C -20 34 -18 28 -13 26 C -14 31 -12 36 -8 38" />
                            <path d="M -9 38 L -6 32 L -2 38 L 0 31 L 4 38 L 7 32 L 9 38" fill="none" />
                            <path d="M 20 39 C 20 34 18 28 13 26 C 14 31 12 36 8 38" />
                        </g>
                    </g>

                    <!--
                        表情 3：雙葉片形眼睛維持平視。
                        嘴巴上、下緣改為互相對稱的淺半圓，不再出現兩側像熊耳朵的凸起。
                    -->
                    <g class="boss-expression" data-expression="snarl">
                        <path class="boss-sketch-eye" d="M -37 -19 C -29 -28 -17 -30 -6 -19 C -16 -9 -29 -8 -37 -19 Z" />
                        <path class="boss-sketch-eye" d="M 37 -19 C 29 -28 17 -30 6 -19 C 16 -9 29 -8 37 -19 Z" />

                        <path class="boss-sketch-mouth" d="M -30 15 C -20 9 20 9 30 15 C 27 25 25 37 23 48 C 12 54 -12 54 -23 48 C -25 37 -27 25 -30 15 Z" />

                        <g class="boss-sketch-teeth" style="fill:#020305; stroke:#fff; stroke-width:1.55; stroke-linecap:round; stroke-linejoin:round;">
                            <path d="M -24 14 C -24 22 -21 30 -15 35 C -17 27 -14 21 -9 17" />
                            <path d="M -10 17 L -7 29 L -2 17 L 0 30 L 5 17 L 8 29 L 10 17" fill="none" />
                            <path d="M 24 14 C 24 22 21 30 15 35 C 17 27 14 21 9 17" />
                        </g>

                        <g class="boss-sketch-teeth" style="fill:#020305; stroke:#fff; stroke-width:1.55; stroke-linecap:round; stroke-linejoin:round;">
                            <path d="M -22 48 C -22 40 -19 32 -14 28 C -16 36 -13 43 -9 47" />
                            <path d="M -10 47 L -7 36 L -2 47 L 0 35 L 5 47 L 8 36 L 10 47" fill="none" />
                            <path d="M 22 48 C 22 40 19 32 14 28 C 16 36 13 43 9 47" />
                        </g>
                    </g>

                    <!--
                        表情 4：45° 半月兇眼與最大張嘴狀態。
                        嘴框向上下與左右擴張；兩側彎獠牙最長，中央仍固定三顆尖刺牙。
                    -->
                    <g class="boss-expression" data-expression="inhale">
                        <path class="boss-sketch-eye" d="M -40 -34 C -31 -30 -18 -19 -6 -8 C -15 -3 -25 -2 -32 -9 C -38 -16 -41 -25 -40 -34 Z" />
                        <path class="boss-sketch-eye" d="M 40 -34 C 31 -30 18 -19 6 -8 C 15 -3 25 -2 32 -9 C 38 -16 41 -25 40 -34 Z" />

                        <path class="boss-sketch-mouth" d="M -38 10 C -34 3 -29 2 -24 9 C -11 19 11 19 24 8 C 29 2 34 3 38 10 C 34 11 32 15 31 20 L 26 45 C 18 56 -18 56 -26 45 L -31 20 C -32 15 -34 11 -38 10 Z" />

                        <g class="boss-sketch-teeth" style="fill:#020305; stroke:#fff; stroke-width:1.55; stroke-linecap:round; stroke-linejoin:round;">
                            <path d="M -29 15 C -29 24 -26 34 -18 39 C -20 30 -17 22 -11 18" />
                            <path d="M -12 18 L -8 30 L -2 18 L 0 31 L 6 18 L 10 30 L 12 18" fill="none" />
                            <path d="M 29 15 C 29 24 26 34 18 39 C 20 30 17 22 11 18" />
                        </g>

                        <g class="boss-sketch-teeth" style="fill:#020305; stroke:#fff; stroke-width:1.55; stroke-linecap:round; stroke-linejoin:round;">
                            <path d="M -25 45 C -25 36 -22 27 -16 23 C -18 32 -15 40 -10 44" />
                            <path d="M -12 44 L -8 36 L -2 44 L 0 35 L 6 44 L 10 36 L 12 44" fill="none" />
                            <path d="M 25 45 C 25 36 22 27 16 23 C 18 32 15 40 10 44" />
                        </g>
                    </g>

                    <!--
                        表情 5：45° 半月兇眼與收束吹氣嘴。
                        嘴巴急速縮小；嘴端只發射與全場暴風雪一致的密集斜向雪流。
                    -->
                    <g class="boss-expression" data-expression="blow">
                        <path class="boss-sketch-eye" d="M -37 -31 C -29 -27 -17 -18 -7 -9 C -15 -5 -23 -4 -30 -9 C -35 -15 -38 -23 -37 -31 Z" />
                        <path class="boss-sketch-eye" d="M 37 -31 C 29 -27 17 -18 7 -9 C 15 -5 23 -4 30 -9 C 35 -15 38 -23 37 -31 Z" />

                        <path class="boss-sketch-mouth" d="M -20 14 C -17 9 -14 9 -11 13 C -5 16 5 16 11 13 C 14 9 17 9 20 14 C 18 15 17 17 17 20 L 15 40 C 7 45 -7 45 -15 40 L -17 20 C -17 17 -18 15 -20 14 Z" />

                        <g class="boss-sketch-teeth" style="fill:#020305; stroke:#fff; stroke-width:1.55; stroke-linecap:round; stroke-linejoin:round;">
                            <path d="M -16 17 C -16 22 -14 28 -10 31 C -11 26 -9 21 -6 19" />
                            <path d="M -7 19 L -5 25 L -1 19 L 0 26 L 3 19 L 5 25 L 7 19" fill="none" />
                            <path d="M 16 17 C 16 22 14 28 10 31 C 11 26 9 21 6 19" />
                        </g>

                        <g class="boss-sketch-teeth" style="fill:#020305; stroke:#fff; stroke-width:1.55; stroke-linecap:round; stroke-linejoin:round;">
                            <path d="M -15 40 C -15 35 -13 29 -9 27 C -10 32 -8 37 -5 39" />
                            <path d="M -7 39 L -5 33 L -1 39 L 0 32 L 3 39 L 5 33 L 7 39" fill="none" />
                            <path d="M 15 40 C 15 35 13 29 9 27 C 10 32 8 37 5 39" />
                        </g>
                    </g>

                    <!--
                        表情 6：雙葉片形眼睛與寬弧形笑嘴。
                        上獠牙略高於微笑上緣；下獠牙收回嘴框內，不再穿出下緣。
                    -->
                    <g class="boss-expression" data-expression="smirk">
                        <path class="boss-sketch-eye" d="M -39 -20 C -31 -31 -17 -33 -5 -21 C -15 -8 -30 -7 -39 -20 Z" />
                        <path class="boss-sketch-eye" d="M 39 -20 C 31 -31 17 -33 5 -21 C 15 -8 30 -7 39 -20 Z" />

                        <path class="boss-sketch-mouth" d="M -35 14 C -31 8 -26 8 -21 13 C -9 22 9 22 21 13 C 26 8 31 8 35 14 C 32 27 25 38 15 44 C 7 49 -7 49 -15 44 C -25 38 -32 27 -35 14 Z" />

                        <g class="boss-sketch-teeth" style="fill:#020305; stroke:#fff; stroke-width:1.55; stroke-linecap:round; stroke-linejoin:round;">
                            <path d="M -29 12 C -29 21 -26 31 -18 36 C -20 27 -17 18 -11 15" fill="none" />
                            <path d="M -12 18 L -8 28 L -2 18 L 0 29 L 6 18 L 10 28 L 12 18" fill="none" />
                            <path d="M 29 12 C 29 21 26 31 18 36 C 20 27 17 18 11 15" fill="none" />
                        </g>

                        <g class="boss-sketch-teeth" style="fill:#020305; stroke:#fff; stroke-width:1.55; stroke-linecap:round; stroke-linejoin:round;">
                            <path d="M -22 40 C -22 35 -19 29 -15 27 C -16 32 -14 36 -10 38" />
                            <path d="M -11 40 L -7 34 L -2 40 L 0 33 L 5 40 L 9 34 L 11 40" fill="none" />
                            <path d="M 22 40 C 22 35 19 29 15 27 C 16 32 14 36 10 38" />
                        </g>
                    </g>

                    <!-- 表情 7：離場，路徑與表情 1 完全相同。 -->
                    <g class="boss-expression" data-expression="depart">
                        <path class="boss-sketch-eye" d="M -38 -32 C -30 -29 -18 -20 -7 -10 C -14 -5 -23 -3 -30 -8 C -36 -14 -39 -23 -38 -32 Z" />
                        <path class="boss-sketch-eye" d="M 38 -32 C 30 -29 18 -20 7 -10 C 14 -5 23 -3 30 -8 C 36 -14 39 -23 38 -32 Z" />

                        <path class="boss-sketch-mouth" d="M -34 10 C -31 4 -27 3 -23 9 C -10 18 10 18 23 8 C 27 3 31 4 34 10 C 30 10 28 13 27 18 L 24 44 C 11 50 -11 50 -24 44 L -27 18 C -28 13 -30 10 -34 10 Z" />

                        <g class="boss-sketch-teeth" style="fill:#020305; stroke:#fff; stroke-width:1.55; stroke-linecap:round; stroke-linejoin:round;">
                            <path d="M -25 16 C -25 23 -22 31 -15 34 C -17 27 -15 21 -10 18" />
                            <path d="M -11 18 L -7 28 L -2 18 L 0 29 L 5 18 L 9 28 L 12 18" fill="none" />
                            <path d="M 25 16 C 25 23 22 31 15 34 C 17 27 15 21 10 18" />
                        </g>

                        <g class="boss-sketch-teeth" style="fill:#020305; stroke:#fff; stroke-width:1.55; stroke-linecap:round; stroke-linejoin:round;">
                            <path d="M -24 44 C -24 37 -21 29 -15 26 C -17 33 -15 39 -10 42" />
                            <path d="M -11 42 L -7 34 L -2 42 L 0 33 L 5 42 L 9 34 L 12 42" fill="none" />
                            <path d="M 24 44 C 24 37 21 29 15 26 C 17 33 15 39 10 42" />
                        </g>
                    </g>

                    <!--
                        第五表情嘴端局部雪流：直接沿用全場暴風雪的視覺語彙。
                        雪粒、細小冰晶與短風雪拖尾都從嘴端密集生成，沿左下 45° 獨立飄散；
                        不使用寬幅液體狀氣流，因此不會再像吐口水。
                    -->
                    <g id="boss-blow-stream-cluster">
                        <circle class="boss-mouth-snow-flake" style="--mx:-72px; --my:48px; --mr:-25deg; --md:-0.05s; --mt:0.62s; --ms:0.62;" cx="-20" cy="22" r="1.6" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-94px; --my:61px; --mr:38deg; --md:-0.21s; --mt:0.74s; --ms:0.52;" cx="-22" cy="24" r="2.2" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-58px; --my:44px; --mr:-45deg; --md:-0.34s; --mt:0.58s; --ms:0.7;" cx="-18" cy="26" r="1.2" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-122px; --my:82px; --mr:75deg; --md:-0.48s; --mt:0.88s; --ms:0.42;" cx="-25" cy="26" r="2.6" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-88px; --my:72px; --mr:-80deg; --md:-0.12s; --mt:0.7s; --ms:0.55;" cx="-20" cy="29" r="1.9" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-137px; --my:94px; --mr:120deg; --md:-0.61s; --mt:0.96s; --ms:0.46;" cx="-28" cy="29" r="1.35" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-104px; --my:78px; --mr:-110deg; --md:-0.29s; --mt:0.8s; --ms:0.48;" cx="-17" cy="31" r="2.45" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-64px; --my:55px; --mr:55deg; --md:-0.42s; --mt:0.63s; --ms:0.72;" cx="-23" cy="33" r="1.1" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-151px; --my:106px; --mr:-150deg; --md:-0.16s; --mt:1.0s; --ms:0.38;" cx="-30" cy="34" r="2.0" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-92px; --my:81px; --mr:95deg; --md:-0.54s; --mt:0.76s; --ms:0.58;" cx="-19" cy="36" r="1.55" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-128px; --my:101px; --mr:-65deg; --md:-0.37s; --mt:0.91s; --ms:0.44;" cx="-25" cy="38" r="2.35" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-48px; --my:38px; --mr:45deg; --md:-0.26s; --mt:0.54s; --ms:0.75;" cx="-16" cy="23" r="1.0" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-111px; --my:63px; --mr:-135deg; --md:-0.67s; --mt:0.83s; --ms:0.5;" cx="-27" cy="22" r="1.75" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-76px; --my:58px; --mr:85deg; --md:-0.45s; --mt:0.66s; --ms:0.62;" cx="-21" cy="27" r="1.35" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-159px; --my:91px; --mr:-175deg; --md:-0.73s; --mt:1.04s; --ms:0.36;" cx="-31" cy="27" r="2.15" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-69px; --my:65px; --mr:125deg; --md:-0.18s; --mt:0.65s; --ms:0.68;" cx="-17" cy="34" r="1.25" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-145px; --my:112px; --mr:-95deg; --md:-0.58s; --mt:0.99s; --ms:0.4;" cx="-29" cy="39" r="1.8" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-82px; --my:43px; --mr:65deg; --md:-0.39s; --mt:0.61s; --ms:0.72;" cx="-23" cy="21" r="1.05" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-117px; --my:89px; --mr:155deg; --md:-0.09s; --mt:0.86s; --ms:0.45;" cx="-26" cy="31" r="2.55" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-96px; --my:97px; --mr:-120deg; --md:-0.31s; --mt:0.79s; --ms:0.54;" cx="-20" cy="39" r="1.45" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-169px; --my:118px; --mr:180deg; --md:-0.51s; --mt:1.08s; --ms:0.34;" cx="-33" cy="32" r="1.2" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-84px; --my:67px; --mr:-70deg; --md:-0.64s; --mt:0.72s; --ms:0.56;" cx="-18" cy="28" r="2.0" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-109px; --my:96px; --mr:115deg; --md:-0.24s; --mt:0.84s; --ms:0.48;" cx="-24" cy="35" r="1.15" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-61px; --my:51px; --mr:-35deg; --md:-0.47s; --mt:0.59s; --ms:0.68;" cx="-15" cy="30" r="1.65" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-132px; --my:73px; --mr:145deg; --md:-0.33s; --mt:0.9s; --ms:0.43;" cx="-28" cy="24" r="1.4" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-101px; --my:86px; --mr:-165deg; --md:-0.56s; --mt:0.82s; --ms:0.49;" cx="-21" cy="32" r="2.25" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-157px; --my:124px; --mr:80deg; --md:-0.2s; --mt:1.06s; --ms:0.35;" cx="-32" cy="37" r="1.6" />
                        <circle class="boss-mouth-snow-flake" style="--mx:-70px; --my:47px; --mr:-55deg; --md:-0.69s; --mt:0.64s; --ms:0.66;" cx="-19" cy="25" r="1.3" />
                        <polygon class="boss-mouth-snow-crystal" style="--mx:-98px; --my:58px; --mr:-190deg; --md:-0.14s; --mt:0.74s; --ms:0.58;" points="-25,18.8 -21.8,22 -25,25.2 -28.2,22" />
                        <polygon class="boss-mouth-snow-crystal" style="--mx:-146px; --my:83px; --mr:220deg; --md:-0.43s; --mt:0.96s; --ms:0.42;" points="-31,22.4 -28.4,25 -31,27.6 -33.6,25" />
                        <polygon class="boss-mouth-snow-crystal" style="--mx:-118px; --my:92px; --mr:-250deg; --md:-0.31s; --mt:0.88s; --ms:0.5;" points="-22,26.4 -18.4,30 -22,33.6 -25.6,30" />
                        <polygon class="boss-mouth-snow-crystal" style="--mx:-158px; --my:116px; --mr:185deg; --md:-0.67s; --mt:1.05s; --ms:0.36;" points="-29,31.1 -26.1,34 -29,36.9 -31.9,34" />
                        <polygon class="boss-mouth-snow-crystal" style="--mx:-82px; --my:74px; --mr:-155deg; --md:-0.22s; --mt:0.7s; --ms:0.61;" points="-18,32.6 -15.6,35 -18,37.4 -20.4,35" />
                        <polygon class="boss-mouth-snow-crystal" style="--mx:-133px; --my:111px; --mr:270deg; --md:-0.52s; --mt:0.94s; --ms:0.43;" points="-27,36.0 -24.0,39 -27,42.0 -30.0,39" />
                        <polygon class="boss-mouth-snow-crystal" style="--mx:-66px; --my:45px; --mr:-120deg; --md:-0.36s; --mt:0.62s; --ms:0.7;" points="-20,21.9 -17.9,24 -20,26.1 -22.1,24" />
                        <polygon class="boss-mouth-snow-crystal" style="--mx:-174px; --my:102px; --mr:235deg; --md:-0.79s; --mt:1.1s; --ms:0.32;" points="-34,27.5 -31.5,30 -34,32.5 -36.5,30" />
                        <path class="boss-mouth-snow-streak" style="--mx:-92px; --my:55px; --md:-0.12s; --mt:0.58s;" d="M -18 22 L -38 33" />
                        <path class="boss-mouth-snow-streak" style="--mx:-114px; --my:70px; --md:-0.31s; --mt:0.68s;" d="M -20 25 L -43 38" />
                        <path class="boss-mouth-snow-streak" style="--mx:-82px; --my:62px; --md:-0.47s; --mt:0.54s;" d="M -19 28 L -39 40" />
                        <path class="boss-mouth-snow-streak" style="--mx:-137px; --my:88px; --md:-0.22s; --mt:0.76s;" d="M -23 30 L -50 46" />
                        <path class="boss-mouth-snow-streak" style="--mx:-101px; --my:82px; --md:-0.56s; --mt:0.64s;" d="M -21 34 L -44 49" />
                        <path class="boss-mouth-snow-streak" style="--mx:-153px; --my:107px; --md:-0.39s; --mt:0.82s;" d="M -26 36 L -55 55" />
                        <path class="boss-mouth-snow-streak" style="--mx:-73px; --my:66px; --md:-0.65s; --mt:0.52s;" d="M -17 31 L -34 42" />
                        <path class="boss-mouth-snow-streak" style="--mx:-166px; --my:94px; --md:-0.74s; --mt:0.88s;" d="M -28 27 L -60 45" />
                        <path class="boss-mouth-snow-streak" style="--mx:-126px; --my:110px; --md:-0.18s; --mt:0.72s;" d="M -24 39 L -48 56" />
                        <path class="boss-mouth-snow-streak" style="--mx:-61px; --my:48px; --md:-0.42s; --mt:0.5s;" d="M -16 25 L -31 34" />
                    </g>
                </g>
            </svg>
        `;
    }

    scene3.innerHTML = `
        <style>
            /* =========================================
               🌟 第一隻小怪專屬死亡剝落動畫
               ========================================= */
            @keyframes antennaFlyAway {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(-40px) rotate(25deg); opacity: 0; }
            }
            @keyframes legDropAway {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(40px) rotate(-25deg); opacity: 0; }
            }
            
            .anim-antenna-fly { animation: antennaFlyAway 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; transform-origin: 65px 30px; }
            .anim-leg-drop { animation: legDropAway 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; transform-origin: 65px 90px; }
            .freeze-anim, .freeze-anim * {
                animation-play-state: paused !important;
                transition: none !important;
            }

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

            /* 🌟 使用 CSS 變數控制死亡傾倒的方向 */
            @keyframes playerDie { 
                0% { transform: translate(-50%, -50%) rotate(0deg); } 
                100% { transform: translate(-50%, -50%) rotate(var(--die-rot, -90deg)) translate(var(--die-tx, -30px), -20px); } 
            }
            .player-dead { animation: playerDie 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important; pointer-events: none; }

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

            .attacking {
                animation: triAttackMotion 0.8s ease-in-out forwards !important;
            }
            @keyframes triAttackMotion {
                0%   { transform: translate(-50%, -50%) scaleX(var(--facing, 1)) rotate(0deg); }
                30%  { transform: translate(calc(-50% + (var(--facing, 1) * 15px)), calc(-50% - 30px)) scaleX(var(--facing, 1)) rotate(25deg); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
                45%  { transform: translate(calc(-50% - (var(--facing, 1) * 60px)), -50%) scaleX(var(--facing, 1)) rotate(-30deg); animation-timing-function: linear; }
                65%  { transform: translate(calc(-50% - (var(--facing, 1) * 60px)), -50%) scaleX(var(--facing, 1)) rotate(-30deg); animation-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1); }
                100% { transform: translate(-50%, -50%) scaleX(var(--facing, 1)) rotate(0deg); } 
            }

            .attacking .tri-eye-open, .attacking .tri-eye-closed { opacity: 0 !important; animation: none !important; }
            .attacking .tri-leg-smooth { animation: none !important; d: path('M 65 90 L 65 105 Q 65 112 73 112'); }

            .tri-eye-attack-prep, .tri-eye-attack-dash { opacity: 0; }
            
            .attacking .tri-eye-attack-prep { animation: showAttackPrep 0.8s forwards; }
            @keyframes showAttackPrep { 0%, 40% { opacity: 1; } 41%, 100% { opacity: 0; } }
            
            .attacking .tri-eye-attack-dash { animation: showAttackDash 0.8s forwards; }
            @keyframes showAttackDash { 0%, 40% { opacity: 0; } 41%, 100% { opacity: 1; } }

            @keyframes dizzySpinAnim { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .dizzy-spin { animation: dizzySpinAnim 0.3s linear infinite; }

            /* =========================================
               🌟 大三角怪專屬：無縫分裂變形動畫
               ========================================= */
            .split-anim-container {
                position: absolute; z-index: 4; transform: translate(-50%, -50%);
                width: 120px; height: 120px; pointer-events: none;
            }
            .split-half-left, .split-half-right {
                position: absolute; width: 100%; height: 100%; left: 0; top: 0;
                filter: drop-shadow(0 0 4px rgba(255,255,255,0.2)); stroke-linejoin: round; stroke-linecap: round; fill: #000; stroke: #fff; stroke-width: 5px;
            }

            .split-half-left { animation: splitTumbleLeft 1.4s ease-out forwards; transform-origin: 50% 75%; }
            @keyframes splitTumbleLeft {
                0% { transform: scale(1.66) rotate(0deg) translate(0px, 0px); } 
                50% { transform: scale(1.3) rotate(-180deg) translate(-20px, -25px); animation-timing-function: cubic-bezier(0.3, 0, 0.8, 1); } 
                100% { transform: scale(1.0) rotate(-360deg) translate(-35px, 0px); } 
            }

            .split-half-right { animation: splitTumbleRight 1.4s ease-out forwards; transform-origin: 50% 75%; }
            @keyframes splitTumbleRight {
                0% { transform: scale(1.66) rotate(0deg) translate(0px, 0px); }
                50% { transform: scale(1.3) rotate(180deg) translate(20px, -25px); animation-timing-function: cubic-bezier(0.3, 0, 0.8, 1); }
                100% { transform: scale(1.0) rotate(360deg) translate(35px, 0px); }
            }

            .split-body-l { animation: splitMorphLeft 1.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            @keyframes splitMorphLeft {
                0%, 15% { d: path('M 65 30 L 65 90 L 5 90 Z'); } 
                30% { d: path('M 65 30 L 85 90 L 5 90 Z'); } 
                60%, 100% { d: path('M 65 30 L 125 90 L 5 90 Z'); }
            }
            .split-leg-l { animation: splitLegLeft 1.4s forwards; }
            @keyframes splitLegLeft {
                0%, 15% { d: path('M 65 90 L 65 105 Q 65 112 55 112'); }
                100% { d: path('M 65 90 L 65 105 Q 65 112 73 112'); }
            }

            .split-body-r { animation: splitMorphRight 1.4s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            @keyframes splitMorphRight {
                0%, 15% { d: path('M 65 30 L 125 90 L 65 90 Z'); } 
                30% { d: path('M 65 30 L 125 90 L 45 90 Z'); }
                60%, 100% { d: path('M 65 30 L 125 90 L 5 90 Z'); }
            }
            .split-leg-r { animation: splitLegRight 1.4s forwards; }
            @keyframes splitLegRight {
                0%, 15% { d: path('M 65 90 L 65 105 Q 65 112 75 112'); }
                100% { d: path('M 65 90 L 65 105 Q 65 112 73 112'); }
            }

            .split-eye-new-l { animation: splitEyeAppearL 1.4s forwards; }
            @keyframes splitEyeAppearL {
                0%, 20% { opacity: 0; transform: translate(15px, 0); } 
                40%, 100% { opacity: 1; transform: translate(0, 0); } 
            }
            .split-eye-l { animation: splitEyeMoveL 1.4s forwards; }
            @keyframes splitEyeMoveL {
                0%, 10% { transform: translate(0, 0); }
                100% { transform: translate(19px, 0); } 
            }

            .split-eye-new-r { animation: splitEyeAppearR 1.4s forwards; }
            @keyframes splitEyeAppearR {
                0%, 20% { opacity: 0; transform: translate(-15px, 0); }
                40%, 100% { opacity: 1; transform: translate(0, 0); }
            }
            .split-eye-r { animation: splitEyeMoveR 1.4s forwards; }
            @keyframes splitEyeMoveR {
                0%, 10% { transform: translate(0, 0); }
                100% { transform: translate(-19px, 0); } 
            }

            @keyframes shrinkEyeLg { 0%, 20% { r: 4px; } 100% { r: 3.5px; } }
            .split-eye-l circle, .split-eye-r circle { animation: shrinkEyeLg 1.4s forwards; }

            /* =========================================
               🌟 中三角怪專屬：無縫分裂變形動畫
               ========================================= */
            .split-anim-container-sm {
                position: absolute; z-index: 4; transform: translate(-50%, -50%);
                width: 70px; height: 70px; pointer-events: none; /* 對齊 70px 小怪 */
            }
            .split-half-left-sm, .split-half-right-sm {
                position: absolute; width: 100%; height: 100%; left: 0; top: 0;
                filter: drop-shadow(0 0 4px rgba(255,255,255,0.2)); stroke-linejoin: round; stroke-linecap: round; fill: #000; stroke: #fff; stroke-width: 6px; /* 對齊 6px 邊框 */
            }
            .split-half-left-sm { animation: splitTumbleLeftSm 1.4s ease-out forwards; transform-origin: 50% 75%; }
            @keyframes splitTumbleLeftSm {
                0% { transform: scale(2.0) rotate(0deg) translate(0px, 0px); } 
                50% { transform: scale(1.5) rotate(-180deg) translate(-10px, -15px); animation-timing-function: cubic-bezier(0.3, 0, 0.8, 1); } 
                100% { transform: scale(1.0) rotate(-360deg) translate(-20px, 0px); } 
            }
            .split-half-right-sm { animation: splitTumbleRightSm 1.4s ease-out forwards; transform-origin: 50% 75%; }
            @keyframes splitTumbleRightSm {
                0% { transform: scale(2.0) rotate(0deg) translate(0px, 0px); }
                50% { transform: scale(1.5) rotate(180deg) translate(10px, -15px); animation-timing-function: cubic-bezier(0.3, 0, 0.8, 1); }
                100% { transform: scale(1.0) rotate(360deg) translate(20px, 0px); }
            }
            
            .split-eye-l-sm { animation: splitEyeMoveLSm 1.4s forwards; }
            @keyframes splitEyeMoveLSm { 0%, 10% { transform: translate(0, 0); } 100% { transform: translate(2px, 0); } } /* 縮短眼球位移 */
            .split-eye-r-sm { animation: splitEyeMoveRSm 1.4s forwards; }
            @keyframes splitEyeMoveRSm { 0%, 10% { transform: translate(0, 0); } 100% { transform: translate(-2px, 0); } } /* 縮短眼球位移 */
            
            @keyframes shrinkEyeSm { 0%, 20% { r: 3.5px; } 100% { r: 3px; } }
            .split-eye-l-sm circle, .split-eye-r-sm circle { animation: shrinkEyeSm 1.4s forwards; }

            /* 🌟 背包 Icon 生成與閃爍動畫 */
            @keyframes iconPopIn { 
                0% { transform: scale(0) rotate(-20deg); opacity: 0; box-shadow: 0 0 0 transparent; } 
                50% { transform: scale(1.3) rotate(10deg); opacity: 1; box-shadow: 0 0 25px var(--brand-blue); } 
                100% { transform: scale(1) rotate(0deg); opacity: 1; box-shadow: 0 0 0 transparent; } 
            }
            @keyframes btnPulseShake {
                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 242, 254, 0.8); }
                15% { transform: scale(1.15) rotate(-5deg); box-shadow: 0 0 20px 10px rgba(0, 242, 254, 0); }
                30% { transform: scale(1.1) rotate(5deg); }
                45% { transform: scale(1.15) rotate(-5deg); }
                60% { transform: scale(1.1) rotate(5deg); }
                75% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 242, 254, 0); }
                100% { transform: scale(1); }
            }

            /* 🌟 掉落物專屬彈跳動畫 */
            @keyframes lootDropPop {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                50% { transform: translate(-50%, -80%) scale(1.2); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)); }
            }
            .loot-drop-item {
                position: absolute;
                z-index: 3;
                width: 50px;
                height: 50px;
                animation: lootDropPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            
            /* 🌟 PLA 電路圖向量樣式 */
            .pla-circuit {
                position: absolute;
                top: 50%;
                left: 115%; /* 放置於所有三角怪右側 */
                transform: translate(0, -50%);
                z-index: 3;
                filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4));
                overflow: visible;
            }
            .pla-text {
                font-family: 'Orbitron', sans-serif;
                fill: #fff;
                font-size: 20px;
                font-weight: bold;
                letter-spacing: 2px;
            }
            /* =========================================
               🌟 輕量化純白光學迷彩能量玻璃牆
               ========================================= */
            #pla-glass-barrier {
                position: absolute;
                top: -20%;
                left: 104%; 
                width: 150%; 
                height: 140%;
                /* 改為純白色漸層 */
                background: linear-gradient(90deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.03) 15%, transparent 100%);
                border-left: 2px solid rgba(255, 255, 255, 0.3);
                box-shadow: 
                    -8px 0 25px rgba(255, 255, 255, 0.3), 
                    inset 15px 0 40px rgba(255, 255, 255, 0.2);
                
                /* 效能優化：稍微降低 blur 半徑，並強制開啟 GPU 渲染 */
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                will-change: opacity;
                transform: translateZ(0); 
                
                z-index: 6; 
                opacity: 0; 
                pointer-events: none;
                transition: opacity 0.1s linear; 
                overflow: hidden;
            }
            
            /* 科技 3D 網格背景紋理 (純白) */
            #pla-glass-barrier::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background-image: 
                    linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
                background-size: 40px 40px;
                opacity: 0.5;
                transform: perspective(600px) rotateY(-15deg);
                transform-origin: left center;
                pointer-events: none;
            }


            /* ===================================================
               🌟 還原最初版本：大片柔霧風流由左上吹向右下
               - 不是單一亮線
               - 使用寬幅霧面主體、柔和尾流與淡薄氣流層
               =================================================== */
            .pla-glass-wind {
                position: absolute;
                top: -92%;
                left: -105%;
                width: 92%;
                height: 175%;
                opacity: 0;
                pointer-events: none;
                mix-blend-mode: screen;
                filter: blur(14px);
                transform: translate3d(0, 0, 0) rotate(-13deg);
                transform-origin: center;
                will-change: transform, opacity;
                background:
                    radial-gradient(ellipse at 48% 46%,
                        rgba(255,255,255,0.26) 0%,
                        rgba(255,255,255,0.16) 24%,
                        rgba(255,255,255,0.075) 47%,
                        rgba(255,255,255,0.022) 66%,
                        transparent 82%),
                    linear-gradient(135deg,
                        transparent 0%,
                        rgba(255,255,255,0.025) 12%,
                        rgba(255,255,255,0.11) 34%,
                        rgba(255,255,255,0.22) 50%,
                        rgba(255,255,255,0.075) 69%,
                        transparent 90%);
                animation: plaGlassOriginalWind 5.2s cubic-bezier(0.42, 0, 0.2, 1) infinite;
            }

            /* 寬大的柔和尾流，不形成銳利線條 */
            .pla-glass-wind::before {
                content: '';
                position: absolute;
                top: 15%;
                left: -34%;
                width: 155%;
                height: 72%;
                border-radius: 50%;
                background: radial-gradient(ellipse at center,
                    rgba(255,255,255,0.11) 0%,
                    rgba(255,255,255,0.055) 37%,
                    rgba(255,255,255,0.015) 61%,
                    transparent 80%);
                filter: blur(24px);
                opacity: 0.9;
            }

            /* 細薄但仍是面狀的第二層氣流，增加風吹過的深度 */
            .pla-glass-wind::after {
                content: '';
                position: absolute;
                top: 42%;
                left: -18%;
                width: 132%;
                height: 31%;
                border-radius: 50%;
                background: linear-gradient(135deg,
                    transparent 0%,
                    rgba(255,255,255,0.035) 18%,
                    rgba(255,255,255,0.13) 48%,
                    rgba(255,255,255,0.035) 76%,
                    transparent 100%);
                filter: blur(18px);
                opacity: 0.8;
            }

            @keyframes plaGlassOriginalWind {
                0% {
                    opacity: 0;
                    transform: translate3d(-8%, -7%, 0) rotate(-13deg) scale(0.92);
                }
                12% {
                    opacity: 0.15;
                }
                28% {
                    opacity: 0.72;
                }
                55% {
                    opacity: 0.9;
                }
                78% {
                    opacity: 0.52;
                }
                100% {
                    opacity: 0;
                    transform: translate3d(285%, 175%, 0) rotate(-13deg) scale(1.08);
                }
            }
            /* ===================================================
               🌨️ Scene 3 六枝邏輯 BOSS：Timeline、雪粒子與吹氣效果
               =================================================== */
            #scene3-boss-layer {
                position: absolute;
                inset: 0;
                z-index: 12;
                overflow: hidden;
                pointer-events: none;
            }

            #scene3-boss {
                position: absolute;
                left: 68%;
                top: 38%;
                width: clamp(270px, min(40vw, 58vh), 390px);
                aspect-ratio: 1;
                transform: translate(-50%, -50%);
                opacity: 0;
                visibility: hidden;
                will-change: opacity;
                isolation: isolate;
            }

            #scene3-boss.visible {
                opacity: 1;
                visibility: visible;
            }

            #boss-flight-shell,
            #boss-hover-shell {
                position: absolute;
                inset: 0;
                transform-origin: 50% 50%;
                will-change: transform, opacity;
                backface-visibility: hidden;
                transform-style: preserve-3d;
            }

            /*
               自然冰霜光暈：只使用完全柔化的橢圓漸層，不使用矩形背景、邊框或硬裁切。
               這能消除 BOSS 四周像被一個方框包住的合成邊緣。
            */
            #boss-aura {
                position: absolute;
                inset: -34%;
                z-index: -1;
                border-radius: 50%;
                pointer-events: none;
                opacity: 0;
                transform: scale(0.78) translateZ(0);
                background:
                    radial-gradient(ellipse at 50% 50%,
                        rgba(209, 255, 255, 0.30) 0%,
                        rgba(119, 241, 255, 0.17) 24%,
                        rgba(45, 191, 217, 0.075) 46%,
                        rgba(15, 91, 116, 0.025) 62%,
                        transparent 76%);
                filter: blur(20px);
                mix-blend-mode: screen;
                transition: opacity 0.45s ease, transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
                will-change: opacity, transform;
            }

            #scene3-boss.visible #boss-aura {
                opacity: 0.88;
                transform: scale(1) translateZ(0);
                animation: bossAuraBreathe 3.6s ease-in-out infinite;
            }

            #scene3-boss.inhaling #boss-aura {
                opacity: 1;
                transform: scale(1.12) translateZ(0);
            }

            #scene3-boss.blowing #boss-aura {
                opacity: 0.72;
                transform: scale(1.2, 0.92) translate(-3%, 4%) translateZ(0);
            }

            @keyframes bossAuraBreathe {
                0%, 100% { opacity: 0.72; transform: scale(0.96) translateZ(0); }
                50% { opacity: 0.95; transform: scale(1.055) translateZ(0); }
            }

            #scene3-boss.hovering #boss-hover-shell {
                animation: bossNaturalHover 2.35s ease-in-out infinite;
            }

            #scene3-boss.inhaling #boss-hover-shell {
                animation: bossDeepInhale 1.2s cubic-bezier(0.2, 0.75, 0.2, 1) forwards;
            }

            #scene3-boss.blowing #boss-hover-shell {
                animation: bossBlowRecoil 0.16s ease-in-out infinite alternate;
            }

            @keyframes bossNaturalHover {
                0%   { transform: translate3d(0, 0, 0) rotate(-0.8deg); }
                24%  { transform: translate3d(-4px, -7px, 0) rotate(0.9deg); }
                51%  { transform: translate3d(3px, -11px, 0) rotate(-0.4deg); }
                76%  { transform: translate3d(6px, -4px, 0) rotate(0.7deg); }
                100% { transform: translate3d(0, 0, 0) rotate(-0.8deg); }
            }

            @keyframes bossDeepInhale {
                0%   { transform: translate3d(0, 0, 0) scale(1); }
                35%  { transform: translate3d(0, -8px, 0) scale(0.95, 1.05); }
                72%  { transform: translate3d(0, -13px, 0) scale(1.08, 0.94); }
                100% { transform: translate3d(0, -9px, 0) scale(1.12, 0.92); }
            }

            @keyframes bossBlowRecoil {
                0%   { transform: translate3d(3px, -7px, 0) scale(1.07, 0.95) rotate(-1.2deg); }
                100% { transform: translate3d(-7px, -2px, 0) scale(1.02, 0.98) rotate(1.4deg); }
            }

            #scene3-boss-svg {
                position: absolute;
                inset: -10%;
                width: 120%;
                height: 120%;
                overflow: visible;
                filter: none;
            }

            /* 光只跟著實際 SVG 線條，不再對整個 SVG 合成層套濾鏡。 */
            #boss-branches,
            #boss-core-outer,
            #boss-core-inner {
                filter:
                    drop-shadow(0 0 3px rgba(255,255,255,0.72))
                    drop-shadow(0 0 9px rgba(90,228,245,0.40));
            }

            .boss-line {
                fill: #000;
                stroke: #fff;
                stroke-linecap: round;
                stroke-linejoin: round;
                vector-effect: non-scaling-stroke;
            }

            #boss-branches {
                transform-box: view-box;
                transform-origin: center;
                transition: filter 0.25s ease;
            }

            #scene3-boss.blowing #boss-branches {
                animation: bossBranchRattle 0.1s steps(2) infinite;
                filter: drop-shadow(0 0 12px rgba(255,255,255,0.9));
            }

            @keyframes bossBranchRattle {
                0%   { transform: rotate(-0.7deg) scale(1.01); }
                100% { transform: rotate(0.8deg) scale(0.995); }
            }

            #boss-core-outer {
                fill: #0a0a0f;
                stroke: #fff;
                stroke-width: 5;
            }

            #boss-core-inner {
                fill: #000;
                stroke: #fff;
                stroke-width: 4;
            }

            #boss-core-highlight {
                fill: none;
                stroke: rgba(255,255,255,0.2);
                stroke-width: 2;
                stroke-dasharray: 7 10;
                animation: bossCoreScan 3.2s linear infinite;
            }

            @keyframes bossCoreScan {
                to { stroke-dashoffset: -68; }
            }

            /* ===================================================
               草圖精準表情系統
               - 六張唯一表情依序對應 arrival / glare / snarl / inhale / blow / smirk
               - depart 完整重複 arrival
               - 所有眼睛只有外框，沒有眼球、瞳孔或多餘臉部刻線
               =================================================== */
            .boss-expression {
                opacity: 0;
                transform: translateY(1.5px) scale(0.968);
                transform-box: view-box;
                transform-origin: center;
                transition:
                    opacity 0.32s ease,
                    transform 0.4s cubic-bezier(0.18, 0.88, 0.26, 1.12);
                pointer-events: none;
            }

            .boss-expression.active {
                opacity: 1;
                transform: translateY(0) scale(1);
            }

            #boss-face-crest {
                fill: #000;
                stroke: #fff;
                stroke-width: 2.5;
                stroke-linejoin: round;
                filter: drop-shadow(0 0 3px rgba(184, 248, 255, 0.58));
            }

            .boss-sketch-eye {
                fill: #000;
                stroke: #fff;
                stroke-width: 2.7;
                stroke-linecap: round;
                stroke-linejoin: round;
                filter: drop-shadow(0 0 2.5px rgba(174, 245, 255, 0.6));
                transform-box: fill-box;
                transform-origin: center;
            }

            .boss-sketch-mouth {
                fill: #020305;
                stroke: #fff;
                stroke-width: 2.8;
                stroke-linecap: round;
                stroke-linejoin: round;
                filter: drop-shadow(0 0 2.5px rgba(174, 245, 255, 0.5));
                transform-box: fill-box;
                transform-origin: center;
            }

            .boss-sketch-teeth {
                fill: #fff;
                stroke: #fff;
                stroke-width: 0.45;
                stroke-linejoin: round;
                transform-box: fill-box;
                transform-origin: center;
            }

            .boss-expression.active .boss-sketch-eye {
                animation: bossSketchEyeSet 0.38s cubic-bezier(0.16, 0.9, 0.22, 1.15) both;
            }

            .boss-expression.active .boss-sketch-mouth,
            .boss-expression.active .boss-sketch-teeth {
                animation: bossSketchMouthSet 0.42s cubic-bezier(0.18, 0.84, 0.24, 1.12) both;
            }

            @keyframes bossSketchEyeSet {
                0% { opacity: 0.16; transform: scaleY(0.34) scaleX(0.93); }
                70% { opacity: 1; transform: scaleY(1.06) scaleX(1.015); }
                100% { opacity: 1; transform: scale(1); }
            }

            @keyframes bossSketchMouthSet {
                0% { opacity: 0.12; transform: translateY(-2px) scale(0.82, 0.76); }
                70% { opacity: 1; transform: translateY(1px) scale(1.035, 1.055); }
                100% { opacity: 1; transform: translateY(0) scale(1); }
            }

            /* 第 3 → 4 → 5 → 6 張構成同一段吹氣動畫，使用不同開合節奏連續銜接。 */
            .boss-expression[data-expression="snarl"].active .boss-sketch-mouth,
            .boss-expression[data-expression="snarl"].active .boss-sketch-teeth {
                animation-name: bossSketchBlowOpenStage1;
                animation-duration: 0.48s;
            }

            .boss-expression[data-expression="inhale"].active .boss-sketch-mouth,
            .boss-expression[data-expression="inhale"].active .boss-sketch-teeth {
                animation-name: bossSketchBlowOpenStage2;
                animation-duration: 0.52s;
            }

            .boss-expression[data-expression="blow"].active .boss-sketch-mouth,
            .boss-expression[data-expression="blow"].active .boss-sketch-teeth {
                animation-name: bossSketchBlowCompress;
                animation-duration: 0.4s;
            }

            .boss-expression[data-expression="smirk"].active .boss-sketch-mouth,
            .boss-expression[data-expression="smirk"].active .boss-sketch-teeth {
                animation-name: bossSketchBlowRelease;
                animation-duration: 0.46s;
            }

            @keyframes bossSketchBlowOpenStage1 {
                0% { opacity: 0.18; transform: scale(0.82, 0.55) translateY(-3px); }
                72% { opacity: 1; transform: scale(1.02, 1.08) translateY(1px); }
                100% { opacity: 1; transform: scale(1); }
            }

            @keyframes bossSketchBlowOpenStage2 {
                0% { opacity: 0.22; transform: scale(0.9, 0.72) translateY(-2px); }
                68% { opacity: 1; transform: scale(1.035, 1.1) translateY(1px); }
                100% { opacity: 1; transform: scale(1); }
            }

            @keyframes bossSketchBlowCompress {
                0% { opacity: 0.2; transform: scale(1.22, 1.14); }
                76% { opacity: 1; transform: scale(0.94, 1.04); }
                100% { opacity: 1; transform: scale(1); }
            }

            @keyframes bossSketchBlowRelease {
                0% { opacity: 0.18; transform: scale(0.65, 0.72) translateY(-1px); }
                70% { opacity: 1; transform: scale(1.06, 1.02) translateY(1px); }
                100% { opacity: 1; transform: scale(1); }
            }

            /* 第五表情嘴端密集雪流：局部效果與全場暴風雪同方向、同材質。 */
            #boss-blow-stream-cluster {
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.1s linear;
                mix-blend-mode: screen;
            }

            #scene3-boss.blowing #boss-blow-stream-cluster {
                opacity: 1;
            }

            .boss-mouth-snow-flake,
            .boss-mouth-snow-crystal,
            .boss-mouth-snow-streak {
                opacity: 0;
                transform-box: fill-box;
                transform-origin: center;
                will-change: transform, opacity;
            }

            .boss-mouth-snow-flake {
                fill: rgba(255, 255, 255, 0.98);
                filter:
                    drop-shadow(0 0 2px rgba(255,255,255,0.98))
                    drop-shadow(0 0 6px rgba(121, 236, 255, 0.92));
            }

            .boss-mouth-snow-crystal {
                fill: rgba(208, 248, 255, 0.34);
                stroke: rgba(255,255,255,0.98);
                stroke-width: 1.05;
                stroke-linejoin: round;
                filter:
                    drop-shadow(0 0 2px rgba(255,255,255,0.96))
                    drop-shadow(0 0 6px rgba(108, 230, 255, 0.88));
            }

            .boss-mouth-snow-streak {
                fill: none;
                stroke: rgba(245, 254, 255, 0.88);
                stroke-width: 1.15;
                stroke-linecap: round;
                stroke-dasharray: 5 7;
                filter: drop-shadow(0 0 3px rgba(145, 238, 255, 0.86));
            }

            #scene3-boss.blowing .boss-mouth-snow-flake,
            #scene3-boss.blowing .boss-mouth-snow-crystal {
                animation: bossMouthSnowDrift var(--mt) linear infinite;
                animation-delay: var(--md);
            }

            #scene3-boss.blowing .boss-mouth-snow-streak {
                animation: bossMouthSnowStreak var(--mt) linear infinite;
                animation-delay: var(--md);
            }

            @keyframes bossMouthSnowDrift {
                0% {
                    opacity: 0;
                    transform: translate(0, 0) rotate(0deg) scale(0.24);
                }
                10% { opacity: 1; }
                46% { opacity: 0.92; }
                100% {
                    opacity: 0;
                    transform: translate(var(--mx), var(--my)) rotate(var(--mr)) scale(var(--ms));
                }
            }

            @keyframes bossMouthSnowStreak {
                0% {
                    opacity: 0;
                    stroke-dashoffset: 18;
                    transform: translate(0, 0) scaleX(0.58);
                }
                12% { opacity: 0.95; }
                55% { opacity: 0.66; }
                100% {
                    opacity: 0;
                    stroke-dashoffset: -26;
                    transform: translate(var(--mx), var(--my)) scaleX(1.08);
                }
            }

            /* ===================================================
               BOSS 自然冰霜粒子：生成於全場景座標，粒子離開發射點後獨立漂流，
               因此進場、停留與離場時都不會像貼圖一樣黏在 BOSS 容器上。
               =================================================== */
            #boss-ambient-particle-layer,
            #boss-teleport-layer {
                position: absolute;
                inset: 0;
                overflow: hidden;
                pointer-events: none;
            }

            #boss-ambient-particle-layer {
                z-index: 8;
                mix-blend-mode: screen;
            }

            #boss-teleport-layer {
                z-index: 13;
                mix-blend-mode: screen;
            }

            .boss-ambient-frost-mote,
            .boss-ambient-frost-shard {
                position: absolute;
                left: 0;
                top: 0;
                pointer-events: none;
                opacity: 0;
                will-change: transform, opacity;
            }

            .boss-ambient-frost-mote {
                border-radius: 50%;
                background: rgba(248, 255, 255, 0.98);
                box-shadow:
                    0 0 5px rgba(255,255,255,0.96),
                    0 0 12px rgba(127,235,250,0.62);
            }

            .boss-ambient-frost-shard {
                background: linear-gradient(180deg, #fff, rgba(164,241,252,0.52));
                clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
                filter: drop-shadow(0 0 5px rgba(143,239,252,0.78));
            }

            .boss-teleport-ring,
            .boss-teleport-slash,
            .boss-teleport-spark {
                position: absolute;
                pointer-events: none;
                opacity: 0;
                will-change: transform, opacity;
            }

            .boss-teleport-ring {
                width: 86px;
                height: 86px;
                border: 2px solid rgba(231, 255, 255, 0.92);
                border-radius: 50%;
                box-shadow:
                    0 0 14px rgba(255,255,255,0.9),
                    inset 0 0 18px rgba(103,232,249,0.48);
            }

            .boss-teleport-slash {
                height: 3px;
                border-radius: 999px;
                transform-origin: center;
                background: linear-gradient(90deg,
                    transparent 0%,
                    rgba(185,248,255,0.3) 18%,
                    #fff 55%,
                    rgba(159,240,252,0.42) 78%,
                    transparent 100%);
                box-shadow: 0 0 10px rgba(231,255,255,0.86);
            }

            .boss-teleport-spark {
                border-radius: 50%;
                background: #fff;
                box-shadow: 0 0 9px rgba(148,240,252,0.95);
            }

            /* 吸氣階段：粒子往嘴部集中 */
            #boss-suction-field {
                position: absolute;
                inset: -18%;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.18s ease;
            }

            #scene3-boss.inhaling #boss-suction-field {
                opacity: 1;
            }

            .boss-suction-particle {
                position: absolute;
                left: var(--suction-x);
                top: var(--suction-y);
                width: var(--suction-size);
                height: var(--suction-size);
                border-radius: 50%;
                background: #fff;
                box-shadow: 0 0 8px #fff;
                animation: bossSuctionMove var(--suction-duration) cubic-bezier(0.65, 0, 0.9, 0.45) infinite;
                animation-delay: var(--suction-delay);
                opacity: 0;
            }

            @keyframes bossSuctionMove {
                0% {
                    opacity: 0;
                    transform: translate3d(0, 0, 0) scale(1);
                }
                20% { opacity: 0.9; }
                100% {
                    opacity: 0;
                    transform: translate3d(var(--suction-dx), var(--suction-dy), 0) scale(0.05);
                }
            }

            /* ===================================================
               全場景左下 45° 冰霜暴風：所有容器都超出畫面邊界，透明端點位於
               可視區外，避免右側局部效果與矩形邊界。
               =================================================== */
            #boss-wind-layer {
                position: absolute;
                inset: 0;
                z-index: 11;
                opacity: 0;
                visibility: hidden;
                overflow: hidden;
                pointer-events: none;
                transition: opacity 0.16s linear;
            }

            #boss-wind-layer.active {
                opacity: 1;
                visibility: visible;
            }

            #boss-wind-haze,
            #boss-storm-snow-field,
            #boss-wind-streak-field,
            #boss-wind-dust-field {
                position: absolute;
                inset: 0;
                overflow: visible;
                pointer-events: none;
            }

            #boss-wind-haze {
                inset: -48%;
                transform: rotate(-22deg) translate3d(8%, -6%, 0);
                background:
                    linear-gradient(135deg,
                        transparent 0%,
                        rgba(255,255,255,0.018) 16%,
                        rgba(180,244,252,0.08) 36%,
                        rgba(255,255,255,0.18) 54%,
                        rgba(151,236,249,0.08) 72%,
                        transparent 91%),
                    radial-gradient(ellipse at 72% 24%,
                        rgba(222,254,255,0.24) 0%,
                        rgba(133,235,249,0.09) 34%,
                        transparent 72%);
                filter: blur(24px);
                mix-blend-mode: screen;
                opacity: 0;
                will-change: transform, opacity;
            }

            #boss-wind-layer.active #boss-wind-haze {
                animation: bossWideHazePulse 0.42s ease-in-out infinite alternate;
            }

            @keyframes bossWideHazePulse {
                from { transform: rotate(-22deg) translate3d(5%, -4%, 0) scale(0.96); opacity: 0.58; }
                to   { transform: rotate(-20deg) translate3d(-2%, 2%, 0) scale(1.08); opacity: 0.88; }
            }

            #boss-wind-cone {
                position: absolute;
                right: -70%;
                top: -52%;
                width: 285%;
                height: 245%;
                transform-origin: 88% 18%;
                transform: rotate(-23deg) scale(0.9, 0.84);
                background: transparent;
                border: 0;
                filter: none;
                mix-blend-mode: screen;
                opacity: 0;
                will-change: transform, opacity;
            }

            #boss-wind-cone::before,
            #boss-wind-cone::after {
                content: '';
                position: absolute;
                right: 0;
                border-radius: 999px;
                pointer-events: none;
                transform-origin: right center;
                mix-blend-mode: screen;
            }

            #boss-wind-cone::before {
                top: 21%;
                width: 190%;
                height: 35%;
                background: linear-gradient(90deg,
                    transparent 0%,
                    rgba(255,255,255,0.012) 9%,
                    rgba(202,250,255,0.075) 31%,
                    rgba(255,255,255,0.17) 58%,
                    rgba(191,247,253,0.065) 78%,
                    transparent 100%);
                filter: blur(32px);
                opacity: 0.9;
            }

            #boss-wind-cone::after {
                top: 48%;
                width: 174%;
                height: 22%;
                background: linear-gradient(90deg,
                    transparent 0%,
                    rgba(255,255,255,0.016) 12%,
                    rgba(187,246,252,0.09) 39%,
                    rgba(255,255,255,0.18) 67%,
                    rgba(255,255,255,0.035) 87%,
                    transparent 100%);
                filter: blur(23px);
                opacity: 0.82;
            }

            #boss-wind-layer.active #boss-wind-cone {
                animation: bossWindConePulse 0.36s ease-in-out infinite alternate;
            }

            @keyframes bossWindConePulse {
                from { transform: rotate(-23deg) scale(0.93, 0.86); opacity: 0.6; }
                to   { transform: rotate(-21deg) scale(1.07, 0.97); opacity: 0.92; }
            }

            .boss-storm-snow {
                position: absolute;
                left: var(--storm-x);
                top: var(--storm-y);
                width: var(--storm-size);
                height: var(--storm-size);
                border-radius: 50%;
                background: rgba(255,255,255,0.98);
                box-shadow: 0 0 8px rgba(211,251,255,0.95);
                opacity: 0;
                animation: bossStormSnow var(--storm-duration) linear infinite;
                animation-delay: var(--storm-delay);
                will-change: transform, opacity;
            }

            #boss-wind-layer.active .boss-storm-snow {
                opacity: var(--storm-opacity);
            }

            @keyframes bossStormSnow {
                0% {
                    transform: translate3d(46vw, -46vh, 0) rotate(0deg) scale(0.55);
                    opacity: 0;
                }
                12% { opacity: var(--storm-opacity); }
                100% {
                    transform: translate3d(-155vw, 155vh, 0) rotate(-420deg) scale(1.35);
                    opacity: 0;
                }
            }

            .boss-wind-streak {
                position: absolute;
                left: var(--wind-x);
                top: var(--wind-y);
                width: var(--wind-length);
                height: var(--wind-thickness);
                border-radius: 999px;
                background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.95) 52%, transparent 100%);
                box-shadow: 0 0 9px rgba(255,255,255,0.85);
                opacity: 0;
                transform: rotate(-45deg);
                animation: bossWindSlash var(--wind-duration) linear infinite;
                animation-delay: var(--wind-delay);
                will-change: transform, opacity;
            }

            #boss-wind-layer.active .boss-wind-streak {
                opacity: var(--wind-opacity);
            }

            @keyframes bossWindSlash {
                0% {
                    transform: translate3d(42vw, -42vh, 0) rotate(-45deg) scaleX(0.42);
                    opacity: 0;
                }
                10% { opacity: var(--wind-opacity); }
                100% {
                    transform: translate3d(-158vw, 158vh, 0) rotate(-45deg) scaleX(1.32);
                    opacity: 0;
                }
            }

            .boss-wind-dust {
                position: absolute;
                left: var(--dust-x);
                top: var(--dust-y);
                width: var(--dust-size);
                height: var(--dust-size);
                border-radius: 50%;
                background: #fff;
                filter: blur(0.45px);
                box-shadow: 0 0 8px rgba(255,255,255,0.9);
                opacity: 0;
                animation: bossWindDust var(--dust-duration) linear infinite;
                animation-delay: var(--dust-delay);
            }

            #boss-wind-layer.active .boss-wind-dust {
                opacity: var(--dust-opacity);
            }

            @keyframes bossWindDust {
                0% { transform: translate3d(35vw, -35vh, 0) scale(0.45); opacity: 0; }
                13% { opacity: var(--dust-opacity); }
                100% { transform: translate3d(-148vw, 148vh, 0) scale(1.5); opacity: 0; }
            }

            #scene3-stage.boss-wind-shake {
                animation: bossWindScreenShake 0.085s steps(2) infinite;
            }

            @keyframes bossWindScreenShake {
                0%   { transform: translate3d(-3px, 2px, 0); }
                33%  { transform: translate3d(4px, -2px, 0); }
                66%  { transform: translate3d(-1px, -4px, 0); }
                100% { transform: translate3d(3px, 3px, 0); }
            }

            #stickman-s3.boss-wind-pushed #stickman-body-s3,
            #stickman-s3.boss-wind-pushed #armL-s3,
            #stickman-s3.boss-wind-pushed #armR-s3,
            #stickman-s3.boss-wind-pushed #legL-s3,
            #stickman-s3.boss-wind-pushed #legR-s3 {
                animation: none !important;
            }



            /*
               原本的整體翻滾效果：角色容器本身持續旋轉；left / top 仍由
               Web Animations 控制左下 45° 位移。使用獨立 rotate 屬性，
               不會覆蓋既有 translate(-50%, -50%) 與面向設定。
            */
            #stickman-roll-shell {
                position: absolute;
                inset: 0;
                transform-origin: 50% 50%;
                will-change: transform;
            }

            #stickman-s3.player-tumble {
                transform-origin: 50% 50%;
                will-change: left, top, filter;
            }

            #stickman-s3.player-tumble #stickman-roll-shell {
                animation: tumbleSpinOriginal 0.4s linear infinite !important;
            }

            #stickman-s3.player-tumble #stickman-body-s3 {
                animation: none !important;
                transform: translate(-50%, -50%) !important;
            }

            @keyframes tumbleSpinOriginal {
                0%   { transform: rotate(0deg); }
                100% { transform: rotate(-360deg); }
            }

            #stickman-s3.boss-wind-landed #stickman-body-s3 {
                animation: bossWindLandingSquash 0.26s cubic-bezier(0.18, 0.86, 0.22, 1) forwards !important;
            }

            @keyframes bossWindLandingSquash {
                0%   { transform: translate(-50%, -50%) scale(1.08, 0.92) rotate(-10deg); }
                48%  { transform: translate(-50%, -50%) scale(0.82, 1.18) rotate(5deg); }
                100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
            }

            @media (max-width: 760px) {
                #scene3-boss {
                    left: 66%;
                    top: 36%;
                    width: clamp(240px, min(58vw, 56vh), 330px);
                }
            }

        </style>

        <div id="scene3-stage" style="width: 100%; height: 100%; background-color: #000; position: relative; overflow: hidden;">
            
            <div id="environment-layer-s3" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; transition: none; pointer-events: none;">
                
                <svg id="enemy-small" class="triangle-enemy tri-jump" style="--jump-height: 50px; --jump-delay: 0s; --facing: 1; width: 70px; height: 70px; left: 52%; top: 48%;" viewBox="0 0 130 130" stroke="#fff" stroke-width="6" fill="#000" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="65" y1="30" x2="65" y2="15" />
                    <polygon points="65,30 5,90 125,90" />
                    <g class="tri-eye-open"><circle cx="56" cy="55" r="3" fill="#fff" stroke="none" /><circle cx="74" cy="55" r="3" fill="#fff" stroke="none" /></g>
                    <g class="tri-eye-closed"><polyline points="50,51 56,55 50,59" fill="none" stroke-linejoin="round"/><polyline points="80,51 74,55 80,59" fill="none" stroke-linejoin="round"/></g>
                    <g class="tri-eye-attack-prep"><line x1="52" y1="52" x2="60" y2="58" stroke-width="4" /><line x1="78" y1="52" x2="70" y2="58" stroke-width="4" /></g>
                    <g class="tri-eye-attack-dash">
                        <path class="dizzy-spin" style="transform-origin: 56px 55px;" d="M 56 55 A 1 1 0 0 1 58 55 A 2 2 0 0 1 54 55 A 3 3 0 0 1 60 55 A 4 4 0 0 1 52 55" fill="none" stroke="#fff" stroke-width="1.0" stroke-linecap="round"/>
                        <path class="dizzy-spin" style="transform-origin: 74px 55px;" d="M 74 55 A 1 1 0 0 1 76 55 A 2 2 0 0 1 72 55 A 3 3 0 0 1 78 55 A 4 4 0 0 1 70 55" fill="none" stroke="#fff" stroke-width="1.0" stroke-linecap="round"/>
                    </g>
                    <path class="tri-leg-smooth" d="M 65 90 L 65 105 Q 65 112 73 112" />
                </svg>

                <svg id="enemy-small-2" class="triangle-enemy tri-jump" style="--jump-height: 45px; --jump-delay: 150ms; --facing: 1; width: 70px; height: 70px; left: 45%; top: 25%;" viewBox="0 0 130 130" stroke="#fff" stroke-width="6" fill="#000" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="65" y1="30" x2="65" y2="15" />
                    <polygon points="65,30 5,90 125,90" />
                    <g class="tri-eye-open"><circle cx="56" cy="55" r="3" fill="#fff" stroke="none" /><circle cx="74" cy="55" r="3" fill="#fff" stroke="none" /></g>
                    <g class="tri-eye-closed"><polyline points="50,51 56,55 50,59" fill="none" stroke-linejoin="round"/><polyline points="80,51 74,55 80,59" fill="none" stroke-linejoin="round"/></g>
                    <g class="tri-eye-attack-prep"><line x1="52" y1="52" x2="60" y2="58" stroke-width="4" /><line x1="78" y1="52" x2="70" y2="58" stroke-width="4" /></g>
                    <g class="tri-eye-attack-dash">
                        <path class="dizzy-spin" style="transform-origin: 56px 55px;" d="M 56 55 A 1 1 0 0 1 58 55 A 2 2 0 0 1 54 55 A 3 3 0 0 1 60 55 A 4 4 0 0 1 52 55" fill="none" stroke="#fff" stroke-width="1.0" stroke-linecap="round"/>
                        <path class="dizzy-spin" style="transform-origin: 74px 55px;" d="M 74 55 A 1 1 0 0 1 76 55 A 2 2 0 0 1 72 55 A 3 3 0 0 1 78 55 A 4 4 0 0 1 70 55" fill="none" stroke="#fff" stroke-width="1.0" stroke-linecap="round"/>
                    </g>
                    <path class="tri-leg-smooth" d="M 65 90 L 65 105 Q 65 112 73 112" />
                </svg>

                <svg id="enemy-small-3" class="triangle-enemy tri-jump" style="--jump-height: 55px; --jump-delay: 350ms; --facing: 1; width: 70px; height: 70px; left: 62%; top: 76%;" viewBox="0 0 130 130" stroke="#fff" stroke-width="6" fill="#000" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="65" y1="30" x2="65" y2="15" />
                    <polygon points="65,30 5,90 125,90" />
                    <g class="tri-eye-open"><circle cx="56" cy="55" r="3" fill="#fff" stroke="none" /><circle cx="74" cy="55" r="3" fill="#fff" stroke="none" /></g>
                    <g class="tri-eye-closed"><polyline points="50,51 56,55 50,59" fill="none" stroke-linejoin="round"/><polyline points="80,51 74,55 80,59" fill="none" stroke-linejoin="round"/></g>
                    <g class="tri-eye-attack-prep"><line x1="52" y1="52" x2="60" y2="58" stroke-width="4" /><line x1="78" y1="52" x2="70" y2="58" stroke-width="4" /></g>
                    <g class="tri-eye-attack-dash">
                        <path class="dizzy-spin" style="transform-origin: 56px 55px;" d="M 56 55 A 1 1 0 0 1 58 55 A 2 2 0 0 1 54 55 A 3 3 0 0 1 60 55 A 4 4 0 0 1 52 55" fill="none" stroke="#fff" stroke-width="1.0" stroke-linecap="round"/>
                        <path class="dizzy-spin" style="transform-origin: 74px 55px;" d="M 74 55 A 1 1 0 0 1 76 55 A 2 2 0 0 1 72 55 A 3 3 0 0 1 78 55 A 4 4 0 0 1 70 55" fill="none" stroke="#fff" stroke-width="1.0" stroke-linecap="round"/>
                    </g>
                    <path class="tri-leg-smooth" d="M 65 90 L 65 105 Q 65 112 73 112" />
                </svg>

                <svg id="enemy-medium" class="triangle-enemy tri-jump" style="--jump-height: 80px; --jump-delay: 200ms; --facing: 1; width: 120px; height: 120px; left: 72%; top: 68%;" viewBox="0 0 130 130" stroke="#fff" stroke-width="5" fill="#000" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="65" y1="30" x2="65" y2="15" />
                    <polygon points="65,30 5,90 125,90" />
                    <g class="tri-eye-open"><circle cx="54" cy="55" r="3.5" fill="#fff" stroke="none" /><circle cx="76" cy="55" r="3.5" fill="#fff" stroke="none" /></g>
                    <g class="tri-eye-closed"><polyline points="48,50 55,55 48,60" fill="none" stroke-linejoin="round"/><polyline points="82,50 75,55 82,60" fill="none" stroke-linejoin="round"/></g>
                    <g class="tri-eye-attack-prep"><line x1="49" y1="52" x2="59" y2="59" stroke-width="4" /><line x1="81" y1="52" x2="71" y2="59" stroke-width="4" /></g>
                    <g class="tri-eye-attack-dash">
                        <path class="dizzy-spin" style="transform-origin: 54px 55px;" d="M 54 55 A 1.2 1.2 0 0 1 56.4 55 A 2.4 2.4 0 0 1 51.6 55 A 3.6 3.6 0 0 1 58.8 55 A 4.8 4.8 0 0 1 49.2 55" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>
                        <path class="dizzy-spin" style="transform-origin: 76px 55px;" d="M 76 55 A 1.2 1.2 0 0 1 78.4 55 A 2.4 2.4 0 0 1 73.6 55 A 3.6 3.6 0 0 1 80.8 55 A 4.8 4.8 0 0 1 71.2 55" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>
                    </g>
                    <path class="tri-leg-smooth" d="M 65 90 L 65 105 Q 65 112 73 112" />
                </svg>

                <svg id="enemy-large" class="triangle-enemy tri-jump" style="--jump-height: 120px; --jump-delay: 500ms; --facing: 1; width: 200px; height: 200px; left: 75%; top: 28%;" viewBox="0 0 130 130" stroke="#fff" stroke-width="4" fill="#000" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="65" y1="30" x2="65" y2="15" />
                    <polygon points="65,30 5,90 125,90" />
                    <g class="tri-eye-open"><circle cx="57" cy="55" r="4" fill="#fff" stroke="none" /><circle cx="73" cy="55" r="4" fill="#fff" stroke="none" /></g>
                    <g class="tri-eye-closed"><polyline points="51,51 60,55 51,59" fill="none" stroke-linejoin="round"/><polyline points="79,51 70,55 79,59" fill="none" stroke-linejoin="round"/></g>
                    <g class="tri-eye-attack-prep"><line x1="53" y1="52" x2="61" y2="58" stroke-width="4" /><line x1="77" y1="52" x2="69" y2="58" stroke-width="4" /></g>
                    <g class="tri-eye-attack-dash">
                        <path class="dizzy-spin" style="transform-origin: 57px 55px;" d="M 57 55 A 1.5 1.5 0 0 1 60 55 A 3 3 0 0 1 54 55 A 4.5 4.5 0 0 1 63 55 A 6 6 0 0 1 51 55" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
                        <path class="dizzy-spin" style="transform-origin: 73px 55px;" d="M 73 55 A 1.5 1.5 0 0 1 76 55 A 3 3 0 0 1 70 55 A 4.5 4.5 0 0 1 79 55 A 6 6 0 0 1 67 55" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
                    </g>
                    <path class="tri-leg-smooth" d="M 65 90 L 65 105 Q 65 112 73 112" />
                </svg>

                <!-- 🌟 PLA 邏輯陣列電路圖 (完美還原等距、延伸網格與交點) -->
                <svg class="pla-circuit" style="position: absolute; bottom: -20%; left: 115%; top: auto; transform: none; width: 1650px; height: 2550px; z-index: 3; filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4)); overflow: visible;" viewBox="0 0 550 850" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    
                    <!-- ===== 1. 頂部標籤 ===== -->
                    <g class="pla-text" stroke="none" fill="#fff" font-family="'Orbitron', sans-serif" font-size="18" font-weight="bold" letter-spacing="2px">
                        <text x="125" y="20">H</text>
                        <text x="150" y="20">I</text>
                        <text x="175" y="20">C</text>
                        <text x="200" y="20">C'</text>
                        <text x="225" y="20">E</text>
                        <text x="250" y="20">E'</text>
                        <text x="275" y="20">N</text>
                        <text x="300" y="20">S</text>
                    </g>

                    <!-- ===== 2. 左側輸入標籤 ===== -->
                    <g class="pla-text" stroke="none" fill="#fff" font-family="'Orbitron', sans-serif" font-size="20" font-weight="bold" text-anchor="middle">
                        <text x="40" y="57">H</text>
                        <text x="40" y="107">I</text>
                        <text x="40" y="157">C</text>
                        <text x="40" y="207">E</text>
                        <text x="40" y="257">N</text>
                        <text x="40" y="307">S</text>
                    </g>

                    <!-- ===== 3. 左側精準還原邏輯閘 ===== -->
                    <!-- H & I 線 -->
                    <line x1="55" y1="50" x2="305" y2="50" />
                    <line x1="55" y1="100" x2="305" y2="100" />
                    
                    <!-- C 輸入 -->
                    <line x1="55" y1="150" x2="60" y2="150" />
                    <path d="M 60 135 L 60 170 L 95 150 Z" />
                    <line x1="95" y1="150" x2="305" y2="150" />
                    <circle cx="78" cy="165" r="4.5" />
                    <line x1="82.5" y1="165" x2="305" y2="165" />

                    <!-- E 輸入 -->
                    <line x1="55" y1="200" x2="60" y2="200" />
                    <path d="M 60 185 L 60 220 L 95 200 Z" />
                    <line x1="95" y1="200" x2="305" y2="200" />
                    <circle cx="78" cy="215" r="4.5" />
                    <line x1="82.5" y1="215" x2="305" y2="215" />

                    <!-- N 與 S -->
                    <line x1="55" y1="250" x2="305" y2="250" />
                    <line x1="55" y1="300" x2="305" y2="300" />

                    <!-- ===== 4. 垂直導線 (修復：底部延伸配合上移後的陣列，長度至 y=790) ===== -->
                    <line x1="130" y1="30" x2="130" y2="790" />
                    <line x1="155" y1="30" x2="155" y2="790" />
                    <line x1="180" y1="30" x2="180" y2="790" />
                    <line x1="205" y1="30" x2="205" y2="790" />
                    <line x1="230" y1="30" x2="230" y2="790" />
                    <line x1="255" y1="30" x2="255" y2="790" />
                    <line x1="280" y1="30" x2="280" y2="790" />
                    <line x1="305" y1="30" x2="305" y2="790" />

                    <!-- ===== 5. 頂部連接圓點 (Dots •) ===== -->
                    <g fill="#fff">
                        <circle cx="130" cy="50" r="4.5" />
                        <circle cx="155" cy="100" r="4.5" />
                        <circle cx="180" cy="150" r="4.5" />
                        <circle cx="205" cy="165" r="4.5" />
                        <circle cx="230" cy="200" r="4.5" />
                        <circle cx="255" cy="215" r="4.5" />
                        <circle cx="280" cy="250" r="4.5" />
                        <circle cx="305" cy="300" r="4.5" />
                    </g>

                    <!-- ===== 6. 下方 9 條水平 AND 線與叉叉 (Crosses ×) (修復：向左延伸至 x1=55，整體向上平移 60 讓間距統一) ===== -->
                    <g>
                        <!-- Row 1: ICE (y=350) -->
                        <line x1="55" y1="350" x2="330" y2="350" />
                        <path d="M 148 343 L 162 357 M 162 343 L 148 357 M 173 343 L 187 357 M 187 343 L 173 357 M 223 343 L 237 357 M 237 343 L 223 357" />
                        
                        <!-- Row 2: HI (y=400) -->
                        <line x1="55" y1="400" x2="330" y2="400" />
                        <path d="M 123 393 L 137 407 M 137 393 L 123 407 M 148 393 L 162 407 M 162 393 L 148 407" />
                        
                        <!-- Row 3: SSI (y=450) -->
                        <line x1="55" y1="450" x2="330" y2="450" />
                        <path d="M 148 443 L 162 457 M 162 443 L 148 457 M 298 443 L 312 457 M 312 443 L 298 457" />
                        
                        <!-- Row 4: IC'S (y=500) -->
                        <line x1="55" y1="500" x2="330" y2="500" />
                        <path d="M 148 493 L 162 507 M 162 493 L 148 507 M 198 493 L 212 507 M 212 493 L 198 507 M 298 493 L 312 507 M 312 493 L 298 507" />
                        
                        <!-- Row 5: NICE'S (y=550) -->
                        <line x1="55" y1="550" x2="330" y2="550" />
                        <path d="M 148 543 L 162 557 M 162 543 L 148 557 M 173 543 L 187 557 M 187 543 L 173 557 M 248 543 L 262 557 M 262 543 L 248 557 M 273 543 L 287 557 M 287 543 L 273 557 M 298 543 L 312 557 M 312 543 L 298 557" />
                        
                        <!-- Row 6: CSIE (y=600) -->
                        <line x1="55" y1="600" x2="330" y2="600" />
                        <path d="M 148 593 L 162 607 M 162 593 L 148 607 M 173 593 L 187 607 M 187 593 L 173 607 M 223 593 L 237 607 M 237 593 L 223 607 M 298 593 L 312 607 M 312 593 L 298 607" />
                        
                        <!-- Row 7: HI (y=650) -->
                        <line x1="55" y1="650" x2="330" y2="650" />
                        <path d="M 123 643 L 137 657 M 137 643 L 123 657 M 148 643 L 162 657 M 162 643 L 148 657" />
                        
                        <!-- Row 8: ECE (y=700) -->
                        <line x1="55" y1="700" x2="330" y2="700" />
                        <path d="M 173 693 L 187 707 M 187 693 L 173 707 M 223 693 L 237 707 M 237 693 L 223 707" />
                        
                        <!-- Row 9: HI (y=750) -->
                        <line x1="55" y1="750" x2="330" y2="750" />
                        <path d="M 123 743 L 137 757 M 137 743 L 123 757 M 148 743 L 162 757 M 162 743 L 148 757" />
                    </g>

                    <!-- ===== 7. 右側 9 個 AND Gate 與輸出標籤 (修復：整體向上平移 60) ===== -->
                    <g fill="#000">
                        <path d="M 330 335 L 345 335 A 15 15 0 0 1 345 365 L 330 365 Z" />
                        <path d="M 330 385 L 345 385 A 15 15 0 0 1 345 415 L 330 415 Z" />
                        <path d="M 330 435 L 345 435 A 15 15 0 0 1 345 465 L 330 465 Z" />
                        <path d="M 330 485 L 345 485 A 15 15 0 0 1 345 515 L 330 515 Z" />
                        <path d="M 330 535 L 345 535 A 15 15 0 0 1 345 565 L 330 565 Z" />
                        <path d="M 330 585 L 345 585 A 15 15 0 0 1 345 615 L 330 615 Z" />
                        <path d="M 330 635 L 345 635 A 15 15 0 0 1 345 665 L 330 665 Z" />
                        <path d="M 330 685 L 345 685 A 15 15 0 0 1 345 715 L 330 715 Z" />
                        <path d="M 330 735 L 345 735 A 15 15 0 0 1 345 765 L 330 765 Z" />
                    </g>
                    
                    <!-- 輸出連線與文字 (修復：整體向上平移 60) -->
                    <g class="pla-text" stroke="none" fill="#fff" font-family="'Orbitron', sans-serif" font-size="20" font-weight="bold" letter-spacing="2px">
                        <line x1="360" y1="350" x2="385" y2="350" stroke="#fff" stroke-width="2.5" /> <text x="395" y="357">ICE</text>
                        <line x1="360" y1="400" x2="385" y2="400" stroke="#fff" stroke-width="2.5" /> <text x="395" y="407">HI</text>
                        <line x1="360" y1="450" x2="385" y2="450" stroke="#fff" stroke-width="2.5" /> <text x="395" y="457">SSI</text>
                        <line x1="360" y1="500" x2="385" y2="500" stroke="#fff" stroke-width="2.5" /> <text x="395" y="507">IC'S</text>
                        <line x1="360" y1="550" x2="385" y2="550" stroke="#fff" stroke-width="2.5" /> <text x="395" y="557">NICE'S</text>
                        <line x1="360" y1="600" x2="385" y2="600" stroke="#fff" stroke-width="2.5" /> <text x="395" y="607">CSIE</text>
                        <line x1="360" y1="650" x2="385" y2="650" stroke="#fff" stroke-width="2.5" /> <text x="395" y="657">HI</text>
                        <line x1="360" y1="700" x2="385" y2="700" stroke="#fff" stroke-width="2.5" /> <text x="395" y="707">ECE</text>
                        <line x1="360" y1="750" x2="385" y2="750" stroke="#fff" stroke-width="2.5" /> <text x="395" y="757">HI</text>
                    </g>
                </svg>

                <!-- 🌟 新增：透明純白能量玻璃牆 -->
                <div id="pla-glass-barrier">
                    <div class="pla-glass-wind"></div>
                </div>
            </div>


            <!-- ===================================================
                 🌨️ 六枝邏輯 BOSS、自然冰霜粒子、瞬移與全場景吹氣特效層
                 =================================================== -->
            <div id="scene3-boss-layer" aria-hidden="true">
                <!-- 粒子採用場景座標，生成後不再跟著 BOSS 容器移動。 -->
                <div id="boss-ambient-particle-layer"></div>
                <div id="boss-teleport-layer"></div>

                <div id="boss-wind-layer">
                    <div id="boss-wind-haze"></div>
                    <div id="boss-storm-snow-field"></div>
                    <div id="boss-wind-cone"></div>
                    <div id="boss-wind-streak-field"></div>
                    <div id="boss-wind-dust-field"></div>
                </div>

                <div id="scene3-boss">
                    <div id="boss-flight-shell">
                        <div id="boss-hover-shell">
                            <div id="boss-aura"></div>
                            <div id="boss-suction-field"></div>

                            ${getBossSVG()}
                        </div>
                    </div>
                </div>
            </div>


            <div id="stickman-s3" class="stand-still" style="position: absolute; top: 50%; left: 20%; transform: translate(-50%, -50%); width: 80px; height: 120px; transition: none; z-index: 5;">
                <div id="stickman-roll-shell">
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
                        <!-- 🌟 修正主手：改為 translate(17, 54) 精準握在根部，rotate(-22) 讓頂部朝上偏左！ -->
                        <g id="held-item-hand1" opacity="0" transform="translate(-8, 32) scale(0.35) rotate(-20, 65, 90)" style="filter: drop-shadow(0 0 5px rgba(255,255,255,0.8));"></g>
                    </g>
                    <g id="armR-s3">
                        <line x1="40" y1="56" x2="40" y2="85" />
                        <text id="held-0-s3" x="70" y="50" dy="0.3em" text-anchor="middle" fill="#fff" font-size="23" font-family="'Orbitron', sans-serif" font-weight="25" opacity="0">0</text>
                        <!-- 🌟 修正副手：改為 translate(20, 54) 精準握在根部，rotate(-22) 讓頂部朝上偏左！ -->
                        <g id="held-item-hand2" opacity="0" transform="translate(6, 52) scale(0.35) rotate(-35, 65, 90)" style="filter: drop-shadow(0 0 5px rgba(255,255,255,0.8));"></g>
                    </g>
                    <line x1="40" y1="75" x2="40" y2="105" id="legL-s3" /> 
                    <line x1="40" y1="75" x2="40" y2="105" id="legR-s3" /> 
                </svg>
                </div>
            </div>

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
                                <div class="key-group-wasd"><div class="key-row"><div class="key-btn">W</div></div><div class="key-row"><div class="key-btn">A</div><div class="key-btn">S</div><div class="key-btn">D</div></div></div>
                            </div>
                            <div class="manual-panel" style="justify-content: flex-start;">
                                <div class="action-block">
                                    <div class="action-header"><div class="key-btn" style="border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">E</div><div class="action-text">Pick up</div></div>
                                    <svg class="svg-glow" viewBox="0 0 200 100" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 120px;">
                                        <circle cx="50" cy="30" r="12" /><line x1="50" y1="42" x2="50" y2="70" /><line x1="50" y1="50" x2="35" y2="80" /> <line x1="50" y1="50" x2="80" y2="60" /> <line x1="50" y1="70" x2="35" y2="95" /> <line x1="50" y1="70" x2="65" y2="95" /> <circle cx="85" cy="55" r="8" stroke="var(--brand-blue)" /><circle cx="130" cy="85" r="10" stroke="#888" stroke-dasharray="4 4" /><path d="M 120 75 Q 110 58 95 58" stroke="#888" stroke-width="2" fill="none" stroke-dasharray="3 3" /><polyline points="102,52 95,58 102,64" stroke="#888" stroke-width="2" fill="none" />
                                    </svg>
                                </div>
                                <div class="action-block" style="border-bottom: none;">
                                    <div class="action-header"><div class="key-btn" style="border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">Q</div><div class="action-text">USE</div></div>
                                    <svg class="svg-glow" viewBox="0 0 200 100" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 120px;">
                                        <circle cx="40" cy="40" r="10" /><line x1="40" y1="50" x2="40" y2="75" /><line x1="40" y1="55" x2="25" y2="80" /> <line x1="40" y1="55" x2="60" y2="60" /> <line x1="40" y1="75" x2="25" y2="95" /> <line x1="40" y1="75" x2="55" y2="95" /><line x1="120" y1="45" x2="140" y2="45" stroke="#fff" /> <line x1="120" y1="65" x2="140" y2="65" stroke="#fff" /> <line x1="140" y1="35" x2="140" y2="75" /> <line x1="140" y1="35" x2="160" y2="35" /> <line x1="140" y1="75" x2="160" y2="75" /><path d="M 160 35 A 20 20 0 0 1 160 75" /><line x1="180" y1="55" x2="195" y2="55" stroke="#fff" /><path d="M 65 60 Q 85 55 100 65" stroke="#888" stroke-width="2" stroke-dasharray="3 3" /><polyline points="93,58 100,65 93,68" stroke="#888" stroke-width="2" /><circle cx="110" cy="65" r="6" stroke="var(--brand-blue)" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="manual-page-2-s3" class="manual-page">
                        <div class="manual-panel" style="width: 100%; flex: 1; justify-content: center;">
                            <div class="action-block" style="border-bottom: none; width: 100%; margin-bottom: 0;">
                                <div class="action-header" style="justify-content: flex-start; margin-bottom: 30px;"><div class="key-btn" style="border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">J</div><div class="action-text" style="font-size: 2rem;">Attack</div></div>
                                <svg class="svg-glow" viewBox="0 -50 450 250" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 230px; display: block; margin: 0 auto;">
                                    <g transform="rotate(-40, 95, 95)" stroke="#888" fill="none" stroke-dasharray="6 6"><line x1="95" y1="95" x2="230" y2="95" stroke-width="6"/><path d="M 275 55 L 275 135 A 45 40 0 0 1 275 55 Z" stroke-width="3"/></g><g stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 4" opacity="0.8"><path d="M 160 35 Q 185 60 185 85" /><path d="M 190 15 Q 220 45 220 80" /><path d="M 215 0 Q 250 35 250 75" /></g><g stroke="#fff" fill="none"><line x1="95" y1="95" x2="230" y2="95" stroke-width="6" stroke-linecap="round"/><path d="M 275 55 L 275 135 A 45 40 0 0 1 275 55 Z" fill="#000" stroke-width="4"/></g><circle cx="75" cy="50" r="16" stroke="#fff" stroke-width="4" fill="none"/><line x1="75" y1="66" x2="75" y2="115" stroke="#fff" stroke-width="4"/><line x1="75" y1="115" x2="50" y2="160" stroke="#fff" stroke-width="4"/><line x1="75" y1="115" x2="100" y2="160" stroke="#fff" stroke-width="4"/><line x1="75" y1="80" x2="60" y2="105" stroke="#fff" stroke-width="4"/> <line x1="75" y1="80" x2="95" y2="95" stroke="#fff" stroke-width="4"/> <g transform="translate(15, 0)" stroke="#fff" stroke-width="4" fill="#000"><line x1="330" y1="50" x2="330" y2="20" /><path d="M 265 140 L 265 90 A 60 70 0 0 1 385 90 L 385 140 Z" /><g stroke-width="3" stroke="#fff" stroke-linecap="round"><path d="M 292 77 L 308 93 M 308 77 L 292 93" /><path d="M 342 77 L 358 93 M 358 77 L 342 93" /></g><path d="M 275 140 Q 265 160 255 170" fill="none" stroke-width="4"/><path d="M 305 140 Q 300 160 295 175" fill="none" stroke-width="4"/><path d="M 345 140 Q 350 160 355 175" fill="none" stroke-width="4"/><path d="M 375 140 Q 385 160 395 170" fill="none" stroke-width="4"/></g><path d="M 275 85 L 285 75 L 280 90 L 295 95 L 280 100 L 285 115 L 275 105 L 265 115 L 270 100 L 255 95 L 270 90 Z" fill="#fff" stroke="none" />
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

    // 🌟 初始化與強制重置裝備狀態 (每次進入場景都強制回到手上)
    window._hammerSlot = { type: 'handR', x: 555, y: 415 };
    let isHammerEquipped = true;

    function updateMainStickmanEquipment() {
        const heldHammer = document.getElementById('held-hammer-s3');
        const held1 = document.getElementById('held-1-s3');
        const held0 = document.getElementById('held-0-s3');
        const hand1Display = document.getElementById('held-item-hand1');
        const hand2Display = document.getElementById('held-item-hand2');
        
        // 🌟 動態建立頭部裝備圖層 (如果 DOM 中還沒有的話)
        let headDisplay = document.getElementById('held-item-head');
        if (!headDisplay) {
            const stickmanBody = document.getElementById('stickman-body-s3');
            if (stickmanBody) {
                headDisplay = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                headDisplay.id = 'held-item-head';
                headDisplay.setAttribute('opacity', '0');
                // 精準定位於頭頂
                headDisplay.setAttribute('transform', 'translate(17, -15) scale(0.35)');
                headDisplay.style.filter = 'drop-shadow(0 0 5px rgba(255,255,255,0.8))';
                stickmanBody.appendChild(headDisplay);
            }
        }

        // --- 1. 主手 (Hand 1 - 槌子) ---
        if (isHammerEquipped) {
            if (heldHammer) heldHammer.style.opacity = '1';
            if (held1) held1.style.opacity = '0';
            if (hand1Display) hand1Display.style.opacity = '0';
        } else {
            if (heldHammer) heldHammer.style.opacity = '0';
            if (hand1Display) hand1Display.style.opacity = '0';
            if (held1) held1.style.opacity = ammoOnes > 0 ? '1' : '0';
        }

        // --- 2. 副手 (Hand 2 - 三角怪) ---
        if (hand2Item) {
            if (held0) held0.style.opacity = '0';
            if (hand2Display) {
                hand2Display.innerHTML = getItemSVG(hand2Item);
                hand2Display.style.opacity = '1';
            }
        } else {
            if (hand2Display) hand2Display.style.opacity = '0';
            if (held0) held0.style.opacity = ammoZeros > 0 ? '1' : '0';
        }

        // --- 3. 頭部 (Head - 三角形) ---
        if (headItem) {
            if (headDisplay) {
                headDisplay.innerHTML = getItemSVG(headItem);
                headDisplay.style.opacity = '1';
            }
        } else {
            if (headDisplay) headDisplay.style.opacity = '0';
        }
    }
    
    // 初始化執行一次
    updateMainStickmanEquipment();

    // ==============================================================
    // 🌟 升級版：三階段分配與背包重疊儲存系統
    // ==============================================================
    function pickUpItem(itemType) {
        const sfxPickup = new Audio('game_audio/game_pickup_01.mp3');
        playActionSfx(sfxPickup);

        let placed = false;
        
        // 🌟 智慧分發：帽子只能去頭，怪物只能去副手
        if (itemType === 'hat' && headItem === null) {
            headItem = itemType;
            placed = true;
        } 
        else if (itemType === 'body' && hand2Item === null) {
            hand2Item = itemType;
            placed = true;
        } 
        
        // 🌟 如果專屬位置滿了，才去排背包
        if (!placed) {
            let hasStacked = false;
            for (let i = 0; i < backpackGrid.length; i++) {
                if (backpackGrid[i] && backpackGrid[i].type === itemType) {
                    backpackGrid[i].count += 1;
                    hasStacked = true;
                    break;
                }
            }
            if (!hasStacked) {
                for (let i = 0; i < backpackGrid.length; i++) {
                    const isOccupiedByHammer = (window._hammerSlot && window._hammerSlot.slotIndex === i);
                    if (backpackGrid[i] === null && !isOccupiedByHammer) {
                        backpackGrid[i] = { type: itemType, count: 1 };
                        break;
                    }
                }
            }
        }
        
        updateMainStickmanEquipment();
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
        if (bossTimelineRunning) return;
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
        if(!playerDead) isPlayerControllable = true;

        const gameScreen = document.getElementById('gameScreen');
        const sceneManager = document.getElementById('scene-manager');
        const gameControls = document.querySelector('.game-controls');
        if (gameScreen) gameScreen.style.zIndex = '1';
        if (sceneManager) sceneManager.style.zIndex = '2';
        if (gameControls) gameControls.style.pointerEvents = 'auto';
        checkBossTimelineReady();
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


    // =========================================
    // 🌟 AABB 碰撞偵測輔助函式
    // =========================================
    function getRect(el, shrinkRatio = 1.0) {
        const rect = el.getBoundingClientRect();
        const w = rect.width * shrinkRatio;
        const h = rect.height * shrinkRatio;
        const dx = (rect.width - w) / 2;
        const dy = (rect.height - h) / 2;
        return {
            left: rect.left + dx,
            right: rect.right - dx,
            top: rect.top + dy,
            bottom: rect.bottom - dy
        };
    }

    function isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left ||
                 rect1.left > rect2.right ||
                 rect1.bottom < rect2.top ||
                 rect1.top > rect2.bottom);
    }

    let isPlayerControllable = true; 
    let canAttack = true; 
    let isPlayerAttacking = false; 
    let hasHitInCurrentAttack = false; // 🌟 新增：用來記錄本次揮擊是否已經打中過目標
    let playerDead = false;

    // 🌟 新增：小三角怪擊殺計數器 (總共9隻)
    let smallEnemyKills = 0; 
    let isGamePaused = false;
    let readyToPickUpTriangle = false;
    let pauseStartTime = 0;
    let totalPausedTime = 0;

    let worldX = 20; 
    let py = 50; 
    let cameraX = 0; 
    let facing = 1;  
    const keys = { w: false, a: false, s: false, d: false };

    let enemySpawnCounter = 0;

    const enemies = [
        // 1. 原本的小怪 (中間)
        { el: document.getElementById('enemy-small'), worldX: 52, worldY: 48, speed: 0.25, facing: 1, alive: true, sideOffset: 5, delayMs: 0, state: 'jumping', jumpStartTime: null, lastAttackTime: 0, attackEndTime: 0 },
        
        // 2. 額外的小怪 2 (偏左上亂序)
        { el: document.getElementById('enemy-small-2'), worldX: 45, worldY: 25, speed: 0.25, facing: 1, alive: true, sideOffset: 4, delayMs: 150, state: 'jumping', jumpStartTime: null, lastAttackTime: 0, attackEndTime: 0 },
        
        // 3. 額外的小怪 3 (偏下亂序)
        { el: document.getElementById('enemy-small-3'), worldX: 62, worldY: 76, speed: 0.25, facing: 1, alive: true, sideOffset: 6, delayMs: 350, state: 'jumping', jumpStartTime: null, lastAttackTime: 0, attackEndTime: 0 },
        
        // 4. 中怪 (中間偏右下)
        { el: document.getElementById('enemy-medium'), worldX: 72, worldY: 68, speed: 0.18, facing: 1, alive: true, sideOffset: 8, delayMs: 200, state: 'jumping', jumpStartTime: null, lastAttackTime: 0, attackEndTime: 0 },
        
        // 5. 大怪 (中間偏右上)
        { el: document.getElementById('enemy-large'), worldX: 75, worldY: 28, speed: 0.12, facing: 1, alive: true, sideOffset: 6, delayMs: 500, state: 'jumping', jumpStartTime: null, lastAttackTime: 0, attackEndTime: 0 }
    ];

    let backpackIsOpen = false;

    // ==============================================================
    // 🌨️ 六枝邏輯 BOSS Timeline 控制器
    // 觸發條件：9 隻小三角怪全滅、首殺教學已完成、8 件正式掉落物全數拾取
    // ==============================================================
    const TOTAL_SMALL_ENEMIES = 9;
    const TOTAL_TRIANGLE_LOOT = 8; // 第 2~8 隻掉 body（7 件），第 9 隻掉 hat（1 件）
    let collectedTriangleLoot = 0;
    let bossTimelineStarted = false;
    let bossTimelineRunning = false;
    let bossTimelineCompleted = false;
    let bossTimelineCheckTimer = null;

    function isCurrentScene3Instance() {
        return window._scene3InstanceToken === scene3InstanceToken && scene3.isConnected;
    }

    function waitBossTimeline(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function clearMovementKeys() {
        Object.keys(keys).forEach(key => { keys[key] = false; });
    }

    function getPlayerBottomYPercent() {
        const sceneHeight = Math.max(1, scene3.clientHeight || 600);
        const playerHeight = Math.max(1, stickman.getBoundingClientRect().height || 120);
        // SVG 腳底在 viewBox y=105；元素中心為 y=60，因此腳底比中心低 45/120 個高度。
        const footOffsetFromCenter = playerHeight * (45 / 120);
        const bottomPadding = 4;
        const centerY = sceneHeight - bottomPadding - footOffsetFromCenter;
        return Math.max(90, Math.min(97, (centerY / sceneHeight) * 100));
    }


    function getPlayerLeftXPercent() {
        const sceneWidth = Math.max(1, scene3.clientWidth || 1000);
        const playerWidth = Math.max(1, stickman.getBoundingClientRect().width || 80);
        const leftPadding = 5;
        const centerX = leftPadding + playerWidth / 2;
        return Math.max(4.5, Math.min(10, (centerX / sceneWidth) * 100));
    }

    function setBossExpression(expressionName) {
        const boss = document.getElementById('scene3-boss');
        if (!boss) return;
        boss.querySelectorAll('.boss-expression').forEach(face => {
            face.classList.toggle('active', face.dataset.expression === expressionName);
        });
    }

    function setBossUiLocked(locked) {
        const buttons = [
            document.getElementById('inventory-manual-btn'),
            document.getElementById('inventory-backpack-btn')
        ];
        buttons.forEach(button => {
            if (!button) return;
            button.disabled = locked;
            button.style.pointerEvents = locked ? 'none' : '';
            button.style.opacity = locked ? '0.45' : '';
        });
    }

    let bossAmbientEmitterTimer = null;
    let bossAmbientEmitterMode = 'arrival';
    let bossAmbientEmitterActive = false;

    function buildBossParticleFields() {
        const suctionField = document.getElementById('boss-suction-field');
        const stormSnowField = document.getElementById('boss-storm-snow-field');
        const windField = document.getElementById('boss-wind-streak-field');
        const dustField = document.getElementById('boss-wind-dust-field');

        if (suctionField && suctionField.childElementCount === 0) {
            const suctionRect = suctionField.getBoundingClientRect();
            const suctionWidth = suctionRect.width || 520;
            const suctionHeight = suctionRect.height || 520;
            for (let i = 0; i < 28; i++) {
                const particle = document.createElement('span');
                particle.className = 'boss-suction-particle';
                const startX = 3 + Math.random() * 94;
                const startY = 5 + Math.random() * 90;
                particle.style.setProperty('--suction-x', `${startX}%`);
                particle.style.setProperty('--suction-y', `${startY}%`);
                particle.style.setProperty('--suction-size', `${2 + Math.random() * 4}px`);
                particle.style.setProperty('--suction-duration', `${0.55 + Math.random() * 0.6}s`);
                particle.style.setProperty('--suction-delay', `${-Math.random() * 1.2}s`);
                particle.style.setProperty('--suction-dx', `${((50 - startX) / 100) * suctionWidth}px`);
                particle.style.setProperty('--suction-dy', `${((55 - startY) / 100) * suctionHeight}px`);
                suctionField.appendChild(particle);
            }
        }

        if (stormSnowField && stormSnowField.childElementCount === 0) {
            for (let i = 0; i < 96; i++) {
                const particle = document.createElement('span');
                particle.className = 'boss-storm-snow';
                particle.style.setProperty('--storm-x', `${-28 + Math.random() * 156}%`);
                particle.style.setProperty('--storm-y', `${-48 + Math.random() * 142}%`);
                particle.style.setProperty('--storm-size', `${1.4 + Math.random() * 5.2}px`);
                particle.style.setProperty('--storm-duration', `${0.55 + Math.random() * 0.72}s`);
                particle.style.setProperty('--storm-delay', `${-Math.random() * 1.4}s`);
                particle.style.setProperty('--storm-opacity', `${0.28 + Math.random() * 0.7}`);
                stormSnowField.appendChild(particle);
            }
        }

        if (windField && windField.childElementCount === 0) {
            for (let i = 0; i < 48; i++) {
                const streak = document.createElement('span');
                streak.className = 'boss-wind-streak';
                streak.style.setProperty('--wind-x', `${-30 + Math.random() * 158}%`);
                streak.style.setProperty('--wind-y', `${-46 + Math.random() * 145}%`);
                streak.style.setProperty('--wind-length', `${18 + Math.random() * 48}vw`);
                streak.style.setProperty('--wind-thickness', `${1 + Math.random() * 4.2}px`);
                streak.style.setProperty('--wind-duration', `${0.38 + Math.random() * 0.5}s`);
                streak.style.setProperty('--wind-delay', `${-Math.random() * 1.1}s`);
                streak.style.setProperty('--wind-opacity', `${0.24 + Math.random() * 0.7}`);
                windField.appendChild(streak);
            }
        }

        if (dustField && dustField.childElementCount === 0) {
            for (let i = 0; i < 58; i++) {
                const dust = document.createElement('span');
                dust.className = 'boss-wind-dust';
                dust.style.setProperty('--dust-x', `${-24 + Math.random() * 150}%`);
                dust.style.setProperty('--dust-y', `${-38 + Math.random() * 136}%`);
                dust.style.setProperty('--dust-size', `${1.3 + Math.random() * 4.8}px`);
                dust.style.setProperty('--dust-duration', `${0.48 + Math.random() * 0.8}s`);
                dust.style.setProperty('--dust-delay', `${-Math.random() * 1.45}s`);
                dust.style.setProperty('--dust-opacity', `${0.3 + Math.random() * 0.62}`);
                dustField.appendChild(dust);
            }
        }
    }

    function animateBossTransient(element, keyframes, options) {
        if (!element) return;
        const duration = Number(options?.duration) || 1000;
        if (typeof element.animate !== 'function') {
            setTimeout(() => element.remove(), duration + 80);
            return;
        }
        const animation = element.animate(keyframes, options);
        animation.finished.catch(() => {}).finally(() => element.remove());
    }

    function getBossVisualMetrics() {
        const stage = document.getElementById('scene3-stage');
        const visual = document.getElementById('scene3-boss-svg');
        if (!stage || !visual) return null;
        const stageRect = stage.getBoundingClientRect();
        const visualRect = visual.getBoundingClientRect();
        if (!visualRect.width || !visualRect.height) return null;
        return {
            stageRect,
            visualRect,
            x: visualRect.left - stageRect.left + visualRect.width / 2,
            y: visualRect.top - stageRect.top + visualRect.height / 2,
            width: visualRect.width,
            height: visualRect.height
        };
    }

    function spawnBossAmbientFrost(mode = bossAmbientEmitterMode) {
        if (!isCurrentScene3Instance()) return;
        const layer = document.getElementById('boss-ambient-particle-layer');
        const metrics = getBossVisualMetrics();
        if (!layer || !metrics || layer.childElementCount > 170) return;

        const expandedMargin = Math.max(metrics.width, metrics.height) * 0.7;
        if (
            metrics.x < -expandedMargin ||
            metrics.x > metrics.stageRect.width + expandedMargin ||
            metrics.y < -expandedMargin ||
            metrics.y > metrics.stageRect.height + expandedMargin
        ) return;

        const isShard = Math.random() < 0.32;
        const particle = document.createElement('span');
        particle.className = isShard ? 'boss-ambient-frost-shard' : 'boss-ambient-frost-mote';

        const angle = Math.random() * Math.PI * 2;
        const radialX = metrics.width * (0.18 + Math.random() * 0.34);
        const radialY = metrics.height * (0.14 + Math.random() * 0.3);
        const startX = metrics.x + Math.cos(angle) * radialX;
        const startY = metrics.y + Math.sin(angle) * radialY;
        const size = isShard ? 3 + Math.random() * 6 : 1.8 + Math.random() * 5;
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        particle.style.width = `${size}px`;
        particle.style.height = `${isShard ? size * 1.55 : size}px`;
        layer.appendChild(particle);

        const modePower = mode === 'depart' ? 1.35 : mode === 'arrival' ? 1.18 : mode === 'blow' ? 1.24 : 1;
        const outward = (28 + Math.random() * 90) * modePower;
        const tangent = (-34 + Math.random() * 68) * modePower;
        const fall = (34 + Math.random() * 120) * (mode === 'depart' ? 0.72 : 1);
        const dx = Math.cos(angle) * outward - Math.sin(angle) * tangent;
        const dy = Math.sin(angle) * outward + Math.cos(angle) * tangent + fall;
        const swayA = -24 + Math.random() * 48;
        const swayB = -32 + Math.random() * 64;
        const rotation = -80 + Math.random() * 160;
        const duration = (mode === 'depart' ? 1550 : 1900) + Math.random() * 1900;
        const peakOpacity = 0.42 + Math.random() * 0.56;

        animateBossTransient(particle, [
            {
                offset: 0,
                transform: `translate3d(0, 0, 0) rotate(${rotation}deg) scale(0.2)`,
                opacity: 0
            },
            {
                offset: 0.16,
                transform: `translate3d(${swayA * 0.18}px, ${-8 - Math.random() * 12}px, 0) rotate(${rotation + 50}deg) scale(1)`,
                opacity: peakOpacity
            },
            {
                offset: 0.42,
                transform: `translate3d(${dx * 0.28 + swayA}px, ${dy * 0.2 - 14}px, 0) rotate(${rotation + 125}deg) scale(0.92)`,
                opacity: peakOpacity * 0.92
            },
            {
                offset: 0.68,
                transform: `translate3d(${dx * 0.62 + swayB}px, ${dy * 0.56}px, 0) rotate(${rotation + 230}deg) scale(0.78)`,
                opacity: peakOpacity * 0.68
            },
            {
                offset: 1,
                transform: `translate3d(${dx}px, ${dy}px, 0) rotate(${rotation + 390}deg) scale(0.25)`,
                opacity: 0
            }
        ], {
            duration,
            easing: 'cubic-bezier(0.16, 0.62, 0.22, 1)',
            fill: 'forwards'
        });
    }

    function startBossAmbientEmitter(mode = 'hover') {
        bossAmbientEmitterMode = mode;
        bossAmbientEmitterActive = true;
        if (bossAmbientEmitterTimer !== null) return;

        for (let i = 0; i < 18; i++) {
            setTimeout(() => spawnBossAmbientFrost(mode), i * 22);
        }

        bossAmbientEmitterTimer = window.setInterval(() => {
            if (!isCurrentScene3Instance() || !bossAmbientEmitterActive) {
                if (bossAmbientEmitterTimer !== null) {
                    clearInterval(bossAmbientEmitterTimer);
                    bossAmbientEmitterTimer = null;
                }
                return;
            }
            const amount = bossAmbientEmitterMode === 'depart' ? 3 : bossAmbientEmitterMode === 'arrival' ? 2 : 1 + (Math.random() < 0.42 ? 1 : 0);
            for (let i = 0; i < amount; i++) spawnBossAmbientFrost(bossAmbientEmitterMode);
        }, 58);
    }

    function setBossAmbientMode(mode) {
        bossAmbientEmitterMode = mode;
        if (!bossAmbientEmitterActive) startBossAmbientEmitter(mode);
    }

    function stopBossAmbientEmitter(clearAfterMs = 4200) {
        bossAmbientEmitterActive = false;
        if (bossAmbientEmitterTimer !== null) {
            clearInterval(bossAmbientEmitterTimer);
            bossAmbientEmitterTimer = null;
        }
        const layer = document.getElementById('boss-ambient-particle-layer');
        if (layer && clearAfterMs >= 0) {
            setTimeout(() => {
                if (layer.isConnected) layer.replaceChildren();
            }, clearAfterMs);
        }
    }

    function spawnBossTeleportBurst(kind = 'arrival', intensity = 1) {
        const layer = document.getElementById('boss-teleport-layer');
        const metrics = getBossVisualMetrics();
        if (!layer || !metrics) return;
        const departing = kind.includes('depart') || kind.includes('exit');
        const travelAngle = departing ? -45 : 135;

        for (let i = 0; i < 2; i++) {
            const ring = document.createElement('span');
            ring.className = 'boss-teleport-ring';
            ring.style.left = `${metrics.x - 43}px`;
            ring.style.top = `${metrics.y - 43}px`;
            layer.appendChild(ring);
            animateBossTransient(ring, [
                { transform: 'scale(0.18)', opacity: 0 },
                { offset: 0.18, transform: 'scale(0.72)', opacity: 0.95 },
                { transform: `scale(${3.4 + i * 0.75})`, opacity: 0 }
            ], {
                duration: 520 + i * 150,
                delay: i * 80,
                easing: 'cubic-bezier(0.08, 0.78, 0.18, 1)',
                fill: 'forwards'
            });
        }

        for (let i = 0; i < Math.round(12 * intensity); i++) {
            const slash = document.createElement('span');
            slash.className = 'boss-teleport-slash';
            const width = 70 + Math.random() * 180;
            const angle = travelAngle + (-16 + Math.random() * 32);
            const offsetX = -metrics.width * 0.28 + Math.random() * metrics.width * 0.56;
            const offsetY = -metrics.height * 0.25 + Math.random() * metrics.height * 0.5;
            slash.style.left = `${metrics.x + offsetX - width / 2}px`;
            slash.style.top = `${metrics.y + offsetY}px`;
            slash.style.width = `${width}px`;
            layer.appendChild(slash);
            animateBossTransient(slash, [
                { transform: `rotate(${angle}deg) scaleX(0.08)`, opacity: 0 },
                { offset: 0.24, transform: `rotate(${angle}deg) scaleX(1.1)`, opacity: 0.92 },
                { transform: `translate3d(${departing ? 90 : -90}px, ${departing ? -90 : 90}px, 0) rotate(${angle}deg) scaleX(1.65)`, opacity: 0 }
            ], {
                duration: 360 + Math.random() * 360,
                delay: Math.random() * 150,
                easing: 'cubic-bezier(0.16, 0.74, 0.18, 1)',
                fill: 'forwards'
            });
        }

        for (let i = 0; i < Math.round(18 * intensity); i++) {
            const spark = document.createElement('span');
            spark.className = 'boss-teleport-spark';
            const size = 2 + Math.random() * 5;
            spark.style.left = `${metrics.x}px`;
            spark.style.top = `${metrics.y}px`;
            spark.style.width = `${size}px`;
            spark.style.height = `${size}px`;
            layer.appendChild(spark);
            const angle = Math.random() * Math.PI * 2;
            const distance = 45 + Math.random() * 170;
            animateBossTransient(spark, [
                { transform: 'translate3d(0,0,0) scale(0.2)', opacity: 0 },
                { offset: 0.18, transform: `translate3d(${Math.cos(angle) * distance * 0.18}px, ${Math.sin(angle) * distance * 0.18}px, 0) scale(1)`, opacity: 1 },
                { transform: `translate3d(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px, 0) scale(0.1)`, opacity: 0 }
            ], {
                duration: 520 + Math.random() * 520,
                easing: 'cubic-bezier(0.12, 0.72, 0.18, 1)',
                fill: 'forwards'
            });
        }
    }

    function spawnBossTeleportTrail(velocityX, velocityY, intensity = 1) {
        const layer = document.getElementById('boss-teleport-layer');
        const metrics = getBossVisualMetrics();
        if (!layer || !metrics) return;
        const speed = Math.max(1, Math.hypot(velocityX, velocityY));
        const angle = Math.atan2(velocityY, velocityX) * 180 / Math.PI;
        const count = speed > 12 ? 3 : 2;

        for (let i = 0; i < count; i++) {
            const slash = document.createElement('span');
            slash.className = 'boss-teleport-slash';
            const width = (70 + Math.min(250, speed * 11) + Math.random() * 90) * intensity;
            const jitterX = -metrics.width * 0.24 + Math.random() * metrics.width * 0.48;
            const jitterY = -metrics.height * 0.22 + Math.random() * metrics.height * 0.44;
            slash.style.left = `${metrics.x + jitterX - width / 2}px`;
            slash.style.top = `${metrics.y + jitterY}px`;
            slash.style.width = `${width}px`;
            layer.appendChild(slash);
            const trailX = -velocityX * (4 + Math.random() * 3);
            const trailY = -velocityY * (4 + Math.random() * 3);
            animateBossTransient(slash, [
                { transform: `rotate(${angle}deg) scaleX(0.12)`, opacity: 0 },
                { offset: 0.24, transform: `rotate(${angle}deg) scaleX(1)`, opacity: 0.78 },
                { transform: `translate3d(${trailX}px, ${trailY}px, 0) rotate(${angle}deg) scaleX(1.5)`, opacity: 0 }
            ], {
                duration: 300 + Math.random() * 260,
                easing: 'cubic-bezier(0.08, 0.7, 0.16, 1)',
                fill: 'forwards'
            });
        }
    }

    async function animateElementAndCommit(element, keyframes, options) {
        if (!element || !isCurrentScene3Instance()) return;
        const lastFrame = keyframes[keyframes.length - 1] || {};

        if (typeof element.animate !== 'function') {
            if (lastFrame.transform !== undefined) element.style.transform = lastFrame.transform;
            if (lastFrame.opacity !== undefined) element.style.opacity = String(lastFrame.opacity);
            await waitBossTimeline(options.duration || 0);
            return;
        }

        const animation = element.animate(keyframes, { ...options, fill: 'forwards' });
        try {
            await animation.finished;
        } catch (error) {
            // 動畫在場景重建時可能被瀏覽器取消；這不是執行錯誤。
        }

        if (!isCurrentScene3Instance()) return;
        if (lastFrame.transform !== undefined) element.style.transform = lastFrame.transform;
        if (lastFrame.opacity !== undefined) element.style.opacity = String(lastFrame.opacity);
        animation.cancel();
    }


    function bossClamp01(value) {
        return Math.max(0, Math.min(1, value));
    }

    function bossEaseInOutSine(value) {
        return -(Math.cos(Math.PI * bossClamp01(value)) - 1) / 2;
    }

    function bossEaseInCubic(value) {
        const t = bossClamp01(value);
        return t * t * t;
    }

    function bossEaseOutQuint(value) {
        const t = bossClamp01(value);
        return 1 - Math.pow(1 - t, 5);
    }

    function bossEaseOutBack(value, overshoot = 1.22) {
        const t = bossClamp01(value) - 1;
        return 1 + (overshoot + 1) * t * t * t + overshoot * t * t;
    }

    function bossSmoothstep(edge0, edge1, value) {
        if (edge0 === edge1) return value >= edge1 ? 1 : 0;
        const t = bossClamp01((value - edge0) / (edge1 - edge0));
        return t * t * (3 - 2 * t);
    }

    function bossCubicBezierPoint(p0, p1, p2, p3, t) {
        const u = 1 - t;
        const uu = u * u;
        const tt = t * t;
        return {
            x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
            y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y
        };
    }

    /**
     * 單一連續三次貝茲曲線飛行：沒有離散節點換段，速度、旋轉與縮放都逐幀連續。
     * enter：右上方自然盤旋進場；exit：先蓄力後加速飛向右上方。
     */
    async function animateBossCinematicFlight(element, mode, stageWidth, stageHeight) {
        if (!element || !isCurrentScene3Instance()) return;

        const entering = mode === 'enter';
        const duration = entering ? 2680 : 1980;
        const chargeEnd = entering ? 0.24 : 0.31;
        const dashEnd = entering ? 0.69 : 1;
        const start = entering
            ? { x: stageWidth * 0.44, y: -stageHeight * 0.46 }
            : { x: 0, y: 0 };
        const overshoot = entering
            ? { x: -stageWidth * 0.036, y: stageHeight * 0.03 }
            : { x: 0, y: 0 };
        const exitEnd = { x: stageWidth * 0.74, y: -stageHeight * 0.8 };

        let chargeBurstDone = false;
        let dashBurstDone = false;
        let arrivalBurstDone = false;
        let lastTrailTime = 0;
        let previousX = start.x;
        let previousY = start.y;
        const startTime = performance.now();

        await new Promise(resolve => {
            const frame = now => {
                if (!isCurrentScene3Instance()) {
                    resolve();
                    return;
                }

                const raw = bossClamp01((now - startTime) / duration);
                let x = 0;
                let y = 0;
                let rotation = 0;
                let scaleX = 1;
                let scaleY = 1;
                let opacity = 1;
                let inDash = false;

                if (entering) {
                    if (raw < chargeEnd) {
                        const q = bossEaseInOutSine(raw / chargeEnd);
                        const chargePulse = Math.sin(q * Math.PI * 5) * (1 - q) * 0.45;
                        x = start.x - stageWidth * 0.022 * q + stageWidth * 0.006 * chargePulse;
                        y = start.y + stageHeight * 0.026 * q - stageHeight * 0.007 * chargePulse;
                        rotation = 43 - 16 * q + chargePulse * 10;
                        scaleX = 0.13 + 0.28 * q + chargePulse * 0.04;
                        scaleY = 0.21 + 0.16 * q - chargePulse * 0.05;
                        opacity = bossSmoothstep(0.01, 0.52, q) * (0.78 + Math.sin(q * Math.PI * 4) * 0.12);

                        if (!chargeBurstDone && q > 0.18) {
                            chargeBurstDone = true;
                            spawnBossTeleportBurst('arrival-charge', 0.9);
                        }
                    } else if (raw < dashEnd) {
                        inDash = true;
                        const q = bossClamp01((raw - chargeEnd) / (dashEnd - chargeEnd));
                        const pathT = q * q * (3 - 2 * q);
                        const p0 = { x: start.x - stageWidth * 0.022, y: start.y + stageHeight * 0.026 };
                        const p1 = { x: stageWidth * 0.35, y: -stageHeight * 0.42 };
                        const p2 = { x: stageWidth * 0.035, y: -stageHeight * 0.055 };
                        const p3 = overshoot;
                        const pos = bossCubicBezierPoint(p0, p1, p2, p3, pathT);
                        x = pos.x;
                        y = pos.y;
                        rotation = 27 - 36 * pathT + Math.sin(q * Math.PI * 2) * 3.5;
                        scaleX = 0.41 + 0.7 * bossEaseOutQuint(q);
                        scaleY = 0.37 + 0.66 * bossEaseOutQuint(q);
                        opacity = 0.82 + Math.sin(q * Math.PI * 6) * 0.08 + q * 0.1;

                        if (!dashBurstDone) {
                            dashBurstDone = true;
                            spawnBossTeleportBurst('arrival-dash', 1.15);
                        }
                    } else {
                        const q = bossClamp01((raw - dashEnd) / (1 - dashEnd));
                        const decay = Math.exp(-5.4 * q);
                        const oscillation = Math.cos(q * Math.PI * 6.4) * decay;
                        x = overshoot.x * (1 - q) + stageWidth * 0.026 * oscillation;
                        y = overshoot.y * (1 - q) - stageHeight * 0.021 * oscillation;
                        rotation = -9 * (1 - q) + 5.5 * oscillation;
                        scaleX = 1 + 0.11 * oscillation;
                        scaleY = 1 - 0.075 * oscillation;
                        opacity = 1;

                        if (!arrivalBurstDone && q > 0.08) {
                            arrivalBurstDone = true;
                            spawnBossTeleportBurst('arrival-lock', 1.3);
                        }
                    }
                } else {
                    if (raw < chargeEnd) {
                        const q = bossEaseInOutSine(raw / chargeEnd);
                        const pulse = Math.sin(q * Math.PI * 6) * (1 - q) * 0.28;
                        x = -stageWidth * 0.05 * q + stageWidth * 0.004 * pulse;
                        y = stageHeight * 0.058 * q - stageHeight * 0.004 * pulse;
                        rotation = -7 * q + pulse * 8;
                        scaleX = 1 + 0.11 * q + pulse * 0.03;
                        scaleY = 1 - 0.07 * q - pulse * 0.025;
                        opacity = 1;

                        if (!chargeBurstDone && q > 0.22) {
                            chargeBurstDone = true;
                            spawnBossTeleportBurst('depart-charge', 1.1);
                        }
                    } else {
                        inDash = true;
                        const q = bossClamp01((raw - chargeEnd) / (1 - chargeEnd));
                        const pathT = q * q * q;
                        const p0 = { x: -stageWidth * 0.05, y: stageHeight * 0.058 };
                        const p1 = { x: stageWidth * 0.02, y: -stageHeight * 0.015 };
                        const p2 = { x: stageWidth * 0.38, y: -stageHeight * 0.48 };
                        const p3 = exitEnd;
                        const pos = bossCubicBezierPoint(p0, p1, p2, p3, pathT);
                        x = pos.x;
                        y = pos.y;
                        rotation = -7 + 70 * pathT;
                        scaleX = 1.11 - 0.92 * pathT;
                        scaleY = 0.93 - 0.75 * pathT;
                        opacity = 1 - bossSmoothstep(0.67, 1, q);

                        if (!dashBurstDone) {
                            dashBurstDone = true;
                            spawnBossTeleportBurst('depart-dash', 1.35);
                        }
                    }
                }

                element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${Math.max(0.15, scaleX)}, ${Math.max(0.15, scaleY)})`;
                element.style.opacity = String(bossClamp01(opacity));

                if (inDash && now - lastTrailTime > 38) {
                    const velocityX = x - previousX;
                    const velocityY = y - previousY;
                    spawnBossTeleportTrail(velocityX, velocityY, entering ? 1 : 1.18);
                    lastTrailTime = now;
                }
                previousX = x;
                previousY = y;

                if (raw < 1) {
                    requestAnimationFrame(frame);
                } else {
                    element.style.transform = entering
                        ? 'translate3d(0, 0, 0) rotate(0deg) scale(1, 1)'
                        : `translate3d(${exitEnd.x}px, ${exitEnd.y}px, 0) rotate(63deg) scale(0.16, 0.16)`;
                    element.style.opacity = entering ? '1' : '0';
                    resolve();
                }
            };

            requestAnimationFrame(frame);
        });
    }

    function bossCatmullRom(p0, p1, p2, p3, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        return 0.5 * (
            (2 * p1) +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t3
        );
    }

    function sampleBossFlightSpline(points, progress) {
        const lastIndex = points.length - 1;
        if (lastIndex <= 0) return points[0] || { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 };

        const scaled = bossClamp01(progress) * lastIndex;
        const segment = Math.min(lastIndex - 1, Math.floor(scaled));
        const localT = scaled - segment;
        const p0 = points[Math.max(0, segment - 1)];
        const p1 = points[segment];
        const p2 = points[Math.min(lastIndex, segment + 1)];
        const p3 = points[Math.min(lastIndex, segment + 2)];

        const sample = key => bossCatmullRom(p0[key], p1[key], p2[key], p3[key], localT);
        return {
            x: sample('x'),
            y: sample('y'),
            scale: sample('scale'),
            rotation: sample('rotation'),
            opacity: bossClamp01(sample('opacity'))
        };
    }

    function waitForNextBossPaint() {
        return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }

    /**
     * 使用 requestAnimationFrame + Catmull-Rom 曲線逐幀飛行。
     * 不依賴離散 CSS 圖片切換，因此進場與離場都會保持連續速度與連續旋轉。
     */
    async function animateBossFlightSmooth(element, points, duration, options = {}) {
        if (!element || !isCurrentScene3Instance()) return;
        const easing = options.easing || bossEaseInOutSine;
        const wobbleX = Number(options.wobbleX) || 0;
        const wobbleY = Number(options.wobbleY) || 0;
        const wobbleTurns = Number(options.wobbleTurns) || 2.6;
        const startTime = performance.now();

        await new Promise(resolve => {
            const frame = now => {
                if (!isCurrentScene3Instance()) {
                    resolve();
                    return;
                }

                const rawProgress = bossClamp01((now - startTime) / duration);
                const pathProgress = easing(rawProgress);
                const state = sampleBossFlightSpline(points, pathProgress);
                const wobbleEnvelope = Math.sin(Math.PI * rawProgress) * (1 - rawProgress * 0.35);
                const phase = rawProgress * Math.PI * 2 * wobbleTurns;
                const naturalX = Math.sin(phase + 0.55) * wobbleX * wobbleEnvelope;
                const naturalY = Math.sin(phase * 0.73 + 1.2) * wobbleY * wobbleEnvelope;

                element.style.transform = `translate3d(${state.x + naturalX}px, ${state.y + naturalY}px, 0) rotate(${state.rotation}deg) scale(${state.scale})`;
                element.style.opacity = String(state.opacity);

                if (rawProgress < 1) {
                    requestAnimationFrame(frame);
                } else {
                    const finalState = points[points.length - 1];
                    element.style.transform = `translate3d(${finalState.x}px, ${finalState.y}px, 0) rotate(${finalState.rotation}deg) scale(${finalState.scale})`;
                    element.style.opacity = String(finalState.opacity);
                    resolve();
                }
            };
            requestAnimationFrame(frame);
        });
    }

    function playProceduralBossWind(durationMs = 2100) {
        const slider = document.getElementById('volumeSlider');
        const volume = slider ? Number(slider.value) / 100 : 1;
        if (!volume || volume <= 0) return;

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        try {
            const context = new AudioContextClass();
            if (context.state === 'suspended') context.resume().catch(() => {});

            const duration = durationMs / 1000;
            const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
            const data = buffer.getChannelData(0);
            let previous = 0;
            for (let i = 0; i < data.length; i++) {
                const whiteNoise = Math.random() * 2 - 1;
                previous = previous * 0.82 + whiteNoise * 0.18;
                const progress = i / data.length;
                const envelope = Math.sin(Math.PI * Math.min(1, progress * 1.2));
                data[i] = previous * envelope;
            }

            const source = context.createBufferSource();
            const lowPass = context.createBiquadFilter();
            const gain = context.createGain();
            source.buffer = buffer;
            lowPass.type = 'lowpass';
            lowPass.frequency.setValueAtTime(900, context.currentTime);
            lowPass.frequency.exponentialRampToValueAtTime(360, context.currentTime + duration);
            gain.gain.setValueAtTime(0.0001, context.currentTime);
            gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * 0.42), context.currentTime + 0.12);
            gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

            source.connect(lowPass);
            lowPass.connect(gain);
            gain.connect(context.destination);
            source.start();
            source.stop(context.currentTime + duration);
            setTimeout(() => context.close().catch(() => {}), durationMs + 350);
        } catch (error) {
            console.log('Boss wind SFX unavailable:', error);
        }
    }

    async function pushPlayerToBottomByWind(duration = 2050) {
        if (!isCurrentScene3Instance()) return;

        const sceneRect = scene3.getBoundingClientRect();
        const playerRect = stickman.getBoundingClientRect();
        const sceneWidth = Math.max(1, sceneRect.width || scene3.clientWidth || 1000);
        const sceneHeight = Math.max(1, sceneRect.height || scene3.clientHeight || 600);

        const startXPx = playerRect.left - sceneRect.left + playerRect.width / 2;
        const startYPx = playerRect.top - sceneRect.top + playerRect.height / 2;
        const finalX = getPlayerLeftXPercent();
        const finalY = getPlayerBottomYPercent();
        const finalXPx = sceneWidth * finalX / 100;
        const finalYPx = sceneHeight * finalY / 100;

        const deltaX = finalXPx - startXPx;
        const deltaY = finalYPx - startYPx;
        const availableDiagonal = Math.max(0, Math.min(Math.abs(deltaX), Math.abs(deltaY)));
        const diagonalReach = availableDiagonal * 0.82;

        /*
           三次貝茲曲線的起始與結束切線都設定成左下 45°：
           P1 = P0 + (-d, +d)，P2 = P3 + (+d, -d)。
           因此角色不是先斜飛、再突然垂直落下，而是一路順暢滾進左下角。
        */
        const p0 = { x: startXPx, y: startYPx };
        const p1 = { x: startXPx - diagonalReach, y: startYPx + diagonalReach };
        const p2 = {
            x: finalXPx + diagonalReach * 0.38,
            y: finalYPx - diagonalReach * 0.38
        };
        const p3 = { x: finalXPx, y: finalYPx };

        const toLeftPercent = x => `${bossClamp01(x / sceneWidth) * 100}%`;
        const toTopPercent = y => `${bossClamp01(y / sceneHeight) * 100}%`;
        const playerFrames = [];
        const frameCount = 32;

        for (let i = 0; i < frameCount; i++) {
            const t = i / (frameCount - 1);
            const point = bossCubicBezierPoint(p0, p1, p2, p3, t);
            const impactGlow = 1 + Math.sin(Math.PI * t) * 0.34;
            playerFrames.push({
                offset: t,
                left: toLeftPercent(point.x),
                top: toTopPercent(point.y),
                filter: `brightness(${impactGlow.toFixed(3)})`
            });
        }

        stickman.classList.add('boss-wind-pushed', 'stand-still', 'player-tumble');

        let playerAnimation = null;
        if (typeof stickman.animate === 'function') {
            playerAnimation = stickman.animate(playerFrames, {
                duration,
                easing: 'cubic-bezier(0.14, 0.78, 0.18, 1)',
                fill: 'forwards'
            });
        }

        // 同步把世界攝影機拉回左端，Timeline 結束後角色不會瞬間跳回 20%。
        let environmentAnimation = null;
        const originalCameraX = cameraX;
        if (typeof environmentLayer.animate === 'function' && originalCameraX > 0.01) {
            environmentAnimation = environmentLayer.animate([
                { offset: 0, transform: `translate(${-originalCameraX}%, 0%)` },
                { offset: 0.42, transform: `translate(${-originalCameraX * 0.74}%, 0%)` },
                { offset: 0.76, transform: `translate(${-originalCameraX * 0.26}%, 0%)` },
                { offset: 1, transform: 'translate(0%, 0%)' }
            ], {
                duration,
                easing: 'cubic-bezier(0.18, 0.74, 0.22, 1)',
                fill: 'forwards'
            });
        }

        if (playerAnimation) {
            try {
                await playerAnimation.finished;
            } catch (error) {
                // 場景切換會取消動畫，屬正常清理流程。
            }
        } else {
            await waitBossTimeline(duration);
        }

        if (!isCurrentScene3Instance()) return;
        if (playerAnimation) playerAnimation.cancel();
        if (environmentAnimation) environmentAnimation.cancel();

        worldX = finalX;
        cameraX = 0;
        py = finalY;
        facing = 1; // 落地後面向仍停在右上方的 BOSS。
        stickman.style.left = `${finalX}%`;
        stickman.style.top = `${finalY}%`;
        stickman.style.transform = `translate(-50%, -50%) scaleX(${facing})`;
        stickman.style.filter = '';
        environmentLayer.style.transform = 'translate(0%, 0%)';

        stickman.classList.remove('player-tumble', 'boss-wind-pushed');
        stickman.classList.add('boss-wind-landed', 'stand-still');
        await waitBossTimeline(270);
        if (!isCurrentScene3Instance()) return;
        stickman.classList.remove('boss-wind-landed');
    }


    function checkBossTimelineReady() {
        if (bossTimelineStarted || bossTimelineRunning || bossTimelineCompleted || !isCurrentScene3Instance()) return;
        if (bossTimelineCheckTimer) clearTimeout(bossTimelineCheckTimer);

        bossTimelineCheckTimer = setTimeout(() => {
            bossTimelineCheckTimer = null;
            if (!isCurrentScene3Instance() || bossTimelineStarted) return;

            const allEnemiesDefeated = enemies.length > 0 && enemies.every(enemy => !enemy.alive);
            const noWorldLootLeft = scene3.querySelectorAll('.loot-drop-item:not(.picked)').length === 0;
            const tutorialFinished = !readyToPickUpTriangle && !scene3.querySelector('#first-kill-container');
            const noBlockingUi = !backpackIsOpen && !scene3.querySelector('#backpack-overlay') && !manualModal.classList.contains('manual-active');

            if (
                smallEnemyKills >= TOTAL_SMALL_ENEMIES &&
                collectedTriangleLoot >= TOTAL_TRIANGLE_LOOT &&
                allEnemiesDefeated &&
                noWorldLootLeft &&
                tutorialFinished &&
                noBlockingUi
            ) {
                runBossArrivalTimeline().catch(error => {
                    console.error('Scene 3 boss timeline failed:', error);
                    if (!isCurrentScene3Instance()) return;
                    bossTimelineRunning = false;
                    isPlayerControllable = true;
                    canAttack = true;
                    stopBossAmbientEmitter(0);
                    const failedWindLayer = document.getElementById('boss-wind-layer');
                    const failedStage = document.getElementById('scene3-stage');
                    if (failedWindLayer) failedWindLayer.classList.remove('active');
                    if (failedStage) failedStage.classList.remove('boss-wind-shake');
                    stickman.classList.remove('player-tumble', 'boss-wind-pushed');
                    setBossUiLocked(false);
                });
            }
        }, 380);
    }

    async function runBossArrivalTimeline() {
        if (bossTimelineStarted || bossTimelineRunning || !isCurrentScene3Instance()) return;

        bossTimelineStarted = true;
        bossTimelineRunning = true;
        bossTimelineCompleted = false;
        isPlayerControllable = false;
        canAttack = false;
        isPlayerAttacking = false;
        clearMovementKeys();
        stickman.classList.remove('anim-attack');
        stickman.classList.add('stand-still');
        setBossUiLocked(true);

        const boss = document.getElementById('scene3-boss');
        const flightShell = document.getElementById('boss-flight-shell');
        const windLayer = document.getElementById('boss-wind-layer');
        const stage = document.getElementById('scene3-stage');
        const barrier = document.getElementById('pla-glass-barrier');
        if (!boss || !flightShell || !windLayer || !stage) {
            bossTimelineStarted = false;
            bossTimelineRunning = false;
            isPlayerControllable = true;
            canAttack = true;
            setBossUiLocked(false);
            throw new Error('Scene 3 BOSS Timeline DOM is incomplete.');
        }

        if (barrier) barrier.style.opacity = '0';
        buildBossParticleFields();
        setBossExpression('arrival');

        const stageWidth = Math.max(1, stage.clientWidth || scene3.clientWidth || 1000);
        const stageHeight = Math.max(1, stage.clientHeight || scene3.clientHeight || 600);

        boss.classList.remove('departing', 'hovering', 'inhaling', 'blowing');
        flightShell.style.transform = `translate3d(${stageWidth * 0.44}px, ${-stageHeight * 0.46}px, 0) rotate(43deg) scale(0.13, 0.21)`;
        flightShell.style.opacity = '0';
        boss.classList.add('visible');
        startBossAmbientEmitter('arrival');
        await waitForNextBossPaint();
        if (!isCurrentScene3Instance()) return;

        // 蓄力 -> 連續高速瞬移 -> 阻尼停穩，全程由 requestAnimationFrame 逐幀運算。
        const arrivalPromise = animateBossCinematicFlight(flightShell, 'enter', stageWidth, stageHeight);

        await waitBossTimeline(560);
        if (!isCurrentScene3Instance()) return;
        setBossExpression('glare');

        // 保留原本進場總時長；第二張表情持續到 BOSS 完整停穩。
        await waitBossTimeline(690);
        if (!isCurrentScene3Instance()) return;

        await arrivalPromise;
        if (!isCurrentScene3Instance()) return;
        boss.classList.add('hovering');
        setBossAmbientMode('hover');
        setBossExpression('glare');

        await waitBossTimeline(620);
        if (!isCurrentScene3Instance()) return;
        setBossExpression('snarl');

        await waitBossTimeline(440);
        if (!isCurrentScene3Instance()) return;
        boss.classList.remove('hovering');
        boss.classList.add('inhaling');
        setBossAmbientMode('inhale');
        setBossExpression('inhale');

        await waitBossTimeline(1260);
        if (!isCurrentScene3Instance()) return;
        boss.classList.remove('inhaling');
        boss.classList.add('blowing');
        setBossAmbientMode('blow');
        setBossExpression('blow');
        windLayer.classList.add('active');
        stage.classList.add('boss-wind-shake');
        playProceduralBossWind(2580);

        await pushPlayerToBottomByWind(2150);
        if (!isCurrentScene3Instance()) return;
        await waitBossTimeline(340);

        windLayer.classList.remove('active');
        stage.classList.remove('boss-wind-shake');
        boss.classList.remove('blowing');
        setBossAmbientMode('hover');
        setBossExpression('smirk');

        await waitBossTimeline(650);
        if (!isCurrentScene3Instance()) return;
        boss.classList.remove('hovering');
        boss.classList.add('departing');
        setBossAmbientMode('depart');
        setBossExpression('depart');

        // 離場時保留自然冰霜發射，形成跟不上瞬移本體的獨立殘雪尾跡。
        await waitBossTimeline(260);
        if (!isCurrentScene3Instance()) return;
        await animateBossCinematicFlight(flightShell, 'exit', stageWidth, stageHeight);

        if (!isCurrentScene3Instance()) return;
        stopBossAmbientEmitter(4300); // 已生成粒子自行飄散後再清除。
        boss.classList.remove('visible', 'departing', 'hovering', 'inhaling', 'blowing');
        flightShell.style.transform = '';
        flightShell.style.opacity = '';
        setBossExpression('arrival');

        bossTimelineRunning = false;
        bossTimelineCompleted = true;
        isPlayerControllable = true;
        canAttack = true;
        clearMovementKeys();
        setBossUiLocked(false);
        stickman.classList.add('stand-still');
    }


    function handleKeyDown(e) {
        const key = e.key.toLowerCase();

        if (bossTimelineRunning) {
            if (keys.hasOwnProperty(key)) keys[key] = false;
            return;
        }

        if (keys.hasOwnProperty(key)) keys[key] = true;

        // 🌟 1. 關閉背包並恢復遊戲時間 (按 X 關閉)
        if (key === 'x' && backpackIsOpen) {
            backpackIsOpen = false;
            const overlay = document.getElementById('backpack-overlay');
            if(overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.remove();
                    
                    stickman.classList.remove('freeze-anim');
                    enemies.forEach(e => {
                        // 🌟 增加 e.alive 安全判定，防止找不到已死亡怪物的 DOM
                        if (e.alive && e.el) e.el.classList.remove('freeze-anim');
                    });
                    
                    isPlayerControllable = true;
                    isGamePaused = false;
                    totalPausedTime += (performance.now() - pauseStartTime);
                    checkBossTimelineReady();

                    let bpBtn = document.getElementById('inventory-backpack-btn');
                    if (!bpBtn) {
                        bpBtn = document.createElement('button');
                        bpBtn.id = 'inventory-backpack-btn';
                        bpBtn.className = 'control-btn'; 
                        bpBtn.title = "Backpack"; 
                        bpBtn.innerHTML = '<i class="fas fa-campground"></i>'; 
                        
                        const manualBtn = document.getElementById('inventory-manual-btn');
                        if (manualBtn && manualBtn.parentNode) {
                            manualBtn.parentNode.insertBefore(bpBtn, manualBtn); 
                        }
                        
                        bpBtn.addEventListener('click', function(event) {
                            if (bossTimelineRunning) return;
                            // 🌟 核心防呆：強制移除按鈕焦點，防止鍵盤與滑鼠事件衝突卡死！
                            this.blur(); 
                            if (document.getElementById('backpack-overlay')) return;

                            isPlayerControllable = false; 
                            isGamePaused = true;
                            pauseStartTime = performance.now();
                            
                            stickman.classList.add('freeze-anim');
                            enemies.forEach(e => {
                                if (e.alive && e.el) e.el.classList.add('freeze-anim');
                            });
                            
                            triggerBackpackAnimation(false); 
                        });

                        bpBtn.style.animation = 'iconPopIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, btnPulseShake 0.8s ease-in-out';
                        bpBtn.style.color = 'var(--brand-blue)';
                        bpBtn.style.textShadow = '0 0 8px var(--brand-blue)';
                        
                        setTimeout(() => {
                            bpBtn.style.animation = ''; 
                            bpBtn.style.color = '';
                            bpBtn.style.textShadow = '';
                        }, 1000);
                    }
                }, 300);
            }
            return;
        }

        // 🌟 2. 撿起「首殺」的特殊三角形 (僅觸發獲得背包教學，不放入任何三角怪道具)
        if (key === 'e' && readyToPickUpTriangle) {
            readyToPickUpTriangle = false;
            const lootContainer = document.getElementById('first-kill-container');
            if (lootContainer) lootContainer.remove();
            
            const sfxPickup = new Audio('game_audio/game_pickup_01.mp3');
            playActionSfx(sfxPickup);

            // 🌟 已經移除將 `{ type: 'body', count: 1 }` 存入 backpackGrid 的邏輯！
            // 現在首殺只會單純解鎖並開啟背包介面，不會有三角怪佔用第一格。

            updateMainStickmanEquipment(); // 確保雙手與裝備維持乾淨
            triggerBackpackAnimation(true); // 觸發全螢幕背包展開動畫 (首次教學模式)
            checkBossTimelineReady();
            return;
        }

        // 🌟 3. 撿起後續擊殺小怪掉落的地板物品 (按 E 拾取)
        if (key === 'e' && nearbyDropItem) {
            const item = nearbyDropItem;
            const itemType = item.dataset.type;
            
            // 播放縮小消失動畫
            item.classList.add('picked');
            item.style.transition = 'all 0.3s ease-in';
            item.style.transform = 'translate(-50%, -80%) scale(0)';
            item.style.opacity = '0';
            setTimeout(() => item.remove(), 300);
            
            nearbyDropItem = null;
            
            // 執行裝備/背包分配邏輯！
            pickUpItem(itemType);
            collectedTriangleLoot += 1;
            setTimeout(checkBossTimelineReady, 360);
            return;
        }

        if (key === 'j' && isHammerEquipped && isPlayerControllable && canAttack && !playerDead) {
            canAttack = false; 
            isPlayerAttacking = true;
            hasHitInCurrentAttack = false; 

            stickman.classList.add('anim-attack');
            
            setTimeout(() => { 
                stickman.classList.remove('anim-attack'); 
                isPlayerAttacking = false; 
            }, 400);
            
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

    let isFirstFrame = true;

    // 👇 這裡把括號內的參數改為 realTimestamp
    function gameLoopS3(realTimestamp) {
        // 場景被重新初始化後，舊的 requestAnimationFrame 迴圈立即停止。
        if (!isCurrentScene3Instance()) return;

        // 🌟 1. 時間暫停攔截器
        if (isGamePaused) {
            stickman.classList.add('stand-still');
            requestAnimationFrame(gameLoopS3);
            return; 
        }

        // 🌟 2. 時間軸平移 (扣除暫停的時間，確保解除暫停時怪物的跳躍週期不會錯亂)
        let timestamp = realTimestamp - totalPausedTime;

        if (!isPlayerControllable && !playerDead) { requestAnimationFrame(gameLoopS3); return; }
        if (playerDead) return;
        
        if (isFirstFrame) {
            enemies.forEach(e => {
                e.jumpStartTime = timestamp + e.delayMs;
                e.el.style.setProperty('--jump-delay', `${e.delayMs}ms`);
            });
            isFirstFrame = false;
        }

        let moved = false; let speedX = 0.4; let speedY = 0.3; 
        
        if (!isPlayerAttacking) {
            if (keys.w) { py -= speedY; moved = true; }
            if (keys.s) { py += speedY; moved = true; }
            if (keys.a) { worldX -= speedX; moved = true; facing = -1; }
            if (keys.d) { worldX += speedX; moved = true; facing = 1; }
        }

        // BOSS 過場前維持 Scene 1、2 的 10~90 邊界；吹氣過場結束後才保留精準底線。
        const maxPlayerY = bossTimelineCompleted ? getPlayerBottomYPercent() : 90;
        py = Math.max(10, Math.min(maxPlayerY, py)); 
        worldX = Math.max(5, worldX); 

        if (moved) stickman.classList.remove('stand-still'); else stickman.classList.add('stand-still');

        cameraX = Math.max(0, worldX - 20); 
        
        // 🌟 2. 移除動態 Y 軸攝影機，與前兩關保持一致
        let px = worldX - cameraX;
        
        stickman.style.left = `${px}%`; 
        stickman.style.top = `${py}%`;
        stickman.style.transform = `translate(-50%, -50%) scaleX(${facing})`;
        
        // 🌟 3. 恢復僅 X 軸的場景移動
        environmentLayer.style.transform = `translate(${-cameraX}%, 0%)`;

        let activeEnemies = enemies.filter(e => e.alive);

        // ==============================================================
        // 🌟 物理阻擋與光學迷彩玻璃系統 (效能優化純白版)
        // ==============================================================
        const glassBarrier = document.getElementById('pla-glass-barrier');
        if (glassBarrier) {
            const barrierActive = activeEnemies.length > 0;
            const barrierX = 104; 
            
            if (barrierActive) {
                const distToBarrier = barrierX - worldX;
                
                // 動態透明度計算
                if (distToBarrier < 35 && distToBarrier >= -5) {
                    let opacity = Math.min(1, Math.max(0, 1 - (distToBarrier / 25)));
                    glassBarrier.style.opacity = opacity.toFixed(2);
                } else {
                    glassBarrier.style.opacity = '0';
                }
                
                // 單純物理阻擋，防止穿模 (去除紅光警告)
                if (worldX > 101.5) {
                    worldX = 101.5;
                }
            } else {
                // 怪物全滅解鎖
                glassBarrier.style.opacity = '0';
            }
        }
        // ==============================================================
        // 🌟 核心修改：AND Hammer 單體攻擊與優先權判定邏輯 (大 > 中 > 小 > 距離近)
        // ==============================================================
        // 🌟 新增 !hasHitInCurrentAttack 條件，確保一槌只能打一隻
        if (isPlayerAttacking && !hasHitInCurrentAttack) {
            const hammerElement = document.getElementById('held-hammer-s3');
            if (hammerElement) {
                const hammerBox = getRect(hammerElement, 1.0);
                const hammerCenterX = (hammerBox.left + hammerBox.right) / 2;
                const hammerCenterY = (hammerBox.top + hammerBox.bottom) / 2;

                let collidingEnemies = [];

                activeEnemies.forEach(enemy => {
                    const enemyBox = getRect(enemy.el, 0.7); 
                    if (isColliding(hammerBox, enemyBox)) {
                        const enemyRect = enemy.el.getBoundingClientRect();
                        const enemyCenterX = enemyRect.left + enemyRect.width / 2;
                        const enemyCenterY = enemyRect.top + enemyRect.height / 2;
                        
                        const dist = Math.hypot(enemyCenterX - hammerCenterX, enemyCenterY - hammerCenterY);

                        let sizeRank = 1;
                        if (enemy.el.id === 'enemy-large') {
                            sizeRank = 3;
                        } else if (enemy.el.id === 'enemy-medium' || enemy.el.id.includes('enemy-medium-spawn')) {
                            sizeRank = 2;
                        }

                        collidingEnemies.push({ enemy, sizeRank, dist });
                    }
                });

                if (collidingEnemies.length > 0) {
                    collidingEnemies.sort((a, b) => {
                        if (b.sizeRank !== a.sizeRank) {
                            return b.sizeRank - a.sizeRank;
                        }
                        return a.dist - b.dist;
                    });

                    const targetEnemy = collidingEnemies[0].enemy;

                    // 🌟 命中目標了！立刻上鎖，確保剩下的 380 毫秒內即使判定框掃到其他怪也不會觸發
                    hasHitInCurrentAttack = true;

                    targetEnemy.alive = false;
                    targetEnemy.el.classList.remove('tri-jump', 'attacking');

                    const isLarge = targetEnemy.el.id === 'enemy-large';
                    const isMedium = targetEnemy.el.id === 'enemy-medium' || targetEnemy.el.id.includes('enemy-medium-spawn');

                    if (isLarge || isMedium) {
                        targetEnemy.el.style.opacity = '0'; 

                        const contClass = isLarge ? 'split-anim-container' : 'split-anim-container-sm';
                        const leftClass = isLarge ? 'split-half-left' : 'split-half-left-sm';
                        const rightClass = isLarge ? 'split-half-right' : 'split-half-right-sm';
                        const eyeLClass = isLarge ? 'split-eye-l' : 'split-eye-l-sm';
                        const eyeRClass = isLarge ? 'split-eye-r' : 'split-eye-r-sm';
                        
                        const eyeR = isLarge ? 4 : 3.5;       
                        const newEyeR = isLarge ? 3.5 : 3;  
                        const cxL = isLarge ? 57 : 54;        
                        const cxR = isLarge ? 73 : 76;        
                        const newCxL = isLarge ? 54 : 56;     
                        const newCxR = isLarge ? 76 : 74;     
                        const strokeW = isLarge ? 5 : 6;     

                        const currentSpawnId = enemySpawnCounter++; 

                        const splitHtml = `
                            <div id="split-anim-${currentSpawnId}" class="${contClass}" style="left: ${targetEnemy.worldX}%; top: ${targetEnemy.worldY}%;">
                                <svg class="${leftClass}" viewBox="0 0 130 130">
                                    <path class="split-body-l" d="M 65 30 L 65 90 L 5 90 Z" />
                                    <g class="${eyeLClass}"><circle cx="${cxL}" cy="55" r="${eyeR}" fill="#fff" /></g>
                                    <g class="split-eye-new-l"><circle cx="${newCxL}" cy="55" r="${newEyeR}" fill="#fff" /></g> 
                                    <path class="split-leg-l" d="M 65 90 L 65 105 Q 65 112 55 112" fill="none" stroke="#fff" stroke-width="${strokeW}" />
                                </svg>
                                <svg class="${rightClass}" viewBox="0 0 130 130">
                                    <path class="split-body-r" d="M 65 30 L 125 90 L 65 90 Z" />
                                    <g class="${eyeRClass}"><circle cx="${cxR}" cy="55" r="${eyeR}" fill="#fff" /></g>
                                    <g class="split-eye-new-r"><circle cx="${newCxR}" cy="55" r="${newEyeR}" fill="#fff" /></g> 
                                    <path class="split-leg-r" d="M 65 90 L 65 105 Q 65 112 75 112" fill="none" stroke="#fff" stroke-width="${strokeW}" />
                                </svg>
                            </div>
                        `;
                        environmentLayer.insertAdjacentHTML('beforeend', splitHtml);
                        const splitContainer = document.getElementById(`split-anim-${currentSpawnId}`);

                        setTimeout(() => {
                            targetEnemy.el.remove();
                            if (splitContainer) splitContainer.remove();
                            
                            const newId1 = isLarge ? `enemy-medium-spawn-${currentSpawnId}-A` : `enemy-small-spawn-${currentSpawnId}-A`;
                            const newId2 = isLarge ? `enemy-medium-spawn-${currentSpawnId}-B` : `enemy-small-spawn-${currentSpawnId}-B`;
                            
                            environmentLayer.insertAdjacentHTML('beforeend', isLarge ? getMediumEnemySVG(newId1) : getSmallEnemySVG(newId1));
                            environmentLayer.insertAdjacentHTML('beforeend', isLarge ? getMediumEnemySVG(newId2) : getSmallEnemySVG(newId2));
                            
                            const newM1 = document.getElementById(newId1);
                            const newM2 = document.getElementById(newId2);
                            
                            // 預先計算好新怪物的生成座標
                            const spawnOffsetX = isLarge ? 4 : 2;
                            const spawnX1 = targetEnemy.worldX - spawnOffsetX;
                            const spawnX2 = targetEnemy.worldX + spawnOffsetX;
                            const spawnY = targetEnemy.worldY + 1;

                            // 第一時間手動賦予初始座標
                            if (newM1) {
                                newM1.style.left = `${spawnX1}%`;
                                newM1.style.top = `${spawnY}%`;
                            }
                            if (newM2) {
                                newM2.style.left = `${spawnX2}%`;
                                newM2.style.top = `${spawnY}%`;
                            }
                            
                            // =========================================================
                            // 🌟 核心修復：校正時空！取得扣除暫停時間後的「真實遊戲時間」
                            // =========================================================
                            const currentSimTime = performance.now() - totalPausedTime;

                            enemies.push({
                                el: newM1, worldX: spawnX1, worldY: spawnY, 
                                speed: isLarge ? 0.18 : 0.25, facing: 1, alive: true, 
                                sideOffset: isLarge ? 7 : 4, attackDist: isLarge ? 0.6 : 0.5, delayMs: 0, 
                                state: 'jumping', 
                                jumpStartTime: currentSimTime, // 👈 修正這裡
                                lastAttackTime: 0, attackEndTime: 0 
                            });
                            
                            enemies.push({
                                el: newM2, worldX: spawnX2, worldY: spawnY, 
                                speed: isLarge ? 0.18 : 0.25, facing: -1, alive: true, 
                                sideOffset: isLarge ? 7 : 4, attackDist: isLarge ? 0.6 : 0.5, delayMs: 750, 
                                state: 'jumping', 
                                jumpStartTime: currentSimTime + 750, // 👈 修正這裡
                                lastAttackTime: 0, attackEndTime: 0 
                            });
                        }, 1400);

                    } else {
                        // 🌟 處理小型三角怪的死亡與掉落邏輯
                        smallEnemyKills++;
                        checkBossTimelineReady();

                        if (smallEnemyKills === 1) {
                            // ⚔️ 第 1 隻：觸發「首殺」專屬事件 (背包)
                            isPlayerControllable = false; 
                            isGamePaused = true;
                            pauseStartTime = performance.now(); 

                            stickman.classList.add('freeze-anim');
                            enemies.forEach(e => {
                                if (e.alive && e.el && e.el !== targetEnemy.el) e.el.classList.add('freeze-anim');
                            });

                            targetEnemy.el.style.display = 'none';

                            const animHtml = `
                                <div id="first-kill-container" style="position: absolute; left: ${targetEnemy.worldX}%; top: ${targetEnemy.worldY}%; width: 70px; height: 70px; transform: translate(-50%, -50%); z-index: 100;">
                                    <svg viewBox="0 0 130 130" stroke="#fff" stroke-width="6" fill="#000" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%; overflow: visible;">
                                        <line class="anim-antenna-fly" x1="65" y1="30" x2="65" y2="15" />
                                        <polygon id="first-kill-body" points="65,30 5,90 125,90" />
                                        <path class="anim-leg-drop" d="M 65 90 L 65 105 Q 65 112 73 112" fill="none" />
                                    </svg>
                                    <div id="first-kill-e-prompt" style="position: absolute; top: -45px; left: 17px; width: 36px; height: 36px; background: rgba(10, 15, 25, 0.85); border: 2px solid var(--brand-blue); border-radius: 8px; color: #fff; font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 16px; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s; z-index: 999; box-shadow: 0 0 15px var(--brand-blue), inset 0 0 8px rgba(0, 242, 254, 0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); animation: floatPrompt 1.5s infinite ease-in-out;">E</div>
                                </div>
                            `;
                            environmentLayer.insertAdjacentHTML('beforeend', animHtml);

                            setTimeout(() => {
                                document.getElementById('first-kill-e-prompt').style.opacity = '1';
                                readyToPickUpTriangle = true; 
                            }, 1500);

                        } else {
                            // ⚔️ 怪物正常死亡萎縮動畫
                            targetEnemy.el.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';
                            targetEnemy.el.style.transform = 'translate(-50%, -50%) scale(0) rotate(180deg)'; 
                            targetEnemy.el.style.opacity = '0';
                            
                            setTimeout(() => {
                                targetEnemy.el.remove();
                                
                                // 🌟 根據擊殺數生成不同類型的掉落物，並附帶絕不遮擋的「懸浮 E 框」
                                let lootSvgContent = '';
                                let dropType = '';
                                
                                if (smallEnemyKills >= 2 && smallEnemyKills <= 8) {
                                    // 第 2~8 隻：掉落無眼睛身體 (有天線與勾勾腳)
                                    lootSvgContent = `<line x1="65" y1="30" x2="65" y2="15" /><polygon points="65,30 5,90 125,90" /><path d="M 65 90 L 65 105 Q 65 112 73 112" fill="none" />`;
                                    dropType = 'body';
                                } else if (smallEnemyKills === 9) {
                                    // 第 9 隻：掉落純粹的三角帽
                                    lootSvgContent = `<polygon points="65,30 5,90 125,90" />`;
                                    dropType = 'hat';
                                }

                                if (lootSvgContent !== '') {
                                    const dropHtml = `
                                        <div class="loot-drop-item" data-type="${dropType}" data-x="${targetEnemy.worldX}" data-y="${targetEnemy.worldY}" style="left: ${targetEnemy.worldX}%; top: ${targetEnemy.worldY}%;">
                                            <svg viewBox="0 0 130 130" stroke="#fff" stroke-width="6" fill="#000" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: 100%; overflow: visible;">
                                                ${lootSvgContent}
                                            </svg>
                                            <!-- 🌟 絕不被遮擋的 E 提示框：高高懸浮在物品正上方 (top: -38px)，帶有科技藍發光 -->
                                            <div class="drop-e-prompt" style="position: absolute; top: -38px; left: 50%; transform: translateX(-50%); width: 30px; height: 30px; background: rgba(0, 242, 254, 0.15); border: 2px solid var(--brand-blue); border-radius: 6px; color: #fff; font-family: 'Orbitron', sans-serif; font-weight: bold; font-size: 14px; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.2s; z-index: 999; box-shadow: 0 0 10px var(--brand-blue); pointer-events: none;">E</div>
                                        </div>
                                    `;
                                    environmentLayer.insertAdjacentHTML('beforeend', dropHtml);
                                }
                            }, 300); // 在怪物快縮小完時噴出道具
                        }
                    }
                }
            }
        }
        

        // ==============================================================
        // 🌟 原本怪物的 AI 移動與反擊判定邏輯 (移除了原本粗糙的擊中判定)
        // ==============================================================
        activeEnemies.forEach(enemy => {
            // 如果這隻怪物剛剛被 AND Hammer 打死了，就直接跳過這一訊框的 AI 與反擊
            if (!enemy.alive) return;

            if (enemy.state === 'attacking' && !playerDead) {
                let attackElapsed = timestamp - enemy.lastAttackTime;
                
                if (attackElapsed > 240 && attackElapsed < 600) {
                    const stickmanBox = getRect(document.getElementById('stickman-s3'), 0.5); 
                    const enemyAttackBox = getRect(enemy.el, 0.7);
                    
                    if (isColliding(stickmanBox, enemyAttackBox)) {
                        playerDead = true;
                        isPlayerControllable = false;
                        
                        // 🌟 動態判斷怪物在左邊還是右邊，決定角色倒下的方向
                        let fallRight = enemy.worldX < worldX; // 如果怪物在玩家左側，玩家就往右倒
                        stickman.style.setProperty('--die-rot', fallRight ? '90deg' : '-90deg');
                        stickman.style.setProperty('--die-tx', fallRight ? '30px' : '-30px');

                        stickman.classList.remove('anim-attack'); 
                        stickman.classList.add('stand-still');    
                        stickman.classList.add('player-dead');
                        
                        setTimeout(() => { switchScene(3, 3); }, 1500);
                        return;
                    }
                }
            }

            let side = (enemy.worldX < worldX) ? -1 : 1; 
            let targetX = worldX + (side * enemy.sideOffset);
            let targetY = py; 
            targetX = Math.max(5, targetX);

            let dx = targetX - enemy.worldX;
            let dy = targetY - enemy.worldY;
            let distToTarget = Math.hypot(dx, dy);

            let isAirborne = false;
            let isGroundedSafely = false; 

            if (timestamp < enemy.jumpStartTime) {
                isGroundedSafely = true;
            } else {
                let t = timestamp - enemy.jumpStartTime;
                let cycle = t % 1500;
                if (cycle >= 225 && cycle <= 1275) isAirborne = true;
                if (cycle < 150 || cycle > 1350) isGroundedSafely = true;
            }

            if (enemy.state === 'jumping' && isGroundedSafely && distToTarget <= 0.6 && (timestamp - enemy.lastAttackTime > 1800)) {
                enemy.state = 'attacking';
                enemy.lastAttackTime = timestamp;
                enemy.attackEndTime = timestamp + 800; 
                enemy.el.classList.add('attacking');
            }

            if (enemy.state === 'attacking' && timestamp >= enemy.attackEndTime) {
                enemy.state = 'jumping';
                enemy.el.classList.remove('attacking');
                
                enemy.el.classList.remove('tri-jump');
                void enemy.el.offsetWidth; 
                enemy.el.classList.add('tri-jump');
                
                enemy.jumpStartTime = timestamp; 
                enemy.el.style.setProperty('--jump-delay', '0s');
            }

            if (enemy.state !== 'attacking') { 
                let realDx = worldX - enemy.worldX;
                if (realDx > 1.0) enemy.facing = -1; 
                else if (realDx < -1.0) enemy.facing = 1; 

                if (isAirborne && distToTarget > 0.5) {
                    enemy.worldX += (dx / distToTarget) * enemy.speed;
                    enemy.worldY += (dy / distToTarget) * enemy.speed;
                }
            }

            enemy.worldY = Math.max(10, Math.min(90, enemy.worldY));
            enemy.worldX = Math.max(5, enemy.worldX); 

            enemy.el.style.left = `${enemy.worldX}%`;
            enemy.el.style.top = `${enemy.worldY}%`;
            enemy.el.style.setProperty('--facing', enemy.facing);
        });
        // ==============================================================
        // 🌟 偵測玩家是否靠近地板掉落物 (顯示 E 提示框並登錄拾取目標)
        // ==============================================================
        let closestDrop = null;
        let minDropDist = 12; 
        document.querySelectorAll('.loot-drop-item:not(.picked)').forEach(item => {
            const ix = parseFloat(item.dataset.x);
            const iy = parseFloat(item.dataset.y);
            const dist = Math.hypot(worldX - ix, py - iy);
            
            const prompt = item.querySelector('.drop-e-prompt');
            if (dist < 10) {
                if (dist < minDropDist) {
                    minDropDist = dist;
                    closestDrop = item; // 鎖定距離最近的一件物品
                }
                if (prompt) prompt.style.opacity = '1'; // 亮起上方的 E
            } else {
                if (prompt) prompt.style.opacity = '0';
            }
        });
        nearbyDropItem = closestDrop;
        requestAnimationFrame(gameLoopS3);
    }

    // ==============================================================
    // 🌟 全螢幕背包展開動畫 (裝備實時連動版，包含縮放與圖示修復)
    // ==============================================================
    function triggerBackpackAnimation(isFirstTime = true, isInstantUpdate = false) {
        const overlay = document.createElement('div');
        overlay.id = 'backpack-overlay';
        
        // 🌟 無縫重繪魔法參數：讓生成出來的 HTML 直接就是終極狀態，徹底消滅 0.3s 的閃爍 Bug！
        const baseOpacity = isInstantUpdate ? '1' : '0';
        const bgTrans = isInstantUpdate ? 'none' : 'opacity 0.3s';
        const rowTrans = isInstantUpdate ? 'none' : 'opacity 0.5s ease-out';
        const stickmanTrans = isInstantUpdate ? 'none' : 'opacity 0.6s, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        const stickmanTransform = isInstantUpdate ? 'translateY(0)' : 'translateY(20px)';
        const eqTrans = isInstantUpdate ? 'none' : 'opacity 0.6s ease-out, transform 0.3s';
        const outlineFill = isInstantUpdate ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)';
        
        overlay.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(5, 8, 15, 0.95); z-index: 1000; display: flex; justify-content: center; align-items: center; opacity: ${baseOpacity}; transition: ${bgTrans}; backdrop-filter: blur(10px); overflow: hidden;`;
        
        let rowGroupsHtml = '';
        const a = 108, h = 94, dx = 130, dy = 106, row2Bottom = 569; 
        const rowY = [ row2Bottom - dy, row2Bottom, row2Bottom + dy, row2Bottom + 2 * dy ];
        const gridRows = [
            { y: rowY[0], centers: [-1, 1] },                             
            { y: rowY[1], centers: [-1.5, -0.5, 0.5, 1.5] },              
            { y: rowY[2], centers: [-2, -1, 0, 1, 2] },                   
            { y: rowY[3], centers: [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5] }    
        ];
        const bpSlotsData = []; 

        gridRows.forEach((row, index) => {
            let rowHtml = `<g id="bp-row-${index + 1}" opacity="${baseOpacity}" style="transition: ${rowTrans};">`;
            row.centers.forEach(c => {
                const cx = 500 + c * dx;
                const p1x = cx, p1y = row.y - h;     
                const p2x = cx - a/2, p2y = row.y;   
                const p3x = cx + a/2, p3y = row.y;   
                rowHtml += `<polygon points="${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}" fill="rgba(255,255,255,0.03)" stroke="#fff" stroke-width="4" stroke-linejoin="round" />`;
                
                const currentSlotIdx = bpSlotsData.length;
                bpSlotsData.push({ x: cx, y: row.y - 40, type: 'triangle', slotIndex: currentSlotIdx });

                if (backpackGrid[currentSlotIdx]) {
                    const stored = backpackGrid[currentSlotIdx];
                    const storedType = stored.type || stored; 
                    const count = stored.count || 1;
                    
                    rowHtml += `
                        <g class="bp-stored-item draggable-bp-item" data-origin-type="grid" data-index="${currentSlotIdx}" transform="translate(${cx - 33}, ${row.y - 69}) scale(0.5)" style="filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)); cursor: grab; pointer-events: auto;">
                            ${getItemSVG(storedType)}
                            ${count > 1 ? `<text x="65" y="20" text-anchor="middle" fill="#ffffff" font-size="24" font-family="'Orbitron', sans-serif" font-weight="900" style="filter: drop-shadow(0 0 4px #000);">x${count}</text>` : ''}
                        </g>
                    `;
                }
            });
            rowHtml += `</g>`;
            rowGroupsHtml += rowHtml;
        });

        bpSlotsData.push({ x: 555, y: 415, type: 'handR' });

        let initialTransform = window._hammerSlot.type === 'handR' 
            ? `translate(555, 415) scale(0.3) rotate(25)`
            : `translate(${window._hammerSlot.x}, ${window._hammerSlot.y}) scale(0.48) rotate(0)`;

        let equippedItemsHtml = '';
        if (hasHammer) {
            equippedItemsHtml += `
                <g id="bp-equipped-hammer" opacity="${baseOpacity}" style="transition: ${eqTrans}; filter: drop-shadow(0 0 5px rgba(255,255,255,0.8)); cursor: grab; pointer-events: ${isInstantUpdate ? 'auto' : 'none'};" transform="${initialTransform}">
                    <rect x="-50" y="-30" width="100" height="120" fill="transparent" />
                    <line x1="0" y1="80" x2="0" y2="-5" stroke="#fff" stroke-width="16" stroke-linecap="round"/>
                    <path d="M -35 -20 L 35 -20 A 35 50 0 0 1 -35 -20 Z" fill="#000" stroke="#fff" stroke-width="12" />
                </g>
            `;
        }

        if (!isHammerEquipped && hand1Item) {
            equippedItemsHtml += `
                <g id="bp-equipped-hand1" class="bp-hand-item draggable-bp-item" data-origin-type="hand" data-index="1" opacity="${baseOpacity}" style="transition: ${eqTrans}; filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)); cursor: grab; pointer-events: auto;" transform="translate(532, 398) scale(0.35)">
                    ${getItemSVG(hand1Item)}
                </g>
            `;
        }

        // 🌟 渲染副手 (左側虛線格 x:435 y:400) 的三角怪裝備
        if (hand2Item) {
            equippedItemsHtml += `
                <g id="bp-equipped-hand2" class="bp-hand-item draggable-bp-item" data-origin-type="hand2" opacity="${baseOpacity}" style="transition: ${eqTrans}; filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)); cursor: grab; pointer-events: auto;" transform="translate(432, 398) scale(0.35)">
                    ${getItemSVG(hand2Item)}
                </g>
            `;
        }

        // 🌟 渲染頭部 (右上角虛線框 x:540 y:355) 的三角形裝備
        if (headItem) {
            equippedItemsHtml += `
                <g id="bp-equipped-head" class="bp-hand-item draggable-bp-item" data-origin-type="head" opacity="${baseOpacity}" style="transition: ${eqTrans}; filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)); cursor: grab; pointer-events: auto;" transform="translate(538, 355) scale(0.22)">
                    ${getItemSVG(headItem)}
                </g>
            `;
        }

        const animPaths = [
            "M 450 800 L 475 800 L 500 800 L 525 800 L 550 800 Z", 
            "M 100 800 L 300 800 L 500 800 L 700 800 L 900 800 Z", 
            "M 100 800 L 433 569 L 500 569 L 567 569 L 900 800 Z", 
            "M 100 800 L 367 338 L 500 338 L 633 338 L 900 800 Z", 
            "M 100 800 L 367 338 L 500 107 L 633 338 L 900 800 Z", 
            "M 100 800 L 367 338 L 500 569 L 633 338 L 900 800 Z"  
        ];

        const animSpeed = isFirstTime ? 0.8 : 0.5;
        const initialPath = isInstantUpdate ? animPaths[5] : (isFirstTime ? animPaths[0] : animPaths[5]);
        const initialCreaseOpacity = isInstantUpdate ? "1" : (isFirstTime ? "0" : "1");
        const creaseDash = isInstantUpdate ? "" : 'stroke-dasharray="10 10"';
        const outlineTrans = isInstantUpdate ? 'none' : `d ${animSpeed}s ease-in-out, fill ${animSpeed}s`;
        const creaseTrans = isInstantUpdate ? 'none' : `opacity ${animSpeed}s`;

        overlay.innerHTML = `
            <svg viewBox="0 0 1000 1000" style="width: 135vh; height: 135vh; max-width: none; overflow: visible; transform: translateY(2%);">
                <path id="bp-outline" d="${initialPath}" fill="${outlineFill}" stroke="#fff" stroke-width="8" stroke-linejoin="round" style="transition: ${outlineTrans};" />
                <line id="bp-crease" x1="367" y1="338" x2="633" y2="338" stroke="#fff" stroke-width="6" opacity="${initialCreaseOpacity}" style="transition: ${creaseTrans};" ${creaseDash} />

                ${rowGroupsHtml}

                <g id="bp-stickman" opacity="${baseOpacity}" stroke="#fff" fill="none" stroke-linecap="round" stroke-linejoin="round" style="transition: ${stickmanTrans}; transform: ${stickmanTransform};">
                    <circle cx="500" cy="390" r="16" stroke-width="5" />
                    <line x1="500" y1="406" x2="500" y2="470" stroke-width="5" />
                    <path d="M 500 440 Q 475 450, 465 430" stroke-width="5" /> 
                    <path d="M 500 440 Q 525 450, 535 430" stroke-width="5" />
                    <path d="M 500 470 Q 485 480, 479 505" stroke-width="5" /> 
                    <path d="M 500 470 Q 515 480, 521 505" stroke-width="5" />
                    <line x1="484" y1="495" x2="516" y2="495" stroke-width="4" /> 

                    <line x1="514" y1="382" x2="540" y2="368" stroke-dasharray="3,3" stroke-width="3" /> 
                    <rect x="540" y="355" width="24" height="24" stroke-dasharray="4,4" stroke-width="3" /> 
                    
                    <rect x="435" y="400" width="40" height="40" stroke-dasharray="4,4" stroke-width="3" /> 
                    <rect x="535" y="400" width="40" height="40" stroke-dasharray="4,4" stroke-width="3" /> 
                    
                    <rect x="472" y="485" width="18" height="26" stroke-dasharray="4,4" stroke-width="3" /> 
                    <rect x="510" y="485" width="18" height="26" stroke-dasharray="4,4" stroke-width="3" /> 
                </g>

                ${equippedItemsHtml}
            </svg>
            <div id="bp-close-hint" style="position: absolute; top: 20%; color: rgba(255,255,255,0.7); font-family: 'Orbitron', sans-serif; font-size: 1.2rem; opacity: ${baseOpacity}; transition: ${bgTrans}; letter-spacing: 3px;">PRESS [ X ] TO CLOSE</div>
        `;
        
        scene3.appendChild(overlay);
        
        // 🌟 只有在非瞬間重繪時，才觸發瀏覽器的漸變
        if (!isInstantUpdate) {
            void overlay.offsetWidth; 
            overlay.style.opacity = '1';
        }

        const outline = document.getElementById('bp-outline');
        const crease = document.getElementById('bp-crease');
        const stickmanSvg = document.getElementById('bp-stickman');
        const hint = document.getElementById('bp-close-hint');
        const svgFrame = overlay.querySelector('svg');
        const hammerElem = document.getElementById('bp-equipped-hammer');

        // ==============================================================
        // 2. 武器拖曳與自動吸附系統 (完整修復版)
        // ==============================================================
        if (hammerElem) {
            let isDragging = false;

            hammerElem.addEventListener('mousedown', (e) => {
                isDragging = true;
                hammerElem.style.transition = 'none';
                hammerElem.style.cursor = 'grabbing';
            });

            overlay.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                let pt = svgFrame.createSVGPoint();
                pt.x = e.clientX;
                pt.y = e.clientY;
                let svgP = pt.matrixTransform(svgFrame.getScreenCTM().inverse());
                hammerElem.setAttribute('transform', `translate(${svgP.x}, ${svgP.y}) scale(0.48) rotate(0)`);
            });

            overlay.addEventListener('mouseup', (e) => {
                if (!isDragging) return;
                isDragging = false;
                hammerElem.style.cursor = 'grab';

                let pt = svgFrame.createSVGPoint();
                pt.x = e.clientX;
                pt.y = e.clientY;
                let svgP = pt.matrixTransform(svgFrame.getScreenCTM().inverse());

                let closestSlot = window._hammerSlot;
                let minDist = Infinity;
                bpSlotsData.forEach(slot => {
                    let dist = Math.hypot(slot.x - svgP.x, slot.y - svgP.y);
                    if (dist < minDist) { minDist = dist; closestSlot = slot; }
                });

                // 防呆：距離太遠，或目標背包格「已有三角怪」，退回原位
                if (minDist > 120 || (closestSlot.type === 'triangle' && backpackGrid[closestSlot.slotIndex] !== null)) {
                    closestSlot = window._hammerSlot;
                }

                window._hammerSlot = closestSlot;
                isHammerEquipped = (closestSlot.type === 'handR');
                if (isHammerEquipped) hand1Item = null;

                // 🌟 1. 先觸發回彈動畫 (小小回彈的效果)
                hammerElem.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                void hammerElem.offsetWidth; // 🌟 魔法指令：強制瀏覽器刷新，確保動畫 100% 觸發
                
                if (closestSlot.type === 'handR') {
                    hammerElem.setAttribute('transform', `translate(555, 415) scale(0.3) rotate(25)`);
                } else {
                    hammerElem.setAttribute('transform', `translate(${closestSlot.x}, ${closestSlot.y}) scale(0.48) rotate(0)`);
                }
                
                // 🌟 2. 等待動畫 300 毫秒「完全播完」果凍彈跳後，才無縫更新資料與畫面
                setTimeout(() => {
                    const oldOverlay = document.getElementById('backpack-overlay');
                    if (oldOverlay) oldOverlay.remove();
                    updateMainStickmanEquipment();
                    triggerBackpackAnimation(false, true);
                }, 300); // 確保與 transition 的 0.3s 完全一致！
            });

            overlay.addEventListener('mouseleave', () => {
                if (isDragging) {
                    isDragging = false;
                    hammerElem.style.cursor = 'grab';
                    hammerElem.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    if (window._hammerSlot.type === 'handR') {
                        hammerElem.setAttribute('transform', `translate(555, 415) scale(0.3) rotate(25)`);
                    } else {
                        hammerElem.setAttribute('transform', `translate(${window._hammerSlot.x}, ${window._hammerSlot.y}) scale(0.48) rotate(0)`);
                    }
                }
            });
        }

        // ==============================================================
        // 🌟 3. 戰利品 (背包/手部) 拖曳與吸附系統 (全新加入)
        // ==============================================================
        let draggedItem = null;
        let dragOriginType = null;
        let dragOriginIndex = null;

        function snapGridItem(item, sIndex) {
            let slot = bpSlotsData.find(s => s.type === 'triangle' && s.slotIndex === sIndex);
            if (slot) {
                item.setAttribute('transform', `translate(${slot.x - 33}, ${slot.y - 29}) scale(0.5)`);
            }
        }

        overlay.addEventListener('mousedown', (e) => {
            let target = e.target.closest('.draggable-bp-item');
            if (!target) return;

            draggedItem = target;
            dragOriginType = target.getAttribute('data-origin-type');
            dragOriginIndex = parseInt(target.getAttribute('data-index'));

            draggedItem.style.transition = 'none';
            draggedItem.style.cursor = 'grabbing';
            // 將元素移到節點最後面，確保拖曳時圖示顯示在最上層，不會被其他格子蓋住
            draggedItem.parentNode.appendChild(draggedItem);
        });

        overlay.addEventListener('mousemove', (e) => {
            if (!draggedItem) return;
            let pt = svgFrame.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            let svgP = pt.matrixTransform(svgFrame.getScreenCTM().inverse());

            // 🌟 修正：統一所有的拖曳跟隨邏輯！
            // 無論從背包、副手還是頭部拿起來，拖曳時統一放大成背包格子的尺寸 (0.5)，並完美對齊滑鼠中心
            draggedItem.setAttribute('transform', `translate(${svgP.x - 33}, ${svgP.y - 26}) scale(0.5)`);
        });

        const handleItemMouseUpLeave = (e) => {
            if (!draggedItem) return;
            
            const activeItem = draggedItem;
            const oType = dragOriginType; // 來源可能是 'grid', 'hand2', 或 'head'
            const oIndex = dragOriginIndex;
            draggedItem = null; 
            
            let pt = svgFrame.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            let svgP = pt.matrixTransform(svgFrame.getScreenCTM().inverse());
            activeItem.style.cursor = 'grab';

            // 1. 蒐集合法目標 (格子、手、頭)
            let validTargets = [];
            bpSlotsData.forEach(slot => {
                if (slot.type === 'triangle') {
                    validTargets.push({ type: 'grid', index: slot.slotIndex, dist: Math.hypot(slot.x - svgP.x, slot.y - svgP.y) });
                }
            });
            validTargets.push({ type: 'hand2', index: 2, dist: Math.hypot(455 - svgP.x, 420 - svgP.y) });
            validTargets.push({ type: 'head', index: 3, dist: Math.hypot(552 - svgP.x, 367 - svgP.y) });

            validTargets.sort((a, b) => a.dist - b.dist);
            let bestTarget = validTargets[0]; 

            // 🌟 2. 獲取正在拖曳物品的「真實型別 ('body' 或 'hat')」
            let itemRealType = '';
            if (oType === 'hand2') itemRealType = hand2Item;
            else if (oType === 'head') itemRealType = headItem;
            else if (oType === 'grid') itemRealType = backpackGrid[oIndex].type;

            let action = 'none';

            // 🌟 3. 最嚴格的型別過濾：拒絕跨界裝備！
            if (bestTarget.type === 'head' && itemRealType !== 'hat') bestTarget = { type: oType, index: oIndex };
            if (bestTarget.type === 'hand2' && itemRealType !== 'body') bestTarget = { type: oType, index: oIndex };

            // 4. 分析拖曳行為
            if (bestTarget.type === 'hand2') {
                if (oType === 'grid') {
                    if (hand2Item !== null) { bestTarget = { type: 'grid', index: oIndex }; action = 'revert'; }
                    else { action = 'equip_hand2'; }
                } else { action = 'revert'; }
            } 
            else if (bestTarget.type === 'head') {
                if (oType === 'grid') {
                    if (headItem !== null) { bestTarget = { type: 'grid', index: oIndex }; action = 'revert'; }
                    else { action = 'equip_head'; }
                } else { action = 'revert'; }
            }
            else if (bestTarget.type === 'grid') {
                let tIndex = bestTarget.index;
                const isOccupiedByHammer = (window._hammerSlot && window._hammerSlot.slotIndex === tIndex);
                
                if (isOccupiedByHammer) {
                    bestTarget = { type: oType, index: oIndex };
                    action = 'revert';
                } else {
                    if (oType === 'hand2' || oType === 'head') {
                        if (backpackGrid[tIndex] === null || backpackGrid[tIndex].type === itemRealType) {
                            action = oType === 'hand2' ? 'unequip_hand2' : 'unequip_head';
                        } else {
                            bestTarget = { type: oType, index: oIndex };
                            action = 'revert';
                        }
                    } else if (oType === 'grid') {
                        if (tIndex === oIndex) {
                            action = 'revert';
                        } else if (backpackGrid[tIndex] === null) {
                            action = 'move';
                        } else if (backpackGrid[tIndex].type === backpackGrid[oIndex].type) {
                            action = 'stack';
                        } else {
                            bestTarget = { type: oType, index: oIndex };
                            action = 'revert';
                        }
                    }
                }
            }

            // 5. 絲滑回彈
            activeItem.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            void activeItem.offsetWidth; 
            
            let tx, ty, scale;
            if (bestTarget.type === 'head') {
                // 🌟 配合第一步的新尺寸與新座標
                tx = 538; ty = 355; scale = 0.22;
            } else if (bestTarget.type === 'hand2') {
                tx = 432; ty = 398; scale = 0.35;
            } else {
                let slot = bpSlotsData.find(s => s.type === 'triangle' && s.slotIndex === bestTarget.index);
                tx = slot.x - 33; ty = slot.y - 29; scale = 0.5;
            }
            activeItem.setAttribute('transform', `translate(${tx}, ${ty}) scale(${scale})`);

            // 6. 無縫更新資料
            setTimeout(() => {
                if (action === 'equip_hand2') {
                    let orig = backpackGrid[oIndex];
                    hand2Item = orig.type;
                    if (orig.count > 1) orig.count -= 1; else backpackGrid[oIndex] = null;
                } else if (action === 'equip_head') {
                    let orig = backpackGrid[oIndex];
                    headItem = orig.type;
                    if (orig.count > 1) orig.count -= 1; else backpackGrid[oIndex] = null;
                } else if (action === 'unequip_hand2') {
                    let tIndex = bestTarget.index;
                    if (backpackGrid[tIndex] === null) backpackGrid[tIndex] = { type: hand2Item, count: 1 };
                    else if (backpackGrid[tIndex].type === hand2Item) backpackGrid[tIndex].count += 1;
                    hand2Item = null;
                } else if (action === 'unequip_head') {
                    let tIndex = bestTarget.index;
                    if (backpackGrid[tIndex] === null) backpackGrid[tIndex] = { type: headItem, count: 1 };
                    else if (backpackGrid[tIndex].type === headItem) backpackGrid[tIndex].count += 1;
                    headItem = null;
                } else if (action === 'move') {
                    backpackGrid[bestTarget.index] = backpackGrid[oIndex];
                    backpackGrid[oIndex] = null;
                } else if (action === 'stack') {
                    backpackGrid[bestTarget.index].count += backpackGrid[oIndex].count;
                    backpackGrid[oIndex] = null;
                }
                
                const oldOverlay = document.getElementById('backpack-overlay');
                if (oldOverlay) oldOverlay.remove();
                updateMainStickmanEquipment(); 
                triggerBackpackAnimation(false, true); 
            }, 300); 
        };
        
        overlay.addEventListener('mouseup', handleItemMouseUpLeave);
        overlay.addEventListener('mouseleave', handleItemMouseUpLeave);

        // ==============================================================
        // 🌟 展開動畫序列 (新增：無縫瞬間重繪模式)
        // ==============================================================
        if (isInstantUpdate) {
            backpackIsOpen = true;
        } else if (isFirstTime) {
            let step = 1; 
            setTimeout(() => {
                const interval = setInterval(() => {
                    if(step < animPaths.length) {
                        outline.setAttribute('d', animPaths[step]);
                        
                        if (step === 4) { crease.style.opacity = '1'; }
                        if (step === 5) {
                            outline.style.fill = 'rgba(255, 255, 255, 0.08)';
                            crease.removeAttribute('stroke-dasharray');
                        }
                        step++;
                    } else {
                        clearInterval(interval);
                        
                        setTimeout(() => {
                            stickmanSvg.style.opacity = '1';
                            stickmanSvg.style.transform = 'translateY(0)'; 
                            
                            setTimeout(() => { document.getElementById('bp-row-1').style.opacity = '1'; }, 300);
                            setTimeout(() => { document.getElementById('bp-row-2').style.opacity = '1'; }, 600);
                            setTimeout(() => { document.getElementById('bp-row-3').style.opacity = '1'; }, 900);
                            setTimeout(() => { document.getElementById('bp-row-4').style.opacity = '1'; }, 1200);
                            
                            setTimeout(() => { 
                                hint.style.opacity = '1';
                                backpackIsOpen = true; 
                            }, 1600);

                            setTimeout(() => {
                                if (hammerElem) {
                                    hammerElem.style.opacity = '1';
                                    hammerElem.style.pointerEvents = 'auto'; 
                                }
                                document.querySelectorAll('.bp-hand-item').forEach(el => el.style.opacity = '1');
                            }, 2000);
                        }, 400); 
                    }
                }, animSpeed * 1000);
            }, 200);
        } else {
            setTimeout(() => {
                outline.style.fill = 'rgba(255, 255, 255, 0.08)';
                crease.removeAttribute('stroke-dasharray');
                
                setTimeout(() => {
                    stickmanSvg.style.opacity = '1';
                    stickmanSvg.style.transform = 'translateY(0)'; 
                    
                    setTimeout(() => { document.getElementById('bp-row-1').style.opacity = '1'; }, 150);
                    setTimeout(() => { document.getElementById('bp-row-2').style.opacity = '1'; }, 300);
                    setTimeout(() => { document.getElementById('bp-row-3').style.opacity = '1'; }, 450);
                    setTimeout(() => { document.getElementById('bp-row-4').style.opacity = '1'; }, 600);
                    
                    setTimeout(() => { 
                        hint.style.opacity = '1';
                        backpackIsOpen = true; 
                    }, 800);

                    setTimeout(() => {
                        if (hammerElem) {
                            hammerElem.style.opacity = '1';
                            hammerElem.style.pointerEvents = 'auto'; 
                        }
                        document.querySelectorAll('.bp-hand-item').forEach(el => el.style.opacity = '1');
                    }, 1000); 
                }, 500); 
            }, 100); 
        }
    }
    requestAnimationFrame(gameLoopS3);
}