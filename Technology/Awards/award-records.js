/* WJ STUDIO | AWARD RECORDS
 * Changes only #wj-award-records. SVG files are loaded as images (no inline scripts).
 */
(() => {
  "use strict";

  function initAwardRecords() {
    const section = document.getElementById("wj-award-records");
    if (!section || section.dataset.wjawReady === "true") return;
    section.dataset.wjawReady = "true";

    const buttons = [...section.querySelectorAll(".wjaw-item[data-award]")];
    const paperImage = section.querySelector("#wjaw-image");
    const empty = section.querySelector("#wjaw-empty");
    const emptyPath = section.querySelector("#wjaw-empty-path");
    const emptyCount = section.querySelector(".wjaw-empty__top span");
    const captionYear = section.querySelector("#wjaw-selected-year");
    const captionTitle = section.querySelector("#wjaw-selected-title");
    const captionAward = section.querySelector("#wjaw-selected-award");
    const display = section.querySelector("#wjaw-display");

    if (!buttons.length || !paperImage || !empty) return;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false;
    let active = 0;
    let requestVersion = 0;

    const recordAt = i => {
      const b = buttons[i];
      return {
        year: b.querySelector(".wjaw-item__year").textContent.trim(),
        name: b.querySelector(".wjaw-item__name").textContent.trim(),
        honor: b.querySelector(".wjaw-item__honor").textContent.trim(),
        filename: "award-" + String(i + 1).padStart(2, "0") + ".svg"
      };
    };

    function select(index, fromClick = false) {
      if (index < 0 || index >= buttons.length) return;
      active = index;
      const version = ++requestVersion;
      const record = recordAt(index);
      const path = "images/award-records/" + record.filename;

      buttons.forEach((button, i) => {
        button.classList.toggle("is-active", i === index);
        button.setAttribute("aria-pressed", String(i === index));
      });

      captionYear.textContent = record.year;
      captionTitle.textContent = record.name;
      captionAward.textContent = record.honor;
      emptyPath.textContent = path;
      emptyCount.textContent = String(index + 1).padStart(2, "0") + " / " +
        String(buttons.length).padStart(2, "0");

      paperImage.hidden = true;
      paperImage.removeAttribute("src");
      empty.hidden = false;

      const imageProbe = new Image();
      imageProbe.onload = () => {
        if (version !== requestVersion) return;
        paperImage.src = imageProbe.src;
        paperImage.alt = record.year + " " + record.name + "，" + record.honor + "獎狀";
        paperImage.hidden = false;
        empty.hidden = true;
      };
      imageProbe.onerror = () => {
        if (version !== requestVersion) return;
        paperImage.hidden = true;
        empty.hidden = false;
      };
      imageProbe.src = new URL(path, document.baseURI).href;

      // On narrow displays the preview is below the list. Go there after a selection.
      if (fromClick && window.matchMedia("(max-width: 760px)").matches) {
        display.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start"
        });
      }
    }

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => select(index, true));
      button.addEventListener("keydown", event => {
        let next = null;
        if (event.key === "ArrowDown") next = (index + 1) % buttons.length;
        if (event.key === "ArrowUp") next = (index + buttons.length - 1) % buttons.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = buttons.length - 1;
        if (next !== null) {
          event.preventDefault();
          buttons[next].focus();
          select(next, false);
        }
      });
    });

    select(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAwardRecords, { once: true });
  } else {
    initAwardRecords();
  }
})();