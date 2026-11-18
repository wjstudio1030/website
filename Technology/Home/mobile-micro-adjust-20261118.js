(() => {
  "use strict";
  const ID = "wj-mobile-micro-adjust-style-20261118";
  if (!document.getElementById(ID)) {
    const style = document.createElement("style");
    style.id = ID;
    style.textContent = "\n@media screen and (max-width:760px) {\n  /* Category 05: same icon and label scale as 01-04, but one horizontal row. */\n  #wj-technology #wj-tech-tab-xr.wj-tech__tab {\n    display:flex!important;flex-direction:row!important;align-items:center!important;\n    justify-content:flex-start!important;gap:9px!important;\n    padding:13px 12px!important;min-width:0!important;\n  }\n  #wj-technology #wj-tech-tab-xr .wj-tech__tab-top {\n    display:flex!important;align-items:center!important;justify-content:flex-start!important;\n    width:70px!important;flex:0 0 70px!important;gap:10px!important;\n  }\n  #wj-technology #wj-tech-tab-xr .wj-tech__tab-index {\n    flex:0 0 auto!important;font-size:10px!important;\n  }\n  #wj-technology #wj-tech-tab-xr .wj-tech__tab-icon {\n    width:36px!important;height:36px!important;flex:0 0 36px!important;font-size:17px!important;\n  }\n  #wj-technology #wj-tech-tab-xr .wj-tech__tab-label {\n    display:inline-flex!important;align-items:center!important;justify-content:flex-start!important;\n    flex:1 1 auto!important;min-width:0!important;margin:0!important;\n    font-size:15px!important;font-weight:800!important;white-space:nowrap!important;\n    letter-spacing:-.02em!important;\n  }\n  #wj-technology #wj-tech-tab-xr .wj-tech__tab-arrow {\n    display:inline-block!important;flex:0 0 auto!important;\n    font-size:14px!important;margin-left:6px!important;\n  }\n  /* All IoT project selector labels increase slightly, but cannot wrap. */\n  #wj-technology #wj-tech-panel-iot .iotx-option {\n    gap:3px!important;padding:10px 7px!important;min-width:0!important;\n  }\n  #wj-technology #wj-tech-panel-iot .iotx-option-name {\n    font-size:clamp(11px,3vw,12px)!important;\n    letter-spacing:-.045em!important;white-space:nowrap!important;\n    line-height:1.35!important;word-break:keep-all!important;\n  }\n  #wj-technology #wj-tech-panel-iot .iotx-option-num {\n    font-size:10px!important;\n  }\n  /* Certificate placeholder always centers inside the paper itself. */\n  #wj-award-records .wjaw-empty {position:absolute!important;inset:0!important;}\n  #wj-award-records .wjaw-empty__center {\n    position:absolute!important;left:50%!important;top:50%!important;\n    width:calc(100% - 42px)!important;max-width:300px!important;\n    transform:translate(-50%,-50%)!important;\n    display:flex!important;flex-direction:column!important;\n    align-items:center!important;justify-content:center!important;\n    gap:13px!important;margin:0!important;\n    text-align:center!important;\n  }\n  /* Mobile-only heading labels remain on top of the photograph, at vertical center. */\n  html body #wj-hero-repeat-1.wj-hero-photo .wj-highlight-card,\n  html body #wj-hero-repeat-2.wj-hero-photo .wj-highlight-card {\n    top:50%!important;transform:translateY(-50%)!important;\n    margin:0!important;\n  }\n  /* Third image cropping favors its left-side subject instead of the right. */\n  html body #wj-hero-repeat-2.wj-hero-photo {\n    background-position:6% center!important;\n  }\n  html body #wj-hero-repeat-2.wj-hero-photo::before {\n    background-position:center,6% center!important;\n  }\n}\n@media screen and (max-width:400px) {\n  /* Other 01-04 field categories are 13px in this viewport too. */\n  #wj-technology #wj-tech-tab-xr .wj-tech__tab-label {\n    font-size:13px!important;letter-spacing:-.04em!important;\n  }\n  #wj-technology #wj-tech-tab-xr .wj-tech__tab-top {\n    width:66px!important;flex-basis:66px!important;gap:8px!important;\n  }\n  #wj-technology #wj-tech-tab-xr.wj-tech__tab {\n    gap:6px!important;padding-left:9px!important;padding-right:9px!important;\n  }\n}\n";
    document.head.appendChild(style);
  }

  const phone = () => window.matchMedia("(max-width: 760px)").matches;

  function syncRegistration() {
    const button = document.getElementById("wjcourse-submit");
    if (!button || !button.textContent.includes("SUBMIT REGISTRATION")) return;
    const desired = phone()
      ? "SUBMIT REGISTRATION\n送出報名"
      : "SUBMIT REGISTRATION / 送出報名";
    if (button.textContent !== desired) button.textContent = desired;
  }

  function syncHighlights() {
    for (const id of ["wj-hero-repeat-1", "wj-hero-repeat-2"]) {
      const card = document.querySelector("#" + id + " .wj-highlight-card");
      if (!card) continue;
      if (phone()) {
        card.style.setProperty("top", "50%", "important");
        card.style.setProperty("transform", "translateY(-50%)", "important");
      } else {
        card.style.removeProperty("transform");
        // Restore desktop position only where a previous highlighter set inline values.
        if (id === "wj-hero-repeat-2") card.style.setProperty("top", "5.4%", "important");
        else card.style.removeProperty("top");
      }
    }
  }

  function init() {
    const button = document.getElementById("wjcourse-submit");
    if (button) {
      const observer = new MutationObserver(syncRegistration);
      observer.observe(button, { childList:true, subtree:true, characterData:true });
    }
    const apply = () => { syncRegistration(); syncHighlights(); };
    apply();
    window.addEventListener("resize", apply, { passive:true });
    // Previous highlight code runs on page load; allow its initial DOM pass to settle.
    requestAnimationFrame(apply);
  }

  if (document.readyState === "complete") init();
  else window.addEventListener("load", init, { once:true });
})();
