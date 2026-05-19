import { useIntersection } from '../../hooks/useIntersection';
import { stats } from '../../data/projects';
import './About.css';

const STAT_ITEMS = [
  { label: 'Contributions', value: stats.totalContributions },
  { label: 'PRs Merged', value: stats.mergedPRs },
  { label: 'Organizations', value: stats.orgsContributed },
  { label: 'Years Active', value: stats.yearsActive },
];

export default function About() {
  const [ref, isVisible] = useIntersection();

  return (
    <section className="about section" id="about" ref={ref}>
      <div className={`reveal ${isVisible ? 'visible' : ''}`}>
        <h2 className="section-title">About Me</h2>
        <p className="section-subtitle">
          Building at the intersection of elegant interfaces and decentralized systems.
        </p>
      </div>

      <div className="about-grid">
        <div className={`about-bio reveal ${isVisible ? 'visible' : ''} reveal-delay-1`}>
          <p className="about-text">
            I'm a <strong>Full Stack Developer</strong> with 8+ years of experience
            shipping production software across the entire web stack. From pixel-perfect
            React interfaces to Solana smart contracts, from Python SDKs to
            containerized deployments — I thrive where disciplines converge.
          </p>
          <p className="about-text">
            At <strong>Monadical</strong>, I've contributed to projects spanning
            Web3 gaming (Virtue Poker), stablecoin payments (SpudUSD), AI tooling
            (Greywall/Greyproxy), and developer infrastructure. I've also contributed
            to major open-source projects like <strong>Metaplex</strong> (★3,355),
            <strong> Greywall</strong> (★184), and <strong>Scope3 AI SDK</strong>.
          </p>
          <p className="about-text">
            I believe the best engineers don't just write code — they connect
            systems, bridge domains, and turn complex architectures into
            experiences that feel effortless.
          </p>
        </div>

        <div className={`about-stats reveal ${isVisible ? 'visible' : ''} reveal-delay-2`}>
          {STAT_ITEMS.map((stat, i) => (
            <div key={stat.label} className="stat-card">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
