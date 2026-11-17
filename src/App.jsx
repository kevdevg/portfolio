import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import MindJourney from './components/MindJourney/MindJourney';
import { initScrollDepthTracking, trackLanguageSwitch } from './utils/analytics';

function getInitialLang() {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = window.localStorage.getItem('kg_portfolio_lang');
    if (saved === 'en' || saved === 'es') return saved;
  } catch {
    // Ignore storage access errors
  }
  return 'en';
}

export default function App() {
  const [lang, setLang] = useState(getInitialLang);
  const [scrollProgress, setScrollProgress] = useState(0);
  const jumpToEndRef = useRef(null);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem('kg_portfolio_lang', lang);
    } catch {
      // Ignore storage access errors
    }
  }, [lang]);

  useEffect(() => {
    return initScrollDepthTracking();
  }, []);

  const handleChangeLang = useCallback((nextLang) => {
    setLang((prev) => {
      if (prev === nextLang) return prev;
      trackLanguageSwitch(nextLang);
      return nextLang;
    });
  }, []);

  const registerJumpToEnd = useCallback((fn) => {
    jumpToEndRef.current = fn;
  }, []);

  const handleJumpToEnd = useCallback(() => {
    if (jumpToEndRef.current) {
      jumpToEndRef.current();
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  return (
    <div className="mind-shell">
      <Navbar
        lang={lang}
        onChangeLang={handleChangeLang}
        progress={scrollProgress}
        onJumpToEnd={handleJumpToEnd}
      />
      <main>
        <MindJourney
          lang={lang}
          onProgressChange={setScrollProgress}
          registerJumpToEnd={registerJumpToEnd}
        />
      </main>
    </div>
  );
}
