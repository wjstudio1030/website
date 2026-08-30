export type SceneId = 1 | 2 | 3;

export interface SceneInputHandler {
    handleKeyDown?(event: KeyboardEvent): void;
    handleKeyUp?(event: KeyboardEvent): void;
}

export interface GameScene extends SceneInputHandler {
    readonly id: SceneId;

    start(): void;

    destroy(): void;
}

export type SceneFactory = () => GameScene;
