'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const WEBSITE_URL = 'https://sajda-union.vercel.app/';

export default function Page() {
  const [phase, setPhase] = useState<'intro' | 'countdown' | 'reveal' | 'live'>('intro');
  const [count, setCount] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearLaunchTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearLaunchTimer, [clearLaunchTimer]);

  const startLaunch = () => {
    clearLaunchTimer();
    setCount(3);
    setPhase('countdown');

    timerRef.current = setInterval(() => {
      setCount((value) => {
        if (value <= 1) {
          clearLaunchTimer();
          setPhase('reveal');

          window.setTimeout(() => setPhase('live'), 1700);
          return 1;
        }
        return value - 1;
      });
    }, 900);
  };

  const enterWebsite = () => {
    window.location.href = WEBSITE_URL;
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && phase === 'intro') startLaunch();
      if (event.key === 'Escape' && phase !== 'intro') {
        clearLaunchTimer();
        setPhase('intro');
        setCount(3);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, clearLaunchTimer]);

  const isIntro = phase === 'intro';
  const isCountdown = phase === 'countdown';
  const isReveal = phase === 'reveal';
  const isLive = phase === 'live';

  return (
    <>
      <style jsx global>{styles}</style>
      <main className={`launch-page phase-${phase}`}>
      <div className="noise" aria-hidden="true" />
      <div className="grid" aria-hidden="true" />
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">S</div>
          <div>
            <div className="brand-name">SAJDA</div>
            <div className="brand-sub">CENTRAL COMMITTEE</div>
          </div>
        </div>

        <div className="edition">
          <span>OFFICIAL LAUNCH</span>
          <strong>2026 — 2027</strong>
        </div>
      </header>

      <section className="stage" aria-live="polite">
        <div className={`prelude ${isIntro ? 'visible' : ''}`}>
          <p className="eyebrow">A new digital chapter</p>
          <h1>
            <span>SAJDA</span>
            <em>Hub</em>
          </h1>
          <p className="descriptor">
            The official digital platform for the SAJDA Central Committee.
          </p>

          <button className="launch-button" onClick={startLaunch} type="button">
            <span>Begin official launch</span>
            <span className="button-arrow" aria-hidden="true">↗</span>
          </button>

          <p className="hint">Press Enter to begin</p>
        </div>

        <div className={`countdown ${isCountdown ? 'visible' : ''}`} aria-hidden={!isCountdown}>
          <div className="count-label">THE LAUNCH BEGINS IN</div>
          <div className="count-number" key={count}>{count}</div>
        </div>

        <div className={`reveal ${isReveal || isLive ? 'visible' : ''}`}>
          <div className="reveal-line" />
          <p className="eyebrow">Officially unveiled</p>
          <div className="reveal-title">
            <span>SAJDA</span>
            <strong>HUB.</strong>
          </div>
          <p className="reveal-copy">
            The digital platform of the SAJDA Central Committee is now live.
          </p>
          <div className="live-pill"><span /> LIVE • 2026 — 2027</div>
        </div>

        <div className={`live-action ${isLive ? 'visible' : ''}`}>
          <button className="enter-button" onClick={enterWebsite} type="button">
            Enter SAJDA Hub <span aria-hidden="true">↗</span>
          </button>
        </div>
      </section>

      <footer className="footer">
        <span>Students Association of Jamia Nooriyya Arabic Colleges</span>
        <span className="footer-dot">•</span>
        <span>Official Digital Platform</span>
      </footer>

      <div className="corner corner-tl" aria-hidden="true" />
      <div className="corner corner-br" aria-hidden="true" />
      </main>
    </>
  );
}

