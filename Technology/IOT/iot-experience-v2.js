/* WJ IoT Experience V2
 * Four independent interaction systems.
 * Local-only. No external services or live sensors.
 */
(() => {
    "use strict";

    const panel = document.getElementById("wj-tech-panel-iot");
    const root = document.getElementById("iotv2-root");
    if (!panel || !root) return;

    const motion = !window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
    const finePointer = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches;

    const data = {
        voice: {
            index: "01",
            file: "IOT_p1.svg",
            title: "語音系統整合",
            en: "VOICE / PROCESSING PIPELINE",
            description: "STT → data processing → TTS 系統整合",
            alt: "語音辨識、資料處理及語音合成系統整合作品"
        },
        vision: {
            index: "02",
            file: "IOT_p2.svg",
            title: "辨識技術與數據分析",
            en: "PERCEPTION / DATA ANALYSIS",
            description: "辨識技術與互動測試，記錄動作協調，透過數據分析提供測試結果。",
            alt: "辨識技術、互動測試與數據分析作品"
        },
        home: {
            index: "03",
            file: "IOT_p3.svg",
            title: "AI虛擬人與智慧家電",
            en: "VIRTUAL AGENT / SMART HOME",
            description: "居家家電智能控制與虛擬對象互動",
            alt: "智慧家電控制與虛擬對象互動作品"
        },
        game: {
            index: "04",
            file: "IOT_p4.svg",
            title: "感知互動遊戲",
            en: "PERCEPTION / INTERACTIVE PLAY",
            description: "現實感知結合互動式遊戲。",
            alt: "現實感知與互動式遊戲作品"
        }
    };

    const css = String.raw`
#wj-technology #wj-tech-panel-iot.iotv2 {
    --iot-tone: #eeb59a;
    --iot-muted: #9894a2;
    display: block;
    padding: 0;
    min-height: 0;
    overflow: hidden;
    background: #15141a;
    border: 1px solid #ffffff27;
    border-radius: 17px;
    color: #f7f5fa;
    font-family: var(--font-main), sans-serif;
}
#wj-technology #wj-tech-panel-iot.iotv2[hidden] {
    display: none !important;
}
#wj-technology .iotx * { box-sizing: border-box; }
#wj-technology .iotx button {
    font: inherit;
    color: inherit;
    appearance: none;
    cursor: pointer;
}
#wj-technology .iotx button:focus-visible {
    outline: 2px solid white;
    outline-offset: 3px;
}
#wj-technology .iotx-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18px;
    padding: 19px 28px;
    background: #1b1921;
    border-bottom: 1px solid #ffffff17;
    color: #b5aeba;
    font: 600 10px/1.6 var(--font-tech), monospace;
    letter-spacing: .16em;
}
#wj-technology .iotx-top strong {
    color: #f1bca6;
    font-weight: 600;
}
#wj-technology .iotx-intro {
    padding: 23px 28px 16px;
}
#wj-technology .iotx-intro h3 {
    font-size: clamp(23px,2.8vw,40px);
    font-weight: 800;
    line-height: 1.35;
    margin: 0;
    letter-spacing: -.025em;
    color: white;
}
#wj-technology .iotx-intro p {
    font: 500 10px/1.8 var(--font-tech), monospace;
    letter-spacing: .16em;
    color: #9d94a5;
    margin-top: 8px;
}
#wj-technology .iotx-nav {
    padding: 10px 18px 23px;
    display: grid;
    grid-template-columns: repeat(4,minmax(0,1fr));
    gap: 9px;
}
#wj-technology .iotx-option {
    --line: #eeb59a;
    position: relative;
    display: flex;
    align-items: center;
    gap: 11px;
    text-align: left;
    padding: 15px 12px;
    min-height: 66px;
    border: 1px solid #ffffff1f;
    border-radius: 5px;
    background: #211e27;
    overflow: hidden;
    transition: background .22s ease,border-color .22s ease,transform .22s ease;
}
#wj-technology .iotx-option::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    width: 100%;
    background: var(--line);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform .3s cubic-bezier(.2,.8,.2,1);
}
#wj-technology .iotx-option[data-mode="voice"] { --line:#eeb59a; }
#wj-technology .iotx-option[data-mode="vision"] { --line:#93d4bd; }
#wj-technology .iotx-option[data-mode="home"] { --line:#d9bd82; }
#wj-technology .iotx-option[data-mode="game"] { --line:#b69bee; }
#wj-technology .iotx-option[aria-pressed="true"],
#wj-technology .iotx-option:hover {
    border-color: var(--line);
    background: #2d2831;
}
#wj-technology .iotx-option[aria-pressed="true"]::after,
#wj-technology .iotx-option:hover::after {
    transform: scaleX(1);
}
#wj-technology .iotx-option:hover { transform: translateY(-2px); }
#wj-technology .iotx-option-num {
    font: 650 11px var(--font-tech),monospace;
    color: var(--line);
}
#wj-technology .iotx-option-name {
    font-size: clamp(11px,1.05vw,15px);
    font-weight: 750;
    line-height: 1.45;
}
#wj-technology .iotx-option-symbol {
    margin-left: auto;
    color: var(--line);
    opacity: .7;
    font-size: 16px;
}
#wj-technology .iotx-workspace {
    --scene-color: #eeb59a;
    display: grid;
    grid-template-columns: minmax(0,1.67fr) minmax(290px,.87fr);
    gap: 0;
    background: #17161d;
    border-top: 1px solid #ffffff19;
}
#wj-technology .iotx-workspace[data-scene="vision"] { --scene-color:#93d4bd; }
#wj-technology .iotx-workspace[data-scene="home"] { --scene-color:#d9bd82; }
#wj-technology .iotx-workspace[data-scene="game"] { --scene-color:#b69bee; }
#wj-technology .iotx-visual {
    position: relative;
    padding: 16px;
    min-width: 0;
    background: #121319;
}
#wj-technology .iotx-screen {
    position: relative;
    height: clamp(430px,58svh,740px);
    min-width: 0;
    overflow: hidden;
    display: grid;
    place-items: center;
    background: radial-gradient(ellipse at 50% 45%,#30252b,#15141a 70%);
    border: 1px solid #ffffff21;
}
#wj-technology .iotx-workspace[data-scene="vision"] .iotx-screen {
    height: clamp(360px,52svh,650px);
    background: radial-gradient(ellipse at center,#1a302c,#10191a 75%);
}
#wj-technology .iotx-workspace[data-scene="home"] .iotx-screen {
    background: radial-gradient(ellipse at center,#332a21,#151618 76%);
}
#wj-technology .iotx-workspace[data-scene="game"] .iotx-screen {
    background: radial-gradient(ellipse at center,#29203b,#14131d 76%);
}
#wj-technology .iotx-screen::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(#ffffff09 1px,transparent 1px),
                linear-gradient(90deg,#ffffff09 1px,transparent 1px);
    background-size: 44px 44px;
    mask-image: radial-gradient(circle,#0006,transparent 83%);
}
#wj-technology .iotx-photo {
    display: block;
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    opacity: 0;
    transform: scale(.985);
    transition: opacity .36s ease,transform .5s ease;
    filter: drop-shadow(0 6px 25px #0005);
}
#wj-technology .iotx-photo.ready {
    opacity: 1;
    transform: scale(1);
}
#wj-technology .iotx-missing {
    position: absolute;
    z-index: 1;
    inset: 0;
    display: grid;
    align-content: center;
    justify-items: center;
    gap: 12px;
    color: #e9d8dc;
    text-align: center;
    padding: 24px;
    font: 500 12px/1.9 var(--font-tech),monospace;
}
#wj-technology .iotx-missing[hidden] { display: none; }
#wj-technology .iotx-missing b {
    font-size: 22px;
    letter-spacing: .05em;
    font-weight: 600;
}
#wj-technology .iotx-image-tag {
    position: absolute;
    z-index: 5;
    left: 21px;
    top: 21px;
    background: #17161dc9;
    border: 1px solid #ffffff35;
    padding: 8px 13px;
    color: #f4eee8;
    font: 600 9px var(--font-tech),monospace;
    letter-spacing: .13em;
}
#wj-technology .iotx-image-tag::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    background: var(--scene-color);
    margin-right: 9px;
}
#wj-technology .iotx-corner {
    position: absolute;
    z-index: 4;
    width: 25px;
    height: 25px;
    border: 1px solid var(--scene-color);
    opacity: .72;
    pointer-events: none;
}
#wj-technology .iotx-corner.a { left:13px;bottom:13px;border-top:0;border-right:0; }
#wj-technology .iotx-corner.b { right:13px;bottom:13px;border-top:0;border-left:0; }
#wj-technology .iotx-visual-bottom {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    padding: 13px 3px 0;
    font: 500 10px/1.7 var(--font-tech),monospace;
    letter-spacing: .11em;
    color: #aaa5af;
}
#wj-technology .iotx-visual-bottom span:first-child {color:#f2d0c0;}
#wj-technology .iotx-side {
    min-width: 0;
    padding: clamp(25px,2.8vw,44px);
    border-left: 1px solid #ffffff18;
    display: flex;
    flex-direction: column;
    background: linear-gradient(160deg,#25212b,#1b1a22 73%);
    position: relative;
    overflow: hidden;
}
#wj-technology .iotx-side::before {
    content: "";
    position: absolute;
    height: 2px;
    top: 0;
    left: 0;
    width: 48%;
    background: linear-gradient(90deg,var(--scene-color),transparent);
}
#wj-technology .iotx-side-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    font: 650 10px/1.5 var(--font-tech),monospace;
    letter-spacing: .09em;
    color: var(--scene-color);
}
#wj-technology .iotx-demo-label {
    border: 1px solid #ffffff27;
    padding: 6px 9px;
    font-size: 9px;
    color: #bab4be;
    border-radius: 3px;
}
#wj-technology .iotx-side h4 {
    margin: clamp(35px,5vh,64px) 0 13px;
    color: white;
    font-size: clamp(25px,2.45vw,40px);
    line-height: 1.3;
    letter-spacing: -.03em;
    font-weight: 800;
}
#wj-technology .iotx-side-description {
    color: #d5ced9;
    font-size: clamp(14px,1.15vw,17px);
    line-height: 1.9;
    min-height: 80px;
}
#wj-technology .iotx-rule {
    height: 1px;
    background: linear-gradient(90deg,var(--scene-color),#ffffff16 40%,transparent);
    margin: 25px 0 27px;
}
#wj-technology .iotx-demo[hidden] { display:none!important; }
#wj-technology .iotx-demo {
    min-height: 196px;
    margin-top: 0;
}
#wj-technology .iotx-demo-head {
    font: 650 10px/1.6 var(--font-tech),monospace;
    color: #b1aab9;
    letter-spacing: .1em;
    margin-bottom: 18px;
}
#wj-technology .iotx-side-foot {
    margin-top: auto;
    padding-top: 25px;
    color: #8a8492;
    font: 500 9px/1.8 var(--font-tech),monospace;
    letter-spacing: .09em;
}
#wj-technology .iotx-pipeline {
    display:flex;
    gap: 7px;
    align-items:center;
    justify-content:space-between;
    margin-bottom: 21px;
}
#wj-technology .iotx-pipeline span {
    min-width: 0;
    text-align:center;
    flex:1;
    padding:12px 3px;
    border:1px solid #ffffff26;
    color:#bdb2bc;
    background:#201b24;
    font:650 10px var(--font-tech),monospace;
}
#wj-technology .iotx-pipeline span.on {
    color:#ffe1d1;
    border-color:#eeb59a;
    box-shadow:inset 0 -2px 0 #eeb59a;
}
#wj-technology .iotx-pipeline em {
    color:#eeb59a;
    font-style:normal;
    font-size:12px;
}
#wj-technology .iotx-wave,
#wj-technology .iotx-chart {
    display:block;
    width:100%;
    height:116px;
    background:#15191e;
    border:1px solid #ffffff24;
}
#wj-technology .iotx-vision-metrics {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:8px;
    margin-bottom:15px;
}
#wj-technology .iotx-vision-metrics span {
    border-left:2px solid #93d4bd;
    background:#1a2728;
    padding:10px;
    font:600 10px/1.8 var(--font-tech),monospace;
    color:#c7e3d8;
}
#wj-technology .iotx-home-controls {
    display:grid;
    gap:9px;
}
#wj-technology .iotx-home-button {
    width:100%;
    display:flex;
    justify-content:space-between;
    gap:10px;
    align-items:center;
    padding:13px 15px;
    text-align:left;
    border:1px solid #ffffff26;
    background:#28251f;
    font:600 12px var(--font-tech),monospace;
}
#wj-technology .iotx-home-button[aria-pressed="true"] {
    border-color:#d9bd82;
    background:#393223;
}
#wj-technology .iotx-home-button b {
    font-size:10px;
    letter-spacing:.08em;
    color:#a39c8e;
}
#wj-technology .iotx-home-button[aria-pressed="true"] b { color:#f6dca3; }
#wj-technology .iotx-home-status {
    margin-top:13px;
    color:#d9bd82;
    font:600 10px var(--font-tech),monospace;
}
#wj-technology .iotx-game-board {
    position:relative;
    height:158px;
    overflow:hidden;
    border:1px solid #ffffff27;
    background:
        radial-gradient(circle at center,#4e3b6540,transparent 60%),
        repeating-radial-gradient(circle at center,transparent 0 29px,#b69bee24 30px 31px);
}
#wj-technology .iotx-beacon {
    position:absolute;
    width:29px;
    height:29px;
    border-radius:50%;
    border:1px solid #b69bee;
    background:#b69bee24;
    display:grid;
    place-items:center;
    transition:transform .18s ease,background .18s ease;
}
#wj-technology .iotx-beacon::after {
    content:"";
    width:7px;
    height:7px;
    background:#d6c4ff;
    border-radius:50%;
}
#wj-technology .iotx-beacon:nth-child(1) { left:16%;top:22%; }
#wj-technology .iotx-beacon:nth-child(2) { left:68%;top:18%; }
#wj-technology .iotx-beacon:nth-child(3) { left:38%;top:62%; }
#wj-technology .iotx-beacon:nth-child(4) { left:81%;top:69%; }
#wj-technology .iotx-beacon:hover {transform:scale(1.17);}
#wj-technology .iotx-beacon.hit {background:#b69bee;opacity:.55;}
#wj-technology .iotx-game-foot {
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-top:12px;
    font:600 11px var(--font-tech),monospace;
    color:#c8b5f5;
}
#wj-technology .iotx-reset {
    border:1px solid #b69bee7f;
    padding:7px 10px;
    background:transparent;
    font-size:10px!important;
}
#wj-technology .iotx-vision-frame {
    display:none;
    position:absolute;
    z-index:3;
    left:17%;
    top:25%;
    width:39%;
    height:38%;
    border:1px solid #93d4bd;
    pointer-events:none;
    box-shadow:0 0 0 800px #08141303;
}
#wj-technology .iotx-workspace[data-scene="vision"] .iotx-vision-frame {
    display:block;
    animation:iotxTrack 5.4s cubic-bezier(.35,0,.65,1) infinite alternate;
}
#wj-technology .iotx-vision-frame::after {
    content:"DEMO TRACK";
    position:absolute;
    left:-1px;
    top:-23px;
    padding:4px 7px;
    background:#172724d9;
    color:#b0eed8;
    font:600 9px var(--font-tech),monospace;
}
#wj-technology .iotx-scanline {
    display:none;
    position:absolute;
    z-index:3;
    left:0;
    right:0;
    top:0;
    height:1px;
    background:linear-gradient(90deg,transparent,#93d4bd,transparent);
    box-shadow:0 0 20px #93d4bd8c;
    pointer-events:none;
}
#wj-technology .iotx-workspace[data-scene="vision"] .iotx-scanline {
    display:block;
    animation:iotxScan 5.5s linear infinite;
}
#wj-technology .iotx-voice-bars {
    display:none;
    position:absolute;
    right:24px;
    bottom:25px;
    z-index:3;
    gap:4px;
    align-items:end;
    height:40px;
    pointer-events:none;
}
#wj-technology .iotx-workspace[data-scene="voice"] .iotx-voice-bars {display:flex;}
#wj-technology .iotx-voice-bars i {
    width:3px;
    height:18px;
    background:#eeb59a;
    animation:iotxSound 1.1s ease-in-out infinite alternate;
}
#wj-technology .iotx-voice-bars i:nth-child(2n) {height:31px;animation-delay:-.4s;}
#wj-technology .iotx-voice-bars i:nth-child(3n) {height:10px;animation-delay:-.7s;}
#wj-technology .iotx-home-network,
#wj-technology .iotx-game-overlay {display:none;}
#wj-technology .iotx-workspace[data-scene="home"] .iotx-home-network {
    display:block;
    position:absolute;
    z-index:3;
    inset:12%;
    border:1px dashed #d9bd8255;
    pointer-events:none;
}
#wj-technology .iotx-home-network::after {
    content:"CONNECTED HOME / DEMO";
    position:absolute;
    right:5px;
    bottom:5px;
    color:#f1dbae;
    background:#252018b9;
    padding:7px;
    font:600 9px var(--font-tech),monospace;
}
#wj-technology .iotx-workspace[data-scene="game"] .iotx-game-overlay {
    display:block;
    position:absolute;
    z-index:3;
    inset:20%;
    border:1px dashed #b69bee77;
    border-radius:50%;
    box-shadow:0 0 0 21px #b69bee09;
    pointer-events:none;
    animation:iotxRadar 8s linear infinite;
}
@keyframes iotxTrack {
    from {transform:translate(0,0) scale(1);}
    to {transform:translate(35%,12%) scale(.81);}
}
@keyframes iotxScan {
    to {transform:translateY(720px);}
}
@keyframes iotxSound {
    to {height:5px;opacity:.5;}
}
@keyframes iotxRadar {
    to {transform:rotate(360deg);}
}
@media(max-width:1100px) {
    #wj-technology .iotx-workspace {
        grid-template-columns:minmax(0,1.35fr) minmax(280px,.9fr);
    }
    #wj-technology .iotx-option-symbol {display:none;}
}
@media(max-width:860px) {
    #wj-technology .iotx-workspace {grid-template-columns:1fr;}
    #wj-technology .iotx-side {border-left:0;border-top:1px solid #ffffff25;}
    #wj-technology .iotx-screen {height:clamp(340px,54svh,560px);}
    #wj-technology .iotx-workspace[data-scene="vision"] .iotx-screen {
        height:clamp(320px,48svh,500px);
    }
    #wj-technology .iotx-side h4 {margin-top:24px;}
}
@media(max-width:620px) {
    #wj-technology .iotx-top {padding:15px;letter-spacing:.08em;font-size:9px;}
    #wj-technology .iotx-intro {padding:20px 16px 14px;}
    #wj-technology .iotx-nav {grid-template-columns:repeat(2,minmax(0,1fr));padding:8px 12px 17px;}
    #wj-technology .iotx-option {min-height:58px;padding:11px;}
    #wj-technology .iotx-option-name {font-size:12px;}
    #wj-technology .iotx-visual {padding:9px;}
    #wj-technology .iotx-screen {height:clamp(320px,52svh,470px);}
    #wj-technology .iotx-side {padding:25px 20px 30px;}
    #wj-technology .iotx-side-description {min-height:0;}
    #wj-technology .iotx-image-tag {left:11px;top:11px;font-size:8px;}
}
@media(prefers-reduced-motion:reduce) {
    #wj-technology .iotx *,
    #wj-technology .iotx *::before,
    #wj-technology .iotx *::after {
        animation:none!important;
        transition:none!important;
    }
}
`;

    if (!document.getElementById("iotx-v2-style")) {
        const style = document.createElement("style");
        style.id = "iotx-v2-style";
        style.textContent = css;
        document.head.appendChild(style);
    }

    root.className = "iotx";
    root.innerHTML = `
      <div class="iotx-top">
        <span>WJ / CONNECTED SYSTEMS</span>
        <strong>INTERACTIVE EXPERIENCE / 01</strong>
      </div>

      <header class="iotx-intro">
        <h3>物聯網智慧互動應用</h3>
        <p>INTERNET OF THINGS / SYSTEM INTEGRATION</p>
      </header>

      <div class="iotx-nav" role="group" aria-label="選擇物聯網作品">
        <button class="iotx-option" type="button" data-mode="voice" aria-pressed="true">
          <span class="iotx-option-num">01</span>
          <span class="iotx-option-name">語音系統整合</span>
          <span class="iotx-option-symbol">↗</span>
        </button>
        <button class="iotx-option" type="button" data-mode="vision" aria-pressed="false">
          <span class="iotx-option-num">02</span>
          <span class="iotx-option-name">辨識技術與數據分析</span>
          <span class="iotx-option-symbol">↗</span>
        </button>
        <button class="iotx-option" type="button" data-mode="home" aria-pressed="false">
          <span class="iotx-option-num">03</span>
          <span class="iotx-option-name">AI虛擬人與智慧家電</span>
          <span class="iotx-option-symbol">↗</span>
        </button>
        <button class="iotx-option" type="button" data-mode="game" aria-pressed="false">
          <span class="iotx-option-num">04</span>
          <span class="iotx-option-name">感知互動遊戲</span>
          <span class="iotx-option-symbol">↗</span>
        </button>
      </div>

      <div class="iotx-workspace" data-scene="voice">
        <div class="iotx-visual">
          <div class="iotx-screen">
            <img class="iotx-photo" alt="" decoding="async">
            <div class="iotx-missing" hidden>
              <b>IMAGE NOT FOUND</b>
              <span id="iotx-missing-file"></span>
              <span>請將照片放入 Technology/IOT 資料夾</span>
            </div>
            <span class="iotx-image-tag" id="iotx-image-tag">IOT / 01</span>
            <span class="iotx-corner a"></span>
            <span class="iotx-corner b"></span>
            <div class="iotx-vision-frame" aria-hidden="true"></div>
            <div class="iotx-scanline" aria-hidden="true"></div>
            <div class="iotx-voice-bars" aria-hidden="true">
              <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
            </div>
            <div class="iotx-home-network" aria-hidden="true"></div>
            <div class="iotx-game-overlay" aria-hidden="true"></div>
          </div>
          <div class="iotx-visual-bottom">
            <span id="iotx-file-label">IOT_p1.svg</span>
            <span>ORIGINAL ASPECT RATIO / NO CROP</span>
          </div>
        </div>

        <aside class="iotx-side">
          <div class="iotx-side-top">
            <span id="iotx-count">01 / 04</span>
            <span class="iotx-demo-label">INTERACTIVE DEMO</span>
          </div>
          <h4 id="iotx-title">語音系統整合</h4>
          <p class="iotx-side-description" id="iotx-description" aria-live="polite">
            STT → data processing → TTS 系統整合
          </p>
          <div class="iotx-rule"></div>

          <div class="iotx-demo" data-demo="voice">
            <div class="iotx-demo-head">SIGNAL PROCESSING / FLOW SIMULATION</div>
            <div class="iotx-pipeline">
              <span data-flow="0">STT</span><em>›</em>
              <span data-flow="1">DATA</span><em>›</em>
              <span data-flow="2">TTS</span>
            </div>
            <canvas class="iotx-wave" aria-label="語音波形示意動畫"></canvas>
          </div>

          <div class="iotx-demo" data-demo="vision" hidden>
            <div class="iotx-demo-head">TRACKING / ANALYSIS SIMULATION</div>
            <div class="iotx-vision-metrics">
              <span>TRACKING<br>DEMO MODE</span>
              <span>DATA GRAPH<br>SIMULATED</span>
            </div>
            <canvas class="iotx-chart" aria-label="測試曲線示意，非實際量測數據"></canvas>
          </div>

          <div class="iotx-demo" data-demo="home" hidden>
            <div class="iotx-demo-head">HOME CONTROL / VIRTUAL DEVICES</div>
            <div class="iotx-home-controls">
              <button class="iotx-home-button" data-switch="light" aria-pressed="true" type="button">燈光系統 <b>ON</b></button>
              <button class="iotx-home-button" data-switch="climate" aria-pressed="false" type="button">環境控制 <b>OFF</b></button>
              <button class="iotx-home-button" data-switch="device" aria-pressed="true" type="button">智慧設備 <b>ON</b></button>
            </div>
            <div class="iotx-home-status" id="iotx-home-status">2 / 3 VIRTUAL DEVICES ACTIVE</div>
          </div>

          <div class="iotx-demo" data-demo="game" hidden>
            <div class="iotx-demo-head">SENSOR PLAYGROUND / MINI INTERACTION</div>
            <div class="iotx-game-board" role="group" aria-label="互動訊號節點">
              <button class="iotx-beacon" type="button" aria-label="啟動訊號節點 1" aria-pressed="false"></button>
              <button class="iotx-beacon" type="button" aria-label="啟動訊號節點 2" aria-pressed="false"></button>
              <button class="iotx-beacon" type="button" aria-label="啟動訊號節點 3" aria-pressed="false"></button>
              <button class="iotx-beacon" type="button" aria-label="啟動訊號節點 4" aria-pressed="false"></button>
            </div>
            <div class="iotx-game-foot">
              <span id="iotx-game-progress" aria-live="polite">0 / 04 SIGNALS</span>
              <button class="iotx-reset" id="iotx-game-reset" type="button">RESET</button>
            </div>
          </div>

          <div class="iotx-side-foot">
            DESIGN DEMONSTRATION / NOT CONNECTED TO LIVE SENSORS
          </div>
        </aside>
      </div>
    `;

    const options = [...root.querySelectorAll(".iotx-option")];
    const workspace = root.querySelector(".iotx-workspace");
    const photo = root.querySelector(".iotx-photo");
    const missing = root.querySelector(".iotx-missing");
    const title = root.querySelector("#iotx-title");
    const description = root.querySelector("#iotx-description");
    const count = root.querySelector("#iotx-count");
    const fileLabel = root.querySelector("#iotx-file-label");
    const tag = root.querySelector("#iotx-image-tag");
    const demos = [...root.querySelectorAll("[data-demo]")];

    let active = "";
    let photoRequest = 0;
    let visible = true;
    let raf = 0;
    let lastFrame = 0;

    function switchScene(mode) {
        if (!data[mode] || active === mode) return;

        active = mode;
        const item = data[mode];
        workspace.dataset.scene = mode;

        options.forEach(button => {
            button.setAttribute(
                "aria-pressed",
                String(button.dataset.mode === mode)
            );
        });

        demos.forEach(demo => {
            demo.hidden = demo.dataset.demo !== mode;
        });

        title.textContent = item.title;
        description.textContent = item.description;
        count.textContent = item.index + " / 04";
        fileLabel.textContent = item.file;
        tag.textContent = "IOT / " + item.index;

        const request = ++photoRequest;
        photo.classList.remove("ready");
        photo.removeAttribute("src");
        missing.hidden = true;

        const src = "Technology/IOT/" + item.file;
        const loader = new Image();

        loader.onload = () => {
            if (request !== photoRequest) return;
            photo.alt = item.alt;
            photo.src = loader.src;
            photo.classList.add("ready");
            missing.hidden = true;
        };

        loader.onerror = () => {
            if (request !== photoRequest) return;
            photo.removeAttribute("src");
            missing.hidden = false;
            root.querySelector("#iotx-missing-file").textContent = item.file;
        };

        loader.src = src;
        restartCanvas();
    }

    // Desktop: hovering selects immediately.
    // Touchscreen: clicking or tapping selects.
    options.forEach((button, index) => {
        const mode = button.dataset.mode;

        button.addEventListener("click", () => switchScene(mode));

        if (finePointer) {
            button.addEventListener("pointerenter", () => switchScene(mode));
        }

        button.addEventListener("keydown", event => {
            let next = null;
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                next = (index + 1) % options.length;
            }
            if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                next = (index + options.length - 1) % options.length;
            }
            if (event.key === "Home") next = 0;
            if (event.key === "End") next = options.length - 1;

            if (next !== null) {
                event.preventDefault();
                options[next].focus();
                switchScene(options[next].dataset.mode);
            }
        });
    });

    // Local demo controls. No physical hardware is controlled.
    const homeButtons = [...root.querySelectorAll("[data-switch]")];

    function updateHomeStatus() {
        const count = homeButtons.filter(button =>
            button.getAttribute("aria-pressed") === "true"
        ).length;
        root.querySelector("#iotx-home-status").textContent =
            count + " / 3 VIRTUAL DEVICES ACTIVE";
    }

    homeButtons.forEach(button => {
        button.addEventListener("click", () => {
            const next = button.getAttribute("aria-pressed") !== "true";
            button.setAttribute("aria-pressed", String(next));
            button.querySelector("b").textContent = next ? "ON" : "OFF";
            updateHomeStatus();
        });
    });

    const beacons = [...root.querySelectorAll(".iotx-beacon")];

    function updateGameScore() {
        const score = beacons.filter(button =>
            button.classList.contains("hit")
        ).length;
        root.querySelector("#iotx-game-progress").textContent =
            score === 4 ? "COMPLETE / 04 SIGNALS" : score + " / 04 SIGNALS";
    }

    beacons.forEach(button => {
        button.addEventListener("click", () => {
            button.classList.add("hit");
            button.setAttribute("aria-pressed", "true");
            updateGameScore();
        });
    });

    root.querySelector("#iotx-game-reset").addEventListener("click", () => {
        beacons.forEach(button => {
            button.classList.remove("hit");
            button.setAttribute("aria-pressed", "false");
        });
        updateGameScore();
    });

    function prepareCanvas(canvas) {
        const rect = canvas.getBoundingClientRect();
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);
        if (width <= 0 || height <= 0) return null;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const pixelWidth = Math.round(width * dpr);
        const pixelHeight = Math.round(height * dpr);

        if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
            canvas.width = pixelWidth;
            canvas.height = pixelHeight;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        return {ctx, width, height};
    }

    function drawWave(time) {
        const canvas = root.querySelector(".iotx-wave");
        const info = prepareCanvas(canvas);
        if (!info) return;
        const {ctx, width:w, height:h} = info;

        ctx.strokeStyle = "rgba(238,181,154,.13)";
        ctx.lineWidth = 1;
        for (let y=18; y<h; y+=19) {
            ctx.beginPath();
            ctx.moveTo(0,y);
            ctx.lineTo(w,y);
            ctx.stroke();
        }

        ctx.strokeStyle = "#f1bca3";
        ctx.lineWidth = 1.8;
        ctx.beginPath();

        for (let x=0; x<=w; x+=2) {
            const p = x / Math.max(w,1);
            const envelope = .24 + .76 *
                Math.pow(Math.sin(Math.PI*p), 2);
            const amplitude = 23 * envelope;
            const y = h/2 +
                amplitude * Math.sin(x*.085 + time*.003) *
                (.45 + .55*Math.sin(x*.026-time*.0017));
            if (x===0) ctx.moveTo(x,y);
            else ctx.lineTo(x,y);
        }
        ctx.stroke();

        const nodes = [...root.querySelectorAll("[data-flow]")];
        const selected = Math.floor(time/1250)%3;
        nodes.forEach((node,index) => {
            node.classList.toggle("on",index===selected);
        });
    }

    function drawChart(time) {
        const canvas = root.querySelector(".iotx-chart");
        const info = prepareCanvas(canvas);
        if (!info) return;
        const {ctx,width:w,height:h} = info;

        ctx.strokeStyle = "rgba(147,212,189,.12)";
        ctx.lineWidth = 1;
        for (let x=0; x<w; x+=32) {
            ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();
        }
        for (let y=0; y<h; y+=24) {
            ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();
        }

        ctx.strokeStyle = "#93d4bd";
        ctx.lineWidth = 2;
        ctx.beginPath();

        for(let x=0; x<=w; x+=3) {
            const p = x/w;
            const y = h*.52
                - Math.sin(p*10 + time*.0008)*h*.14
                - Math.cos(p*20 - time*.001)*h*.07;
            if (x===0) ctx.moveTo(x,y);
            else ctx.lineTo(x,y);
        }
        ctx.stroke();

        // Demonstration only; these are generated values, not measurements.
        ctx.fillStyle = "#b8f3df";
        const markerX = (time*.038)%Math.max(w,1);
        const p = markerX/w;
        const markerY = h*.52
            - Math.sin(p*10+time*.0008)*h*.14
            - Math.cos(p*20-time*.001)*h*.07;
        ctx.beginPath();
        ctx.arc(markerX,markerY,3.6,0,Math.PI*2);
        ctx.fill();
    }

    function stopCanvas() {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
    }

    function tick(time) {
        if (!visible || document.hidden || panel.hidden ||
            !motion || !["voice","vision"].includes(active)) {
            stopCanvas();
            return;
        }

        if (time-lastFrame >= 32) {
            if (active==="voice") drawWave(time);
            if (active==="vision") drawChart(time);
            lastFrame = time;
        }
        raf = requestAnimationFrame(tick);
    }

    function restartCanvas() {
        stopCanvas();
        lastFrame = 0;

        if (!motion) {
            if (active==="voice") drawWave(0);
            if (active==="vision") drawChart(0);
            return;
        }

        if (visible && !document.hidden && !panel.hidden &&
            ["voice","vision"].includes(active)) {
            raf = requestAnimationFrame(tick);
        }
    }

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
            if (visible) restartCanvas();
            else stopCanvas();
        }, {threshold:0.05});
        observer.observe(panel);
    }

    document.addEventListener("visibilitychange", restartCanvas);
    window.addEventListener("resize", () => {
        if (active==="voice" || active==="vision") restartCanvas();
    }, {passive:true});

    switchScene("voice");
})();
/* WJ-IOT-V3-ADDON
 * Preserves V2 voice and vision effects.
 * Adds responsive SVG artwork, simulated smart-home
 * controls, local robot chat and a real image mini-game.
 */
