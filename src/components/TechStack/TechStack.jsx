import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useIntersection } from '../../hooks/useIntersection';
import { trackTechFilter, trackTechHover, trackSectionView } from '../../utils/analytics';
import './TechStack.css';

/*
  Each tech has:
  - name: display name
  - category: which neural area it belongs to (for coloring)
  - level: 1-5 proficiency → maps to orb size
  - icon: emoji or short label
*/
const TECHNOLOGIES = [
  // Languages
  { name: 'TypeScript', category: 'frontend', level: 5, icon: 'TS', group: 'Languages' },
  { name: 'JavaScript', category: 'frontend', level: 5, icon: 'JS', group: 'Languages' },
  { name: 'Python', category: 'backend', level: 4, icon: 'PY', group: 'Languages' },
  { name: 'Go', category: 'devops', level: 3, icon: 'GO', group: 'Languages' },
  { name: 'Rust', category: 'web3', level: 3, icon: 'RS', group: 'Languages' },
  { name: 'Solidity', category: 'web3', level: 4, icon: 'SOL', group: 'Languages' },
  { name: 'HTML', category: 'frontend', level: 5, icon: 'H5', group: 'Languages' },
  { name: 'CSS', category: 'frontend', level: 5, icon: 'CSS', group: 'Languages' },
  { name: 'SQL', category: 'backend', level: 4, icon: 'SQL', group: 'Languages' },
  { name: 'Shell', category: 'devops', level: 3, icon: 'SH', group: 'Languages' },

  // Frontend Frameworks
  { name: 'React', category: 'frontend', level: 5, icon: '⚛', group: 'Frameworks' },
  { name: 'Next.js', category: 'frontend', level: 4, icon: 'N', group: 'Frameworks' },
  { name: 'Vite', category: 'frontend', level: 4, icon: '⚡', group: 'Frameworks' },
  { name: 'Redux', category: 'frontend', level: 4, icon: 'Rx', group: 'Frameworks' },
  { name: 'Ant Design', category: 'frontend', level: 3, icon: 'AD', group: 'Frameworks' },

  // Backend
  { name: 'Node.js', category: 'backend', level: 5, icon: 'N', group: 'Backend' },
  { name: 'FastAPI', category: 'backend', level: 3, icon: 'FA', group: 'Backend' },
  { name: 'Django', category: 'backend', level: 3, icon: 'DJ', group: 'Backend' },
  { name: 'PostgreSQL', category: 'backend', level: 4, icon: 'PG', group: 'Backend' },
  { name: 'SQLite', category: 'backend', level: 3, icon: 'SL', group: 'Backend' },
  { name: 'WebSocket', category: 'backend', level: 4, icon: 'WS', group: 'Backend' },

  // Web3
  { name: 'Solana', category: 'web3', level: 4, icon: '◎', group: 'Web3' },
  { name: 'Ethereum', category: 'web3', level: 4, icon: 'Ξ', group: 'Web3' },
  { name: 'Metaplex', category: 'web3', level: 5, icon: 'MX', group: 'Web3' },
  { name: 'Web3.js', category: 'web3', level: 4, icon: 'W3', group: 'Web3' },
  { name: 'WalletConnect', category: 'web3', level: 3, icon: 'WC', group: 'Web3' },
  { name: 'Safe Protocol', category: 'web3', level: 3, icon: '🔐', group: 'Web3' },

  // DevOps & Tools
  { name: 'Docker', category: 'devops', level: 4, icon: '🐳', group: 'DevOps' },
  { name: 'Git', category: 'devops', level: 5, icon: 'GIT', group: 'DevOps' },
  { name: 'Cloudflare', category: 'devops', level: 3, icon: 'CF', group: 'DevOps' },
  { name: 'GitHub Actions', category: 'devops', level: 3, icon: 'GA', group: 'DevOps' },
  { name: 'Coolify', category: 'devops', level: 3, icon: '❄', group: 'DevOps' },
  { name: 'Linux', category: 'devops', level: 4, icon: '🐧', group: 'DevOps' },
  { name: 'Nginx', category: 'devops', level: 3, icon: 'NX', group: 'DevOps' },
];

