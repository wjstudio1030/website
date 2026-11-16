(() => {
  "use strict";

  function init() {
    const second = document.getElementById("wj-hero-repeat-1");
    const third = document.getElementById("wj-hero-repeat-2");
    if (!second || !third) return;

    const referenceTitle = document.querySelector(
      ".main__content.hero-text-animate h1"
    );
    const referenceButton = document.querySelector(
      ".main__content.hero-text-animate .main__btn span"
    );

    if (referenceTitle) {
      document.documentElement.style.setProperty(
        "--wj-same-tedx-font",
        getComputedStyle(referenceTitle).fontFamily
      );
    }

    if (referenceButton) {
      document.documentElement.style.setProperty(
        "--wj-same-tedx-button-font",
        getComputedStyle(referenceButton).fontFamily
      );
    }

    // 直接更新兩版文字，避免舊版結構或 CSS 干擾。
    [second,third].forEach((panel) => {
      const link = panel.querySelector(".wj-hero-photo__link");
      if (!link) return;

      let card = link.querySelector(".wj-highlight-card");
      if (!card) {
        card = document.createElement("div");
        card.className = "wj-highlight-card";
        link.appendChild(card);
      }

      card.removeAttribute("aria-hidden");
      card.innerHTML = `
        <h3 class="wj-highlight-card__title">
          <span class="wj-highlight-card__line">全國專題實作</span>
          <span class="wj-highlight-card__line">及創意競賽</span>
          <span class="wj-highlight-card__line wj-highlight-card__winner">專題組第一名</span>
        </h3>
        <span class="wj-highlight-card__button main__btn">
          <span>點擊觀看專題影片介紹</span>
        </span>
      `;
      link.setAttribute("aria-label","觀看專題影片介紹");
    });

    const thirdLink = third.querySelector(".wj-hero-photo__link");
    if (thirdLink) {
      thirdLink.href =
        "https://youtu.be/6aunKjcNDzI?t=23&si=GErR_sO0JwAzcmwa";
    }

    // 讓第三版使用第二版的實際 CSS。
    // 僅把 02_LEFT / 02_RIGHT 圖片名稱換成 03_LEFT / 03_RIGHT。
    const mirroredRules = [];

    function collect(rules,baseUrl) {
      const result = [];
      for (const rule of rules) {
        if (rule.type === CSSRule.STYLE_RULE &&
            rule.selectorText?.includes("#wj-hero-repeat-1")) {
          let content = rule.cssText
            .replaceAll("#wj-hero-repeat-1","#wj-hero-repeat-2")
            .replaceAll("WJ_HIGHLIGHT_02_LEFT.png","WJ_HIGHLIGHT_03_LEFT.png")
            .replaceAll("WJ_HIGHLIGHT_02_RIGHT.png","WJ_HIGHLIGHT_03_RIGHT.png")
            .replaceAll("WJ_HIGHLIGHT_02.png","WJ_HIGHLIGHT_03_LEFT.png");

          if (baseUrl) {
            content = content.replace(
              /url\(\s*(?:"([^"]+)"|'([^']+)'|([^)]+))\s*\)/g,
              (all,a,b,c) => {
                const value = (a || b || c).trim();
                if (value.startsWith("data:") || value.startsWith("#")) {
                  return all;
                }
                try {
                  return `url("${new URL(value,baseUrl).href}")`;
                } catch (_) {
                  return all;
                }
              }
            );
          }

          result.push(content);
        } else if (rule.cssRules &&
          (rule.type === CSSRule.MEDIA_RULE ||
           rule.type === CSSRule.SUPPORTS_RULE)) {
          const nested = collect(rule.cssRules,baseUrl);
          if (nested) {
            const kind = rule.type === CSSRule.MEDIA_RULE
              ? "@media" : "@supports";
            result.push(`${kind} ${rule.conditionText} { ${nested} }`);
          }
        }
      }
      return result.join("\n");
    }

    for (const sheet of [...document.styleSheets]) {
      if (sheet.ownerNode?.id === "wj-third-exact-photo-mirror") continue;
      try {
        const content = collect(sheet.cssRules,sheet.href);
        if (content) mirroredRules.push(content);
      } catch (_) {
        // 忽略無法存取的跨網域字型樣式。
      }
    }

    const oldMirror = document.getElementById(
      "wj-third-exact-photo-mirror"
    );
    oldMirror?.remove();

    const style = document.createElement("style");
    style.id = "wj-third-exact-photo-mirror";
    style.textContent = mirroredRules.join("\n");
    document.head.appendChild(style);

    // 第三版也沿用第二版的進場動畫觸發方式。
    third.classList.add("wj-second-photo-pending");

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
          third.classList.remove("wj-second-photo-pending");
          observer.disconnect();
        }
      },{threshold:0.06});
      observer.observe(third);
    } else {
      third.classList.remove("wj-second-photo-pending");
    }
  }

  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load",init,{once:true});
  }
})();