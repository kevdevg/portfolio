import { useEffect } from 'react';
import { skills } from '../../data/skills';
import { projects } from '../../data/projects';
import './SkillDetail.css';

export default function SkillDetail({ skillId, onClose }) {
  const skill = skills.find(s => s.id === skillId);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!skill) return null;

  const relatedProjects = projects.filter(p => p.areas.includes(skillId));

  return (
    <div className="skill-overlay" onClick={onClose}>
      <div
        className="skill-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ '--skill-color': skill.color }}
      >
        <button className="skill-close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="skill-header">
          <span className="skill-icon">{skill.icon}</span>
          <h2 className="skill-title">{skill.label}</h2>
          <p className="skill-summary">{skill.summary}</p>
        </div>

        <div className="skill-tech-list">
          {skill.technologies.map(tech => (
            <span key={tech} className="skill-tech-badge">{tech}</span>
          ))}
        </div>

        <div className="skill-section">
          <h3 className="skill-section-title">Key Contributions</h3>
          <ul className="skill-highlights">
            {skill.highlights.map((h, i) => (
              <li key={i} className="skill-highlight">
                <span className="skill-highlight-dot" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="skill-section">
          <h3 className="skill-section-title">Related Projects</h3>
          <div className="skill-projects-grid">
            {relatedProjects.map(project => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="skill-project-card"
              >
                <div className="skill-project-header">
                  <span className="skill-project-name">{project.name}</span>
                  {project.stars > 0 && (
                    <span className="skill-project-stars">★ {project.stars.toLocaleString()}</span>
                  )}
                </div>
                <p className="skill-project-desc">{project.description}</p>
                <div className="skill-project-meta">
                  <span className="skill-project-org">{project.org}</span>
                  {project.prs > 0 && (
                    <span className="skill-project-prs">{project.prs} PRs</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
