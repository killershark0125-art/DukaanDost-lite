import { useCallback, useEffect, useState } from 'react';

let landingDismissed = window.location.pathname !== '/';

function Landing() {
  const [phase, setPhase] = useState(landingDismissed ? 'gone' : 'closed');

  const openShutter = useCallback(() => {
    setPhase((current) => (current === 'closed' ? 'opening' : current));
  }, []);

  useEffect(() => {
    if (!landingDismissed) {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    if (phase === 'gone') return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'closed') return;

    let touchStartY = null;

    const handleWheel = (e) => {
      if (e.deltaY > 10) openShutter();
    };
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      if (touchStartY !== null && touchStartY - e.touches[0].clientY > 30) openShutter();
    };
    const handleKey = (e) => {
      if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) openShutter();
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKey);
    };
  }, [phase, openShutter]);

  useEffect(() => {
    if (phase !== 'opening') return;
    const timer = setTimeout(() => {
      landingDismissed = true;
      setPhase('gone');
    }, 1000);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === 'gone') {
    return null;
  }

  return (
    <section className={`landing ${phase === 'opening' ? 'landing-open' : ''}`} aria-label="Welcome">
      <div className="landing-center">
        <h1 className="landing-title">
          <span className="landing-word">Dukaan</span>
          <span className="landing-dost">
            Dost
            <small className="landing-lite">lite</small>
          </span>
        </h1>
        <p className="landing-tagline">Bazaar ki raunaq, ab aapke ghar tak.</p>
      </div>

      <button
        type="button"
        className="landing-scroll"
        onClick={openShutter}
        aria-label="Scroll down to enter the store"
      >
        <span className="landing-scroll-text">Scroll</span>
        <svg
          className="landing-arrow"
          width="18"
          height="28"
          viewBox="0 0 18 28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 2v22M2 17l7 7 7-7" />
        </svg>
      </button>
    </section>
  );
}

export default Landing;