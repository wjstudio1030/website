import test from 'node:test';
import assert from 'node:assert/strict';

import { InputManager } from './InputManager.ts';

function createKeyboardEvent(type, code) {
    const event = new Event(type);

    Object.defineProperty(event, 'code', {
        value: code,
        enumerable: true
    });

    return event;
}

test('keydown is routed to the active input handler', () => {
    const target = new EventTarget();
    const input = new InputManager(target);

    let receivedCode = null;

    const handler = {
        handleKeyDown(event) {
            receivedCode = event.code;
        }
    };

    input.activate(handler);

    target.dispatchEvent(
        createKeyboardEvent('keydown', 'KeyW')
    );

    assert.equal(receivedCode, 'KeyW');

    input.destroy();
});

test('keyup is routed to the active input handler', () => {
    const target = new EventTarget();
    const input = new InputManager(target);

    let receivedCode = null;

    const handler = {
        handleKeyUp(event) {
            receivedCode = event.code;
        }
    };

    input.activate(handler);

    target.dispatchEvent(
        createKeyboardEvent('keyup', 'KeyW')
    );

    assert.equal(receivedCode, 'KeyW');

    input.destroy();
});

test('keydown and keyup update pressed state', () => {
    const target = new EventTarget();
    const input = new InputManager(target);

    assert.equal(input.isPressed('KeyW'), false);

    target.dispatchEvent(
        createKeyboardEvent('keydown', 'KeyW')
    );

    assert.equal(input.isPressed('KeyW'), true);

    target.dispatchEvent(
        createKeyboardEvent('keyup', 'KeyW')
    );

    assert.equal(input.isPressed('KeyW'), false);

    input.destroy();
});

test('deactivate clears the active handler and pressed state', () => {
    const target = new EventTarget();
    const input = new InputManager(target);

    let keyDownCount = 0;

    const handler = {
        handleKeyDown() {
            keyDownCount += 1;
        }
    };

    input.activate(handler);

    target.dispatchEvent(
        createKeyboardEvent('keydown', 'KeyW')
    );

    assert.equal(input.isPressed('KeyW'), true);
    assert.equal(keyDownCount, 1);

    input.deactivate();

    assert.equal(input.isPressed('KeyW'), false);

    target.dispatchEvent(
        createKeyboardEvent('keydown', 'KeyA')
    );

    assert.equal(keyDownCount, 1);

    input.destroy();
});

test('activating a new handler clears previous pressed state', () => {
    const target = new EventTarget();
    const input = new InputManager(target);

    const firstHandler = {};
    const secondHandler = {};

    input.activate(firstHandler);

    target.dispatchEvent(
        createKeyboardEvent('keydown', 'KeyW')
    );

    assert.equal(input.isPressed('KeyW'), true);

    input.activate(secondHandler);

    assert.equal(input.isPressed('KeyW'), false);

    input.destroy();
});

test('destroy removes global keyboard listeners', () => {
    const target = new EventTarget();
    const input = new InputManager(target);

    let keyDownCount = 0;
    let keyUpCount = 0;

    const handler = {
        handleKeyDown() {
            keyDownCount += 1;
        },

        handleKeyUp() {
            keyUpCount += 1;
        }
    };

    input.activate(handler);

    input.destroy();

    target.dispatchEvent(
        createKeyboardEvent('keydown', 'KeyW')
    );

    target.dispatchEvent(
        createKeyboardEvent('keyup', 'KeyW')
    );

    assert.equal(keyDownCount, 0);
    assert.equal(keyUpCount, 0);
});