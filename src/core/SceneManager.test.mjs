import assert from 'node:assert/strict';
import test from 'node:test';

import { SceneManager } from './SceneManager.ts';

test('enter creates a scoped scene controller and activates it', () => {
    const resourceScope = {
        name: 'scene-1-scope'
    };

    const controller = {
        destroy() {}
    };

    let receivedScope = null;
    let activatedController = null;

    const inputManager = {
        activate(sceneController) {
            activatedController = sceneController;
        },

        deactivate() {}
    };

    const manager = new SceneManager({
        inputManager,

        createResourceScope() {
            return resourceScope;
        },

        sceneFactories: {
            1(scope) {
                receivedScope = scope;
                return controller;
            }
        }
    });

    manager.enter(1);

    assert.equal(receivedScope, resourceScope);
    assert.equal(activatedController, controller);
});

test('leave deactivates input and destroys the active scene controller', () => {
    const resourceScope = {};

    let deactivateCount = 0;
    let destroyCount = 0;

    const controller = {
        destroy() {
            destroyCount += 1;
        }
    };

    const inputManager = {
        activate() {},

        deactivate() {
            deactivateCount += 1;
        }
    };

    const manager = new SceneManager({
        inputManager,

        createResourceScope() {
            return resourceScope;
        },

        sceneFactories: {
            1() {
                return controller;
            }
        }
    });

    manager.enter(1);
    manager.leave();

    assert.equal(deactivateCount, 1);
    assert.equal(destroyCount, 1);
});

test('leaving and re-entering the same scene creates a new scoped controller', () => {
    const createdScopes = [];
    const createdControllers = [];
    const activatedControllers = [];

    let nextScopeId = 1;
    let nextControllerId = 1;

    const inputManager = {
        activate(controller) {
            activatedControllers.push(controller);
        },

        deactivate() {}
    };

    const manager = new SceneManager({
        inputManager,

        createResourceScope() {
            const scope = {
                id: nextScopeId++
            };

            createdScopes.push(scope);
            return scope;
        },

        sceneFactories: {
            3(scope) {
                const controller = {
                    id: nextControllerId++,
                    scope,

                    destroy() {}
                };

                createdControllers.push(controller);
                return controller;
            }
        }
    });

    manager.enter(3);
    manager.leave();
    manager.enter(3);

    assert.equal(createdScopes.length, 2);
    assert.equal(createdControllers.length, 2);
    assert.equal(activatedControllers.length, 2);

    assert.notEqual(createdScopes[0], createdScopes[1]);
    assert.notEqual(createdControllers[0], createdControllers[1]);

    assert.equal(createdControllers[0].scope, createdScopes[0]);
    assert.equal(createdControllers[1].scope, createdScopes[1]);
});

test('leave does nothing when there is no active scene', () => {
    let deactivateCount = 0;
    let destroyCount = 0;

    const controller = {
        destroy() {
            destroyCount += 1;
        }
    };

    const inputManager = {
        activate() {},

        deactivate() {
            deactivateCount += 1;
        }
    };

    const manager = new SceneManager({
        inputManager,

        createResourceScope() {
            return {};
        },

        sceneFactories: {
            1() {
                return controller;
            }
        }
    });

    manager.enter(1);

    manager.leave();
    manager.leave();

    assert.equal(deactivateCount, 1);
    assert.equal(destroyCount, 1);
});