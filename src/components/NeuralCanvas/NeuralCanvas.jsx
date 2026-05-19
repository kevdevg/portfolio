import { useState, useEffect, useRef, useCallback } from 'react';
import { skills } from '../../data/skills';
import './NeuralCanvas.css';

const NEURON_POSITIONS = [
  { x: 30, y: 35 },  // Frontend — top left
  { x: 70, y: 30 },  // Backend — top right
  { x: 25, y: 70 },  // Web3 — bottom left
  { x: 72, y: 72 },  // DevOps — bottom right
];

// Central AI hub node — connects all neurons
const AI_NODE = { x: 50, y: 88 };
const AI_COLOR = 'hsl(45, 100%, 65%)';

function getSynapsePath(from, to) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const cx1 = from.x + dx * 0.25 + dy * 0.15;
  const cy1 = from.y + dy * 0.25 - dx * 0.15;
  const cx2 = to.x - dx * 0.25 - dy * 0.15;
  const cy2 = to.y - dy * 0.25 + dx * 0.15;
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

// Synapses connecting AI hub to each skill neuron
function getAISynapses() {
  return NEURON_POSITIONS.map((pos, i) => ({
    toIndex: i,
    path: getSynapsePath(AI_NODE, pos),
  }));
}

const AI_SYNAPSES = getAISynapses();

const SYNAPSES = getAllSynapses();