;(() => {
    "use strict";

    const root = document.getElementById("iotv2-root");
    const workspace = root?.querySelector(".iotx-workspace");
    const screen = root?.querySelector(".iotx-screen");
    const photo = root?.querySelector(".iotx-photo");

    if (!root || !workspace || !screen || !photo) return;
    if (root.dataset.iotV3 === "installed") return;
    root.dataset.iotV3 = "installed";

    const ratios = {
        voice: 1950 / 1057,
        vision: 1950 / 1057,
        home: 2000 / 1749,
        game: 1950 / 1057
    };

    const reducedMotion = matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // -------------------------------------------
    // V3 visual system. All styles are local to IoT.
    // -------------------------------------------
    const css = String.raw`
#wj-technology .iotx-workspace {
    grid-template-columns: minmax(0,1.46fr) minmax(315px,.82fr);
}
#wj-technology .iotx-workspace[data-scene="vision"] {
    grid-template-columns: minmax(0,1.85fr) minmax(310px,.76fr);
}
#wj-technology .iotx-workspace[data-scene="home"] {
    grid-template-columns: minmax(0,1.45fr) minmax(335px,.92fr);
}
#wj-technology .iotx-workspace[data-scene="game"] {
    grid-template-columns: minmax(0,1.3fr) minmax(315px,.85fr);
}
#wj-technology .iotx-screen {
    height: clamp(480px,72svh,760px);
    isolation: isolate;
}
#wj-technology .iotx-workspace[data-scene="vision"] .iotx-screen {
    height: clamp(350px,51svh,580px);
}
#wj-technology .iotx-workspace[data-scene="home"] .iotx-screen {
    height: clamp(480px,67svh,720px);
}
#wj-technology .iotx-workspace[data-scene="game"] .iotx-screen {
    height: clamp(480px,70svh,740px);
}
#wj-technology .iot3-artboard {
    --v3-ratio: .9565;
    --v3-image-height: clamp(320px,62svh,670px);
    width: calc(100% - 32px);
    width: min(
        calc(100% - 32px),
        calc(var(--v3-image-height) * var(--v3-ratio))
    );
    aspect-ratio: var(--v3-ratio);
    max-height: calc(100% - 32px);
    position: relative;
    z-index: 2;
    isolation: isolate;
    box-shadow: 0 16px 48px #0004;
    border: 1px solid #ffffff28;
    background: #16151b;
    overflow: hidden;
}
#wj-technology .iot3-artboard .iotx-photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    transition: filter .65s ease,opacity .35s ease,transform .45s ease;
}
#wj-technology .iot3-image-dimmer {
    position: absolute;
    inset: 0;
    z-index: 3;
    pointer-events: none;
    background: #030407;
    opacity: 0;
    transition: opacity .8s cubic-bezier(.2,.7,.2,1);
}
#wj-technology .iotx-workspace[data-scene="home"].iot3-lights-off
.iot3-artboard .iotx-photo {
    filter: brightness(.22) saturate(.62);
}
#wj-technology .iotx-workspace[data-scene="home"].iot3-lights-off
.iot3-image-dimmer { opacity: .35; }

#wj-technology .iot3-rail {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
}
#wj-technology .iot3-rail::before,
#wj-technology .iot3-rail::after {
    content: "";
    position: absolute;
    top: 17%;
    bottom: 17%;
    width: 1px;
    background: repeating-linear-gradient(
        to bottom,#ffffff38 0 4px,transparent 4px 17px
    );
    opacity: .45;
}
#wj-technology .iot3-rail::before { left: 12px; }
#wj-technology .iot3-rail::after { right: 12px; }
#wj-technology .iot3-rail-note {
    position: absolute;
    z-index: 2;
    bottom: 12px;
    right: 13px;
    color: #b7aebc;
    font: 600 9px var(--font-tech),monospace;
    letter-spacing: .15em;
    pointer-events: none;
}
#wj-technology .iot3-environment {
    position: absolute;
    z-index: 5;
    right: 12px;
    top: 19%;
    display: grid;
    gap: 8px;
    opacity: 0;
    transform: translateX(12px);
    transition: opacity .35s,transform .35s;
    pointer-events: none;
}
#wj-technology .iotx-workspace[data-scene="home"].iot3-climate-on
.iot3-environment {
    opacity: 1;
    transform: translateX(0);
}
#wj-technology .iot3-env-chip {
    padding: 9px 11px;
    border: 1px solid #e4d09a72;
    background: #1b1d20e6;
    color: #f1d9a4;
    font: 600 9px/1.5 var(--font-tech),monospace;
    letter-spacing: .06em;
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    gap: 8px;
}
#wj-technology .iot3-env-chip i {
    width: 15px;
    height: 15px;
    display: inline-grid;
    place-items: center;
    font-style: normal;
    border: 1px solid #e4d09a6b;
    border-radius: 50%;
}
#wj-technology .iot3-air {
    position: absolute;
    left: 7%;
    top: 15%;
    width: 62%;
    height: 62%;
    opacity: 0;
    pointer-events: none;
    z-index: 4;
}
#wj-technology .iotx-workspace[data-scene="home"].iot3-climate-on
.iot3-air { opacity: .65; }
#wj-technology .iot3-air span {
    position: absolute;
    width: 46%;
    height: 1px;
    border-top: 1px dashed #e5d39ba8;
    transform: rotate(-17deg);
    animation: iot3Air 3s ease-in-out infinite;
}
#wj-technology .iot3-air span:nth-child(1) {top:25%;left:4%;}
#wj-technology .iot3-air span:nth-child(2) {top:43%;left:16%;animation-delay:-1s;}
#wj-technology .iot3-air span:nth-child(3) {top:62%;left:1%;animation-delay:-2s;}
@keyframes iot3Air {
    0%,100% { opacity:.2;translate:-8px 0; }
    50% { opacity:1;translate:13px -4px; }
}
#wj-technology .iot3-agent-marker {
    position: absolute;
    z-index: 5;
    left: 12px;
    bottom: 12px;
    padding: 8px 10px;
    color: #ffe2b3;
    background: #171719df;
    border-left: 2px solid #d9bd82;
    font: 600 9px var(--font-tech),monospace;
    letter-spacing: .07em;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity .3s,transform .3s;
    pointer-events: none;
}
#wj-technology .iotx-workspace[data-scene="home"].iot3-agent-on
.iot3-agent-marker {
    opacity: 1;
    transform: translateY(0);
}
#wj-technology .iot3-assistant {
    margin-top: 17px;
    padding: 15px;
    border: 1px solid #e1c48a39;
    background: linear-gradient(145deg,#26251f,#1b1d22);
}
#wj-technology .iot3-assistant-head {
    display: flex;
    align-items: center;
    gap: 13px;
    border-bottom: 1px solid #ffffff1b;
    padding-bottom: 13px;
}
#wj-technology .iot3-robot {
    width: 51px;
    height: 51px;
    flex: 0 0 51px;
    position: relative;
    display: grid;
    place-items: center;
    transition: filter .4s,opacity .4s;
}
#wj-technology .iot3-robot::before {
    content: "";
    position: absolute;
    top: 0;
    width: 2px;
    height: 9px;
    background: #d9bd82;
}
#wj-technology .iot3-robot::after {
    content: "";
    position: absolute;
    top: 0;
    width: 6px;
    height: 6px;
    background: #e9cd8e;
    border-radius: 50%;
    box-shadow: 0 0 9px #e9cd8e95;
}
#wj-technology .iot3-robot-face {
    position: relative;
    top: 5px;
    width: 47px;
    height: 37px;
    border: 2px solid #e6c98a;
    border-radius: 10px 10px 12px 12px;
    background: #393429;
    box-shadow: inset 0 0 12px #e0bd6530;
}
#wj-technology .iot3-robot-eyes {
    position: absolute;
    left: 10px;
    right: 10px;
    top: 13px;
    display: flex;
    justify-content: space-between;
}
#wj-technology .iot3-robot-eyes i {
    width: 6px;
    height: 8px;
    border-radius: 3px;
    background: #ffdda0;
    box-shadow: 0 0 8px #e5ca87;
    animation: iot3Blink 5s infinite;
}
#wj-technology .iot3-robot-eyes i:nth-child(2) {animation-delay: .07s;}
@keyframes iot3Blink {
    0%,92%,97%,100% {scale:1 1;}
    94%,95% {scale:1 .12;}
}
#wj-technology .iot3-robot-mouth {
    position: absolute;
    bottom: 7px;
    left: 19px;
    width: 8px;
    height: 2px;
    background: #e5c889;
}
#wj-technology .iot3-assistant[data-online="false"] .iot3-robot {
    filter: grayscale(1);
    opacity: .42;
}
#wj-technology .iot3-assistant[data-online="false"] .iot3-robot-eyes i {
    animation: none;
}
#wj-technology .iot3-robot.is-speaking {
    animation: iot3RobotTalk .45s ease-in-out 2;
}
@keyframes iot3RobotTalk {
    0%,100% {transform:rotate(0);}
    50% {transform:rotate(6deg);}
}
#wj-technology .iot3-assistant-name {
    color: #f4e1bb;
    font: 700 11px/1.7 var(--font-tech),monospace;
    letter-spacing: .08em;
}
#wj-technology .iot3-assistant-status {
    color: #a6a095;
    font: 600 9px/1.5 var(--font-tech),monospace;
}
#wj-technology .iot3-chat-log {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 152px;
    min-height: 88px;
    overflow: auto;
    padding: 13px 0;
    scrollbar-width: thin;
}
#wj-technology .iot3-message {
    margin: 0;
    padding: 9px 11px;
    color: #e8dfd2;
    background: #24232b;
    border-left: 2px solid #d9bd82;
    font-size: 12px;
    line-height: 1.65;
    max-width: 94%;
    overflow-wrap: anywhere;
}
#wj-technology .iot3-message.user {
    align-self: flex-end;
    border-left: 0;
    border-right: 2px solid #a49bb1;
    background: #342d39;
}
#wj-technology .iot3-quick {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 9px;
}
#wj-technology .iot3-quick button {
    background: #302a2c;
    border: 1px solid #d9bd825b;
    padding: 6px 9px;
    color: #e5d3ac;
    font: 600 10px var(--font-tech),monospace;
}
#wj-technology .iot3-form {
    display: flex;
    gap: 6px;
}
#wj-technology .iot3-input {
    min-width: 0;
    flex: 1;
    padding: 9px;
    background: #17181e;
    border: 1px solid #ffffff30;
    color: white;
    font: 12px var(--font-tech),monospace;
}
#wj-technology .iot3-form button {
    padding: 9px 12px;
    border: 1px solid #d9bd82a6;
    background: #393224;
    color: #f7deaa;
    font-size: 12px;
}
#wj-technology .iot3-assistant button:disabled,
#wj-technology .iot3-input:disabled {
    opacity: .35;
    cursor: not-allowed;
}
#wj-technology .iot3-local-note {
    margin-top: 9px;
    color: #89858c;
    font: 9px/1.6 var(--font-tech),monospace;
}
#wj-technology .iotx-demo[data-demo="game"] .iotx-game-board,
#wj-technology .iotx-demo[data-demo="game"] .iotx-game-foot {
    display: none;
}
#wj-technology .iot3-game-layer {
    position: absolute;
    inset: 0;
    z-index: 6;
    pointer-events: none;
    visibility: hidden;
    overflow: hidden;
}
#wj-technology .iotx-workspace[data-scene="game"] .iot3-game-layer {
    visibility: visible;
}
#wj-technology .iot3-game-layer::before {
    content: "";
    position: absolute;
    inset: 14%;
    border: 1px dashed #bea0f687;
    border-radius: 50%;
    animation: iot3Radar 7s linear infinite;
    box-shadow: 0 0 0 29px #be9df515;
}
#wj-technology .iot3-game-layer::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 78%;
    aspect-ratio: 1;
    transform: translate(-50%,-50%);
    border: 1px solid #bea0f52a;
    border-radius: 50%;
}
@keyframes iot3Radar {
    to {transform:rotate(360deg);}
}
#wj-technology .iot3-reticle {
    position: absolute;
    z-index: 7;
    width: 44px;
    height: 44px;
    border: 1px solid #cbb3fb91;
    border-radius: 50%;
    transform: translate(-50%,-50%);
    opacity: 0;
    pointer-events: none;
    transition: opacity .2s;
}
#wj-technology .iot3-reticle::before,
#wj-technology .iot3-reticle::after {
    content: "";
    position: absolute;
    background: #ddcafe;
}
#wj-technology .iot3-reticle::before {
    width: 1px;height: 12px;left: 50%;top: 15px;
}
#wj-technology .iot3-reticle::after {
    width: 12px;height: 1px;left: 15px;top: 50%;
}
#wj-technology .iot3-game-target {
    position: absolute;
    z-index: 10;
    width: 56px;
    height: 56px;
    border: 1px solid #dec9ff;
    border-radius: 50%;
    background: #3c2459a6;
    color: #f2dfff;
    transform: translate(-50%,-50%);
    pointer-events: auto;
    display: grid;
    place-items: center;
    animation: iot3TargetPulse 1.4s ease-in-out infinite;
    box-shadow: 0 0 0 8px #b69bee19,0 0 24px #b69bee69;
}
#wj-technology .iot3-game-target[hidden] { display:none!important; }
#wj-technology .iot3-game-target::before {
    content: "";
    position: absolute;
    inset: 11px;
    border: 1px dashed #f8edff;
    border-radius: 50%;
}
#wj-technology .iot3-game-target span {
    font: 700 11px var(--font-tech),monospace;
    position: relative;
    z-index: 1;
}
@keyframes iot3TargetPulse {
    0%,100% {box-shadow:0 0 0 7px #b69bee20,0 0 18px #b69bee55;}
    50% {box-shadow:0 0 0 19px #b69bee08,0 0 30px #b69beeaa;}
}
#wj-technology .iot3-impact {
    position:absolute;
    z-index: 8;
    width: 18px;height: 18px;
    border: 2px solid #ecdfff;
    border-radius: 50%;
    opacity:0;
    transform: translate(-50%,-50%);
    pointer-events:none;
}
#wj-technology .iot3-impact.burst {
    animation:iot3Burst .43s ease-out both;
}
@keyframes iot3Burst {
    from {opacity:1;width:18px;height:18px;}
    to {opacity:0;width:130px;height:130px;}
}
#wj-technology .iot3-scorebox {
    border: 1px solid #b69bee53;
    background: #211b2b;
    padding: 15px;
}
#wj-technology .iot3-score-row {
    display:flex;
    align-items:baseline;
    justify-content:space-between;
    gap:10px;
    color:#cfc4dd;
    font:600 10px var(--font-tech),monospace;
}
#wj-technology .iot3-score-row strong {
    color:#d9c3ff;
    font-size:26px;
}
#wj-technology .iot3-meter {
    height:3px;
    margin:14px 0;
    background:#ffffff1e;
}
#wj-technology .iot3-meter i {
    display:block;
    width:0;
    height:100%;
    background:#bea2f1;
    transition:width .25s ease;
}
#wj-technology .iot3-game-status {
    min-height:44px;
    color:#d8cfe4;
    line-height:1.65;
    font-size:12px;
}
#wj-technology .iot3-restart {
    margin-top:12px;
    width:100%;
    padding:10px;
    border:1px solid #b69bee9e;
    background:#332641;
    color:#e5d5ff;
    font:650 11px var(--font-tech),monospace;
}
#wj-technology .iot3-restart:hover,
#wj-technology .iot3-game-target:hover {
    filter:brightness(1.2);
}
#wj-technology .iot3-game-target:focus-visible,
#wj-technology .iot3-restart:focus-visible,
#wj-technology .iot3-assistant button:focus-visible,
#wj-technology .iot3-input:focus-visible {
    outline:2px solid white;outline-offset:3px;
}
@media(max-width:1050px) {
    #wj-technology .iotx-workspace,
    #wj-technology .iotx-workspace[data-scene] {
        grid-template-columns:minmax(0,1.3fr) minmax(290px,.9fr);
    }
}
@media(max-width:860px) {
    #wj-technology .iotx-workspace,
    #wj-technology .iotx-workspace[data-scene] {
        grid-template-columns:1fr;
    }
    #wj-technology .iotx-screen,
    #wj-technology .iotx-workspace[data-scene] .iotx-screen {
        height:clamp(350px,60svh,620px);
    }
    #wj-technology .iotx-workspace[data-scene="vision"] .iotx-screen {
        height:clamp(290px,46svh,490px);
    }
}
@media(max-width:520px) {
    #wj-technology .iotx-screen,
    #wj-technology .iotx-workspace[data-scene] .iotx-screen {
        height:clamp(290px,56svh,480px);
    }
    #wj-technology .iotx-workspace[data-scene="vision"] .iotx-screen {
        height:clamp(260px,42svh,385px);
    }
    #wj-technology .iot3-artboard {width:calc(100% - 22px);}
    #wj-technology .iot3-env-chip {font-size:8px;padding:6px;}
    #wj-technology .iot3-game-target {width:50px;height:50px;}
}
@media(prefers-reduced-motion:reduce) {
    #wj-technology .iot3-artboard *,
    #wj-technology .iot3-artboard *::before,
    #wj-technology .iot3-artboard *::after,
    #wj-technology .iot3-assistant *,
    #wj-technology .iot3-meter i {
        animation:none!important;
        transition:none!important;
    }
}
`;

    const style = document.createElement("style");
    style.id = "wj-iot-v3-style";
    style.textContent = css;
    document.head.appendChild(style);

    // Existing V2 image remains the same DOM element.
    // This preserves its loader and the working V2 animations.
    const artboard = document.createElement("div");
    artboard.className = "iot3-artboard";
    photo.parentNode.insertBefore(artboard, photo);
    artboard.appendChild(photo);

    artboard.insertAdjacentHTML("beforeend", `
      <div class="iot3-image-dimmer" aria-hidden="true"></div>
      <div class="iot3-air" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
      <div class="iot3-environment" aria-hidden="true">
        <span class="iot3-env-chip"><i>↻</i> AIR CIRCULATION</span>
        <span class="iot3-env-chip"><i>≈</i> CLIMATE AUTO</span>
        <span class="iot3-env-chip"><i>○</i> VIRTUAL DEVICE</span>
      </div>
      <div class="iot3-agent-marker" aria-hidden="true">
        WJ ASSISTANT / ONLINE
      </div>
      <div class="iot3-game-layer">
        <div class="iot3-reticle" aria-hidden="true"></div>
        <button type="button" class="iot3-game-target"
                aria-label="捕捉感知訊號" hidden><span>01</span></button>
        <div class="iot3-impact" aria-hidden="true"></div>
      </div>
    `);

    const rail = document.createElement("div");
    rail.className = "iot3-rail";
    rail.setAttribute("aria-hidden", "true");
    screen.prepend(rail);

    const railNote = document.createElement("div");
    railNote.className = "iot3-rail-note";
    railNote.textContent = "WJ / DISPLAY SYSTEM";
    screen.appendChild(railNote);

    // -------------------------------------------
    // Scene-specific artwork proportions.
    // -------------------------------------------
    let lastScene = "";

    function updateRatio() {
        const scene = workspace.dataset.scene;
        let ratio = ratios[scene] || 1;

        // SVGs sometimes report a default 300x150 size.
        // Only trust intrinsic dimensions when reasonably
        // consistent with the original artwork proportions.
        if (photo.naturalWidth > 0 && photo.naturalHeight > 0) {
            const detected = photo.naturalWidth / photo.naturalHeight;
            if (detected > ratio * .75 && detected < ratio * 1.3) {
                ratio = detected;
            }
        }

        artboard.style.setProperty("--v3-ratio", String(ratio));
    }

    photo.addEventListener("load", updateRatio);

    // -------------------------------------------
    // Smart-home interaction: one state drives
    // photograph, environment, robot and controls.
    // -------------------------------------------
    const homeDemo = root.querySelector('[data-demo="home"]');

    homeDemo.insertAdjacentHTML("beforeend", `
      <section class="iot3-assistant" data-online="true"
               aria-label="智慧家庭虛擬助理示範">
        <div class="iot3-assistant-head">
          <div class="iot3-robot" aria-hidden="true">
            <div class="iot3-robot-face">
              <div class="iot3-robot-eyes"><i></i><i></i></div>
              <div class="iot3-robot-mouth"></div>
            </div>
          </div>
          <div>
            <div class="iot3-assistant-name">WJ HOME ASSISTANT</div>
            <div class="iot3-assistant-status">LOCAL DEMO / ONLINE</div>
          </div>
        </div>
        <div class="iot3-chat-log" role="log"
             aria-live="polite" aria-label="示範對話紀錄"></div>
        <div class="iot3-quick">
          <button type="button" data-prompt="開燈">開燈</button>
          <button type="button" data-prompt="關燈">關燈</button>
          <button type="button" data-prompt="早安模式">早安模式</button>
        </div>
        <form class="iot3-form">
          <input class="iot3-input" maxlength="70"
                 aria-label="傳送給虛擬助理的訊息"
                 placeholder="輸入簡單控制指令..." autocomplete="off">
          <button type="submit">SEND</button>
        </form>
        <div class="iot3-local-note">
          RULE-BASED INTERACTION / NO CLOUD AI CONNECTION
        </div>
      </section>
    `);

    const homeButtons = [...homeDemo.querySelectorAll("[data-switch]")];
    const assistant = homeDemo.querySelector(".iot3-assistant");
    const robot = assistant.querySelector(".iot3-robot");
    const botStatus = assistant.querySelector(".iot3-assistant-status");
    const chatLog = assistant.querySelector(".iot3-chat-log");
    const chatInput = assistant.querySelector(".iot3-input");
    const sendButton = assistant.querySelector('[type="submit"]');
    const quickButtons = [...assistant.querySelectorAll("[data-prompt]")];

    function homeButton(key) {
        return homeButtons.find(b => b.dataset.switch === key);
    }

    function isOn(key) {
        return homeButton(key)?.getAttribute("aria-pressed") === "true";
    }

    function setOn(key, enabled) {
        const button = homeButton(key);
        if (button && isOn(key) !== enabled) button.click();
    }

    function addMessage(type, message) {
        const p = document.createElement("p");
        p.className = "iot3-message" + (type === "user" ? " user" : "");
        p.textContent = message;
        chatLog.appendChild(p);

        while (chatLog.children.length > 6) {
            chatLog.firstElementChild.remove();
        }

        chatLog.scrollTop = chatLog.scrollHeight;
        if (type === "bot" && !reducedMotion) {
            robot.classList.remove("is-speaking");
            void robot.offsetWidth;
            robot.classList.add("is-speaking");
        }
    }

    function syncHome() {
        const light = isOn("light");
        const climate = isOn("climate");
        const online = isOn("device");

        workspace.classList.toggle("iot3-lights-off", !light);
        workspace.classList.toggle("iot3-climate-on", climate);
        workspace.classList.toggle("iot3-agent-on", online);

        assistant.dataset.online = String(online);
        botStatus.textContent = online
            ? "LOCAL DEMO / ONLINE"
            : "LOCAL DEMO / SLEEP MODE";

        chatInput.disabled = !online;
        sendButton.disabled = !online;
        quickButtons.forEach(b => b.disabled = !online);
        chatInput.placeholder = online
            ? "輸入簡單控制指令..."
            : "請先開啟智慧設備";
    }

    homeButtons.forEach(button => {
        button.addEventListener("click", syncHome);
    });

    function replyFor(message) {
        const text = message.trim();

        if (/晚安|睡眠模式/.test(text)) {
            setOn("light", false);
            setOn("climate", false);
            return "已套用晚安情境：關閉燈光及環境控制。";
        }
        if (/早安/.test(text)) {
            setOn("light", true);
            setOn("climate", true);
            return "早安！燈光已點亮，環境循環已啟用。";
        }
        if (/關燈|關閉燈/.test(text)) {
            setOn("light", false);
            return "已關閉燈光。照片會同步切換成夜間狀態。";
        }
        if (/開燈|打開燈|亮燈/.test(text)) {
            setOn("light", true);
            return "燈光已開啟。照片亮度已恢復。";
        }
        if (/關閉環境|關風扇|關冷氣/.test(text)) {
            setOn("climate", false);
            return "環境控制已關閉，示範氣流停止顯示。";
        }
        if (/開啟環境|打開風扇|開風扇|開冷氣/.test(text)) {
            setOn("climate", true);
            return "環境循環已啟用，照片上的控制圖示與氣流已顯示。";
        }
        if (/狀態|設備|環境/.test(text)) {
            return "目前燈光：" + (isOn("light") ? "ON" : "OFF") +
                "；環境：" + (isOn("climate") ? "ON" : "OFF") +
                "。以上皆為模擬控制。";
        }

        return "這是本地互動示範。試試「開燈」、「關燈」、「早安模式」或「環境狀態」。";
    }

    let replyTimer = 0;

    function submitChat(value) {
        if (!isOn("device")) return;

        const message = value.trim().slice(0, 70);
        if (!message) return;

        addMessage("user", message);
        clearTimeout(replyTimer);
        botStatus.textContent = "PROCESSING / LOCAL RULES";

        replyTimer = window.setTimeout(() => {
            if (!isOn("device")) return;
            const reply = replyFor(message);
            addMessage("bot", reply);
            botStatus.textContent = "LOCAL DEMO / ONLINE";
        }, reducedMotion ? 0 : 330);
    }

    assistant.querySelector(".iot3-form")
        .addEventListener("submit", event => {
            event.preventDefault();
            submitChat(chatInput.value);
            chatInput.value = "";
        });

    quickButtons.forEach(button => {
        button.addEventListener("click", () => {
            submitChat(button.dataset.prompt);
        });
    });

    syncHome();
    addMessage(
        "bot",
        "你好！我是 WJ 居家助理。可以試著說「開燈」或「早安模式」。"
    );

    // -------------------------------------------
    // Perception game: targets are ON the artwork.
    // Five successful captures complete the mission.
    // Supports mouse, touch and keyboard.
    // -------------------------------------------
    const gameDemo = root.querySelector('[data-demo="game"]');

    gameDemo.insertAdjacentHTML("beforeend", `
      <section class="iot3-scorebox" aria-label="感知訊號挑戰">
        <div class="iot3-score-row">
          <span>SIGNAL CAPTURE</span>
          <strong class="iot3-score">00 / 05</strong>
        </div>
        <div class="iot3-meter"><i></i></div>
        <div class="iot3-game-status" role="status">
          請捕捉照片上出現的感知訊號目標。
        </div>
        <button type="button" class="iot3-restart">
          RESTART / 重新校準
        </button>
      </section>
    `);

    const gameLayer = artboard.querySelector(".iot3-game-layer");
    const target = artboard.querySelector(".iot3-game-target");
    const impact = artboard.querySelector(".iot3-impact");
    const reticle = artboard.querySelector(".iot3-reticle");
    const score = gameDemo.querySelector(".iot3-score");
    const meter = gameDemo.querySelector(".iot3-meter i");
    const gameStatus = gameDemo.querySelector(".iot3-game-status");
    const restart = gameDemo.querySelector(".iot3-restart");

    const positions = [
        [23, 28],
        [70, 34],
        [34, 72],
        [76, 67],
        [53, 46]
    ];

    let captures = 0;
    let gameBusy = false;
    let nextTargetTimer = 0;

    function updateGame() {
        score.textContent =
            String(captures).padStart(2, "0") + " / 05";
        meter.style.width = (captures / 5 * 100) + "%";
    }

    function showTarget() {
        if (workspace.dataset.scene !== "game") return;
        if (captures >= 5) return;

        const point = positions[captures];
        target.style.left = point[0] + "%";
        target.style.top = point[1] + "%";
        target.querySelector("span").textContent =
            String(captures + 1).padStart(2, "0");
        target.setAttribute(
            "aria-label",
            "捕捉第 " + (captures + 1) + " 個感知訊號"
        );
        target.disabled = false;
        target.hidden = false;
        gameBusy = false;
        gameStatus.textContent =
            "找到照片上的發光目標，點擊或觸碰以捕捉訊號。";
    }

    function resetGame() {
        clearTimeout(nextTargetTimer);
        captures = 0;
        gameBusy = false;
        target.hidden = true;
        updateGame();
        showTarget();
    }

    target.addEventListener("click", () => {
        if (gameBusy || workspace.dataset.scene !== "game") return;
        gameBusy = true;
        target.disabled = true;

        impact.style.left = target.style.left;
        impact.style.top = target.style.top;
        impact.classList.remove("burst");
        void impact.offsetWidth;
        impact.classList.add("burst");

        target.hidden = true;
        captures += 1;
        updateGame();

        if (captures === 5) {
            gameStatus.textContent =
                "校準完成！已成功捕捉全部 5 個感知訊號。";
            return;
        }

        gameStatus.textContent = "SIGNAL LOCKED / 正在定位下一個目標";
        nextTargetTimer = window.setTimeout(showTarget, 290);
    });

    restart.addEventListener("click", resetGame);

    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
        artboard.addEventListener("pointermove", event => {
            if (workspace.dataset.scene !== "game") return;

            const rect = artboard.getBoundingClientRect();
            reticle.style.left = (event.clientX - rect.left) + "px";
            reticle.style.top = (event.clientY - rect.top) + "px";
            reticle.style.opacity = ".78";
        });

        artboard.addEventListener("pointerleave", () => {
            reticle.style.opacity = "0";
        });
    }

    // Keep V2 hover/tab selection in control.
    // Only react to its existing scene changes.
    function onSceneChanged() {
        const scene = workspace.dataset.scene;
        if (!ratios[scene]) return;

        if (scene !== lastScene) {
            lastScene = scene;
            updateRatio();
            if (scene === "home") syncHome();
            if (scene === "game") resetGame();
            else {
                clearTimeout(nextTargetTimer);
                target.hidden = true;
                reticle.style.opacity = "0";
            }
        }
    }

    new MutationObserver(onSceneChanged).observe(
        workspace,
        {attributes:true,attributeFilter:["data-scene"]}
    );

    updateRatio();
    onSceneChanged();
})();
/* WJ-IOT-V4-FIX
   Fixed outer display, precise image fitting,
   compact smart home and object-anchored mini-game.
   Local development only.
*/
;(() => {
    "use strict";

    const root = document.getElementById("iotv2-root");
    const workspace = root?.querySelector(".iotx-workspace");
    const screen = root?.querySelector(".iotx-screen");
    const art = root?.querySelector(".iot3-artboard");
    const image = root?.querySelector(".iotx-photo");

    if (!root || !workspace || !screen || !art || !image) return;
    if (root.dataset.v4Ready) return;
    root.dataset.v4Ready = "true";

    const reduced = matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // SVG source aspect ratios, from original project images.
    const aspect = {
        voice: 1950 / 1057,
        vision: 1950 / 1057,
        home: 2000 / 1749,
        game: 1950 / 1057
    };

    const css = String.raw`
/* Preserve ONE fixed outer display structure for all scenes. */
#wj-technology .iotx-workspace,
#wj-technology .iotx-workspace[data-scene] {
    grid-template-columns:minmax(0,1.67fr) minmax(300px,.87fr)!important;
    align-items:stretch;
}
#wj-technology .iotx-visual {
    display:flex;
    flex-direction:column;
    min-width:0;
    min-height:0;
}
#wj-technology .iotx-screen,
#wj-technology .iotx-workspace[data-scene] .iotx-screen {
    flex:1 1 auto;
    height:auto!important;
    min-height:clamp(440px,58svh,720px);
    position:relative;
    overflow:hidden;
}
#wj-technology .iotx-visual-bottom {flex:0 0 auto;}

/* Eliminate clutter and overlaps on the photograph. */
#wj-technology .iot3-rail,
#wj-technology .iot3-rail-note,
#wj-technology .iotx-image-tag,
#wj-technology .iotx-corner,
#wj-technology .iot3-home-network,
#wj-technology .iot3-environment,
#wj-technology .iot3-air,
#wj-technology .iot3-agent-marker,
#wj-technology .iot3-game-layer,
#wj-technology .iotx-game-overlay {
    display:none!important;
}
#wj-technology .iot3-artboard {
    max-width:none!important;
    max-height:none!important;
    aspect-ratio:auto!important;
    flex:none;
    border:0;
    background:#14141a;
    box-shadow:0 12px 32px #0005;
}
#wj-technology .iot3-artboard .iotx-photo {
    object-fit:contain;
    object-position:center;
}
#wj-technology .iotx-screen::after {
    content:"";
    position:absolute;
    z-index:0;
    inset:12px;
    pointer-events:none;
    border:1px solid #ffffff10;
}
#wj-technology .iotx-side h4 {
    margin:clamp(22px,3vh,35px) 0 12px;
}
#wj-technology .iotx-side-description {
    min-height:0;
}
#wj-technology .iotx-rule {
    margin:20px 0;
}

/* SMART HOME: actual visual response, not text labels. */
#wj-technology .iot4-home {
    display:none;
    position:absolute;
    inset:0;
    z-index:8;
    pointer-events:none;
}
#wj-technology .iotx-workspace[data-scene="home"] .iot4-home {
    display:block;
}
#wj-technology .iot4-light {
    position:absolute;
    inset:0;
    background:radial-gradient(
        ellipse at 65% 28%,
        #ffcf7857 0%,
        #ffd57a12 45%,
        transparent 76%
    );
    opacity:.7;
    mix-blend-mode:screen;
    transition:opacity .65s ease;
}
#wj-technology .iot3-lights-off .iot3-artboard .iotx-photo {
    filter:brightness(.36) saturate(.73)!important;
}
#wj-technology .iot3-lights-off .iot4-light {
    opacity:0;
}
#wj-technology .iot4-env {
    position:absolute;
    inset:0;
    opacity:0;
    transition:opacity .4s ease;
}
#wj-technology .iot3-climate-on .iot4-env {opacity:1;}
#wj-technology .iot4-fan {
    position:absolute;
    right:12%;
    top:14%;
    width:58px;
    height:58px;
    display:grid;
    place-items:center;
    border:1px solid #f1d59e9e;
    border-radius:50%;
    background:#17191aba;
    box-shadow:0 0 0 7px #d9bd8216;
}
#wj-technology .iot4-fan span {
    font-size:38px;
    line-height:1;
    color:#f1d59e;
    animation:iot4Spin 2.1s linear infinite;
}
#wj-technology .iot4-device {
    position:absolute;
    left:12%;
    bottom:16%;
    width:44px;
    height:44px;
    display:grid;
    place-items:center;
    border:1px solid #d9bd82a6;
    border-radius:50%;
    background:#17191ac7;
    color:#f3d8aa;
    font:700 18px monospace;
    box-shadow:0 0 0 6px #d9bd8216;
}
#wj-technology .iot4-airline {
    position:absolute;
    left:16%;
    width:43%;
    height:1px;
    background:linear-gradient(
        90deg,transparent,#edd5a8,transparent
    );
    opacity:0;
    animation:iot4Air 3.1s ease-in-out infinite;
}
#wj-technology .iot4-airline:nth-child(3) {
    top:33%;transform:rotate(-13deg);
}
#wj-technology .iot4-airline:nth-child(4) {
    top:44%;transform:rotate(-7deg);
    animation-delay:-1s;
}
#wj-technology .iot4-airline:nth-child(5) {
    top:55%;transform:rotate(6deg);
    animation-delay:-2s;
}
@keyframes iot4Spin {to{transform:rotate(360deg)}}
@keyframes iot4Air {
    0%,100% {opacity:.1;translate:-10px 0;}
    50% {opacity:.85;translate:14px -3px;}
}
#wj-technology .iot4-assistant-marker {
    position:absolute;
    bottom:12%;
    right:10%;
    width:25px;
    height:25px;
    border:1px solid #f1d49c;
    border-radius:8px;
    background:#d9bd8238;
    opacity:0;
    transform:scale(.7);
    transition:opacity .3s,transform .3s;
}
#wj-technology .iot4-assistant-marker::before,
#wj-technology .iot4-assistant-marker::after {
    content:"";
    position:absolute;
    top:9px;
    width:4px;height:4px;
    border-radius:50%;
    background:#ffe4ae;
}
#wj-technology .iot4-assistant-marker::before {left:6px;}
#wj-technology .iot4-assistant-marker::after {right:6px;}
#wj-technology .iot3-agent-on .iot4-assistant-marker {
    opacity:1;transform:scale(1);
}

/* Keep robot, buttons and ONE direct response. No chat history. */
#wj-technology .iot3-chat-log,
#wj-technology .iot3-quick,
#wj-technology .iot3-form,
#wj-technology .iot3-local-note {
    display:none!important;
}
#wj-technology .iot3-assistant {
    padding:13px;
    margin-top:12px;
}
#wj-technology .iot3-assistant-head {
    padding-bottom:10px;
}
#wj-technology .iot4-reply {
    margin-top:11px;
    padding:10px 12px;
    border-left:2px solid #d9bd82;
    background:#24232a;
    color:#eae0d4;
    font-size:12px;
    line-height:1.7;
    min-height:42px;
}
#wj-technology .iot4-actions {
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:6px;
    margin-top:11px;
}
#wj-technology .iot4-actions button {
    min-width:0;
    padding:9px 4px;
    border:1px solid #d9bd8275;
    background:#302a24;
    font:600 11px var(--font-tech),monospace;
    color:#f5deb1;
}
#wj-technology .iot4-actions button:hover {
    background:#483c2b;
}
#wj-technology .iot4-actions button:disabled {
    opacity:.3;cursor:not-allowed;
}
#wj-technology .iotx-home-button {
    padding:10px 12px;
}
#wj-technology .iotx-home-controls {gap:6px;}

/* GAME: overlay and targets are attached to actual artwork. */
#wj-technology .iot4-game {
    display:none;
    position:absolute;
    z-index:15;
    inset:0;
    pointer-events:none;
}
#wj-technology .iotx-workspace[data-scene="game"] .iot4-game {
    display:block;
}
#wj-technology .iot4-intro {
    position:absolute;
    inset:0;
    z-index:20;
    display:grid;
    align-content:center;
    justify-items:center;
    text-align:center;
    gap:12px;
    padding:24px;
    color:#fff;
    background:#120f1ca6;
    backdrop-filter:blur(9px);
    -webkit-backdrop-filter:blur(9px);
    pointer-events:none;
}
#wj-technology .iot4-intro[hidden] {display:none!important;}
#wj-technology .iot4-intro-kicker {
    color:#d3b9ff;
    font:600 10px var(--font-tech),monospace;
    letter-spacing:.18em;
}
#wj-technology .iot4-intro strong {
    font-size:clamp(20px,2.5vw,32px);
    line-height:1.4;
}
#wj-technology .iot4-intro small {
    max-width:320px;
    color:#ddd5e7;
    font-size:12px;
    line-height:1.8;
}
#wj-technology .iot4-hotspot {
    position:absolute;
    z-index:18;
    width:44px;height:44px;
    border:2px solid #ebd2ff;
    border-radius:50%;
    background:#7a4baa33;
    color:#fff;
    transform:translate(-50%,-50%);
    pointer-events:auto;
    display:grid;
    place-items:center;
    box-shadow:0 0 0 7px #b992ee2a,
               0 0 20px #d3aafa88;
    animation:iot4Pulse 1.5s ease-in-out infinite;
}
#wj-technology .iot4-hotspot[hidden] {display:none!important;}
#wj-technology .iot4-hotspot::before {
    content:"";
    width:9px;height:9px;
    border-radius:50%;
    background:#f3e2ff;
    box-shadow:0 0 8px #fff;
}
#wj-technology .iot4-hotspot:hover {
    background:#c28def83;
}
@keyframes iot4Pulse {
    0%,100% {box-shadow:0 0 0 6px #b992ee25,0 0 16px #d3aafa77;}
    50% {box-shadow:0 0 0 15px #b992ee08,0 0 30px #d3aafaac;}
}
#wj-technology .iot4-hit {
    position:absolute;
    z-index:17;
    width:18px;height:18px;
    border:2px solid #f1e4ff;
    border-radius:50%;
    opacity:0;
    transform:translate(-50%,-50%);
    pointer-events:none;
}
#wj-technology .iot4-hit.burst {
    animation:iot4Burst .42s ease-out both;
}
@keyframes iot4Burst {
    0% {width:18px;height:18px;opacity:1;}
    100% {width:115px;height:115px;opacity:0;}
}
#wj-technology .iotx-demo[data-demo="game"] .iotx-game-board,
#wj-technology .iotx-demo[data-demo="game"] .iotx-game-foot {
    display:none!important;
}
#wj-technology .iot3-scorebox {
    margin-top:0;
}
#wj-technology .iot3-restart {
    font-weight:700!important;
    letter-spacing:.12em;
    padding:13px;
}
#wj-technology .iot3-restart:hover {
    background:#53416a;
}
@media(max-width:860px) {
    #wj-technology .iotx-workspace,
    #wj-technology .iotx-workspace[data-scene] {
        grid-template-columns:1fr!important;
    }
}
@media(max-width:520px) {
    #wj-technology .iotx-screen,
    #wj-technology .iotx-workspace[data-scene] .iotx-screen {
        min-height:clamp(310px,53svh,490px);
    }
    #wj-technology .iot4-fan {
        width:43px;height:43px;
    }
    #wj-technology .iot4-fan span {font-size:27px;}
}
@media(prefers-reduced-motion:reduce) {
    #wj-technology .iot4-home *,
    #wj-technology .iot4-game *,
    #wj-technology .iot4-assistant-marker,
    #wj-technology .iot3-artboard .iotx-photo {
        animation:none!important;
        transition:none!important;
    }
}
`;
    const style = document.createElement("style");
    style.id = "wj-iot-v4-style";
    style.textContent = css;
    document.head.appendChild(style);

    // Remove the unwanted photo-corner label.
    root.querySelector(".iot3-rail-note")?.remove();

    art.insertAdjacentHTML("beforeend", `
      <div class="iot4-home" aria-hidden="true">
        <div class="iot4-light"></div>
        <div class="iot4-env">
          <div class="iot4-fan"><span>✳</span></div>
          <div class="iot4-device">◉</div>
          <span class="iot4-airline"></span>
          <span class="iot4-airline"></span>
          <span class="iot4-airline"></span>
        </div>
        <div class="iot4-assistant-marker"></div>
      </div>
      <div class="iot4-game">
        <div class="iot4-intro">
          <span class="iot4-intro-kicker">SENSOR / INTERACTIVE MISSION</span>
          <strong class="iot4-intro-title">
            請找發光目標捕捉訊號
          </strong>
          <small class="iot4-intro-detail">
            在照片中的五個真實場景物件上完成感知訊號定位。
            按下 START 開始遊玩。
          </small>
        </div>
        <button type="button" class="iot4-hotspot"
                aria-label="捕捉感知訊號" hidden></button>
        <div class="iot4-hit" aria-hidden="true"></div>
      </div>
    `);

    // -------------------------------------------
    // Fit different SVGs into the fixed display.
    // Never change the outer workspace proportions.
    // -------------------------------------------
    let pendingFit = false;

    function fitArtwork() {
        const scene = workspace.dataset.scene;
        let ratio = aspect[scene] || 1;
        const intrinsic = image.naturalHeight
            ? image.naturalWidth / image.naturalHeight
            : 0;

        // Ignore fallback SVG default ratios such as 300x150.
        if (intrinsic > ratio * .8 && intrinsic < ratio * 1.2) {
            ratio = intrinsic;
        }

        const width = screen.clientWidth;
        const height = screen.clientHeight;
        if (width < 10 || height < 10) return;

        const margin = width < 520 ? 10 : 16;
        const availableW = width - margin * 2;
        const availableH = height - margin * 2;

        const imageW = Math.min(availableW, availableH * ratio);
        const imageH = imageW / ratio;

        art.style.width = Math.floor(imageW) + "px";
        art.style.height = Math.floor(imageH) + "px";
        art.style.maxHeight = "none";
        art.style.aspectRatio = "auto";
    }

    function requestFit() {
        if (pendingFit) return;
        pendingFit = true;
        requestAnimationFrame(() => {
            pendingFit = false;
            fitArtwork();
        });
    }

    image.addEventListener("load", requestFit);
    window.addEventListener("resize", requestFit, {passive:true});

    if ("ResizeObserver" in window) {
        const resize = new ResizeObserver(requestFit);
        resize.observe(screen);
    }

    // -------------------------------------------
    // Smart home: buttons have visible consequences.
    // Direct reply ONLY; no chat log or input field.
    // -------------------------------------------
    const home = root.querySelector('[data-demo="home"]');
    const assistant = home?.querySelector(".iot3-assistant");
    const switches = [...(home?.querySelectorAll("[data-switch]") || [])];

    function getSwitch(id) {
        return switches.find(b => b.dataset.switch === id);
    }
    function on(id) {
        return getSwitch(id)?.getAttribute("aria-pressed") === "true";
    }
    function setSwitch(id, enabled) {
        const button = getSwitch(id);
        if (button && on(id) !== enabled) button.click();
    }

    if (assistant) {
        assistant.insertAdjacentHTML("beforeend", `
          <div class="iot4-reply" role="status" aria-live="polite">
            智慧控制就緒。請選擇操作指令。
          </div>
          <div class="iot4-actions">
            <button type="button" data-action="lightOn">開燈</button>
            <button type="button" data-action="lightOff">關燈</button>
            <button type="button" data-action="morning">早安情境</button>
          </div>
        `);

        const reply = assistant.querySelector(".iot4-reply");
        const commands = [...assistant.querySelectorAll(".iot4-actions button")];

        function syncDevice() {
            commands.forEach(button => button.disabled = !on("device"));
            if (!on("device")) {
                reply.textContent = "智慧設備已休眠。請先開啟智慧設備。";
            }
        }

        switches.forEach(button => {
            button.addEventListener("click", () => {
                requestAnimationFrame(() => {
                    syncDevice();

                    if (button.dataset.switch === "light") {
                        reply.textContent = on("light")
                            ? "燈光已開啟，照片亮度恢復。"
                            : "燈光已關閉，照片進入暗光模式。";
                    } else if (button.dataset.switch === "climate") {
                        reply.textContent = on("climate")
                            ? "環境控制啟動，風扇與氣流示意正在運作。"
                            : "環境控制已停止。";
                    } else {
                        reply.textContent = on("device")
                            ? "智慧設備已連線，控制功能就緒。"
                            : "智慧設備已休眠。";
                    }
                });
            });
        });

        commands.forEach(button => {
            button.addEventListener("click", () => {
                if (!on("device")) return;

                switch (button.dataset.action) {
                    case "lightOn":
                        setSwitch("light", true);
                        reply.textContent = "已開燈：環境照明恢復。";
                        break;
                    case "lightOff":
                        setSwitch("light", false);
                        reply.textContent = "已關燈：進入暗光場景。";
                        break;
                    case "morning":
                        setSwitch("light", true);
                        setSwitch("climate", true);
                        reply.textContent =
                            "早安情境已啟用：照明及環境循環同步開啟。";
                        break;
                }
            });
        });

        syncDevice();
    }

    // -------------------------------------------
    // Real object-anchored game.
    // Coordinates follow the 5 objects marked by
    // the user on screenshot of IOT_p4.
    // -------------------------------------------
    const game = root.querySelector('[data-demo="game"]');
    const start = game?.querySelector(".iot3-restart");
    const score = game?.querySelector(".iot3-score");
    const meter = game?.querySelector(".iot3-meter i");
    const gameStatus = game?.querySelector(".iot3-game-status");
    const intro = art.querySelector(".iot4-intro");
    const introTitle = art.querySelector(".iot4-intro-title");
    const introDetail = art.querySelector(".iot4-intro-detail");
    const hotspot = art.querySelector(".iot4-hotspot");
    const impact = art.querySelector(".iot4-hit");

    // Coordinates relative to the SVG artwork, in percent.
    // NOT random points on the monitor.
    const targets = [
        {x:25,y:26,name:"教堂中的主教席"},
        {x:26,y:74,name:"心律感測器感測部位"},
        {x:69,y:26,name:"紅色光警告提示"},
        {x:85,y:34,name:"通關的純金鑰匙"},
        {x:67,y:69,name:"規則契約中的特殊圖騰"}
    ];

    let playing = false;
    let captured = 0;
    let busy = false;
    let nextTimer = 0;

    function updateScore() {
        if (score) {
            score.textContent =
                String(captured).padStart(2,"0") + " / 05";
        }
        if (meter) meter.style.width = (captured * 20) + "%";
    }

    function resetGame() {
        clearTimeout(nextTimer);
        playing = false;
        busy = false;
        captured = 0;
        hotspot.hidden = true;
        intro.hidden = false;
        introTitle.textContent = "請找發光目標捕捉訊號";
        introDetail.textContent =
            "在照片中的五個關鍵物件上完成定位。按 START 開始遊玩。";
        if (start) start.textContent = "START / 開始遊玩";
        if (gameStatus) {
            gameStatus.textContent =
                "準備就緒。按下 START 後，依序捕捉 5 個訊號。";
        }
        updateScore();
    }

    function showNext() {
        if (!playing || captured >= targets.length) return;

        const t = targets[captured];
        hotspot.style.left = t.x + "%";
        hotspot.style.top = t.y + "%";
        hotspot.setAttribute(
            "aria-label",
            "捕捉第 " + (captured + 1) + " 個目標：" + t.name
        );
        hotspot.hidden = false;
        busy = false;

        if (gameStatus) {
            gameStatus.textContent =
                "目標 " + (captured + 1) + "：請尋找「" + t.name + "」。";
        }
    }

    function beginGame() {
        resetGame();
        intro.hidden = true;
        playing = true;
        if (start) start.textContent = "START / 重新開始";
        showNext();
    }

    hotspot.addEventListener("click", () => {
        if (!playing || busy ||
            workspace.dataset.scene !== "game") return;

        busy = true;
        const t = targets[captured];
        hotspot.hidden = true;

        impact.style.left = t.x + "%";
        impact.style.top = t.y + "%";
        impact.classList.remove("burst");
        void impact.offsetWidth;
        impact.classList.add("burst");

        captured++;
        updateScore();

        if (captured === targets.length) {
            playing = false;
            intro.hidden = false;
            introTitle.textContent = "MISSION COMPLETE";
            introDetail.textContent =
                "五個關鍵物件已全部定位。可再次按 START 挑戰。";
            if (start) start.textContent = "START / 再玩一次";
            if (gameStatus) {
                gameStatus.textContent = "5 / 5 訊號捕捉成功！";
            }
            return;
        }

        nextTimer = setTimeout(showNext, reduced ? 0 : 260);
    });

    if (start) {
        start.textContent = "START / 開始遊玩";
        start.addEventListener("click", beginGame);
    }

    // Scene changes are already managed by V2/V3.
    // Observe state without modifying their tab switcher.
    let lastScene = "";

    function sceneChanged() {
        const scene = workspace.dataset.scene;
        if (scene === lastScene) return;

        lastScene = scene;
        clearTimeout(nextTimer);
        requestFit();

        if (scene === "game") {
            resetGame();
        } else {
            playing = false;
            hotspot.hidden = true;
        }
    }

    new MutationObserver(sceneChanged).observe(workspace, {
        attributes:true,
        attributeFilter:["data-scene"]
    });

    sceneChanged();
    requestFit();
})();

/* WJ-IOT-ASPECT-BLUR-FIX */
;(() => {
    "use strict";

    if (document.getElementById("wj-iot-display-fix")) return;

    const style = document.createElement("style");
    style.id = "wj-iot-display-fix";

    style.textContent = `
#wj-technology .iot4-intro {
    background: #120f1c55 !important;
    backdrop-filter: blur(2px) !important;
    -webkit-backdrop-filter: blur(2px) !important;
}

#wj-technology .iotx-screen {
    position: relative;
}

#wj-technology .iotx-screen > .iot3-artboard {
    position: absolute !important;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
    margin: 0 !important;
}

#wj-technology .iot3-artboard .iotx-photo {
    object-fit: contain;
    object-position: center;
}
`;

    document.head.appendChild(style);
})();