import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NeuralBrainCanvas from '../NeuralBrain/NeuralBrainCanvas';
import {
  CONTACT_LINKS,
  MIND_COPY,
  NEURAL_REGIONS,
  STAGE_WINDOWS,
} from '../../data/mindContent';
import { clamp, useStickyScrollProgress } from '../../utils/scrollMath';
import {
  trackEmailCopy,
  trackOutboundClick,
  trackRegionFocus,
} from '../../utils/analytics';
import './MindJourney.css';

const DOCK_TARGETS = [0, 0.25, 0.43, 0.61, 0.78, 0.94];

const ScrollArrowIcon = memo(function ScrollArrowIcon() {
  return (
    <svg
      className="mind-scroll-arrow"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 2.25V11.75M7 11.75L3.5 8.25M7 11.75L10.5 8.25"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
});

const CopyStatusIcon = memo(function CopyStatusIcon({ copied }) {
  if (copied) {
    return (
      <svg
        className="mind-copy-icon"
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3.25 8.5L6.5 11.75L12.75 4.75"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className="mind-copy-icon"
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="5.25"
        y="5.25"
        width="8.25"
        height="8.25"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      <path
        d="M3.5 10.5H3.25C2.56 10.5 2 9.94 2 9.25V3.25C2 2.56 2.56 2 3.25 2H9.25C9.94 2 10.5 2.56 10.5 3.25V3.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
});

function computeStageMotion(progress, stageIndex) {
  const p = clamp(progress, 0, 1);
  const w = STAGE_WINDOWS[stageIndex];
  const isFirst = stageIndex === 0;
  const isLast = stageIndex === STAGE_WINDOWS.length - 1;
  const fade = 0.02;

  if (p < w.start) {
    return { opacity: 0, y: 18 };
  }
  if (isLast ? p > w.end : p >= w.end) {
    return { opacity: 0, y: -18 };
  }

  if (isFirst) {
    const outStart = w.end - fade;
    if (p <= outStart) {
      const tHold = clamp(p / Math.max(0.001, outStart), 0, 1);
      return { opacity: 1, y: -3 * tHold };
    }
    const tOut = clamp((p - outStart) / fade, 0, 1);
    return { opacity: 1 - tOut * tOut, y: -3 - 15 * tOut };
  }

  if (isLast) {
    const inEnd = w.start + fade;
    if (p < inEnd) {
      const tIn = clamp((p - w.start) / fade, 0, 1);
      const eased = 1 - Math.pow(1 - tIn, 3);
      return { opacity: 0.24 + 0.76 * eased, y: 16 * (1 - eased) };
    }
    return { opacity: 1, y: 0 };
  }

  const inEnd = w.start + fade;
  const outStart = w.end - fade;

  if (p < inEnd) {
    const tIn = clamp((p - w.start) / fade, 0, 1);
    const eased = 1 - Math.pow(1 - tIn, 3);
    return { opacity: 0.24 + 0.76 * eased, y: 16 * (1 - eased) + 2 * eased };
  }
  if (p <= outStart) {
    const tHold = clamp(
      (p - inEnd) / Math.max(0.001, outStart - inEnd),
      0,
      1
    );
    return { opacity: 1, y: 2 - 4 * tHold };
  }
  const tOut = clamp((p - outStart) / fade, 0, 1);
  return { opacity: 1 - tOut * tOut, y: -2 - 15 * tOut };
}

export default function MindJourney({
  lang,
  onProgressChange,
  registerJumpToEnd,
}) {
  const trackRef = useRef(null);
  const lastTrackedRegionRef = useRef(-1);
  const copyTimerRef = useRef(0);
  const [copied, setCopied] = useState(false);

  const copy = MIND_COPY[lang] || MIND_COPY.en;
  const progress = useStickyScrollProgress(trackRef, 0);

  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cvAtsHref = `${normalizedBase}${CONTACT_LINKS.cvAtsFile}`;
  const cvExtendedHref = `${normalizedBase}${CONTACT_LINKS.cvExtendedFile}`;

  const scrollToProgress = useCallback((targetProgress) => {
    const el = trackRef.current;
    if (!el) return;
    const elementTop = el.getBoundingClientRect().top + window.scrollY;
    const scrollable = Math.max(1, el.offsetHeight - window.innerHeight);
    const top = elementTop + clamp(targetProgress, 0, 1) * scrollable;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    onProgressChange?.(progress);
  }, [progress, onProgressChange]);

  useEffect(() => {
    if (!registerJumpToEnd) return undefined;
    registerJumpToEnd(() => scrollToProgress(0.94));
    return () => registerJumpToEnd(null);
  }, [registerJumpToEnd, scrollToProgress]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const activeStageIndex = useMemo(() => {
    const p = clamp(progress, 0, 1);
    for (let i = 0; i < STAGE_WINDOWS.length; i += 1) {
      const w = STAGE_WINDOWS[i];
      const isLast = i === STAGE_WINDOWS.length - 1;
      if (p >= w.start && (isLast ? p <= w.end : p < w.end)) {
        return i;
      }
    }
    return 0;
  }, [progress]);

  const activeStage = STAGE_WINDOWS[activeStageIndex];

  useEffect(() => {
    const idx = activeStage.regionIndex;
    if (idx >= 0 && idx < NEURAL_REGIONS.length) {
      if (lastTrackedRegionRef.current !== idx) {
        lastTrackedRegionRef.current = idx;
        trackRegionFocus(NEURAL_REGIONS[idx].id, 'scroll');
      }
    } else {
      lastTrackedRegionRef.current = idx;
    }
  }, [activeStage.regionIndex]);

  const brainStatusLabel = useMemo(() => {
    const idx = activeStage.regionIndex;
    if (idx >= 0 && idx < copy.capabilities.length) {
      const cap = copy.capabilities[idx];
      return `${cap.index} · ${cap.tag.split('·')[0].trim()}`;
    }
    if (idx === -2) {
      return copy.contact.brainLabel;
    }
    return copy.intro.brainLabel;
  }, [activeStage.regionIndex, copy]);

  const dockNodes = useMemo(
    () => [
      {
        key: 'intro',
        label: copy.dock.intro,
        isNumeric: false,
        color: '#22D3EE',
        target: DOCK_TARGETS[0],
        regionIndex: -1,
      },
      ...NEURAL_REGIONS.map((region, idx) => ({
        key: `cap-${idx}`,
        label: region.index,
        isNumeric: true,
        color: region.colorHex,
        target: DOCK_TARGETS[idx + 1],
        regionIndex: idx,
      })),
      {
        key: 'contact',
        label: copy.dock.contact,
        isNumeric: false,
        color: '#12E299',
        target: DOCK_TARGETS[5],
        regionIndex: -2,
      },
    ],
    [copy.dock.intro, copy.dock.contact]
  );

  const handleDockJump = useCallback(
    (node) => {
      if (node.regionIndex >= 0 && node.regionIndex < NEURAL_REGIONS.length) {
        lastTrackedRegionRef.current = node.regionIndex;
        trackRegionFocus(NEURAL_REGIONS[node.regionIndex].id, 'dock');
      }
      scrollToProgress(node.target);
    },
    [scrollToProgress]
  );

  const handleCopyEmail = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(CONTACT_LINKS.email);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = CONTACT_LINKS.email;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch {
      // Clipboard API restricted in frame; still provide tactile feedback
    }

    trackEmailCopy();
    setCopied(true);
    if (copyTimerRef.current) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      copyTimerRef.current = 0;
    }, 2200);
  }, []);

  const introMotion = computeStageMotion(progress, 0);
  const contactMotion = computeStageMotion(progress, 5);

  return (
    <section
      id="mind-top"
      ref={trackRef}
      className="mind-track"
      aria-label="Capabilities and Neural Architecture"
    >
      <div className="mind-sticky">
        <div className="mind-grid container">
          {/* Neural Brain Canvas Zone (Top on Mobile, Right on Desktop) */}
          <div className="mind-brain-slot">
            <NeuralBrainCanvas
              progress={progress}
              activeRegionIndex={activeStage.regionIndex}
              statusLabel={brainStatusLabel}
              touchHint={copy.dock.touchHint}
            />
          </div>

          {/* Editorial Narrative Stage Zone (Bottom on Mobile, Left on Desktop) */}
          <div className="mind-narrative-slot">
            {/* Stage 0: Intro */}
            <article
              className={`mind-stage mind-stage--intro ${
                activeStageIndex === 0 ? 'mind-stage--active' : ''
              }`}
              style={{
                opacity: introMotion.opacity,
                transform: `translate3d(0, ${introMotion.y.toFixed(2)}px, 0)`,
                pointerEvents: activeStageIndex === 0 ? 'auto' : 'none',
                visibility: introMotion.opacity <= 0.004 ? 'hidden' : 'visible',
              }}
              aria-hidden={activeStageIndex !== 0}
            >
              <span className="eyebrow">
                <span className="eyebrow-dot" aria-hidden="true" />
                <span>{copy.intro.eyebrow}</span>
              </span>

              <h1 className="mind-intro-title">
                {copy.intro.headlineLead}{' '}
                <span className="text-gradient">
                  {copy.intro.headlineAccent}
                </span>
              </h1>

              <p className="mind-intro-body">{copy.intro.body}</p>

              <div className="mind-scroll-hint">
                <span>{copy.intro.scrollHint}</span>
                <ScrollArrowIcon />
              </div>
            </article>

            {/* Stages 1..4: Capabilities */}
            {copy.capabilities.map((cap, i) => {
              const stageIdx = i + 1;
              const isActive = activeStageIndex === stageIdx;
              const motion = computeStageMotion(progress, stageIdx);
              const region = NEURAL_REGIONS[i];

              return (
                <article
                  key={region.id}
                  className={`mind-stage mind-stage--cap ${
                    isActive ? 'mind-stage--active' : ''
                  }`}
                  style={{
                    '--cap-color': region.colorHex,
                    '--cap-muted': region.mutedRgba,
                    '--cap-glow': region.glowRgba,
                    opacity: motion.opacity,
                    transform: `translate3d(0, ${motion.y.toFixed(2)}px, 0)`,
                    pointerEvents: isActive ? 'auto' : 'none',
                    visibility: motion.opacity <= 0.004 ? 'hidden' : 'visible',
                  }}
                  aria-hidden={!isActive}
                >
                  <div className="mind-cap-card">
                    <div className="mind-cap-header">
                      <span className="mind-cap-index tabular-nums">
                        {cap.index}
                      </span>
                      <span className="mind-cap-sep" aria-hidden="true" />
                      <span className="mind-cap-tag">{cap.tag}</span>
                    </div>

                    <h2 className="mind-cap-title">{cap.title}</h2>
                    <p className="mind-cap-body">{cap.body}</p>
                  </div>
                </article>
              );
            })}

            {/* Stage 5: Final Synthesis & Direct Contact */}
            <article
              className={`mind-stage mind-stage--contact ${
                activeStageIndex === 5 ? 'mind-stage--active' : ''
              }`}
              style={{
                opacity: contactMotion.opacity,
                transform: `translate3d(0, ${contactMotion.y.toFixed(2)}px, 0)`,
                pointerEvents: activeStageIndex === 5 ? 'auto' : 'none',
                visibility:
                  contactMotion.opacity <= 0.004 ? 'hidden' : 'visible',
              }}
              aria-hidden={activeStageIndex !== 5}
            >
              <span className="eyebrow mind-contact-eyebrow">
                <span className="eyebrow-dot" aria-hidden="true" />
                <span>{copy.contact.eyebrow}</span>
              </span>

              <h2 className="mind-contact-title">{copy.contact.title}</h2>
              <p className="mind-contact-body">{copy.contact.body}</p>

              <div className="mind-contact-actions">
                <button
                  type="button"
                  className={`mind-copy-btn ${
                    copied ? 'mind-copy-btn--copied' : ''
                  }`}
                  onClick={handleCopyEmail}
                >
                  <CopyStatusIcon copied={copied} />
                  <span>
                    {copied ? copy.contact.copySuccess : copy.contact.copyIdle}
                  </span>
                </button>

                <a
                  href={CONTACT_LINKS.mailtoHref}
                  className="mind-mailto-btn"
                  onClick={() =>
                    trackOutboundClick(CONTACT_LINKS.mailtoHref, 'contact_mail')
                  }
                >
                  {copy.contact.openMail}
                </a>
              </div>

              <div className="mind-contact-meta">
                <div className="mind-social-links">
                  <a
                    href={CONTACT_LINKS.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mind-meta-link"
                    onClick={() =>
                      trackOutboundClick(CONTACT_LINKS.github, 'contact_github')
                    }
                  >
                    GitHub ↗
                  </a>
                  <span className="mind-cv-dot" aria-hidden="true">
                    ·
                  </span>
                  <a
                    href={CONTACT_LINKS.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mind-meta-link"
                    onClick={() =>
                      trackOutboundClick(
                        CONTACT_LINKS.linkedin,
                        'contact_linkedin'
                      )
                    }
                  >
                    LinkedIn ↗
                  </a>
                </div>

                <span className="mind-meta-divider" aria-hidden="true" />

                <div className="mind-cv-group">
                  <span className="mind-cv-prompt">
                    {copy.contact.cvPrompt}
                  </span>
                  <a
                    href={cvAtsHref}
                    download={CONTACT_LINKS.cvAtsFile}
                    className="mind-cv-link"
                    onClick={() =>
                      trackOutboundClick(cvAtsHref, 'contact_cv_ats')
                    }
                  >
                    {copy.contact.cvAts}
                  </a>
                  <span className="mind-cv-dot" aria-hidden="true">
                    ·
                  </span>
                  <a
                    href={cvExtendedHref}
                    download={CONTACT_LINKS.cvExtendedFile}
                    className="mind-cv-link"
                    onClick={() =>
                      trackOutboundClick(cvExtendedHref, 'contact_cv_extended')
                    }
                  >
                    {copy.contact.cvExtended}
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>

        {/* Bottom Synaptic Navigation Dock */}
        <nav className="mind-dock" aria-label="Neural capability stages">
          <div className="mind-dock-pill">
            {dockNodes.map((node, idx) => {
              const isActive = activeStageIndex === idx;
              return (
                <button
                  key={node.key}
                  type="button"
                  className={`mind-dock-btn ${
                    node.isNumeric ? 'mind-dock-btn--num tabular-nums' : ''
                  } ${isActive ? 'mind-dock-btn--active' : ''}`}
                  style={{ '--dock-color': node.color }}
                  aria-current={isActive ? 'step' : undefined}
                  onClick={() => handleDockJump(node)}
                >
                  <span className="mind-dock-dot" aria-hidden="true" />
                  <span>{node.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </section>
  );
}
