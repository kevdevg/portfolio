import { useIntersection } from '../../hooks/useIntersection';
import { experience, education } from '../../data/projects';
import { skills } from '../../data/skills';
import { trackSectionView, trackOutboundClick } from '../../utils/analytics';
import './Experience.css';

export default function Experience() {
  const [ref, isVisible] = useIntersection({ onVisible: () => trackSectionView('experience') });

  return (
    <section className="experience section" id="experience" ref={ref}>
      <div className={`reveal ${isVisible ? 'visible' : ''}`}>
        <span className="section-eyebrow">Career Trajectory &amp; Education</span>
        <h2 className="section-title">9+ Years of Production Engineering</h2>
        <p className="section-subtitle">
          Proven leadership across global remote engineering consultancies, open-source Web3/AI
          foundations, and enterprise SaaS platforms.
        </p>
      </div>

      <div className="timeline">
        {experience.map((exp, i) => (
          <div
            key={`${exp.company}-${exp.period}`}
            className={`timeline-item reveal ${isVisible ? 'visible' : ''}`}
            style={{ transitionDelay: `${i * 80 + 100}ms` }}
          >
            <div className="timeline-node">
              <div className="timeline-dot" />
              {i < experience.length - 1 && <div className="timeline-line" />}
            </div>

            <article className="timeline-content glass-card">
              <div className="timeline-header">
                <div className="timeline-role-group">
                  <h3 className="timeline-role">{exp.role}</h3>
                  <div className="timeline-company-row">
                    <a
                      href={exp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackOutboundClick(exp.url, `${exp.company} Experience`)}
                      className="timeline-company"
                    >
                      {exp.company} ↗
                    </a>
                    {exp.location && (
                      <span className="timeline-location">• {exp.location}</span>
                    )}
                  </div>
                </div>
                <span className="timeline-period tabular-nums">{exp.period}</span>
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
                      {s?.icon} {s?.shortLabel || s?.label}
                    </span>
                  );
                })}
              </div>
            </article>
          </div>
        ))}
      </div>

      {/* Education & Languages Block */}
      <div className={`education-bento reveal ${isVisible ? 'visible' : ''} reveal-delay-3`}>
        <div className="education-card glass-card">
          <span className="education-eyebrow">ACADEMIC FOUNDATION</span>
          <h3 className="education-heading">Education &amp; Dual Formation</h3>
          <div className="education-degrees-list">
            {education.degrees.map((deg) => (
              <div key={deg.degree} className="education-degree-item">
                <div className="degree-top">
                  <h4 className="degree-title">{deg.degree}</h4>
                  <span className="degree-status">{deg.status}</span>
                </div>
                <p className="degree-inst">
                  {deg.institution} — <span>{deg.location}</span>
                </p>
                <p className="degree-focus">{deg.focus}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="languages-card glass-card">
          <span className="education-eyebrow">COMMUNICATION</span>
          <h3 className="education-heading">Languages &amp; Global Collaboration</h3>
          <p className="languages-sub">
            9+ years operating in distributed English-speaking engineering teams across US &amp;
            European time zones (UTC-5).
          </p>
          <div className="languages-list">
            {education.languages.map((lang) => (
              <div key={lang.name} className="language-row">
                <span className="language-name">{lang.name}</span>
                <span className="language-level">{lang.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
