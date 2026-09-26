"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Phase = "intro" | "syncing" | "countdown" | "reveal" | "live";
type TimerId = ReturnType<typeof window.setTimeout>;

const WEBSITE_URL = "https://sajda-union.vercel.app/";

const syncSteps = [
  "Establishing secure connection",
  "Synchronising committee data",
  "Indexing programmes and records",
  "Validating live metrics",
  "Finalising the digital platform",
];

export default function Page() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [progress, setProgress] = useState(0);
  const [count, setCount] = useState(3);
  const [syncIndex, setSyncIndex] = useState(0);
  const timers = useRef<number[]>([]);
  const frame = useRef<number | null>(null);
  const started = useRef(false);

  const clearAll = useCallback(() => {
    timers.current.forEach((id) => {
      window.clearTimeout(id);
    });

    timers.current = [];

    if (frame.current !== null) {
      window.cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  }, []);

  const schedule = useCallback((fn: () => void, ms: number): number => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  const beginCountdown = useCallback(() => {
    setPhase("countdown");
    setCount(3);

    schedule(() => setCount(2), 900);
    schedule(() => setCount(1), 1800);
    schedule(() => setPhase("reveal"), 2700);
    schedule(() => setPhase("live"), 4050);

    // Automatically open the real SAJDA website.
    schedule(() => {
      window.location.assign(WEBSITE_URL);
    }, 6800);
  }, [schedule]);

  const startLaunch = useCallback(() => {
    if (started.current) return;

    started.current = true;
    clearAll();

    setPhase("syncing");
    setProgress(0);
    setSyncIndex(0);

    const duration = 3600;
    const start = window.performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - ratio, 3);

      setProgress(Math.round(eased * 100));

      if (elapsed < duration) {
        frame.current = window.requestAnimationFrame(animate);
      } else {
        frame.current = null;
      }
    };

    frame.current = window.requestAnimationFrame(animate);

    [650, 1350, 2050, 2800].forEach((ms, index) => {
      schedule(() => setSyncIndex(index + 1), ms);
    });

    schedule(beginCountdown, duration + 180);
  }, [beginCountdown, clearAll, schedule]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (started.current) return;
      if (event.code !== "Space") return;

      event.preventDefault();
      startLaunch();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [startLaunch]);

  useEffect(() => clearAll, [clearAll]);

  const activeSyncStep = syncSteps[Math.min(syncIndex, syncSteps.length - 1)];

  return (
    <main className={`launch launch--${phase}`}>
      <style jsx global>
        {styles}
      </style>

      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />
      <div className="grid" />
      <div className="scan" />
      <div className="grain" />

      {particles.map((particle) => (
        <i
          key={particle}
          className="particle"
          style={{ ["--i" as string]: particle }}
        />
      ))}

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">S</div>

          <div>
            <div className="brand-name">SAJDA</div>
            <div className="brand-sub">CENTRAL COMMITTEE</div>
          </div>
        </div>

        <div className="edition">
          <span>OFFICIAL DIGITAL PLATFORM</span>
          <strong>2026 — 2027</strong>
        </div>
      </header>

      <div className="stage">
        {phase === "intro" && (
          <section className="intro scene scene--active">
            <div className="eyebrow">
              <span className="status-dot" />
              OFFICIAL WEBSITE UNVEILING
            </div>

            <div className="hero-mark">
              <div className="hero-mark-ring hero-mark-ring--a" />
              <div className="hero-mark-ring hero-mark-ring--b" />
              <div className="hero-mark-core">S</div>
            </div>

            <p className="kicker">SAJDA HUB</p>

            <h1>
              The next chapter
              <br />
              <span>starts now.</span>
            </h1>

            <p className="intro-copy">
              One connected digital platform for the work, programmes, records
              and momentum of the SAJDA Central Committee.
            </p>

            <button
              type="button"
              className="launch-button"
              onClick={startLaunch}
              aria-label="Begin official SAJDA website unveiling"
            >
              <span className="keycap">SPACE</span>
              <span className="button-text">Begin official unveiling</span>
              <span className="button-arrow">↗</span>
            </button>

            <div className="one-press">ONE PRESS. THE REST IS AUTOMATIC.</div>
          </section>
        )}

        {phase === "syncing" && (
          <section className="sync scene scene--active" aria-live="polite">
            <div className="sync-visual" aria-hidden="true">
              <div className="sync-core">
                <span>S</span>
              </div>

              <div className="sync-orbit sync-orbit--1" />
              <div className="sync-orbit sync-orbit--2" />
              <div className="sync-orbit sync-orbit--3" />

              <i className="sync-node sync-node--1" />
              <i className="sync-node sync-node--2" />
              <i className="sync-node sync-node--3" />
              <i className="sync-node sync-node--4" />
            </div>

            <p className="section-label">SYSTEM PREPARATION</p>

            <h2>
              Synchronising
              <br />
              <span>SAJDA Hub</span>
            </h2>

            <p className="sync-status">{activeSyncStep}</p>

            <div className="sync-meta">
              <span>DATABASE SYNC</span>
              <strong>{progress}%</strong>
            </div>

            <div className="sync-track">
              <span style={{ width: `${progress}%` }} />
            </div>

            <div className="sync-counters" aria-hidden="true">
              <span>
                COMMITTEES <b>SYNCED</b>
              </span>

              <span>
                PROGRAMMES <b>INDEXED</b>
              </span>

              <span>
                LIVE METRICS <b>VALIDATED</b>
              </span>
            </div>
          </section>
        )}

        {phase === "countdown" && (
          <section
            className="countdown scene scene--active"
            aria-live="assertive"
            aria-label={`Launching in ${count}`}
          >
            <div className="countdown-ring countdown-ring--outer" />
            <div className="countdown-ring countdown-ring--mid" />
            <div className="countdown-ring countdown-ring--inner" />

            <p className="section-label">OFFICIAL UNVEILING</p>

            <div className="count-number" key={count}>
              {count}
            </div>

            <div className="count-caption">THE PLATFORM WILL BE UNVEILED</div>

            <div className="count-footer">
              SAJDA CENTRAL COMMITTEE
              <span />
              2026 — 2027
            </div>
          </section>
        )}

        {(phase === "reveal" || phase === "live") && (
          <section className="reveal scene scene--active" aria-live="polite">
            <div className="reveal-burst" aria-hidden="true" />
            <div className="reveal-line" aria-hidden="true" />

            <p className="section-label">OFFICIAL ANNOUNCEMENT</p>

            <div className="wordmark">
              <span>SAJDA</span>
              <strong>HUB.</strong>
            </div>

            <p className="reveal-title">is officially live.</p>

            <p className="reveal-copy">
              The new digital platform of the SAJDA Central Committee is now
              open.
            </p>

            <div className="live-badge">
              <i />
              LIVE • 2026 — 2027
            </div>
          </section>
        )}

        {phase === "live" && (
          <div className="opening" aria-live="polite">
            <span className="opening-dot" />
            OPENING SAJDA HUB
            <div className="opening-track">
              <span />
            </div>
          </div>
        )}
      </div>

      <footer className="footer">
        <span>Students Association of Jamia Nooriyya Arabic Colleges</span>

        <i />

        <span>Official launch experience</span>
      </footer>

      <div className="corner corner--tl" />
      <div className="corner corner--br" />
    </main>
  );
}

