/* WJ HOME INTERACTIONS V1 - LOCAL ONLY */
(() => {
    "use strict";

    function initialize() {
        if (document.documentElement.dataset.wjHomeInteractionsV1) return;
        document.documentElement.dataset.wjHomeInteractionsV1 = "1";

        const logoImage = document.getElementById("navbar__logo--img");
        const overlay = document.getElementById("gif-overlay");
        const video = overlay?.querySelector("video");

        // Logo image: original JARVIS intro, without text-logo fireworks.
        if (logoImage && overlay && video) {
            function playLogoIntro(event) {
                event.preventDefault();
                event.stopPropagation();

                overlay.classList.add("active");
                try { video.currentTime = 0; } catch (_) {}
                const play = video.play();
                if (play && play.catch) play.catch(() => {});

                const audio = new Audio("audio/HI_WJ.mp3");
                const sound = audio.play();
                if (sound && sound.catch) sound.catch(() => {});
            }

            logoImage.setAttribute("role", "button");
            logoImage.setAttribute("tabindex", "0");
            logoImage.setAttribute("aria-label", "播放 WJ 介紹動畫");

            logoImage.addEventListener("click", playLogoIntro, true);
            logoImage.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    playLogoIntro(event);
                }
            });
        }

        // Whole TEDx hero: open the original YouTube link.
        // Capture phase stops the old heading click animation.
        const hero = document.querySelector("body > .main .main__container");
        if (hero) {
            const rightLink = hero.querySelector(".main__img--link");
            const button = hero.querySelector(".main__btn");
            const url = rightLink?.href ||
                "https://www.youtube.com/watch?v=Fl4DmKrRQmU";

            if (button) {
                button.href = url;
                button.target = "_blank";
                button.rel = "noopener noreferrer";
            }
            if (rightLink) rightLink.rel = "noopener noreferrer";

            hero.addEventListener("click", (event) => {
                if (event.button !== 0) return;
                event.preventDefault();
                event.stopPropagation();
                window.open(url, "_blank", "noopener,noreferrer");
            }, true);
        }

        // YouTube uses a cross-origin iframe.
        // Show its native mouse pointer, not a frozen HOME pointer.
        const xrPanel = document.getElementById("wj-tech-panel-xr");
        const youtube = xrPanel?.querySelector(".wj-xr-video-frame iframe");

        if (youtube) {
            const enter = () =>
                document.body.classList.add("wj-youtube-hover");
            const leave = () =>
                document.body.classList.remove("wj-youtube-hover");

            youtube.addEventListener("mouseenter", enter);
            youtube.addEventListener("mouseleave", leave);

            document.addEventListener("pointermove", (event) => {
                const rect = youtube.getBoundingClientRect();
                const outside = event.clientX < rect.left ||
                    event.clientX > rect.right ||
                    event.clientY < rect.top ||
                    event.clientY > rect.bottom;
                if (outside || xrPanel.hidden) leave();
            }, true);

            new MutationObserver(() => {
                if (xrPanel.hidden) leave();
            }).observe(xrPanel, {
                attributes: true,
                attributeFilter: ["hidden"]
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }
})();