// app/launch/page.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Phase = 'intro' | 'syncing' | 'countdown' | 'reveal' | 'opening';

const WEBSITE_URL = 'https://sajda-union.vercel.app/';

const syncSteps = [
  'Establishing secure connection',
  'Synchronising committee data',
  'Indexing programmes and records',
  'Validating live metrics',
  'Finalising the digital platform',
] as const;

const particles = Array.from({ length: 30 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 61) % 100}%`,
  delay: `${-(index * 0.21).toFixed(2)}s`,
  duration: `${(4.5 + (index % 7) * 0.45).toFixed(2)}s`,
}));

export default function Page() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [progress, setProgress] = useState(0);
  const [count, setCount] = useState(3);
  const [syncIndex, setSyncIndex] = useState(0);

  const timers = useRef<number[]>([]);
  const frame = useRef<number | null>(null);
  const started = useRef(false);

  const clearAll = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];

    if (frame.current !== null) {
      window.cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  }, []);

  const schedule = useCallback(
    (callback: () => void, ms: number): number => {
      const id = window.setTimeout(callback, ms);
      timers.current.push(id);
      return id;
    },
    [],
  );

  const beginCountdown = useCallback(() => {
    setPhase('countdown');
    setCount(3);

    schedule(() => setCount(2), 900);
    schedule(() => setCount(1), 1800);
    schedule(() => setPhase('reveal'), 2700);
    schedule(() => setPhase('opening'), 4350);

    schedule(() => {
      window.location.assign(WEBSITE_URL);
    }, 5700);
  }, [schedule]);

  const startLaunch = useCallback(() => {
    if (started.current) return;

    started.current = true;
    clearAll();

    setPhase('syncing');
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

    [600, 1250, 1900, 2550].forEach((ms, index) => {
      schedule(() => setSyncIndex(index + 1), ms);
    });

    schedule(beginCountdown, duration + 120);
  }, [beginCountdown, clearAll, schedule]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (started.current) return;

      if (event.code === 'Space') {
        event.preventDefault();
        startLaunch();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      clearAll();
    };
  }, [clearAll, startLaunch]);

  const currentSyncStep =
    syncSteps[Math.min(syncIndex, syncSteps.length - 1)];

  return (
    <main className={`launch launch--${phase}`}>
      <style jsx global>{styles}</style>

      <div className="background-glow background-glow--one" />
      <div className="background-glow background-glow--two" />
      <div className="grid" />
      <div className="top-line" />

      {particles.map((particle) => (
        <span
          key={particle.id}
          className="particle"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}

      <header className="header">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <div className="brand-name">SAJDA</div>
            <div className="brand-sub">CENTRAL COMMITTEE</div>
          </div>
        </div>

        <div className="year">
          <span>OFFICIAL DIGITAL PLATFORM</span>
          <strong>2026 — 2027</strong>
        </div>
      </header>

      <div className="stage">
        {phase === 'intro' && (
          <section className="scene intro">
            <div className="intro-eyebrow">
              <span className="dot" />
              OFFICIAL WEBSITE UNVEILING
            </div>

            <div className="monogram">
              <div className="monogram-ring monogram-ring--one" />
              <div className="monogram-ring monogram-ring--two" />
              <div className="monogram-core">S</div>
            </div>

            <p className="eyebrow-text">SAJDA HUB</p>

            <h1>
              The next chapter
              <br />
              <span>starts now.</span>
            </h1>

            <p className="copy">
              A connected digital platform for the work, programmes,
              records and momentum of the SAJDA Central Committee.
            </p>

            <button
              type="button"
              className="launch-button"
              onClick={startLaunch}
            >
              <span className="space-key">SPACE</span>
              <span>Begin official unveiling</span>
              <b>↗</b>
            </button>

            <p className="hint">ONE PRESS. THE REST IS AUTOMATIC.</p>
          </section>
        )}

        {phase === 'syncing' && (
          <section className="scene sync">
            <div className="system-ring" aria-hidden="true">
              <div className="system-core">S</div>
              <div className="orbit orbit--one" />
              <div className="orbit orbit--two" />
              <div className="orbit orbit--three" />
              <span className="node node--one" />
              <span className="node node--two" />
              <span className="node node--three" />
              <span className="node node--four" />
            </div>

            <p className="section-label">SYSTEM PREPARATION</p>

            <h2>
              Synchronising
              <br />
              <span>SAJDA Hub</span>
            </h2>

            <p className="sync-status">{currentSyncStep}</p>

            <div className="progress-wrap">
              <div className="progress-top">
                <span>DATABASE SYNC</span>
                <strong>{progress}%</strong>
              </div>

              <div className="progress-track">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="sync-grid">
              <span>COMMITTEES <b>SYNCED</b></span>
              <span>PROGRAMMES <b>INDEXED</b></span>
              <span>METRICS <b>VALIDATED</b></span>
            </div>
          </section>
        )}

        {phase === 'countdown' && (
          <section className="scene countdown" aria-live="assertive">
            <div className="count-ring count-ring--outer" />
            <div className="count-ring count-ring--mid" />
            <div className="count-ring count-ring--inner" />

            <p className="section-label">OFFICIAL UNVEILING</p>

            <div className="count" key={count}>
              {count}
            </div>

            <p className="count-label">THE PLATFORM WILL BE UNVEILED</p>
          </section>
        )}

        {(phase === 'reveal' || phase === 'opening') && (
          <section className="scene reveal">
            <div className="reveal-halo" aria-hidden="true" />

            <div className="reveal-rule" />

            <p className="section-label">OFFICIAL ANNOUNCEMENT</p>

            <div className="wordmark">
              <span>SAJDA</span>
              <strong>HUB.</strong>
            </div>

            <h2>is officially live.</h2>

            <p className="reveal-copy">
              The new digital platform of the SAJDA Central Committee
              is now open.
            </p>

            <div className="live-pill">
              <span />
              LIVE • 2026 — 2027
            </div>

            {phase === 'opening' && (
              <div className="opening">
                <span className="opening-dot" />
                OPENING SAJDA HUB
                <div className="opening-bar">
                  <span />
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <footer className="footer">
        <span>OFFICIAL LAUNCH EXPERIENCE</span>
        <i />
        <span>SAJDA CENTRAL COMMITTEE</span>
      </footer>
    </main>
  );
}

const styles = `
  :root {
    --paper: #ffffff;
    --ink: #101214;
    --muted: #697179;
    --soft: #a6adb3;
    --line: rgba(16, 18, 20, 0.09);
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    min-height: 100%;
    background: #fff;
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
    color: var(--ink);
    background:
      radial-gradient(
        circle at 50% 42%,
        rgba(0,0,0,.025),
        transparent 26%
      ),
      linear-gradient(
        180deg,
        #fff 0%,
        #fafafa 100%
      );
  }

  .launch::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        circle at center,
        transparent 0 42%,
        rgba(0,0,0,.02) 100%
      );
    pointer-events: none;
    z-index: 0;
  }

  .background-glow {
    position: absolute;
    border-radius: 999px;
    filter: blur(32px);
    pointer-events: none;
    opacity: .5;
  }

  .background-glow--one {
    width: 34vw;
    height: 34vw;
    left: -15vw;
    bottom: -15vw;
    background: rgba(35, 39, 43, .035);
    animation: driftOne 10s ease-in-out infinite alternate;
  }

  .background-glow--two {
    width: 30vw;
    height: 30vw;
    right: -12vw;
    top: 10vh;
    background: rgba(35, 39, 43, .028);
    animation: driftTwo 12s ease-in-out infinite alternate;
  }

  .grid {
    position: absolute;
    inset: 0;
    opacity: .32;
    background-image:
      linear-gradient(
        rgba(16,18,20,.025) 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        rgba(16,18,20,.025) 1px,
        transparent 1px
      );
    background-size: 44px 44px;
    mask-image:
      radial-gradient(
        circle at center,
        black 0%,
        rgba(0,0,0,.65) 48%,
        transparent 100%
      );
    pointer-events: none;
  }

  .top-line {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 1px;
    background: rgba(16,18,20,.08);
  }

  .particle {
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: rgba(16,18,20,.16);
    animation-name: particle;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    pointer-events: none;
  }

  .header {
    position: absolute;
    top: 24px;
    left: 28px;
    right: 28px;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-mark {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1px solid rgba(16,18,20,.14);
    background: #fff;
    font-size: 14px;
    font-weight: 800;
    box-shadow: 0 8px 28px rgba(16,18,20,.05);
  }

  .brand-name {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .16em;
  }

  .brand-sub {
    margin-top: 3px;
    color: #8a9196;
    font-size: 7px;
    letter-spacing: .18em;
  }

  .year {
    text-align: right;
  }

  .year span {
    display: block;
    color: #8b9297;
    font-size: 7px;
    letter-spacing: .2em;
  }

  .year strong {
    display: block;
    margin-top: 4px;
    color: #24282c;
    font-size: 10px;
    letter-spacing: .15em;
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
    padding: 100px 20px;
    animation: sceneIn .8s cubic-bezier(.2,.8,.2,1) both;
  }

  .intro {
    max-width: 900px;
    margin: auto;
  }

  .intro-eyebrow,
  .section-label {
    color: #80878c;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: .24em;
  }

  .intro-eyebrow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #151719;
    animation: pulse 1.4s ease-in-out infinite;
  }

  .monogram {
    position: relative;
    width: 118px;
    height: 118px;
    margin: 26px auto 26px;
  }

  .monogram-core {
    position: absolute;
    inset: 34px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 1px solid rgba(16,18,20,.15);
    background: #fff;
    box-shadow:
      0 0 0 12px rgba(16,18,20,.018),
      0 16px 60px rgba(16,18,20,.06);
    font-size: 23px;
    font-weight: 800;
  }

  .monogram-ring {
    position: absolute;
    inset: 8px;
    border: 1px solid rgba(16,18,20,.08);
    border-radius: 50%;
  }

  .monogram-ring--one {
    animation: spin 8s linear infinite;
  }

  .monogram-ring--two {
    inset: 18px 0;
    transform: rotate(54deg) scaleY(1.28);
    animation: spinReverse 6s linear infinite;
  }

  .eyebrow-text {
    margin: 0;
    color: #8a9196;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .32em;
  }

  h1 {
    margin: 12px 0 0;
    font-size: clamp(54px, 8vw, 108px);
    line-height: .92;
    letter-spacing: -.075em;
    font-weight: 350;
  }

  h1 span {
    color: #8d969c;
    font-weight: 300;
  }

  .copy {
    max-width: 610px;
    margin: 22px auto 0;
    color: #737b81;
    font-size: 13px;
    line-height: 1.8;
  }

  .launch-button {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-top: 30px;
    padding: 8px 11px 8px 8px;
    border: 1px solid rgba(16,18,20,.13);
    background: #fff;
    color: #17191b;
    box-shadow: 0 12px 30px rgba(16,18,20,.06);
    cursor: pointer;
    transition:
      transform .2s ease,
      box-shadow .2s ease,
      border-color .2s ease;
  }

  .launch-button:hover {
    transform: translateY(-2px);
    border-color: rgba(16,18,20,.22);
    box-shadow: 0 16px 36px rgba(16,18,20,.09);
  }

  .launch-button:focus-visible {
    outline: 2px solid #16181a;
    outline-offset: 4px;
  }

  .space-key {
    padding: 9px 12px;
    background: #111315;
    color: #fff;
    font-size: 8px;
    font-weight: 900;
    letter-spacing: .13em;
  }

  .launch-button > span:nth-child(2) {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .launch-button b {
    padding-left: 2px;
    color: #7e878c;
    font-size: 15px;
    font-weight: 400;
  }

  .hint {
    margin-top: 11px;
    color: #a1a7ab;
    font-size: 7px;
    letter-spacing: .16em;
  }

  .sync {
    max-width: 760px;
    margin: auto;
  }

  .system-ring {
    position: relative;
    width: 170px;
    height: 170px;
    margin: 0 auto 32px;
  }

  .system-core {
    position: absolute;
    inset: 55px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(16,18,20,.14);
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 14px 55px rgba(16,18,20,.07);
    font-size: 24px;
    font-weight: 800;
  }

  .orbit {
    position: absolute;
    border: 1px solid rgba(16,18,20,.08);
    border-radius: 50%;
  }

  .orbit--one {
    inset: 12px;
    transform: scaleX(1.12);
    animation: spin 7s linear infinite;
  }

  .orbit--two {
    inset: 3px 28px;
    transform: rotate(75deg) scaleY(1.3);
    animation: spinReverse 5.5s linear infinite;
  }

  .orbit--three {
    inset: 27px -2px;
    transform: rotate(-40deg) scaleX(1.25);
    animation: spin 9s linear infinite;
  }

  .node {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #111315;
    box-shadow: 0 0 0 6px rgba(16,18,20,.035);
    animation: pulse 1.2s ease-in-out infinite;
  }

  .node--one {
    top: 18px;
    left: 33px;
  }

  .node--two {
    top: 70px;
    right: 7px;
    animation-delay: .2s;
  }

  .node--three {
    bottom: 6px;
    left: 78px;
    animation-delay: .4s;
  }

  .node--four {
    left: 6px;
    top: 78px;
    animation-delay: .6s;
  }

  .sync h2 {
    margin: 14px 0 0;
    font-size: clamp(48px, 7vw, 84px);
    line-height: .92;
    letter-spacing: -.065em;
    font-weight: 460;
  }

  .sync h2 span {
    color: #8f979c;
    font-weight: 300;
  }

  .sync-status {
    min-height: 18px;
    margin-top: 15px;
    color: #747c82;
    font-size: 9px;
    letter-spacing: .15em;
    text-transform: uppercase;
  }

  .progress-wrap {
    width: min(470px, 88vw);
    margin: 28px auto 0;
  }

  .progress-top {
    display: flex;
    justify-content: space-between;
    color: #8b9297;
    font-size: 8px;
    letter-spacing: .15em;
  }

  .progress-top strong {
    color: #23272a;
  }

  .progress-track {
    position: relative;
    width: 100%;
    height: 2px;
    margin-top: 9px;
    overflow: hidden;
    background: rgba(16,18,20,.08);
  }

  .progress-track span {
    display: block;
    height: 100%;
    background: #111315;
    transition: width .15s ease;
  }

  .sync-grid {
    display: flex;
    justify-content: center;
    gap: 18px;
    flex-wrap: wrap;
    margin-top: 19px;
    color: #999fa3;
    font-size: 7px;
    letter-spacing: .12em;
  }

  .sync-grid b {
    color: #5b6267;
    font-weight: 800;
  }

  .count-ring {
    position: absolute;
    left: 50%;
    top: 51%;
    border: 1px solid rgba(16,18,20,.07);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .count-ring--outer {
    width: min(58vw, 620px);
    height: min(58vw, 620px);
    animation: spin 8s linear infinite;
  }

  .count-ring--mid {
    width: min(44vw, 470px);
    height: min(44vw, 470px);
    animation: spinReverse 6s linear infinite;
  }

  .count-ring--inner {
    width: min(30vw, 320px);
    height: min(30vw, 320px);
  }

  .count {
    position: relative;
    z-index: 2;
    font-size: clamp(180px, 29vw, 360px);
    line-height: .76;
    font-weight: 180;
    letter-spacing: -.12em;
    animation: countIn .82s cubic-bezier(.14,.86,.2,1);
  }

  .count-label {
    margin-top: 18px;
    color: #848b90;
    font-size: 8px;
    letter-spacing: .25em;
  }

  .reveal {
    max-width: 1100px;
    margin: auto;
  }

  .reveal-halo {
    position: absolute;
    left: 50%;
    top: 45%;
    width: min(42vw, 520px);
    height: min(42vw, 520px);
    transform: translate(-50%, -50%);
    border: 1px solid rgba(16,18,20,.05);
    border-radius: 50%;
    animation: halo 1.6s ease-out both;
  }

  .reveal-rule {
    width: 1px;
    height: 78px;
    margin: 0 auto 23px;
    background: linear-gradient(
      180deg,
      transparent,
      #17191b,
      transparent
    );
    animation: scaleIn .8s ease both;
  }

  .wordmark {
    display: flex;
    justify-content: center;
    align-items: baseline;
    gap: 13px;
    line-height: .88;
    letter-spacing: -.08em;
    animation: wordIn 1s .05s cubic-bezier(.18,.82,.23,1) both;
  }

  .wordmark span {
    font-size: clamp(70px, 11vw, 155px);
    font-weight: 330;
  }

  .wordmark strong {
    font-size: clamp(78px, 12vw, 176px);
    font-weight: 840;
  }

  .reveal h2 {
    margin: 14px 0 0;
    color: #7b8388;
    font-size: clamp(24px, 3vw, 36px);
    font-weight: 400;
    letter-spacing: -.03em;
    animation: fadeUp .7s .15s ease both;
  }

  .reveal-copy {
    max-width: 560px;
    margin: 18px auto 0;
    color: #777f84;
    font-size: 13px;
    line-height: 1.75;
    animation: fadeUp .7s .24s ease both;
  }

  .live-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 22px;
    padding: 8px 11px;
    border: 1px solid rgba(16,18,20,.11);
    background: rgba(255,255,255,.8);
    color: #676e73;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: .17em;
    animation: fadeUp .7s .32s ease both;
  }

  .live-pill span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #111315;
    animation: pulse 1.2s ease-in-out infinite;
  }

  .opening {
    position: absolute;
    left: 50%;
    bottom: 9vh;
    transform: translateX(-50%);
    color: #7d858a;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: .18em;
    animation: fadeUp .7s ease both;
  }

  .opening-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 8px;
    border-radius: 50%;
    background: #111315;
    vertical-align: -1px;
    animation: pulse 1.2s ease-in-out infinite;
  }

  .opening-bar {
    width: 210px;
    height: 2px;
    margin: 11px auto 0;
    overflow: hidden;
    background: rgba(16,18,20,.07);
  }

  .opening-bar span {
    display: block;
    width: 28%;
    height: 100%;
    background: #111315;
    animation: sweep 1.15s ease-in-out infinite;
  }

  .footer {
    position: absolute;
    left: 24px;
    right: 24px;
    bottom: 20px;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    color: #a0a6aa;
    font-size: 7px;
    letter-spacing: .12em;
    text-align: center;
  }

  .footer i {
    width: 18px;
    height: 1px;
    background: rgba(16,18,20,.12);
  }

  @keyframes sceneIn {
    from {
      opacity: 0;
      transform: translateY(10px) scale(.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes driftOne {
    from { transform: translate3d(0, 0, 0); }
    to { transform: translate3d(7vw, -5vh, 0); }
  }

  @keyframes driftTwo {
    from { transform: translate3d(0, 0, 0); }
    to { transform: translate3d(-6vw, 7vh, 0); }
  }

  @keyframes particle {
    from {
      transform: translate3d(0, 0, 0) scale(.7);
      opacity: .06;
    }
    to {
      transform: translate3d(14px, -24px, 0) scale(1.2);
      opacity: .22;
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: .35;
      transform: scale(.76);
    }
    50% {
      opacity: 1;
      transform: scale(1.12);
    }
  }

  @keyframes spin {
    from { rotate: 0deg; }
    to { rotate: 360deg; }
  }

  @keyframes spinReverse {
    from { rotate: 360deg; }
    to { rotate: 0deg; }
  }

  @keyframes countIn {
    0% {
      opacity: 0;
      transform: scale(.62);
      filter: blur(11px);
    }
    68% {
      opacity: 1;
      transform: scale(1.04);
      filter: blur(0);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes halo {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(.55);
    }
    30% {
      opacity: .8;
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.5);
    }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scaleY(0);
    }
    to {
      opacity: 1;
      transform: scaleY(1);
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

  @keyframes sweep {
    0% {
      opacity: 0;
      transform: translateX(-150%);
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateX(430%);
    }
  }

  @media (max-width: 720px) {
    .header {
      left: 18px;
      right: 18px;
      top: 18px;
    }

    .brand-sub {
      display: none;
    }

    .year span {
      font-size: 6px;
    }

    .year strong {
      font-size: 9px;
    }

    .scene {
      padding: 90px 18px 90px;
    }

    .copy {
      font-size: 12px;
    }

    .sync-grid {
      gap: 10px 14px;
    }

    .footer {
      left: 16px;
      right: 16px;
      bottom: 13px;
      flex-wrap: wrap;
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
