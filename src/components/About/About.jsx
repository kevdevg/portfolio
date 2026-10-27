import { useIntersection } from '../../hooks/useIntersection';
import { stats } from '../../data/projects';
import { trackSectionView } from '../../utils/analytics';
import './About.css';

const TELEMETRY_KPIS = [
  { label: 'Total Contributions', value: stats.totalContributionsLabel || '4,000+' },
  { label: 'Merged Pull Requests', value: stats.mergedPRsLabel || '367+' },
  { label: 'Production Repos & Orgs', value: stats.orgsContributedLabel || '35+' },
  { label: 'Years Shipping Prod', value: stats.yearsActiveLabel || '9+' },
];

export default function About() {
  const [ref, isVisible] = useIntersection({ onVisible: () => trackSectionView('about') });

  return (
    <section className="about section" id="about" ref={ref}>
      <div className={`reveal ${isVisible ? 'visible' : ''}`}>
        <span className="section-eyebrow">Architecture &amp; Engineering Impact</span>
        <h2 className="section-title">Systems Built for Production Scale</h2>
        <p className="section-subtitle">
          Nine years of full-stack engineering across programmable stablecoin payment rails,
          kernel-enforced OS sandboxes, multichain protocols, and applied machine learning.
        </p>
      </div>

      {/* 4-Card Asymmetric Bento Grid (2 cols + 1 col / 1 col + 2 cols) */}
      <div className="bento-architecture-grid">
        {/* Card 1 (Span 2): Production Engineering Telemetry */}
        <article className={`bento-card bento-span-2 glass-card reveal ${isVisible ? 'visible' : ''} reveal-delay-1`}>
          <div className="bento-card-top">
            <span className="bento-tag">01 // PRODUCTION ENGINEERING TELEMETRY</span>
            <span className="bento-status-pill">VERIFIED GITHUB &amp; ENTERPRISE METRICS</span>
          </div>

          <h3 className="bento-title">
            High-Velocity Execution Across Full-Stack, Systems &amp; Web3
          </h3>
          <p className="bento-desc">
            Consistent track record leading architecture from zero-to-one and scaling brownfield
            production repositories at <strong>Monadical</strong>, <strong>Metaplex Foundation</strong>,
            <strong> Greyhaven</strong>, and <strong>Scope3</strong>.
          </p>

          <div className="bento-kpi-row">
            {TELEMETRY_KPIS.map((kpi) => (
              <div key={kpi.label} className="bento-kpi-box">
                <span className="bento-kpi-value tabular-nums">{kpi.value}</span>
                <span className="bento-kpi-label">{kpi.label}</span>
              </div>
            ))}
          </div>

          {/* Multi-segment Language Distribution Bar */}
          <div className="telemetry-lang-block">
            <div className="telemetry-lang-header">
              <span className="telemetry-lang-caption">PRODUCTION CODEBASE DISTRIBUTION</span>
              <span className="telemetry-lang-total tabular-nums">55.8M+ BYTES INDEXED</span>
            </div>

            <div className="telemetry-stacked-bar" aria-label="Language distribution bar">
              {stats.topLanguages.map((lang) => (
                <div
                  key={lang.name}
                  className="telemetry-bar-segment"
                  style={{
                    width: `${lang.percent}%`,
                    backgroundColor: lang.color,
                  }}
                  title={`${lang.name}: ${lang.percent}%`}
                />
              ))}
            </div>

            <div className="telemetry-lang-legend">
              {stats.topLanguages.map((lang) => (
                <div key={lang.name} className="telemetry-legend-item">
                  <span className="telemetry-legend-dot" style={{ backgroundColor: lang.color }} />
                  <span className="telemetry-legend-name">{lang.name}</span>
                  <span className="telemetry-legend-pct tabular-nums">{lang.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Card 2 (Span 1): Programmable Stablecoin & Fintech Rails */}
        <article className={`bento-card bento-span-1 glass-card reveal ${isVisible ? 'visible' : ''} reveal-delay-2`}>
          <div className="bento-card-top">
            <span className="bento-tag bento-tag-web3">02 // FINTECH &amp; STABLECOIN RAILS</span>
          </div>

          <h3 className="bento-title">Programmable Stablecoin &amp; Treasury Infrastructure</h3>
          <p className="bento-desc">
            Lead Developer on <strong>SpudPay (SpudUSD)</strong> (28+ PRs) and core engineer on the{' '}
            <strong>TicketNetwork Stablecoin Controller</strong> (100+ commits).
          </p>

          {/* Mini Visual Artifact: Settlement Pipeline */}
          <div className="bento-artifact-flow">
            <div className="artifact-node">
              <span className="artifact-node-code">KYB / Card</span>
              <span className="artifact-node-sub">Coinflow Submerchant</span>
            </div>
            <span className="artifact-arrow">→</span>
            <div className="artifact-node artifact-node-active">
              <span className="artifact-node-code">Brale API</span>
              <span className="artifact-node-sub">USD ⇄ USDC Mint</span>
            </div>
            <span className="artifact-arrow">→</span>
            <div className="artifact-node">
              <span className="artifact-node-code">Solana / Ledger</span>
              <span className="artifact-node-sub">Idempotent Webhooks</span>
            </div>
          </div>

          <div className="bento-chip-list">
            <span className="bento-chip">Brale Treasury</span>
            <span className="bento-chip">Coinflow</span>
            <span className="bento-chip">NestJS + Prisma</span>
            <span className="bento-chip">Solana SPL</span>
          </div>
        </article>

        {/* Card 3 (Span 1): Kernel Sandboxing & Native Desktop */}
        <article className={`bento-card bento-span-1 glass-card reveal ${isVisible ? 'visible' : ''} reveal-delay-3`}>
          <div className="bento-card-top">
            <span className="bento-tag bento-tag-devops">03 // NATIVE OS &amp; KERNEL SECURITY</span>
          </div>

          <h3 className="bento-title">Kernel Sandboxing &amp; Native Desktop Companions</h3>
          <p className="bento-desc">
            74+ commits across <strong>Greywall (★184)</strong> &amp; <strong>Greyproxy (★35)</strong>.
            Built the cross-platform Wails desktop suite and native macOS status bar integration.
          </p>

          {/* Mini Terminal / System Artifact */}
          <div className="bento-terminal-box">
            <div className="terminal-line">
              <span className="term-prompt">$</span>
              <span className="term-cmd">greywall --isolate landlock,seccomp</span>
            </div>
            <div className="terminal-line">
              <span className="term-ok">✓</span>
              <span className="term-out">macOS CGO NSStatusItem tray bridge active</span>
            </div>
            <div className="terminal-line">
              <span className="term-ok">✓</span>
              <span className="term-out">SOCKS5/DNS deny-by-default proxy listening</span>
            </div>
          </div>

          <div className="bento-chip-list">
            <span className="bento-chip">Go (Golang)</span>
            <span className="bento-chip">Wails + React/TS</span>
            <span className="bento-chip">CGO / Objective-C</span>
            <span className="bento-chip">Landlock / seccomp</span>
          </div>
        </article>

        {/* Card 4 (Span 2): Applied AI, Speech & Computer Vision + Dual Profile */}
        <article className={`bento-card bento-span-2 glass-card reveal ${isVisible ? 'visible' : ''} reveal-delay-4`}>
          <div className="bento-card-top">
            <span className="bento-tag bento-tag-backend">04 // APPLIED AI, COMPUTER VISION &amp; COGNITIVE SCIENCE</span>
            <span className="bento-status-pill">SYSTEMS ENG × PSYCHOLOGY</span>
          </div>

          <div className="bento-ai-split">
            <div className="bento-ai-main">
              <h3 className="bento-title">
                Multimodal AI Pipelines, Speech Diarization &amp; Real-Time Vision
              </h3>
              <p className="bento-desc">
                From on-premise audio intelligence in <strong>Reflector (★49)</strong> (Deepgram, Whisper,
                Modal, FFmpeg) and 27 merged PRs in the <strong>Scope3 AI Carbon SDK</strong> (OpenAI,
                HuggingFace, LiteLLM, Mistral) to a real-time <strong>Colombian Sign Language (LSC)
                Translator</strong> powered by MediaPipe landmarks, quantized TensorFlow Lite, and FastAPI.
              </p>

              <div className="bento-chip-list">
                <span className="bento-chip">Python / FastAPI</span>
                <span className="bento-chip">MediaPipe + TFLite</span>
                <span className="bento-chip">Deepgram / Whisper</span>
                <span className="bento-chip">LiteLLM &amp; n8n Agents</span>
                <span className="bento-chip">Next.js + GraphQL (Recidiviz)</span>
              </div>
            </div>

            <div className="bento-cognitive-panel">
              <span className="cognitive-eyebrow">DUAL DISCIPLINARY LENS</span>
              <h4 className="cognitive-title">Systems Engineering + Behavioral Psychology</h4>
              <p className="cognitive-text">
                Combining an <strong>Information Systems Technology</strong> degree (Universidad del Valle)
                with a 9th-semester <strong>B.A. in Psychology</strong> (Universidad EAN) to architect
                human-centric AI workflows, low-friction fintech UX, and high-trust interfaces.
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
