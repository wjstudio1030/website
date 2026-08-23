// =========================================
// WJ STUDIO - Scene 3 後 BOSS 測試核心
// 檔名：game_core.js
// 功能：按一次開始鍵，直接進入 Scene 3 的 BOSS 完整離場後狀態。
// =========================================

const SCENE3_SOURCE_PATH = './scene3.js';
const SCENE3_READY_EVENT = 'wj-scene3-postboss-test-ready';
const SCENE_TRANSITION_MS = 280;
const SCENE_READY_TIMEOUT_MS = 8000;

/**
 * 測試狀態說明：
 * - 三角怪戰鬥與所有分裂流程視為完成。
 * - 7 個 body 與 1 個 hat 全部取得：1 個 body 裝在副手、hat 戴在頭上、其餘 6 個 body 放入背包。
 * - AND 槌、第二本說明書及測試用 0/1 彈藥已取得。
 * - BOSS Timeline 視為完整播放完畢，角色固定在最後左下角落點。
 * - PAGE 3 尚未取得，保留後續「走向 PLA → 風吹落書 → E 取得 PAGE 3」測試流程。
 */
export const playerState = {
    playerName: 'WJ_GUEST_TESTER',
    inventory: [
        { type: 'hammer', count: 1, equipped: 'hand1' },
        { type: 'body', count: 7, equipped: 'hand2+backpack' },
        { type: 'hat', count: 1, equipped: 'head' },
        { type: 'manual-page-2', count: 1 }
    ],
    score: 0,
    currentLevel: 3,
    ammoOnes: 10,
    ammoZeros: 10,
    hasHammer: true,
    hasSecondManual: true,
    hasThirdManual: false,

    // 只供這個測試核心辨識；正式 game_core.js 不會設定此欄位。
    __scene3PostBossTest: true
};

let scene3ModulePromise = null;
let sceneBootInProgress = false;

function requireElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`缺少必要 DOM 元素：#${id}`);
    }
    return element;
}

function replaceOnce(source, marker, replacement, label) {
    const index = source.indexOf(marker);
    if (index < 0) {
        throw new Error(`Scene 3 測試注入失敗：找不到 ${label}`);
    }
    return source.slice(0, index) + replacement + source.slice(index + marker.length);
}

function replaceLastOnce(source, marker, replacement, label) {
    const index = source.lastIndexOf(marker);
    if (index < 0) {
        throw new Error(`Scene 3 測試注入失敗：找不到 ${label}`);
    }
    return source.slice(0, index) + replacement + source.slice(index + marker.length);
}

/**
 * 不修改硬碟上的 scene3.js。
 * 只在瀏覽器記憶體中為最新版 Scene 3 注入測試啟動狀態，再以 Blob ES Module 執行。
 */