const GROUPS = ['All', 'Languages', 'Frameworks', 'Backend', 'Web3', 'DevOps'];

const CATEGORY_COLORS = {
  frontend: 'var(--neuron-frontend)',
  backend: 'var(--neuron-backend)',
  web3: 'var(--neuron-web3)',
  devops: 'var(--neuron-devops)',
};

const CATEGORY_LABELS = {
  frontend: 'Frontend',
  backend: 'Backend',
  web3: 'Web3',
  devops: 'DevOps',
};

function seededRandom(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export default function TechStack() {
  const [ref, isVisible] = useIntersection({ onVisible: () => trackSectionView('techstack') });
  const [activeGroup, setActiveGroup] = useState('All');
  const [hoveredTech, setHoveredTech] = useState(null);
  const constellationRef = useRef(null);
  const orbStatesRef = useRef([]);
  const rafRef = useRef(null);
  const orbElemsRef = useRef([]);

  const filtered = activeGroup === 'All'
    ? TECHNOLOGIES
    : TECHNOLOGIES.filter(t => t.group === activeGroup);

  // Grid-based initial positions
  const initialPositions = useMemo(() => {
    const count = filtered.length;
    const cols = Math.ceil(Math.sqrt(count * 1.8));
    const rows = Math.ceil(count / cols);
    const cellW = 80 / cols;
    const cellH = 80 / rows;

    return filtered.map((tech, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const seed = tech.name.charCodeAt(0) * 31 + tech.name.length * 17 + i * 7;
      const jitterX = (seededRandom(seed) - 0.5) * cellW * 0.6;
      const jitterY = (seededRandom(seed + 99) - 0.5) * cellH * 0.6;

      // Random velocity direction, speed ~18-35 px/s
      const angle = seededRandom(seed + 200) * Math.PI * 2;
      const speed = 18 + seededRandom(seed + 300) * 17;

      return {
        x: 10 + col * cellW + cellW / 2 + jitterX,
        y: 10 + row * cellH + cellH / 2 + jitterY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        delay: i * 50,
      };
    });
  }, [filtered]);

  // Initialize orb physics states when filtered list changes
  useEffect(() => {
    orbStatesRef.current = initialPositions.map(p => ({
      x: p.x,
      y: p.y,
      vx: p.vx,
      vy: p.vy,
    }));
  }, [initialPositions]);

  // Animation loop with requestAnimationFrame
  const animate = useCallback((prevTime) => {
    const now = performance.now();
    const dt = Math.min((now - prevTime) / 1000, 0.05); // cap delta to avoid jumps

    const states = orbStatesRef.current;
    const container = constellationRef.current;
    if (!container || states.length === 0) {
      rafRef.current = requestAnimationFrame(() => animate(now));
      return;
    }

    const containerW = container.offsetWidth;
    const containerH = container.offsetHeight;

    for (let i = 0; i < states.length; i++) {
      const s = states[i];
      const size = 28 + (filtered[i]?.level || 3) * 10;
      const halfSize = size / 2;

      // Update position
      s.x += (s.vx * dt / containerW) * 100;
      s.y += (s.vy * dt / containerH) * 100;

      // Convert to pixel bounds for collision
      const pxX = (s.x / 100) * containerW;
      const pxY = (s.y / 100) * containerH;

      // Bounce off left/right walls
      if (pxX - halfSize <= 0) {
        s.x = (halfSize / containerW) * 100;
        s.vx = Math.abs(s.vx);
      } else if (pxX + halfSize >= containerW) {
        s.x = ((containerW - halfSize) / containerW) * 100;
        s.vx = -Math.abs(s.vx);
      }

      // Bounce off top/bottom walls
      if (pxY - halfSize <= 0) {
        s.y = (halfSize / containerH) * 100;
        s.vy = Math.abs(s.vy);
      } else if (pxY + halfSize >= containerH) {
        s.y = ((containerH - halfSize) / containerH) * 100;
        s.vy = -Math.abs(s.vy);
      }

      // Apply position via ref (no re-render)
      const el = orbElemsRef.current[i];
      if (el) {
        el.style.left = `${s.x}%`;
        el.style.top = `${s.y}%`;
      }
    }

    rafRef.current = requestAnimationFrame(() => animate(now));
  }, [filtered]);

  // Start/stop animation when visible — delay start to let entry transition play
  useEffect(() => {
    let timeoutId;
    if (isVisible) {
      // Wait for entry animation (staggered delays up to ~1.8s) before starting physics
      const maxDelay = filtered.length * 50 + 600;
      timeoutId = setTimeout(() => {
        rafRef.current = requestAnimationFrame(() => animate(performance.now()));
      }, maxDelay);
    }
    return () => {
      clearTimeout(timeoutId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isVisible, animate, filtered.length]);

  return (
    <section className="techstack section" id="techstack" ref={ref}>
      <div className={`reveal ${isVisible ? 'visible' : ''}`}>
        <h2 className="section-title">Tech Stack</h2>
        <p className="section-subtitle">
          The tools, languages, and frameworks I use to bring ideas to life.
        </p>
      </div>

      {/* Group filter tabs */}
      <div className={`techstack-filters reveal ${isVisible ? 'visible' : ''} reveal-delay-1`}>
        {GROUPS.map(group => (
          <button
            key={group}
            className={`techstack-filter ${activeGroup === group ? 'techstack-filter-active' : ''}`}
            onClick={() => { setActiveGroup(group); trackTechFilter(group); }}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Constellation field */}
      <div
        className={`constellation reveal ${isVisible ? 'visible' : ''} reveal-delay-2`}
        ref={constellationRef}
      >
        {/* Background glow effects */}
        <div className="constellation-glow constellation-glow-1" />
        <div className="constellation-glow constellation-glow-2" />
        <div className="constellation-glow constellation-glow-3" />


        {/* Tech orbs */}
        {filtered.map((tech, i) => {
          const pos = initialPositions[i];
          if (!pos) return null;
          const size = 28 + tech.level * 10;
          const isHovered = hoveredTech === tech.name;

          return (
            <div
              key={tech.name}
              ref={el => { orbElemsRef.current[i] = el; }}
              className={`tech-orb ${isVisible ? 'tech-orb-visible' : ''} ${isHovered ? 'tech-orb-hovered' : ''}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: `${size}px`,
                height: `${size}px`,
                '--orb-color': CATEGORY_COLORS[tech.category],
                '--orb-delay': `${pos.delay}ms`,
              }}
              onMouseEnter={() => { setHoveredTech(tech.name); trackTechHover(tech.name, tech.category); }}
              onMouseLeave={() => setHoveredTech(null)}
            >
              <span className="tech-orb-icon">{tech.icon}</span>

              {/* Tooltip on hover */}
              <div className="tech-orb-tooltip">
                <span className="tech-orb-name">{tech.name}</span>
                <div className="tech-orb-level">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span
                      key={j}
                      className={`tech-orb-dot ${j < tech.level ? 'tech-orb-dot-filled' : ''}`}
                    />
                  ))}
                </div>
                <span className="tech-orb-category" style={{ color: CATEGORY_COLORS[tech.category] }}>
                  {CATEGORY_LABELS[tech.category]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className={`techstack-legend reveal ${isVisible ? 'visible' : ''} reveal-delay-3`}>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <div key={key} className="techstack-legend-item">
            <span className="techstack-legend-dot" style={{ background: CATEGORY_COLORS[key] }} />
            <span className="techstack-legend-label">{label}</span>
          </div>
        ))}
        <div className="techstack-legend-item">
          <span className="techstack-legend-size techstack-legend-size-sm" />
          <span className="techstack-legend-size techstack-legend-size-lg" />
          <span className="techstack-legend-label">Proficiency</span>
        </div>
      </div>
    </section>
  );
}

