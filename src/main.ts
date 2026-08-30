import { InputManager } from './core/InputManager.ts';
import { configureGameCore } from '../game_core.js';

const inputManager = new InputManager(window);

configureGameCore({
    inputManager
});