function patchScene3SourceForPostBossTest(rawSource) {
    let source = String(rawSource).replace(/\r\n/g, '\n');

    const initMarker = 'export function initScene3(playerState, switchScene) {\n';
    source = replaceOnce(
        source,
        initMarker,
        initMarker +
            "    const __SCENE3_POST_BOSS_TEST__ = playerState && playerState.__scene3PostBossTest === true;\n",
        'initScene3() 入口'
    );

    const finalLoopMarker = '    requestAnimationFrame(gameLoopS3);\n}';

    const testBootstrap = String.raw`
    // ==============================================================
    // 🧪 game_core.js 注入：Scene 3 後 BOSS 測試起點
    // ==============================================================
    function __ensureScene3TestBackpackButton() {
        let bpBtn = document.getElementById('inventory-backpack-btn');
        if (bpBtn) bpBtn.remove();

        bpBtn = document.createElement('button');
        bpBtn.id = 'inventory-backpack-btn';
        bpBtn.className = 'control-btn';
        bpBtn.title = 'Backpack';
        bpBtn.innerHTML = '<i class="fas fa-campground"></i>';

        const currentManualBtn = document.getElementById('inventory-manual-btn');
        if (currentManualBtn && currentManualBtn.parentNode) {
            currentManualBtn.parentNode.insertBefore(bpBtn, currentManualBtn);
        } else {
            const gameControls = document.querySelector('.game-controls');
            const volumeWrapper = document.querySelector('.volume-wrapper');
            if (gameControls && volumeWrapper) gameControls.insertBefore(bpBtn, volumeWrapper);
        }

        bpBtn.addEventListener('click', function () {
            if (
                bossTimelineRunning ||
                isPlayerJumping ||
                postBossBookSequenceRunning ||
                playerDead ||
                document.getElementById('backpack-overlay')
            ) return;

            this.blur();
            isPlayerControllable = false;
            isGamePaused = true;
            pauseStartTime = performance.now();
            stickman.classList.add('freeze-anim');
            triggerBackpackAnimation(false);
        });
    }

    function __applyScene3PostBossTestState() {
        if (!__SCENE3_POST_BOSS_TEST__ || !isCurrentScene3Instance()) return;

        // ---------- 跨場景資料 ----------
        playerState.currentLevel = 3;
        playerState.ammoOnes = 10;
        playerState.ammoZeros = 10;
        playerState.hasHammer = true;
        playerState.hasSecondManual = true;
        playerState.hasThirdManual = false;
        playerState.inventory = [
            { type: 'hammer', count: 1, equipped: 'hand1' },
            { type: 'body', count: 7, equipped: 'hand2+backpack' },
            { type: 'hat', count: 1, equipped: 'head' },
            { type: 'manual-page-2', count: 1 }
        ];

        // ---------- 已取得的裝備與戰利品 ----------
        ammoOnes = 10;
        ammoZeros = 10;
        hasHammer = true;
        bookPickedUp = true;
        hasThirdManual = false;
        jumpManualUnlocked = false;

        hand1Item = 'hammer';
        hand2Item = 'body';
        headItem = 'hat';
        backpackGrid = new Array(17).fill(null);
        backpackGrid[0] = { type: 'body', count: 6 };

        window._hammerSlot = { type: 'handR', x: 555, y: 415 };
        isHammerEquipped = true;
        updateMainStickmanEquipment();
        __ensureScene3TestBackpackButton();

        // ---------- 三角怪與所有掉落物視為完成 ----------
        smallEnemyKills = TOTAL_SMALL_ENEMIES;
        collectedTriangleLoot = TOTAL_TRIANGLE_LOOT;
        readyToPickUpTriangle = false;
        nearbyDropItem = null;
        enemySpawnCounter = 0;
        isFirstFrame = false;

        enemies.forEach(function (enemy) {
            enemy.alive = false;
            enemy.state = 'defeated';
            if (enemy.el && enemy.el.isConnected) enemy.el.remove();
        });

        scene3.querySelectorAll(
            '.triangle-enemy, .split-anim-container, .split-anim-container-sm, .loot-drop-item, #first-kill-container'
        ).forEach(function (element) {
            element.remove();
        });

        // ---------- BOSS Timeline 視為完整播放完畢 ----------
        if (bossTimelineCheckTimer) {
            clearTimeout(bossTimelineCheckTimer);
            bossTimelineCheckTimer = null;
        }
        bossTimelineStarted = true;
        bossTimelineRunning = false;
        bossTimelineCompleted = true;

        stopBossAmbientEmitter(0);
        const boss = document.getElementById('scene3-boss');
        if (boss) {
            boss.classList.remove('visible', 'departing', 'hovering', 'inhaling', 'blowing');
        }
        const flightShell = document.getElementById('boss-flight-shell');
        if (flightShell) {
            flightShell.style.transform = '';
            flightShell.style.opacity = '';
        }
        const windLayer = document.getElementById('boss-wind-layer');
        if (windLayer) windLayer.classList.remove('active');
        const stage = document.getElementById('scene3-stage');
        if (stage) stage.classList.remove('boss-wind-shake');
        const barrier = document.getElementById('pla-glass-barrier');
        if (barrier) barrier.style.opacity = '0';
        const ambientLayer = document.getElementById('boss-ambient-particle-layer');
        if (ambientLayer) ambientLayer.replaceChildren();
        const teleportLayer = document.getElementById('boss-teleport-layer');
        if (teleportLayer) teleportLayer.replaceChildren();
        setBossExpression('arrival');

        // ---------- 保留下一段 PAGE 3 書本事件尚未觸發 ----------
        postBossBookSequenceStarted = false;
        postBossBookSequenceRunning = false;
        postBossBookReadyToPick = false;
        postBossBookPickedUp = false;
        isNearPostBossBook = false;
        if (postBossBookElement && postBossBookElement.isConnected) postBossBookElement.remove();
        if (postBossBookPromptElement && postBossBookPromptElement.isConnected) postBossBookPromptElement.remove();
        postBossBookElement = null;
        postBossBookPromptElement = null;
        scene3.querySelectorAll('#post-boss-falling-book-s3, #post-boss-book-e-prompt-s3, #post-boss-book-wind-layer-s3')
            .forEach(function (element) { element.remove(); });

        // ---------- 清除暫停、死亡、攻擊與跳躍殘留 ----------
        const oldBackpackOverlay = document.getElementById('backpack-overlay');
        if (oldBackpackOverlay) oldBackpackOverlay.remove();
        backpackIsOpen = false;
        isGamePaused = false;
        pauseStartTime = 0;
        totalPausedTime = 0;
        playerDead = false;
        isPlayerAttacking = false;
        hasHitInCurrentAttack = false;
        isPlayerJumping = false;
        playerJumpOffsetPx = 0;
        playerJumpHorizontalVelocity = 0;
        canAttack = true;
        isPlayerControllable = true;
        clearMovementKeys();
        resetPlayerJumpPose();

        // ---------- 精確使用 BOSS 吹飛後左下角最終落點 ----------
        const finalX = getPlayerLeftXPercent();
        const finalY = getPlayerBottomYPercent();
        worldX = finalX;
        py = finalY;
        cameraX = 0;
        facing = 1;
        postBossGroundY = finalY;
        postBossLandingAnchor = {
            worldX: finalX,
            py: finalY,
            cameraX: 0,
            facing: 1
        };
        playerJumpLandingWorldX = finalX;

        stickman.classList.remove(
            'freeze-anim',
            'player-dead',
            'anim-attack',
            'player-jumping',
            'player-tumble',
            'boss-wind-pushed',
            'boss-wind-landed'
        );
        stickman.classList.add('stand-still');
        stickman.style.left = finalX + '%';
        stickman.style.top = finalY + '%';
        stickman.style.transform = 'translate(-50%, -50%) scaleX(1)';
        stickman.style.filter = '';
        stickman.style.transition = 'none';
        environmentLayer.style.transform = 'translate(0%, 0%)';

        // ---------- UI 回到可操作狀態 ----------
        manualModal.classList.remove('manual-active');
        updateManualPage(1, false);
        setBossUiLocked(false);
        const gameScreen = document.getElementById('gameScreen');
        const sceneManager = document.getElementById('scene-manager');
        const gameControls = document.querySelector('.game-controls');
        if (gameScreen) gameScreen.style.zIndex = '1';
        if (sceneManager) sceneManager.style.zIndex = '2';
        if (gameControls) gameControls.style.pointerEvents = 'auto';

        window.dispatchEvent(new CustomEvent('wj-scene3-postboss-test-ready', {
            detail: {
                worldX: finalX,
                py: finalY,
                bossTimelineCompleted: true,
                allTriangleLootCollected: true,
                jumpManualUnlocked: false
            }
        }));
    }

    if (__SCENE3_POST_BOSS_TEST__) {
        // 等待 Scene 3 完成首輪版面配置，再計算與正式 BOSS 動畫相同的左下角精確座標。
        requestAnimationFrame(function () {
            __applyScene3PostBossTestState();
            requestAnimationFrame(gameLoopS3);
        });
    } else {
        requestAnimationFrame(gameLoopS3);
    }
}`;

    source = replaceLastOnce(
        source,
        finalLoopMarker,
        testBootstrap,
        'Scene 3 最後的 gameLoopS3 啟動點'
    );

    return source + '\n//# sourceURL=scene3.postboss-test.runtime.js\n';
}

