/* WJ LOCAL GAME EMBED
 * Loads the existing game page, without editing game code.
 * Crops visually to the original #gameWrapper and preserves
 * its original aspect ratio and internal controls.
 */
(() => {
    "use strict";

    // Local development only.
    const hostName = location.hostname;
    const local = /^(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.test(hostName);

    if (!local) return;

    const panel = document.getElementById("wj-tech-panel-game");
    if (!panel) return;

    const gameEntry = "Game.vite.html";

    const style = document.createElement("style");
    style.id = "wj-local-game-embed-style";

    style.textContent = `
#wj-technology #wj-tech-panel-game.wjgame-live:not([hidden]) {
    display: block !important;
    min-height: 0;
    padding: 0;
    overflow: hidden;
    background: #17151e;
    border: 1px solid #ffffff27;
    border-radius: 16px;
}

#wj-technology #wj-tech-panel-game[hidden] {
    display: none !important;
}

#wj-technology .wjgame-host {
    padding: clamp(18px,3vw,38px);
    color: white;
}

#wj-technology .wjgame-head {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 25px;
}

#wj-technology .wjgame-overline {
    font: 600 10px var(--font-tech),monospace;
    letter-spacing: .14em;
    color: #dba2c5;
}

#wj-technology .wjgame-title {
    margin: 10px 0 0;
    font-size: clamp(27px,3vw,44px);
    font-weight: 800;
    color: #fff;
}

#wj-technology .wjgame-subtitle {
    font: 600 10px var(--font-tech),monospace;
    letter-spacing: .13em;
    color: #aaa2b2;
    margin-top: 8px;
}

#wj-technology .wjgame-window {
    position: relative;
    width: min(100%,1100px);
    aspect-ratio: 16 / 9;
    margin: 0 auto;
    background: #030303;
    overflow: hidden;
    border-radius: 12px;
    isolation: isolate;
}

#wj-technology .wjgame-frame {
    position: absolute;
    left: 0;
    top: 0;
    width: 1100px;
    height: 619px;
    border: 0;
    transform-origin: top left;
    display: block;
    background: transparent;
}

#wj-technology .wjgame-status {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    text-align: center;
    padding: 20px;
    color: #f0d3e6;
    font: 600 13px/1.9 var(--font-tech),monospace;
    background: #121018;
    z-index: 3;
    pointer-events: none;
}

#wj-technology .wjgame-status[hidden] {
    display: none;
}

#wj-technology .wjgame-foot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
    margin: 16px auto 0;
    width: min(100%,1100px);
    color: #918a9d;
    font: 600 10px/1.7 var(--font-tech),monospace;
    letter-spacing: .08em;
}

#wj-technology .wjgame-open {
    color: #f1b4d8;
    text-decoration: none;
    border-bottom: 1px solid #ed9ac66b;
    padding-bottom: 3px;
}

#wj-technology .wjgame-open:hover {
    color: #fff;
}

@media(max-width:720px) {
    #wj-technology .wjgame-host {
        padding: 15px;
    }
    #wj-technology .wjgame-head {
        margin-bottom: 15px;
    }
    #wj-technology .wjgame-foot {
        font-size: 9px;
    }
}
`;

    document.head.appendChild(style);

    panel.classList.add("wjgame-live");

    panel.innerHTML = `
        <div class="wjgame-host">

            <header class="wjgame-head">
                <div>
                    <div class="wjgame-overline">
                        WJ ACADEMY / FIELD 02
                    </div>

                    <h3 class="wjgame-title">
                        遊戲開發
                    </h3>

                    <div class="wjgame-subtitle">
                        GAME DEVELOPMENT
                    </div>
                </div>
            </header>

            <div class="wjgame-window">
                <div class="wjgame-status" role="status">
                    GAME SYSTEM / LOADING
                </div>
            </div>

            <footer class="wjgame-foot">
                <span>WJ / ORIGINAL GAME EXPERIENCE</span>
                <a class="wjgame-open"
                   href="${gameEntry}"
                   target="_blank"
                   rel="noopener">
                   在獨立頁面開啟原版遊戲 ↗
                </a>
            </footer>

        </div>
    `;

    const windowBox = panel.querySelector(".wjgame-window");
    const status = panel.querySelector(".wjgame-status");

    let iframe = null;
    let gameWrapper = null;
    let fitted = false;
    let fitPending = false;

    // Use a desktop-sized embedded browser viewport.
    // The game itself keeps all its native CSS and JS.
    const nativeWidth = 1100;
    const nativeHeight = 619;

    function fitGame() {
        fitPending = false;

        if (!iframe || !gameWrapper || panel.hidden) return;

        const width = windowBox.clientWidth;
        if (width <= 0) return;

        const scale = width / nativeWidth;

        windowBox.style.height =
            Math.round(nativeHeight * scale) + "px";

        iframe.style.transform = "scale(" + scale + ")";
        iframe.style.opacity = "1";

        status.hidden = true;
        fitted = true;
    }

    function scheduleFit() {
        if (fitPending || !iframe) return;

        fitPending = true;
        requestAnimationFrame(fitGame);
    }

    function loadGame() {
        if (iframe) {
            scheduleFit();
            return;
        }

        iframe = document.createElement("iframe");

        iframe.className = "wjgame-frame";
        iframe.title = "WJ STUDIO 原始遊戲";
        iframe.src = gameEntry;
        iframe.width = nativeWidth;
        iframe.height = nativeHeight;
        iframe.loading = "eager";

        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("allow", "fullscreen; autoplay");
        iframe.setAttribute("scrolling", "no");

        iframe.style.opacity = "0";

        iframe.addEventListener("load", () => {
            let doc;

            try {
                doc = iframe.contentDocument;
            } catch (_) {
                doc = null;
            }

            if (!doc) {
                status.textContent =
                    "無法讀取遊戲畫面，請改用獨立頁面開啟。";
                return;
            }

            const stageCSS = doc.createElement("style");
            stageCSS.id = "wj-embed-viewport-fix";
            stageCSS.textContent =
                "html,body{margin:0!important;padding:0!important;width:1100px!important;height:619px!important;overflow:hidden!important;}" +
                ".navbar,.game-title,.footer__container{display:none!important;}" +
                ".game-section{display:block!important;margin:0!important;padding:0!important;width:1100px!important;height:619px!important;min-height:0!important;}" +
                ".game-wrapper{margin:0!important;width:1100px!important;max-width:1100px!important;aspect-ratio:16/9!important;}" +
                ".game-wrapper:fullscreen{width:100%!important;height:100%!important;max-width:none!important;aspect-ratio:auto!important;}";
            doc.head.appendChild(stageCSS);

            const homepageFullscreenStyle = doc.createElement("style");
            homepageFullscreenStyle.id = "wj-home-only-fullscreen-hidden";
            homepageFullscreenStyle.textContent =
                "#fullscreenBtn { display: none !important; }";
            doc.head.appendChild(homepageFullscreenStyle);

            gameWrapper =
                doc.getElementById("gameWrapper") ||
                doc.querySelector(".game-wrapper");

            if (!gameWrapper) {
                status.textContent =
                    "找不到原始遊戲容器 #gameWrapper，" +
                    "請使用下方連結開啟原版遊戲。";
                return;
            }

            // The game source and native layout stay intact.
            // React only to the wrapper's measured position.
            scheduleFit();

            if ("ResizeObserver" in window) {
                const resize = new ResizeObserver(scheduleFit);
                resize.observe(gameWrapper);
            }

            try {
                iframe.contentWindow.addEventListener(
                    "scroll",
                    scheduleFit,
                    {passive:true}
                );

                iframe.contentWindow.addEventListener(
                    "resize",
                    scheduleFit
                );

                doc.addEventListener(
                    "fullscreenchange",
                    () => {
                        if (!doc.fullscreenElement) scheduleFit();
                    }
                );
            } catch (_) {}
        });

        iframe.addEventListener("error", () => {
            status.textContent =
                "遊戲載入失敗，請確認本地開發伺服器已啟動。";
        });

        windowBox.appendChild(iframe);
    }

    // Load the 3D game only when GAME DEVELOPMENT is selected.
    // Switching away does not reset the original game state.
    function checkActive() {
        if (!panel.hidden) {
            loadGame();
        }
    }

    const observer = new MutationObserver(checkActive);

    observer.observe(panel, {
        attributes:true,
        attributeFilter:["hidden"]
    });

    if ("ResizeObserver" in window) {
        const resize = new ResizeObserver(scheduleFit);
        resize.observe(windowBox);
    }

    window.addEventListener(
        "resize",
        scheduleFit,
        {passive:true}
    );

    checkActive();
})();
