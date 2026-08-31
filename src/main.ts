import { InputManager } from './core/InputManager.ts';
import { ResourceScope } from './core/ResourceScope.ts';
import { configureGameCore } from '../game_core.js';

const inputManager = new InputManager(window);

configureGameCore({
    inputManager,
    createResourceScope: () => new ResourceScope()
});