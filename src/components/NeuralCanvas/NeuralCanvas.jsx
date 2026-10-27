import { useState, useEffect, useRef, useCallback } from 'react';
import { skills } from '../../data/skills';
import { trackOutboundClick } from '../../utils/analytics';
import './NeuralCanvas.css';

const NEURON_POSITIONS = [
  { x: 26, y: 28 }, // Frontend — top left
  { x: 74, y: 26 }, // Backend — top right
  { x: 24, y: 72 }, // Web3 — bottom left
  { x: 76, y: 72 }, // AI & Systems — bottom right
];

// Central AI & Cognitive Systems hub node
const AI_NODE = { x: 50, y: 50 };
const AI_COLOR = 'hsl(45, 100%, 64%)';

function getSynapsePath(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const cx1 = from.x + dx * 0.25 + dy * 0.12;
  const cy1 = from.y + dy * 0.25 - dx * 0.12;
  const cx2 = to.x - dx * 0.25 - dy * 0.12;
  const cy2 = to.y - dy * 0.25 + dx * 0.12;
  return `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;
}

function getAllSynapses() {
  const synapses = [];
  for (let i = 0; i < NEURON_POSITIONS.length; i++) {
    for (let j = i + 1; j < NEURON_POSITIONS.length; j++) {
      synapses.push({
        from: i,
        to: j,
        path: getSynapsePath(NEURON_POSITIONS[i], NEURON_POSITIONS[j]),
      });
    }
  }
  return synapses;
}

function getAISynapses() {
  return NEURON_POSITIONS.map((pos, i) => ({
    toIndex: i,
    path: getSynapsePath(AI_NODE, pos),
  }));
}

const AI_SYNAPSES = getAISynapses();
const SYNAPSES = getAllSynapses();

const TELEMETRY_METRICS = [
  { value: '367+', label: 'Merged PRs' },
  { value: '4,000+', label: 'Contributions' },
  { value: '35+', label: 'Prod Repos' },
  { value: 'Cali, CO', label: 'Remote • UTC-5' },
];

export default function NeuralCanvas({ onNeuronClick, activeNeuron }) {
  const [hoveredNeuron, setHoveredNeuron] = useState(null);
  const [pulses, setPulses] = useState([]);
  const [cvVariant, setCvVariant] = useState('ats'); // 'ats' | 'extended'
  const pulseIdRef = useRef(0);
  const canvasRef = useRef(null);

  const cvAtsUrl = `${import.meta.env.BASE_URL}Kevin_Guevara_CV.pdf`;
  const cvExtendedUrl = `${import.meta.env.BASE_URL}Kevin_Guevara_CV_Extended.pdf`;
  const selectedCvUrl = cvVariant === 'ats' ? cvAtsUrl : cvExtendedUrl;
  const selectedCvFilename =
    cvVariant === 'ats' ? 'Kevin_Guevara_CV.pdf' : 'Kevin_Guevara_CV_Extended.pdf';

  const firePulse = useCallback((fromIndex) => {
    const newPulses = SYNAPSES
      .filter(s => s.from === fromIndex || s.to === fromIndex)
      .map(s => ({
        id: pulseIdRef.current++,
        synapseIndex: SYNAPSES.indexOf(s),
        reverse: s.to === fromIndex,
        color: skills[fromIndex].color,
      }));
    setPulses(prev => [...prev, ...newPulses]);
    setTimeout(() => {
      setPulses(prev => prev.filter(p => !newPulses.find(np => np.id === p.id)));
    }, 1400);
  }, []);

  // Periodic ambient pulse so the topology feels alive immediately
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * skills.length);
      firePulse(randomIdx);
    }, 3200);
    return () => clearInterval(interval);
  }, [firePulse]);

  const handleNeuronHover = useCallback((index) => {
    setHoveredNeuron(index);
    firePulse(index);
  }, [firePulse]);

  const scrollToProjects = () => {
    const el = document.getElementById('projects');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero-editorial" id="hero">
      <div className="hero-editorial-inner">
        {/* Left Column (55%): Editorial Narrative & CTAs */}
        <div className="hero-copy-col">
          <div className="hero-eyebrow-badge">
            <span className="hero-eyebrow-dot" />
            <span>9+ YEARS SHIPPING PRODUCTION SYSTEMS • 367+ MERGED PRS</span>
          </div>

          <h1 className="hero-headline">
            Senior Full Stack Engineer architecting{' '}
            <span className="text-gradient">Stablecoin Rails, Applied AI &amp; Native Systems</span>
          </h1>

          <p className="hero-lead">
            I&apos;m <strong>Kevin Guevara Devia</strong> — Senior Full Stack Software Engineer at{' '}
            <strong>Monadical</strong>. I design and ship high-reliability fintech payment controllers
            (Brale, Coinflow, Solana), kernel-isolated desktop sandboxes in Go &amp; Wails, multichain Web3
            architectures, and real-time machine learning pipelines.
          </p>

          {/* Primary & Secondary CTAs with 1-Page / 2-Page CV selector */}
          <div className="hero-cta-row">
            <button className="hero-btn-primary" onClick={scrollToProjects}>
              <span>Explore Flagship Systems</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <div className="hero-cv-group">
              <a
                href={selectedCvUrl}
                download={selectedCvFilename}
                onClick={() =>
                  trackOutboundClick(
                    selectedCvUrl,
                    `Hero Download CV (${cvVariant === 'ats' ? '1-Page ATS' : '2-Page Extended'})`
                  )
                }
                className="hero-btn-secondary"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Download CV (PDF)</span>
              </a>

              <div className="hero-cv-selector" role="group" aria-label="Select CV format">
                <button
                  type="button"
                  className={`cv-mode-btn ${cvVariant === 'ats' ? 'active' : ''}`}
                  onClick={() => setCvVariant('ats')}
                  title="Concise 1-Page Executive & ATS Resume"
                >
                  1-Page ATS
                </button>
                <button
                  type="button"
                  className={`cv-mode-btn ${cvVariant === 'extended' ? 'active' : ''}`}
                  onClick={() => setCvVariant('extended')}
                  title="Detailed 2-Page Engineering Case Studies Resume"
                >
                  2-Page Extended
                </button>
              </div>
            </div>
          </div>

          {/* Quick Telemetry Strip */}
          <div className="hero-telemetry-bar">
            {TELEMETRY_METRICS.map((item) => (
              <div key={item.label} className="hero-telemetry-item">
                <span className="hero-telemetry-value tabular-nums">{item.value}</span>
                <span className="hero-telemetry-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (45%): Interactive Neural Architecture Telemetry Card */}
        <div className="hero-visual-col">
          <div className="neural-telemetry-card">
            <div className="neural-card-header">
              <div className="neural-card-title-group">
                <span className="neural-status-led" />
                <span className="neural-card-title">ARCH_TOPOLOGY // INTERACTIVE INSPECTOR</span>
              </div>
              <span className="neural-card-hint">Click node to inspect</span>
            </div>

            <div className="neural-svg-viewport">
              <svg
                className="neural-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                ref={canvasRef}
              >
                <defs>
                  <pattern id="editorial-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path
                      d="M 10 0 L 0 0 0 10"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.03)"
                      strokeWidth="0.2"
                    />
                  </pattern>
                  {skills.map((skill) => (
                    <radialGradient key={skill.id} id={`glow-${skill.id}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={skill.color} stopOpacity="0.55" />
                      <stop offset="100%" stopColor={skill.color} stopOpacity="0" />
                    </radialGradient>
                  ))}
                  <radialGradient id="glow-ai" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={AI_COLOR} stopOpacity="0.45" />
                    <stop offset="100%" stopColor={AI_COLOR} stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Subtle telemetry coordinate grid */}
                <rect width="100" height="100" fill="url(#editorial-grid)" />

                {/* Synaptic connections between 4 pillars */}
                {SYNAPSES.map((synapse, i) => {
                  const isActive = hoveredNeuron === synapse.from || hoveredNeuron === synapse.to;
                  const fromSkill = skills[synapse.from];
                  return (
                    <g key={i}>
                      <path
                        d={synapse.path}
                        fill="none"
                        stroke={isActive ? fromSkill.color : 'rgba(255, 255, 255, 0.11)'}
                        strokeWidth={isActive ? 0.45 : 0.22}
                        className={`synapse-path ${isActive ? 'synapse-active' : ''}`}
                      />
                    </g>
                  );
                })}

                {/* Central AI Core synapses */}
                {AI_SYNAPSES.map((aiSynapse, i) => {
                  const isActive = hoveredNeuron === aiSynapse.toIndex;
                  return (
                    <g key={`ai-syn-${i}`}>
                      <path
                        d={aiSynapse.path}
                        fill="none"
                        stroke={isActive ? AI_COLOR : 'rgba(250, 204, 21, 0.22)'}
                        strokeWidth={isActive ? 0.4 : 0.2}
                        className="synapse-path ai-synapse"
                      />
                    </g>
                  );
                })}

                {/* Travelling data pulses */}
                {pulses.map(pulse => {
                  const synapse = SYNAPSES[pulse.synapseIndex];
                  return (
                    <circle
                      key={pulse.id}
                      r="0.85"
                      fill={pulse.color}
                      opacity="0.95"
                      className="synapse-pulse-dot"
                    >
                      <animateMotion
                        dur="1.2s"
                        fill="freeze"
                        keyPoints={pulse.reverse ? '1;0' : '0;1'}
                        keyTimes="0;1"
                        path={synapse.path}
                      />
                    </circle>
                  );
                })}

                {/* Central Systems Core Node */}
                <g className="neuron-group ai-hub-node">
                  <circle
                    cx={AI_NODE.x}
                    cy={AI_NODE.y}
                    r={7}
                    fill="url(#glow-ai)"
                    className="neuron-glow ai-hub-glow"
                  />
                  <circle
                    cx={AI_NODE.x}
                    cy={AI_NODE.y}
                    r={3.2}
                    fill="var(--bg-void)"
                    stroke={AI_COLOR}
                    strokeWidth="0.35"
                    className="neuron-core ai-hub-core"
                  />
                  <circle
                    cx={AI_NODE.x}
                    cy={AI_NODE.y}
                    r={1.1}
                    fill={AI_COLOR}
                    opacity="0.9"
                    className="neuron-center ai-hub-center"
                  />
                  <text
                    x={AI_NODE.x}
                    y={AI_NODE.y + 6.8}
                    textAnchor="middle"
                    className="neuron-label ai-hub-label"
                    fill={AI_COLOR}
                    fontSize="2.3"
                    fontFamily="var(--font-mono)"
                    fontWeight="600"
                  >
                    FULL-STACK CORE
                  </text>
                </g>

                {/* 4 Interactive Pillar Nodes */}
                {NEURON_POSITIONS.map((pos, i) => {
                  const skill = skills[i];
                  const isHovered = hoveredNeuron === i;
                  const isActive = activeNeuron === skill.id;
                  const isDimmed = activeNeuron && activeNeuron !== skill.id;
                  return (
                    <g
                      key={skill.id}
                      className={`neuron-group ${isHovered ? 'neuron-hovered' : ''} ${isDimmed ? 'neuron-dimmed' : ''}`}
                      onMouseEnter={() => handleNeuronHover(i)}
                      onMouseLeave={() => setHoveredNeuron(null)}
                      onClick={() => onNeuronClick(skill.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isHovered || isActive ? 10 : 7}
                        fill={`url(#glow-${skill.id})`}
                        className="neuron-glow"
                      />
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isHovered || isActive ? 4.4 : 3.5}
                        fill="var(--bg-void)"
                        stroke={skill.color}
                        strokeWidth={isHovered || isActive ? 0.55 : 0.35}
                        className="neuron-core"
                      />
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isHovered || isActive ? 1.6 : 1.1}
                        fill={skill.color}
                        className="neuron-center"
                      />
                      <text
                        x={pos.x}
                        y={pos.y + (pos.y < 50 ? -6.8 : 8.2)}
                        textAnchor="middle"
                        className="neuron-label"
                        fill={isHovered || isActive ? skill.color : 'var(--text-primary)'}
                        fontSize="2.7"
                        fontFamily="var(--font-display)"
                        fontWeight="600"
                      >
                        {skill.shortLabel || skill.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Interactive 4-Pillar Legend Bar */}
            <div className="neural-pillars-grid">
              {skills.map((skill, idx) => {
                const isSelected = activeNeuron === skill.id || hoveredNeuron === idx;
                return (
                  <button
                    key={skill.id}
                    type="button"
                    className={`neural-pillar-btn ${isSelected ? 'active' : ''}`}
                    style={{ '--pillar-color': skill.color }}
                    onMouseEnter={() => handleNeuronHover(idx)}
                    onMouseLeave={() => setHoveredNeuron(null)}
                    onClick={() => onNeuronClick(skill.id)}
                  >
                    <span className="pillar-dot" style={{ background: skill.color }} />
                    <span className="pillar-name">{skill.shortLabel || skill.label}</span>
                    <span className="pillar-arrow">↗</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
