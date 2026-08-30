type Cleanup = () => void;

export class ResourceScope {
    private cleanups = new Set<Cleanup>();
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

    setInterval(callback: () => void,delay?: number): ReturnType<typeof globalThis.setInterval> {
        const intervalId = globalThis.setInterval(callback, delay);

        this.addCleanup(() => {
            globalThis.clearInterval(intervalId);
        });

        return intervalId;
    }

    setTimeout(callback: () => void,delay?: number): ReturnType<typeof globalThis.setTimeout> {
        const timeoutId = globalThis.setTimeout(callback, delay);

        this.addCleanup(() => {
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
    }
}