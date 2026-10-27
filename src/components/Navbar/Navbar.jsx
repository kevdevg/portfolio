import { useState, useEffect } from 'react';
import { trackOutboundClick } from '../../utils/analytics';
import './Navbar.css';

const NAV_ITEMS = [
  { id: 'hero', label: 'Overview' },
  { id: 'about', label: 'Architecture' },
  { id: 'techstack', label: 'Stack' },
  { id: 'projects', label: 'Systems' },
  { id: 'experience', label: 'Track Record' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [menuOpen, setMenuOpen] = useState(false);

  const cvUrl = `${import.meta.env.BASE_URL}Kevin_Guevara_CV.pdf`;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      const allSections = [...NAV_ITEMS, { id: 'contact', label: 'Contact' }]
        .map(item => ({
          id: item.id,
          el: document.getElementById(item.id),
        }))
        .filter(s => s.el);

      const scrollPos = window.scrollY + window.innerHeight / 3;

      for (let i = allSections.length - 1; i >= 0; i--) {
        if (allSections[i].el.offsetTop <= scrollPos) {
          setActiveSection(allSections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMenuOpen(false);
    }
  };

  return (
    <header className={`navbar-wrapper ${scrolled ? 'navbar-scrolled' : ''}`}>
      <nav className="navbar-pill" aria-label="Primary Navigation">
        <div className="navbar-brand-group">
          <button className="navbar-logo" onClick={() => scrollTo('hero')}>
            <span className="logo-mark">KG</span>
            <span className="logo-divider">//</span>
            <span className="logo-role">SENIOR.SWE</span>
          </button>

          <div className="navbar-status" title="Open to Remote Senior & Staff Engineering Roles">
            <span className="status-dot" />
            <span className="status-text">Available for Senior / Staff Roles</span>
          </div>
        </div>

        <button
          className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>

        <div className={`navbar-menu ${menuOpen ? 'navbar-menu-open' : ''}`}>
          <ul className="navbar-links">
            {NAV_ITEMS.map(item => (
              <li key={item.id}>
                <button
                  className={`navbar-link ${activeSection === item.id ? 'navbar-link-active' : ''}`}
                  onClick={() => scrollTo(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            <a
              href={cvUrl}
              download="Kevin_Guevara_CV.pdf"
              onClick={() => trackOutboundClick(cvUrl, 'Navbar Download CV')}
              className="navbar-btn-secondary"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download CV</span>
            </a>

            <button
              className="navbar-btn-primary"
              onClick={() => scrollTo('contact')}
            >
              <span>Let&apos;s Talk</span>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
