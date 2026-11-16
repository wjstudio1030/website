(() => {
    "use strict";

    const TARGET_ID = "wj-free-course";
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    let frameId = 0;

    function targetPosition() {
        const target = document.getElementById(TARGET_ID);
        if (!target) return null;

        const nav = document.querySelector(".navbar");
        const navHeight = nav
            ? nav.getBoundingClientRect().height
            : 0;

        const offset = Math.min(
            110, Math.max(18, navHeight + 12)
        );

        const y = window.scrollY +
            target.getBoundingClientRect().top -
            offset;

        const max = Math.max(
            0,
            document.documentElement.scrollHeight -
                window.innerHeight
        );

        return Math.max(0, Math.min(max, y));
    }

    function smoothToCourse() {
        const destination = targetPosition();
        if (destination === null) return;

        cancelAnimationFrame(frameId);

        const start = window.scrollY;
        const distance = Math.abs(destination - start);

        // 遠近皆保持快速且自然的滑動
        const duration = Math.min(
            820, Math.max(560, distance * 0.105)
        );

        const root = document.documentElement;
        const previousBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";

        const updateAddress = () => {
            const url = new URL(location.href);
            url.searchParams.delete("wj_course");
            url.hash = TARGET_ID;

            history.replaceState(
                history.state,
                "",
                url.pathname + url.search + url.hash
            );
        };

        if (reduceMotion || distance < 8) {
            window.scrollTo(0, destination);
            root.style.scrollBehavior = previousBehavior;
            updateAddress();
            return;
        }

        let startTime = null;
        let interrupted = false;

        const cleanup = (completed) => {
            interrupted = true;
            cancelAnimationFrame(frameId);
            window.removeEventListener("wheel", cancelFromUser);
            window.removeEventListener("touchstart", cancelFromUser);
            window.removeEventListener("keydown", cancelFromKeyboard);

            root.style.scrollBehavior = previousBehavior;
            if (completed) updateAddress();
        };

        const cancelFromUser = () => cleanup(false);
        const cancelFromKeyboard = (event) => {
            if ([
                "ArrowUp", "ArrowDown", "PageUp",
                "PageDown", "Home", "End", " "
            ].includes(event.key)) {
                cleanup(false);
            }
        };

        window.addEventListener(
            "wheel", cancelFromUser, { passive: true }
        );
        window.addEventListener(
            "touchstart", cancelFromUser, { passive: true }
        );
        window.addEventListener(
            "keydown", cancelFromKeyboard
        );

        function animate(now) {
            if (interrupted) return;
            if (startTime === null) startTime = now;

            const progress = Math.min(
                1, (now - startTime) / duration
            );

            // easeOutCubic：前段快速，接近目標時平順減速
            const eased = 1 - Math.pow(1 - progress, 3);

            // 每幀更新定位，避免圖片載入時導致位置偏移
            const currentTarget = targetPosition();
            if (currentTarget === null) {
                cleanup(false);
                return;
            }

            window.scrollTo(
                0,
                start + (currentTarget - start) * eased
            );

            if (progress < 1) {
                frameId = requestAnimationFrame(animate);
            } else {
                window.scrollTo(0, targetPosition());
                cleanup(true);
            }
        }

        frameId = requestAnimationFrame(animate);
    }

    function init() {
        if (!document.getElementById(TARGET_ID)) return;

        // HOME 導覽：不論目前在上方或下方
        document.addEventListener("click", (event) => {
            const link = event.target.closest?.(
                'a[href="#wj-free-course"]'
            );

            if (!link || event.button !== 0 ||
                event.ctrlKey || event.shiftKey ||
                event.metaKey || event.altKey) return;

            event.preventDefault();
            smoothToCourse();
        }, true);

        // 從高中備審進入 HOME 時，避免原生錨點瞬間跳轉
        const params = new URLSearchParams(location.search);

        if (params.get("wj_course") === "1") {
            requestAnimationFrame(() => {
                requestAnimationFrame(smoothToCourse);
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();