async function loadPatchedScene3Module() {
    if (scene3ModulePromise) return scene3ModulePromise;

    scene3ModulePromise = (async () => {
        const sourceUrl = new URL(SCENE3_SOURCE_PATH, import.meta.url);
        sourceUrl.searchParams.set('__postboss_test_cache', String(Date.now()));

        const response = await fetch(sourceUrl, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`無法讀取 ${SCENE3_SOURCE_PATH}（HTTP ${response.status}）`);
        }

        const source = await response.text();
        const patchedSource = patchScene3SourceForPostBossTest(source);
        const blob = new Blob([patchedSource], { type: 'text/javascript' });
        const blobUrl = URL.createObjectURL(blob);

        try {
            const module = await import(blobUrl);
            if (!module || typeof module.initScene3 !== 'function') {
                throw new Error('動態載入成功，但找不到 initScene3()。');
            }
            return module;
        } finally {
            URL.revokeObjectURL(blobUrl);
        }
    })().catch(error => {
        scene3ModulePromise = null;
        throw error;
    });

    return scene3ModulePromise;
}

function setOnlyActiveScene(targetId, opacity = '1') {
    for (let id = 0; id <= 3; id += 1) {
        const scene = document.getElementById(`scene-${id}`);
        if (!scene) continue;
        const isTarget = id === targetId;
        scene.classList.toggle('active', isTarget);
        scene.style.opacity = isTarget ? opacity : '0';
    }
    playerState.currentLevel = targetId;
}