const styles = `
  :root {
    --bg: #07090b;
    --panel: #0c1013;
    --text: #f5f7f8;
    --muted: #8f989f;
    --line: rgba(255, 255, 255, 0.12);
    --accent: #cfd8dc;
  }

  * { box-sizing: border-box; }

  html, body { margin: 0; min-height: 100%; background: var(--bg); }
  body { overflow: hidden; }
  button { font: inherit; }

  .launch-page {
    position: relative;
    min-height: 100svh;
    overflow: hidden;
    background:
      radial-gradient(circle at 50% 46%, rgba(206, 214, 219, 0.07), transparent 30%),
      linear-gradient(180deg, #0a0c0e 0%, #07090b 55%, #060708 100%);
    color: var(--text);
    isolation: isolate;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .noise {
    position: absolute;
    inset: -50%;
    pointer-events: none;
    opacity: 0.045;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.95'/%3E%3C/svg%3E");
    transform: rotate(5deg);
    z-index: -1;
  }

  .grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.22;
    background-image:
      linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: radial-gradient(circle at center, black 18%, transparent 78%);
    -webkit-mask-image: radial-gradient(circle at center, black 18%, transparent 78%);
  }

  .ambient {
    position: absolute;
    width: 40vw;
    height: 40vw;
    min-width: 340px;
    min-height: 340px;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.12;
    pointer-events: none;
    z-index: -1;
  }

  .ambient-one {
    top: -18vw;
    left: -10vw;
    background: #bfc7cc;
    animation: drift-one 13s ease-in-out infinite alternate;
  }

  .ambient-two {
    right: -18vw;
    bottom: -20vw;
    background: #68737a;
    animation: drift-two 17s ease-in-out infinite alternate;
  }

  .topbar, .footer {
    position: absolute;
    left: clamp(24px, 4vw, 64px);
    right: clamp(24px, 4vw, 64px);
    z-index: 10;
  }

  .topbar {
    top: clamp(22px, 4vh, 40px);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .brand-lockup { display: flex; gap: 13px; align-items: center; }

  .brand-mark {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border: 1px solid var(--line);
    background: rgba(255,255,255,0.03);
    color: #fff;
    font-weight: 700;
    font-size: 16px;
    letter-spacing: -0.03em;
  }

  .brand-name { font-size: 13px; font-weight: 800; letter-spacing: 0.18em; }
  .brand-sub { margin-top: 2px; font-size: 8px; letter-spacing: 0.18em; color: var(--muted); }

  .edition { text-align: right; }
  .edition span { display: block; font-size: 8px; letter-spacing: 0.2em; color: var(--muted); }
  .edition strong { display: block; margin-top: 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; color: #dfe4e7; }

  .stage {
    position: relative;
    min-height: 100svh;
    display: grid;
    place-items: center;
    padding: 100px 24px 92px;
    text-align: center;
  }

  .prelude, .countdown, .reveal {
    position: absolute;
    left: 24px;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
  }

  .prelude { opacity: 0; visibility: hidden; transition: opacity .65s ease, visibility .65s ease; }
  .prelude.visible { opacity: 1; visibility: visible; }

  .eyebrow {
    margin: 0 0 20px;
    color: #9fa8ad;
    font-size: 9px;
    font-weight: 650;
    letter-spacing: 0.24em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-size: clamp(74px, 13vw, 180px);
    font-weight: 780;
    line-height: 0.86;
    letter-spacing: -0.085em;
  }

  h1 span { display: block; }
  h1 em {
    display: block;
    margin-left: 0.12em;
    font-size: 0.34em;
    line-height: 1;
    font-weight: 350;
    font-style: normal;
    letter-spacing: 0.04em;
    color: #b3bcc1;
  }

  .descriptor {
    max-width: 520px;
    margin: 28px auto 0;
    color: #949da3;
    font-size: 14px;
    line-height: 1.75;
  }

  .launch-button, .enter-button {
    border: 0;
    cursor: pointer;
    transition: transform .25s ease, background .25s ease, color .25s ease, box-shadow .25s ease;
  }

  .launch-button {
    margin-top: 36px;
    padding: 15px 18px 15px 20px;
    display: inline-flex;
    align-items: center;
    gap: 28px;
    background: #f1f4f5;
    color: #0a0c0e;
    font-size: 11px;
    font-weight: 750;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .launch-button:hover { transform: translateY(-2px); box-shadow: 0 14px 38px rgba(255,255,255,0.11); }
  .button-arrow { font-size: 18px; line-height: 1; }

  .hint { margin: 18px 0 0; color: #646d73; font-size: 9px; letter-spacing: 0.12em; }

  .countdown { opacity: 0; visibility: hidden; transition: opacity .35s ease, visibility .35s ease; }
  .countdown.visible { opacity: 1; visibility: visible; }
  .count-label { margin-bottom: 10px; color: #899197; font-size: 9px; font-weight: 650; letter-spacing: .24em; }
  .count-number {
    font-size: clamp(150px, 30vw, 400px);
    line-height: .8;
    font-weight: 250;
    letter-spacing: -0.09em;
    color: #f5f7f8;
    animation: count-in .82s cubic-bezier(.18,.84,.24,1);
    text-shadow: 0 0 70px rgba(255,255,255,.06);
  }

  .reveal {
    opacity: 0;
    visibility: hidden;
    transition: opacity .7s ease, visibility .7s ease;
  }

  .reveal.visible { opacity: 1; visibility: visible; }
  .reveal-line {
    width: 1px;
    height: 68px;
    margin: 0 auto 24px;
    background: linear-gradient(to bottom, transparent, #dce2e6, transparent);
    animation: line-grow .8s ease both;
  }

  .reveal-title {
    display: flex;
    justify-content: center;
    align-items: baseline;
    gap: 15px;
    line-height: .95;
    letter-spacing: -0.07em;
  }

  .reveal-title span { font-size: clamp(58px, 10vw, 132px); font-weight: 400; }
  .reveal-title strong { font-size: clamp(62px, 11vw, 148px); font-weight: 800; }
  .reveal-copy { max-width: 560px; margin: 28px auto 0; color: #919ba1; font-size: 14px; line-height: 1.7; }

  .live-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 22px;
    padding: 8px 11px;
    border: 1px solid rgba(255,255,255,.09);
    background: rgba(255,255,255,.025);
    color: #aab3b8;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: .18em;
  }

  .live-pill span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #e9eef0;
    box-shadow: 0 0 14px rgba(255,255,255,.55);
    animation: pulse 1.5s ease-in-out infinite;
  }

  .live-action {
    position: absolute;
    left: 24px;
    right: 24px;
    bottom: clamp(100px, 14vh, 150px);
    opacity: 0;
    transform: translateY(12px);
    pointer-events: none;
    transition: opacity .6s ease, transform .6s ease;
  }

  .live-action.visible { opacity: 1; transform: translateY(0); pointer-events: auto; }

  .enter-button {
    min-width: 220px;
    padding: 15px 20px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.16);
    color: #f1f4f5;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    backdrop-filter: blur(16px);
  }

  .enter-button span { margin-left: 14px; font-size: 16px; }
  .enter-button:hover { transform: translateY(-2px); background: rgba(255,255,255,.09); }

  .footer {
    bottom: clamp(20px, 3vh, 30px);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 9px;
    color: #5d666b;
    font-size: 8px;
    letter-spacing: .1em;
    text-align: center;
    text-transform: uppercase;
  }
  .footer-dot { color: #343b40; }

  .corner {
    position: absolute;
    width: 54px;
    height: 54px;
    opacity: .55;
    pointer-events: none;
  }
  .corner-tl { top: 92px; left: 24px; border-top: 1px solid rgba(255,255,255,.11); border-left: 1px solid rgba(255,255,255,.11); }
  .corner-br { right: 24px; bottom: 70px; border-right: 1px solid rgba(255,255,255,.08); border-bottom: 1px solid rgba(255,255,255,.08); }

  @keyframes count-in {
    0% { opacity: 0; transform: scale(.76); filter: blur(9px); }
    70% { opacity: 1; transform: scale(1.025); filter: blur(0); }
    100% { transform: scale(1); }
  }

  @keyframes line-grow { from { height: 0; opacity: 0; } to { height: 68px; opacity: 1; } }
  @keyframes pulse { 0%,100% { opacity: .3; transform: scale(.7); } 50% { opacity: 1; transform: scale(1); } }
  @keyframes drift-one { from { transform: translate3d(0,0,0); } to { transform: translate3d(8vw, 7vh, 0); } }
  @keyframes drift-two { from { transform: translate3d(0,0,0); } to { transform: translate3d(-7vw, -5vh, 0); } }

  @media (max-width: 640px) {
    .topbar { align-items: flex-start; }
    .edition { max-width: 110px; }
    .brand-sub { display: none; }
    .stage { padding-inline: 18px; }
    .descriptor { max-width: 320px; font-size: 13px; }
    .reveal-title { gap: 7px; }
    .footer { left: 18px; right: 18px; gap: 6px; font-size: 7px; }
    .corner-tl { left: 18px; }
    .corner-br { right: 18px; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

