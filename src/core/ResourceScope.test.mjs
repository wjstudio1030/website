import test from 'node:test';
import assert from 'node:assert/strict';

import { ResourceScope } from './ResourceScope.ts';

test('dispose clears intervals owned by the scope', () => {
    const scope = new ResourceScope();

    const originalSetInterval = globalThis.setInterval;
    const originalClearInterval = globalThis.clearInterval;

    let clearedId = null;

    try {
        globalThis.setInterval = () => 123;

        globalThis.clearInterval = (id) => {
            clearedId = id;
        };

        scope.setInterval(() => {}, 1000);

        scope.dispose();

        assert.equal(clearedId, 123);
    } finally {
        globalThis.setInterval = originalSetInterval;
        globalThis.clearInterval = originalClearInterval;
    }
});

test('dispose clears timeouts owned by the scope', () => {
    const scope = new ResourceScope();

    const originalSetTimeout = globalThis.setTimeout;
    const originalClearTimeout = globalThis.clearTimeout;

    let clearedId = null;

    try {
        globalThis.setTimeout = () => 456;

        globalThis.clearTimeout = (id) => {
            clearedId = id;
        };

        scope.setTimeout(() => {}, 1000);

        scope.dispose();

        assert.equal(clearedId, 456);
    } finally {
        globalThis.setTimeout = originalSetTimeout;
        globalThis.clearTimeout = originalClearTimeout;
    }
});

test('dispose removes listeners owned by the scope', () => {
    const scope = new ResourceScope();
    const target = new EventTarget();

    let callCount = 0;

    scope.listen(target, 'ping', () => {
        callCount += 1;
    });

    target.dispatchEvent(new Event('ping'));

    assert.equal(callCount, 1);

    scope.dispose();

    target.dispatchEvent(new Event('ping'));

    assert.equal(callCount, 1);
});

test('dispose cancels animation frames owned by the scope', () => {
    const scope = new ResourceScope();

    const originalRequestAnimationFrame =
        globalThis.requestAnimationFrame;
    const originalCancelAnimationFrame =
        globalThis.cancelAnimationFrame;

    let cancelledId = null;

    try {
        globalThis.requestAnimationFrame = () => 789;

        globalThis.cancelAnimationFrame = (id) => {
            cancelledId = id;
        };

        scope.requestAnimationFrame(() => {});

        scope.dispose();

        assert.equal(cancelledId, 789);
    } finally {
        globalThis.requestAnimationFrame =
            originalRequestAnimationFrame;

        globalThis.cancelAnimationFrame =
            originalCancelAnimationFrame;
    }
});

test('dispose is safe to call more than once', () => {
    const scope = new ResourceScope();

    let cleanupCount = 0;

    scope.addCleanup(() => {
        cleanupCount += 1;
    });

    scope.dispose();
    scope.dispose();

    assert.equal(cleanupCount, 1);
});

test('cleanup added after dispose runs immediately', () => {
    const scope = new ResourceScope();

    let cleanupCount = 0;

    scope.dispose();

    scope.addCleanup(() => {
        cleanupCount += 1;
    });

    assert.equal(cleanupCount, 1);
});

test('completed animation frame is released from the scope', () => {
    const scope = new ResourceScope();

    const originalRequestAnimationFrame =
        globalThis.requestAnimationFrame;
    const originalCancelAnimationFrame =
        globalThis.cancelAnimationFrame;

    let scheduledCallback = null;
    let cancelCount = 0;

    try {
        globalThis.requestAnimationFrame = (callback) => {
            scheduledCallback = callback;
            return 789;
        };

        globalThis.cancelAnimationFrame = () => {
            cancelCount += 1;
        };

        scope.requestAnimationFrame(() => {});

        scheduledCallback(16);

        scope.dispose();

        assert.equal(cancelCount, 0);
    } finally {
        globalThis.requestAnimationFrame =
            originalRequestAnimationFrame;

        globalThis.cancelAnimationFrame =
            originalCancelAnimationFrame;
    }
});

test('completed timeout is released from the scope', () => {
    const scope = new ResourceScope();

    const originalSetTimeout = globalThis.setTimeout;
    const originalClearTimeout = globalThis.clearTimeout;

    let scheduledCallback = null;
    let clearCount = 0;

    try {
        globalThis.setTimeout = (callback) => {
            scheduledCallback = callback;
            return 456;
        };

        globalThis.clearTimeout = () => {
            clearCount += 1;
        };

        scope.setTimeout(() => {}, 100);

        assert.ok(scheduledCallback);
        scheduledCallback();

        scope.dispose();

        assert.equal(clearCount, 0);
    } finally {
        globalThis.setTimeout = originalSetTimeout;
        globalThis.clearTimeout = originalClearTimeout;
    }
});

test('manually cleared interval is released from the scope', () => {
    const scope = new ResourceScope();

    const originalSetInterval =
        globalThis.setInterval;
    const originalClearInterval =
        globalThis.clearInterval;

    let clearCount = 0;

    try {
        globalThis.setInterval = () => {
            return 321;
        };

        globalThis.clearInterval = () => {
            clearCount += 1;
        };

        const intervalId =
            scope.setInterval(() => {}, 100);

        scope.clearInterval(intervalId);

        assert.equal(clearCount, 1);

        scope.dispose();

        assert.equal(clearCount, 1);
    } finally {
        globalThis.setInterval =
            originalSetInterval;

        globalThis.clearInterval =
            originalClearInterval;
    }
});