function waitForScene3Ready(timeoutMs = SCENE_READY_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
        let settled = false;

        const cleanup = () => {
            window.removeEventListener(SCENE3_READY_EVENT, handleReady);
            clearTimeout(timer);
        };

        const handleReady = event => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve(event.detail || {});
        };

        const timer = window.setTimeout(() => {
            if (settled) return;
            settled = true;
            cleanup();
            reject(new Error('Scene 3 測試狀態初始化逾時。請確認使用的是最新 scene3.js。'));
        }, timeoutMs);

        window.addEventListener(SCENE3_READY_EVENT, handleReady, { once: true });
    });
}

function showLoaderMessage(message, isError = false) {
    const gameScreen = document.getElementById('gameScreen') || document.body;
    let panel = document.getElementById('scene3-test-loader-message');

    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'scene3-test-loader-message';
        panel.style.cssText = [
            'position:absolute',
            'left:50%',
            'top:50%',
            'transform:translate(-50%,-50%)',
            'z-index:99999',
            'max-width:86%',
            'padding:18px 24px',
            'border:1px solid var(--brand-blue, #00f2fe)',
            'border-radius:8px',
            'background:rgba(3,8,14,0.94)',
            'font-family:Orbitron, monospace',
            'font-size:14px',
            'line-height:1.7',
            'letter-spacing:1px',
            'text-align:center',
            'white-space:pre-wrap',
            'pointer-events:none'
        ].join(';');
        gameScreen.appendChild(panel);
    }

    panel.style.color = isError ? '#ff8177' : '#ffffff';
    panel.style.boxShadow = isError
        ? '0 0 24px rgba(255,129,119,0.5)'
        : '0 0 24px rgba(0,242,254,0.32)';
    panel.textContent = message;
    return panel;
}

function removeLoaderMessage() {
    const panel = document.getElementById('scene3-test-loader-message');
    if (panel) panel.remove();
}

async function initializeScene3PostBossTest() {
    if (sceneBootInProgress) return;
    sceneBootInProgress = true;

    const scene3 = requireElement('scene-3');
    showLoaderMessage('LOADING SCENE 3 POST-BOSS TEST STATE...');

    try {
        const module = await loadPatchedScene3Module();
        setOnlyActiveScene(3, '0');

        const readyPromise = waitForScene3Ready();
        module.initScene3(playerState, switchScene);
        await readyPromise;

        scene3.style.opacity = '1';
        removeLoaderMessage();
        document.body.classList.remove('hide-custom-cursor');
    } catch (error) {
        console.error('Scene 3 post-BOSS test boot failed:', error);
        setOnlyActiveScene(3, '1');
        showLoaderMessage(
            'SCENE 3 TEST BOOT FAILED\n' +
            (error && error.message ? error.message : String(error)) +
            '\n\n確認最新檔案名稱為 scene3.js，並使用本機伺服器開啟網站。',
            true
        );
        document.body.classList.remove('hide-custom-cursor');
    } finally {
        sceneBootInProgress = false;
    }
}

