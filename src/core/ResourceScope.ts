type Cleanup = () => void;

export class ResourceScope {
    private cleanups = new Set<Cleanup>();
    private intervalCleanups = new Map<ReturnType<typeof globalThis.setInterval>,Cleanup>();
    private disposed = false;


    addCleanup(cleanup: Cleanup): () => void {
        if (this.disposed) {
            cleanup();
            return () => {};
        }

        this.cleanups.add(cleanup);

        return () => {
            this.cleanups.delete(cleanup);
        };
    }

    setInterval(callback: () => void, delay?: number): ReturnType<typeof globalThis.setInterval> {
        const intervalId = globalThis.setInterval(callback, delay);

        const unregisterCleanup = this.addCleanup(() => {
            globalThis.clearInterval(intervalId);
        });

        if (!this.disposed) {
            this.intervalCleanups.set(
                intervalId,
                unregisterCleanup
            );
        }

        return intervalId;
    }

    clearInterval(intervalId: ReturnType<typeof globalThis.setInterval>): void {
        globalThis.clearInterval(intervalId);

        const unregisterCleanup = this.intervalCleanups.get(intervalId);

        unregisterCleanup?.();

        this.intervalCleanups.delete(intervalId);
    }

    setTimeout(callback: () => void,delay?: number): ReturnType<typeof globalThis.setTimeout> {
        let unregisterCleanup = () => {};

        const timeoutId = globalThis.setTimeout(
            () => {
                unregisterCleanup();
                callback();
            },
            delay
        );

        unregisterCleanup = this.addCleanup(() => {
            globalThis.clearTimeout(timeoutId);
        });

        return timeoutId;
    }

    listen(target: EventTarget,type: string,listener: EventListenerOrEventListenerObject,options?: boolean | AddEventListenerOptions): void {
        target.addEventListener(type, listener, options);

        this.addCleanup(() => {
            target.removeEventListener(type, listener, options);
        });
    }

    requestAnimationFrame(callback: FrameRequestCallback): number {
        let unregisterCleanup = () => {};

        const frameId = globalThis.requestAnimationFrame(
            (timestamp) => {
                unregisterCleanup();
                callback(timestamp);
            }
        );

        unregisterCleanup = this.addCleanup(() => {
            globalThis.cancelAnimationFrame(frameId);
        });

        return frameId;
    }

    dispose(): void {
        if (this.disposed) {
            return;
        }

        this.disposed = true;

        for (const cleanup of this.cleanups) {
            cleanup();
        }

        this.cleanups.clear();
        this.intervalCleanups.clear();
    }
}