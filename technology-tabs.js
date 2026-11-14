// WJ Academy / HOME five-field static tab switcher.
// Deliberately isolated from the existing app.js and TEDx stage engine.
(function () {
    "use strict";
    function initializeTechnologyTabs() {
        var root = document.getElementById("wj-technology");
        if (!root) return;

        var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"][data-field]'));
        var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"][data-field-panel]'));

        function activate(field, focus) {
            var selectedTab = null;
            tabs.forEach(function (tab) {
                var selected = tab.getAttribute("data-field") === field;
                tab.setAttribute("aria-selected", selected ? "true" : "false");
                tab.setAttribute("tabindex", selected ? "0" : "-1");
                if (selected) selectedTab = tab;
            });
            panels.forEach(function (panel) {
                var selected = panel.getAttribute("data-field-panel") === field;
                panel.hidden = !selected;
            });
            if (focus && selectedTab) selectedTab.focus();
        }

        tabs.forEach(function (tab, index) {
            tab.addEventListener("click", function () {
                activate(tab.getAttribute("data-field"), false);
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
        });
        activate("iot", false);
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeTechnologyTabs);
    } else initializeTechnologyTabs();
})();
