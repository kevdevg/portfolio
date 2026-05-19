import { useState } from 'react';
import { useIntersection } from '../../hooks/useIntersection';
import { projects } from '../../data/projects';
import { skills } from '../../data/skills';
import './Projects.css';

const FILTERS = [
  { id: 'all', label: 'All' },
  ...skills.map(s => ({ id: s.id, label: s.label, color: s.color, icon: s.icon })),
];

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [ref, isVisible] = useIntersection();

  const filtered = activeFilter === 'all'
    ? projects
    : projects.filter(p => p.areas.includes(activeFilter));

  return (
    <section className="projects section" id="projects" ref={ref}>
      <div className={`reveal ${isVisible ? 'visible' : ''}`}>
        <h2 className="section-title">Featured Projects</h2>
        <p className="section-subtitle">
          A selection of projects across open-source contributions and professional work.
        </p>
      </div>

      <div className={`project-filters reveal ${isVisible ? 'visible' : ''} reveal-delay-1`}>
        {FILTERS.map(filter => (
          <button
            key={filter.id}
            className={`project-filter ${activeFilter === filter.id ? 'project-filter-active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
            style={activeFilter === filter.id && filter.color ? { '--filter-color': filter.color } : {}}
          >
            {filter.icon && <span className="filter-icon">{filter.icon}</span>}
            {filter.label}
          </button>
        ))}
      </div>

      <div className="project-grid">
        {filtered.map((project, i) => (
          <div
            key={project.id}
            className={`project-card glass-card reveal ${isVisible ? 'visible' : ''}`}
            style={{
              transitionDelay: `${(i % 6) * 80 + 200}ms`,
              '--card-color': skills.find(s => s.id === project.areas[0])?.color || 'var(--synapse-pulse)',
            }}
          >
            <div className="project-card-top">
              <div className="project-card-badges">
                {project.areas.map(area => {
                  const s = skills.find(sk => sk.id === area);
                  return (
                    <span
                      key={area}
                      className="project-area-dot"
                      style={{ background: s?.color }}
                      title={s?.label}
                    />
                  );
                })}
              </div>
              <span className="project-type">{project.type}</span>
            </div>

            <h3 className="project-name">{project.name}</h3>
            <p className="project-org">{project.org}</p>
            <p className="project-desc">{project.description}</p>

            <div className="project-tech">
              {project.tech.slice(0, 4).map(t => (
                <span key={t} className="project-tech-tag">{t}</span>
              ))}
            </div>

            <div className="project-footer">
              {project.stars > 0 && (
                <span className="project-stat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  {project.stars.toLocaleString()}
                </span>
              )}
              {project.prs > 0 && (
                <span className="project-stat project-stat-pr">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/>
                    <path d="M6 9v6a3 3 0 003 3h3"/>
                    <path d="M15 18h3"/>
                  </svg>
                  {project.prs} PRs
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className={`projects-confidentiality reveal ${isVisible ? 'visible' : ''} reveal-delay-2`}>
        🔒 Some projects cannot be displayed here due to confidentiality agreements.
      </p>
    </section>
  );
}
