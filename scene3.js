// =========================================
// WJ STUDIO - 場景 3：全新領域 (scene3.js)
// =========================================

export function initScene3(playerState, switchScene, resourceScope = null) {
    const scene3 = document.getElementById('scene-3');
    const scene3InstanceToken = Symbol('scene3-instance');
    window._scene3InstanceToken = scene3InstanceToken;

    let destroyed = false;

    const scheduleSceneFrame = (callback) => {
        if (resourceScope) {
            return resourceScope.requestAnimationFrame(callback);
        }

        return globalThis.requestAnimationFrame(callback);
    };

    const scheduleSceneInterval = (callback, delay) => {
        if (resourceScope) {
            return resourceScope.setInterval(callback, delay);
        }

        return globalThis.setInterval(callback, delay);
    };

    const clearSceneInterval = (intervalId) => {
        if (intervalId == null) {
            return;
        }

        if (resourceScope) {
            resourceScope.clearInterval(intervalId);
            return;
        }

        globalThis.clearInterval(intervalId);
    };

    const scheduleSceneTimeout = (callback, delay) => {
        if (resourceScope) {
            return resourceScope.setTimeout(callback, delay);
        }

        return globalThis.setTimeout(callback, delay);
    };

    const clearSceneTimeout = (timeoutId) => {
        if (timeoutId == null) {
            return;
        }

        if (resourceScope) {
            resourceScope.clearTimeout(timeoutId);
            return;
        }

        globalThis.clearTimeout(timeoutId);
    };

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
    let hasThirdManual = playerState.hasThirdManual === true;
    let jumpManualUnlocked = hasThirdManual;

    // ==========================================
    // 🌟 新增：雙手與背包裝備資料庫
    // ==========================================
    let hand1Item = 'hammer'; // 主手 (槌子專武)
    let hand2Item = null;     // 副手 (專門拿三角怪 'body')
    let headItem = null;      // 頭部 (專門戴三角形 'hat')
    let backpackGrid = new Array(17).fill(null); 
    let nearbyDropItem = null;
    let preEasterEquipmentSnapshot = null;

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

            /* ===================================================
               🌟 BOSS 離場後：C 鍵五幀垂直跳躍
               狀態 2 → 3 → 4 → 5 → 6；落地後回到原本狀態 7。

               外觀基準完全沿用 Scene 1 / Scene 2：
               - 80 × 120 viewBox
               - 頭部半徑 16
               - 全身線寬固定 8px
               - round linecap / round linejoin

               一般狀態使用與 Scene 1 / 2 相同的 circle + line；只有跳躍期間
               才切換到同線寬的曲線 Path。身體伸長直接改 SVG 幾何座標，
               不對角色或四肢使用 scale，因此線條粗細永遠不會改變。
               =================================================== */
            #armL-s3, #armR-s3, #legL-s3, #legR-s3 {
                transform-box: view-box;
            }

            #stickman-head-s3,
            #stickman-torso-s3,
            #armL-base-s3,
            #armR-base-s3,
            #armL-path-s3,
            #armR-path-s3,
            #legL-base-s3,
            #legR-base-s3,
            #legL-path-s3,
            #legR-path-s3 {
                stroke-width: 8px !important;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            #armL-path-s3,
            #armR-path-s3,
            #legL-path-s3,
            #legR-path-s3 {
                display: none;
            }

            #stickman-s3.player-jumping {
                will-change: top, left;
            }

            #stickman-s3.player-jumping #stickman-roll-shell {
                animation: none !important;
                transform: none !important;
            }

            #stickman-s3.player-jumping #stickman-body-s3 {
                animation: none !important;
                transform: translate(-50%, -50%) !important;
                transition: none !important;
            }

            #stickman-s3.player-jumping #armL-base-s3,
            #stickman-s3.player-jumping #armR-base-s3,
            #stickman-s3.player-jumping #legL-base-s3,
            #stickman-s3.player-jumping #legR-base-s3 {
                display: none;
            }

            #stickman-s3.player-jumping #armL-path-s3,
            #stickman-s3.player-jumping #armR-path-s3,
            #stickman-s3.player-jumping #legL-path-s3,
            #stickman-s3.player-jumping #legR-path-s3 {
                display: inline;
            }

            #stickman-s3.player-jumping #armL-s3 {
                animation: none !important;
                transform-origin: 40px var(--jump-shoulder-y, 56px);
                transform: rotate(var(--jump-arm-l-rotation, -56deg)) !important;
                transition: none !important;
            }

            #stickman-s3.player-jumping #armR-s3 {
                animation: none !important;
                transform-origin: 40px var(--jump-shoulder-y, 56px);
                transform: rotate(var(--jump-arm-r-rotation, 56deg)) !important;
                transition: none !important;
            }

            #stickman-s3.player-jumping #legL-s3 {
                animation: none !important;
                transform-origin: 40px var(--jump-hip-y, 75px);
                transform: rotate(var(--jump-leg-l-rotation, -42deg)) !important;
                transition: none !important;
            }

            #stickman-s3.player-jumping #legR-s3 {
                animation: none !important;
                transform-origin: 40px var(--jump-hip-y, 75px);
                transform: rotate(var(--jump-leg-r-rotation, 42deg)) !important;
                transition: none !important;
            }

            #stickman-s3.player-jumping #held-hammer-s3 {
                animation: none !important;
                transform-origin: 40px var(--jump-hand-y, 85px);
                transform: rotate(var(--jump-hammer-rotation, 80deg)) scale(0.4) !important;
                transition: none !important;
            }

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
                --tumble-rotation-end: -360deg;
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
                100% { transform: rotate(var(--tumble-rotation-end, -360deg)); }
            }

            #stickman-s3.boss-wind-landed #stickman-body-s3 {
                animation: bossWindLandingSquash 0.26s cubic-bezier(0.18, 0.86, 0.22, 1) forwards !important;
            }

            @keyframes bossWindLandingSquash {
                0%   { transform: translate(-50%, -50%) translateY(3px) rotate(-10deg); }
                48%  { transform: translate(-50%, -50%) translateY(-2px) rotate(5deg); }
                100% { transform: translate(-50%, -50%) translateY(0) rotate(0deg); }
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
                <svg class="pla-circuit" style="position: absolute; bottom: -10%; left: 115%; top: auto; transform: none; width: 1650px; height: 2550px; z-index: 3; filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4)); overflow: visible;" viewBox="0 0 550 850" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    
                    <!-- ===== 1. 頂部標籤（整組向下 25，與上方電路同步） ===== -->
                    <g class="pla-text" stroke="none" fill="#fff" font-family="'Orbitron', sans-serif" font-size="18" font-weight="bold" letter-spacing="2px">
                        <text x="125" y="45">H</text>
                        <text x="150" y="45">I</text>
                        <text x="175" y="45">C</text>
                        <text x="200" y="45">C'</text>
                        <text x="225" y="45">E</text>
                        <text x="250" y="45">E'</text>
                        <text x="275" y="45">N</text>
                        <text x="300" y="45">S</text>
                    </g>

                    <!-- ===== 2. 左側輸入標籤（整組向下 25） ===== -->
                    <g class="pla-text" stroke="none" fill="#fff" font-family="'Orbitron', sans-serif" font-size="20" font-weight="bold" text-anchor="middle">
                        <text x="40" y="82">H</text>
                        <text x="40" y="132">I</text>
                        <text x="40" y="182">C</text>
                        <text x="40" y="232">E</text>
                        <text x="40" y="282">N</text>
                        <text x="40" y="332">S</text>
                    </g>

                    <!-- ===== 3. 左側精準還原邏輯閘（整組向下 25） ===== -->
                    <!-- H & I 線 -->
                    <!-- 邏輯物理邊界 (隱藏)，用來確保物理引擎能正確抓取平台的總長度 -->
                    <line id="pla-top-platform-line-s3" x1="55" y1="75" x2="550" y2="75" opacity="0" />
                    
                    <g stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <!-- 實體踩踏線 (發光用)，包含 AND 閘上方的平線 -->
                        <line class="pla-top-platform-visible" x1="55" y1="75" x2="330" y2="75" />
                        <line class="pla-top-platform-visible" x1="330" y1="75" x2="390" y2="75" />
                        <line class="pla-top-platform-visible" x1="440" y1="75" x2="500" y2="75" />

                        <!-- 🌟 圖騰方框 (X: 330~390, Y: 75~135) -->
                        <!-- 左線垂直，底線水平 -->
                        <path d="M 330 75 L 330 135 L 390 135" />
                        <!-- 右線不規則向內彎曲再向外 (純白線) -->
                        <path d="M 390 135 C 378 115, 378 95, 390 75" />

                        <!-- 🌟 內部圖案 (全部純白線，無任何塗黑) -->
                        <!-- 左側曲線 -->
                        <path d="M 342 85 Q 352 105 342 125" />
                        <!-- 中央懸空 V 型 -->
                        <path d="M 353 85 Q 357 115 360 120 Q 363 115 367 85" stroke-width="3" />
                        <!-- 右側倒 Y 形分裂線 -->
                        <path d="M 378 75 Q 374 95 370 115 L 362 135" />
                        <path d="M 370 115 L 378 135" />

                        <!-- 🌟 恢復標準比例的 AND 閘 (X: 440~500, Y: 75) -->
                        <!-- 垂直往下延伸 30px，再接半徑 30 的完美半圓，恢復修長比例 -->
                        <path d="M 440 75 L 440 105 A 30 30 0 0 0 500 105 L 500 75" />
                    </g>

                    <line x1="55" y1="125" x2="305" y2="125" />
                    
                    <!-- C 輸入 -->
                    <line x1="55" y1="175" x2="60" y2="175" />
                    <path d="M 60 160 L 60 195 L 95 175 Z" />
                    <line x1="95" y1="175" x2="305" y2="175" />
                    <circle cx="78" cy="190" r="4.5" />
                    <line x1="82.5" y1="190" x2="305" y2="190" />

                    <!-- E 輸入 -->
                    <line x1="55" y1="225" x2="60" y2="225" />
                    <path d="M 60 210 L 60 245 L 95 225 Z" />
                    <line x1="95" y1="225" x2="305" y2="225" />
                    <circle cx="78" cy="240" r="4.5" />
                    <line x1="82.5" y1="240" x2="305" y2="240" />

                    <!-- N 與 S -->
                    <line x1="55" y1="275" x2="305" y2="275" />
                    <line x1="55" y1="325" x2="305" y2="325" />

                    <!-- ===== 4. 垂直導線：上端同步下移 25，底部仍延伸到 y=825 ===== -->
                    <line x1="130" y1="55" x2="130" y2="825" />
                    <line x1="155" y1="55" x2="155" y2="825" />
                    <line x1="180" y1="55" x2="180" y2="825" />
                    <line x1="205" y1="55" x2="205" y2="825" />
                    <line x1="230" y1="55" x2="230" y2="825" />
                    <line x1="255" y1="55" x2="255" y2="825" />
                    <line x1="280" y1="55" x2="280" y2="825" />
                    <line x1="305" y1="55" x2="305" y2="825" />

                    <!-- ===== 5. 頂部連接圓點：中心同步下移 25；最下圓點至第一排 X 由 50 縮為 25 ===== -->
                    <g fill="#fff">
                        <circle cx="130" cy="75" r="4.5" />
                        <circle cx="155" cy="125" r="4.5" />
                        <circle cx="180" cy="175" r="4.5" />
                        <circle cx="205" cy="190" r="4.5" />
                        <circle cx="230" cy="225" r="4.5" />
                        <circle cx="255" cy="240" r="4.5" />
                        <circle cx="280" cy="275" r="4.5" />
                        <circle cx="305" cy="325" r="4.5" />
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
                    <!-- 一般外觀與 Scene 1 / Scene 2 完全相同。 -->
                    <circle id="stickman-head-s3" cx="40" cy="32" r="16" />
                    <line id="stickman-torso-s3" x1="40" y1="48" x2="40" y2="75" />
                    <g id="armL-s3">
                        <line id="armL-base-s3" x1="40" y1="56" x2="40" y2="85" />
                        <path id="armL-path-s3" d="M 40 56 L 40 85" />
                        <text id="held-1-s3" x="10" y="50" dy="0.3em" text-anchor="middle" fill="#fff" font-size="23" font-family="'Orbitron', sans-serif" font-weight="25" opacity="0">1</text>
                        <g id="held-hammer-s3">
                            <line id="held-hammer-shaft-s3" x1="40" y1="85" x2="40" y2="20" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
                            <path d="M 5 -10 L 75 -10 A 35 50 0 0 1 5 -10 Z" fill="#000" stroke="#fff" stroke-width="8" style="filter: drop-shadow(0 0 5px rgba(255,255,255,0.8));"/>
                        </g>
                        <!-- 🌟 修正主手：改為 translate(17, 54) 精準握在根部，rotate(-22) 讓頂部朝上偏左！ -->
                        <g id="held-item-hand1" opacity="0" transform="translate(-8, 32) scale(0.35) rotate(-20, 65, 90)" style="filter: drop-shadow(0 0 5px rgba(255,255,255,0.8));"></g>
                    </g>
                    <g id="armR-s3">
                        <line id="armR-base-s3" x1="40" y1="56" x2="40" y2="85" />
                        <path id="armR-path-s3" d="M 40 56 L 40 85" />
                        <text id="held-0-s3" x="70" y="50" dy="0.3em" text-anchor="middle" fill="#fff" font-size="23" font-family="'Orbitron', sans-serif" font-weight="25" opacity="0">0</text>
                        <!-- 🌟 修正副手：改為 translate(20, 54) 精準握在根部，rotate(-22) 讓頂部朝上偏左！ -->
                        <g id="held-item-hand2" opacity="0" transform="translate(6, 52) scale(0.35) rotate(-35, 65, 90)" style="filter: drop-shadow(0 0 5px rgba(255,255,255,0.8));"></g>
                    </g>
                    <g id="legL-s3">
                        <line id="legL-base-s3" x1="40" y1="75" x2="40" y2="105" />
                        <path id="legL-path-s3" d="M 40 75 L 40 105" />
                    </g>
                    <g id="legR-s3">
                        <line id="legR-base-s3" x1="40" y1="75" x2="40" y2="105" />
                        <path id="legR-path-s3" d="M 40 75 L 40 105" />
                    </g>
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


                    <div id="manual-page-3-s3" class="manual-page">
                        <div class="manual-panel" style="width: 100%; flex: 1; justify-content: flex-start; overflow: visible;">
                            <div class="action-block" style="border-bottom: none; width: 100%; margin-bottom: 0; position: relative;">
                                <div class="action-header" style="justify-content: flex-start; margin-bottom: 10px; position: relative; z-index: 2;">
                                    <div class="key-btn" style="border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">C</div>
                                    <div class="action-text" style="font-size: 2rem;">Jump</div>
                                </div>

                                <!--
                                    PAGE 3 跳躍教學：依照手稿完整呈現七個連續序列幀。
                                    兩端為相同站姿；左右第二、第三幀互相對稱；最高點固定在正中央，
                                    並抬升到接近 Jump 標題的高度。所有人物使用同一組頭身比例與 4px 圓角線條。
                                -->
                                <svg class="svg-glow" viewBox="0 0 800 330" preserveAspectRatio="xMidYMid meet" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" style="width: 100%; height: clamp(280px, 42vh, 340px); display: block; margin: -54px auto 0; overflow: visible;">
                                    <defs>
                                        <!-- 起點／終點：完整正常比例，頭、軀幹、雙手與雙腳都與既有說明書一致。 -->
                                        <g id="s3-manual-jump-ground">
                                            <circle cx="40" cy="24" r="16" />
                                            <line x1="40" y1="40" x2="40" y2="80" />
                                            <path d="M 40 54 C 33 61 23 68 16 78" />
                                            <path d="M 40 54 C 47 61 57 68 64 78" />
                                            <path d="M 40 80 C 33 92 23 105 14 118" />
                                            <path d="M 40 80 C 47 92 57 105 66 118" />
                                        </g>

                                        <!-- 第一段上升／最後一段下降：手腳開始向外彎曲。 -->
                                        <g id="s3-manual-jump-rise-1">
                                            <circle cx="40" cy="24" r="16" />
                                            <line x1="40" y1="40" x2="40" y2="80" />
                                            <path d="M 40 54 C 34 64 22 71 8 73" />
                                            <path d="M 40 54 C 46 64 58 71 72 73" />
                                            <path d="M 40 80 C 34 92 22 105 8 112" />
                                            <path d="M 40 80 C 46 92 58 105 72 112" />
                                        </g>

                                        <!-- 第二段上升／第一段下降：雙手接近水平、雙腿形成寬而淺的弧線。 -->
                                        <g id="s3-manual-jump-rise-2">
                                            <circle cx="40" cy="24" r="16" />
                                            <line x1="40" y1="40" x2="40" y2="80" />
                                            <path d="M 40 54 C 30 62 16 63 3 55" />
                                            <path d="M 40 54 C 50 62 64 63 77 55" />
                                            <path d="M 40 80 C 31 94 16 101 2 96" />
                                            <path d="M 40 80 C 49 94 64 101 78 96" />
                                        </g>

                                        <!-- 最高點：手、腳皆向上收成 U 形；腳下左右長、中間短的三條躍升線。 -->
                                        <g id="s3-manual-jump-apex">
                                            <circle cx="40" cy="24" r="16" />
                                            <line x1="40" y1="40" x2="40" y2="80" />
                                            <path d="M 40 54 C 31 75 17 78 5 39" />
                                            <path d="M 40 54 C 49 75 63 78 75 39" />
                                            <path d="M 40 80 C 31 104 17 110 3 72" />
                                            <path d="M 40 80 C 49 104 63 110 77 72" />
                                            <g stroke-width="2.4" opacity="0.95">
                                                <line x1="31" y1="106" x2="31" y2="128" />
                                                <line x1="40" y1="111" x2="40" y2="124" />
                                                <line x1="49" y1="106" x2="49" y2="128" />
                                            </g>
                                        </g>
                                    </defs>

                                    <!-- 七個序列幀依手稿的弧線高度與左右相對位置排列。 -->
                                    <use href="#s3-manual-jump-ground" transform="translate(12 205)" />
                                    <use href="#s3-manual-jump-rise-1" transform="translate(126 158)" />
                                    <use href="#s3-manual-jump-rise-2" transform="translate(245 94)" />
                                    <use href="#s3-manual-jump-apex" transform="translate(360 0)" />
                                    <use href="#s3-manual-jump-rise-2" transform="translate(478 94)" />
                                    <use href="#s3-manual-jump-rise-1" transform="translate(597 158)" />
                                    <use href="#s3-manual-jump-ground" transform="translate(708 205)" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div id="manual-page-4-s3" class="manual-page" style="min-height: 0; height: auto; flex: 0 0 auto; overflow: visible;">
                        <div id="s3-manual-page4-panel" class="manual-panel" style="width: 100%; height: auto; min-height: 0; flex: 0 0 auto; justify-content: flex-start; overflow: visible; padding: 0 10px;">
                            <div id="s3-manual-page4-action" class="action-block" style="border-bottom: none; width: 100%; height: auto; min-height: 0; flex: 0 0 auto; margin-bottom: 0; position: relative; display: flex; justify-content: center; align-items: flex-start; overflow: visible;">
                                <!--
                                    PAGE 4：比例與 v19 完全一致。
                                    非全螢幕時保留說明書原本的垂直捲軸，畫面從本頁最上方開始；
                                    全螢幕時依可用空間等比例縮放，完整顯示整張 25:16 畫布。
                                -->
                                <div id="s3-manual-page4-diagram" style="position: relative; width: min(100%, 820px); aspect-ratio: 25 / 16; height: auto; min-height: 0; margin: 0 auto; overflow: hidden; flex: 0 0 auto;">
                                    <div id="s3-manual-page4-stage" style="position: absolute; inset: 0; width: 100%; height: 100%; transform: none; transform-origin: center;">
                                        <svg class="svg-glow" viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid meet" fill="none" stroke="#fff" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 2; overflow: hidden;">
                                            <defs>
                                                <!-- 手稿中的導通固定點：只有叉叉，沒有額外橫線或圓點。 -->
                                                <g id="s3-manual-page4-anchor-v17" stroke="#fff" stroke-width="5.5" fill="none">
                                                    <path d="M -21 -21 L 21 21 M 21 -21 L -21 21" />
                                                </g>

                                                <!-- 四個人物共用相同頭身比例；帽尖固定在局部座標 (0,-72)。 -->
                                                <g id="s3-manual-page4-ground-player-v17" stroke="#fff" stroke-width="4.8" fill="none">
                                                    <polygon points="-25,-48 25,-48 0,-72" fill="#000" />
                                                    <circle cx="0" cy="-27" r="21" fill="#000" />
                                                    <line x1="0" y1="-6" x2="0" y2="56" />
                                                    <path d="M 0 12 C -10 39 -37 42 -51 15" />
                                                    <path d="M 0 12 C 10 39 37 42 51 15" />
                                                    <path d="M 0 56 C -11 88 -38 93 -52 61" />
                                                    <path d="M 0 56 C 11 88 38 93 52 61" />
                                                </g>

                                                <!-- 中央最高點人物：雙手與雙腳向上收成手稿中的 U 形。 -->
                                                <g id="s3-manual-page4-apex-player-v17" stroke="#fff" stroke-width="4.8" fill="none">
                                                    <polygon points="-25,-48 25,-48 0,-72" fill="#000" />
                                                    <circle cx="0" cy="-27" r="21" fill="#000" />
                                                    <line x1="0" y1="-6" x2="0" y2="56" />
                                                    <path d="M 0 12 C -12 45 -40 47 -53 5" />
                                                    <path d="M 0 12 C 12 45 40 47 53 5" />
                                                    <path d="M 0 56 C -13 89 -42 92 -55 48" />
                                                    <path d="M 0 56 C 13 89 42 92 55 48" />
                                                </g>

                                                <!-- 擺盪人物：與站立人物同尺寸，旋轉後形成第二與第四個姿勢。 -->
                                                <g id="s3-manual-page4-swing-player-v17" stroke="#fff" stroke-width="4.8" fill="none">
                                                    <polygon points="-25,-48 25,-48 0,-72" fill="#000" />
                                                    <circle cx="0" cy="-27" r="21" fill="#000" />
                                                    <line x1="0" y1="-6" x2="0" y2="56" />
                                                    <path d="M 0 12 C -10 38 -36 42 -50 16" />
                                                    <path d="M 0 12 C 10 38 36 42 50 16" />
                                                    <path d="M 0 56 C -11 87 -38 92 -52 61" />
                                                    <path d="M 0 56 C 11 87 38 92 52 61" />
                                                </g>
                                            </defs>

                                            <!-- 手稿中的兩條純白分隔線，完整穿過裁切畫布。 -->
                                            <g stroke="#fff" stroke-width="5" opacity="1">
                                                <line x1="285" y1="0" x2="285" y2="640" />
                                                <line x1="620" y1="0" x2="620" y2="640" />
                                            </g>

                                            <!-- 左欄：第一人與三條上升線。 -->
                                            <use href="#s3-manual-page4-ground-player-v17" transform="translate(190 360) scale(1.15)" />
                                            <g stroke="#fff" stroke-width="6" opacity="1">
                                                <line x1="164" y1="462" x2="164" y2="640" />
                                                <line x1="190" y1="475" x2="190" y2="640" />
                                                <line x1="216" y1="462" x2="216" y2="640" />
                                            </g>

                                            <!-- 第一個固定點與第二人：導線沿帽子中軸垂直接入帽尖。 -->
                                            <use href="#s3-manual-page4-anchor-v17" transform="translate(285 214)" />
                                            <line x1="285" y1="214" x2="320" y2="289" stroke="#fff" stroke-width="4.8" />
                                            <g transform="translate(355 364) rotate(-25) scale(1.15)">
                                                <use href="#s3-manual-page4-swing-player-v17" />
                                            </g>

                                            <!-- 第二與第三人之間的三條順時針擺動軌跡。 -->
                                            <g stroke="#fff" stroke-width="4" opacity="0.94">
                                                <path d="M 390 315 C 409 263 438 215 470 180" />
                                                <path d="M 410 320 C 427 273 451 230 480 201" />
                                                <path d="M 432 312 C 445 279 465 248 488 224" />
                                            </g>

                                            <!-- 中欄：C 再跳一次，到達最高點。 -->
                                            <use href="#s3-manual-page4-apex-player-v17" transform="translate(550 190) scale(1.15)" />

                                            <!-- A／D 與箭頭稍微分開，仍維持同一組操作提示。 -->
                                            <g stroke="#fff" stroke-width="5" opacity="1">
                                                <line x1="540" y1="325" x2="500" y2="325" />
                                                <polyline points="515,313 500,325 515,337" />
                                                <line x1="560" y1="325" x2="600" y2="325" />
                                                <polyline points="585,313 600,325 585,337" />
                                            </g>

                                            <!-- 第二固定點與最右側水平擺盪姿勢。 -->
                                            <use href="#s3-manual-page4-anchor-v17" transform="translate(620 100)" />
                                            <line x1="620" y1="100" x2="727" y2="125.7" stroke="#fff" stroke-width="4.8" />
                                            <g transform="translate(807.5 145) rotate(-76.5) scale(1.15)">
                                                <use href="#s3-manual-page4-swing-player-v17" />
                                            </g>
                                        </svg>

                                        <!-- 按鍵沿用 PAGE 1～3 的 .key-btn 字型、字重、邊框與陰影。 -->
                                        <!-- 左 C 位於三條垂直躍升線的正左方。 -->
                                        <div class="key-btn" aria-hidden="true" style="position: absolute; left: 11.5%; top: 77%; transform: translate(-50%, -50%); margin: 0; z-index: 4; border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">C</div>
                                        <!-- 左 Q 位於第一個固定叉叉左上方約 45°。 -->
                                        <div class="key-btn" aria-hidden="true" style="position: absolute; left: 23%; top: 24.8%; transform: translate(-50%, -50%); margin: 0; z-index: 4; border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">Q</div>
                                        <!-- 中 C 向左、向下，落在三條擺動軌跡中段的正上方，且不碰觸線條。 -->
                                        <div class="key-btn" aria-hidden="true" style="position: absolute; left: 40.5%; top: 29%; transform: translate(-50%, -50%); margin: 0; z-index: 4; border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">C</div>
                                        <div class="key-btn" aria-hidden="true" style="position: absolute; left: 51.5%; top: 58%; transform: translate(-50%, -50%); margin: 0; z-index: 4; border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">A</div>
                                        <div class="key-btn" aria-hidden="true" style="position: absolute; left: 58.5%; top: 58%; transform: translate(-50%, -50%); margin: 0; z-index: 4; border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">D</div>
                                        <!-- 右 Q 靠近縮短後的導通線，位於線段下方。 -->
                                        <div class="key-btn" aria-hidden="true" style="position: absolute; left: 69%; top: 24.2%; transform: translate(-50%, -50%); margin: 0; z-index: 4; border-color: var(--brand-blue); color: var(--brand-blue); box-shadow: 0 4px 0 #042a53, 0 0 10px rgba(0,242,254,0.4);">Q</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="pagination-bar" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 40px; border-top: 1px dashed rgba(0, 242, 254, 0.3); background: rgba(0, 0, 0, 0.4); border-radius: 0 0 12px 12px;">
                    <button id="prev-page-btn-s3" class="page-btn disabled" title="Previous Page">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="15,18 9,12 15,6" fill="currentColor"/></svg>
                    </button>
                    <div id="page-indicator-s3" style="font-family: 'Orbitron', sans-serif; color: var(--brand-blue); letter-spacing: 4px; font-size: 1.2rem; text-shadow: 0 0 8px rgba(0,242,254,0.5);">PAGE 1 / ${hasThirdManual ? 4 : (bookPickedUp ? 2 : 1)}</div>
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
    const page3 = document.getElementById('manual-page-3-s3'); 
    const page4 = document.getElementById('manual-page-4-s3'); 
    const page4Panel = document.getElementById('s3-manual-page4-panel');
    const page4Action = document.getElementById('s3-manual-page4-action');
    const page4Diagram = document.getElementById('s3-manual-page4-diagram');
    const page4Stage = document.getElementById('s3-manual-page4-stage');
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

    // 🌟 放在 initScene3 頂部附近
    window._easterEggTriggered = false;
    window._isEasterEggActive = false;
    window._easterEggAnimationDone = false; // 紀錄出場動畫是否已播完
    window._easterEggQHeld = false;         // 紀錄 Q 鍵是否正被按住

    function savePreEasterEquipmentState() {
        preEasterEquipmentSnapshot = {

            // Hammer 本身是否裝備在武器手
            isHammerEquipped: isHammerEquipped,

            // Hammer 所在欄位
            hammerSlot: window._hammerSlot
                ? { ...window._hammerSlot }
                : { type: 'handR', x: 555, y: 415 },

            /*
                Hammer 裝備中時，
                hand1Item 本來就應該視為空。
                避免把舊的 'hammer' 字串存回去。
            */
            hand1Item:
                isHammerEquipped
                    ? null
                    : hand1Item,

            // 左手三角形
            hand2Item: hand2Item,

            // 頭部裝備
            headItem: headItem,

            // 整個 17 格背包完整複製
            backpackGrid:
                backpackGrid.map(slot => {

                    if (!slot) return null;

                    return {
                        type: slot.type,
                        count: slot.count || 1
                    };
                })
        };
    }

    function restorePreEasterEquipmentState() {

        if (!preEasterEquipmentSnapshot) {

            // 理論上不應進來，但做保底
            isHammerEquipped = true;

            window._hammerSlot = {
                type: 'handR',
                x: 555,
                y: 415
            };

            hand1Item = null;
            hand2Item = 'body';

        } else {

            // =====================================================
            // ① 恢復資料
            // =====================================================

            isHammerEquipped =
                preEasterEquipmentSnapshot.isHammerEquipped;

            window._hammerSlot = {
                ...preEasterEquipmentSnapshot.hammerSlot
            };

            hand1Item =
                preEasterEquipmentSnapshot.hand1Item;

            hand2Item =
                preEasterEquipmentSnapshot.hand2Item;

            headItem =
                preEasterEquipmentSnapshot.headItem;

            backpackGrid =
                preEasterEquipmentSnapshot.backpackGrid.map(
                    slot => {

                        if (!slot) return null;

                        return {
                            type: slot.type,
                            count: slot.count || 1
                        };
                    }
                );
        }


        // =====================================================
        // ② 失敗落地後已經不是彩蛋裝備模式
        // =====================================================

        window._isEasterEggActive = false;
        window._easterEggQHeld = false;


        // =====================================================
        // ③ Hammer 強制恢復正常武器欄
        //
        // 因為觸發彩蛋的條件本來就是
        // isHammerEquipped === true
        // =====================================================

        isHammerEquipped = true;

        window._hammerSlot = {
            type: 'handR',
            x: 555,
            y: 415
        };

        hand1Item = null;


        // =====================================================
        // ④ 把被特殊掉落動畫搬過 DOM 的物件放回原父層
        // =====================================================

        const armL =
            document.getElementById('armL-s3');

        const armR =
            document.getElementById('armR-s3');

        const stickmanBody =
            document.getElementById('stickman-body-s3');

        const hand1Display =
            document.getElementById('held-item-hand1');

        const hand2Display =
            document.getElementById('held-item-hand2');

        const headDisplay =
            document.getElementById('held-item-head');


        /*
        你前面的特殊墜落姿勢曾把 hand1Display
        搬到另一隻手，因此這裡一定要搬回原來 DOM。
        */
        if (
            hand1Display &&
            armL &&
            hand1Display.parentNode !== armL
        ) {
            armL.appendChild(hand1Display);
        }

        if (
            hand2Display &&
            armR &&
            hand2Display.parentNode !== armR
        ) {
            armR.appendChild(hand2Display);
        }

        if (
            headDisplay &&
            stickmanBody &&
            headDisplay.parentNode !== stickmanBody
        ) {
            stickmanBody.appendChild(headDisplay);
        }


        // =====================================================
        // ⑤ 恢復三個裝備原本的正常定位
        // =====================================================

        if (hand1Display) {

            hand1Display.setAttribute(
                'transform',
                'translate(-8, 32) scale(0.35) rotate(-20, 65, 90)'
            );

            hand1Display.style.transition = '';
            hand1Display.style.filter =
                'drop-shadow(0 0 5px rgba(255,255,255,0.8))';
        }

        if (hand2Display) {

            hand2Display.setAttribute(
                'transform',
                'translate(6, 52) scale(0.35) rotate(-35, 65, 90)'
            );

            hand2Display.style.transition = '';
            hand2Display.style.filter =
                'drop-shadow(0 0 5px rgba(255,255,255,0.8))';
        }

        if (headDisplay) {

            headDisplay.setAttribute(
                'transform',
                'translate(17, -15) scale(0.35)'
            );

            headDisplay.style.transition = '';
        }


        // =====================================================
        // ⑥ 清除 Hammer 彩蛋消失動畫留下的 inline 樣式
        // =====================================================

        const hammerVisual =
            document.getElementById('held-hammer-s3');

        if (hammerVisual) {

            hammerVisual.style.transition = '';
            hammerVisual.style.filter = '';
            hammerVisual.style.opacity = '1';
        }


        // =====================================================
        // ⑦ 最後統一讓原本裝備系統重新渲染
        // =====================================================

        updateMainStickmanEquipment();
    }

    // =====================================================
    // 🌟 彩蛋挑戰失敗後完整重置
    // 玩家已經掉到地板、看不到上方時才呼叫
    // =====================================================

    function resetFailedEasterEggChallenge() {

        // =====================================================
        // ① 重新開放彩蛋觸發
        // =====================================================

        window._easterEggTriggered = false;

        window._isEasterEggActive = false;

        window._easterEggAnimationDone = false;

        window._easterEggQHeld = false;

        window._easterEggFrozen = false;

        window._easterEggUnsafeFalling = false;

        window._easterEggAntennaExtension = 0;


        // =====================================================
        // ② 清除上一輪天線橋樑
        // =====================================================

        window._easterEggBridge = null;


        // =====================================================
        // ③ 刪除「固定在世界裡」的倒下天線
        //
        // 用 querySelectorAll 是為了防止之後重複挑戰時
        // 萬一留下多個同 ID 元素，也全部清掉
        // =====================================================

        document
            .querySelectorAll('[id="ee-fixed-antenna-container"]')
            .forEach(el => el.remove());


        // =====================================================
        // ④ 清掉玩家身上被剝離出去的舊天線
        //
        // 第一次傾倒時 ee-falling-group 已經被從
        // held-item-hand1 搬到一個匿名 wrapper 裡。
        //
        // 如果不刪掉，下一輪會出現重複
        // id="ee-falling-group"
        // =====================================================

        const hand1Display =
            document.getElementById('held-item-hand1');

        document
            .querySelectorAll('[id="ee-falling-group"]')
            .forEach(group => {

                const parent =
                    group.parentNode;

                // 如果已經被搬到匿名 wrapper
                // 直接連 wrapper 一起刪掉
                if (
                    parent &&
                    parent !== hand1Display
                ) {

                    parent.remove();

                } else {

                    // 還在 hand1Display 裡就只刪 group
                    group.remove();
                }
            });


        // =====================================================
        // ⑤ 恢復 hand1Display
        //
        // 上一輪的傾倒流程曾經可能留下 display:none
        // 或舊的天線 SVG
        // =====================================================

        if (hand1Display) {

            hand1Display.innerHTML = '';

            hand1Display.style.display = '';

            hand1Display.style.removeProperty(
                'transition'
            );

            hand1Display.style.removeProperty(
                'filter'
            );
        }


        // =====================================================
        // ⑥ PLA 上層平台恢復「尚未解鎖」
        // =====================================================

        plaTopPlatformSolid = false;

        isOnPlaTopPlatform = false;

        plaTopPlatformElevationPx = 0;

        plaTopPlatformPreviousFootWorldY = null;

        plaTopPlatformJumpCameraLocked = false;

        plaTopPlatformJumpCameraOffsetPx = 0;


        // =====================================================
        // ⑦ 移除隱藏碰撞線的 solid 標記
        // =====================================================

        const plaTopLine =
            document.getElementById(
                'pla-top-platform-line-s3'
            );

        if (plaTopLine) {

            plaTopLine.removeAttribute(
                'data-solid'
            );
        }


        // =====================================================
        // ⑧ PLA 白線取消發光
        // 回到第一次還沒跳上去的狀態
        // =====================================================

        document
            .querySelectorAll(
                '.pla-top-platform-visible'
            )
            .forEach(seg => {

                seg.style.filter = '';
            });


        // =====================================================
        // ⑨ Q 姿勢完全恢復
        // =====================================================

        toggleEasterEggQPose(false);


        // =====================================================
        // ⑩ 下一輪重新保存新的裝備快照
        //
        // 玩家落地後如果有重新整理背包，
        // 下一次彩蛋應該保存「當下」的狀態
        // =====================================================

        preEasterEquipmentSnapshot = null;
    }

    function updateMainStickmanEquipment() {
        const heldHammer = document.getElementById('held-hammer-s3');
        const held1 = document.getElementById('held-1-s3');
        const held0 = document.getElementById('held-0-s3');
        const hand1Display = document.getElementById('held-item-hand1');
        const hand2Display = document.getElementById('held-item-hand2');
        
        let headDisplay = document.getElementById('held-item-head');
        if (!headDisplay) {
            const stickmanBody = document.getElementById('stickman-body-s3');
            if (stickmanBody) {
                headDisplay = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                headDisplay.id = 'held-item-head';
                headDisplay.setAttribute('opacity', '0');
                headDisplay.setAttribute('transform', 'translate(17, -15) scale(0.35)');
                headDisplay.style.filter = 'drop-shadow(0 0 5px rgba(255,255,255,0.8))';
                stickmanBody.appendChild(headDisplay);
            }
        }

        // --- 1. 主手 (Hand 1 - 槌子 或 彩蛋三角怪) ---
        if (isHammerEquipped) {
            if (heldHammer) heldHammer.style.opacity = '1';
            if (held1) held1.style.opacity = '0';
            if (hand1Display) hand1Display.style.opacity = '0';
        } else {
            if (heldHammer) heldHammer.style.opacity = '0';
            
            if (hand1Item) {
                if (held1) held1.style.opacity = '0';
                if (hand1Display) {
                    hand1Display.innerHTML = getItemSVG(hand1Item);
                    if (window._isEasterEggActive) {
                        // 🌟 套用完美的 translate(73, 53) 與翻轉！
                        hand1Display.setAttribute('transform', 'translate(73, 53) scale(-0.35, 0.35) rotate(-35, 65, 90)');
                    } else {
                        hand1Display.setAttribute('transform', 'translate(-8, 32) scale(0.35) rotate(-20, 65, 90)');
                    }
                    hand1Display.style.opacity = '1';
                    hand1Display.parentNode.appendChild(hand1Display);
                }
            } else {
                if (hand1Display) hand1Display.style.opacity = '0';
                if (held1) held1.style.opacity = ammoOnes > 0 ? '1' : '0';
            }
        }

        // --- 2. 副手 (Hand 2 - 三角怪) ---
        if (hand2Item) {
            if (held0) held0.style.opacity = '0';
            if (hand2Display) {
                hand2Display.innerHTML = getItemSVG(hand2Item);
                hand2Display.style.opacity = '1';
                hand2Display.parentNode.appendChild(hand2Display);
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

        // 🌟 防呆：彩蛋模式下絕對隱藏 0 和 1
        if (window._isEasterEggActive) {
            if (held1) held1.style.opacity = '0';
            if (held0) held0.style.opacity = '0';
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

    function getManualPageCount() {
        if (hasThirdManual) return 4;
        return bookPickedUp ? 2 : 1;
    }

    // PAGE 4 使用同一張 25:16 畫布：
    // - 非全螢幕：維持原比例與完整高度，交由 manualContent 的原生捲軸瀏覽。
    // - 全螢幕：依內容區可用寬高等比例縮放，整張一次顯示完成。
    function syncManualPage4Layout(resetScroll = false) {
        if (!page4 || !page4Panel || !page4Action || !page4Diagram || !page4Stage || !manualContent) return;

        const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
        const isFullscreen = Boolean(fullscreenElement);
        const aspectWidth = 25;
        const aspectHeight = 16;
        const maxDiagramWidth = 820;

        // 先恢復可量測的共同基準，避免前一次全螢幕／視窗模式留下尺寸。
        page4Stage.style.inset = '0';
        page4Stage.style.top = '0';
        page4Stage.style.left = '0';
        page4Stage.style.transform = 'none';
        page4Stage.style.width = '100%';
        page4Stage.style.height = '100%';

        if (isFullscreen) {
            page4.style.height = '100%';
            page4.style.minHeight = '0';
            page4.style.flex = '1 1 auto';
            page4.style.overflow = 'hidden';

            page4Panel.style.height = '100%';
            page4Panel.style.minHeight = '0';
            page4Panel.style.flex = '1 1 auto';
            page4Panel.style.justifyContent = 'center';
            page4Panel.style.overflow = 'hidden';

            page4Action.style.height = '100%';
            page4Action.style.minHeight = '0';
            page4Action.style.flex = '1 1 auto';
            page4Action.style.alignItems = 'center';
            page4Action.style.overflow = 'hidden';

            // 先讓容器吃滿可用空間，再以 25:16 計算不變形的最大尺寸。
            page4Diagram.style.width = '1px';
            page4Diagram.style.height = '1px';
            page4Diagram.style.aspectRatio = 'auto';
            const availableWidth = Math.max(1, page4Action.clientWidth);
            const availableHeight = Math.max(1, page4Action.clientHeight);
            const fittedWidth = Math.max(1, Math.min(maxDiagramWidth, availableWidth, availableHeight * aspectWidth / aspectHeight));
            const fittedHeight = fittedWidth * aspectHeight / aspectWidth;
            page4Diagram.style.width = `${fittedWidth}px`;
            page4Diagram.style.height = `${fittedHeight}px`;
            manualContent.style.overflowY = 'hidden';
        } else {
            page4.style.height = 'auto';
            page4.style.minHeight = '0';
            page4.style.flex = '0 0 auto';
            page4.style.overflow = 'visible';

            page4Panel.style.height = 'auto';
            page4Panel.style.minHeight = '0';
            page4Panel.style.flex = '0 0 auto';
            page4Panel.style.justifyContent = 'flex-start';
            page4Panel.style.overflow = 'visible';

            page4Action.style.height = 'auto';
            page4Action.style.minHeight = '0';
            page4Action.style.flex = '0 0 auto';
            page4Action.style.alignItems = 'flex-start';
            page4Action.style.overflow = 'visible';

            // 完整保留目前的比例與最大寬度；高度由 25:16 精確計算，超出內容區時自然出現捲軸。
            page4Diagram.style.width = 'min(100%, 820px)';
            page4Diagram.style.height = 'auto';
            page4Diagram.style.aspectRatio = '25 / 16';
            manualContent.style.overflowY = 'auto';
        }

        if (resetScroll) manualContent.scrollTop = 0;
    }

    // 全螢幕切換或視窗尺寸改變時，自動維持 PAGE 4 的完整比例。
    if (typeof ResizeObserver === 'function') {
        const page4LayoutObserver = new ResizeObserver(() => {
            if (!isCurrentScene3Instance()) {
                page4LayoutObserver.disconnect();
                return;
            }
            if (currentManualPage === 4 && manualModal.classList.contains('manual-active')) {
                syncManualPage4Layout(false);
            }
        });
        page4LayoutObserver.observe(manualContent);
    }

    function updateManualPage(targetPage, useFlash = true) {
        if (useFlash) {
            manualContent.classList.remove('scan-transition');
            void manualContent.offsetWidth; 
            manualContent.classList.add('scan-transition');
        }

        setTimeout(() => {
            const totalPages = getManualPageCount();
            const numericTarget = Number(targetPage);
            const safeTarget = Number.isFinite(numericTarget)
                ? Math.max(1, Math.min(totalPages, Math.round(numericTarget)))
                : 1;

            currentManualPage = safeTarget;
            [page1, page2, page3, page4].forEach((page, index) => {
                if (!page) return;
                page.classList.toggle('active-page', index + 1 === currentManualPage);
            });

            btnPrev.classList.toggle('disabled', currentManualPage <= 1);
            btnNext.classList.toggle('disabled', currentManualPage >= totalPages);
            pageIndicator.innerText = `PAGE ${currentManualPage} / ${totalPages}`;

            // 每次進入 PAGE 4 都從畫面最上方開始；非全螢幕可向下捲動，
            // 全螢幕則將整張圖等比例縮放於可視區內。
            if (currentManualPage === 4) {
                manualContent.scrollTop = 0;
                requestAnimationFrame(() => {
                    syncManualPage4Layout(true);
                });
            } else {
                manualContent.style.overflowY = 'auto';
                manualContent.scrollTop = 0;
            }
        }, useFlash ? 100 : 0); 
    }

    let page3AutoTurnTimer = null;

    function clearPage3AutoTurnTimer() {
        if (page3AutoTurnTimer !== null) {
            clearSceneTimeout(page3AutoTurnTimer);
            page3AutoTurnTimer = null;
        }
    }

    function schedulePage4AutoTurn() {
        clearPage3AutoTurnTimer();
        page3AutoTurnTimer = scheduleSceneTimeout(() => {
            page3AutoTurnTimer = null;
            if (
                !isCurrentScene3Instance() ||
                !hasThirdManual ||
                !manualModal.classList.contains('manual-active') ||
                currentManualPage !== 3
            ) return;

            playActionSfx(sfxPageTurn);
            updateManualPage(4);
        }, 5000);
    }

    btnPrev.addEventListener('click', () => {
        if (currentManualPage <= 1) return;
        clearPage3AutoTurnTimer();
        playActionSfx(sfxPageTurn);
        updateManualPage(currentManualPage - 1);
    });

    btnNext.addEventListener('click', () => {
        const totalPages = getManualPageCount();
        if (currentManualPage >= totalPages) return;
        clearPage3AutoTurnTimer();
        playActionSfx(sfxPageTurn);
        updateManualPage(currentManualPage + 1);
    });

    function openManual(targetPage = 1, autoTurnPage4 = false) {
        if (bossTimelineRunning || isPlayerJumping || postBossBookSequenceRunning) return;
        const requestedPage = Number.isInteger(targetPage) ? targetPage : 1;
        clearPage3AutoTurnTimer();
        playActionSfx(sfxOpenBook);
        updateManualPage(requestedPage, false); 
        manualModal.classList.add('manual-active');
        isPlayerControllable = false; stickman.classList.add('stand-still');
        
        const gameScreen = document.getElementById('gameScreen');
        const sceneManager = document.getElementById('scene-manager');
        const gameControls = document.querySelector('.game-controls');
        if (gameScreen) gameScreen.style.zIndex = 'auto'; 
        if (sceneManager) sceneManager.style.zIndex = '20'; 
        if (gameControls) gameControls.style.pointerEvents = 'none'; 

        if (autoTurnPage4 && requestedPage === 3 && hasThirdManual) {
            schedulePage4AutoTurn();
        }
    }

    closeManual.addEventListener('click', () => {
        clearPage3AutoTurnTimer();
        manualModal.classList.remove('manual-active');
        
        // 🌟 嚴格防呆：彩蛋期間絕對不可以恢復移動！
        if(!playerDead && !window._isEasterEggActive) {
            isPlayerControllable = true;
        }

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
    let isPlayerJumping = false;
    let playerJumpOffsetPx = 0;
    let playerJumpFrameId = null;
    let playerJumpHorizontalVelocity = 0;
    let playerJumpLandingWorldX = 20;
    let playerJumpProgress = 0;
    let playerJumpHeightPx = 120;
    let playerJumpVerticalVelocityPx = 0;

    // ==============================================================
    // 🌟 PAGE 3 解鎖後：三角帽 × PLA 導通 X／圓點物理擺盪系統
    // playerWorldElevationPx 是角色離開 BOSS 後地面的永久世界高度；
    // playerJumpOffsetPx 仍只負責原本 420ms 的短跳，兩者相加才是實際高度。
    // ==============================================================
    let playerWorldElevationPx = 0;
    let verticalCameraOffsetPx = 0;
    let verticalCameraTargetPx = 0;
    // 只計算 PLA 導通／平台離開後的拋體滯空時間；一般地面短跳完全不參與。
    // 下降越久，垂直鏡頭的向下追蹤速度才會逐步提高，短距離落下仍維持柔和。
    let plaBallisticAirTimeSeconds = 0;
    // 在 PLA 最上方實體橫線進行普通 C 跳躍時，垂直鏡頭固定在起跳瞬間的位置。
    let plaTopPlatformJumpCameraLocked = false;
    let plaTopPlatformJumpCameraOffsetPx = 0;
    // 水平鏡頭永遠沿用最初的「角色位於畫面左側約 20%」構圖。
    // 只有真正進入 PLA 帽子導通／放線拋體時，才在同一構圖上加入死區與阻尼；
    // 普通跳躍、地面與最上方平台絕不再依 worldX 邊界切換鏡頭模式。
    let horizontalCameraTargetX = 0;
    let horizontalCameraInitialized = false;
    let horizontalCameraWasBuffered = false;
    // 從 PLA 緩衝模式落回地板／平台時，只衰減「舊鏡頭與原始鏡頭」的殘差，
    // 同時仍逐幀套用 worldX - 20，因此不會在相同 X 軸位置突然順移。
    let horizontalCameraHandoffOffsetX = 0;
    // 抓到新導通點或落上高層平台時，暫時降低鏡頭追蹤速度，完整平移到新構圖。
    let cameraFocusTransitionUntil = 0;

    let isPlaHatQHeld = false;
    // C 會消耗目前的 Q 狀態；實體 Q 鍵未放開前，重複 keydown 不得重新導通。
    let plaHatQBlockedUntilRelease = false;
    let isPlaHatTethered = false;
    let isPlaHatBallistic = false;
    let plaHatAnchor = null;
    let plaHatRopeLengthPx = 0;
    let plaHatAngleRad = 0;
    let plaHatAngularVelocity = 0;
    let plaHatHatOffsetY = -70;
    let plaHatVelocityXPx = 0;
    let plaHatVelocityUpPx = 0;
    let plaHatLastAnchorKey = null;
    let plaHatSameAnchorBlockUntil = 0;
    let plaHatCurrentPose = null;
    let plaHatTetherLayer = null;
    let plaHatTetherLine = null;
    let plaHatTetherAnchorGlow = null;

    // BOSS 吹飛動畫的最終座標會被固定保存，避免恢復控制的第一幀產生飄移。
    let postBossGroundY = null;
    let postBossLandingAnchor = null;

    // BOSS 離場後，玩家向右走到 PLA 前方一段距離時觸發風吹落書本事件。
    // PLA 主圖起點為 115%，觸發點 72% 會保留約 43% 的世界距離。
    const POST_BOSS_BOOK_TRIGGER_WORLD_X = 72;
    // 水平緩衝不再使用任何 worldX 分界；是否啟用只由真實導通／拋體狀態決定。
    let postBossBookSequenceStarted = hasThirdManual;
    let postBossBookSequenceRunning = false;
    let postBossBookReadyToPick = false;
    let postBossBookPickedUp = hasThirdManual;
    let isNearPostBossBook = false;
    let postBossBookElement = null;
    let postBossBookPromptElement = null;

    // PLA 最上方 H 橫線：角色曾經跳到線上方後，永久啟用為可站立的平台。
    let plaTopPlatformSolid = false;
    let isOnPlaTopPlatform = false;
    let plaTopPlatformElevationPx = 0;
    let plaTopPlatformPreviousFootWorldY = null;

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
    const keys = { w: false, a: false, s: false, d: false, q: false };

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
        return !destroyed &&
            window._scene3InstanceToken === scene3InstanceToken &&
            scene3.isConnected;
    }

    function waitBossTimeline(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function clearMovementKeys() {
        Object.keys(keys).forEach(key => { keys[key] = false; });
        isPlaHatQHeld = false;
        plaHatQBlockedUntilRelease = false;
        if (isPlaHatTethered) forceClearPlaHatTether();
    }

    function commitPostBossLandingAnchor() {
        if (!postBossLandingAnchor || !isCurrentScene3Instance()) return;

        if (playerJumpFrameId !== null) {
            cancelAnimationFrame(playerJumpFrameId);
            playerJumpFrameId = null;
        }

        worldX = postBossLandingAnchor.worldX;
        py = postBossLandingAnchor.py;
        cameraX = postBossLandingAnchor.cameraX;
        horizontalCameraTargetX = cameraX;
        horizontalCameraInitialized = true;
        horizontalCameraWasBuffered = false;
        horizontalCameraHandoffOffsetX = 0;
        cameraFocusTransitionUntil = 0;
        facing = postBossLandingAnchor.facing;
        postBossGroundY = postBossLandingAnchor.py;

        playerJumpOffsetPx = 0;
        playerJumpHorizontalVelocity = 0;
        playerJumpLandingWorldX = worldX;
        playerJumpProgress = 0;
        playerJumpVerticalVelocityPx = 0;
        playerWorldElevationPx = 0;
        verticalCameraOffsetPx = 0;
        verticalCameraTargetPx = 0;
        plaBallisticAirTimeSeconds = 0;
        plaTopPlatformJumpCameraLocked = false;
        plaTopPlatformJumpCameraOffsetPx = 0;
        plaTopPlatformSolid = false;
        isOnPlaTopPlatform = false;
        plaTopPlatformElevationPx = 0;
        plaTopPlatformPreviousFootWorldY = null;
        forceClearPlaHatTether();
        isPlaHatBallistic = false;
        plaHatVelocityXPx = 0;
        plaHatVelocityUpPx = 0;
        isPlayerJumping = false;
        resetPlayerJumpPose();
        stickman.classList.remove('player-jumping', 'player-tumble', 'boss-wind-pushed');
        stickman.classList.add('stand-still');

        const anchoredScreenX = worldX - cameraX;
        stickman.style.left = `${anchoredScreenX}%`;
        stickman.style.top = `${py}%`;
        stickman.style.transform = `translate(-50%, -50%) scaleX(${facing})`;
        stickman.style.filter = '';
        environmentLayer.style.transform = `translate(${-cameraX}%, 0px)`;
        hidePlaHatTetherVisual();
    }

    // ==============================================================
    // 🌟 取得 PAGE 3 後解鎖的 C 鍵垂直跳躍：五個正式序列幀
    // 狀態 2 / 6、狀態 3 / 5 成對對稱，狀態 4 對準最高點。
    // ==============================================================
    const PLAYER_JUMP_DURATION_MS = 420;
    const PLAYER_JUMP_LANDING_BLEND_MS = 60;
    // 以世界百分比／秒表示的空中水平物理；60 FPS 下接近原本 0.4%／幀的地面速度。
    const PLAYER_JUMP_AIR_MAX_SPEED = 24;
    const PLAYER_JUMP_AIR_ACCELERATION = 140;
    const PLAYER_JUMP_AIR_DRAG = 9;

    // 每一點都精準對應 PLA 圖上可導通的 X 中心或頂部圓點中心（SVG viewBox 座標）。
    // 圓點與 X 共用完全相同的搜尋半徑、固定點、單擺、放線與防重抓邏輯。
    const PLA_HAT_CONDUCTION_POINTS = Object.freeze([
        { key: 'dot-h-x130', x: 130, y: 75, kind: 'dot' },
        { key: 'dot-i-x155', x: 155, y: 125, kind: 'dot' },
        { key: 'dot-c-x180', x: 180, y: 175, kind: 'dot' },
        { key: 'dot-cbar-x205', x: 205, y: 190, kind: 'dot' },
        { key: 'dot-e-x230', x: 230, y: 225, kind: 'dot' },
        { key: 'dot-ebar-x255', x: 255, y: 240, kind: 'dot' },
        { key: 'dot-n-x280', x: 280, y: 275, kind: 'dot' },
        { key: 'dot-s-x305', x: 305, y: 325, kind: 'dot' },
        { key: 'r1-x155', x: 155, y: 350 },
        { key: 'r1-x180', x: 180, y: 350 },
        { key: 'r1-x230', x: 230, y: 350 },
        { key: 'r2-x130', x: 130, y: 400 },
        { key: 'r2-x155', x: 155, y: 400 },
        { key: 'r3-x155', x: 155, y: 450 },
        { key: 'r3-x305', x: 305, y: 450 },
        { key: 'r4-x155', x: 155, y: 500 },
        { key: 'r4-x205', x: 205, y: 500 },
        { key: 'r4-x305', x: 305, y: 500 },
        { key: 'r5-x155', x: 155, y: 550 },
        { key: 'r5-x180', x: 180, y: 550 },
        { key: 'r5-x255', x: 255, y: 550 },
        { key: 'r5-x280', x: 280, y: 550 },
        { key: 'r5-x305', x: 305, y: 550 },
        { key: 'r6-x155', x: 155, y: 600 },
        { key: 'r6-x180', x: 180, y: 600 },
        { key: 'r6-x230', x: 230, y: 600 },
        { key: 'r6-x305', x: 305, y: 600 },
        { key: 'r7-x130', x: 130, y: 650 },
        { key: 'r7-x155', x: 155, y: 650 },
        { key: 'r8-x180', x: 180, y: 700 },
        { key: 'r8-x230', x: 230, y: 700 },
        { key: 'r9-x130', x: 130, y: 750 },
        { key: 'r9-x155', x: 155, y: 750 }
    ]);

    // 約半個角色身高內才可導通；其他數值使用 px / s 的實際物理單位。
    const PLA_HAT_LATCH_BODY_RATIO = 0.52;
    const PLA_HAT_MIN_ROPE_LENGTH_PX = 18;
    const PLA_HAT_PENDULUM_GRAVITY = 1550;
    const PLA_HAT_PENDULUM_DAMPING = 0.72;
    const PLA_HAT_CONTROL_ACCELERATION = 10.5;
    const PLA_HAT_MAX_ANGULAR_SPEED = 5.5;
    const PLA_HAT_MAX_SWING_ANGLE = 1.48;
    const PLA_HAT_BALLISTIC_GRAVITY = 1800;
    const PLA_HAT_LAUNCH_UP_SPEED = 800;
    const PLA_HAT_REATTACH_BLOCK_MS = 280;

    const PLAYER_JUMP_NORMAL_POSE = Object.freeze({
        // Scene 1 / 2 原始幾何基準。
        headY: 32,
        torsoTopY: 48,
        torsoBottomY: 75,
        shoulderY: 56,
        handY: 85,
        hipY: 75,
        footY: 105,
        armAngle: 35,
        armBow1: 0, armC1Y: 65,
        armBow2: 0, armC2Y: 76,
        legAngle: 15,
        legBow1: 0, legC1Y: 85,
        legBow2: 0, legC2Y: 95
    });

    const PLAYER_JUMP_SEQUENCE = Object.freeze([
        // 狀態 2：開始彎曲，整體高度只增加約 1%。
        Object.freeze({
            headY: 31.8,
            torsoTopY: 47.8,
            torsoBottomY: 75.4,
            shoulderY: 55.9,
            handY: 85.3,
            hipY: 75.4,
            footY: 105.7,
            armAngle: 56,
            armBow1: 2, armC1Y: 65,
            armBow2: 3, armC2Y: 76,
            legAngle: 42,
            legBow1: 2, legC1Y: 84,
            legBow2: 4, legC2Y: 97
        }),
        // 狀態 3：手臂接近水平，腳形成較寬的淺弧。
        Object.freeze({
            headY: 31.2,
            torsoTopY: 47.2,
            torsoBottomY: 76.0,
            shoulderY: 55.7,
            handY: 85.8,
            hipY: 76.0,
            footY: 106.5,
            armAngle: 88,
            armBow1: 6, armC1Y: 64,
            armBow2: 6, armC2Y: 78,
            legAngle: 58,
            legBow1: 4, legC1Y: 85,
            legBow2: 8, legC2Y: 100
        }),
        // 狀態 4：最高點；整體幾何約拉長 4.5%，但線寬仍固定 8px。
        Object.freeze({
            headY: 30.5,
            torsoTopY: 46.5,
            torsoBottomY: 76.8,
            shoulderY: 55.5,
            handY: 86.2,
            hipY: 76.8,
            footY: 107.5,
            armAngle: 108,
            armBow1: 8, armC1Y: 65,
            armBow2: 8, armC2Y: 79,
            legAngle: 72,
            legBow1: 6, legC1Y: 85,
            legBow2: 10, legC2Y: 100
        }),
        // 狀態 5：與狀態 3 對稱，開始下降。
        Object.freeze({
            headY: 31.2,
            torsoTopY: 47.2,
            torsoBottomY: 76.0,
            shoulderY: 55.7,
            handY: 85.8,
            hipY: 76.0,
            footY: 106.5,
            armAngle: 88,
            armBow1: 6, armC1Y: 64,
            armBow2: 6, armC2Y: 78,
            legAngle: 58,
            legBow1: 4, legC1Y: 85,
            legBow2: 8, legC2Y: 100
        }),
        // 狀態 6：與狀態 2 對稱，準備落地回到狀態 7。
        Object.freeze({
            headY: 31.8,
            torsoTopY: 47.8,
            torsoBottomY: 75.4,
            shoulderY: 55.9,
            handY: 85.3,
            hipY: 75.4,
            footY: 105.7,
            armAngle: 56,
            armBow1: 2, armC1Y: 65,
            armBow2: 3, armC2Y: 76,
            legAngle: 42,
            legBow1: 2, legC1Y: 84,
            legBow2: 4, legC2Y: 97
        })
    ]);

    function playerJumpClamp01(value) {
        return Math.max(0, Math.min(1, value));
    }

    function playerJumpSmoothstep(value) {
        const t = playerJumpClamp01(value);
        return t * t * (3 - 2 * t);
    }

    function interpolatePlayerJumpPose(fromPose, toPose, progress) {
        const t = playerJumpSmoothstep(progress);
        const result = {};
        Object.keys(PLAYER_JUMP_NORMAL_POSE).forEach(key => {
            result[key] = fromPose[key] + (toPose[key] - fromPose[key]) * t;
        });
        return result;
    }

    function getPlayerJumpSequencePose(progress) {
        const clamped = playerJumpClamp01(progress);
        const scaled = clamped * (PLAYER_JUMP_SEQUENCE.length - 1);
        const index = Math.min(PLAYER_JUMP_SEQUENCE.length - 2, Math.floor(scaled));
        const localProgress = scaled - index;
        return interpolatePlayerJumpPose(
            PLAYER_JUMP_SEQUENCE[index],
            PLAYER_JUMP_SEQUENCE[index + 1],
            localProgress
        );
    }

    function formatPlayerJumpNumber(value) {
        return Number(value.toFixed(3));
    }

    function applyPlayerJumpPose(pose) {
        const head = document.getElementById('stickman-head-s3');
        const torso = document.getElementById('stickman-torso-s3');
        const armLPath = document.getElementById('armL-path-s3');
        const armRPath = document.getElementById('armR-path-s3');
        const legLPath = document.getElementById('legL-path-s3');
        const legRPath = document.getElementById('legR-path-s3');
        if (!head || !torso || !armLPath || !armRPath || !legLPath || !legRPath) return;

        const headY = formatPlayerJumpNumber(pose.headY);
        const torsoTopY = formatPlayerJumpNumber(pose.torsoTopY);
        const torsoBottomY = formatPlayerJumpNumber(pose.torsoBottomY);
        const shoulderY = formatPlayerJumpNumber(pose.shoulderY);
        const handY = formatPlayerJumpNumber(pose.handY);
        const hipY = formatPlayerJumpNumber(pose.hipY);
        const footY = formatPlayerJumpNumber(pose.footY);

        const armL1X = formatPlayerJumpNumber(40 - pose.armBow1);
        const armL2X = formatPlayerJumpNumber(40 - pose.armBow2);
        const armR1X = formatPlayerJumpNumber(40 + pose.armBow1);
        const armR2X = formatPlayerJumpNumber(40 + pose.armBow2);
        const legL1X = formatPlayerJumpNumber(40 - pose.legBow1);
        const legL2X = formatPlayerJumpNumber(40 - pose.legBow2);
        const legR1X = formatPlayerJumpNumber(40 + pose.legBow1);
        const legR2X = formatPlayerJumpNumber(40 + pose.legBow2);

        // 身體伸長使用座標改寫，不使用 scale；8px 線寬因此保持完全固定。
        head.setAttribute('cy', String(headY));
        torso.setAttribute('y1', String(torsoTopY));
        torso.setAttribute('y2', String(torsoBottomY));

        armLPath.setAttribute('d', `M 40 ${shoulderY} C ${armL1X} ${formatPlayerJumpNumber(pose.armC1Y)} ${armL2X} ${formatPlayerJumpNumber(pose.armC2Y)} 40 ${handY}`);
        armRPath.setAttribute('d', `M 40 ${shoulderY} C ${armR1X} ${formatPlayerJumpNumber(pose.armC1Y)} ${armR2X} ${formatPlayerJumpNumber(pose.armC2Y)} 40 ${handY}`);
        legLPath.setAttribute('d', `M 40 ${hipY} C ${legL1X} ${formatPlayerJumpNumber(pose.legC1Y)} ${legL2X} ${formatPlayerJumpNumber(pose.legC2Y)} 40 ${footY}`);
        legRPath.setAttribute('d', `M 40 ${hipY} C ${legR1X} ${formatPlayerJumpNumber(pose.legC1Y)} ${legR2X} ${formatPlayerJumpNumber(pose.legC2Y)} 40 ${footY}`);

        stickman.style.setProperty('--jump-shoulder-y', `${shoulderY}px`);
        stickman.style.setProperty('--jump-hand-y', `${handY}px`);
        stickman.style.setProperty('--jump-hip-y', `${hipY}px`);
        stickman.style.setProperty('--jump-arm-l-rotation', `${formatPlayerJumpNumber(-pose.armAngle)}deg`);
        stickman.style.setProperty('--jump-arm-r-rotation', `${formatPlayerJumpNumber(pose.armAngle)}deg`);
        stickman.style.setProperty('--jump-leg-l-rotation', `${formatPlayerJumpNumber(-pose.legAngle)}deg`);
        stickman.style.setProperty('--jump-leg-r-rotation', `${formatPlayerJumpNumber(pose.legAngle)}deg`);
        // 讓槌頭始終朝角色外側上方，不會在手臂抬起時穿過頭部。
        stickman.style.setProperty('--jump-hammer-rotation', `${formatPlayerJumpNumber(pose.armAngle + 24)}deg`);

        const hammerShaft = document.getElementById('held-hammer-shaft-s3');
        if (hammerShaft) hammerShaft.setAttribute('y1', String(handY));

        // 頭部裝備跟著頭部的幾何伸展同步位移。
        const headDisplay = document.getElementById('held-item-head');
        if (headDisplay) {
            const headDeltaY = formatPlayerJumpNumber(headY - 32);
            headDisplay.setAttribute('transform', `translate(17, ${formatPlayerJumpNumber(-15 + headDeltaY)}) scale(0.35)`);
        }
    }

    function applyUnsafeAntennaFallPose() {

        const head =
            document.getElementById('stickman-head-s3');

        const torso =
            document.getElementById('stickman-torso-s3');

        const armLBase =
            document.getElementById('armL-base-s3');

        const armRBase =
            document.getElementById('armR-base-s3');

        const legLBase =
            document.getElementById('legL-base-s3');

        const legRBase =
            document.getElementById('legR-base-s3');

        const armLPath =
            document.getElementById('armL-path-s3');

        const armRPath =
            document.getElementById('armR-path-s3');

        const legLPath =
            document.getElementById('legL-path-s3');

        const legRPath =
            document.getElementById('legR-path-s3');

        if (
            !head ||
            !torso ||
            !armLPath ||
            !armRPath ||
            !legLPath ||
            !legRPath
        ) {
            return;
        }


        // =====================================================
        // 🌟 關閉原本直線手腳
        // =====================================================

        if (armLBase) armLBase.style.display = 'none';
        if (armRBase) armRBase.style.display = 'none';
        if (legLBase) legLBase.style.display = 'none';
        if (legRBase) legRBase.style.display = 'none';


        // =====================================================
        // 🌟 使用 Path 畫出你圖片中的長曲線手腳
        // =====================================================

        armLPath.style.display = 'inline';
        armRPath.style.display = 'inline';
        legLPath.style.display = 'inline';
        legRPath.style.display = 'inline';


        // 頭
        head.setAttribute('cy', '32');

        // 身體
        torso.setAttribute('y1', '48');
        torso.setAttribute('y2', '82');


        // =====================================================
        // 🌟 手：從肩膀向左右上方彎
        //
        // 效果接近：
        //
        //   \           /
        //    \_________/
        //         |
        // =====================================================

        armLPath.setAttribute(
            'd',
            'M 40 62 C 30 62, 21 58, 15 51 C 10 45, 7 38, 7 31'
        );

        armRPath.setAttribute(
            'd',
            'M 40 62 C 51 62, 60 58, 66 50 C 71 43, 73 35, 73 27'
        );


        // =====================================================
        // 🌟 腳：從胯下開始形成長的下彎曲線
        //
        // 不再是短短一小截
        // =====================================================

        legLPath.setAttribute(
            'd',
            'M 40 82 C 45 84, 48 88, 47 93 C 46 98, 41 102, 36 105'
        );

        legRPath.setAttribute(
            'd',
            'M 40 82 C 49 83, 55 87, 57 93 C 59 99, 57 104, 52 108'
        );



        // =====================================================
        // 🌟 非常重要：
        // 原本 player-jumping CSS 還會旋轉手腳，
        // 這個特殊姿勢不要再旋轉
        // =====================================================

        stickman.style.setProperty(
            '--jump-arm-l-rotation',
            '0deg'
        );

        stickman.style.setProperty(
            '--jump-arm-r-rotation',
            '0deg'
        );

        stickman.style.setProperty(
            '--jump-leg-l-rotation',
            '0deg'
        );

        stickman.style.setProperty(
            '--jump-leg-r-rotation',
            '0deg'
        );

        // =====================================================
        // 🌟 三角形拿到右上手
        // =====================================================

        const hand1Display =
            document.getElementById('held-item-hand1');

        const armRGroup =
            document.getElementById('armR-s3');

        if (hand1Display && armRGroup) {

            if (hand1Display.parentNode !== armRGroup) {
                armRGroup.appendChild(hand1Display);
            }

            hand1Display.style.opacity = '1';

            hand1Display.setAttribute(
                'transform',
                'translate(50, -10) scale(0.35) rotate(15, 65, 90)'
            );
        }
    }
    function resetPlayerJumpPose() {

        const head =
            document.getElementById('stickman-head-s3');

        const torso =
            document.getElementById('stickman-torso-s3');


        const armLBase =
            document.getElementById('armL-base-s3');

        const armRBase =
            document.getElementById('armR-base-s3');

        const legLBase =
            document.getElementById('legL-base-s3');

        const legRBase =
            document.getElementById('legR-base-s3');


        const armLPath =
            document.getElementById('armL-path-s3');

        const armRPath =
            document.getElementById('armR-path-s3');

        const legLPath =
            document.getElementById('legL-path-s3');

        const legRPath =
            document.getElementById('legR-path-s3');


        // =====================================================
        // 🌟 頭與身體恢復
        // =====================================================

        if (head) {
            head.setAttribute('cx', '40');
            head.setAttribute('cy', '32');
        }

        if (torso) {

            torso.setAttribute('x1', '40');
            torso.setAttribute('y1', '48');

            torso.setAttribute('x2', '40');
            torso.setAttribute('y2', '75');
        }


        // =====================================================
        // 🌟 四肢 Path 幾何恢復
        // =====================================================

        if (armLPath) {
            armLPath.setAttribute(
                'd',
                'M 40 56 L 40 85'
            );
        }

        if (armRPath) {
            armRPath.setAttribute(
                'd',
                'M 40 56 L 40 85'
            );
        }

        if (legLPath) {
            legLPath.setAttribute(
                'd',
                'M 40 75 L 40 105'
            );
        }

        if (legRPath) {
            legRPath.setAttribute(
                'd',
                'M 40 75 L 40 105'
            );
        }


        // =====================================================
        // 🌟 最重要：
        // 清除所有特殊動畫寫進去的 inline display
        //
        // 之後交給原本 CSS 控制：
        //
        // 一般狀態 → base line 顯示 / path 隱藏
        // 跳躍狀態 → base line 隱藏 / path 顯示
        // =====================================================

        [
            armLBase,
            armRBase,
            legLBase,
            legRBase,
            armLPath,
            armRPath,
            legLPath,
            legRPath
        ].forEach(el => {

            if (!el) return;

            el.style.removeProperty(
                'display'
            );
        });


        // =====================================================
        // 🌟 四肢群組也清除彩蛋留下的 inline transform
        // =====================================================

        [
            'armL-s3',
            'armR-s3',
            'legL-s3',
            'legR-s3'
        ].forEach(id => {

            const el =
                document.getElementById(id);

            if (!el) return;

            el.style.removeProperty(
                'animation'
            );

            el.style.removeProperty(
                'transform'
            );
        });


        // =====================================================
        // Hammer
        // =====================================================

        const hammerShaft =
            document.getElementById(
                'held-hammer-shaft-s3'
            );

        if (hammerShaft) {
            hammerShaft.setAttribute(
                'y1',
                '85'
            );
        }


        // =====================================================
        // 頭部裝備
        // =====================================================

        const headDisplay =
            document.getElementById(
                'held-item-head'
            );

        if (headDisplay) {

            headDisplay.setAttribute(
                'transform',
                'translate(17, -15) scale(0.35)'
            );
        }


        // =====================================================
        // 跳躍 CSS 變數全部清空
        // =====================================================

        stickman.style.removeProperty(
            '--jump-shoulder-y'
        );

        stickman.style.removeProperty(
            '--jump-hand-y'
        );

        stickman.style.removeProperty(
            '--jump-hip-y'
        );

        stickman.style.removeProperty(
            '--jump-arm-l-rotation'
        );

        stickman.style.removeProperty(
            '--jump-arm-r-rotation'
        );

        stickman.style.removeProperty(
            '--jump-leg-l-rotation'
        );

        stickman.style.removeProperty(
            '--jump-leg-r-rotation'
        );

        stickman.style.removeProperty(
            '--jump-hammer-rotation'
        );
    }

    function finishPlayerVerticalJump(lastPose) {
        const blendStart = performance.now();

        const blendFrame = now => {
            if (!isCurrentScene3Instance()) return;
            const progress = playerJumpClamp01((now - blendStart) / PLAYER_JUMP_LANDING_BLEND_MS);
            applyPlayerJumpPose(interpolatePlayerJumpPose(lastPose, PLAYER_JUMP_NORMAL_POSE, progress));

            if (progress < 1) {
                playerJumpFrameId = requestAnimationFrame(blendFrame);
                return;
            }

            playerJumpOffsetPx = 0;
            playerJumpProgress = 0;
            playerJumpVerticalVelocityPx = 0;
            // 以逐幀積分出的世界座標作為真正落地點，避免左右移動後落地瞬移。
            worldX = Math.max(5, playerJumpLandingWorldX);
            playerJumpHorizontalVelocity = 0;
            resetPlayerJumpPose();
            stickman.classList.remove('player-jumping');
            stickman.classList.add('stand-still');
            isPlayerJumping = false;
            playerJumpFrameId = null;
            plaTopPlatformJumpCameraLocked = false;
            if (!playerDead && !bossTimelineRunning) canAttack = true;
        };

        playerJumpFrameId = requestAnimationFrame(blendFrame);
    }

    function startPlayerVerticalJump() {
        if (
            !bossTimelineCompleted ||
            !jumpManualUnlocked ||
            bossTimelineRunning ||
            isPlayerJumping ||
            isPlaHatTethered ||
            isPlaHatBallistic ||
            (playerWorldElevationPx > 0.5 && !isOnPlaTopPlatform) ||
            !isPlayerControllable ||
            isPlayerAttacking ||
            !canAttack ||
            playerDead ||
            isGamePaused ||
            backpackIsOpen ||
            manualModal.classList.contains('manual-active')
        ) return;

        // PLA 最上方橫線已經是實體路地；從這裡進行普通跳躍時，垂直鏡頭全程固定。
        if (isOnPlaTopPlatform) {
            plaTopPlatformJumpCameraLocked = true;
            plaTopPlatformJumpCameraOffsetPx = verticalCameraOffsetPx;
            verticalCameraTargetPx = plaTopPlatformJumpCameraOffsetPx;
        } else {
            plaTopPlatformJumpCameraLocked = false;
        }

        // 必須在套用伸展姿勢前量測，確保最高點仍精準等於原本角色的一個身高。
        const jumpHeightPx = Math.max(1, stickman.getBoundingClientRect().height || 120);
        const initialDirection = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
        playerJumpHeightPx = jumpHeightPx;
        playerJumpProgress = 0;
        playerJumpVerticalVelocityPx = (4 * jumpHeightPx) / (PLAYER_JUMP_DURATION_MS / 1000);

        isPlayerJumping = true;
        canAttack = false;
        playerJumpOffsetPx = 0;
        playerJumpLandingWorldX = worldX;
        playerJumpHorizontalVelocity = initialDirection * 10;
        keys.w = false;
        keys.s = false;
        stickman.classList.remove('anim-attack', 'boss-wind-landed');
        stickman.classList.add('stand-still', 'player-jumping');

        // 按下 C 後立即進入狀態 2；五個正式姿勢在最高點前後對稱。
        applyPlayerJumpPose(PLAYER_JUMP_SEQUENCE[0]);

        const jumpStart = performance.now();
        let previousJumpFrameTime = jumpStart;

        const jumpFrame = now => {
            if (!isCurrentScene3Instance()) return;

            const progress = playerJumpClamp01((now - jumpStart) / PLAYER_JUMP_DURATION_MS);
            playerJumpProgress = progress;
            playerJumpVerticalVelocityPx =
                (4 * playerJumpHeightPx * (1 - 2 * progress)) / (PLAYER_JUMP_DURATION_MS / 1000);
            const pose = getPlayerJumpSequencePose(progress);
            applyPlayerJumpPose(pose);

            // 拋物線最高點恰好等於角色原本本體高度。
            playerJumpOffsetPx = jumpHeightPx * 4 * progress * (1 - progress);

            /*
               空中左右移動採用速度、加速度與阻力積分。落地點就是每幀累積後的
               playerJumpLandingWorldX，因此途中換向或放開按鍵都會形成連續弧線，
               不會在落地時突然跳回起跳位置。
            */
            const deltaSeconds = Math.min(0.034, Math.max(0, (now - previousJumpFrameTime) / 1000));
            previousJumpFrameTime = now;
            const horizontalInput = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);

            if (horizontalInput !== 0) {
                const targetVelocity = horizontalInput * PLAYER_JUMP_AIR_MAX_SPEED;
                const velocityDifference = targetVelocity - playerJumpHorizontalVelocity;
                const maxVelocityChange = PLAYER_JUMP_AIR_ACCELERATION * deltaSeconds;
                playerJumpHorizontalVelocity += Math.max(
                    -maxVelocityChange,
                    Math.min(maxVelocityChange, velocityDifference)
                );
                facing = horizontalInput < 0 ? -1 : 1;
            } else {
                playerJumpHorizontalVelocity *= Math.exp(-PLAYER_JUMP_AIR_DRAG * deltaSeconds);
            }

            playerJumpLandingWorldX = Math.max(
                5,
                playerJumpLandingWorldX + playerJumpHorizontalVelocity * deltaSeconds
            );
            worldX = playerJumpLandingWorldX;

            if (progress < 1) {
                playerJumpFrameId = requestAnimationFrame(jumpFrame);
                return;
            }

            playerJumpOffsetPx = 0;
            finishPlayerVerticalJump(PLAYER_JUMP_SEQUENCE[PLAYER_JUMP_SEQUENCE.length - 1]);
        };

        playerJumpFrameId = requestAnimationFrame(jumpFrame);
    }



    // ==============================================================
    // 🌟 三角帽連接 PLA X／圓點：固定點導通、單擺、放線與連續向上攀升
    // ==============================================================
    function getScene3StageMetrics() {
        const stage = document.getElementById('scene3-stage');
        if (!stage) return null;
        const rect = stage.getBoundingClientRect();
        const width = Math.max(1, rect.width || stage.clientWidth || scene3.clientWidth || 1000);
        const height = Math.max(1, rect.height || stage.clientHeight || scene3.clientHeight || 600);
        const groundPercent = postBossGroundY ?? py ?? getPlayerBottomYPercent();
        return {
            stage,
            rect,
            width,
            height,
            groundY: height * Number(groundPercent) / 100
        };
    }

    function getTotalPlayerElevationPx() {
        return Math.max(0, playerWorldElevationPx + playerJumpOffsetPx);
    }

    function getCurrentVerticalVelocityUpPx() {
        if (isPlaHatTethered) {
            return plaHatRopeLengthPx * Math.sin(plaHatAngleRad) * plaHatAngularVelocity;
        }
        if (isPlaHatBallistic) return plaHatVelocityUpPx;
        if (isPlayerJumping) return playerJumpVerticalVelocityPx;
        return 0;
    }

    function getPlayerCenterWorldPoint(metrics = getScene3StageMetrics()) {
        if (!metrics) return null;
        return {
            x: worldX * metrics.width / 100,
            y: metrics.groundY - getTotalPlayerElevationPx()
        };
    }

    function getHatTopScreenPoint() {
        const headDisplay = document.getElementById('held-item-head');
        if (headItem === 'hat' && headDisplay && typeof headDisplay.getScreenCTM === 'function') {
            try {
                const ownerSvg = headDisplay.ownerSVGElement;
                const matrix = headDisplay.getScreenCTM();
                if (ownerSvg && matrix && typeof ownerSvg.createSVGPoint === 'function') {
                    const point = ownerSvg.createSVGPoint();
                    // getItemSVG('hat') 的三角形最高頂點就是 (65, 30)。
                    point.x = 65;
                    point.y = 30;
                    const screenPoint = point.matrixTransform(matrix);
                    if (Number.isFinite(screenPoint.x) && Number.isFinite(screenPoint.y)) {
                        return { x: screenPoint.x, y: screenPoint.y };
                    }
                }
            } catch (error) {
                // SVG CTM 在場景切換的一瞬間可能尚未建立，以下方 fallback 保持穩定。
            }
        }

        const rect = stickman.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top - 4
        };
    }

    function getHatTopWorldPoint(metrics = getScene3StageMetrics()) {
        if (!metrics) return null;
        const screenPoint = getHatTopScreenPoint();
        return {
            x: screenPoint.x - metrics.rect.left + cameraX * metrics.width / 100,
            y: screenPoint.y - metrics.rect.top - verticalCameraOffsetPx
        };
    }

    function getPlaCircuitElement() {
        return scene3.querySelector('#environment-layer-s3 .pla-circuit');
    }

    function getPlaConductionScreenPoint(definition) {
        const pla = getPlaCircuitElement();
        if (!pla || typeof pla.getScreenCTM !== 'function' || typeof pla.createSVGPoint !== 'function') return null;
        try {
            const matrix = pla.getScreenCTM();
            if (!matrix) return null;
            const point = pla.createSVGPoint();
            point.x = definition.x;
            point.y = definition.y;
            const screenPoint = point.matrixTransform(matrix);
            if (!Number.isFinite(screenPoint.x) || !Number.isFinite(screenPoint.y)) return null;
            return { x: screenPoint.x, y: screenPoint.y };
        } catch (error) {
            return null;
        }
    }

    function screenPointToScene3World(screenPoint, metrics = getScene3StageMetrics()) {
        if (!metrics || !screenPoint) return null;
        return {
            x: screenPoint.x - metrics.rect.left + cameraX * metrics.width / 100,
            y: screenPoint.y - metrics.rect.top - verticalCameraOffsetPx
        };
    }

    function getPlaTopPlatformWorldGeometry(metrics = getScene3StageMetrics()) {
        const line = document.getElementById('pla-top-platform-line-s3');
        if (
            !metrics ||
            !line ||
            !line.ownerSVGElement ||
            typeof line.getScreenCTM !== 'function' ||
            typeof line.ownerSVGElement.createSVGPoint !== 'function'
        ) return null;

        try {
            const matrix = line.getScreenCTM();
            if (!matrix) return null;
            const svg = line.ownerSVGElement;
            const y = Number(line.getAttribute('y1')) || 75;
            const makeScreenPoint = x => {
                const point = svg.createSVGPoint();
                point.x = x;
                point.y = y;
                return point.matrixTransform(matrix);
            };
            const screenStart = makeScreenPoint(Number(line.getAttribute('x1')) || 55);
            const screenEnd = makeScreenPoint(Number(line.getAttribute('x2')) || 305);
            const worldStart = screenPointToScene3World(screenStart, metrics);
            const worldEnd = screenPointToScene3World(screenEnd, metrics);
            if (!worldStart || !worldEnd) return null;

            return {
                line,
                leftX: Math.min(worldStart.x, worldEnd.x),
                rightX: Math.max(worldStart.x, worldEnd.x),
                y: (worldStart.y + worldEnd.y) / 2
            };
        } catch (error) {
            return null;
        }
    }

    function getPlayerFootOffsetPx() {

        const playerHeight = Math.max(
            1,
            stickman.getBoundingClientRect().height || 120
        );

        // =============================================
        // 🌟 使用「肉眼真正看見的腳底」
        // =============================================

        const VIEWBOX_HEIGHT = 120;

        // 角色 SVG 中心
        const CENTER_Y = 60;

        // 腳線本身終點
        const FOOT_LINE_END_Y = 105;

        // 火柴人 stroke-width = 8
        // round linecap 會再往下延伸一半 = 4
        const PLAYER_STROKE_HALF = 4;

        const VISUAL_FOOT_BOTTOM_Y =
            FOOT_LINE_END_Y + PLAYER_STROKE_HALF;
            // = 109

        return playerHeight *
            ((VISUAL_FOOT_BOTTOM_Y - CENTER_Y) / VIEWBOX_HEIGHT);
    }

    // ======================================================
    // 🌟 PLA 腳底視覺修正後，天線要向下補回多少距離
    // 目的：角色可以升高，但天線仍維持修改前的世界高度
    // ======================================================
    function getPlaAntennaGroundCompensationPx() {

        if (!isOnPlaTopPlatform) return 0;

        const metrics = getScene3StageMetrics();
        const geometry = getPlaTopPlatformWorldGeometry(metrics);

        if (!metrics || !geometry) return 0;

        const playerHeight = Math.max(
            1,
            stickman.getBoundingClientRect().height || 120
        );

        // 修改前：
        // 腳線幾何終點 y=105
        const oldFootOffset =
            playerHeight * (45 / 120);

        // 修改後：
        // 包含腳 stroke 圓頭的真正可視腳底
        const newFootOffset =
            getPlayerFootOffsetPx();

        // PLA 白線中心 → 真正最上緣
        const platformTopY =
            getPlaTopSurfaceWorldY(geometry);

        if (!Number.isFinite(platformTopY)) return 0;

        /*
        角色比修改前多升高的距離：

        ① 腳底 stroke 修正
        ② PLA 白線半線寬修正
        */
        const playerExtraLift =
            (newFootOffset - oldFootOffset)
            +
            (geometry.y - platformTopY);

        return Math.max(0, playerExtraLift);
    }

    function scenePxToStickmanSvgY(px) {

        const playerHeight = Math.max(
            1,
            stickman.getBoundingClientRect().height || 120
        );

        return px * (120 / playerHeight);
    }

    function getPlaTopSurfaceWorldY(geometry) {

        if (!geometry) return null;

        const visibleLine =
            document.querySelector('.pla-top-platform-visible');

        // 找不到時保底
        if (
            !visibleLine ||
            typeof visibleLine.getScreenCTM !== 'function'
        ) {
            return geometry.y - 2;
        }

        try {

            const matrix = visibleLine.getScreenCTM();

            if (!matrix) {
                return geometry.y - 2;
            }

            // PLA 白線原本 stroke-width = 4
            const PLA_STROKE_WIDTH = 4;

            /*
                SVG 可能會因螢幕尺寸縮放，
                所以不能永遠直接減 2px。

                matrix.c / matrix.d 可以取得
                Y 軸實際縮放比例。
            */
            const scaleY =
                Math.hypot(matrix.c, matrix.d);

            const halfStrokePx =
                (PLA_STROKE_WIDTH * scaleY) / 2;

            // 🌟 geometry.y 是白線中心
            // 真正可以踩的是白線最上緣
            return geometry.y - halfStrokePx;

        } catch (e) {

            return geometry.y - 2;
        }
    }

    function getPlayerFootWorldY(metrics = getScene3StageMetrics()) {
        if (!metrics) return null;
        return metrics.groundY - getTotalPlayerElevationPx() + getPlayerFootOffsetPx();
    }

    function getPlaTopPlatformSupportElevation(metrics, geometry) {

        if (!metrics || !geometry) return 0;

        // 🌟 PLA 肉眼真正看到的最上表面
        const platformTopY =
            getPlaTopSurfaceWorldY(geometry);

        if (!Number.isFinite(platformTopY)) return 0;

        // 🌟 讓火柴人「可視腳底」
        // 精準落在 PLA「可視最上緣」
        return Math.max(
            0,
            metrics.groundY
            + getPlayerFootOffsetPx()
            - platformTopY
        );
    }

    function beginScene3CameraFocusTransition(durationMs = 950) {
        const duration = Math.max(260, Number(durationMs) || 950);
        cameraFocusTransitionUntil = Math.max(
            cameraFocusTransitionUntil,
            performance.now() + duration
        );
        if (!horizontalCameraInitialized) {
            horizontalCameraTargetX = Math.max(0, cameraX);
            horizontalCameraInitialized = true;
        }
    }

    function setPlaTopPlatformSolid(geometry) {
        if (plaTopPlatformSolid) return;
        plaTopPlatformSolid = true;
        if (geometry?.line) {
            geometry.line.dataset.solid = 'true';
            // 讓所有具有 pla-top-platform-visible 類別的實體線段發光
            document.querySelectorAll('.pla-top-platform-visible').forEach(seg => {
                seg.style.filter = 'drop-shadow(0 0 3px rgba(255,255,255,0.72))';
            });
        }
    }

    function leavePlaTopPlatformAsBallistic(metrics) {
        if (!metrics || !isOnPlaTopPlatform) return;

        const inheritedUpVelocity = getCurrentVerticalVelocityUpPx();
        const inheritedElevation = getTotalPlayerElevationPx();
        let inheritedHorizontalVelocity = playerJumpHorizontalVelocity * metrics.width / 100;
        if (Math.abs(inheritedHorizontalVelocity) < 1) {
            const direction = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
            inheritedHorizontalVelocity = direction * metrics.width * 0.24;
        }

        if (playerJumpFrameId !== null) {
            cancelAnimationFrame(playerJumpFrameId);
            playerJumpFrameId = null;
        }

        isOnPlaTopPlatform = false;
        plaTopPlatformJumpCameraLocked = false;
        plaBallisticAirTimeSeconds = 0;
        playerWorldElevationPx = inheritedElevation;
        playerJumpOffsetPx = 0;
        isPlaHatBallistic = true;
        isPlayerJumping = true;
        canAttack = false;
        plaHatVelocityXPx = inheritedHorizontalVelocity;
        plaHatVelocityUpPx = inheritedUpVelocity;
        playerJumpHorizontalVelocity = inheritedHorizontalVelocity * 100 / metrics.width;
        playerJumpVerticalVelocityPx = inheritedUpVelocity;
        playerJumpLandingWorldX = worldX;
        stickman.classList.add('stand-still', 'player-jumping');
    }

    function landPlayerOnPlaTopPlatform(metrics, geometry) {
        if (!metrics || !geometry) return false;

        if (playerJumpFrameId !== null) {
            cancelAnimationFrame(playerJumpFrameId);
            playerJumpFrameId = null;
        }

        if (isPlaHatTethered) forceClearPlaHatTether();
        isPlaHatTethered = false;
        isPlaHatBallistic = false;
        plaHatAnchor = null;
        plaHatRopeLengthPx = 0;
        plaHatVelocityXPx = 0;
        plaHatVelocityUpPx = 0;
        plaHatAngularVelocity = 0;

        setPlaTopPlatformSolid(geometry);
        isOnPlaTopPlatform = true;
        plaTopPlatformJumpCameraLocked = false;
        plaBallisticAirTimeSeconds = 0;
        plaTopPlatformElevationPx = getPlaTopPlatformSupportElevation(metrics, geometry);
        playerWorldElevationPx = plaTopPlatformElevationPx;
        playerJumpOffsetPx = 0;
        playerJumpProgress = 0;
        playerJumpVerticalVelocityPx = 0;
        playerJumpHorizontalVelocity = 0;
        playerJumpLandingWorldX = worldX;
        isPlayerJumping = false;
        canAttack = !playerDead && !bossTimelineRunning;
        resetPlayerJumpPose();
        stickman.classList.remove('player-jumping', 'boss-wind-landed');
        stickman.classList.add('stand-still');
        hidePlaHatTetherVisual();
        plaTopPlatformPreviousFootWorldY = getPlaTopSurfaceWorldY(geometry);
        beginScene3CameraFocusTransition(900);
        return true;
    }

    function updatePlaTopPlatformPhysics() {
        if (!bossTimelineCompleted) return;
        if (window._easterEggUnsafeFalling) {
            return;
        }
        const metrics = getScene3StageMetrics();
        const geometry = getPlaTopPlatformWorldGeometry(metrics);
        if (!metrics || !geometry) return;

         // 🌟 新增
        const platformTopY =
            getPlaTopSurfaceWorldY(geometry);

        if (!Number.isFinite(platformTopY)) return;

        const playerCenterX = worldX * metrics.width / 100;
        const horizontalMargin = Math.max(10, (stickman.getBoundingClientRect().width || 80) * 0.28);
        
        // 🌟 計算 SVG 缺口的世界坐標 (嚴格判定，無任何容錯，確保斷崖無法輕易跨越)
        let inHole = false;
        try {
            const line = geometry.line;
            const matrix = line.getScreenCTM();
            const svg = line.ownerSVGElement;
            const makeWorldX = (svgX) => {
                const pt = svg.createSVGPoint();
                pt.x = svgX; pt.y = 75;
                const screenPt = pt.matrixTransform(matrix);
                return screenPointToScene3World(screenPt, metrics).x;
            };

            const hole1L = makeWorldX(390);
            const hole1R = makeWorldX(440);
            const hole2L = makeWorldX(500);

            // 嚴格掉落：只要角色中心點一越過 390 或 500，立刻判定在洞口中
            if (playerCenterX > hole1L && playerCenterX < hole1R) inHole = true;
            if (playerCenterX > hole2L) inHole = true;
        } catch (e) { }

        // 如果處於缺口中，則判定為不在平台上，立刻觸發重力下墜
        const withinPlatform =
            playerCenterX >= geometry.leftX - horizontalMargin &&
            playerCenterX <= geometry.rightX + horizontalMargin &&
            !inHole; 
            
        let currentFootY = getPlayerFootWorldY(metrics);
        if (!Number.isFinite(currentFootY)) return;

        const airborne =
            isPlayerJumping ||
            isPlaHatTethered ||
            isPlaHatBallistic ||
            Math.abs(getCurrentVerticalVelocityUpPx()) > 2;

        // 只有角色真的曾從下方跳到橫線上方，這條線才會永久成為實體平台。
        if (!plaTopPlatformSolid && airborne && currentFootY < platformTopY - 6) {
            setPlaTopPlatformSolid(geometry);
        }

        if (isOnPlaTopPlatform) {
            if (!withinPlatform) {
                leavePlaTopPlatformAsBallistic(metrics);
                currentFootY = getPlayerFootWorldY(metrics);
            } else {
                plaTopPlatformElevationPx = getPlaTopPlatformSupportElevation(metrics, geometry);
                playerWorldElevationPx = plaTopPlatformElevationPx;
                // 普通 C 跳躍期間只疊加 playerJumpOffsetPx；非跳躍時腳底精準貼住線面。
                if (!isPlayerJumping && !isPlaHatBallistic && !isPlaHatTethered) {
                    playerJumpOffsetPx = 0;
                    playerJumpVerticalVelocityPx = 0;
                }
            }
        }

        if (
            plaTopPlatformSolid &&
            !isOnPlaTopPlatform &&
            !isPlaHatTethered &&
            withinPlatform
        ) {
            const descending = getCurrentVerticalVelocityUpPx() < -4;
            const previousFootY = plaTopPlatformPreviousFootWorldY;
            const crossedFromAbove =
            Number.isFinite(previousFootY) &&
            previousFootY <= platformTopY + 3 &&
            currentFootY >= platformTopY - 4;

            if (descending && crossedFromAbove) {
                landPlayerOnPlaTopPlatform(
                    metrics,
                    geometry
                );

                currentFootY = platformTopY;
            }
        }

        plaTopPlatformPreviousFootWorldY = currentFootY;
    }

    function ensurePlaHatTetherVisual() {
        if (plaHatTetherLayer && plaHatTetherLayer.isConnected) return plaHatTetherLayer;
        const stage = document.getElementById('scene3-stage');
        if (!stage) return null;

        const svgNs = 'http://www.w3.org/2000/svg';
        const layer = document.createElementNS(svgNs, 'svg');
        layer.id = 'pla-hat-tether-layer-s3';
        layer.setAttribute('aria-hidden', 'true');
        layer.style.cssText = [
            'position:absolute',
            'inset:0',
            'width:100%',
            'height:100%',
            'z-index:8',
            'overflow:visible',
            'pointer-events:none',
            'opacity:0',
            'transition:opacity 0.06s linear'
        ].join(';');

        const line = document.createElementNS(svgNs, 'line');
        line.id = 'pla-hat-tether-line-s3';
        line.setAttribute('stroke', '#ffffff');
        line.setAttribute('stroke-width', '3.8'); // 與頭戴三角帽邊框的視覺粗細一致
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('vector-effect', 'non-scaling-stroke');
        line.style.filter = 'drop-shadow(0 0 4px #fff) drop-shadow(0 0 8px rgba(0,242,254,0.9))';

        const anchorGlow = document.createElementNS(svgNs, 'circle');
        anchorGlow.id = 'pla-hat-tether-anchor-s3';
        anchorGlow.setAttribute('r', '5.2');
        anchorGlow.setAttribute('fill', '#ffffff');
        anchorGlow.setAttribute('stroke', 'var(--brand-blue, #00f2fe)');
        anchorGlow.setAttribute('stroke-width', '2');
        anchorGlow.setAttribute('vector-effect', 'non-scaling-stroke');
        anchorGlow.style.filter = 'drop-shadow(0 0 7px #fff) drop-shadow(0 0 12px var(--brand-blue, #00f2fe))';

        layer.appendChild(line);
        layer.appendChild(anchorGlow);
        stage.appendChild(layer);

        plaHatTetherLayer = layer;
        plaHatTetherLine = line;
        plaHatTetherAnchorGlow = anchorGlow;
        return layer;
    }

    function hidePlaHatTetherVisual() {
        if (plaHatTetherLayer) plaHatTetherLayer.style.opacity = '0';
    }

    function updatePlaHatTetherVisual() {
        if (!isPlaHatTethered || !plaHatAnchor) {
            hidePlaHatTetherVisual();
            return;
        }

        const metrics = getScene3StageMetrics();
        const layer = ensurePlaHatTetherVisual();
        if (!metrics || !layer || !plaHatTetherLine || !plaHatTetherAnchorGlow) return;

        layer.setAttribute('viewBox', `0 0 ${metrics.width} ${metrics.height}`);
        const anchorX = plaHatAnchor.worldX - cameraX * metrics.width / 100;
        const anchorY = plaHatAnchor.worldY + verticalCameraOffsetPx;
        const hatScreen = getHatTopScreenPoint();
        const hatX = hatScreen.x - metrics.rect.left;
        const hatY = hatScreen.y - metrics.rect.top;

        plaHatTetherLine.setAttribute('x1', anchorX.toFixed(3));
        plaHatTetherLine.setAttribute('y1', anchorY.toFixed(3));
        plaHatTetherLine.setAttribute('x2', hatX.toFixed(3));
        plaHatTetherLine.setAttribute('y2', hatY.toFixed(3));
        plaHatTetherAnchorGlow.setAttribute('cx', anchorX.toFixed(3));
        plaHatTetherAnchorGlow.setAttribute('cy', anchorY.toFixed(3));
        layer.style.opacity = '1';
    }

    function forceClearPlaHatTether() {
        isPlaHatQHeld = false;
        keys.q = false;
        isPlaHatTethered = false;
        plaHatAnchor = null;
        plaHatRopeLengthPx = 0;
        plaHatAngleRad = 0;
        plaHatAngularVelocity = 0;
        hidePlaHatTetherVisual();
    }

    // 按住 Q 時再按 C，Q 必須立刻失效；只有收到真正的 keyup 後，下一次 Q 才可重新導通。
    function consumePlaHatQUntilRelease() {
        isPlaHatQHeld = false;
        keys.q = false;
        plaHatQBlockedUntilRelease = true;
        hidePlaHatTetherVisual();
    }

    function getCurrentPlayerLinearVelocityPx(metrics) {
        if (!metrics) return { x: 0, up: 0 };
        if (isPlaHatBallistic) {
            return { x: plaHatVelocityXPx, up: plaHatVelocityUpPx };
        }
        if (isPlayerJumping) {
            return {
                x: playerJumpHorizontalVelocity * metrics.width / 100,
                up: playerJumpVerticalVelocityPx
            };
        }
        return { x: 0, up: 0 };
    }

    function canUsePlaHatTraversal() {
        return (
            bossTimelineCompleted &&
            jumpManualUnlocked &&
            headItem === 'hat' &&
            isPlayerControllable &&
            !playerDead &&
            !isGamePaused &&
            !backpackIsOpen &&
            !isPlayerAttacking &&
            !postBossBookSequenceRunning &&
            !manualModal.classList.contains('manual-active')
        );
    }

    function attachPlaHatToConductionPoint(candidate, metrics) {
        if (!candidate || !metrics) return false;

        const currentCenter = getPlayerCenterWorldPoint(metrics);
        const currentHat = getHatTopWorldPoint(metrics);
        if (!currentCenter || !currentHat) return false;
        const inheritedVelocity = getCurrentPlayerLinearVelocityPx(metrics);
        const totalElevation = getTotalPlayerElevationPx();

        if (playerJumpFrameId !== null) {
            cancelAnimationFrame(playerJumpFrameId);
            playerJumpFrameId = null;
        }

        playerWorldElevationPx = totalElevation;
        playerJumpOffsetPx = 0;
        playerJumpProgress = 0.5;
        playerJumpVerticalVelocityPx = inheritedVelocity.up;
        playerJumpLandingWorldX = worldX;

        isPlaHatBallistic = false;
        plaBallisticAirTimeSeconds = 0;
        plaTopPlatformJumpCameraLocked = false;
        isPlaHatTethered = true;
        isPlayerJumping = true;
        canAttack = false;

        plaHatAnchor = {
            key: candidate.definition.key,
            worldX: candidate.world.x,
            worldY: candidate.world.y
        };
        plaHatHatOffsetY = currentHat.y - currentCenter.y;

        const dx = currentHat.x - plaHatAnchor.worldX;
        const dy = currentHat.y - plaHatAnchor.worldY;
        plaHatRopeLengthPx = Math.max(PLA_HAT_MIN_ROPE_LENGTH_PX, Math.hypot(dx, dy));
        plaHatAngleRad = Math.atan2(dx, dy);
        plaHatAngularVelocity = (
            inheritedVelocity.x * Math.cos(plaHatAngleRad) +
            inheritedVelocity.up * Math.sin(plaHatAngleRad)
        ) / plaHatRopeLengthPx;
        plaHatAngularVelocity = Math.max(
            -PLA_HAT_MAX_ANGULAR_SPEED,
            Math.min(PLA_HAT_MAX_ANGULAR_SPEED, plaHatAngularVelocity)
        );

        plaHatCurrentPose = PLAYER_JUMP_SEQUENCE[2];
        applyPlayerJumpPose(plaHatCurrentPose);
        stickman.classList.remove('anim-attack', 'boss-wind-landed');
        stickman.classList.add('stand-still', 'player-jumping');
        ensurePlaHatTetherVisual();
        updatePlaHatTetherVisual();
        // 新固定點可能與上一個固定點相距很遠；鏡頭由舊構圖平滑移向新位置，禁止瞬移。
        beginScene3CameraFocusTransition(1050);
        return true;
    }

    function attemptPlaHatConnection() {
        if (
            isPlaHatTethered ||
            !isPlaHatQHeld ||
            !canUsePlaHatTraversal() ||
            !(isPlayerJumping || isPlaHatBallistic || playerWorldElevationPx > 0.5)
        ) return false;

        const metrics = getScene3StageMetrics();
        const hatScreen = getHatTopScreenPoint();
        if (!metrics || !hatScreen) return false;

        const latchRadius = Math.max(
            44,
            (stickman.getBoundingClientRect().height || 120) * PLA_HAT_LATCH_BODY_RATIO
        );
        const now = performance.now();
        let nearest = null;

        for (const definition of PLA_HAT_CONDUCTION_POINTS) {
            if (
                definition.key === plaHatLastAnchorKey &&
                now < plaHatSameAnchorBlockUntil
            ) continue;

            const screen = getPlaConductionScreenPoint(definition);
            if (!screen) continue;
            const distance = Math.hypot(screen.x - hatScreen.x, screen.y - hatScreen.y);
            if (distance > latchRadius || (nearest && distance >= nearest.distance)) continue;
            const world = screenPointToScene3World(screen, metrics);
            if (!world) continue;
            nearest = { definition, screen, world, distance };
        }

        return nearest ? attachPlaHatToConductionPoint(nearest, metrics) : false;
    }

    function releasePlaHatTether(withUpwardBoost = false) {
        if (!isPlaHatTethered || !plaHatAnchor) return false;
        const metrics = getScene3StageMetrics();
        if (!metrics) return false;

        let velocityX = plaHatRopeLengthPx * Math.cos(plaHatAngleRad) * plaHatAngularVelocity;
        let velocityUp = plaHatRopeLengthPx * Math.sin(plaHatAngleRad) * plaHatAngularVelocity;
        const horizontalInput = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);

        if (withUpwardBoost) {
            velocityX += horizontalInput * Math.min(150, metrics.width * 0.15);
            velocityUp = Math.max(PLA_HAT_LAUNCH_UP_SPEED, velocityUp + 170);
            playerWorldElevationPx += 3;
        }

        plaHatLastAnchorKey = plaHatAnchor.key;
        plaHatSameAnchorBlockUntil = performance.now() + PLA_HAT_REATTACH_BLOCK_MS;
        isPlaHatTethered = false;
        plaHatAnchor = null;
        plaHatRopeLengthPx = 0;
        plaHatAngularVelocity = 0;
        hidePlaHatTetherVisual();

        isPlaHatBallistic = true;
        plaBallisticAirTimeSeconds = 0;
        plaTopPlatformJumpCameraLocked = false;
        isPlayerJumping = true;
        canAttack = false;
        plaHatVelocityXPx = velocityX;
        plaHatVelocityUpPx = velocityUp;
        playerJumpHorizontalVelocity = velocityX * 100 / metrics.width;
        playerJumpVerticalVelocityPx = velocityUp;
        playerJumpOffsetPx = 0;
        playerJumpLandingWorldX = worldX;
        stickman.classList.add('stand-still', 'player-jumping');
        return true;
    }

    function launchUpwardFromPlaHatTether() {
        if (!isPlaHatQHeld || !isPlaHatTethered) return false;
        return releasePlaHatTether(true);
    }

    function landPlaHatTraversal() {
        if (window._easterEggUnsafeFalling) {

        // =====================================================
        // 🌟 物理落地
        // =====================================================

        window._easterEggUnsafeFalling = false;

        isPlaHatTethered = false;
        isPlaHatBallistic = false;

        plaBallisticAirTimeSeconds = 0;

        plaTopPlatformJumpCameraLocked = false;

        plaHatAnchor = null;

        playerWorldElevationPx = 0;

        playerJumpOffsetPx = 0;

        playerJumpVerticalVelocityPx = 0;

        plaHatVelocityXPx = 0;

        plaHatVelocityUpPx = 0;

        playerJumpHorizontalVelocity = 0;

        playerJumpLandingWorldX =
            Math.max(5, worldX);


        // =====================================================
        // 🌟 火柴人恢復普通站姿
        // =====================================================

        resetPlayerJumpPose();

        stickman.classList.remove(
            'player-jumping'
        );

        stickman.classList.add(
            'stand-still'
        );


        // =====================================================
        // 🌟 已經真正落地
        // =====================================================

        isPlayerJumping = false;

        isPlayerControllable = true;

        canAttack = true;


        // =====================================================
        // 🌟 先恢復彩蛋前裝備
        //
        // Hammer → 右手
        // 三角形 → 左手
        // 背包 → 原本資料
        // =====================================================

        restorePreEasterEquipmentState();


        // =====================================================
        // 🌟 再把整個失敗關卡重置
        // =====================================================

        resetFailedEasterEggChallenge();


        hidePlaHatTetherVisual();

        return;
        }
        const lastPose = plaHatCurrentPose || PLAYER_JUMP_SEQUENCE[PLAYER_JUMP_SEQUENCE.length - 1];
        isPlaHatTethered = false;
        isPlaHatBallistic = false;
        plaBallisticAirTimeSeconds = 0;
        plaTopPlatformJumpCameraLocked = false;
        plaHatAnchor = null;
        playerWorldElevationPx = 0;
        playerJumpOffsetPx = 0;
        playerJumpVerticalVelocityPx = 0;
        plaHatVelocityXPx = 0;
        plaHatVelocityUpPx = 0;
        playerJumpLandingWorldX = Math.max(5, worldX);
        hidePlaHatTetherVisual();
        finishPlayerVerticalJump(lastPose);
    }

    function updatePlaHatTraversalPhysics(deltaSeconds) {
        if (isPlaHatTethered) {
            if (!isPlaHatQHeld || headItem !== 'hat' || !canUsePlaHatTraversal()) {
                releasePlaHatTether(false);
                return;
            }

            const metrics = getScene3StageMetrics();
            if (!metrics || !plaHatAnchor) return;
            const horizontalInput = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
            if (horizontalInput !== 0) facing = horizontalInput < 0 ? -1 : 1;

            const acceleration =
                -(PLA_HAT_PENDULUM_GRAVITY / Math.max(1, plaHatRopeLengthPx)) * Math.sin(plaHatAngleRad) +
                horizontalInput * PLA_HAT_CONTROL_ACCELERATION -
                PLA_HAT_PENDULUM_DAMPING * plaHatAngularVelocity;

            plaHatAngularVelocity += acceleration * deltaSeconds;
            plaHatAngularVelocity = Math.max(
                -PLA_HAT_MAX_ANGULAR_SPEED,
                Math.min(PLA_HAT_MAX_ANGULAR_SPEED, plaHatAngularVelocity)
            );
            plaHatAngleRad += plaHatAngularVelocity * deltaSeconds;

            if (plaHatAngleRad > PLA_HAT_MAX_SWING_ANGLE) {
                plaHatAngleRad = PLA_HAT_MAX_SWING_ANGLE;
                if (plaHatAngularVelocity > 0) plaHatAngularVelocity *= -0.18;
            } else if (plaHatAngleRad < -PLA_HAT_MAX_SWING_ANGLE) {
                plaHatAngleRad = -PLA_HAT_MAX_SWING_ANGLE;
                if (plaHatAngularVelocity < 0) plaHatAngularVelocity *= -0.18;
            }

            const hatWorldX = plaHatAnchor.worldX + Math.sin(plaHatAngleRad) * plaHatRopeLengthPx;
            const hatWorldY = plaHatAnchor.worldY + Math.cos(plaHatAngleRad) * plaHatRopeLengthPx;
            const centerWorldX = hatWorldX;
            const centerWorldY = hatWorldY - plaHatHatOffsetY;

            worldX = Math.max(5, centerWorldX * 100 / metrics.width);
            playerWorldElevationPx = metrics.groundY - centerWorldY;
            playerJumpLandingWorldX = worldX;
            playerJumpHorizontalVelocity =
                plaHatRopeLengthPx * Math.cos(plaHatAngleRad) * plaHatAngularVelocity * 100 / metrics.width;
            playerJumpVerticalVelocityPx =
                plaHatRopeLengthPx * Math.sin(plaHatAngleRad) * plaHatAngularVelocity;

            if (playerWorldElevationPx <= 0 && playerJumpVerticalVelocityPx <= 0) {
                landPlaHatTraversal();
                return;
            }

            playerWorldElevationPx = Math.max(0, playerWorldElevationPx);
            plaHatCurrentPose = PLAYER_JUMP_SEQUENCE[2];
            applyPlayerJumpPose(plaHatCurrentPose);
            return;
        }

        if (!isPlaHatBallistic) return;
        const metrics = getScene3StageMetrics();
        if (!metrics) return;

        // 只累積真正的 PLA 拋體時間；此值用於下降鏡頭的漸進加速。
        plaBallisticAirTimeSeconds = Math.min(4, plaBallisticAirTimeSeconds + Math.max(0, deltaSeconds));

        const horizontalInput = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
        const maxHorizontalSpeed = metrics.width * 0.24;
        const horizontalAcceleration = metrics.width * 1.4;

        if (horizontalInput !== 0) {
            const targetVelocity = horizontalInput * maxHorizontalSpeed;
            const maxChange = horizontalAcceleration * deltaSeconds;
            const difference = targetVelocity - plaHatVelocityXPx;
            plaHatVelocityXPx += Math.max(-maxChange, Math.min(maxChange, difference));
            facing = horizontalInput < 0 ? -1 : 1;
        } else {
            plaHatVelocityXPx *= Math.exp(-2.2 * deltaSeconds);
        }

        worldX = Math.max(5, worldX + plaHatVelocityXPx * 100 / metrics.width * deltaSeconds);
        playerWorldElevationPx += plaHatVelocityUpPx * deltaSeconds;
        plaHatVelocityUpPx -= PLA_HAT_BALLISTIC_GRAVITY * deltaSeconds;
        playerJumpLandingWorldX = worldX;
        playerJumpHorizontalVelocity = plaHatVelocityXPx * 100 / metrics.width;
        playerJumpVerticalVelocityPx = plaHatVelocityUpPx;

        if (playerWorldElevationPx <= 0 && plaHatVelocityUpPx <= 0) {
            landPlaHatTraversal();
            return;
        }

        playerWorldElevationPx = Math.max(0, playerWorldElevationPx);
        // =====================================================
        // 🌟 不安全天線墜落使用專屬姿勢
        // =====================================================

        if (window._easterEggUnsafeFalling) {

            applyUnsafeAntennaFallPose();

        } else {

            // 原本正常 C 跳躍 / 帽子拋體動作
            const flightProgress = playerJumpClamp01(
                (PLA_HAT_LAUNCH_UP_SPEED - plaHatVelocityUpPx) /
                (PLA_HAT_LAUNCH_UP_SPEED * 2)
            );

            plaHatCurrentPose =
                getPlayerJumpSequencePose(flightProgress);

            applyPlayerJumpPose(plaHatCurrentPose);
        }
    }

    function updateScene3VerticalCamera(deltaSeconds) {
        if (!bossTimelineCompleted) {
            verticalCameraOffsetPx = 0;
            verticalCameraTargetPx = 0;
            plaBallisticAirTimeSeconds = 0;
            plaTopPlatformJumpCameraLocked = false;
            return;
        }

        const metrics = getScene3StageMetrics();
        if (!metrics) return;

        const safeDelta = Math.max(0, deltaSeconds);

        /*
           PLA 最上方橫線已經是實體路地。只要仍是從該平台開始的普通 C 跳躍，
           垂直鏡頭就固定在起跳瞬間的位置；只有離開平台變成 PLA 拋體或重新導通時才解除。
        */
        const lockTopPlatformJumpCamera =
            plaTopPlatformJumpCameraLocked &&
            isOnPlaTopPlatform &&
            isPlayerJumping &&
            !isPlaHatTethered &&
            !isPlaHatBallistic;

        if (lockTopPlatformJumpCamera) {
            verticalCameraTargetPx = plaTopPlatformJumpCameraOffsetPx;
            verticalCameraOffsetPx = plaTopPlatformJumpCameraOffsetPx;
            plaBallisticAirTimeSeconds = 0;
            return;
        }

        if (
            plaTopPlatformJumpCameraLocked &&
            (!isOnPlaTopPlatform || !isPlayerJumping || isPlaHatTethered || isPlaHatBallistic)
        ) {
            plaTopPlatformJumpCameraLocked = false;
        }

        const elevation = getTotalPlayerElevationPx();
        const verticalVelocityUp = getCurrentVerticalVelocityUpPx();
        const plaDescending = isPlaHatBallistic && verticalVelocityUp < -4;

        /*
           垂直鏡頭使用「雙邊死區」而不是每幀直接追蹤角色：
           - 角色在畫面約 45.5%～62.5% 高度之間輕微上下擺動時，鏡頭完全保持不動。
           - 只有超出死區才移動目標，下降時必須越過另一側邊界才會回拉，形成遲滯緩衝。
           - PLA 拋體下降時才依滯空時間與實際下墜速度提高追蹤能力；上升與普通跳躍不變。
        */
        const deadZoneCenterY = metrics.height * 0.54;
        const deadZoneHalfHeight = Math.max(42, Math.min(68, metrics.height * 0.085));
        const deadZoneTopY = deadZoneCenterY - deadZoneHalfHeight;
        const deadZoneBottomY = deadZoneCenterY + deadZoneHalfHeight;

        let velocityLookAhead = 0;
        const traversalActive =
            isPlaHatTethered ||
            isPlaHatBallistic ||
            playerWorldElevationPx > Math.max(120, metrics.height * 0.2);
        const lookAheadStartSpeed = 210;

        if (traversalActive && Math.abs(verticalVelocityUp) > lookAheadStartSpeed) {
            const excessSpeed = Math.abs(verticalVelocityUp) - lookAheadStartSpeed;
            velocityLookAhead = Math.sign(verticalVelocityUp) * Math.min(52, excessSpeed * 0.055);
        }

        let plaFallUrgency = 0;
        let plaDownwardSpeed = 0;
        if (plaDescending) {
            plaDownwardSpeed = Math.max(0, -verticalVelocityUp);
            // 短落差的前段仍維持原速度；滯空約 0.12～1.07 秒後才逐步進入快速追蹤。
            const timeFactor = playerJumpSmoothstep(
                playerJumpClamp01((plaBallisticAirTimeSeconds - 0.12) / 0.95)
            );
            const speedFactor = playerJumpClamp01((plaDownwardSpeed - 240) / 1150);
            plaFallUrgency = Math.max(timeFactor, speedFactor * 0.85);

            // 長距離下墜時增加有限的向下前視，避免角色先衝出畫面鏡頭才開始追。
            const dynamicDownLookAhead = Math.min(
                112,
                18 + plaDownwardSpeed * (0.035 + plaFallUrgency * 0.035)
            );
            velocityLookAhead = -Math.max(Math.abs(velocityLookAhead), dynamicDownLookAhead);
        }

        const trackedElevation = Math.max(0, elevation + velocityLookAhead);
        let target = Math.max(0, verticalCameraTargetPx);
        const projectedPlayerYAtTarget = metrics.groundY - trackedElevation + target;

        if (projectedPlayerYAtTarget < deadZoneTopY) {
            target += deadZoneCenterY - projectedPlayerYAtTarget;
        } else if (projectedPlayerYAtTarget > deadZoneBottomY) {
            target += deadZoneCenterY - projectedPlayerYAtTarget;
        }

        if (
            elevation <= 2 &&
            !isPlayerJumping &&
            !isPlaHatTethered &&
            !isPlaHatBallistic
        ) {
            target = 0;
        }

        target = Math.max(0, Math.min(target, trackedElevation));
        verticalCameraTargetPx = target;

        // 新固定點的慢速運鏡只影響一般移動；真正高速下墜時必須立即讓追蹤速度接管。
        const focusTransitionActive =
            performance.now() < cameraFocusTransitionUntil &&
            !plaDescending;
        let followRate = target > verticalCameraOffsetPx ? 5.8 : 7.2;
        if (elevation <= 2 && !isPlayerJumping) followRate = 10.5;
        if (focusTransitionActive) followRate = Math.min(followRate, 3.35);

        let maxVerticalSpeed = focusTransitionActive ? 420 : 640;
        if (plaDescending) {
            // 滯空越久、下降越快，鏡頭的阻尼響應與最高速度越高；短落差仍接近原本 640px/s。
            followRate = 7.2 + 11.5 * plaFallUrgency;
            const velocityMatchingSpeed =
                plaDownwardSpeed * (1.08 + 0.22 * plaFallUrgency) + 100;
            maxVerticalSpeed = 640 +
                (Math.max(640, velocityMatchingSpeed) - 640) * plaFallUrgency;
        }

        const blend = 1 - Math.exp(-followRate * safeDelta);
        const desiredStep = (verticalCameraTargetPx - verticalCameraOffsetPx) * blend;
        const maxStep = maxVerticalSpeed * safeDelta;
        verticalCameraOffsetPx += Math.max(-maxStep, Math.min(maxStep, desiredStep));

        if (Math.abs(verticalCameraOffsetPx - verticalCameraTargetPx) < 0.04) {
            verticalCameraOffsetPx = verticalCameraTargetPx;
        }
        verticalCameraOffsetPx = Math.max(0, verticalCameraOffsetPx);
    }

    function shouldUsePlaBufferedHorizontalCamera() {
        if (!bossTimelineCompleted) return false;

        /*
           只在「實際已連接 X／圓點」或「由導通／平台離開後的 PLA 拋體」使用緩衝。
           普通 C 跳躍不論位於哪一個 worldX、地面或最上方橫線，都不會切換模式。
        */
        return isPlaHatTethered || isPlaHatBallistic;
    }

    function updateScene3HorizontalCamera(deltaSeconds) {
        const safeDelta = Math.max(0, deltaSeconds);
        const originalCameraX = Math.max(0, worldX - 20);
        const useBufferedCamera = shouldUsePlaBufferedHorizontalCamera();

        if (!useBufferedCamera) {
            /*
               一般地面、普通跳躍與最上方平台一律使用最初構圖：角色在畫面左側 20%。
               若上一幀剛從 PLA 緩衝模式落地，先記錄兩個鏡頭之間的殘差；之後把殘差
               逐幀衰減，同時 originalCameraX 仍完全跟著 worldX，因而沒有模式切換順移。
            */
            if (horizontalCameraWasBuffered) {
                horizontalCameraHandoffOffsetX = cameraX - originalCameraX;
                horizontalCameraWasBuffered = false;
            }

            if (Math.abs(horizontalCameraHandoffOffsetX) > 0.001) {
                const focusTransitionActive = performance.now() < cameraFocusTransitionUntil;
                const handoffRate = focusTransitionActive ? 4.2 : 6.8;
                const desiredStep =
                    -horizontalCameraHandoffOffsetX *
                    (1 - Math.exp(-handoffRate * safeDelta));
                const maxHandoffSpeed = focusTransitionActive ? 32 : 48;
                const maxStep = maxHandoffSpeed * safeDelta;
                horizontalCameraHandoffOffsetX += Math.max(
                    -maxStep,
                    Math.min(maxStep, desiredStep)
                );
                if (Math.abs(horizontalCameraHandoffOffsetX) < 0.012) {
                    horizontalCameraHandoffOffsetX = 0;
                }
            } else {
                horizontalCameraHandoffOffsetX = 0;
            }

            cameraX = Math.max(0, originalCameraX + horizontalCameraHandoffOffsetX);
            horizontalCameraTargetX = originalCameraX;
            horizontalCameraInitialized = true;
            return;
        }

        // 進入導通／拋體的第一幀直接承接目前畫面，不改變構圖、不跳到另一個鏡頭。
        if (!horizontalCameraWasBuffered) {
            horizontalCameraWasBuffered = true;
            horizontalCameraHandoffOffsetX = 0;
            horizontalCameraTargetX = Math.max(0, cameraX);
            horizontalCameraInitialized = true;
        } else if (!horizontalCameraInitialized) {
            horizontalCameraTargetX = Math.max(0, cameraX);
            horizontalCameraInitialized = true;
        }

        /*
           PLA 導通／拋體的死區也沿用地板構圖，不再把角色置中：
           - 目標中心固定在畫面左側 20%；
           - 約 12%～28% 之間的小幅擺盪完全不推動鏡頭；
           - 超出後才平滑回到 20%，跨固定點仍會完整運鏡而非順移。
        */
        const deadZoneCenterX = 20;
        const deadZoneHalfWidth = 8;
        const deadZoneLeftX = deadZoneCenterX - deadZoneHalfWidth;
        const deadZoneRightX = deadZoneCenterX + deadZoneHalfWidth;
        const actualScreenX = worldX - cameraX;

        if (actualScreenX < deadZoneLeftX || actualScreenX > deadZoneRightX) {
            horizontalCameraTargetX = originalCameraX;
        }

        const focusTransitionActive = performance.now() < cameraFocusTransitionUntil;
        const followRate = focusTransitionActive ? 3.15 : 5.15;
        const desiredStep =
            (horizontalCameraTargetX - cameraX) *
            (1 - Math.exp(-followRate * safeDelta));
        // 百分比／秒上限確保跨固定點時從舊畫面完整平移到新畫面，而非直接順移。
        const maxHorizontalSpeed = focusTransitionActive ? 46 : 72;
        const maxStep = maxHorizontalSpeed * safeDelta;
        cameraX += Math.max(-maxStep, Math.min(maxStep, desiredStep));
        cameraX = Math.max(0, cameraX);

        if (Math.abs(cameraX - horizontalCameraTargetX) < 0.002) {
            cameraX = horizontalCameraTargetX;
        }
    }

    function renderScene3PlayerAndCamera() {
        const totalElevation = getTotalPlayerElevationPx();
        const px = worldX - cameraX;
        const screenElevation = totalElevation - verticalCameraOffsetPx;

        stickman.style.left = `${px}%`;
        stickman.style.top = Math.abs(screenElevation) > 0.001
            ? `calc(${py}% - ${screenElevation.toFixed(3)}px)`
            : `${py}%`;
        stickman.style.transform = `translate(-50%, -50%) scaleX(${facing})`;
        environmentLayer.style.transform =
            `translate(${-cameraX}%, ${verticalCameraOffsetPx.toFixed(3)}px)`;
        updatePlaHatTetherVisual();
    }


    // ==============================================================
    // 🌬️ BOSS 離場後的風吹落書本事件
    // - 完全移除舊版細長 SVG 風線，改用寬幅透明霧流、柔和氣壓帶與霧團。
    // - 整股風由右上往左下 45° 掠過，書本沿連續三次貝茲拋物線被帶到角色頭上。
    // - 書本外觀、撞頭、角色壓縮與落地節奏仍沿用 Scene 1 開場。
    // - 書本落地後必須靠近才顯示 E；拾取後新增 PAGE 3 並解鎖 C 跳躍。
    // ==============================================================
    function createPostBossBookWindLayer() {
        const stage = document.getElementById('scene3-stage');
        if (!stage) return null;

        const oldLayer = document.getElementById('post-boss-book-wind-layer-s3');
        if (oldLayer) oldLayer.remove();

        const stageWidth = Math.max(1, stage.clientWidth || scene3.clientWidth || 1000);
        const stageHeight = Math.max(1, stage.clientHeight || scene3.clientHeight || 600);
        const windDuration = 1880;
        const diagonalTravel = Math.max(260, Math.min(520, Math.min(stageWidth, stageHeight) * 0.58));

        const windLayer = document.createElement('div');
        windLayer.id = 'post-boss-book-wind-layer-s3';
        windLayer.setAttribute('aria-hidden', 'true');
        windLayer.style.cssText = [
            'position:absolute',
            'inset:-24%',
            'z-index:7',
            'pointer-events:none',
            'overflow:visible',
            'opacity:0',
            'mix-blend-mode:screen',
            'transform-origin:center center',
            'will-change:transform,opacity'
        ].join(';');
        stage.appendChild(windLayer);

        // 最外層的大片霧幕：形成真正有體積的空氣，而不是一根根線條。
        const pressureWash = document.createElement('div');
        pressureWash.style.cssText = [
            'position:absolute',
            'left:-8%',
            'top:-4%',
            'width:122%',
            'height:108%',
            'border-radius:50%',
            'background:radial-gradient(ellipse at 63% 35%, rgba(236,254,255,0.31) 0%, rgba(177,242,252,0.19) 27%, rgba(255,255,255,0.085) 49%, rgba(113,218,239,0.026) 66%, transparent 80%)',
            'filter:blur(28px)',
            'opacity:0.66',
            'transform:rotate(-34deg) scale(1.06,0.82)',
            'will-change:transform,opacity'
        ].join(';');
        windLayer.appendChild(pressureWash);

        // 寬幅氣流帶：每一層都是柔霧面，不使用描邊，所以不會像頭髮。
        const bandSpecs = [
            { left: -2, top: 12, width: 116, height: 27, blur: 13, opacity: 0.88, rotate: -34, delay: 0 },
            { left: 10, top: 29, width: 108, height: 20, blur: 18, opacity: 0.68, rotate: -36, delay: 55 },
            { left: -12, top: 48, width: 126, height: 25, blur: 22, opacity: 0.57, rotate: -32, delay: 100 },
            { left: 21, top: 4, width: 92, height: 17, blur: 16, opacity: 0.48, rotate: -38, delay: 135 },
            { left: 4, top: 67, width: 106, height: 19, blur: 25, opacity: 0.38, rotate: -33, delay: 165 }
        ];

        const bands = bandSpecs.map((spec, index) => {
            const band = document.createElement('div');
            band.style.cssText = [
                'position:absolute',
                `left:${spec.left}%`,
                `top:${spec.top}%`,
                `width:${spec.width}%`,
                `height:${spec.height}%`,
                'border-radius:50%',
                `opacity:${spec.opacity}`,
                `filter:blur(${spec.blur}px)`,
                `transform:rotate(${spec.rotate}deg) scaleX(${0.9 + index * 0.025})`,
                'background:linear-gradient(90deg, transparent 0%, rgba(211,249,255,0.026) 8%, rgba(176,240,251,0.13) 25%, rgba(246,254,255,0.34) 49%, rgba(155,231,245,0.14) 72%, rgba(255,255,255,0.034) 86%, transparent 100%)',
                'will-change:transform,opacity'
            ].join(';');
            windLayer.appendChild(band);
            return { band, spec, index };
        });

        // 分散霧團讓風具有亂流與厚度；全部仍是柔和面狀元素。
        const puffSpecs = [
            [69, -5, 28, 15, 24, 0.42], [83, 12, 22, 12, 20, 0.36],
            [58, 19, 34, 18, 29, 0.32], [74, 34, 30, 16, 26, 0.38],
            [45, 42, 38, 20, 32, 0.27], [62, 58, 32, 17, 28, 0.31],
            [31, 64, 36, 20, 34, 0.23], [88, 51, 24, 13, 23, 0.29],
            [52, 3, 27, 14, 24, 0.30], [20, 48, 31, 17, 30, 0.20]
        ];

        const puffs = puffSpecs.map((spec, index) => {
            const [left, top, width, height, blur, opacity] = spec;
            const puff = document.createElement('div');
            puff.style.cssText = [
                'position:absolute',
                `left:${left}%`,
                `top:${top}%`,
                `width:${width}%`,
                `height:${height}%`,
                'border-radius:50%',
                `opacity:${opacity}`,
                `filter:blur(${blur}px)`,
                'background:radial-gradient(ellipse at center, rgba(248,255,255,0.42) 0%, rgba(175,239,250,0.18) 38%, rgba(112,213,233,0.045) 63%, transparent 79%)',
                `transform:rotate(${-38 + (index % 4) * 3}deg) scale(${0.88 + (index % 3) * 0.08})`,
                'will-change:transform,opacity'
            ].join(';');
            windLayer.appendChild(puff);
            return puff;
        });

        // 寬厚的霧狀彎流：利用柔邊橢圓環形成風的捲曲感，沒有任何細描邊。
        const curlSpecs = [
            { left: 53, top: 1, width: 42, height: 24, blur: 5, opacity: 0.64, rotate: -35, delay: 10 },
            { left: 68, top: 24, width: 36, height: 21, blur: 7, opacity: 0.54, rotate: -39, delay: 70 },
            { left: 43, top: 42, width: 48, height: 27, blur: 9, opacity: 0.47, rotate: -32, delay: 115 },
            { left: 72, top: 57, width: 31, height: 19, blur: 8, opacity: 0.40, rotate: -37, delay: 155 }
        ];
        const curls = curlSpecs.map((spec, index) => {
            const curl = document.createElement('div');
            curl.style.cssText = [
                'position:absolute',
                `left:${spec.left}%`,
                `top:${spec.top}%`,
                `width:${spec.width}%`,
                `height:${spec.height}%`,
                'border-radius:50%',
                `opacity:${spec.opacity}`,
                `filter:blur(${spec.blur}px)`,
                'background:radial-gradient(ellipse at 50% 61%, transparent 0%, transparent 41%, rgba(244,255,255,0.44) 49%, rgba(171,240,251,0.25) 58%, rgba(116,221,239,0.075) 66%, transparent 76%)',
                '-webkit-mask-image:linear-gradient(90deg, transparent 0%, #000 18%, #000 82%, transparent 100%)',
                'mask-image:linear-gradient(90deg, transparent 0%, #000 18%, #000 82%, transparent 100%)',
                `transform:rotate(${spec.rotate}deg) scale(0.9,0.82)`,
                'will-change:transform,opacity'
            ].join(';');
            windLayer.appendChild(curl);
            return { curl, spec, index };
        });

        // 各霧層有微小的不同呼吸與錯位，避免整片像一張靜態貼圖。
        bands.forEach(({ band, spec, index }) => {
            if (typeof band.animate !== 'function') return;
            band.animate([
                { transform: `rotate(${spec.rotate}deg) translate3d(18px, ${-7 + index * 2}px, 0) scaleX(0.92) scaleY(0.88)`, opacity: spec.opacity * 0.42 },
                { offset: 0.45, transform: `rotate(${spec.rotate + 1.5}deg) translate3d(-8px, ${6 - index}px, 0) scaleX(1.05) scaleY(1.06)`, opacity: spec.opacity },
                { transform: `rotate(${spec.rotate - 1}deg) translate3d(-28px, ${12 - index * 2}px, 0) scaleX(1.13) scaleY(0.95)`, opacity: spec.opacity * 0.56 }
            ], {
                duration: windDuration - 150,
                delay: spec.delay,
                easing: 'cubic-bezier(0.2, 0.68, 0.22, 1)',
                fill: 'forwards'
            });
        });

        puffs.forEach((puff, index) => {
            if (typeof puff.animate !== 'function') return;
            puff.animate([
                { transform: `translate3d(${18 + index * 2}px, ${-14 - index}px, 0) rotate(-37deg) scale(0.72)`, opacity: 0 },
                { offset: 0.24, transform: `translate3d(${4 - index}px, ${-2 + index * 0.6}px, 0) rotate(-35deg) scale(1.02)`, opacity: Number(puff.style.opacity) },
                { offset: 0.72, transform: `translate3d(${-18 - index * 2}px, ${12 + index}px, 0) rotate(-32deg) scale(1.14)`, opacity: Number(puff.style.opacity) * 0.86 },
                { transform: `translate3d(${-42 - index * 3}px, ${28 + index * 1.4}px, 0) rotate(-30deg) scale(1.28)`, opacity: 0 }
            ], {
                duration: windDuration - 80 + (index % 3) * 60,
                delay: index * 24,
                easing: 'cubic-bezier(0.16, 0.66, 0.2, 1)',
                fill: 'forwards'
            });
        });

        curls.forEach(({ curl, spec, index }) => {
            if (typeof curl.animate !== 'function') return;
            curl.animate([
                { transform: `translate3d(${28 + index * 8}px, ${-18 - index * 3}px, 0) rotate(${spec.rotate}deg) scale(0.72,0.66)`, opacity: 0 },
                { offset: 0.26, transform: `translate3d(${6 - index * 3}px, ${-2 + index}px, 0) rotate(${spec.rotate + 1}deg) scale(1.02,0.92)`, opacity: spec.opacity },
                { offset: 0.7, transform: `translate3d(${-26 - index * 7}px, ${18 + index * 4}px, 0) rotate(${spec.rotate + 3}deg) scale(1.17,1.02)`, opacity: spec.opacity * 0.82 },
                { transform: `translate3d(${-58 - index * 9}px, ${42 + index * 5}px, 0) rotate(${spec.rotate + 5}deg) scale(1.34,1.1)`, opacity: 0 }
            ], {
                duration: windDuration - 70 + index * 45,
                delay: spec.delay,
                easing: 'cubic-bezier(0.16, 0.66, 0.2, 1)',
                fill: 'forwards'
            });
        });

        if (typeof pressureWash.animate === 'function') {
            pressureWash.animate([
                { transform: 'rotate(-35deg) translate3d(30px,-24px,0) scale(0.86,0.72)', opacity: 0 },
                { offset: 0.28, transform: 'rotate(-34deg) translate3d(4px,-4px,0) scale(1.03,0.9)', opacity: 0.82 },
                { offset: 0.7, transform: 'rotate(-32deg) translate3d(-18px,16px,0) scale(1.14,0.98)', opacity: 0.68 },
                { transform: 'rotate(-31deg) translate3d(-46px,38px,0) scale(1.28,1.04)', opacity: 0 }
            ], {
                duration: windDuration,
                easing: 'cubic-bezier(0.18, 0.7, 0.2, 1)',
                fill: 'forwards'
            });
        }

        const sweepFrames = [
            { offset: 0, opacity: 0, transform: `translate3d(${diagonalTravel}px, ${-diagonalTravel}px, 0) rotate(-1.5deg) scale(0.92)` },
            { offset: 0.12, opacity: 0.2, transform: `translate3d(${diagonalTravel * 0.78}px, ${-diagonalTravel * 0.78}px, 0) rotate(-1deg) scale(0.96)` },
            { offset: 0.31, opacity: 0.94, transform: `translate3d(${diagonalTravel * 0.39}px, ${-diagonalTravel * 0.39}px, 0) rotate(-0.4deg) scale(1)` },
            { offset: 0.6, opacity: 1, transform: 'translate3d(0,0,0) rotate(0deg) scale(1.03)' },
            { offset: 0.82, opacity: 0.66, transform: `translate3d(${-diagonalTravel * 0.48}px, ${diagonalTravel * 0.48}px, 0) rotate(0.8deg) scale(1.06)` },
            { offset: 1, opacity: 0, transform: `translate3d(${-diagonalTravel}px, ${diagonalTravel}px, 0) rotate(1.4deg) scale(1.1)` }
        ];

        const removeWind = () => {
            if (windLayer.isConnected) windLayer.remove();
        };

        if (typeof windLayer.animate === 'function') {
            const sweep = windLayer.animate(sweepFrames, {
                duration: windDuration,
                easing: 'cubic-bezier(0.18, 0.68, 0.18, 1)',
                fill: 'forwards'
            });
            sweep.finished.catch(() => {}).finally(removeWind);
        } else {
            windLayer.style.transition = `transform ${windDuration}ms cubic-bezier(0.18,0.68,0.18,1), opacity ${windDuration}ms ease`;
            windLayer.style.transform = sweepFrames[0].transform;
            windLayer.style.opacity = '0';
            requestAnimationFrame(() => requestAnimationFrame(() => {
                windLayer.style.transform = sweepFrames[sweepFrames.length - 1].transform;
                windLayer.style.opacity = '0';
            }));
            setTimeout(removeWind, windDuration + 80);
        }

        return windLayer;
    }

    function postBossBookCubicPoint(p0, p1, p2, p3, t) {
        const u = 1 - t;
        const uu = u * u;
        const tt = t * t;
        return {
            x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
            y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y
        };
    }

    function postBossBookCubicDerivative(p0, p1, p2, p3, t) {
        const u = 1 - t;
        return {
            x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
            y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y)
        };
    }

    function postBossBookSmoothstep(edge0, edge1, value) {
        if (edge0 === edge1) return value >= edge1 ? 1 : 0;
        const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }

    async function animatePostBossBookWindArc(book, geometry) {
        const {
            startLeft,
            startTop,
            impactLeft,
            impactTop,
            stageWidth,
            stageHeight
        } = geometry;

        // 以實際時間積分的重力拋物線取代過慢的 1.12 秒漂浮；整段約 0.82 秒自然落到頭上。
        const duration = 820;
        const durationSeconds = duration / 1000;
        const deltaX = impactLeft - startLeft;
        const deltaY = impactTop - startTop;
        const initialDownVelocity = Math.max(38, Math.min(92, stageHeight * 0.11));
        const gravity = Math.max(
            520,
            (2 * (deltaY - initialDownVelocity * durationSeconds)) /
                (durationSeconds * durationSeconds)
        );
        const startedAt = performance.now();

        await new Promise(resolve => {
            const frame = now => {
                if (!isCurrentScene3Instance() || !book.isConnected) {
                    resolve();
                    return;
                }

                const progress = Math.max(0, Math.min(1, (now - startedAt) / duration));
                const elapsedSeconds = progress * durationSeconds;
                // 水平風力前段較強、接近角色時自然收束；Y 軸完全依重力加速。
                const horizontalEase = 1 - Math.pow(1 - progress, 2.08);
                const x = startLeft + deltaX * horizontalEase;
                const y = startTop +
                    initialDownVelocity * elapsedSeconds +
                    0.5 * gravity * elapsedSeconds * elapsedSeconds;

                // 只保留非常小的風壓漂移，避免原本像逐格停頓的左右晃動。
                const microSway = Math.sin(Math.PI * progress) * Math.sin(progress * Math.PI * 2.2) * 2.2;
                const drawX = x + microSway;
                const drawY = y - Math.abs(microSway) * 0.2;

                const velocityX =
                    deltaX * 2.08 * Math.pow(Math.max(0, 1 - progress), 1.08) /
                    durationSeconds;
                const velocityY = initialDownVelocity + gravity * elapsedSeconds;
                const tangentRotation = Math.atan2(velocityY, velocityX) * 180 / Math.PI - 90;
                const flutter = Math.sin(progress * Math.PI * 3.2) * (1 - progress) * 3.2;
                const settle = postBossBookSmoothstep(0.82, 1, progress);
                const rotation = (tangentRotation + flutter) * (1 - settle) + 10 * settle;
                const scale = 0.91 + postBossBookSmoothstep(0, 0.52, progress) * 0.09;
                const opacity = postBossBookSmoothstep(0, 0.075, progress);

                book.style.left = `${drawX}px`;
                book.style.top = `${drawY}px`;
                book.style.opacity = String(opacity);
                book.style.transform = `rotate(${rotation}deg) scale(${scale})`;

                if (progress < 1) {
                    requestAnimationFrame(frame);
                    return;
                }

                book.style.left = `${impactLeft}px`;
                book.style.top = `${impactTop}px`;
                book.style.opacity = '1';
                book.style.transform = 'rotate(10deg) scale(1)';
                resolve();
            };

            requestAnimationFrame(frame);
        });
    }

    async function triggerPostBossBookFallSequence() {
        if (
            postBossBookSequenceStarted ||
            !bossTimelineCompleted ||
            bossTimelineRunning ||
            !isPlayerControllable ||
            isPlayerJumping ||
            isPlayerAttacking ||
            playerDead ||
            isGamePaused ||
            backpackIsOpen ||
            manualModal.classList.contains('manual-active') ||
            !isCurrentScene3Instance()
        ) return;

        postBossBookSequenceStarted = true;
        postBossBookSequenceRunning = true;
        postBossBookReadyToPick = false;
        isPlayerControllable = false;
        canAttack = false;
        isPlayerAttacking = false;
        clearMovementKeys();
        stickman.classList.remove('anim-attack');
        stickman.classList.add('stand-still');
        setBossUiLocked(true);

        try {
            const stage = document.getElementById('scene3-stage');
            const head = document.getElementById('stickman-head-s3');
            if (!stage || !head || !environmentLayer) {
                throw new Error('Post-BOSS book sequence DOM is incomplete.');
            }

            const stageRect = stage.getBoundingClientRect();
            const environmentRect = environmentLayer.getBoundingClientRect();
            const headRect = head.getBoundingClientRect();
            const stageWidth = Math.max(1, stageRect.width || stage.clientWidth || 1000);
            const stageHeight = Math.max(1, stageRect.height || stage.clientHeight || 600);

            // Scene 1 的撞頭幾何：書本左緣在頭部中心左 22px；書底壓入頭頂約 9px。
            const impactLeft = headRect.left + headRect.width / 2 - environmentRect.left - 22;
            const impactTop = Math.max(-20, headRect.top - environmentRect.top - 51);
            const startLeft = impactLeft + Math.max(150, Math.min(270, stageWidth * 0.27));
            const startTop = Math.min(-72, impactTop - Math.max(250, Math.min(390, stageHeight * 0.62)));

            // Scene 1 撞頭後向角色右側偏移 67px；此處只調整 Y 以精準貼住畫面地面。
            const landingLeft = impactLeft + 67;
            const landingTop = Math.max(impactTop + 82, stageRect.bottom - environmentRect.top - 58);

            const book = document.createElement('div');
            book.id = 'post-boss-falling-book-s3';
            book.style.cssText = [
                'position:absolute',
                `top:${startTop}px`,
                `left:${startLeft}px`,
                'width:45px',
                'height:60px',
                'background-color:#094b8e',
                'border:2px solid #fff',
                'border-left:8px solid #042a53',
                'border-radius:2px 6px 6px 2px',
                'box-shadow:inset -4px 0 0 #ddd, 0 0 15px rgba(0,242,254,0.5)',
                'display:flex',
                'justify-content:center',
                'align-items:center',
                'opacity:0',
                'z-index:9',
                'pointer-events:auto',
                'transform:rotate(84deg) scale(0.88)',
                'transform-origin:center center',
                'will-change:left,top,transform,opacity'
            ].join(';');
            book.innerHTML = `<span style="color:#fff; font-family:'Orbitron', sans-serif; font-size:14px; font-weight:900; transform:rotate(-90deg); letter-spacing:2px;">C++</span>`;

            const prompt = document.createElement('div');
            prompt.id = 'post-boss-book-e-prompt-s3';
            prompt.textContent = 'E';
            prompt.style.cssText = [
                'position:absolute',
                `left:${landingLeft - 10}px`,
                `top:${landingTop - 45}px`,
                'width:30px',
                'height:30px',
                'background:rgba(0,242,254,0.15)',
                'border:2px solid var(--brand-blue)',
                'border-radius:6px',
                'color:#fff',
                "font-family:'Orbitron', sans-serif",
                'font-weight:bold',
                'font-size:14px',
                'display:flex',
                'justify-content:center',
                'align-items:center',
                'opacity:0',
                'transition:opacity 0.3s',
                'z-index:20',
                'box-shadow:0 0 10px var(--brand-blue)',
                'pointer-events:none',
                'will-change:transform,opacity'
            ].join(';');

            environmentLayer.appendChild(book);
            environmentLayer.appendChild(prompt);
            postBossBookElement = book;
            postBossBookPromptElement = prompt;

            createPostBossBookWindLayer();

            // 先讓霧狀陣風進入畫面，再讓書本沿受風拋物線飛向角色頭部。
            await waitBossTimeline(60);
            if (!isCurrentScene3Instance()) return;

            await animatePostBossBookWindArc(book, {
                startLeft,
                startTop,
                impactLeft,
                impactTop,
                stageWidth,
                stageHeight
            });
            if (!isCurrentScene3Instance()) return;

            // Scene 1 的撞頭壓縮：保留角色當下朝向，避免 scaleX 被覆蓋。
            const frozenFacing = facing < 0 ? -1 : 1;
            stickman.style.transition = 'transform 0.1s ease-out';
            stickman.style.transform = `translate(-50%, -50%) scaleX(${frozenFacing}) scaleY(0.7) translateY(20px)`;

            await waitBossTimeline(180);
            if (!isCurrentScene3Instance()) return;

            // 第二段與 Scene 1 相同：角色回彈，書本 0.4 秒旋轉並滑落到地面。
            stickman.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            stickman.style.transform = `translate(-50%, -50%) scaleX(${frozenFacing})`;

            book.style.transition = 'top 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53), transform 0.4s linear, left 0.4s linear';
            book.style.top = `${landingTop}px`;
            book.style.left = `${landingLeft}px`;
            book.style.transform = 'rotate(85deg)';

            await waitBossTimeline(400);
            if (!isCurrentScene3Instance()) return;

            // Scene 1 在書本落地後保留 0.2 秒，再顯示可按 E 的提示。
            await waitBossTimeline(200);
            if (!isCurrentScene3Instance()) return;

            prompt.style.opacity = '0';
            if (typeof prompt.animate === 'function') {
                prompt.animate([
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-5px)' },
                    { transform: 'translateY(0)' }
                ], {
                    duration: 1500,
                    iterations: Infinity,
                    easing: 'ease-in-out'
                });
            }

            postBossBookReadyToPick = true;
            updatePostBossBookProximity();
        } catch (error) {
            console.error('Scene 3 post-BOSS book sequence failed:', error);
        } finally {
            if (!isCurrentScene3Instance()) return;

            postBossBookSequenceRunning = false;
            isPlayerControllable = true;
            canAttack = true;
            clearMovementKeys();
            setBossUiLocked(false);
            stickman.classList.add('stand-still');
            stickman.style.left = `${worldX - cameraX}%`;
            stickman.style.top = `${py}%`;
            stickman.style.transform = `translate(-50%, -50%) scaleX(${facing})`;
            stickman.style.transition = 'none';
            environmentLayer.style.transform = `translate(${-cameraX}%, ${verticalCameraOffsetPx.toFixed(3)}px)`;
        }
    }

    function updatePostBossBookProximity() {
        const canEvaluate =
            postBossBookReadyToPick &&
            !postBossBookPickedUp &&
            postBossBookElement &&
            postBossBookElement.isConnected;

        if (!canEvaluate) {
            isNearPostBossBook = false;
            if (postBossBookPromptElement) postBossBookPromptElement.style.opacity = '0';
            return;
        }

        const playerRect = stickman.getBoundingClientRect();
        const bookRect = postBossBookElement.getBoundingClientRect();
        const playerCenterX = playerRect.left + playerRect.width / 2;
        const playerCenterY = playerRect.top + playerRect.height / 2;
        const bookCenterX = bookRect.left + bookRect.width / 2;
        const bookCenterY = bookRect.top + bookRect.height / 2;
        const horizontalDistance = Math.abs(playerCenterX - bookCenterX);
        const verticalDistance = Math.abs(playerCenterY - bookCenterY);

        // 以角色實際像素尺寸建立拾取範圍，縮放或全螢幕時仍維持相同體感距離。
        const horizontalRange = Math.max(105, playerRect.width * 1.35);
        const verticalRange = Math.max(90, playerRect.height * 0.85);
        isNearPostBossBook = horizontalDistance <= horizontalRange && verticalDistance <= verticalRange;

        if (postBossBookPromptElement) {
            postBossBookPromptElement.style.opacity = isNearPostBossBook ? '1' : '0';
        }
    }

    function collectPostBossJumpManual() {
        if (
            !postBossBookReadyToPick ||
            postBossBookPickedUp ||
            !isNearPostBossBook ||
            !postBossBookElement ||
            !postBossBookElement.isConnected ||
            !isPlayerControllable ||
            isPlayerJumping ||
            isPlayerAttacking ||
            playerDead ||
            isGamePaused ||
            backpackIsOpen ||
            manualModal.classList.contains('manual-active')
        ) return false;

        postBossBookPickedUp = true;
        postBossBookReadyToPick = false;
        isNearPostBossBook = false;
        isPlayerControllable = false;
        clearMovementKeys();
        stickman.classList.add('stand-still');

        const book = postBossBookElement;
        const prompt = postBossBookPromptElement;
        if (prompt) prompt.style.opacity = '0';

        book.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
        book.style.transform = 'rotate(85deg) scale(0)';
        book.style.opacity = '0';
        book.style.pointerEvents = 'none';

        setTimeout(() => {
            if (!isCurrentScene3Instance()) return;

            if (book.isConnected) book.remove();
            if (prompt && prompt.isConnected) prompt.remove();
            postBossBookElement = null;
            postBossBookPromptElement = null;

            hasThirdManual = true;
            jumpManualUnlocked = true;
            playerState.hasThirdManual = true;

            // 拾取後先顯示 PAGE 3；停留 5 秒再自動翻至新取得的 PAGE 4。
            openManual(3, true);
        }, 400);

        return true;
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

        bossAmbientEmitterTimer = scheduleSceneInterval(() => {
            if (!isCurrentScene3Instance() || !bossAmbientEmitterActive) {
                if (bossAmbientEmitterTimer !== null) {
                    clearSceneInterval(bossAmbientEmitterTimer);
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
            clearSceneInterval(bossAmbientEmitterTimer);
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

        const rollShell = document.getElementById('stickman-roll-shell');
        const tumbleFacingAtStart = facing < 0 ? -1 : 1;
        if (rollShell) {
            // 右向：-360deg；左向外層有 scaleX(-1)，故用 +360deg 抵消鏡像反轉。
            // 兩種面向在畫面上最後都呈現相同的逆時鐘翻滾。
            rollShell.style.setProperty(
                '--tumble-rotation-end',
                tumbleFacingAtStart < 0 ? '360deg' : '-360deg'
            );
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

        // 在取消 fill: forwards 動畫之前，直接讀取畫面上的最後一幀中心點。
        // 後續世界座標與控制起點完全採用同一個實際像素位置，不再重新估算。
        let committedFinalX = finalX;
        let committedFinalY = finalY;
        if (playerAnimation) {
            const renderedFinalRect = stickman.getBoundingClientRect();
            committedFinalX = bossClamp01(
                (renderedFinalRect.left - sceneRect.left + renderedFinalRect.width / 2) / sceneWidth
            ) * 100;
            committedFinalY = bossClamp01(
                (renderedFinalRect.top - sceneRect.top + renderedFinalRect.height / 2) / sceneHeight
            ) * 100;
        }

        if (playerAnimation) playerAnimation.cancel();
        if (environmentAnimation) environmentAnimation.cancel();

        worldX = committedFinalX;
        cameraX = 0;
        horizontalCameraTargetX = 0;
        horizontalCameraInitialized = true;
        horizontalCameraWasBuffered = false;
        horizontalCameraHandoffOffsetX = 0;
        cameraFocusTransitionUntil = 0;
        py = committedFinalY;
        facing = 1; // 落地後面向仍停在右上方的 BOSS。
        postBossGroundY = committedFinalY;
        postBossLandingAnchor = {
            worldX: committedFinalX,
            py: committedFinalY,
            cameraX: 0,
            facing: 1
        };

        stickman.style.left = `${committedFinalX}%`;
        stickman.style.top = `${committedFinalY}%`;
        stickman.style.transform = `translate(-50%, -50%) scaleX(${facing})`;
        stickman.style.filter = '';
        verticalCameraOffsetPx = 0;
        verticalCameraTargetPx = 0;
        playerWorldElevationPx = 0;
        environmentLayer.style.transform = 'translate(0%, 0px)';

        stickman.classList.remove('player-tumble', 'boss-wind-pushed');
        if (rollShell) rollShell.style.removeProperty('--tumble-rotation-end');
        stickman.classList.add('boss-wind-landed', 'stand-still');
        await waitBossTimeline(270);
        if (!isCurrentScene3Instance()) return;
        stickman.classList.remove('boss-wind-landed');
        commitPostBossLandingAnchor();
    }


    function isPlaUnlockedByCollectedLoot() {
        // 首殺教學不會放入正式道具；PLA 解鎖只計算第 2～9 隻掉落的 7 個 body 與 1 個 hat。
        // 同時檢查計數與場上未拾取物，避免掉落物尚在生成／地面時提前解除玻璃牆。
        return (
            collectedTriangleLoot >= TOTAL_TRIANGLE_LOOT &&
            scene3.querySelectorAll('.loot-drop-item:not(.picked)').length === 0
        );
    }

    function checkBossTimelineReady() {
            if (
                bossTimelineStarted ||
                bossTimelineRunning ||
                bossTimelineCompleted ||
                !isCurrentScene3Instance()
            ) return;

            if (bossTimelineCheckTimer !== null) {
                clearSceneTimeout(bossTimelineCheckTimer);
                bossTimelineCheckTimer = null;
            }

            bossTimelineCheckTimer = scheduleSceneTimeout(() => {
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
        commitPostBossLandingAnchor();
        isPlayerControllable = true;
        canAttack = true;
        clearMovementKeys();
        setBossUiLocked(false);
        stickman.classList.add('stand-still');
    }

    // ==============================================================
    // 🌟 新增：Q 鍵按住時的「手腳骨架變形」(注入可控天線版)
    // ==============================================================
    function toggleEasterEggQPose(isHeld) {
        window._easterEggQHeld = isHeld;
        const stickman = document.getElementById('stickman-s3');
        const armLBase = document.getElementById('armL-base-s3');
        const armLPath = document.getElementById('armL-path-s3');
        const armRBase = document.getElementById('armR-base-s3');
        const armRPath = document.getElementById('armR-path-s3');
        const legLBase = document.getElementById('legL-base-s3');
        const legLPath = document.getElementById('legL-path-s3');
        const legRBase = document.getElementById('legR-base-s3');
        const legRPath = document.getElementById('legR-path-s3');
        const hand1Visual = document.getElementById('held-item-hand1');
        
        const held1 = document.getElementById('held-1-s3');
        const held0 = document.getElementById('held-0-s3');

        const limbs = ['armL-s3', 'armR-s3', 'legL-s3', 'legR-s3'].map(id => document.getElementById(id));

        if (isHeld) {
            if (held1) held1.style.display = 'none';
            if (held0) held0.style.display = 'none';

            if (armLBase) armLBase.style.display = 'none';
            if (armLPath) armLPath.style.display = 'inline';
            if (armRBase) armRBase.style.display = 'none';
            if (armRPath) armRPath.style.display = 'inline';
            if (legLBase) legLBase.style.display = 'none';
            if (legLPath) legLPath.style.display = 'inline';
            if (legRBase) legRBase.style.display = 'none';
            if (legRPath) legRPath.style.display = 'inline';

            limbs.forEach(el => {
                if (el) { 
                    el.style.setProperty('animation', 'none', 'important'); 
                    el.style.setProperty('transform', 'none', 'important'); 
                }
            });

            if (armLPath) armLPath.setAttribute('d', 'M 40 62 L 15 62 L 15 42');
            if (armRPath) armRPath.setAttribute('d', 'M 40 62 L 65 62 L 65 42');
            
            if (legLPath) legLPath.setAttribute('d', 'M 40 75 Q 5 75 15 105');
            if (legRPath) legRPath.setAttribute('d', 'M 40 75 Q 75 75 65 105');

            if (hand1Visual) {
                hand1Visual.style.setProperty('transition', 'none', 'important');

                // 🌟 每次按下 Q 時，重置天線的延伸長度
                window._easterEggAntennaExtension = 0;

                // 🌟 將三角怪替換為帶有特定 ID 的結構，並在外層加上傾倒用的群組
                hand1Visual.innerHTML = `
                    <g id="ee-falling-group" style="transition: transform 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53);">
                        <g style="transform-origin: 65px center; transform: scaleX(-1);">
                            <line id="ee-antenna-top" x1="65" y1="30" x2="65" y2="15" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
                            <polygon points="65,30 5,90 125,90" fill="#000" stroke="#fff" stroke-width="8" stroke-linejoin="round"/>
                            <path id="ee-antenna-bottom" d="M 65 90 L 65 105 Q 65 112 73 112" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
                        </g>
                    </g>`;
                
                const antennaGroundCompensationSvg =
                    scenePxToStickmanSvgY(
                        getPlaAntennaGroundCompensationPx()
                    );

                hand1Visual.setAttribute(
                    'transform',
                    `translate(62, ${21 + antennaGroundCompensationSvg}) scale(0.35) rotate(0, 65, 90)`
                );
            }
        } else {

            if (held1) held1.style.removeProperty('display');
            if (held0) held0.style.removeProperty('display');


            // =====================================================
            // 🌟 重要：
            // 不要寫死 display:none
            // 把 inline display 完全移除
            //
            // 站立時 → 原本 CSS 自己隱藏 Path
            // 跳躍時 → player-jumping CSS 自己顯示 Path
            // =====================================================

            if (armLBase) armLBase.style.removeProperty('display');
            if (armLPath) armLPath.style.removeProperty('display');

            if (armRBase) armRBase.style.removeProperty('display');
            if (armRPath) armRPath.style.removeProperty('display');

            if (legLBase) legLBase.style.removeProperty('display');
            if (legLPath) legLPath.style.removeProperty('display');

            if (legRBase) legRBase.style.removeProperty('display');
            if (legRPath) legRPath.style.removeProperty('display');

            limbs.forEach(el => {
                if (el) { 
                    el.style.removeProperty('animation'); 
                    el.style.removeProperty('transform'); 
                }
            });

            if (hand1Visual) {
                hand1Visual.style.removeProperty('transition');
            }

            // 🌟 鬆開 Q 時，updateMainStickmanEquipment 會自動把三角形恢復原狀，完全不需要額外寫重置邏輯
            updateMainStickmanEquipment();
        }
    }

    // ==============================================================
    // 🌟 彩蛋：火柴人三階段踢擊與天線傾倒動畫序列 (完美落地版)
    // ==============================================================
    function playEasterEggKickSequence() {
        const head = document.getElementById('stickman-head-s3');
        const torso = document.getElementById('stickman-torso-s3');
        const legRPath = document.getElementById('legR-path-s3');
        const armLPath = document.getElementById('armL-path-s3');
        const armRPath = document.getElementById('armR-path-s3');
        const legLPath = document.getElementById('legL-path-s3');
        const fallingGroup = document.getElementById('ee-falling-group');
        const bottomAntenna = document.getElementById('ee-antenna-bottom');
        const hat = document.getElementById('held-item-head');

        // 1. 動作一：身起腳、蓄力準備 (0ms)
        if (head) { head.setAttribute('cx', '30'); head.setAttribute('cy', '32'); }
        if (torso) { torso.setAttribute('x1', '34'); torso.setAttribute('y1', '48'); }
        
        // 🌟 寫入您最理想的帽子座標
        if (hat) hat.setAttribute('transform', 'translate(2, -17) scale(0.35) rotate(-15, 65, 90)');

        if (armLPath) armLPath.setAttribute('d', 'M 36 56 Q 21 56 21 75');
        if (armRPath) armRPath.setAttribute('d', 'M 36 56 Q 51 56 51 41');
        if (legLPath) legLPath.setAttribute('d', 'M 40 75 L 35 105');
        if (legRPath) legRPath.setAttribute('d', 'M 40 75 L 55 65 L 60 90');
        
        // 2. 動作二：向前踢 (200ms)
        setTimeout(() => {
            if (head) { head.setAttribute('cx', '22'); head.setAttribute('cy', '33'); }
            if (torso) { torso.setAttribute('x1', '30'); torso.setAttribute('y1', '52'); }
            if (hat) hat.setAttribute('transform', 'translate(-8, -16) scale(0.35) rotate(-23, 65, 90)');
            
            if (armLPath) armLPath.setAttribute('d', 'M 30 52 Q 15 55 5 70');
            if (armRPath) armRPath.setAttribute('d', 'M 30 52 Q 47 38 60 46');
            if (legRPath) legRPath.setAttribute('d', 'M 40 75 L 64 53');
            
            // 觸發天線傾倒動畫
            if (fallingGroup && bottomAntenna) {
                
                // 🌟 修改這裡：我們不再動態抓取天線目前的長度！
                // 直接將圓心寫死成天線能延長到的「最下方極限點」
                // (注意：這裡的數值必須與你 gameLoopS3 裡設定的 bottomMaxY 一致，預設是 228)
                let currentBottomY = 228; 
                
                const body = document.getElementById('stickman-body-s3');
                if (body) {
                    const wrapper =
                        document.createElementNS(
                            'http://www.w3.org/2000/svg',
                            'g'
                        );

                    const antennaGroundCompensationSvg =
                        scenePxToStickmanSvgY(
                            getPlaAntennaGroundCompensationPx()
                        );

                    wrapper.setAttribute(
                        'transform',
                        `translate(62, ${21 + antennaGroundCompensationSvg}) scale(0.35)`
                    );
                    fallingGroup.parentNode.removeChild(fallingGroup);
                    wrapper.appendChild(fallingGroup);
                    body.appendChild(wrapper);
                }

                // 🌟 設定固定旋轉圓心 (永遠固定在地板)
                fallingGroup.style.transformOrigin = `65px ${currentBottomY}px`;
                
                // 🌟 SVG 專屬強制重繪魔法
                void fallingGroup.getBoundingClientRect();

                // 最後給予旋轉 90 度的指令
                fallingGroup.style.transform = 'rotate(90deg)';
                
                const sfxKick = new Audio('game_audio/game_attack_enemy1.mp3');
                playActionSfx(sfxKick);
            }
        }, 200);

        // 3. 動作三：回到最初的火柴人動作 (450ms)
        setTimeout(() => {
            if (head) { head.setAttribute('cx', '40'); head.setAttribute('cy', '32'); }
            if (torso) { torso.setAttribute('x1', '40'); torso.setAttribute('y1', '48'); }
            
            // 帽子恢復原位
            if (hat) hat.setAttribute('transform', 'translate(17, -15) scale(0.35)');
            
            if (armLPath) armLPath.setAttribute('d', 'M 40 56 L 40 85');
            if (armRPath) armRPath.setAttribute('d', 'M 40 56 L 40 85');
            if (legLPath) legLPath.setAttribute('d', 'M 40 75 L 40 105');
            if (legRPath) legRPath.setAttribute('d', 'M 40 75 L 40 105');
            
            const limbs = ['armL-s3', 'armR-s3', 'legL-s3', 'legR-s3'].map(id => document.getElementById(id));
            limbs.forEach(el => {
                if (el) { 
                    el.style.removeProperty('animation'); 
                    el.style.removeProperty('transform'); 
                }
            });
        }, 450);

        // =========================================================
        // 🌟 新增：動作四：史詩級過場衝刺引擎 (天線克隆固定、動態煞車與物理橋樑)
        // =========================================================
        setTimeout(() => {
            worldX += 1.5; 
            
            // 強制解除 CSS 旋轉干擾並切換為 Path 顯示
            const limbs = ['armL-s3', 'armR-s3', 'legL-s3', 'legR-s3'];
            limbs.forEach(id => {
                const el = document.getElementById(id);
                if (el) { el.style.setProperty('transform', 'none', 'important'); el.style.setProperty('animation', 'none', 'important'); }
            });
            const armLBase = document.getElementById('armL-base-s3'); const armRBase = document.getElementById('armR-base-s3');
            const legLBase = document.getElementById('legL-base-s3'); const legRBase = document.getElementById('legR-base-s3');
            if (armLBase) armLBase.style.display = 'none'; if (armLPath) armLPath.style.display = 'inline';
            if (armRBase) armRBase.style.display = 'none'; if (armRPath) armRPath.style.display = 'inline';
            if (legLBase) legLBase.style.display = 'none'; if (legLPath) legLPath.style.display = 'inline';
            if (legRBase) legRBase.style.display = 'none'; if (legRPath) legRPath.style.display = 'inline';

            // 🌟 1. 天線「克隆」剝離與動態距離計算
            const fallingGroup = document.getElementById('ee-falling-group');
            const fallingWrapper = fallingGroup ? fallingGroup.parentNode : null;
            let targetWorldX = worldX + 20;

            // 🌟 是否為 AND 安全長度
            let isSafeAntennaLength = false;

            // 🌟 保存固定到世界中的天線
            let fixedAntennaGroup = null;

            // 🌟 防止第二次傾倒重複播放
            let secondTiltStarted = false;

            // =====================================================
            // 🌟 天線旋轉固定支點
            // 第一次、第二次傾倒都共用
            // =====================================================
            const ANCHOR_X = 65;
            const ANCHOR_Y = 228;

            if (fallingGroup && fallingWrapper) {
                const metrics = getScene3StageMetrics();
                if (metrics) {
                    // (A) 取得天線最前端的世界座標
                    const groupRect = fallingGroup.getBoundingClientRect();
                    const antennaTipScreenX = groupRect.right;
                    const worldTip = screenPointToScene3World({x: antennaTipScreenX, y: groupRect.top}, metrics);
                    const antennaTipPx = worldTip ? worldTip.x : (worldX * metrics.width / 100 + 300);

                    // (B) 取得 PLA 斷崖與 AND 閘的關鍵邊界座標
                    const line = document.getElementById('pla-top-platform-line-s3');
                    let hole1L_Px = 0, andGateLeft_Px = 0, andGateRight_Px = 0;
                    if (line) {
                        try {
                            const matrix = line.getScreenCTM();
                            const svg = line.ownerSVGElement;
                            const makeWorldX = (svgX) => {
                                const pt = svg.createSVGPoint(); pt.x = svgX; pt.y = 75;
                                return screenPointToScene3World(pt.matrixTransform(matrix), metrics).x;
                            };
                            hole1L_Px = makeWorldX(390);      
                            andGateLeft_Px = makeWorldX(440); 
                            andGateRight_Px = makeWorldX(500);
                        } catch (e) { console.warn("SVG Math skipped."); }
                    }

                    // (C) 計算玩家原本與圖騰邊緣之間的留白距離
                    const playerCenterX_Px = worldX * metrics.width / 100;

                    // hole1L_Px = 原本圖騰 / 斷崖左側邊緣
                    const triggerDistancePx =
                        hole1L_Px - playerCenterX_Px;


                    // =====================================================
                    // 🌟 判斷目前天線是否屬於 AND「安全長度」
                    // =====================================================

                    isSafeAntennaLength =
                        andGateLeft_Px !== 0 &&
                        antennaTipPx >= andGateLeft_Px &&
                        antennaTipPx <= andGateRight_Px;


                    let targetPx;


                    // =====================================================
                    // ❌ 太短：不安全長度
                    // =====================================================
                    if (
                        antennaTipPx < andGateLeft_Px ||
                        andGateLeft_Px === 0
                    ) {

                        isSafeAntennaLength = false;

                        // 先照原本邏輯走到天線最前端
                        targetPx = antennaTipPx;
                    }


                    // =====================================================
                    // ✅ 安全長度
                    // 天線端點位於 AND 範圍內
                    // =====================================================
                    else if (isSafeAntennaLength) {

                        // 玩家停在 AND 右端附近，
                        // 留白距離與原本圖騰邊緣相同
                        targetPx =
                            andGateRight_Px - triggerDistancePx;
                    }


                    // =====================================================
                    // ❌ 太長：不安全長度
                    // =====================================================
                    else {

                        isSafeAntennaLength = false;

                        // 先照原本邏輯走到天線最前端
                        targetPx = antennaTipPx;
                    }


                    targetWorldX =
                        (targetPx / metrics.width) * 100;

                    // =====================================================
                    // 🌟 只有「安全長度」才能建立實體天線橋樑
                    // 不安全長度不能有橋，不然角色會被重新接住
                    // =====================================================

                    if (isSafeAntennaLength) {

                        window._easterEggBridge = {
                            startX: playerCenterX_Px,
                            endX: antennaTipPx
                        };

                    } else {

                        // ❌ 太短 / 太長
                        // 這一次天線失敗，不能產生可站立橋樑
                        window._easterEggBridge = null;
                    }

                    if (!window._bridgePhysicsActive) {
                        window._bridgePhysicsActive = true;
                        function bridgePhysicsLoop() {
                            if (window._easterEggBridge && !window._isEasterEggActive && !window._easterEggUnsafeFalling) {
                                const m = getScene3StageMetrics();
                                if (m) {
                                    const px = worldX * m.width / 100;
                                    const b = window._easterEggBridge;
                                    if (px >= b.startX - 15 && px <= b.endX + 15) {
                                        if (isPlaHatBallistic && playerJumpVerticalVelocityPx <= 0) {
                                            isPlaHatBallistic = false;
                                            isPlayerJumping = false;
                                            isOnPlaTopPlatform = true; // 將天線視為高層平台
                                            playerJumpVerticalVelocityPx = 0;
                                            plaHatVelocityUpPx = 0;
                                            plaHatVelocityXPx = 0;
                                            resetPlayerJumpPose();
                                            stickman.classList.remove('player-jumping');
                                            stickman.classList.add('stand-still');
                                        }
                                    }
                                }
                            }
                            requestAnimationFrame(bridgePhysicsLoop);
                        }
                        bridgePhysicsLoop();
                    }

                    // 🌟 3. 將倒下的天線「像釘子一樣」固定到世界環境
                    const envLayer = document.getElementById('environment-layer-s3');

                    if (envLayer && fallingGroup && fallingWrapper) {

                        // =====================================================
                        // ① 先量原本天線旋轉支點的「真實螢幕座標」
                        // =====================================================

                        let originalAnchorScreen = null;

                        try {
                            const originalSvg = fallingGroup.ownerSVGElement;
                            const originalMatrix = fallingGroup.getScreenCTM();

                            if (originalSvg && originalMatrix) {
                                const point = originalSvg.createSVGPoint();

                                point.x = ANCHOR_X;
                                point.y = ANCHOR_Y;

                                originalAnchorScreen =
                                    point.matrixTransform(originalMatrix);
                            }
                        } catch (e) {
                            console.warn('讀取原天線支點失敗:', e);
                        }


                        // =====================================================
                        // ② 建立固定容器
                        // =====================================================
                        const fixedContainer = document.createElement('div');

                        fixedContainer.id = 'ee-fixed-antenna-container';
                        fixedContainer.style.position = 'absolute';

                        /*
                        🌟 不再用 worldX / py 猜位置。

                        先放在 environment-layer 的 0,0，
                        等 Clone 完再用實際座標自動校正。
                        */
                        fixedContainer.style.left = '0px';
                        fixedContainer.style.top = '0px';

                        fixedContainer.style.width = '80px';
                        fixedContainer.style.height = '120px';

                        fixedContainer.style.transform =
                            `translate(-50%, -50%) scaleX(${facing})`;

                        fixedContainer.style.zIndex = '4';
                        fixedContainer.style.pointerEvents = 'none';


                        // =====================================================
                        // ③ 建立 SVG
                        // =====================================================
                        const fixedSvg =
                            document.createElementNS(
                                'http://www.w3.org/2000/svg',
                                'svg'
                            );

                        fixedSvg.setAttribute('viewBox', '0 0 80 120');

                        fixedSvg.style.width = '100%';
                        fixedSvg.style.height = '100%';
                        fixedSvg.style.overflow = 'visible';


                        // =====================================================
                        // ④ Clone 已經倒下的天線
                        // =====================================================
                        const clonedAntenna =
                            fallingWrapper.cloneNode(true);


                        // 防止重複 ID
                        const clonedGroup =
                            clonedAntenna.querySelector('#ee-falling-group');

                        const clonedTop =
                            clonedAntenna.querySelector('#ee-antenna-top');

                        const clonedBottom =
                            clonedAntenna.querySelector('#ee-antenna-bottom');


                        if (clonedGroup) {

                            clonedGroup.id =
                                'ee-fixed-falling-group';


                            // =====================================================
                            // 🌟 Clone 接手時先完全固定在第一次傾倒後的 90°
                            // =====================================================

                            clonedGroup.style.transition = 'none';

                            clonedGroup.style.transformOrigin =
                                `${ANCHOR_X}px ${ANCHOR_Y}px`;

                            clonedGroup.style.transform =
                                'rotate(90deg)';


                            // =====================================================
                            // 🌟 關鍵：
                            // 保存這個 Group，之後第二次傾斜直接操作它
                            // =====================================================

                            fixedAntennaGroup = clonedGroup;
                        }


                        if (clonedTop) {
                            clonedTop.id =
                                'ee-fixed-antenna-top';
                        }

                        if (clonedBottom) {
                            clonedBottom.id =
                                'ee-fixed-antenna-bottom';
                        }


                        fixedSvg.appendChild(clonedAntenna);

                        fixedContainer.appendChild(fixedSvg);

                        envLayer.appendChild(fixedContainer);


                        // =====================================================
                        // ⑤ 強制瀏覽器先完成一次 layout
                        // =====================================================
                        void fixedContainer.getBoundingClientRect();


                        // =====================================================
                        // ⑥ 量 Clone 天線同一個 (65,228) 支點
                        // =====================================================
                        let clonedAnchorScreen = null;

                        try {
                            if (clonedGroup) {

                                const cloneMatrix =
                                    clonedGroup.getScreenCTM();

                                if (cloneMatrix) {

                                    const clonePoint =
                                        fixedSvg.createSVGPoint();

                                    clonePoint.x = ANCHOR_X;
                                    clonePoint.y = ANCHOR_Y;

                                    clonedAnchorScreen =
                                        clonePoint.matrixTransform(cloneMatrix);
                                }
                            }
                        } catch (e) {
                            console.warn('讀取 Clone 天線支點失敗:', e);
                        }


                        // =====================================================
                        // ⑦ 精準計算兩個支點差多少 px
                        // =====================================================
                        if (originalAnchorScreen && clonedAnchorScreen) {

                            const correctionX =
                                originalAnchorScreen.x -
                                clonedAnchorScreen.x;

                            const correctionY =
                                originalAnchorScreen.y -
                                clonedAnchorScreen.y;


                            // 🌟 直接把 Clone 移動相同誤差
                            fixedContainer.style.left =
                                `${correctionX}px`;

                            fixedContainer.style.top =
                                `${correctionY}px`;


                            // 強制立即套用，不能有 transition
                            fixedContainer.style.transition = 'none';
                        }


                        // =====================================================
                        // ⑧ 最後才隱藏玩家身上的原天線
                        // =====================================================
                        fallingWrapper.style.display = 'none';
                    }
                }
            }

            // 🎨 四個完美動畫幀
            const walkFrames = [
                { headY: '31', armL: 'M 40 56 L 24 68', armR: 'M 40 56 L 56 68', legL: 'M 40 75 L 26 95', legR: 'M 40 75 L 52 88 L 44 98' },
                { headY: '30', armL: 'M 40 56 L 24 68', armR: 'M 40 56 L 56 49', legL: 'M 40 75 L 22 102', legR: 'M 40 75 Q 48 66 52 78 L 52 90' },
                { headY: '31', armL: 'M 40 56 L 24 68', armR: 'M 40 56 L 56 68', legL: 'M 40 75 Q 26 86 24 102', legR: 'M 40 75 Q 56 86 56 102 L 62 102' },
                { headY: '30', armL: 'M 40 60 L 20 52', armR: 'M 40 60 L 60 52', legL: 'M 40 75 L 40 89 L 26 95', legR: 'M 40 75 Q 56 82 56 102' }
            ];

            const sequence = [0, 1, 2, 3, 1, 2];
            let currentSeqIdx = 0;
            let timeAccumulator = 0;
            let lastFrameTime = performance.now();
            
            const frameDurationMs = 150; 
            const moveSpeed = 16; 
            const hand1Display = document.getElementById('held-item-hand1');
            
            function startUnsafeAntennaGravityFall() {

                if (window._easterEggUnsafeFalling) return;

                const metrics = getScene3StageMetrics();
                if (!metrics) return;


                // =====================================================
                // 🌟 進入「失敗墜落」
                // =====================================================

                window._easterEggUnsafeFalling = true;

                // =====================================================
                // 🌟 不安全墜落開始
                // 立即銷毀這一次天線的實體橋樑
                // =====================================================

                window._easterEggBridge = null;


                // =====================================================
                // 🌟 彩蛋到這裡正式結束
                // 從這一刻開始玩家按鍵恢復
                // =====================================================

                window._isEasterEggActive = false;
                window._easterEggQHeld = false;

                isPlayerControllable = true;

                // 墜落途中先不讓玩家攻擊
                canAttack = false;


                // 清掉前面過場殘留的移動鍵
                clearMovementKeys();


                // =====================================================
                // 清除 PLA 帽子導通 / 單擺
                // =====================================================

                if (isPlaHatTethered) {
                    forceClearPlaHatTether();
                }

                isPlaHatTethered = false;
                plaHatAnchor = null;
                plaHatRopeLengthPx = 0;
                plaHatAngularVelocity = 0;


                // =====================================================
                // 🌟 保留玩家目前所在高度
                // =====================================================

                const currentElevation =
                    getTotalPlayerElevationPx();

                playerWorldElevationPx =
                    currentElevation;

                playerJumpOffsetPx = 0;


                // =====================================================
                // 🌟 徹底離開 PLA 上層平台
                // =====================================================

                isOnPlaTopPlatform = false;

                plaTopPlatformJumpCameraLocked = false;

                // 防止下一幀用前一個腳底位置重新判定落地
                plaTopPlatformPreviousFootWorldY = null;

                plaBallisticAirTimeSeconds = 0;


                // =====================================================
                // 🌟 啟動 Scene3 原本的拋體重力
                // =====================================================

                isPlaHatBallistic = true;
                isPlayerJumping = true;


                // 不要突然往左右飛
                plaHatVelocityXPx = 0;
                playerJumpHorizontalVelocity = 0;


                // =====================================================
                // 🌟 關鍵：
                // 給一點點向上初速
                //
                // 會有「失去支撐後先飄一下」
                // 再被原本 1800 gravity 拉下去
                // =====================================================

                const UNSAFE_FALL_FLOAT_UP_SPEED = 200;

                plaHatVelocityUpPx =
                    UNSAFE_FALL_FLOAT_UP_SPEED;

                playerJumpVerticalVelocityPx =
                    UNSAFE_FALL_FLOAT_UP_SPEED;


                playerJumpLandingWorldX =
                    worldX;


                // =====================================================
                // 特殊墜落姿勢
                // =====================================================

                stickman.classList.add(
                    'stand-still',
                    'player-jumping'
                );

                applyUnsafeAntennaFallPose();
            }
                


            function playUnsafeSecondAntennaTilt() {

                // ✅ 安全長度，不做任何事情
                if (isSafeAntennaLength) return;

                // 防止播放兩次
                if (secondTiltStarted) return;

                if (
                    !fixedAntennaGroup ||
                    !fixedAntennaGroup.isConnected
                ) {
                    return;
                }

                secondTiltStarted = true;


                // =====================================================
                // 第一次現在停在 90°
                // =====================================================

                fixedAntennaGroup.style.transition = 'none';

                fixedAntennaGroup.style.transformOrigin =
                    `${ANCHOR_X}px ${ANCHOR_Y}px`;

                fixedAntennaGroup.style.transform =
                    'rotate(90deg)';


                // 強制瀏覽器確定現在真的在 90°
                void fixedAntennaGroup.getBoundingClientRect();


                // =====================================================
                // 🌟 第二次順時針傾斜
                // 90° → 180°
                // =====================================================

                const SECOND_TILT_DURATION_MS = 550;

                fixedAntennaGroup.style.transition =
                    `transform ${SECOND_TILT_DURATION_MS}ms cubic-bezier(0.55, 0.085, 0.68, 0.53)`;


                requestAnimationFrame(() => {

                    requestAnimationFrame(() => {

                        // =============================================
                        // 🌟 天線開始第二次傾倒
                        // 90° → 180°
                        // =============================================

                        fixedAntennaGroup.style.transform =
                            'rotate(180deg)';


                        // =============================================
                        // 🌟 動畫播放到一半
                        // → 玩家失去支撐
                        // → 啟用原本重力
                        // =============================================

                        setTimeout(() => {

                            startUnsafeAntennaGravityFall();

                        }, SECOND_TILT_DURATION_MS / 2);

                    });

                });
            }

            function epicCutsceneLoop(now) {
                if (!window._isEasterEggActive || !document.getElementById('stickman-s3')) return;

                let deltaTime = (now - lastFrameTime) / 1000;
                if (deltaTime > 0.1) deltaTime = 0.016; 
                lastFrameTime = now;

                // 🚀 1. 推進與動態煞車判定
                const step = moveSpeed * deltaTime;
                if (worldX + step >= targetWorldX) {

                    worldX = targetWorldX;

                    cameraX = Math.max(0, worldX - 20);

                    stickman.style.left =
                        `${worldX - cameraX}%`;

                    environmentLayer.style.transform =
                        `translate(${-cameraX}%, ${verticalCameraOffsetPx || 0}px)`;


                    // ======================================================
                    // 🛑 抵達目標：恢復「彩蛋 Q 前」的原本姿勢
                    // ======================================================

                    // ① 頭部恢復原始位置
                    if (head) {
                        head.setAttribute('cx', '40');
                        head.setAttribute('cy', '32');
                    }

                    // ② 身體恢復原始位置
                    if (torso) {
                        torso.setAttribute('x1', '40');
                        torso.setAttribute('y1', '48');
                        torso.setAttribute('x2', '40');
                        torso.setAttribute('y2', '75');
                    }

                    // ③ 帽子恢復彩蛋前的原始位置
                    if (hat) {
                        hat.setAttribute(
                            'transform',
                            'translate(17, -15) scale(0.35)'
                        );
                    }


                    // ======================================================
                    // 🌟 最重要：直接使用你原本已經寫好的 Q 姿勢復原函式
                    // ======================================================

                    toggleEasterEggQPose(false);
                    
                    // =====================================================
                    // 🌟 新增：只有不安全長度才第二次傾斜
                    // =====================================================
                    if (!isSafeAntennaLength) {

                        playUnsafeSecondAntennaTilt();
                    }

                    // ======================================================
                    // 🌟 保持彩蛋狀態，不解除鎖定
                    // ======================================================

                    // 彩蛋仍然進行中
                    window._isEasterEggActive = true;

                    // Q 已經放開
                    window._easterEggQHeld = false;

                    // 保持 Frozen，不能再次 Q
                    window._easterEggFrozen = true;


                    // ======================================================
                    // 🌟 保持玩家鎖定
                    // ======================================================

                    isPlayerControllable = false;
                    canAttack = false;


                    // 保持原本自然站姿
                    stickman.classList.remove(
                        'anim-attack',
                        'player-jumping',
                        'player-tumble',
                        'boss-wind-pushed',
                        'boss-wind-landed'
                    );

                    stickman.classList.add('stand-still');


                    // 🌟 不要在這裡設定 _isEasterEggActive = false
                    // 🌟 不要在這裡 isPlayerControllable = true
                    // 🌟 不要在這裡 canAttack = true

                    return;
                }

                worldX += step;

                // 🎞️ 2. 處理動畫幀切換
                timeAccumulator += deltaTime * 1000;
                if (timeAccumulator >= frameDurationMs) {
                    timeAccumulator -= frameDurationMs;
                    
                    const frameIdx = sequence[currentSeqIdx];
                    const f = walkFrames[frameIdx];

                    if (head) head.setAttribute('cy', f.headY);
                    if (armLPath) { armLPath.setAttribute('d', f.armL); armLPath.setAttribute('fill', 'none'); }
                    if (armRPath) { armRPath.setAttribute('d', f.armR); armRPath.setAttribute('fill', 'none'); }
                    if (legLPath) { legLPath.setAttribute('d', f.legL); legLPath.setAttribute('fill', 'none'); }
                    if (legRPath) { legRPath.setAttribute('d', f.legR); legRPath.setAttribute('fill', 'none'); }

                    currentSeqIdx = (currentSeqIdx + 1) % sequence.length;
                }

                // 🎥 3. 更新攝影機
                cameraX = Math.max(0, worldX - 20); 
                stickman.style.left = `${worldX - cameraX}%`; 
                environmentLayer.style.transform = `translate(${-cameraX}%, ${verticalCameraOffsetPx || 0}px)`;

                requestAnimationFrame(epicCutsceneLoop);
            }

            // 🎬 初始化：載入第一幀
            const startF = walkFrames[sequence[0]];
            if (head) head.setAttribute('cy', startF.headY);
            if (armLPath) { armLPath.setAttribute('d', startF.armL); armLPath.setAttribute('fill', 'none'); }
            if (armRPath) { armRPath.setAttribute('d', startF.armR); armRPath.setAttribute('fill', 'none'); }
            if (legLPath) { legLPath.setAttribute('d', startF.legL); legLPath.setAttribute('fill', 'none'); }
            if (legRPath) { legRPath.setAttribute('d', startF.legR); legRPath.setAttribute('fill', 'none'); }
            currentSeqIdx = 1; 
            
            requestAnimationFrame(epicCutsceneLoop);
            
        }, 800);
    }

    function handleKeyDown(e) {
        const key = e.key.toLowerCase();

        // 🌟 修改：加入 !window._easterEggFrozen 判斷，凍結後禁止再按 Q
        if (window._isEasterEggActive && window._easterEggAnimationDone && key === 'q') {
            e.preventDefault();
            if (!e.repeat && !window._easterEggQHeld && !window._easterEggFrozen) {
                toggleEasterEggQPose(true);
            }
            return;
        }

        if (bossTimelineRunning) {
            if (keys.hasOwnProperty(key)) keys[key] = false;
            return;
        }

        if (postBossBookSequenceRunning) {
            if (keys.hasOwnProperty(key)) keys[key] = false;
            e.preventDefault();
            return;
        }

        // BOSS 離場後鎖定地面高度；W／↑ 與 S／↓ 都不再直接改變 Y 座標。
        if (
            bossTimelineCompleted &&
            (key === 'w' || key === 'arrowup' || key === 's' || key === 'arrowdown')
        ) {
            e.preventDefault();
            if (key === 'w' || key === 'arrowup') keys.w = false;
            if (key === 's' || key === 'arrowdown') keys.s = false;
            return;
        }

        // 戴著三角帽、處於空中且靠近 PLA 的 X 或圓點中心時，按住 Q 導通固定點。
        if (bossTimelineCompleted && key === 'q') {
            e.preventDefault();
            // C 已消耗 Q 時，實體按鍵未真正放開前，瀏覽器的 repeat 事件全部忽略。
            if (plaHatQBlockedUntilRelease) {
                keys.q = false;
                isPlaHatQHeld = false;
                return;
            }
            keys.q = true;
            isPlaHatQHeld = true;
            if (!e.repeat) attemptPlaHatConnection();
            return;
        }

        // C：地面執行原本五幀短跳；已導通時保留向上彈射，但同時消耗 Q，必須放開後重按。
        if (bossTimelineCompleted && key === 'c') {
            e.preventDefault();
            if (jumpManualUnlocked && !e.repeat) {
                const qWasActive = isPlaHatQHeld || keys.q;
                const launchedFromTether =
                    isPlaHatTethered && isPlaHatQHeld
                        ? launchUpwardFromPlaHatTether()
                        : false;

                if (qWasActive) consumePlaHatQUntilRelease();

                if (!launchedFromTether && !isPlaHatBallistic) {
                    startPlayerVerticalJump();
                }
            }
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
                        if (e.alive && e.el) e.el.classList.remove('freeze-anim');
                    });
                    
                    // 🌟 嚴格防呆：彩蛋期間絕對不可以恢復移動！
                    if (!window._isEasterEggActive) {
                        isPlayerControllable = true;
                    }
                    
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
                            if (bossTimelineRunning || isPlayerJumping) return;
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

        // 🌟 BOSS 後書本：只有靠近並看見 E 提示時才能取得 PAGE 3／PAGE 4。
        if (key === 'e' && postBossBookReadyToPick && isNearPostBossBook) {
            e.preventDefault();
            if (collectPostBossJumpManual()) return;
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

        if (key === 'j' && isHammerEquipped && isPlayerControllable && canAttack && !isPlayerJumping && !playerDead) {
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
        // 🌟 修改：放開 Q 鍵時觸發踢擊序列，並將標記設為永久凍結
        if (window._isEasterEggActive && key === 'q') {
            e.preventDefault();
            if (window._easterEggQHeld) {
                window._easterEggQHeld = false; // 停止天線繼續生長
                window._easterEggFrozen = true; // 標記為永久凍結 (不再恢復操作)
                
                // 🌟 新增：不安全天線失敗後的墜落狀態
                window._easterEggUnsafeFalling = false;
                
                // 啟動踢倒動畫序列！
                playEasterEggKickSequence();
            }
            return; // 確保不會執行到下方的復原邏輯
        }
        if (keys.hasOwnProperty(key)) keys[key] = false;
        if (key === 'q') {
            isPlaHatQHeld = false;
            plaHatQBlockedUntilRelease = false;
            // 放開 Q 的同一幀立刻撤銷導通線，並保留單擺當下的切線速度進入拋體。
            if (isPlaHatTethered) releasePlaHatTether(false);
            hidePlaHatTetherVisual();
        }
    }

    let isFirstFrame = true;
    let previousScene3FrameTime = null;

    // 👇 這裡把括號內的參數改為 realTimestamp
    function gameLoopS3(realTimestamp) {
        if (!isCurrentScene3Instance()) return;

        const frameDeltaSeconds = previousScene3FrameTime === null
            ? 1 / 60
            : Math.min(0.034, Math.max(0, (realTimestamp - previousScene3FrameTime) / 1000));
        previousScene3FrameTime = realTimestamp;

        // 🌟 1. 時間暫停攔截器
        if (isGamePaused) {
            stickman.classList.add('stand-still');
            scheduleSceneFrame(gameLoopS3);
            return; 
        }

        // ==============================================================
        // 🌟 FIX：彩蛋天線動畫 (上方正常蓄力、下方極速插地)
        // ==============================================================
        if (window._isEasterEggActive && window._easterEggQHeld) {
            
            // 恢復基礎的生長速度 (250) 作為時間基準
            window._easterEggAntennaExtension += 250 * frameDeltaSeconds;
            
            const topAntenna = document.getElementById('ee-antenna-top');
            const bottomAntenna = document.getElementById('ee-antenna-bottom');
            
            if (topAntenna && bottomAntenna) {
                // 上方天線使用正常速度
                const topExt = window._easterEggAntennaExtension;
                // 下方天線給予 40 倍速 (250 * 40 = 10000) 的極速生長
                const bottomExt = window._easterEggAntennaExtension * 40;
                
                // 1. 上方天線：維持原本的節奏，慢慢往上飆升
                topAntenna.setAttribute('y2', String(15 - topExt));
                
                // 2. 下方天線：極速伸長
                if (bottomExt <= 20) {
                    const p = bottomExt / 20; 
                    const endX = 73 - 8 * p; 
                    bottomAntenna.setAttribute('d', `M 65 90 L 65 105 Q 65 112 ${endX} 112`);
                } else {
                    const downExt = bottomExt - 20;
                    
                    // 天線伸長的最底極限
                    const bottomMaxY = 228; 
                    
                    // 因為 bottomExt 增加得極快，這裡按下去瞬間就會直接到底部 228
                    const currentY = Math.min(bottomMaxY, 112 + downExt); 
                    bottomAntenna.setAttribute('d', `M 65 90 L 65 ${currentY}`);
                }
            }
        }

        // 🌟 2. 時間軸平移 
        let timestamp = realTimestamp - totalPausedTime;

        // 原本的提早 return 在這裡，現在不會阻擋到上方的天線動畫了！
        // 🌟 一般鎖定仍停止遊戲物理
        // 但如果是不安全天線造成的墜落，必須讓原本重力繼續運算
        if (!isPlayerControllable && !playerDead) {
            const unsafeFallMayContinue =
                window._easterEggUnsafeFalling &&
                !manualModal.classList.contains('manual-active') &&
                !backpackIsOpen &&
                !isGamePaused;

            if (!unsafeFallMayContinue) {
                scheduleSceneFrame(gameLoopS3);
                return;
            }
        }
        if (playerDead) return;
        
        if (isFirstFrame) {
            enemies.forEach(e => {
                e.jumpStartTime = timestamp + e.delayMs;
                e.el.style.setProperty('--jump-delay', `${e.delayMs}ms`);
            });
            isFirstFrame = false;
        }

        let moved = false; let speedX = 0.4; let speedY = 0.3; 

        // 單擺與放線後的拋體都由主迴圈積分；原本短跳仍保留原有 420ms 動畫。
        updatePlaHatTraversalPhysics(frameDeltaSeconds);
        
        if (!isPlayerAttacking && !isPlayerJumping) {
            // BOSS 過場完成前維持原本四方向移動；完成後上下方向永久交由 C 跳躍控制。
            if (keys.w && !bossTimelineCompleted) { py -= speedY; moved = true; }
            if (keys.s && !bossTimelineCompleted) { py += speedY; moved = true; }
            if (keys.a) { worldX -= speedX; moved = true; facing = -1; }
            if (keys.d) { worldX += speedX; moved = true; facing = 1; }
        }

        // BOSS 過場前維持 Scene 1、2 的 10~90 邊界；吹氣過場結束後才保留精準底線。
        const maxPlayerY = bossTimelineCompleted
            ? (postBossGroundY ?? getPlayerBottomYPercent())
            : 90;
        py = Math.max(10, Math.min(maxPlayerY, py)); 
        worldX = Math.max(5, worldX); 

        if (isPlayerJumping) {
            stickman.classList.add('stand-still');
        } else if (moved) {
            stickman.classList.remove('stand-still');
        } else {
            stickman.classList.add('stand-still');
        }

        // 高層橫線的解鎖、落地、站立與離開邊緣碰撞都在運鏡前完成。
        updatePlaTopPlatformPhysics();
        updateScene3HorizontalCamera(frameDeltaSeconds);
        updateScene3VerticalCamera(frameDeltaSeconds);
        renderScene3PlayerAndCamera();

        // ==============================================================
        // 🌟 新增：PLA 斷崖邊緣彩蛋觸發判定 (附帶觸發位置微調教學)
        // ==============================================================
        if (!window._easterEggTriggered && isOnPlaTopPlatform && isHammerEquipped && hand2Item !== null) {
            const metrics = getScene3StageMetrics();
            const geometry = getPlaTopPlatformWorldGeometry(metrics);
            if (metrics && geometry) {
                try {
                    const line = geometry.line;
                    const matrix = line.getScreenCTM();
                    const svg = line.ownerSVGElement;
                    const pt = svg.createSVGPoint();
                    pt.x = 390; pt.y = 75; // 斷崖邊緣
                    const screenPt = pt.matrixTransform(matrix);
                    const hole1L = screenPointToScene3World(screenPt, metrics).x;
                    const playerCenterX = worldX * metrics.width / 100;

                    // 💡 【觸發位置微調】
                    // hole1L 是斷崖真正的邊緣。如果想要角色在「更左邊一點」就觸發，
                    // 只要調整這裡的「- 5」。例如改成「- 15」就會提早觸發！
                    const triggerZoneX = hole1L - 28; 

                    if (Math.abs(playerCenterX - triggerZoneX) < 15) {
                        triggerEasterEggSequence();
                    }
                } catch(e) {}
            }
        }

        // --- 史詩級局部純白粒子產生器 ---
        function createEpicVFX(targetHandId) {
            const hand = document.getElementById(targetHandId);
            if(!hand) return;

            if (!document.getElementById('epic-vfx-style')) {
                const style = document.createElement('style');
                style.id = 'epic-vfx-style';
                style.innerHTML = `
                    @keyframes epicSpark {
                        0% { transform: translate(0,0) scale(1.5); opacity: 1; filter: drop-shadow(0 0 10px #fff); }
                        100% { transform: translate(var(--tx), var(--ty)) scale(0.5); opacity: 0; filter: drop-shadow(0 0 5px #fff); }
                    }
                `;
                document.head.appendChild(style);
            }

            const vfxGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            vfxGroup.setAttribute('transform', 'translate(40, 85)'); // 將粒子發射點對準手部

            // 產生 25 顆清晰的純白色星火
            for(let i = 0; i < 25; i++) {
                const spark = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                spark.setAttribute('cx', '0'); 
                spark.setAttribute('cy', '0'); 
                spark.setAttribute('r', `${2 + Math.random() * 2}`); // 稍微放大讓粒子更清楚
                spark.setAttribute('fill', '#fff'); 
                
                const angle = Math.random() * Math.PI * 2;
                const dist = 40 + Math.random() * 60; // 飄散的距離
                spark.style.setProperty('--tx', `${Math.cos(angle)*dist}px`);
                spark.style.setProperty('--ty', `${Math.sin(angle)*dist}px`);
                spark.style.animation = `epicSpark ${0.5 + Math.random()*0.4}s cubic-bezier(0.1, 0.8, 0.3, 1) forwards`;
                vfxGroup.appendChild(spark);
            }
            hand.appendChild(vfxGroup);
            setTimeout(() => vfxGroup.remove(), 1000);
        }

        // --- 內部彩蛋動畫序列函式 ---
        function triggerEasterEggSequence() {
            savePreEasterEquipmentState();
            window._easterEggTriggered = true;
            window._isEasterEggActive = true;

            // 1. 永久鎖定操作，不會有 setTimeout 把他改回 true！
            isPlayerControllable = false;
            canAttack = false;
            stickman.classList.add('stand-still');
            clearMovementKeys();

            const hammerVisual = document.getElementById('held-hammer-s3');
            const hand2Visual = document.getElementById('held-item-hand2');
            const hand1Visual = document.getElementById('held-item-hand1');

            const sfxCharge = new Audio('game_audio/game_attack_enemy2.mp3'); 
            const sfxFlash = new Audio('game_audio/game_enemy3_explosion1.mp3'); 
            playActionSfx(sfxCharge);

            // 🚫 已經徹底移除 stage.classList.add('boss-wind-shake') 震動效果

            // 🌟 2. 左右手物品同時發出「純白光芒」 (不改變物品大小)
            if (hammerVisual) {
                hammerVisual.style.transition = 'filter 0.6s ease-in';
                hammerVisual.style.filter = 'brightness(5) drop-shadow(0 0 20px #fff) drop-shadow(0 0 40px #fff)';
            }
            if (hand2Visual) {
                hand2Visual.style.transition = 'filter 0.6s ease-in';
                hand2Visual.style.filter = 'brightness(5) drop-shadow(0 0 20px #fff) drop-shadow(0 0 40px #fff)';
            }

            setTimeout(() => {
                // 🌟 3. 白光消散，物品透明化
                playActionSfx(sfxFlash);
                
                // 雙手同時噴出純白粒子
                createEpicVFX('armL-s3'); 
                createEpicVFX('armR-s3');
                
                if (hammerVisual) {
                    hammerVisual.style.transition = 'opacity 0.3s ease-out, filter 0.3s ease-out';
                    hammerVisual.style.opacity = '0';
                    hammerVisual.style.filter = 'brightness(1) drop-shadow(0 0 0px transparent)'; 
                }
                if (hand2Visual) {
                    hand2Visual.style.transition = 'opacity 0.3s ease-out, filter 0.3s ease-out';
                    hand2Visual.style.opacity = '0';
                    hand2Visual.style.filter = 'brightness(1) drop-shadow(0 0 0px transparent)';
                }

                setTimeout(() => {
                    // 計算背包 X/Y，確保 AND Hammer 完美安放
                    const a = 108, h = 94, dx = 130, dy = 106, row2Bottom = 569;
                    const rowY = [ row2Bottom - dy, row2Bottom, row2Bottom + dy, row2Bottom + 2 * dy ];
                    const gridRows = [
                        { y: rowY[0], centers: [-1, 1] },
                        { y: rowY[1], centers: [-1.5, -0.5, 0.5, 1.5] },
                        { y: rowY[2], centers: [-2, -1, 0, 1, 2] },
                        { y: rowY[3], centers: [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5] }
                    ];
                    let flatSlots = [];
                    gridRows.forEach(row => {
                        row.centers.forEach(c => { flatSlots.push({ x: 500 + c * dx, y: row.y - 40 }); });
                    });
                    
                    let emptyIdx = backpackGrid.findIndex((s, i) => s === null && (!window._hammerSlot || window._hammerSlot.slotIndex !== i));
                    if (emptyIdx === -1) emptyIdx = 0; 
                    
                    window._hammerSlot = { type: 'triangle', slotIndex: emptyIdx, x: flatSlots[emptyIdx].x, y: flatSlots[emptyIdx].y };
                    
                    isHammerEquipped = false;
                    hand1Item = hand2Item; 
                    hand2Item = null;
                    
                    // 呼叫更新，此時會觸發強制拉到頂層的 appendChild 邏輯
                    updateMainStickmanEquipment();

                    // 🌟 5. 新三角怪伴隨白光與粒子在左手現身
                    if (hand1Visual) {
                        hand1Visual.style.transition = 'none';
                        hand1Visual.style.opacity = '0';
                        hand1Visual.style.filter = 'brightness(5) drop-shadow(0 0 30px #fff)';
                        
                        void hand1Visual.offsetWidth; 

                        hand1Visual.style.transition = 'opacity 0.4s ease-out, filter 0.8s ease-out';
                        hand1Visual.style.opacity = '1';
                        hand1Visual.style.filter = 'drop-shadow(0 0 5px rgba(255,255,255,0.8))';
                    }

                    createEpicVFX('armL-s3');

                    // 🌟 6. 動畫徹底結束，標記解鎖 Q 鍵變形！
                    setTimeout(() => {
                        window._easterEggAnimationDone = true;
                    }, 800);

                }, 400); 
            }, 600); 
        }

        // 按住 Q 可在飛行途中自動抓住第一個進入半身距離的 X／圓點；剛放開的同一固定點有短暫防重抓。
        if (
            isPlaHatQHeld &&
            !isPlaHatTethered &&
            (isPlayerJumping || isPlaHatBallistic || playerWorldElevationPx > 0.5)
        ) {
            if (attemptPlaHatConnection()) renderScene3PlayerAndCamera();
        }

        // 書本落地後，E 提示會依照玩家與書本的實際世界距離即時顯示／隱藏。
        updatePostBossBookProximity();

        // BOSS 已離場後，玩家實際向右行走到 PLA 前方保留距離的位置才觸發。
        if (
            bossTimelineCompleted &&
            !postBossBookSequenceStarted &&
            !postBossBookSequenceRunning &&
            !isPlayerJumping &&
            !isPlayerAttacking &&
            isPlayerControllable &&
            moved &&
            keys.d &&
            worldX >= POST_BOSS_BOOK_TRIGGER_WORLD_X
        ) {
            void triggerPostBossBookFallSequence();
        }

        let activeEnemies = enemies.filter(e => e.alive);

        // ==============================================================
        // 🌟 物理阻擋與光學迷彩玻璃系統 (效能優化純白版)
        // ==============================================================
        const glassBarrier = document.getElementById('pla-glass-barrier');
        if (glassBarrier) {
            // PLA 不再依照三角怪是否全滅解鎖；必須把 8 件正式掉落物全部撿起來。
            const barrierActive = !isPlaUnlockedByCollectedLoot();
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
                // 7 個 body 與 1 個 hat 全部拾取後解鎖。
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
        scheduleSceneFrame(gameLoopS3);
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

        // 🌟 背包畫面中的 Hand1 也要支援 Flip-X
        if (!isHammerEquipped && hand1Item) {
            let flipStyle = window._isEasterEggActive ? 'transform-origin: 65px center; transform: scaleX(-1);' : '';
            equippedItemsHtml += `
                <g id="bp-equipped-hand1" class="bp-hand-item draggable-bp-item" data-origin-type="hand" data-index="1" opacity="${baseOpacity}" style="transition: ${eqTrans}; filter: drop-shadow(0 0 8px rgba(255,255,255,0.8)); cursor: grab; pointer-events: auto;" transform="translate(532, 398) scale(0.35)">
                    <g style="${flipStyle}">${getItemSVG(hand1Item)}</g>
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

                if (minDist > 120 || (closestSlot.type === 'triangle' && backpackGrid[closestSlot.slotIndex] !== null)) {
                    closestSlot = window._hammerSlot;
                }

                // ==========================================
                // 🌟 終極彩蛋防呆：彩蛋期間，嚴禁將 AND Hammer 裝備回主手！
                // ==========================================
                if (window._isEasterEggActive && closestSlot.type === 'handR') {
                    closestSlot = window._hammerSlot; 
                }

                window._hammerSlot = closestSlot;
                isHammerEquipped = (closestSlot.type === 'handR');
                if (isHammerEquipped) hand1Item = null;

                hammerElem.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                void hammerElem.offsetWidth; 
                
                if (closestSlot.type === 'handR') {
                    hammerElem.setAttribute('transform', `translate(555, 415) scale(0.3) rotate(25)`);
                } else {
                    // 因為上方已精準配發了 x 與 y，這裡再也不會發生瞬移或消失了！
                    hammerElem.setAttribute('transform', `translate(${closestSlot.x}, ${closestSlot.y}) scale(0.48) rotate(0)`);
                }
                
                setTimeout(() => {
                    const oldOverlay = document.getElementById('backpack-overlay');
                    if (oldOverlay) oldOverlay.remove();
                    updateMainStickmanEquipment();
                    triggerBackpackAnimation(false, true);
                }, 300); 
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
            const oType = dragOriginType; 
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

            // 🌟 彩蛋防呆：彩蛋期間，主手上的三角怪絕對不可以被卸下
            if (window._isEasterEggActive && oType === 'hand') {
                bestTarget = { type: oType, index: oIndex };
                action = 'revert';
            }

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
                tx = 538; ty = 355; scale = 0.22;
            } else if (bestTarget.type === 'hand2') {
                tx = 432; ty = 398; scale = 0.35;
            } else if (bestTarget.type === 'hand') {
                // 🌟 終極修復：補上原本遺漏的 hand 目標座標，這就是為什麼原本放回主手會瞬移的原因！
                tx = 532; ty = 398; scale = 0.35;
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
                const interval = scheduleSceneInterval(() => {
                    if(step < animPaths.length) {
                        outline.setAttribute('d', animPaths[step]);
                        
                        if (step === 4) { crease.style.opacity = '1'; }
                        if (step === 5) {
                            outline.style.fill = 'rgba(255, 255, 255, 0.08)';
                            crease.removeAttribute('stroke-dasharray');
                        }
                        step++;
                    } else {
                        clearSceneInterval(interval);
                        
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
    scheduleSceneFrame(gameLoopS3);

    function destroy() {
        if (destroyed) {
            return;
        }

        destroyed = true;
        isPlayerControllable = false;
        canAttack = false;

        clearMovementKeys();

        resourceScope?.dispose();
    }

    return {
        handleKeyDown,
        handleKeyUp,
        destroy
    };
}