export default function NeuralCanvas({ onNeuronClick, activeNeuron }) {
  const [hoveredNeuron, setHoveredNeuron] = useState(null);
  const [pulses, setPulses] = useState([]);
  const [particles, setParticles] = useState([]);
  const pulseIdRef = useRef(0);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Background floating particles
  useEffect(() => {
    const pts = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.3 + 0.1,
      delay: Math.random() * 5,
    }));
    setParticles(pts);
  }, []);

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
    }, 1500);
  }, []);

  const handleNeuronHover = useCallback((index) => {
    setHoveredNeuron(index);
    firePulse(index);
  }, [firePulse]);

  return (
    <section className="neural-canvas" id="hero">
      {/* Background particles */}
      <div className="neural-particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="neural-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${20 + p.speed * 30}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Title overlay */}
      <div className="neural-hero-text">
        <p className="neural-greeting">Hi, I'm</p>
        <h1 className="neural-name">Kevin Guevara</h1>
        <p className="neural-tagline">
          Full Stack Developer building across the{' '}
          <span className="text-gradient">entire stack</span>
        </p>
        <p className="neural-cta">Click a neuron to explore</p>
      </div>

      {/* SVG Neural Network */}
      <svg
        className="neural-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        ref={canvasRef}
      >
        <defs>
          {skills.map((skill, i) => (
            <radialGradient key={skill.id} id={`glow-${skill.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={skill.color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={skill.color} stopOpacity="0" />
            </radialGradient>
          ))}
          {/* AI hub gradient */}
          <radialGradient id="glow-ai" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={AI_COLOR} stopOpacity="0.5" />
            <stop offset="100%" stopColor={AI_COLOR} stopOpacity="0" />
          </radialGradient>
          <filter id="blur-ai">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
          {skills.map((skill) => (
            <filter key={`filter-${skill.id}`} id={`blur-${skill.id}`}>
              <feGaussianBlur stdDeviation="1.5" />
            </filter>
          ))}
        </defs>

        {/* Synaptic connections */}
        {SYNAPSES.map((synapse, i) => {
          const isActive = hoveredNeuron === synapse.from || hoveredNeuron === synapse.to;
          const fromSkill = skills[synapse.from];
          const toSkill = skills[synapse.to];
          return (
            <g key={i}>
              {/* Base line */}
              <path
                d={synapse.path}
                fill="none"
                stroke={isActive ? fromSkill.color : 'hsla(220, 20%, 30%, 0.2)'}
                strokeWidth={isActive ? 0.3 : 0.15}
                className={`synapse-path ${isActive ? 'synapse-active' : ''}`}
              />
              {/* Glow line */}
              {isActive && (
                <path
                  d={synapse.path}
                  fill="none"
                  stroke={fromSkill.color}
                  strokeWidth="0.6"
                  opacity="0.15"
                  filter={`url(#blur-${fromSkill.id})`}
                />
              )}
            </g>
          );
        })}

        {/* AI hub synapses — connecting center to all neurons */}
        {AI_SYNAPSES.map((aiSynapse, i) => {
          const isActive = hoveredNeuron === aiSynapse.toIndex;
          const targetSkill = skills[aiSynapse.toIndex];
          return (
            <g key={`ai-syn-${i}`}>
              <path
                d={aiSynapse.path}
                fill="none"
                stroke={isActive ? AI_COLOR : 'hsla(45, 30%, 30%, 0.18)'}
                strokeWidth={isActive ? 0.3 : 0.12}
                className={`synapse-path ai-synapse ${isActive ? 'synapse-active' : ''}`}
              />
              {isActive && (
                <path
                  d={aiSynapse.path}
                  fill="none"
                  stroke={AI_COLOR}
                  strokeWidth="0.5"
                  opacity="0.12"
                  filter="url(#blur-ai)"
                />
              )}
            </g>
          );
        })}

        {/* Pulse animations */}
        {pulses.map(pulse => {
          const synapse = SYNAPSES[pulse.synapseIndex];
          return (
            <circle
              key={pulse.id}
              r="0.6"
              fill={pulse.color}
              opacity="0.9"
              className="synapse-pulse-dot"
            >
              <animateMotion
                dur="1.2s"
                fill="freeze"
                keyPoints={pulse.reverse ? "1;0" : "0;1"}
                keyTimes="0;1"
                path={synapse.path}
              />
            </circle>
          );
        })}

        {/* Neuron nodes */}
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
              {/* Outer glow */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered || isActive ? 6 : 4}
                fill={`url(#glow-${skill.id})`}
                className="neuron-glow"
              />
              {/* Core */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered || isActive ? 3 : 2.2}
                fill="var(--bg-void)"
                stroke={skill.color}
                strokeWidth={isHovered || isActive ? 0.4 : 0.25}
                className="neuron-core"
              />
              {/* Inner dot */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered || isActive ? 1.2 : 0.8}
                fill={skill.color}
                opacity={isHovered || isActive ? 1 : 0.7}
                className="neuron-center"
              />
              {/* Label */}
              <text
                x={pos.x}
                y={pos.y + (pos.y < 50 ? -5.5 : 6.5)}
                textAnchor="middle"
                className="neuron-label"
                fill={isHovered || isActive ? skill.color : 'var(--text-secondary)'}
                fontSize="2.2"
                fontFamily="var(--font-display)"
                fontWeight="600"
              >
                {skill.icon} {skill.label}
              </text>
            </g>
          );
        })}

        {/* Central AI hub node — non-interactive */}
        <g className="neuron-group ai-hub-node">
          {/* Outer glow */}
          <circle
            cx={AI_NODE.x}
            cy={AI_NODE.y}
            r={3.5}
            fill="url(#glow-ai)"
            className="neuron-glow ai-hub-glow"
          />
          {/* Core ring */}
          <circle
            cx={AI_NODE.x}
            cy={AI_NODE.y}
            r={2}
            fill="var(--bg-void)"
            stroke={AI_COLOR}
            strokeWidth="0.25"
            className="neuron-core ai-hub-core"
          />
          {/* Inner dot */}
          <circle
            cx={AI_NODE.x}
            cy={AI_NODE.y}
            r={0.7}
            fill={AI_COLOR}
            opacity="0.85"
            className="neuron-center ai-hub-center"
          />
          {/* Label */}
          <text
            x={AI_NODE.x}
            y={AI_NODE.y - 5}
            textAnchor="middle"
            className="neuron-label ai-hub-label"
            fill={AI_COLOR}
            fontSize="2"
            fontFamily="var(--font-display)"
            fontWeight="600"
            opacity="0.7"
          >
            🤖 AI
          </text>
        </g>
      </svg>

      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <div className="scroll-arrow" />
      </div>
    </section>
  );
}
