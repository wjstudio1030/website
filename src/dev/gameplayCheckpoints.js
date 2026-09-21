// =========================================
// WJ STUDIO - Development Gameplay Checkpoints
// =========================================
//
// DEV-01A
//
// Checkpoint 不是單純傳送座標。
// 每個 checkpoint 最終必須描述：
// 1. 應進入哪個 Scene
// 2. 正常遊玩到該處時應有的 playerState
// 3. 該 Scene 應重建的 local state
//
// 目前先建立 registry / resolver。
// 實際 playerState 與 Scene-local reconstruction
// 會在後續步驟逐一加入。

export const GAMEPLAY_CHECKPOINTS = Object.freeze({
    's3-start': Object.freeze({
        id: 's3-start',
        scene: 3,
        description: 'Scene 3 canonical entry after successful Scene 2 completion',

        playerState: Object.freeze({
            ammoOnes: 0,
            ammoZeros: 0,
            hasHammer: true,
            hasSecondManual: true,
            hasThirdManual: false
        })
    }),

    's3-post-boss': Object.freeze({
        id: 's3-post-boss',
        scene: 3,
        description: 'Scene 3 immediately after the Boss departure and landing',

        playerState: Object.freeze({
            ammoOnes: 0,
            ammoZeros: 0,
            hasHammer: true,
            hasSecondManual: true,
            hasThirdManual: false
        }),

        sceneState: Object.freeze({
            phase: 'post-boss'
        })
    }),
    's3-book-landed': Object.freeze({
        id: 's3-book-landed',
        scene: 3,
        description: 'Scene 3 after the post-Boss book has landed and before pickup',

        playerState: Object.freeze({
            ammoOnes: 0,
            ammoZeros: 0,
            hasHammer: true,
            hasSecondManual: true,
            hasThirdManual: false
        }),

        sceneState: Object.freeze({
            phase: 'book-landed'
        })
    })
});

export function getGameplayCheckpoint(checkpointId) {
    if (typeof checkpointId !== 'string') {
        return null;
    }

    const normalizedId = checkpointId.trim();

    if (!normalizedId) {
        return null;
    }

    return GAMEPLAY_CHECKPOINTS[normalizedId] ?? null;
}

export function resolveGameplayCheckpointFromSearch(search) {
    if (typeof search !== 'string') {
        return null;
    }

    const params = new URLSearchParams(search);
    const checkpointId = params.get('checkpoint');

    if (!checkpointId) {
        return null;
    }

    return getGameplayCheckpoint(checkpointId);
}