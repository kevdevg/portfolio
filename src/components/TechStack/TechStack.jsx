import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useIntersection } from '../../hooks/useIntersection';
import { trackTechFilter, trackTechHover, trackSectionView } from '../../utils/analytics';
import './TechStack.css';

const TECHNOLOGIES = [
  // Languages
  { name: 'TypeScript', category: 'frontend', level: 5, icon: 'TS', group: 'Languages' },
  { name: 'JavaScript', category: 'frontend', level: 5, icon: 'JS', group: 'Languages' },
  { name: 'Python', category: 'backend', level: 5, icon: 'PY', group: 'Languages' },
  { name: 'Go', category: 'devops', level: 4, icon: 'GO', group: 'Languages' },
  { name: 'Rust', category: 'web3', level: 4, icon: 'RS', group: 'Languages' },
  { name: 'Solidity', category: 'web3', level: 4, icon: 'SOL', group: 'Languages' },
  { name: 'CGO / Obj-C', category: 'devops', level: 3, icon: 'CGO', group: 'Languages' },
  { name: 'SQL', category: 'backend', level: 5, icon: 'SQL', group: 'Languages' },

  // Frontend & Native UI
  { name: 'React 19', category: 'frontend', level: 5, icon: '⚛', group: 'Frontend' },
  { name: 'Next.js', category: 'frontend', level: 5, icon: 'NX', group: 'Frontend' },
  { name: 'Vite', category: 'frontend', level: 5, icon: '⚡', group: 'Frontend' },
  { name: 'Redux', category: 'frontend', level: 5, icon: 'RX', group: 'Frontend' },
  { name: 'Wails', category: 'devops', level: 4, icon: 'WL', group: 'Frontend' },
  { name: 'GraphQL', category: 'frontend', level: 4, icon: 'GQL', group: 'Frontend' },

  // Backend & Data
  { name: 'NestJS', category: 'backend', level: 5, icon: 'NS', group: 'Backend' },
  { name: 'Node.js', category: 'backend', level: 5, icon: 'ND', group: 'Backend' },
  { name: 'FastAPI', category: 'backend', level: 4, icon: 'FA', group: 'Backend' },
  { name: 'Prisma', category: 'backend', level: 4, icon: 'PR', group: 'Backend' },
  { name: 'PostgreSQL', category: 'backend', level: 5, icon: 'PG', group: 'Backend' },
  { name: 'Redis', category: 'backend', level: 4, icon: 'RD', group: 'Backend' },
  { name: 'WebSockets', category: 'backend', level: 5, icon: 'WS', group: 'Backend' },

  // Web3 & Stablecoin Fintech
  { name: 'Solana', category: 'web3', level: 5, icon: '◎', group: 'Web3 & Fintech' },
  { name: 'Brale API', category: 'web3', level: 5, icon: 'BR', group: 'Web3 & Fintech' },
  { name: 'Coinflow', category: 'web3', level: 4, icon: 'CF', group: 'Web3 & Fintech' },
  { name: 'Ethereum', category: 'web3', level: 4, icon: 'Ξ', group: 'Web3 & Fintech' },
  { name: 'Metaplex', category: 'web3', level: 5, icon: 'MX', group: 'Web3 & Fintech' },
  { name: 'Web3.js', category: 'web3', level: 4, icon: 'W3', group: 'Web3 & Fintech' },
  { name: 'Safe Protocol', category: 'web3', level: 4, icon: 'SF', group: 'Web3 & Fintech' },

  // AI, Systems & DevOps
  { name: 'Docker', category: 'devops', level: 5, icon: 'DK', group: 'AI & Systems' },
  { name: 'Linux Kernel', category: 'devops', level: 4, icon: 'LX', group: 'AI & Systems' },
  { name: 'LiteLLM', category: 'backend', level: 4, icon: 'LLM', group: 'AI & Systems' },
  { name: 'MediaPipe', category: 'backend', level: 4, icon: 'MP', group: 'AI & Systems' },
  { name: 'TFLite', category: 'backend', level: 4, icon: 'TF', group: 'AI & Systems' },
  { name: 'Deepgram', category: 'backend', level: 4, icon: 'DG', group: 'AI & Systems' },
  { name: 'GitHub Actions', category: 'devops', level: 4, icon: 'CI', group: 'AI & Systems' },
];

const GROUPS = ['All', 'Languages', 'Frontend', 'Backend', 'Web3 & Fintech', 'AI & Systems'];

const CATEGORY_COLORS = {
  frontend: 'var(--neuron-frontend)',
  backend: 'var(--neuron-backend)',
  web3: 'var(--neuron-web3)',
  devops: 'var(--neuron-devops)',
};

const CATEGORY_LABELS = {
  frontend: 'Frontend & UX',
  backend: 'Backend & AI',
  web3: 'Web3 & Fintech',
  devops: 'Native Systems & Infra',
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

      const angle = seededRandom(seed + 200) * Math.PI * 2;
      const speed = 15 + seededRandom(seed + 300) * 14;

      return {
        x: 10 + col * cellW + cellW / 2 + jitterX,
        y: 10 + row * cellH + cellH / 2 + jitterY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        delay: i * 35,
      };
    });
  }, [filtered]);

  useEffect(() => {
    orbStatesRef.current = initialPositions.map(p => ({
      x: p.x,
      y: p.y,
      vx: p.vx,
      vy: p.vy,
    }));
  }, [initialPositions]);

  const animate = useCallback((prevTime) => {
    const now = performance.now();
    const dt = Math.min((now - prevTime) / 1000, 0.05);

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

      s.x += (s.vx * dt / containerW) * 100;
      s.y += (s.vy * dt / containerH) * 100;

      const pxX = (s.x / 100) * containerW;
      const pxY = (s.y / 100) * containerH;

      if (pxX - halfSize <= 0) {
        s.x = (halfSize / containerW) * 100;
        s.vx = Math.abs(s.vx);
      } else if (pxX + halfSize >= containerW) {
        s.x = ((containerW - halfSize) / containerW) * 100;
        s.vx = -Math.abs(s.vx);
      }

      if (pxY - halfSize <= 0) {
        s.y = (halfSize / containerH) * 100;
        s.vy = Math.abs(s.vy);
      } else if (pxY + halfSize >= containerH) {
        s.y = ((containerH - halfSize) / containerH) * 100;
        s.vy = -Math.abs(s.vy);
      }

      const el = orbElemsRef.current[i];
      if (el) {
        el.style.left = `${s.x}%`;
        el.style.top = `${s.y}%`;
      }
    }

    rafRef.current = requestAnimationFrame(() => animate(now));
  }, [filtered]);

  useEffect(() => {
    let timeoutId;
    if (isVisible) {
      const maxDelay = filtered.length * 35 + 450;
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
        <span className="section-eyebrow">Technical Matrix</span>
        <h2 className="section-title">Production Stack &amp; Tooling</h2>
        <p className="section-subtitle">
          Battle-tested languages, runtimes, and protocols deployed across enterprise fintech,
          native desktop apps, and decentralized networks.
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
        <div className="constellation-glow constellation-glow-1" />
        <div className="constellation-glow constellation-glow-2" />
        <div className="constellation-glow constellation-glow-3" />

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
          <span className="techstack-legend-label">Production Depth</span>
        </div>
      </div>
    </section>
  );
}
