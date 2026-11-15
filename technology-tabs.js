// WJ Academy / HOME five-field switcher + presentation effects (v1).
// Intentionally isolated from app.js, HOME hero and the TEDx scroll/intro sequence.
(function () {
    "use strict";

    function initializeTechnologyTabs() {
        var root = document.getElementById("wj-technology");
        if (!root) return;

        var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"][data-field]'));
        var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"][data-field-panel]'));
        var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var pointerFine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        var activeField = "iot";

        function activate(field, focus) {
            if (!tabs.some(function (tab) { return tab.getAttribute("data-field") === field; })) return;
            var selectedTab = null;
            var isRepeat = activeField === field;

            tabs.forEach(function (tab) {
                var selected = tab.getAttribute("data-field") === field;
                tab.setAttribute("aria-selected", selected ? "true" : "false");
                tab.setAttribute("tabindex", selected ? "0" : "-1");
                if (selected) selectedTab = tab;
            });

            panels.forEach(function (panel) {
                panel.hidden = panel.getAttribute("data-field-panel") !== field;
            });

            activeField = field;
            if (focus && selectedTab) selectedTab.focus();

            // Give a repeat selection a little response without leaving the current panel.
            if (isRepeat && selectedTab && !reducedMotion) {
                selectedTab.classList.remove("wj-tech__tab--tapped");
                void selectedTab.offsetWidth;
                selectedTab.classList.add("wj-tech__tab--tapped");
            }
        }

        tabs.forEach(function (tab, index) {
            tab.addEventListener("click", function () {
    var field = tab.getAttribute("data-field");

    if (field === "program") {
        window.open("https://wjstudio1030.github.io/AI_Stock_Project_V3/", "_blank", "noopener,noreferrer");
        return;
    }

    if (field === "website") {
        window.open("Memories.html", "_blank", "noopener,noreferrer");
        return;
    }

    activate(field, false);
});
            tab.addEventListener("animationend", function (event) {
                if (event.animationName === "wjTechTap") {
                    tab.classList.remove("wj-tech__tab--tapped");
                }
            });
            tab.addEventListener("keydown", function (event) {
                var next = null;
                if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
                if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index + tabs.length - 1) % tabs.length;
                if (event.key === "Home") next = 0;
                if (event.key === "End") next = tabs.length - 1;
                if (next === null) return;
                event.preventDefault();
                activate(tabs[next].getAttribute("data-field"), true);
            });

            if (pointerFine && !reducedMotion) {
                tab.addEventListener("pointermove", function (event) {
                    if (event.pointerType && event.pointerType !== "mouse") return;
                    var rect = tab.getBoundingClientRect();
                    if (!rect.width || !rect.height) return;
                    tab.style.setProperty("--wj-spot-x", ((event.clientX - rect.left) / rect.width * 100).toFixed(1) + "%");
                    tab.style.setProperty("--wj-spot-y", ((event.clientY - rect.top) / rect.height * 100).toFixed(1) + "%");
                });
                tab.addEventListener("pointerleave", function () {
                    tab.style.removeProperty("--wj-spot-x");
                    tab.style.removeProperty("--wj-spot-y");
                });
            }
        });

        if (pointerFine && !reducedMotion) {
            panels.forEach(function (panel) {
                var graphic = panel.querySelector(".wj-tech__panel-graphic");
                var frame = panel.querySelector(".wj-tech__graphic-frame");
                if (!graphic || !frame) return;
                var frameRequest = 0;

                graphic.addEventListener("pointermove", function (event) {
                    if (panel.hidden || (event.pointerType && event.pointerType !== "mouse")) return;
                    var rect = graphic.getBoundingClientRect();
                    if (!rect.width || !rect.height) return;
                    var dx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - .5) * 2));
                    var dy = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - .5) * 2));
                    if (frameRequest) cancelAnimationFrame(frameRequest);
                    frameRequest = requestAnimationFrame(function () {
                        frame.style.setProperty("--wj-parallax-x", (dx * 11).toFixed(1) + "px");
                        frame.style.setProperty("--wj-parallax-y", (dy * 9).toFixed(1) + "px");
                        frameRequest = 0;
                    });
                });

                graphic.addEventListener("pointerleave", function () {
                    if (frameRequest) cancelAnimationFrame(frameRequest);
                    frameRequest = 0;
                    frame.style.removeProperty("--wj-parallax-x");
                    frame.style.removeProperty("--wj-parallax-y");
                });
            });
        }

        // Add one-time entrance choreography only once the section is in view.
        // The CSS stays fully readable if JS or IntersectionObserver is unavailable.
        if ("IntersectionObserver" in window && !reducedMotion) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        root.classList.add("wj-tech--entered");
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.09 });
            observer.observe(root);
        }

        // Keep existing first selection; no navigation, hash writes or auto-scrolling.
        activate("iot", false);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeTechnologyTabs);
    } else {
        initializeTechnologyTabs();
    }
})();