/**
 * Scene 3 內角色死亡或其他邏輯要求重新載入 Scene 3 時使用。
 * 測試核心永遠重新建立相同的「後 BOSS 左下角」狀態。
 */
export function switchScene(fromId, toId) {
    const fromScene = document.getElementById(`scene-${fromId}`);
    if (fromScene) fromScene.style.opacity = '0';

    window.setTimeout(() => {
        void initializeScene3PostBossTest();
    }, SCENE_TRANSITION_MS);
}

// ----------------------------------------------------
// UI 控制：保留正式核心的游標、全螢幕與音量操作
// ----------------------------------------------------
const fullscreenBtn = document.getElementById('fullscreenBtn');
const gameWrapper = document.getElementById('gameWrapper');
const volumeBtn = document.getElementById('volumeBtn');
const volumeSlider = document.getElementById('volumeSlider');
const startGameBtn = document.getElementById('startGameBtn');
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

if (gameWrapper) {
    gameWrapper.addEventListener('mouseenter', () => {
        if (follower) follower.style.borderColor = '#ffffff';
        if (cursor) cursor.style.background = '#ffffff';
    });

    gameWrapper.addEventListener('mouseleave', () => {
        if (follower) follower.style.borderColor = '#ff8177';
        if (cursor) cursor.style.background = '#ff8177';
    });
}

function handleFullscreenChange() {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;

    if (fullscreenElement) {
        if (cursor) {
            fullscreenElement.appendChild(cursor);
            cursor.style.zIndex = '999999';
        }
        if (follower) {
            fullscreenElement.appendChild(follower);
            follower.style.zIndex = '999998';
        }
        if (fullscreenBtn) fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        if (cursor) document.body.appendChild(cursor);
        if (follower) document.body.appendChild(follower);
        if (fullscreenBtn) fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
}

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

if (fullscreenBtn && gameWrapper) {
    fullscreenBtn.addEventListener('click', () => {
        const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;

        try {
            if (!fullscreenElement) {
                const requestFullscreen = gameWrapper.requestFullscreen || gameWrapper.webkitRequestFullscreen;
                if (requestFullscreen) {
                    const result = requestFullscreen.call(gameWrapper);
                    if (result && typeof result.catch === 'function') {
                        result.catch(error => console.log('Fullscreen request failed:', error));
                    }
                }
            } else {
                const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
                if (exitFullscreen) {
                    const result = exitFullscreen.call(document);
                    if (result && typeof result.catch === 'function') {
                        result.catch(error => console.log('Fullscreen exit failed:', error));
                    }
                }
            }
        } catch (error) {
            console.log('Fullscreen unavailable:', error);
        }
    });
}

let previousVolume = volumeSlider ? Number(volumeSlider.value) || 100 : 100;

function updateVolumeIcon(value) {
    if (!volumeBtn) return;
    const numericValue = Number(value) || 0;

    if (numericValue <= 0) {
        volumeBtn.style.color = '#fff';
        volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        volumeBtn.style.color = '';
        volumeBtn.innerHTML = numericValue > 50
            ? '<i class="fas fa-volume-up"></i>'
            : '<i class="fas fa-volume-down"></i>';
    }
}

if (volumeBtn && volumeSlider) {
    volumeBtn.addEventListener('click', () => {
        const currentVolume = Number(volumeSlider.value) || 0;
        if (currentVolume > 0) {
            previousVolume = currentVolume;
            volumeSlider.value = '0';
        } else {
            volumeSlider.value = String(previousVolume > 0 ? previousVolume : 50);
        }
        updateVolumeIcon(volumeSlider.value);
    });

    volumeSlider.addEventListener('input', event => {
        const value = Number(event.target.value) || 0;
        if (value > 0) previousVolume = value;
        updateVolumeIcon(value);
    });

    updateVolumeIcon(volumeSlider.value);
}

if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
        if (sceneBootInProgress || startGameBtn.disabled) return;

        startGameBtn.disabled = true;
        startGameBtn.style.transform = 'scale(0.8)';
        startGameBtn.style.opacity = '0';
        document.body.classList.add('hide-custom-cursor');

        window.setTimeout(() => {
            startGameBtn.style.display = 'none';
            void initializeScene3PostBossTest();
        }, 260);
    });
}
