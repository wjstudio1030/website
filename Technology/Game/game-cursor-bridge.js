(() => {
    "use strict";

    const panel = document.getElementById("wj-tech-panel-game");
    const cursor = document.querySelector(".cursor");
    const follower = document.querySelector(".cursor-follower");
    if (!panel || !cursor || !follower) return;

    const attached = new WeakSet();

    function attachFrame(frame) {
        if (attached.has(frame)) return;
        attached.add(frame);

        function connect() {
            let child;
            try { child = frame.contentDocument; }
            catch (_) { return; }

            if (!child || !child.head || !child.body) return;
            if (child.URL === "about:blank") return;
            if (child.getElementById("wj-single-cursor-style")) return;

            const style = child.createElement("style");
            style.id = "wj-single-cursor-style";
            style.textContent =
                "*, *::before, *::after { cursor: none !important; }" +
                ".cursor, .cursor-follower {" +
                " display:none !important; opacity:0 !important; }";
            child.head.appendChild(style);

            child.addEventListener("mousemove", (event) => {
                const rect = frame.getBoundingClientRect();
                const width = frame.clientWidth;
                const height = frame.clientHeight;
                if (!width || !height) return;

                const x = rect.left + event.clientX * rect.width / width;
                const y = rect.top + event.clientY * rect.height / height;

                document.dispatchEvent(new MouseEvent("mousemove", {
                    bubbles: true,
                    clientX: x,
                    clientY: y,
                    view: window
                }));
            }, true);
        }

        frame.addEventListener("load", connect);
        connect();
    }

    function scan() {
        panel.querySelectorAll("iframe.wjgame-frame")
            .forEach(attachFrame);
    }

    const observer = new MutationObserver(scan);
    observer.observe(panel, {
        childList: true,
        subtree: true
    });

    scan();
})();