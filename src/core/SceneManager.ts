import type { InputManager } from './InputManager.ts';
import type { ResourceScope } from './ResourceScope.ts';
import type {
    SceneId,
    SceneInputHandler
} from './types/Scene.ts';

interface SceneController extends SceneInputHandler {
    destroy(): void;
}

type SceneControllerFactory = (
    resourceScope: ResourceScope
) => SceneController;

export interface SceneManagerOptions {
    inputManager: InputManager;
    createResourceScope: () => ResourceScope;
    sceneFactories: Record<SceneId, SceneControllerFactory>;
}

export class SceneManager {
    private inputManager: InputManager;
    private createResourceScope: () => ResourceScope;
    private sceneFactories: Record<SceneId, SceneControllerFactory>;
    private activeController: SceneController | null = null;

    constructor(options: SceneManagerOptions) {
        this.inputManager = options.inputManager;
        this.createResourceScope = options.createResourceScope;
        this.sceneFactories = options.sceneFactories;
    }

    enter(sceneId: SceneId): void {
        const resourceScope = this.createResourceScope();
        const controller = this.sceneFactories[sceneId](resourceScope);

        this.activeController = controller;
        this.inputManager.activate(controller);
    }

    leave(): void {
        if (!this.activeController) {
            return;
        }

        this.inputManager.deactivate();

        this.activeController.destroy();
        this.activeController = null;
    }
}