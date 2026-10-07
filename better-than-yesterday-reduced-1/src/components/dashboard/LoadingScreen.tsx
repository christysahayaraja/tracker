import { useEffect, useState } from "react";

const hunterCharacterUrl = "/track-loading.jpg";

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const started = performance.now();
    let frame = 0;
    const animate = (now: number) => {
      const next = Math.min(100, Math.round(((now - started) / 1900) * 100));
      setProgress(next);
      if (next < 100) frame = requestAnimationFrame(animate);
      else window.setTimeout(onComplete, 260);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [onComplete]);

  return (
    <div className="loading-screen" role="status" aria-label="Initializing your journey">
      <div className="loading-grid" aria-hidden />
      <div className="loading-particles" aria-hidden />
      <div className="hunter-aura" aria-hidden />
      <img className="hunter-character rounded-2xl shadow-2xl border border-primary/30" src={hunterCharacterUrl} alt="Hunter entering the progression system" />
      <div className="loading-copy">
        <p className="system-label">SYSTEM // AWAKENING</p>
        <h1>BETTER THAN YESTERDAY</h1>
        <p className="arise">ARISE.</p>
        <div className="loading-track"><span style={{ width: `${progress}%` }} /></div>
        <div className="loading-meta"><span>INITIALIZING YOUR JOURNEY...</span><strong>{progress}%</strong></div>
      </div>
    </div>
  );
}
