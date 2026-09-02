import { InputManager } from './core/InputManager.ts';
import { ResourceScope } from './core/ResourceScope.ts';
import {
    SceneManager,
    type SceneManagerOptions
} from './core/SceneManager.ts';
import { configureGameCore } from '../game_core.js';

const inputManager = new InputManager(window);

configureGameCore({
    inputManager,

    createResourceScope: () => new ResourceScope(),

    createSceneManager: (options: SceneManagerOptions) =>
        new SceneManager(options)
});