const styles = `
  :root {
    --bg: #07090c;
    --text: #f5f7f8;
    --muted: #7f8a92;
    --soft: #b7c1c7;
    --line: rgba(255,255,255,.10);
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    min-height: 100%;
    background: var(--bg);
  }

  body {
    overflow: hidden;
  }

  button {
    font: inherit;
  }

  .launch {
    position: relative;
    width: 100%;
    height: 100svh;
    overflow: hidden;
    isolation: isolate;
    color: var(--text);
    background:
      radial-gradient(
        circle at 50% 44%,
        rgba(220,230,236,.075),
        transparent 24%
      ),
      radial-gradient(
        circle at 10% 85%,
        rgba(102,130,148,.09),
        transparent 30%
      ),
      linear-gradient(
        145deg,
        #07090c 0%,
        #0b0f13 46%,
        #06080a 100%
      );
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .launch::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        circle at 50% 50%,
        transparent 0 42%,
        rgba(0,0,0,.44) 100%
      );
    pointer-events: none;
    z-index: 1;
  }

  .ambient {
    position: absolute;
    border-radius: 50%;
    filter: blur(4px);
    pointer-events: none;
    z-index: 0;
  }

  .ambient--one {
    width: 34vw;
    height: 34vw;
    left: -13vw;
    bottom: -14vw;
    background: rgba(95,121,138,.07);
    animation: driftOne 10s ease-in-out infinite alternate;
  }

  .ambient--two {
    width: 30vw;
    height: 30vw;
    right: -10vw;
    top: 12vh;
    background: rgba(220,229,235,.045);
    animation: driftTwo 12s ease-in-out infinite alternate;
  }

  .grid {
    position: absolute;
    inset: 0;
    opacity: .16;
    background-image:
      linear-gradient(
        rgba(255,255,255,.027) 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        rgba(255,255,255,.027) 1px,
        transparent 1px
      );
    background-size: 44px 44px;
    mask-image:
      radial-gradient(
        circle at center,
        black 0%,
        rgba(0,0,0,.65) 52%,
        transparent 100%
      );
    pointer-events: none;
    z-index: 0;
  }

  .scan {
    position: absolute;
    left: 0;
    top: -10vh;
    width: 100%;
    height: 1px;
    background:
      linear-gradient(
        90deg,
        transparent,
        rgba(220,233,239,.45),
        transparent
      );
    opacity: .18;
    animation: scan 8s linear infinite;
    pointer-events: none;
    z-index: 2;
  }

  .grain {
    position: absolute;
    inset: -40%;
    opacity: .04;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    transform: rotate(4deg);
    z-index: 6;
  }

  .particle {
    --i: 0;
    position: absolute;
    left: calc((var(--i) * 31) % 100 * 1%);
    top: calc((var(--i) * 47) % 100 * 1%);
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: rgba(235,242,245,.5);
    opacity: .14;
    animation:
      particleFloat
      calc(5s + (var(--i) * .13s))
      ease-in-out
      infinite
      alternate;
    animation-delay: calc(var(--i) * -.17s);
    pointer-events: none;
    z-index: 2;
  }

  .topbar,
  .footer {
    position: absolute;
    left: 28px;
    right: 28px;
    z-index: 10;
  }

  .topbar {
    top: 26px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .brand-mark {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(255,255,255,.035);
    box-shadow:
      inset 0 0 20px rgba(255,255,255,.025);
    font-size: 15px;
    font-weight: 800;
    letter-spacing: -.05em;
  }

  .brand-name {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .15em;
  }

  .brand-sub {
    margin-top: 3px;
    color: #68727a;
    font-size: 7px;
    letter-spacing: .19em;
  }

  .edition {
    text-align: right;
  }

  .edition span {
    display: block;
    color: #66727a;
    font-size: 7px;
    letter-spacing: .2em;
  }

  .edition strong {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    letter-spacing: .16em;
    font-weight: 700;
  }

  .stage {
    position: absolute;
    inset: 0;
    z-index: 4;
  }

  .scene {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    text-align: center;
    padding: 100px 26px 110px;
  }

  .scene--active {
    animation:
      sceneIn
      .8s
      cubic-bezier(.2,.8,.2,1)
      both;
  }

  .eyebrow,
  .section-label {
    color: #727e86;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: .24em;
  }

  .eyebrow {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .status-dot,
  .opening-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #edf3f5;
    box-shadow: 0 0 16px rgba(237,243,245,.7);
    animation: pulse 1.5s ease-in-out infinite;
  }

  .intro {
    max-width: 840px;
    margin: auto;
  }

  .hero-mark {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 22px auto 24px;
  }

  .hero-mark-core {
    position: absolute;
    inset: 33px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 50%;
    background: rgba(255,255,255,.03);
    box-shadow:
      0 0 70px rgba(211,226,234,.07),
      inset 0 0 22px rgba(255,255,255,.045);
    font-size: 22px;
    font-weight: 800;
  }

  .hero-mark-ring {
    position: absolute;
    inset: 7px;
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 50%;
  }

  .hero-mark-ring--a {
    transform: scaleX(1.1);
    animation: heroOrbit 8s linear infinite;
  }

  .hero-mark-ring--b {
    inset: 17px 0;
    transform:
      rotate(54deg)
      scaleY(1.3);
    animation: heroOrbitReverse 6s linear infinite;
  }

  .kicker {
    margin: 0;
    color: #839098;
    font-size: 9px;
    letter-spacing: .32em;
    font-weight: 800;
  }

  h1 {
    margin: 12px 0 0;
    font-size: clamp(52px, 8vw, 106px);
    line-height: .92;
    letter-spacing: -.07em;
    font-weight: 350;
  }

  h1 span {
    color: #9da9b0;
    font-weight: 300;
  }

  .intro-copy {
    max-width: 590px;
    margin: 22px auto 0;
    color: #7c878f;
    font-size: 13px;
    line-height: 1.8;
  }

  .launch-button {
    display: inline-flex;
    align-items: center;
    gap: 13px;
    margin-top: 30px;
    padding: 8px 11px 8px 8px;
    border: 1px solid rgba(255,255,255,.12);
    color: #edf2f4;
    background: rgba(255,255,255,.05);
    cursor: pointer;
    transition:
      transform .2s ease,
      border-color .2s ease,
      background .2s ease;
  }

  .launch-button:hover {
    transform: translateY(-2px);
    border-color: rgba(255,255,255,.24);
    background: rgba(255,255,255,.075);
  }

  .launch-button:focus-visible {
    outline: 2px solid rgba(220,233,239,.6);
    outline-offset: 4px;
  }

  .keycap {
    padding: 9px 12px;
    background: #edf2f4;
    color: #101316;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: .14em;
  }

  .button-text {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .button-arrow {
    padding-left: 4px;
    color: #96a2aa;
    font-size: 16px;
  }

  .one-press {
    margin-top: 12px;
    color: #505b63;
    font-size: 7px;
    letter-spacing: .17em;
  }

  .sync {
    max-width: 700px;
    margin: auto;
  }

  .sync-visual {
    position: relative;
    width: 170px;
    height: 170px;
    margin: 0 auto 34px;
  }

  .sync-core {
    position: absolute;
    inset: 54px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,.16);
    border-radius: 50%;
    background: rgba(255,255,255,.035);
    box-shadow: 0 0 70px rgba(205,220,228,.07);
  }

  .sync-core span {
    font-size: 25px;
    font-weight: 800;
  }

  .sync-orbit {
    position: absolute;
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 50%;
  }

  .sync-orbit--1 {
    inset: 14px;
    transform: scaleX(1.12);
    animation: orbit 7s linear infinite;
  }

  .sync-orbit--2 {
    inset: 3px 27px;
    transform:
      rotate(75deg)
      scaleY(1.33);
    animation: orbitReverse 5.5s linear infinite;
  }

  .sync-orbit--3 {
    inset: 28px -2px;
    transform:
      rotate(-40deg)
      scaleX(1.28);
    animation: orbit 9s linear infinite;
  }

  .sync-node {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #ebf1f4;
    box-shadow: 0 0 18px rgba(231,239,243,.7);
    animation: pulse 1.25s ease-in-out infinite;
  }

  .sync-node--1 {
    top: 20px;
    left: 32px;
  }

  .sync-node--2 {
    top: 69px;
    right: 8px;
    animation-delay: .25s;
  }

  .sync-node--3 {
    left: 78px;
    bottom: 5px;
    animation-delay: .5s;
  }

  .sync-node--4 {
    top: 78px;
    left: 5px;
    animation-delay: .75s;
  }

  .sync h2 {
    margin: 15px 0 0;
    font-size: clamp(48px, 7vw, 84px);
    line-height: .92;
    letter-spacing: -.065em;
    font-weight: 480;
  }

  .sync h2 span {
    color: #9ca8b0;
    font-weight: 300;
  }

  .sync-status {
    min-height: 18px;
    margin: 16px 0 0;
    color: #737f87;
    font-size: 9px;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .sync-meta {
    width: min(450px, 84vw);
    margin: 28px auto 0;
    display: flex;
    justify-content: space-between;
    color: #657079;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: .16em;
  }

  .sync-meta strong {
    color: #c2ccd1;
  }

  .sync-track {
    width: min(450px, 84vw);
    height: 2px;
    margin: 10px auto 0;
    overflow: hidden;
    background: rgba(255,255,255,.08);
  }

  .sync-track span {
    display: block;
    height: 100%;
    background:
      linear-gradient(
        90deg,
        #778d9e,
        #e9eef0
      );
    box-shadow: 0 0 16px rgba(214,227,234,.35);
    transition: width .15s ease;
  }

  .sync-counters {
    display: flex;
    justify-content: center;
    gap: 22px;
    flex-wrap: wrap;
    margin-top: 20px;
    color: #4e5961;
    font-size: 7px;
    letter-spacing: .13em;
  }

  .sync-counters b {
    color: #9da9b0;
    font-weight: 700;
  }

  .countdown {
    overflow: hidden;
  }

  .countdown-ring {
    position: absolute;
    left: 50%;
    top: 52%;
    transform: translate(-50%,-50%);
    border: 1px solid rgba(255,255,255,.055);
    border-radius: 50%;
    pointer-events: none;
  }

  .countdown-ring--outer {
    width: min(60vw, 620px);
    height: min(60vw, 620px);
    animation: ringSpin 7s linear infinite;
  }

  .countdown-ring--mid {
    width: min(46vw, 470px);
    height: min(46vw, 470px);
    opacity: .7;
    animation: ringSpinReverse 5s linear infinite;
  }

  .countdown-ring--inner {
    width: min(30vw, 320px);
    height: min(30vw, 320px);
    opacity: .55;
  }

  .count-number {
    position: relative;
    z-index: 2;
    margin-top: 4px;
    font-size: clamp(180px, 29vw, 360px);
    line-height: .75;
    letter-spacing: -.11em;
    font-weight: 180;
    animation:
      countImpact
      .85s
      cubic-bezier(.14,.86,.2,1);
    text-shadow: 0 0 90px rgba(224,235,240,.06);
  }

  .count-caption {
    margin-top: 17px;
    color: #6d7981;
    font-size: 8px;
    letter-spacing: .26em;
  }

  .count-footer {
    margin-top: 14px;
    color: #58636b;
    font-size: 7px;
    letter-spacing: .17em;
  }

  .count-footer span {
    display: inline-block;
    width: 4px;
    height: 4px;
    margin: 0 8px;
    border-radius: 50%;
    background: #9aa7ae;
    vertical-align: 1px;
  }

  .reveal {
    max-width: 1080px;
    margin: auto;
  }

  .reveal-burst {
    position: absolute;
    left: 50%;
    top: 46%;
    width: min(44vw, 520px);
    height: min(44vw, 520px);
    transform: translate(-50%,-50%);
    border: 1px solid rgba(255,255,255,.04);
    border-radius: 50%;
    animation: burst 1.6s ease-out both;
  }

  .reveal-burst::before,
  .reveal-burst::after {
    content: "";
    position: absolute;
    inset: 12%;
    border: 1px solid rgba(255,255,255,.03);
    border-radius: 50%;
  }

  .reveal-line {
    width: 1px;
    height: 76px;
    margin: 0 auto 24px;
    background:
      linear-gradient(
        180deg,
        transparent,
        #e5ecef,
        transparent
      );
    animation: lineIn .8s ease both;
  }

  .wordmark {
    display: flex;
    justify-content: center;
    align-items: baseline;
    gap: 14px;
    letter-spacing: -.08em;
    line-height: .9;
    animation:
      wordIn
      1s
      .05s
      cubic-bezier(.18,.82,.23,1)
      both;
  }

  .wordmark span {
    font-size: clamp(70px, 11vw, 155px);
    font-weight: 330;
  }

  .wordmark strong {
    font-size: clamp(78px, 12vw, 176px);
    font-weight: 830;
  }

  .reveal-title {
    margin: 14px 0 0;
    color: #b5c0c6;
    font-size: clamp(23px, 3vw, 35px);
    letter-spacing: -.035em;
    animation: fadeUp .7s .17s ease both;
  }

  .reveal-copy {
    max-width: 560px;
    margin: 18px auto 0;
    color: #7e8a92;
    font-size: 13px;
    line-height: 1.75;
    animation: fadeUp .7s .25s ease both;
  }

  .live-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 22px;
    padding: 8px 11px;
    border: 1px solid rgba(255,255,255,.11);
    background: rgba(255,255,255,.035);
    color: #acb8be;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: .18em;
    animation: fadeUp .7s .33s ease both;
  }

  .live-badge i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #eef4f6;
    box-shadow: 0 0 16px rgba(235,242,245,.7);
    animation: pulse 1.2s ease-in-out infinite;
  }

  .opening {
    position: absolute;
    left: 50%;
    bottom: 12vh;
    transform: translateX(-50%);
    color: #909ca4;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: .18em;
    text-align: center;
    animation: fadeUp .8s .1s ease both;
  }

  .opening-dot {
    display: inline-block;
    vertical-align: -1px;
    margin-right: 8px;
  }

  .opening-track {
    width: 210px;
    height: 2px;
    margin: 11px auto 0;
    overflow: hidden;
    background: rgba(255,255,255,.07);
  }

  .opening-track span {
    display: block;
    width: 32%;
    height: 100%;
    background:
      linear-gradient(
        90deg,
        transparent,
        #dfe8ec,
        transparent
      );
    animation: openSweep 1.2s ease-in-out infinite;
  }

  .footer {
    bottom: 23px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    color: #505b63;
    font-size: 7px;
    letter-spacing: .12em;
    text-transform: uppercase;
    text-align: center;
  }

  .footer i {
    width: 16px;
    height: 1px;
    background: #2c343a;
  }

  .corner {
    position: absolute;
    width: 54px;
    height: 54px;
    z-index: 10;
    opacity: .6;
    pointer-events: none;
  }

  .corner--tl {
    left: 25px;
    top: 86px;
    border-left: 1px solid rgba(255,255,255,.10);
    border-top: 1px solid rgba(255,255,255,.10);
  }

  .corner--br {
    right: 25px;
    bottom: 63px;
    border-right: 1px solid rgba(255,255,255,.08);
    border-bottom: 1px solid rgba(255,255,255,.08);
  }

  @keyframes sceneIn {
    from {
      opacity: 0;
      transform: scale(.985) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes driftOne {
    from {
      transform: translate3d(0,0,0);
    }
    to {
      transform: translate3d(7vw,-5vh,0);
    }
  }

  @keyframes driftTwo {
    from {
      transform: translate3d(0,0,0);
    }
    to {
      transform: translate3d(-6vw,7vh,0);
    }
  }

  @keyframes scan {
    from {
      transform: translateY(-10vh);
    }
    to {
      transform: translateY(120vh);
    }
  }

  @keyframes particleFloat {
    from {
      transform: translate3d(0,0,0) scale(.7);
      opacity: .05;
    }
    to {
      transform: translate3d(15px,-27px,0) scale(1.2);
      opacity: .3;
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(.72);
      opacity: .4;
    }
    50% {
      transform: scale(1.18);
      opacity: 1;
    }
  }

  @keyframes heroOrbit {
    from {
      rotate: 0deg;
    }
    to {
      rotate: 360deg;
    }
  }

  @keyframes heroOrbitReverse {
    from {
      rotate: 360deg;
    }
    to {
      rotate: 0deg;
    }
  }

  @keyframes orbit {
    from {
      rotate: 0deg;
    }
    to {
      rotate: 360deg;
    }
  }

  @keyframes orbitReverse {
    from {
      rotate: 360deg;
    }
    to {
      rotate: 0deg;
    }
  }

  @keyframes ringSpin {
    from {
      rotate: 0deg;
    }
    to {
      rotate: 360deg;
    }
  }

  @keyframes ringSpinReverse {
    from {
      rotate: 360deg;
    }
    to {
      rotate: 0deg;
    }
  }

  @keyframes countImpact {
    0% {
      opacity: 0;
      transform: scale(.62);
      filter: blur(13px);
    }
    65% {
      opacity: 1;
      transform: scale(1.04);
      filter: blur(0);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes lineIn {
    from {
      transform: scaleY(0);
      opacity: 0;
    }
    to {
      transform: scaleY(1);
      opacity: 1;
    }
  }

  @keyframes wordIn {
    from {
      opacity: 0;
      transform: translateY(24px) scale(.94);
      filter: blur(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes burst {
    0% {
      opacity: 0;
      transform: translate(-50%,-50%) scale(.55);
    }
    25% {
      opacity: .7;
    }
    100% {
      opacity: 0;
      transform: translate(-50%,-50%) scale(1.45);
    }
  }

  @keyframes openSweep {
    0% {
      transform: translateX(-150%);
      opacity: 0;
    }
    25% {
      opacity: 1;
    }
    75% {
      opacity: 1;
    }
    100% {
      transform: translateX(430%);
      opacity: 0;
    }
  }

  @media (max-width: 720px) {
    .topbar {
      left: 18px;
      right: 18px;
      top: 18px;
    }

    .brand-sub {
      display: none;
    }

    .edition span {
      font-size: 6px;
    }

    .edition strong {
      font-size: 9px;
    }

    .scene {
      padding: 92px 18px 100px;
    }

    .hero-mark {
      width: 96px;
      height: 96px;
      margin-top: 17px;
    }

    .hero-mark-core {
      inset: 28px;
    }

    .intro-copy {
      font-size: 12px;
      max-width: 460px;
    }

    .launch-button {
      margin-top: 24px;
    }

    .sync-counters {
      gap: 10px 16px;
    }

    .footer {
      left: 16px;
      right: 16px;
      bottom: 14px;
      flex-wrap: wrap;
    }

    .corner--tl {
      left: 18px;
      top: 72px;
    }

    .corner--br {
      right: 18px;
      bottom: 54px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
    }
  }
`;
