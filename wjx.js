(function () {
  "use strict";
  function initExperience() {
    const root = document.getElementById("wj-experience");
    if (!root) return;
    const ids = ["founder", "tedx", "award", "toy"];
    const accents = { founder: "#68dcff", tedx: "#ff698c", award: "#f3d48d", toy: "#87eac8" };
    const tabs = Array.from(root.querySelectorAll("[data-wjx-identity]"));
    const panels = Array.from(root.querySelectorAll(".wjx-panel"));
    const skills = Array.from(root.querySelectorAll("[data-wjx-skill]"));
    const visuals = Array.from(root.querySelectorAll("[data-wjx-visual]"));
    const counter = root.querySelector(".wjx-counter");
    const bars = Array.from(root.querySelectorAll(".wjx-progress i"));
    const founderStage = root.querySelector(".wjx-founder-inner");
    let activeId = "founder";
    let activeSkill = "iot";
    let effectTimer = null;
    let sceneTimer = null;

    function chooseIdentity(id, focusTab) {
      if (!ids.includes(id)) return;
      activeId = id;
      root.style.setProperty("--wx", accents[id]);
      tabs.forEach(function (tab) {
        const selected = tab.dataset.wjxIdentity === id;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (selected && focusTab) tab.focus();
      });
      panels.forEach(function (panel) {
        const selected = panel.dataset.id === id;
        panel.classList.toggle("is-active", selected);
        panel.setAttribute("aria-hidden", String(!selected));
        panel.classList.remove("wjx-fired");
      });
      const index = ids.indexOf(id);
      counter.textContent = String(index + 1).padStart(2, "0") + " / 04";
      bars.forEach(function (bar, i) { bar.classList.toggle("is-active", i === index); });
      if (sceneTimer) clearTimeout(sceneTimer);
      if (id === "award") sceneTimer = setTimeout(function () { playPanel(id); }, 360);
    }

    function chooseSkill(skill, focusButton) {
      if (!["iot", "game", "web", "ai", "vr", "ar"].includes(skill)) return;
      activeSkill = skill;
      skills.forEach(function (btn) {
        const selected = btn.dataset.wjxSkill === skill;
        btn.setAttribute("aria-pressed", String(selected));
        if (selected && focusButton) btn.focus();
      });
      visuals.forEach(function (visual) {
        const selected = visual.dataset.wjxVisual === skill;
        visual.classList.toggle("is-active", selected);
        visual.setAttribute("aria-hidden", String(!selected));
        visual.classList.remove("wjx-fired");
      });
    }

    function replay(element, milliseconds) {
      if (!element) return;
      element.classList.remove("wjx-fired");
      void element.offsetWidth;
      element.classList.add("wjx-fired");
      if (effectTimer) clearTimeout(effectTimer);
      effectTimer = setTimeout(function () { element.classList.remove("wjx-fired"); }, milliseconds || 1250);
    }

    function playPanel(id) {
      replay(root.querySelector('.wjx-panel[data-id="' + id + '"]'), 1450);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { chooseIdentity(tab.dataset.wjxIdentity, false); });
      tab.addEventListener("keydown", function (event) {
        let targetIndex = null;
        if (event.key === "ArrowDown" || event.key === "ArrowRight") targetIndex = (i + 1) % tabs.length;
        if (event.key === "ArrowUp" || event.key === "ArrowLeft") targetIndex = (i - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") targetIndex = 0;
        if (event.key === "End") targetIndex = tabs.length - 1;
        if (targetIndex !== null) {
          event.preventDefault();
          chooseIdentity(ids[targetIndex], true);
        }
      });
    });
    skills.forEach(function (button) {
      button.addEventListener("click", function () {
        if (button.dataset.wjxSkill === activeSkill) {
          replay(root.querySelector('.wjx-skill-visual[data-wjx-visual="' + activeSkill + '"]'), 1000);
        } else chooseSkill(button.dataset.wjxSkill, false);
      });
    });
    founderStage.addEventListener("click", function () {
      replay(root.querySelector('.wjx-skill-visual[data-wjx-visual="' + activeSkill + '"]'), 1000);
    });
    founderStage.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        replay(root.querySelector('.wjx-skill-visual[data-wjx-visual="' + activeSkill + '"]'), 1000);
      }
    });
    root.querySelectorAll(".wjx-shards span").forEach(function (particle, i) {
      const angle = (i / 15) * Math.PI * 2;
      const distance = 120 + (i % 4) * 27;
      particle.style.setProperty("--wjx-x", Math.round(Math.cos(angle) * distance) + "px");
      particle.style.setProperty("--wjx-y", Math.round(Math.sin(angle) * distance - 25) + "px");
    });
    root.querySelectorAll("[data-wjx-action]").forEach(function (button) {
      button.addEventListener("click", function () { playPanel(button.dataset.wjxAction); });
    });

    // Keep pointer-based parallax confined to this newly inserted gallery.
    let pointerFrame = 0;
    root.querySelector(".wjx-pavilion").addEventListener("pointermove", function (event) {
      if (activeId !== "founder" || (event.pointerType && event.pointerType !== "mouse")) return;
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      const stage = founderStage.getBoundingClientRect();
      const dx = (event.clientX - stage.left) / stage.width - 0.5;
      const dy = (event.clientY - stage.top) / stage.height - 0.5;
      if (Math.abs(dx) > 0.55 || Math.abs(dy) > 0.55) return;
      pointerFrame = requestAnimationFrame(function () {
        const graphic = root.querySelector(".wjx-skill-visual.is-active svg");
        if (graphic) graphic.style.transform = "translate(" + (dx * 11).toFixed(1) + "px," + (dy * 9).toFixed(1) + "px)";
      });
    });
    founderStage.addEventListener("pointerleave", function () {
      const graphic = root.querySelector(".wjx-skill-visual.is-active svg");
      if (graphic) graphic.style.transform = "";
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { root.classList.add("wjx-visible"); observer.disconnect(); }
        });
      }, { threshold: 0.12 });
      observer.observe(root);
    } else root.classList.add("wjx-visible");
    chooseIdentity("founder", false);
    chooseSkill("iot", false);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initExperience);
  else initExperience();
})();