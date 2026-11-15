(() => {
    "use strict";

    const PATCH_ID = "wj-ui-text-patch-style";
    const SCRIPT_MARK = "wj-ui-text-patch-runtime";

    function injectStyle() {
        if (document.getElementById(PATCH_ID)) return;

        const style = document.createElement("style");
        style.id = PATCH_ID;
        style.textContent = `
.wj-experience-kicker {
    width: min(1200px, calc(100% - 40px));
    margin: 18px auto 4px;
    display: flex;
    align-items: center;
    gap: 14px;
    color: #ffffff;
    font-family: var(--font-tech), "Orbitron", sans-serif;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.08em;
}

.wj-experience-kicker .wj-experience-line {
    width: 42px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, #ff8177 0%, #6c63ff 100%);
    box-shadow: 0 0 10px rgba(255,129,119,0.3), 0 0 12px rgba(108,99,255,0.25);
    flex: 0 0 auto;
}

.wj-experience-kicker .wj-experience-text {
    color: #ffffff;
    opacity: 0.96;
}

.wj-force-white-title {
    color: #ffffff !important;
    background: none !important;
    -webkit-text-fill-color: #ffffff !important;
    text-fill-color: #ffffff !important;
    text-shadow: none !important;
}

.wj-tedx-adjusted {
    margin-top: -8px !important;
    padding-top: 8px !important;
}
`;
        document.head.appendChild(style);
    }

    function clean(text) {
        return (text || "").replace(/\s+/g, " ").trim();
    }

    function replaceNavTexts() {
        const map = new Map([
            ["Home", "首頁"],
            ["Memories", "高中備審"],
            ["Tutor", "免費課程報名"]
        ]);

        document.querySelectorAll("a, button, span, div").forEach(el => {
            if (el.children.length > 0) return;
            const txt = clean(el.textContent);
            if (map.has(txt)) {
                el.textContent = map.get(txt);
            }
        });
    }

    function patchChapterTitle() {
        document.querySelectorAll("h1, h2, h3, .main__content, .memories__content, .hero__content, .page-title").forEach(el => {
            if (el.children.length > 0 && !/^h[1-3]$/i.test(el.tagName)) return;
            const txt = clean(el.textContent);

            if (txt === "The Chapter of My Life" || txt === "我的高中學習歷程檔案") {
                el.textContent = "我的高中學習歷程檔案";
                el.classList.add("wj-force-white-title");
            }
        });
    }

    function patchAiVrArText() {
        document.querySelectorAll("a, button, span, div, h3, h4, p").forEach(el => {
            if (el.children.length > 0) return;
            const txt = clean(el.textContent);
            if (txt === "AI X VR/AR" || txt === "AI×VR/AR") {
                el.textContent = "AI結合VR虛擬實境/AR擴增實境";
            }
        });
    }

    function findTedxSection() {
        const all = Array.from(document.querySelectorAll("section, div, article"));

        for (const el of all) {
            const txt = clean(el.textContent);
            if (txt.includes("I'M JARVIS") || txt.includes("HELLO !")) {
                return el;
            }
        }

        const fallback = Array.from(document.querySelectorAll("h1, h2, h3, p, div"))
            .find(el => {
                const txt = clean(el.textContent);
                return txt.includes("I'M JARVIS") || txt.includes("HELLO !");
            });

        if (!fallback) return null;

        return fallback.closest("section, article, div") || fallback.parentElement;
    }

    function insertExperienceKicker() {
        const tedxSection = findTedxSection();
        if (!tedxSection) return;

        if (!document.getElementById("wj-experience-kicker")) {
            const box = document.createElement("div");
            box.id = "wj-experience-kicker";
            box.className = "wj-experience-kicker";
            box.innerHTML = `
                <span class="wj-experience-line"></span>
                <span class="wj-experience-text">WJ 的經歷</span>
            `;
            tedxSection.parentNode.insertBefore(box, tedxSection);
        }

        tedxSection.classList.add("wj-tedx-adjusted");
    }

    function runPatch() {
        injectStyle();
        replaceNavTexts();
        patchChapterTitle();
        patchAiVrArText();
        insertExperienceKicker();
    }

    if (document.documentElement.dataset[SCRIPT_MARK]) {
        runPatch();
        return;
    }

    document.documentElement.dataset[SCRIPT_MARK] = "1";

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", runPatch);
    } else {
        runPatch();
    }

    const observer = new MutationObserver(() => {
        runPatch();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();