import { useIntersection } from '../../hooks/useIntersection';
import { experience } from '../../data/projects';
import { skills } from '../../data/skills';
import './Experience.css';

export default function Experience() {
  const [ref, isVisible] = useIntersection();

  return (
    <section className="experience section" id="experience" ref={ref}>
      <div className={`reveal ${isVisible ? 'visible' : ''}`}>
        <h2 className="section-title">Experience</h2>
        <p className="section-subtitle">
          Professional journey across organizations, from startups to open-source foundations.
        </p>
      </div>

      <div className="timeline">
        {experience.map((exp, i) => (
          <div
            key={i}
            className={`timeline-item reveal ${isVisible ? 'visible' : ''}`}
            style={{ transitionDelay: `${i * 150 + 200}ms` }}
          >
            <div className="timeline-node">
              <div className="timeline-dot" />
              {i < experience.length - 1 && <div className="timeline-line" />}
            </div>

            <div className="timeline-content glass-card">
              <div className="timeline-header">
                <div>
                  <h3 className="timeline-role">{exp.role}</h3>
                  <a
                    href={exp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="timeline-company"
                  >
                    {exp.company} ↗
                  </a>
                </div>
                <span className="timeline-period">{exp.period}</span>
              </div>

              <p className="timeline-desc">{exp.description}</p>

              <ul className="timeline-highlights">
                {exp.highlights.map((h, j) => (
                  <li key={j} className="timeline-highlight">{h}</li>
                ))}
              </ul>

              <div className="timeline-areas">
                {exp.areas.map(area => {
                  const s = skills.find(sk => sk.id === area);
                  return (
                    <span
                      key={area}
                      className="timeline-area-badge"
                      style={{ '--badge-color': s?.color }}
                    >
                      {s?.icon} {s?.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
