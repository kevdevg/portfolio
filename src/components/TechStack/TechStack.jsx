import { useState, useMemo } from 'react';
import { useIntersection } from '../../hooks/useIntersection';
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

export default function TechStack() {
  const [ref, isVisible] = useIntersection();
  const [activeGroup, setActiveGroup] = useState('All');
  const [hoveredTech, setHoveredTech] = useState(null);

  const filtered = activeGroup === 'All'
    ? TECHNOLOGIES
    : TECHNOLOGIES.filter(t => t.group === activeGroup);

  // Seeded pseudo-random for deterministic positions
  function seededRandom(seed) {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  }

  // Grid-based distribution with jitter for even spacing
  const orbPositions = useMemo(() => {
    const count = filtered.length;
    const cols = Math.ceil(Math.sqrt(count * 1.8)); // wider than tall
    const rows = Math.ceil(count / cols);
    const cellW = 80 / cols; // leave 10% padding on each side
    const cellH = 80 / rows;

    return filtered.map((tech, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const seed = tech.name.charCodeAt(0) * 31 + tech.name.length * 17 + i * 7;
      const jitterX = (seededRandom(seed) - 0.5) * cellW * 0.6;
      const jitterY = (seededRandom(seed + 99) - 0.5) * cellH * 0.6;

      // Unique slow drift parameters per orb
      const driftX = (seededRandom(seed + 1) - 0.5) * 20; // px
      const driftY = (seededRandom(seed + 2) - 0.5) * 16;
      const driftDur = 10 + seededRandom(seed + 3) * 14; // 10-24s

      return {
        x: 10 + col * cellW + cellW / 2 + jitterX,
        y: 10 + row * cellH + cellH / 2 + jitterY,
        delay: i * 50,
        driftX,
        driftY,
        driftDur,
      };
    });
  }, [filtered]);

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
            onClick={() => setActiveGroup(group)}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Constellation field */}
      <div className={`constellation reveal ${isVisible ? 'visible' : ''} reveal-delay-2`}>
        {/* Background glow effects */}
        <div className="constellation-glow constellation-glow-1" />
        <div className="constellation-glow constellation-glow-2" />
        <div className="constellation-glow constellation-glow-3" />


        {/* Tech orbs */}
        {filtered.map((tech, i) => {
          const pos = orbPositions[i];
          if (!pos) return null;
          const size = 28 + tech.level * 10;
          const isHovered = hoveredTech === tech.name;

          return (
            <div
              key={tech.name}
              className={`tech-orb ${isVisible ? 'tech-orb-visible' : ''} ${isHovered ? 'tech-orb-hovered' : ''}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: `${size}px`,
                height: `${size}px`,
                '--orb-color': CATEGORY_COLORS[tech.category],
                '--orb-delay': `${pos.delay}ms`,
                '--drift-x': `${pos.driftX}px`,
                '--drift-y': `${pos.driftY}px`,
                '--drift-dur': `${pos.driftDur}s`,
              }}
              onMouseEnter={() => setHoveredTech(tech.name)}
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
