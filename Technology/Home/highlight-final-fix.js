(() => {
  "use strict";

  const configs = [
    {
      id: "wj-hero-repeat-1",
      url: "https://youtu.be/I1szLiooi54?si=7QijaA-sFcB4cqFG",
      kind: "award",
      lines: [
        ["全國專題實作", "black"],
        ["及創意競賽", "black"],
        ["專題組第一名", "red"]
      ],
      button: "點擊觀看專題影片介紹"
    },
    {
      id: "wj-hero-repeat-2",
      url: "https://youtu.be/6aunKjcNDzI?t=23&si=GErR_sO0JwAzcmwa",
      kind: "doctor",
      lines: [
        ["玩具醫生南投站副院長", "black"],
        ["創辦組織培訓玩具醫生", "yellow"]
      ],
      button: "點擊觀看成果展新聞採訪"
    }
  ];

  const colors = {
    black: "#101010",
    red: "#c40a2e",
    yellow: "#ffd83d"
  };

  function installStyles() {
    document.getElementById("wj-highlight-final-fix-style")?.remove();

    const tedxHeading = document.querySelector(
      ".main__content.hero-text-animate h1"
    );

    const tedxButton = document.querySelector(
      ".main__content.hero-text-animate .main__btn span"
    );

    if (tedxHeading) {
      document.documentElement.style.setProperty(
        "--wj-highlight-title-font",
        getComputedStyle(tedxHeading).fontFamily
      );
    }

    if (tedxButton) {
      document.documentElement.style.setProperty(
        "--wj-highlight-button-font",
        getComputedStyle(tedxButton).fontFamily
      );
    }

    const style = document.createElement("style");
    style.id = "wj-highlight-final-fix-style";
    style.textContent = `
      @media (min-width: 961px) {
        body #wj-hero-repeat-1 .wj-highlight-card,
        body #wj-hero-repeat-2 .wj-highlight-card {
          position: absolute !important;
          z-index: 5 !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          max-width: none !important;
          pointer-events: none !important;
          background: transparent !important;
        }

        body #wj-hero-repeat-1 .wj-highlight-card {
          top: 5.2% !important;
          left: 35.8% !important;
          width: min(500px,26vw) !important;
        }

        /* 第三版整組往右移 */
        body #wj-hero-repeat-2 .wj-highlight-card {
          top: 5.4% !important;
          left: 23% !important;
          width: 37% !important;
        }

        body #wj-hero-repeat-1 .wj-highlight-card__title,
        body #wj-hero-repeat-2 .wj-highlight-card__title {
          display: block !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          font-family: var(
            --wj-highlight-title-font,
            "Noto Sans TC",sans-serif
          ) !important;
          font-weight: 800 !important;
          line-height: 1.1 !important;
          letter-spacing: 0 !important;
        }

        body #wj-hero-repeat-1 .wj-highlight-card__title {
          font-size: clamp(36px,3.25vw,58px) !important;
        }

        body #wj-hero-repeat-2 .wj-highlight-card__title {
          font-size: clamp(34px,2.9vw,52px) !important;
        }

        body #wj-hero-repeat-1 .wj-highlight-card__line,
        body #wj-hero-repeat-2 .wj-highlight-card__line {
          display: block !important;
          white-space: nowrap !important;
          background: none !important;
        }

        body #wj-hero-repeat-1 .wj-highlight-card__line--black,
        body #wj-hero-repeat-2 .wj-highlight-card__line--black {
          color: #101010 !important;
          -webkit-text-fill-color: #101010 !important;
          text-shadow:
            0 2px 2px white,
            0 0 13px rgba(255,255,255,.92),
            0 3px 10px rgba(0,0,0,.28) !important;
        }

        body #wj-hero-repeat-1 .wj-highlight-card__line--red {
          color: #c40a2e !important;
          -webkit-text-fill-color: #c40a2e !important;
          text-shadow:
            0 2px 2px white,
            0 0 13px rgba(255,255,255,.92),
            0 3px 10px rgba(0,0,0,.28) !important;
        }

        
        body #wj-hero-repeat-2 .wj-highlight-card__line--yellow {
          display: block !important;

          /* 與第一行相同的字體設定 */
          font-family: inherit !important;
          font-size: 1em !important;
          font-weight: inherit !important;
          line-height: inherit !important;

          /* 與第一行保留一點距離 */
          margin-top: 0.16em !important;

          /* 黃色文字 */
          color: #ffd83d !important;
          -webkit-text-fill-color: #ffd83d !important;

          /* 白色外框與柔和的白色光暈 */
          -webkit-text-stroke: 0.6px rgba(255,255,255,.95) !important;
          paint-order: stroke fill;

          text-shadow:
            0 0 12px rgba(255,255,255,.82),
            0 3px 9px rgba(0,0,0,.50) !important;
        }


        body #wj-hero-repeat-1 .wj-highlight-card__button.main__btn,
        body #wj-hero-repeat-2 .wj-highlight-card__button.main__btn {
          position: relative !important;
          display: inline-flex !important;
          justify-content: center !important;
          align-items: center !important;
          min-height: 64px !important;
          padding: 15px 18px !important;
          border: 0 !important;
          border-radius: 4px !important;
          background: linear-gradient(
            to top,#f77062,#fe5196
          ) !important;
          box-shadow: none !important;
          opacity: 1 !important;
          animation: none !important;
          overflow: hidden !important;
          pointer-events: auto !important;
          cursor: none !important;
          transform: none !important;
          filter: none !important;
          transition: transform .35s ease !important;
        }

        body #wj-hero-repeat-1 .wj-highlight-card__button.main__btn {
          width: 84% !important;
          margin: 22px 0 0 !important;
        }

        body #wj-hero-repeat-2 .wj-highlight-card__button.main__btn {
          width: 92% !important;
          margin: 28px 0 0 !important;
        }

        body #wj-hero-repeat-1 .wj-highlight-card__button.main__btn > span,
        body #wj-hero-repeat-2 .wj-highlight-card__button.main__btn > span {
          position: relative !important;
          z-index: 2 !important;
          color: white !important;
          -webkit-text-fill-color: white !important;
          font-family: var(
            --wj-highlight-button-font,
            "Noto Sans TC",sans-serif
          ) !important;
          font-size: clamp(16px,1.05vw,19px) !important;
          font-weight: 700 !important;
          white-space: nowrap !important;
          pointer-events: none !important;
        }

        /*
         * 重要：預設覆蓋層寬度為零。
         * 即使整張照片的 a:hover 生效，也不能讓按鈕變藍。
         */
        body #wj-hero-repeat-1.wj-hero-photo
        a.wj-hero-photo__link .wj-highlight-card__button.main__btn::after,
        body #wj-hero-repeat-2.wj-hero-photo
        a.wj-hero-photo__link .wj-highlight-card__button.main__btn::after {
          content: "" !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 0 !important;
          height: 100% !important;
          background: #4837ff !important;
          z-index: 1 !important;
          border-radius: 4px !important;
          transition: width .35s ease !important;
        }

        /*
         * 只有按鈕本身 :hover 才觸發動畫，
         * 不使用 a.wj-hero-photo__link:hover。
         */
        body #wj-hero-repeat-1.wj-hero-photo
        a.wj-hero-photo__link
        .wj-highlight-card__button.main__btn:hover::after,
        body #wj-hero-repeat-2.wj-hero-photo
        a.wj-hero-photo__link
        .wj-highlight-card__button.main__btn:hover::after {
          width: 100% !important;
        }

        body #wj-hero-repeat-1.wj-hero-photo
        a.wj-hero-photo__link
        .wj-highlight-card__button.main__btn:hover,
        body #wj-hero-repeat-2.wj-hero-photo
        a.wj-hero-photo__link
        .wj-highlight-card__button.main__btn:hover {
          transform: translateY(-2px) !important;
        }
      }

      /* 不顯示系統原生小手，保留網站自訂滑鼠 */
      body #wj-hero-repeat-1 a.wj-hero-photo__link,
      body #wj-hero-repeat-2 a.wj-hero-photo__link,
      body #wj-hero-repeat-1 a.wj-hero-photo__link *,
      body #wj-hero-repeat-2 a.wj-hero-photo__link * {
        cursor: none !important;
      }

      @media (max-width:960px) {
        #wj-hero-repeat-1 .wj-highlight-card,
        #wj-hero-repeat-2 .wj-highlight-card {
          display: none !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function makeCard(config) {
    const card = document.createElement("div");
    card.className = "wj-highlight-card";
    card.dataset.wjClean = "true";

    const title = document.createElement("h3");
    title.className = "wj-highlight-card__title";

    for (const [value, kind] of config.lines) {
      const line = document.createElement("span");

      line.className =
        "wj-highlight-card__line wj-highlight-card__line--" + kind;

      line.textContent = value;

      // 直接指定最高優先權，避免舊樣式把紅黃字蓋成黑色。
      line.style.setProperty("color", colors[kind], "important");
      line.style.setProperty(
        "-webkit-text-fill-color",
        colors[kind],
        "important"
      );
      line.style.setProperty(
        "background-image",
        "none",
        "important"
      );

      title.appendChild(line);
    }

    const button = document.createElement("span");
    button.className = "wj-highlight-card__button main__btn";

    const buttonText = document.createElement("span");
    buttonText.textContent = config.button;

    button.appendChild(buttonText);
    card.append(title, button);

    // 第三版位置使用 inline important，防止舊版 CSS 覆蓋。
    if (config.kind === "doctor") {
      const mobile = window.matchMedia("(max-width: 760px)").matches;
      card.style.setProperty("left", mobile ? "6%" : "23%", "important");
      card.style.setProperty("top", mobile ? "9%" : "5.4%", "important");
      card.style.setProperty("width", mobile ? "92%" : "37%", "important");
    }

    return card;
  }

  function ensurePanel(config) {
    const panel = document.getElementById(config.id);
    const link = panel?.querySelector("a.wj-hero-photo__link");

    if (!panel || !link) return;

    const cards = [...panel.querySelectorAll(".wj-highlight-card")];
    const buttons = panel.querySelectorAll(
      ".wj-highlight-card__button,.main__btn"
    );

    const existing = cards[0];

    const correct =
      cards.length === 1 &&
      buttons.length === 1 &&
      existing?.parentElement === link &&
      existing?.dataset.wjClean === "true" &&
      existing.textContent.includes(config.button) &&
      config.lines.every(([value]) =>
        existing.textContent.includes(value)
      );

    if (!correct) {
      const newCard = makeCard(config);

      // 一次清掉舊卡片與重複按鈕。
      link.replaceChildren(newCard);

      for (const el of panel.querySelectorAll(
        ".wj-highlight-card,.wj-highlight-card__button,.main__btn"
      )) {
        if (el !== newCard && !newCard.contains(el)) {
          el.remove();
        }
      }
    }

    if (link.href !== config.url) {
      link.href = config.url;
    }

    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", config.button);
    link.style.setProperty("cursor", "none", "important");
  }

  function installCursorBehavior() {
    const cursor = document.querySelector(".cursor");
    const follower = document.querySelector(".cursor-follower");

    if (!cursor || !follower) return;

    let wasInPanel = false;

    function applyColor(isBlue) {
      const color = isBlue ? "#00f2fe" : "#ff8177";
      const followerBackground = isBlue
        ? "rgba(0,242,254,.4)"
        : "rgba(247,112,98,.3)";

      cursor.style.background = color;
      follower.style.background = followerBackground;

      cursor.style.transform = isBlue
        ? "translate(-50%,-50%) scale(1.3)"
        : "translate(-50%,-50%) scale(1)";

      follower.style.transform = isBlue
        ? "translate(-50%,-50%) scale(1.5)"
        : "translate(-50%,-50%) scale(1)";

      follower.style.borderColor = isBlue
        ? "transparent"
        : "#ff8177";
    }

    // 使用 mousemove 判斷真正位於按鈕上的滑鼠。
    // 不再將整張照片判定成藍色互動區。
    window.addEventListener("mousemove", event => {
      const element = event.target instanceof Element
        ? event.target
        : null;

      const panel = element?.closest(
        "#wj-hero-repeat-1,#wj-hero-repeat-2"
      );

      if (!panel) {
        if (wasInPanel) {
          applyColor(false);
          wasInPanel = false;
        }
        return;
      }

      wasInPanel = true;

      const onButton = Boolean(
        element.closest(".wj-highlight-card__button.main__btn")
      );

      applyColor(onButton);
    }, { passive: true });
  }

  function initialize() {
    installStyles();

    for (const config of configs) {
      ensurePanel(config);
    }

    // Keep the mobile inline-important card coordinates in sync on rotation.
    const syncDoctorPosition = () => {
      const card = document.querySelector('#wj-hero-repeat-2 .wj-highlight-card[data-wj-clean="true"]');
      if (!card) return;
      const mobile = window.matchMedia("(max-width: 760px)").matches;
      card.style.setProperty("left", mobile ? "6%" : "23%", "important");
      card.style.setProperty("top", mobile ? "9%" : "5.4%", "important");
      card.style.setProperty("width", mobile ? "92%" : "37%", "important");
    };
    window.addEventListener("resize", syncDoctorPosition, { passive: true });
    installCursorBehavior();

    // 只有舊程式真的再次新增重複元素時才修復。
    // 不再每次 MutationObserver 觸發就重建按鈕。
    let scheduled = false;

    const observer = new MutationObserver(() => {
      if (scheduled) return;

      scheduled = true;

      requestAnimationFrame(() => {
        scheduled = false;

        for (const config of configs) {
          ensurePanel(config);
        }
      });
    });

    for (const config of configs) {
      const panel = document.getElementById(config.id);

      if (panel) {
        observer.observe(panel, {
          childList: true,
          subtree: true
        });
      }
    }
  }

  if (document.readyState === "complete") {
    initialize();
  } else {
    window.addEventListener("load", initialize, { once: true });
  }
})();