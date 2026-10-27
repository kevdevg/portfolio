import { useState } from 'react';
import { useIntersection } from '../../hooks/useIntersection';
import { projects } from '../../data/projects';
import { skills } from '../../data/skills';
import { trackProjectFilter, trackSectionView, trackOutboundClick } from '../../utils/analytics';
import './Projects.css';

const FILTERS = [
  { id: 'all', label: 'All Systems' },
  ...skills.map(s => ({ id: s.id, label: s.shortLabel || s.label, color: s.color, icon: s.icon })),
];

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [ref, isVisible] = useIntersection({ onVisible: () => trackSectionView('projects') });

  const handleFilter = (id) => {
    setActiveFilter(id);
    trackProjectFilter(id);
  };

  const filtered = activeFilter === 'all'
    ? projects
    : projects.filter(p => p.areas.includes(activeFilter));

  return (
    <section className="projects section" id="projects" ref={ref}>
      <div className={`reveal ${isVisible ? 'visible' : ''}`}>
        <span className="section-eyebrow">Flagship Systems &amp; Open Source</span>
        <h2 className="section-title">Selected Engineering Case Studies</h2>
        <p className="section-subtitle">
          Production-hardened architectures spanning programmable stablecoin settlement,
          kernel-isolated AI sandboxes, multichain gaming, and real-time machine learning.
        </p>
      </div>

      <div className={`project-filters reveal ${isVisible ? 'visible' : ''} reveal-delay-1`}>
        {FILTERS.map(filter => (
          <button
            key={filter.id}
            className={`project-filter ${activeFilter === filter.id ? 'project-filter-active' : ''}`}
            onClick={() => handleFilter(filter.id)}
            style={activeFilter === filter.id && filter.color ? { '--filter-color': filter.color } : {}}
          >
            {filter.icon && <span className="filter-icon">{filter.icon}</span>}
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      <div className="project-bento-grid">
        {filtered.map((project, i) => {
          const primarySkill = skills.find(s => s.id === project.areas[0]);
          const isFeatured = Boolean(project.featured);

          return (
            <article
              key={project.id}
              className={`project-card glass-card ${isFeatured ? 'project-card-featured' : ''} reveal ${isVisible ? 'visible' : ''}`}
              style={{
                transitionDelay: `${(i % 6) * 45 + 100}ms`,
                '--card-color': primarySkill?.color || 'var(--neuron-frontend)',
              }}
            >
              <div className="project-card-top">
                <div className="project-meta-left">
                  <div className="project-card-badges">
                    {project.areas.map(area => {
                      const s = skills.find(sk => sk.id === area);
                      return (
                        <span
                          key={area}
                          className="project-area-pill"
                          style={{ '--area-color': s?.color }}
                        >
                          <span className="project-area-dot" style={{ background: s?.color }} />
                          {s?.shortLabel || s?.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <span className={`project-type ${isFeatured ? 'project-type-featured' : ''}`}>
                  {project.type}
                </span>
              </div>

              <div className="project-header-block">
                <div className="project-title-row">
                  <h3 className="project-name">{project.name}</h3>
                  <span className="project-org">{project.org}</span>
                </div>
                {project.role && <p className="project-role">{project.role}</p>}
                {project.architecture && (
                  <div className="project-arch-bar">
                    <span className="arch-label">ARCH:</span>
                    <span className="arch-value">{project.architecture}</span>
                  </div>
                )}
              </div>

              <p className="project-desc">{project.description}</p>

              <div className="project-tech">
                {project.tech.map(t => (
                  <span key={t} className="project-tech-tag">{t}</span>
                ))}
              </div>

              <div className="project-footer">
                <div className="project-metrics tabular-nums">
                  {project.stars > 0 && (
                    <span className="project-stat" title="GitHub Stars">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {project.stars.toLocaleString()}
                    </span>
                  )}
                  {project.prs > 0 && (
                    <span className="project-stat project-stat-pr" title="Merged Pull Requests">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="18" r="3" />
                        <circle cx="6" cy="6" r="3" />
                        <path d="M6 9v6a3 3 0 003 3h3" />
                        <path d="M15 18h3" />
                      </svg>
                      {project.prs}+ PRs
                    </span>
                  )}
                  {project.commits && (
                    <span className="project-stat project-stat-commits" title="Production Commits">
                      <span>commits:</span> {project.commits}
                    </span>
                  )}
                </div>

                <div className="project-links">
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackOutboundClick(project.url, `${project.name} GitHub`)}
                      className="project-action-link"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      <span>Source</span>
                      <span className="link-arrow">↗</span>
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackOutboundClick(project.demo, `${project.name} Live`)}
                      className="project-action-link project-action-demo"
                    >
                      <span>Live Site</span>
                      <span className="link-arrow">↗</span>
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className={`projects-confidentiality reveal ${isVisible ? 'visible' : ''} reveal-delay-2`}>
        🔒 Enterprise repositories at Monadical (SpudPay, TicketNetwork, Virtue Poker) are private client
        systems; architecture walkthroughs and verified PR metrics available upon request.
      </p>
    </section>
  );
}
