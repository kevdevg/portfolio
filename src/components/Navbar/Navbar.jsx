import { useCallback } from 'react';
import { MIND_COPY } from '../../data/mindContent';
import { clamp } from '../../utils/scrollMath';
import './Navbar.css';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

export default function Navbar({ lang, onChangeLang, progress = 0, onJumpToEnd }) {
  const copy = MIND_COPY[lang] || MIND_COPY.en;
  const clampedProgress = clamp(progress, 0, 1);

  const handleScrollTop = useCallback((event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCtaClick = useCallback(() => {
    onJumpToEnd?.();
  }, [onJumpToEnd]);

  return (
    <header className="navbar">
      <div className="navbar-backdrop" aria-hidden="true" />
      <div
        className="navbar-progress"
        style={{ transform: `scaleX(${clampedProgress})` }}
        aria-hidden="true"
      />

      <div className="navbar-outer">
        <div className="navbar-pill">
          <a
            href="#mind-top"
            className="navbar-brand"
            onClick={handleScrollTop}
          >
            <span className="navbar-monogram" aria-hidden="true">
              KG
            </span>
            <span className="navbar-name">
              <span className="navbar-name-full">Kevin Guevara</span>
              <span className="navbar-name-compact">K. Guevara</span>
            </span>
            <span className="navbar-live-dot" aria-hidden="true" />
          </a>

          <div className="navbar-right">
            <div
              className="navbar-lang-switch"
              role="group"
              aria-label={copy.nav.langAria}
            >
              {LANGUAGES.map((item) => {
                const isActive = lang === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    className={`navbar-lang-btn ${isActive ? 'navbar-lang-btn--active' : ''}`}
                    aria-pressed={isActive}
                    onClick={() => onChangeLang?.(item.code)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="navbar-cta"
              onClick={handleCtaClick}
            >
              <span>{copy.nav.cta}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
