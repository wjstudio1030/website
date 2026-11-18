(() => {
  "use strict";
  const STYLE_ID = "wj-mobile-refinement-20261118-style";
  const CSS = "\n/* Mobile refinement: only phone/touch behavior; desktop remains unchanged. */\n@media screen and (max-width:960px) {\n  /* 3 nav choices, not the obsolete four-choice half-screen menu. */\n  html body .navbar .navbar__menu {\n    height:auto!important;\n    min-height:0!important;\n    max-height:calc(100dvh - 80px)!important;\n    padding:15px 0 20px!important;\n    justify-content:flex-start!important;\n    overflow-y:auto!important;\n  }\n  html body .navbar .navbar__menu > .navbar__item {\n    height:53px!important;\n    min-height:53px!important;\n    width:100%!important;\n  }\n  html body .navbar .navbar__menu > .navbar__btn {\n    height:54px!important;\n    min-height:54px!important;\n    width:100%!important;\n    padding:5px 20px 0!important;\n  }\n  html body .navbar .navbar__menu > .navbar__btn > .button {\n    display:flex!important;\n    justify-content:center!important;\n    align-items:center!important;\n    width:min(300px,100%)!important;\n    min-height:45px!important;\n    height:45px!important;\n    margin:0 auto!important;\n  }\n}\n/* Memories heading: larger and balanced, only on phones. */\n@media screen and (max-width:760px) {\n  html body#memories-page #story-chapters > h1 {\n    font-size:clamp(27px,7.15vw,36px)!important;\n    line-height:1.4!important;\n    letter-spacing:.012em!important;\n    max-width:calc(100% - 24px)!important;\n    margin-inline:auto!important;\n  }\n  /* 05: establish real flex spacing. Do not squeeze icon into a 66px box. */\n  html body #wj-technology #wj-tech-tab-xr.wj-tech__tab {\n    display:flex!important;\n    flex-direction:row!important;\n    align-items:center!important;\n    justify-content:flex-start!important;\n    min-width:0!important;\n    gap:9px!important;\n    padding:13px 11px!important;\n  }\n  html body #wj-technology #wj-tech-tab-xr .wj-tech__tab-top {\n    display:flex!important;\n    flex:0 0 auto!important;\n    width:max-content!important;\n    min-width:max-content!important;\n    gap:12px!important;\n    justify-content:flex-start!important;\n    align-items:center!important;\n  }\n  html body #wj-technology #wj-tech-tab-xr .wj-tech__tab-index {\n    flex:0 0 auto!important;\n    font-size:10px!important;\n  }\n  html body #wj-technology #wj-tech-tab-xr .wj-tech__tab-icon {\n    width:36px!important;\n    height:36px!important;\n    flex:0 0 36px!important;\n    font-size:17px!important;\n  }\n  html body #wj-technology #wj-tech-tab-xr .wj-tech__tab-label {\n    display:inline-flex!important;\n    flex:1 1 auto!important;\n    min-width:0!important;\n    width:auto!important;\n    align-items:center!important;\n    justify-content:flex-start!important;\n    margin:0 0 0 5px!important;\n    font-size:clamp(11px,3.3vw,15px)!important;\n    letter-spacing:-.045em!important;\n    line-height:1.35!important;\n    white-space:nowrap!important;\n    word-break:keep-all!important;\n    overflow-wrap:normal!important;\n  }\n  html body #wj-technology #wj-tech-tab-xr .wj-tech__tab-arrow {\n    display:inline-block!important;\n    margin-left:6px!important;\n    flex:0 0 auto!important;\n    font-size:15px!important;\n  }\n  /* Second and third highlight titles: larger, bright white edging as desktop. */\n  html body #wj-hero-repeat-1.wj-hero-photo .wj-highlight-card__title {\n    font-size:clamp(29px,7.5vw,38px)!important;\n    line-height:1.13!important;\n  }\n  html body #wj-hero-repeat-2.wj-hero-photo .wj-highlight-card__title {\n    font-size:clamp(23px,6.25vw,31px)!important;\n    line-height:1.14!important;\n  }\n  html body #wj-hero-repeat-1 .wj-highlight-card__line,\n  html body #wj-hero-repeat-2 .wj-highlight-card__line {\n    -webkit-text-stroke:.72px rgba(255,255,255,.97)!important;\n    paint-order:stroke fill;\n    text-shadow:\n      -1px -1px 0 rgba(255,255,255,.88),\n      1px -1px 0 rgba(255,255,255,.88),\n      -1px 1px 0 rgba(255,255,255,.88),\n      1px 1px 0 rgba(255,255,255,.88),\n      0 0 13px rgba(255,255,255,.96),\n      0 3px 9px rgba(0,0,0,.68)!important;\n  }\n  html body #wj-hero-repeat-1 .wj-highlight-card__line--red {\n    color:#c40a2e!important;\n    -webkit-text-fill-color:#c40a2e!important;\n  }\n  html body #wj-hero-repeat-2 .wj-highlight-card__line--yellow {\n    color:#ffd83d!important;\n    -webkit-text-fill-color:#ffd83d!important;\n    margin-top:.16em!important;\n  }\n  /* Third photo's pseudo layer was zooming from scale(1.15) to 1:\n     that animated photo differs from the correctly left-cropped first frame. */\n  html body #wj-hero-repeat-2.wj-hero-photo {\n    background-image:url(\"images/WJ_HIGHLIGHT_03_LEFT.png\")!important;\n    background-size:cover!important;\n    background-position:5% center!important;\n    background-repeat:no-repeat!important;\n  }\n  html body #wj-hero-repeat-2.wj-hero-photo::before {\n    display:block!important;\n    opacity:1!important;\n    transform:none!important;\n    animation:none!important;\n    animation-play-state:running!important;\n    background-image:\n      linear-gradient(to right,rgba(20,20,20,.12),rgba(20,20,20,.18)),\n      url(\"images/WJ_HIGHLIGHT_03_LEFT.png\")!important;\n    background-size:100% 100%,cover!important;\n    background-position:center,5% center!important;\n    background-repeat:no-repeat!important;\n  }\n  html body #wj-hero-repeat-2.wj-hero-photo::after {\n    display:none!important;\n    animation:none!important;\n  }\n}\n/* Small phones: keep all 05 content in one row without overlapping the icon. */\n@media screen and (max-width:359px) {\n  html body #wj-technology #wj-tech-tab-xr.wj-tech__tab {\n    gap:5px!important;\n    padding-inline:7px!important;\n  }\n  html body #wj-technology #wj-tech-tab-xr .wj-tech__tab-top {\n    gap:7px!important;\n  }\n  html body #wj-technology #wj-tech-tab-xr .wj-tech__tab-label {\n    margin-left:2px!important;\n    font-size:10.5px!important;\n  }\n  html body #wj-technology #wj-tech-tab-xr .wj-tech__tab-arrow {\n    margin-left:3px!important;\n    font-size:13px!important;\n  }\n}\n/* A phone tap reveals the decorative custom cursor briefly, then softly fades it.\n   Native browser clicking, scrolling and links remain unaffected. */\n@media (hover:none) and (pointer:coarse) {\n  html body .cursor,\n  html body .cursor-follower {\n    opacity:0!important;\n    visibility:visible!important;\n    pointer-events:none!important;\n    transition:opacity .6s ease,transform .24s ease!important;\n  }\n  html body.wj-touch-cursor-flash .cursor,\n  html body.wj-touch-cursor-flash .cursor-follower {\n    display:block!important;\n    opacity:1!important;\n  }\n}\n";

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const tag = document.createElement("style");
    tag.id = STYLE_ID;
    tag.textContent = CSS + "\n/* Follow-up mobile dropdown alignment and Toy Doctor position. */\n@media screen and (max-width:960px) {\n  html body .navbar .navbar__menu,\n  html body .navbar .navbar__menu.active {\n    height:auto!important;\n    min-height:0!important;\n    padding:0 0 13px!important;\n    margin:0!important;\n    gap:0!important;\n    align-items:center!important;\n    justify-content:flex-start!important;\n  }\n  html body .navbar .navbar__menu > .navbar__item {\n    display:flex!important;\n    flex:0 0 46px!important;\n    width:min(300px,calc(100% - 40px))!important;\n    height:46px!important;\n    min-height:46px!important;\n    padding:0!important;\n    margin:0!important;\n    align-items:center!important;\n    justify-content:flex-start!important;\n  }\n  html body .navbar .navbar__menu > .navbar__item > .navbar__links {\n    width:100%!important;\n    height:100%!important;\n    margin:0!important;\n    padding:0!important;\n    text-align:left!important;\n    justify-content:flex-start!important;\n  }\n  html body .navbar .navbar__menu > .navbar__btn {\n    flex:0 0 54px!important;\n    height:54px!important;\n    min-height:54px!important;\n    width:100%!important;\n    padding:5px 20px 0!important;\n    margin:0!important;\n  }\n  html body .navbar .navbar__menu > .navbar__btn > .button {\n    width:min(300px,100%)!important;\n    margin:0 auto!important;\n  }\n}\n@media screen and (max-width:760px) {\n  html body #wj-hero-repeat-2.wj-hero-photo .wj-highlight-card {\n    top:59%!important;\n    transform:translateY(-50%)!important;\n  }\n}\n" + "\n/* Three-item mobile menu: button hugs text; all three items share left edge. */\n@media screen and (max-width:960px) {\n  html body .navbar .navbar__menu > .navbar__item,\n  html body .navbar .navbar__menu > .navbar__btn {\n    width:min(300px,calc(100% - 40px))!important;\n    max-width:calc(100% - 40px)!important;\n  }\n  html body .navbar .navbar__menu > .navbar__btn {\n    display:flex!important;\n    justify-content:flex-start!important;\n    align-items:center!important;\n    padding:5px 0 0!important;\n    margin:0!important;\n  }\n  html body .navbar .navbar__menu > .navbar__btn > .button {\n    display:inline-flex!important;\n    flex:0 0 auto!important;\n    width:max-content!important;\n    min-width:0!important;\n    max-width:100%!important;\n    height:45px!important;\n    min-height:45px!important;\n    padding:10px 16px!important;\n    margin:0!important;\n    justify-content:center!important;\n    align-items:center!important;\n    white-space:nowrap!important;\n  }\n}\n";
    tag.textContent += "\n@media screen and (max-width:960px) {\n  /* Center the three-item menu as a group, keeping a shared left edge. */\n  html body .navbar .navbar__menu,\n  html body .navbar .navbar__menu.active {\n    display:grid!important;\n    grid-template-columns:max-content!important;\n    grid-auto-rows:auto!important;\n    justify-content:center!important;\n    justify-items:start!important;\n    align-content:start!important;\n    align-items:stretch!important;\n    column-gap:0!important;\n    row-gap:0!important;\n  }\n  html body .navbar .navbar__menu > .navbar__item,\n  html body .navbar .navbar__menu > .navbar__btn {\n    display:flex!important;\n    width:100%!important;\n    min-width:0!important;\n    max-width:none!important;\n    justify-self:stretch!important;\n    justify-content:flex-start!important;\n    align-items:center!important;\n    box-sizing:border-box!important;\n  }\n  html body .navbar .navbar__menu > .navbar__item > .navbar__links {\n    text-align:left!important;\n    justify-content:flex-start!important;\n    padding-left:0!important;\n  }\n  html body .navbar .navbar__menu > .navbar__btn {\n    padding:5px 0 0!important;\n  }\n  html body .navbar .navbar__menu > .navbar__btn > .button {\n    display:inline-flex!important;\n    flex:0 0 auto!important;\n    width:max-content!important;\n    max-width:none!important;\n    margin:0!important;\n    padding:10px 16px!important;\n    white-space:nowrap!important;\n  }\n}\n";
    document.head.appendChild(tag);
  }

  function installTouchCursor() {
    const supported = window.matchMedia("(hover:none) and (pointer:coarse)");
    if (!supported.matches) return;
    const dot = document.querySelector(".cursor");
    const ring = document.querySelector(".cursor-follower");
    if (!dot || !ring || document.body.dataset.wjTapCursor) return;
    document.body.dataset.wjTapCursor = "1";

    let fadeTimer = 0;
    let startX = 0;
    let startY = 0;

    const hide = () => document.body.classList.remove("wj-touch-cursor-flash");
    const show = (x, y) => {
      window.clearTimeout(fadeTimer);
      startX = x;
      startY = y;
      for (const element of [dot, ring]) {
        element.style.left = x + "px";
        element.style.top = y + "px";
        element.style.transform = "translate(-50%, -50%) scale(1)";
      }
      dot.style.background = "#ff8177";
      ring.style.background = "transparent";
      ring.style.borderColor = "#ff8177";
      document.body.classList.add("wj-touch-cursor-flash");
      fadeTimer = window.setTimeout(hide, 380);
    };
    document.addEventListener("pointerdown", event => {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        show(event.clientX, event.clientY);
      }
    }, {passive:true, capture:true});
    document.addEventListener("pointermove", event => {
      if (event.pointerType !== "touch") return;
      if (Math.hypot(event.clientX - startX, event.clientY - startY) > 14) {
        window.clearTimeout(fadeTimer);
        hide();
      }
    }, {passive:true});
    document.addEventListener("pointercancel", hide, {passive:true});
  }

  function setDoctorMobileOffset() {
    if (!window.matchMedia("(max-width:760px)").matches) return;
    const card = document.querySelector("#wj-hero-repeat-2 .wj-highlight-card");
    if (!card) return;
    card.style.setProperty("top", "59%", "important");
    card.style.setProperty("transform", "translateY(-50%)", "important");
  }

  function init() {
    addStyle();
    installTouchCursor();
    setDoctorMobileOffset();
    window.addEventListener("resize", setDoctorMobileOffset, { passive: true });
  }
  // Register after the existing mobile layout's load handler, so this
  // mobile-only patch wins without editing any desktop styles.
  if (document.readyState === "complete") init();
  else window.addEventListener("load", init, {once:true});
})();
