import type { SceneInputHandler } from './types/Scene';
import { ResourceScope } from './ResourceScope.ts';

export class InputManager {
    private activeHandler: SceneInputHandler | null = null;
    private readonly target: EventTarget;
    private readonly pressedKeys = new Set<string>();
    private readonly scope = new ResourceScope();

    private readonly handleKeyDown = (event: Event): void => {
        const keyboardEvent = event as KeyboardEvent;

        this.pressedKeys.add(keyboardEvent.code);

        this.activeHandler?.handleKeyDown?.(keyboardEvent);
    };

    private readonly handleKeyUp = (event: Event): void => {
        const keyboardEvent = event as KeyboardEvent;

        this.pressedKeys.delete(keyboardEvent.code);

        this.activeHandler?.handleKeyUp?.(keyboardEvent);
    };

    constructor(target: EventTarget) {
        this.target = target;

        this.scope.listen(
            this.target,
            'keydown',
            this.handleKeyDown
        );

        this.scope.listen(
            this.target,
            'keyup',
            this.handleKeyUp
        );
    }

    activate(handler: SceneInputHandler): void {
        this.pressedKeys.clear();
        this.activeHandler = handler;
        this.pressedKeys.clear();
    }

    deactivate(): void {
        this.activeHandler = null;
        this.pressedKeys.clear();
    }

    isPressed(code: string): boolean {
        return this.pressedKeys.has(code);
    }

    destroy(): void {
        this.deactivate();
        this.scope.dispose();
    }
}