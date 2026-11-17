import { memo, useEffect, useRef, useState } from 'react';
import { NEURAL_REGIONS } from '../../data/mindContent';
import './NeuralBrain.css';

/* ============================================================
   DETERMINISTIC PRNG & MATH PRIMITIVES
   ============================================================ */

function createMulberry32(seed) {
  let state = seed >>> 0;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(val, min, max) {
  return val < min ? min : val > max ? max : val;
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// Region color table: 0..3 from NEURAL_REGIONS + 4 ('bridge' — Corpus Callosum gold #FFCA47)
const REGION_RGB = [
  ...NEURAL_REGIONS.map((r) => hexToRgb(r.colorHex)),
  [255, 202, 71],
];

const BRIDGE_COLOR_INDEX = 4;
const MAX_PULSES = 68;

/* ============================================================
   ANATOMICAL 3D BRAIN MORPHOLOGY ENGINE (PURE & DETERMINISTIC)
   Sculpts two distinct cerebral hemispheres separated by the
   longitudinal fissure, frontal/orbital lobes, Sylvian notch &
   temporal bulge, parietal vault, occipital pole, golden Corpus
   Callosum bridge, foliated cerebellum, and descending brainstem.
   ============================================================ */

function evalSagittalEnvelope(sRaw) {
  const s = clamp(sRaw, 0, 1);
  // z spans -0.98 (occipital pole) to +1.03 (frontal pole)
  const z = -0.98 + 2.01 * s;
  const arch = Math.pow(Math.sin(Math.PI * s), 0.56);

  // Pole midline height gently tilted from occipital (-0.11) to frontal (-0.06)
  const yPole = lerp(-0.11, -0.06, s);

  // Dorsal vault: high parietal crown (s ~ 0.44) + noble prefrontal dome (s ~ 0.78)
  const frontalDome = 0.085 * Math.exp(-Math.pow((s - 0.78) / 0.17, 2));
  const parietalCrown = 0.055 * Math.exp(-Math.pow((s - 0.43) / 0.2, 2));
  const yTop = yPole + arch * (0.74 + frontalDome + parietalCrown);

  // Ventral contour: tentorial shelf -> deep temporal lobe bulge -> flatter orbital frontal floor
  const tentorial = -0.15 - 0.08 * Math.sin(Math.PI * clamp(s / 0.34, 0, 1));
  const orbital = lerp(-0.22, -0.06, smoothstep(0.68, 1.0, s));
  const baseFloor = lerp(tentorial, orbital, smoothstep(0.3, 0.72, s));

  // Temporal lobe downward protrusion (s in [0.28, 0.70], peaking near temporal belly & pole)
  const tempWindow =
    smoothstep(0.25, 0.38, s) * (1 - smoothstep(0.63, 0.73, s));
  const temporalDrop = -0.29 * tempWindow;
  const yBot = lerp(yPole, baseFloor + temporalDrop, Math.pow(arch, 0.45));

  // Interhemispheric longitudinal fissure half-gap (|x| >= 0.088 on superior cortex)
  const xMed = 0.088 + 0.024 * Math.pow(Math.abs(s - 0.5) * 2, 1.8);

  // Lateral width: widest at temporoparietal boss (s ~ 0.44), refined taper at prefrontal pole
  const temporalWidth = 0.12 * Math.exp(-Math.pow((s - 0.45) / 0.21, 2));
  const frontalTaper = 0.055 * smoothstep(0.64, 0.96, s);
  const xLat = xMed + 0.025 + arch * (0.55 + temporalWidth - frontalTaper);

  return { z, yTop, yBot, xMed, xLat, arch };
}

function evalCorticalPoint(hemi, sRaw, thetaRaw, radialScale = 1.0) {
  const s = clamp(sRaw, 0.015, 0.985);
  const theta = clamp(thetaRaw, 0.02, Math.PI - 0.02);
  const env = evalSagittalEnvelope(s);

  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);

  // Superellipse coronal D-profile so dorsal & lateral vaults feel full and organic
  const latFactor = Math.pow(sinT, 0.74);
  const yMid = 0.52 * env.yTop + 0.48 * env.yBot;
  const yHalf = 0.5 * (env.yTop - env.yBot);

  let xAbs = env.xMed + (env.xLat - env.xMed) * latFactor * radialScale;
  let y =
    yMid +
    yHalf * Math.sign(cosT) * Math.pow(Math.abs(cosT), 0.84) * radialScale;
  let z = env.z;

  // Sylvian fissure (lateral sulcus) indentation separating frontal/parietal operculum & temporal lobe
  const sylvianZ =
    smoothstep(0.36, 0.48, s) * (1 - smoothstep(0.64, 0.75, s));
  const sylvianTheta = Math.exp(-Math.pow((theta - 1.78) / 0.24, 2));
  xAbs -= 0.068 * sylvianZ * sylvianTheta * radialScale;

  // Forward-curving temporal pole accent
  const tempPole =
    Math.exp(-Math.pow((s - 0.65) / 0.08, 2)) *
    Math.exp(-Math.pow((theta - 2.25) / 0.38, 2));
  z += 0.045 * tempPole;
  y -= 0.028 * tempPole;

  // Organic cortical gyri / sulci harmonic ridges
  const phase = hemi > 0 ? 0.35 : -0.35;
  const gyri =
    0.024 * Math.sin(7.4 * z + 4.6 * theta + phase) +
    0.016 * Math.cos(10.8 * z - 3.6 * theta - phase * 0.7);

  xAbs += gyri * sinT * radialScale;
  y += gyri * 0.75 * cosT * radialScale;
  z += 0.012 * Math.sin(6.2 * theta + 5.1 * z);

  // Enforce crisp interhemispheric longitudinal fissure separation on dorsal cortex
  const minMedial = cosT > -0.25 ? 0.088 : 0.078;
  xAbs = Math.max(minMedial, xAbs);

  return [hemi * xAbs, y, z];
}

function evalCerebellarPoint(hemi, u, v) {
  // Foliated cerebellar hemisphere tucked beneath occipital lobe:
  // z in [-0.85, -0.33], y in [-0.60, -0.22], |x| in [0.09, 0.47]
  const su = clamp(u, 0, 1);
  const sv = clamp(v, 0, 1);
  const dome = Math.sin(Math.PI * su);
  const angle = sv * Math.PI;

  const z = -0.33 - 0.51 * Math.sin(Math.PI * (0.12 + 0.78 * su));
  const folia = 0.016 * Math.sin(18.0 * sv + 4.0 * su);
  const xAbs = 0.09 + (0.37 * Math.pow(Math.sin(angle), 0.78) + folia) * Math.pow(dome, 0.55);
  const y = -0.41 + 0.18 * Math.cos(angle) * Math.pow(dome, 0.6) + folia * 0.5;

  return [hemi * Math.max(0.085, xAbs), y, z];
}

function evalStemPoint(hemi, tRaw, angleRaw) {
  // Brainstem (midbrain -> pons bulge -> medulla root): z in [-0.52, -0.17], y in [-0.78, -0.32]
  const t = clamp(tRaw, 0, 1);
  const y = lerp(-0.32, -0.78, t);
  const ponsBulge = 0.045 * Math.exp(-Math.pow((t - 0.32) / 0.22, 2));
  const zCenter = lerp(-0.2, -0.44, Math.pow(t, 1.08)) + ponsBulge * 0.6;
  const radius = lerp(0.125, 0.068, t) + ponsBulge * 0.45;

  const xAbs = 0.025 + radius * Math.abs(Math.sin(angleRaw));
  const z = zCenter + radius * 0.78 * Math.cos(angleRaw);
  return [hemi * xAbs, y, z];
}

function classifyAnatomicalRegion(x, y, z, kind) {
  if (kind === 'bridge') return 'bridge';
  if (kind === 'stem' || kind === 'cerebellum') return 3;
  if (kind === 'subcortical') return 1;

  // Exact spatial boundaries matching specification:
  // 0: Cyan Frontal / Prefrontal (z > 0.28)
  if (z > 0.28) return 0;
  // 2: Magenta Superior Parieto-Occipital Associative Web (y >= 0.12, z <= 0.28)
  if (y >= 0.12 && z <= 0.28) return 2;
  // 3: Emerald Basal Root, Cerebellum & Inferior Posterior (z < -0.12, y < 0.12)
  if (z < -0.12 && y < 0.12) return 3;
  // 1: Violet Deep Core & Middle Temporal (z in [-0.28, 0.28], y < 0.18)
  return 1;
}

function regionToColorIndex(region) {
  return region === 'bridge' ? BRIDGE_COLOR_INDEX : region;
}

function buildCorticalRibbons() {
  const ribbons = [];
  const SAMPLES = 12;

  for (const hemi of [-1, 1]) {
    const pushRibbon = (region, sampler) => {
      const pts = [];
      for (let i = 0; i < SAMPLES; i += 1) {
        pts.push(sampler(i / (SAMPLES - 1)));
      }
      ribbons.push({
        hemi,
        region,
        colorIndex: regionToColorIndex(region),
        points: pts,
      });
    };

    // --- REGION 0: FRONTAL CORTEX (5 ribbons / hemisphere) ---
    // 1. Superior Frontal Parasagittal Arch
    pushRibbon(0, (t) => evalCorticalPoint(hemi, lerp(0.64, 0.98, t), lerp(0.24, 0.55, t)));
    // 2. Dorsolateral Middle Frontal Gyrus
    pushRibbon(0, (t) =>
      evalCorticalPoint(
        hemi,
        lerp(0.63, 0.96, t),
        lerp(0.72, 1.18, t) + 0.08 * Math.sin(t * Math.PI * 2)
      )
    );
    // 3. Inferior Frontal / Broca Opercular Fold
    pushRibbon(0, (t) =>
      evalCorticalPoint(
        hemi,
        lerp(0.63, 0.91, t),
        lerp(1.32, 1.72, t) + 0.07 * Math.cos(t * Math.PI * 2)
      )
    );
    // 4. Orbital Frontal Ventral Rim
    pushRibbon(0, (t) => evalCorticalPoint(hemi, lerp(0.66, 0.97, t), lerp(2.35, 1.85, t)));
    // 5. Precentral Sulcal Ascending Crest
    pushRibbon(0, (t) => evalCorticalPoint(hemi, lerp(0.64, 0.69, Math.sin(t * Math.PI)), lerp(1.68, 0.26, t)));

    // --- REGION 1: TEMPORAL LOBE & DEEP LIMBIC CORE (4 ribbons / hemisphere) ---
    // 6. Superior Temporal / Sylvian Bank Sweep
    pushRibbon(1, (t) => evalCorticalPoint(hemi, lerp(0.66, 0.37, t), lerp(2.05, 1.82, t)));
    // 7. Middle Temporal Lateral Convexity
    pushRibbon(1, (t) =>
      evalCorticalPoint(
        hemi,
        lerp(0.64, 0.36, t),
        lerp(2.28, 2.08, t) + 0.06 * Math.sin(t * Math.PI * 2)
      )
    );
    // 8. Inferior Temporal Belly Rim
    pushRibbon(1, (t) => evalCorticalPoint(hemi, lerp(0.61, 0.38, t), lerp(2.62, 2.48, t)));
    // 9. Inner Hippocampal / Subcortical Limbic Arch
    pushRibbon(1, (t) => {
      const ang = lerp(-0.85, 1.75, t);
      const x = hemi * (0.21 + 0.08 * Math.sin(t * Math.PI));
      const y = -0.06 + 0.14 * Math.sin(ang);
      const z = 0.02 + 0.24 * Math.cos(ang);
      return [x, y, z];
    });

    // --- REGION 2: PARIETO-OCCIPITAL SUPERIOR CANOPY (5 ribbons / hemisphere) ---
    // 10. Superior Parietal Parasagittal Vault
    pushRibbon(2, (t) => evalCorticalPoint(hemi, lerp(0.63, 0.12, t), lerp(0.24, 0.38, t)));
    // 11. Postcentral & Supramarginal Dome Arch
    pushRibbon(2, (t) =>
      evalCorticalPoint(
        hemi,
        lerp(0.62, 0.28, t),
        lerp(0.68, 0.92, t) + 0.08 * Math.sin(t * Math.PI * 2)
      )
    );
    // 12. Intraparietal Associative Wave
    pushRibbon(2, (t) =>
      evalCorticalPoint(
        hemi,
        lerp(0.58, 0.16, t),
        lerp(1.08, 1.18, t) + 0.09 * Math.cos(t * Math.PI * 2.5)
      )
    );
    // 13. Angular Gyrus to Lateral Occipital Sweep
    pushRibbon(2, (t) => evalCorticalPoint(hemi, lerp(0.42, 0.05, t), lerp(1.28, 1.42, t)));
    // 14. Occipital Pole Posterior Crown
    pushRibbon(2, (t) => evalCorticalPoint(hemi, lerp(0.22, 0.025, Math.sin(t * Math.PI * 0.85 + 0.15)), lerp(0.32, 1.52, t)));

    // --- REGION 3: CEREBELLUM, TENTORIUM & BRAINSTEM ROOT (4 ribbons / hemisphere) ---
    // 15. Inferior Occipito-Tentorial Shelf
    pushRibbon(3, (t) => evalCorticalPoint(hemi, lerp(0.35, 0.04, t), lerp(2.38, 1.82, t)));
    // 16. Primary Horizontal Cerebellar Fissure
    pushRibbon(3, (t) => evalCerebellarPoint(hemi, t, 0.52 + 0.06 * Math.sin(t * Math.PI * 2)));
    // 17. Inferior Cerebellar Foliated Belly
    pushRibbon(3, (t) => evalCerebellarPoint(hemi, t, 0.78));
    // 18. Descending Corticospinal Brainstem Tract
    pushRibbon(3, (t) => evalStemPoint(hemi, t, 0.55 + 0.95 * t));
  }

  return ribbons;
}

function buildBrainTopology() {
  const rand = createMulberry32(0x6b657639);
  const nodes = [];

  const pushNode = (x, y, z, hemi, region, sizeBoost = 1.0) => {
    nodes.push({
      id: nodes.length,
      x,
      y,
      z,
      hemi,
      region,
      colorIndex: regionToColorIndex(region),
      baseRadius: (1.55 + rand() * 1.15) * sizeBoost,
      phase: rand() * Math.PI * 2,
      excited: 0,
      pulseGlow: 0,
      lastCascadeAt: -1000,
    });
  };

  // 1. Cerebral Cortex Neurons (62 per hemisphere = 124 nodes)
  // Stratified golden-spiral distribution over (s, theta) for balanced anatomical coverage
  const CORTICAL_PER_HEMI = 62;
  const GOLDEN_ANGLE = 2.399963229728653;

  for (let i = 0; i < CORTICAL_PER_HEMI; i += 1) {
    const uBase = (i + 0.5) / CORTICAL_PER_HEMI;
    // Slight density enrichment at frontal & parieto-occipital poles for crisp silhouette
    const sBase = clamp(
      0.5 - 0.48 * Math.cos(Math.PI * uBase) + (rand() - 0.5) * 0.035,
      0.03,
      0.975
    );
    const frac = (i * GOLDEN_ANGLE) / (Math.PI * 2);
    const vWrap = frac - Math.floor(frac);
    const thetaBase = clamp(0.16 + vWrap * 2.62 + (rand() - 0.5) * 0.09, 0.14, 2.84);

    for (const hemi of [-1, 1]) {
      const sJit = clamp(sBase + (rand() - 0.5) * 0.022, 0.025, 0.98);
      const tJit = clamp(thetaBase + (rand() - 0.5) * 0.055, 0.12, 2.86);
      const radial = 0.97 + rand() * 0.045;
      const [x, y, z] = evalCorticalPoint(hemi, sJit, tJit, radial);
      const region = classifyAnatomicalRegion(x, y, z, 'cortex');
      const isHub = i % 9 === 0 ? 1.24 : 1.0;
      pushNode(x, y, z, hemi, region, isHub);
    }
  }

  // 2. Deep Subcortical & Temporal-Insular Core (12 per hemisphere = 24 nodes, Region 1 Violet)
  for (let i = 0; i < 12; i += 1) {
    const t = (i + 0.5) / 12;
    const archAng = lerp(-0.95, 1.95, t);
    for (const hemi of [-1, 1]) {
      const x = hemi * (0.15 + 0.21 * ((i * 0.618) % 1) + (rand() - 0.5) * 0.03);
      const y = -0.05 + 0.16 * Math.sin(archAng) + (rand() - 0.5) * 0.04;
      const z = clamp(0.01 + 0.24 * Math.cos(archAng) + (rand() - 0.5) * 0.04, -0.26, 0.26);
      pushNode(x, clamp(y, -0.18, 0.16), z, hemi, 1, i % 4 === 0 ? 1.22 : 1.02);
    }
  }

  // 3. Corpus Callosum Bridge (18 golden #FFCA47 nodes connecting both hemispheres)
  // |x| < 0.16, y in [-0.05, 0.22], z in [-0.25, 0.35]
  const bridgeIndices = [];
  for (let i = 0; i < 9; i += 1) {
    const u = i / 8;
    const zBase = lerp(-0.23, 0.33, u);
    // Classic C-shaped callosal arch: genu anteriorly, high body centrally, splenium posteriorly
    const yBase = 0.03 + 0.175 * Math.sin(Math.PI * u) - 0.035 * Math.pow(1 - u, 2);
    for (const hemi of [-1, 1]) {
      const x = hemi * (0.042 + 0.092 * ((i % 3) / 2) + rand() * 0.014);
      const y = clamp(yBase + (rand() - 0.5) * 0.022, -0.04, 0.215);
      const z = clamp(zBase + (rand() - 0.5) * 0.02, -0.245, 0.345);
      bridgeIndices.push(nodes.length);
      pushNode(x, y, z, hemi, 'bridge', 1.14);
    }
  }

  // 4. Cerebellar Hemispheres (7 per hemisphere = 14 nodes, Region 3 Emerald)
  for (let i = 0; i < 7; i += 1) {
    const u = (i + 0.5) / 7;
    const v = 0.22 + 0.62 * ((i * 0.618034) % 1);
    for (const hemi of [-1, 1]) {
      const [x, y, z] = evalCerebellarPoint(
        hemi,
        clamp(u + (rand() - 0.5) * 0.06, 0.08, 0.92),
        clamp(v + (rand() - 0.5) * 0.08, 0.16, 0.88)
      );
      pushNode(x, y, z, hemi, 3, 1.04);
    }
  }

  // 5. Brainstem / Medulla Root (6 pairs = 12 nodes, Region 3 Emerald)
  // Descending cluster in z in [-0.55, -0.15], y in [-0.78, -0.32]
  for (let i = 0; i < 6; i += 1) {
    const t = i / 5;
    for (const hemi of [-1, 1]) {
      const ang = 0.45 + i * 0.85 + (hemi > 0 ? 0.3 : -0.3);
      const [x, y, z] = evalStemPoint(hemi, t, ang);
      pushNode(x, y, z, hemi, 3, i === 0 ? 1.15 : 0.96);
    }
  }

  // ============================================================
  // CURVED SYNAPTIC FILAMENTS (~330 edges)
  // Strictly curved in 3D via organic outward/gyral control points
  // ============================================================
  const edges = [];
  const edgeSet = new Set();
  const adjacency = Array.from({ length: nodes.length }, () => []);

  const addEdge = (aIdx, bIdx, isCommissural = false) => {
    if (aIdx === bIdx) return false;
    const lo = Math.min(aIdx, bIdx);
    const hi = Math.max(aIdx, bIdx);
    const key = lo * 4096 + hi;
    if (edgeSet.has(key)) return false;
    edgeSet.add(key);

    const a = nodes[aIdx];
    const b = nodes[bIdx];
    const mx0 = (a.x + b.x) * 0.5;
    const my0 = (a.y + b.y) * 0.5;
    const mz0 = (a.z + b.z) * 0.5;

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    const dist = Math.hypot(dx, dy, dz) || 0.001;

    let mx = mx0;
    let my = my0;
    let mz = mz0;

    if (isCommissural || a.region === 'bridge' || b.region === 'bridge') {
      // Arch commissural fibers gracefully upward over the Corpus Callosum vault
      my += dist * 0.3 + 0.035;
      mz += (rand() - 0.5) * dist * 0.14;
    } else {
      // Outward cortical convexity normal + subtle gyral tangential curl
      const radLen = Math.hypot(mx0, my0 + 0.08, mz0 * 0.72) || 1;
      const nx = mx0 / radLen;
      const ny = (my0 + 0.08) / radLen;
      const nz = (mz0 * 0.72) / radLen;

      // Cross product (d x n) for organic sulcal swirl so no axon ever projects flat
      const cx = dy * nz - dz * ny;
      const cy = dz * nx - dx * nz;
      const cz = dx * ny - dy * nx;
      const cLen = Math.hypot(cx, cy, cz) || 1;
      const swirlSign = (lo + hi) % 2 === 0 ? 1 : -1;

      const archAmt = dist * (0.2 + (rand() * 0.09));
      const swirlAmt = dist * 0.13 * swirlSign;

      mx += nx * archAmt + (cx / cLen) * swirlAmt;
      my += ny * archAmt + (cy / cLen) * swirlAmt;
      mz += nz * archAmt + (cz / cLen) * swirlAmt;

      // Keep intra-hemispheric filaments cleanly on their own side of the fissure
      if (a.hemi === b.hemi) {
        const minMidX = 0.075;
        if (Math.abs(mx) < minMidX) {
          mx = a.hemi * minMidX;
        }
      }
    }

    // Dominant region of edge (bridge edges inherit golden bridge tint or target lobe)
    let region = a.region;
    if (a.region === 'bridge' && b.region === 'bridge') {
      region = 'bridge';
    } else if (a.region === 'bridge') {
      region = b.region;
    } else if (b.region === 'bridge') {
      region = a.region;
    }

    const edgeIndex = edges.length;
    edges.push({
      a: aIdx,
      b: bIdx,
      mx,
      my,
      mz,
      region,
      secondaryRegion: b.region,
      colorIndex:
        a.region === 'bridge' && b.region === 'bridge'
          ? BRIDGE_COLOR_INDEX
          : regionToColorIndex(region),
      isCommissural,
    });

    adjacency[aIdx].push(edgeIndex);
    adjacency[bIdx].push(edgeIndex);
    return true;
  };

  // 1. Intra-hemispheric nearest-neighbor synaptic mesh (~304 edges across both hemispheres)
  for (const hemi of [-1, 1]) {
    const hemiIndices = [];
    for (let i = 0; i < nodes.length; i += 1) {
      if (nodes[i].hemi === hemi && nodes[i].region !== 'bridge') {
        hemiIndices.push(i);
      }
    }

    for (let idx = 0; idx < hemiIndices.length; idx += 1) {
      const i = hemiIndices[idx];
      const ni = nodes[i];
      const candidates = [];

      for (let jdx = 0; jdx < hemiIndices.length; jdx += 1) {
        if (idx === jdx) continue;
        const j = hemiIndices[jdx];
        const nj = nodes[j];
        const d = Math.hypot(ni.x - nj.x, ni.y - nj.y, ni.z - nj.z);
        if (d < 0.48) {
          // Slight preference for same-region continuity while allowing rich associative bridges
          const score = ni.region === nj.region ? d * 0.88 : d * 1.06;
          candidates.push({ j, score });
        }
      }

      candidates.sort((p, q) => p.score - q.score);
      const targetDegree = idx % 3 === 0 ? 4 : 3;
      let added = 0;
      for (let c = 0; c < candidates.length && added < targetDegree; c += 1) {
        if (addEdge(i, candidates[c].j, false)) {
          added += 1;
        }
      }
    }
  }

  // 2. Commissural Corpus Callosum fibers (~26 golden cross-hemisphere & callosal-cortical tracts)
  for (let p = 0; p < bridgeIndices.length; p += 2) {
    const leftBridge = bridgeIndices[p];
    const rightBridge = bridgeIndices[p + 1];
    // Transverse commissural fiber across midline
    addEdge(leftBridge, rightBridge, true);
    // Longitudinal cingulate/callosal arc along the bridge
    if (p + 2 < bridgeIndices.length) {
      addEdge(leftBridge, bridgeIndices[p + 2], true);
      addEdge(rightBridge, bridgeIndices[p + 3], true);
    }
  }

  // Radiate callosal forceps into left & right medial hemisphere hubs (frontal, core, parietal)
  for (let b = 0; b < bridgeIndices.length; b += 1) {
    const bIdx = bridgeIndices[b];
    const bn = nodes[bIdx];
    let bestA = -1;
    let bestB = -1;
    let distA = Infinity;
    let distB = Infinity;

    for (let i = 0; i < nodes.length; i += 1) {
      const n = nodes[i];
      if (n.region === 'bridge' || n.hemi !== bn.hemi) continue;
      const d = Math.hypot(n.x - bn.x, n.y - bn.y, n.z - bn.z);
      if (d < distA) {
        distB = distA;
        bestB = bestA;
        distA = d;
        bestA = i;
      } else if (d < distB) {
        distB = d;
        bestB = i;
      }
    }
    if (bestA !== -1) addEdge(bIdx, bestA, true);
    if (bestB !== -1 && b % 2 === 0) addEdge(bIdx, bestB, true);
  }

  const corticalRibbons = buildCorticalRibbons();

  // Precompute 3D centroids for each of the 4 regions (used for volumetric nebula glow)
  const regionCentroids = [
    [0, 0.18, 0.62],
    [0, -0.14, 0.04],
    [0, 0.38, -0.32],
    [0, -0.44, -0.48],
  ];
  const counts = [0, 0, 0, 0];
  const sums = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < nodes.length; i += 1) {
    const r = nodes[i].region;
    if (typeof r === 'number' && r >= 0 && r < 4) {
      counts[r] += 1;
      sums[r][0] += nodes[i].x;
      sums[r][1] += nodes[i].y;
      sums[r][2] += nodes[i].z;
    }
  }
  for (let r = 0; r < 4; r += 1) {
    if (counts[r] > 0) {
      regionCentroids[r] = [
        sums[r][0] / counts[r],
        sums[r][1] / counts[r],
        sums[r][2] / counts[r],
      ];
    }
  }

  return { nodes, edges, adjacency, corticalRibbons, regionCentroids };
}

const BRAIN_TOPOLOGY = buildBrainTopology();

/* ============================================================
   PROJECTION & QUADRATIC BÉZIER HELPERS
   ============================================================ */

function project3DPoint(x, y, z, cosYaw, sinYaw, cosPitch, sinPitch, scale, cx, cy) {
  // Yaw around Y axis, then Pitch around X axis
  const x1 = x * cosYaw - z * sinYaw;
  const z1 = x * sinYaw + z * cosYaw;
  const y2 = y * cosPitch - z1 * sinPitch;
  const z2 = y * sinPitch + z1 * cosPitch;

  const fov = 3.55;
  const persp = fov / (fov - z2);
  return {
    sx: cx + x1 * scale * persp,
    sy: cy - y2 * scale * persp,
    zCam: z2,
    persp,
  };
}

function evalQuadPoint(x1, y1, cx, cy, x2, y2, t) {
  const u = 1 - t;
  return [
    u * u * x1 + 2 * u * t * cx + t * t * x2,
    u * u * y1 + 2 * u * t * cy + t * t * y2,
  ];
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default memo(function NeuralBrainCanvas({
  progress = 0,
  activeRegionIndex = -1,
  statusLabel = '',
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Mutable simulation & camera state kept in a single ref for zero-rebind 60/120fps rAF
  const simRef = useRef(null);
  if (simRef.current === null) {
    const nodeCount = BRAIN_TOPOLOGY.nodes.length;
    const edgeCount = BRAIN_TOPOLOGY.edges.length;
    const ribbonCount = BRAIN_TOPOLOGY.corticalRibbons.length;

    simRef.current = {
      progress,
      activeRegionIndex,
      width: 0,
      height: 0,
      dpr: 1,
      reducedMotion: false,
      needsStaticDraw: true,
      // Smoothly interpolated camera orientation & zoom
      yaw: -0.38,
      pitch: 0.18,
      zoom: 1.0,
      // Elastic touch/pointer horizontal spin & subtle hover parallax
      dragYawOffset: 0,
      targetDragYaw: 0,
      hoverYaw: 0,
      hoverPitch: 0,
      targetHoverYaw: 0,
      targetHoverPitch: 0,
      // Per-region luminance [reg0, reg1, reg2, reg3, bridge]
      regionBrightness: new Float32Array([1, 1, 1, 1, 1]),
      // Preallocated projection buffers (zero per-frame GC churn)
      nodeSX: new Float32Array(nodeCount),
      nodeSY: new Float32Array(nodeCount),
      nodeZ: new Float32Array(nodeCount),
      nodePersp: new Float32Array(nodeCount),
      nodeExcited: new Float32Array(nodeCount),
      nodePulseGlow: new Float32Array(nodeCount),
      nodeCascadeAt: new Float32Array(nodeCount),
      sortedNodes: Array.from({ length: nodeCount }, (_, i) => i),
      edgeCX: new Float32Array(edgeCount),
      edgeCY: new Float32Array(edgeCount),
      edgeZ: new Float32Array(edgeCount),
      ribbonZ: new Float32Array(ribbonCount),
      sortedRibbons: Array.from({ length: ribbonCount }, (_, i) => i),
      ribbonProjX: Array.from(
        { length: ribbonCount },
        (_, i) => new Float32Array(BRAIN_TOPOLOGY.corticalRibbons[i].points.length)
      ),
      ribbonProjY: Array.from(
        { length: ribbonCount },
        (_, i) => new Float32Array(BRAIN_TOPOLOGY.corticalRibbons[i].points.length)
      ),
      // Fixed-size synaptic comet pool
      pulses: Array.from({ length: MAX_PULSES }, () => ({
        active: false,
        edgeIndex: 0,
        forward: true,
        t: 0,
        speed: 0.9,
        colorIndex: 0,
        intensity: 1,
        cascadeDepth: 0,
      })),
      pulseCursor: 0,
      spawnAccumulator: 0,
      // Pointer gesture tracking
      pointerDown: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      lastX: 0,
      gestureAxis: null, // null | 'x' | 'y'
    };
  }

  // Sync external scroll/stage props into simulation state
  useEffect(() => {
    const sim = simRef.current;
    sim.progress = progress;
    sim.activeRegionIndex = activeRegionIndex;
    sim.needsStaticDraw = true;
  }, [progress, activeRegionIndex]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return undefined;

    const sim = simRef.current;
    const { nodes, edges, adjacency, corticalRibbons, regionCentroids } = BRAIN_TOPOLOGY;

    const spawnPulse = (edgeIndex, forward, intensity = 1.0, cascadeDepth = 0, speedBoost = 1.0) => {
      const edge = edges[edgeIndex];
      if (!edge) return;
      const slot = sim.pulses[sim.pulseCursor];
      sim.pulseCursor = (sim.pulseCursor + 1) % MAX_PULSES;

      slot.active = true;
      slot.edgeIndex = edgeIndex;
      slot.forward = forward;
      slot.t = 0;
      slot.speed = (0.68 + ((edgeIndex * 17) % 11) * 0.048) * speedBoost;
      slot.colorIndex = edge.colorIndex;
      slot.intensity = intensity;
      slot.cascadeDepth = cascadeDepth;
    };

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (sim.width !== width || sim.height !== height || sim.dpr !== dpr) {
        sim.width = width;
        sim.height = height;
        sim.dpr = dpr;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        sim.needsStaticDraw = true;
      }
    };

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    sim.reducedMotion = motionQuery.matches;
    const handleMotionChange = (e) => {
      sim.reducedMotion = e.matches;
      sim.needsStaticDraw = true;
    };
    motionQuery.addEventListener('change', handleMotionChange);

    // Seed initial gentle synaptic comets so first frame feels alive
    if (!sim.reducedMotion) {
      for (let i = 0; i < 18; i += 1) {
        const eIdx = (i * 19) % edges.length;
        spawnPulse(eIdx, i % 2 === 0, 0.85, 0, 0.95);
        sim.pulses[(sim.pulseCursor + MAX_PULSES - 1) % MAX_PULSES].t = (i / 18) * 0.85;
      }
    }

    let rafId = 0;
    let lastTime = performance.now();
    let isPageHidden = document.hidden;

    const renderFrame = (now) => {
      const rawDt = (now - lastTime) * 0.001;
      lastTime = now;
      const dt = clamp(rawDt, 0.001, 0.034);

      if (sim.width <= 1 || sim.height <= 1) {
        if (!isPageHidden) rafId = window.requestAnimationFrame(renderFrame);
        return;
      }

      const activeReg = sim.activeRegionIndex;
      const isFocusedRegion = activeReg >= 0 && activeReg < 4;

      // 1. Target 3D Camera Orientation & Zoom
      const breathYaw = sim.reducedMotion ? 0 : Math.sin(now * 0.0008) * 0.065;
      const breathPitch = sim.reducedMotion ? 0 : Math.cos(now * 0.00062) * 0.028;

      let baseYaw;
      let basePitch;
      let targetZoom;

      if (isFocusedRegion) {
        const targetRegion = NEURAL_REGIONS[activeReg];
        baseYaw = targetRegion.cameraYaw;
        basePitch = targetRegion.cameraPitch;
        targetZoom = 1.07;
      } else {
        // Iconic 3/4 cerebral perspective for Intro (-1) & Full Synthesis (-2)
        baseYaw = -0.38 + sim.progress * 0.4;
        basePitch = activeReg === -2 ? 0.21 : 0.18;
        targetZoom = activeReg === -2 ? 1.03 : 1.0;
      }

      if (!sim.pointerDown) {
        sim.targetDragYaw = lerp(sim.targetDragYaw, 0, 1 - Math.exp(-dt * 5.2));
      }
      sim.dragYawOffset = lerp(sim.dragYawOffset, sim.targetDragYaw, 1 - Math.exp(-dt * 11.0));
      sim.hoverYaw = lerp(sim.hoverYaw, sim.targetHoverYaw, 1 - Math.exp(-dt * 6.5));
      sim.hoverPitch = lerp(sim.hoverPitch, sim.targetHoverPitch, 1 - Math.exp(-dt * 6.5));

      const desiredYaw = baseYaw + breathYaw + sim.dragYawOffset + sim.hoverYaw;
      const desiredPitch = clamp(basePitch + breathPitch + sim.hoverPitch, -0.52, 0.58);

      const camSmooth = sim.reducedMotion ? 1 : 1 - Math.exp(-dt * 4.4);
      sim.yaw = lerp(sim.yaw, desiredYaw, camSmooth);
      sim.pitch = lerp(sim.pitch, desiredPitch, camSmooth);
      sim.zoom = lerp(sim.zoom, targetZoom, camSmooth);

      // 2. Smooth Per-Region Bioluminescence Focus
      const lumSmooth = sim.reducedMotion ? 1 : 1 - Math.exp(-dt * 5.2);
      for (let r = 0; r < 5; r += 1) {
        let targetLum = 1.0;
        if (isFocusedRegion) {
          if (r === activeReg) {
            targetLum = 1.0;
          } else if (r === BRIDGE_COLOR_INDEX) {
            targetLum = 0.44;
          } else {
            targetLum = 0.16;
          }
        }
        sim.regionBrightness[r] = lerp(sim.regionBrightness[r], targetLum, lumSmooth);
      }

      // Decay pointer excitation & soma arrival flashes
      let hasActiveExcitation = false;
      for (let i = 0; i < nodes.length; i += 1) {
        if (sim.nodeExcited[i] > 0.004) {
          sim.nodeExcited[i] *= Math.exp(-dt * 2.4);
          hasActiveExcitation = true;
        } else {
          sim.nodeExcited[i] = 0;
        }
        if (sim.nodePulseGlow[i] > 0.004) {
          sim.nodePulseGlow[i] *= Math.exp(-dt * 4.8);
          hasActiveExcitation = true;
        } else {
          sim.nodePulseGlow[i] = 0;
        }
      }

      if (sim.reducedMotion && !sim.needsStaticDraw && !hasActiveExcitation && Math.abs(sim.dragYawOffset) < 0.002) {
        if (!isPageHidden) rafId = window.requestAnimationFrame(renderFrame);
        return;
      }
      sim.needsStaticDraw = false;

      // 3. Autonomous Synaptic Impulse Spawner
      if (!sim.reducedMotion) {
        const spawnRate = isFocusedRegion ? 24 : activeReg === -2 ? 26 : 17;
        sim.spawnAccumulator += dt * spawnRate;
        while (sim.spawnAccumulator >= 1) {
          sim.spawnAccumulator -= 1;
          let pickedEdge = -1;
          // Prefer active region axons when focused, with occasional background heartbeats
          const wantFocused = isFocusedRegion && ((now * 13) % 10) < 8.4;
          for (let attempt = 0; attempt < 10; attempt += 1) {
            const candidate = Math.floor(
              ((now * 0.073 + attempt * 37.7 + sim.pulseCursor * 13.1) % 1) * edges.length
            );
            const idx = clamp(candidate, 0, edges.length - 1);
            const e = edges[idx];
            if (!wantFocused || e.region === activeReg || e.secondaryRegion === activeReg) {
              pickedEdge = idx;
              break;
            }
          }
          if (pickedEdge === -1) {
            pickedEdge = sim.pulseCursor % edges.length;
          }
          const forward = ((pickedEdge + sim.pulseCursor) & 1) === 0;
          const speedBoost = isFocusedRegion ? 1.16 : activeReg === -2 ? 1.12 : 1.0;
          spawnPulse(pickedEdge, forward, 0.92, 0, speedBoost);
        }
      }

      // Advance active pulses along curved axons
      for (let p = 0; p < MAX_PULSES; p += 1) {
        const pulse = sim.pulses[p];
        if (!pulse.active) continue;
        pulse.t += dt * pulse.speed;
        if (pulse.t >= 1) {
          pulse.active = false;
          const edge = edges[pulse.edgeIndex];
          const destNode = pulse.forward ? edge.b : edge.a;
          sim.nodePulseGlow[destNode] = Math.min(1.0, sim.nodePulseGlow[destNode] + 0.68 * pulse.intensity);

          // Cascade propagation from pointer/touch excitation
          if (pulse.cascadeDepth > 0 && now - sim.nodeCascadeAt[destNode] > 90) {
            sim.nodeCascadeAt[destNode] = now;
            const connected = adjacency[destNode];
            const branchLimit = Math.min(2, connected.length);
            for (let b = 0; b < branchLimit; b += 1) {
              const nextEdgeIdx = connected[(destNode + b) % connected.length];
              if (nextEdgeIdx === pulse.edgeIndex) continue;
              const nextEdge = edges[nextEdgeIdx];
              const nextForward = nextEdge.a === destNode;
              spawnPulse(
                nextEdgeIdx,
                nextForward,
                pulse.intensity * 0.78,
                pulse.cascadeDepth - 1,
                1.25
              );
            }
          }
        }
      }

      // 4. 3D -> 2D Perspective Projection
      const w = sim.width;
      const h = sim.height;
      const dpr = sim.dpr;
      const cx = w * 0.5;
      const cy = h * 0.49;
      const baseScale = Math.min(w * 0.405, h * 0.415) * sim.zoom;

      const cosYaw = Math.cos(sim.yaw);
      const sinYaw = Math.sin(sim.yaw);
      const cosPitch = Math.cos(sim.pitch);
      const sinPitch = Math.sin(sim.pitch);

      for (let i = 0; i < nodes.length; i += 1) {
        const n = nodes[i];
        const proj = project3DPoint(
          n.x,
          n.y,
          n.z,
          cosYaw,
          sinYaw,
          cosPitch,
          sinPitch,
          baseScale,
          cx,
          cy
        );
        sim.nodeSX[i] = proj.sx;
        sim.nodeSY[i] = proj.sy;
        sim.nodeZ[i] = proj.zCam;
        sim.nodePersp[i] = proj.persp;
      }

      for (let e = 0; e < edges.length; e += 1) {
        const edge = edges[e];
        const midProj = project3DPoint(
          edge.mx,
          edge.my,
          edge.mz,
          cosYaw,
          sinYaw,
          cosPitch,
          sinPitch,
          baseScale,
          cx,
          cy
        );
        const x1 = sim.nodeSX[edge.a];
        const y1 = sim.nodeSY[edge.a];
        const x2 = sim.nodeSX[edge.b];
        const y2 = sim.nodeSY[edge.b];

        // Convert 3D arch midpoint into smooth quadratic Bézier control point
        sim.edgeCX[e] = 1.65 * midProj.sx - 0.325 * (x1 + x2);
        sim.edgeCY[e] = 1.65 * midProj.sy - 0.325 * (y1 + y2);
        sim.edgeZ[e] = (sim.nodeZ[edge.a] + sim.nodeZ[edge.b]) * 0.5;
      }

      for (let r = 0; r < corticalRibbons.length; r += 1) {
        const pts = corticalRibbons[r].points;
        const pxArr = sim.ribbonProjX[r];
        const pyArr = sim.ribbonProjY[r];
        let zSum = 0;
        for (let k = 0; k < pts.length; k += 1) {
          const p3 = pts[k];
          const pr = project3DPoint(
            p3[0],
            p3[1],
            p3[2],
            cosYaw,
            sinYaw,
            cosPitch,
            sinPitch,
            baseScale,
            cx,
            cy
          );
          pxArr[k] = pr.sx;
          pyArr[k] = pr.sy;
          zSum += pr.zCam;
        }
        sim.ribbonZ[r] = zSum / pts.length;
      }

      sim.sortedRibbons.sort((a, b) => sim.ribbonZ[a] - sim.ribbonZ[b]);
      sim.sortedNodes.sort((a, b) => sim.nodeZ[a] - sim.nodeZ[b]);

      // ============================================================
      // 5. HARDWARE-ACCELERATED CANVAS RENDERING
      // ============================================================
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Layer A: Volumetric Radial Bioluminescent Aura
      if (isFocusedRegion) {
        const [rcx, rcy, rcz] = regionCentroids[activeReg];
        const lobeProj = project3DPoint(
          rcx,
          rcy,
          rcz,
          cosYaw,
          sinYaw,
          cosPitch,
          sinPitch,
          baseScale,
          cx,
          cy
        );
        const [rr, rg, rb] = REGION_RGB[activeReg];
        const glowRadius = baseScale * 1.18;
        const grad = ctx.createRadialGradient(
          lobeProj.sx,
          lobeProj.sy,
          0,
          lobeProj.sx,
          lobeProj.sy,
          glowRadius
        );
        grad.addColorStop(0, `rgba(${rr}, ${rg}, ${rb}, 0.20)`);
        grad.addColorStop(0.45, `rgba(${rr}, ${rg}, ${rb}, 0.075)`);
        grad.addColorStop(1, `rgba(${rr}, ${rg}, ${rb}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else {
        const coreRadius = baseScale * 1.32;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
        if (activeReg === -2) {
          grad.addColorStop(0, 'rgba(255, 202, 71, 0.12)');
          grad.addColorStop(0.38, 'rgba(34, 211, 238, 0.08)');
          grad.addColorStop(0.72, 'rgba(168, 100, 253, 0.04)');
          grad.addColorStop(1, 'rgba(6, 8, 13, 0)');
        } else {
          grad.addColorStop(0, 'rgba(34, 211, 238, 0.11)');
          grad.addColorStop(0.48, 'rgba(168, 100, 253, 0.065)');
          grad.addColorStop(1, 'rgba(6, 8, 13, 0)');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Layer B: Organic Cortical Ribbons (Gyral Contour Splines)
      for (let idx = 0; idx < sim.sortedRibbons.length; idx += 1) {
        const rIdx = sim.sortedRibbons[idx];
        const ribbon = corticalRibbons[rIdx];
        const regLum = sim.regionBrightness[ribbon.colorIndex];
        const depthNorm = clamp((sim.ribbonZ[rIdx] + 0.95) / 1.9, 0, 1);
        const alpha = (0.065 + 0.24 * depthNorm) * regLum;
        if (alpha < 0.012) continue;

        const [cr, cg, cb] = REGION_RGB[ribbon.colorIndex];
        const pxArr = sim.ribbonProjX[rIdx];
        const pyArr = sim.ribbonProjY[rIdx];
        const len = pxArr.length;

        ctx.beginPath();
        ctx.moveTo(pxArr[0], pyArr[0]);
        for (let k = 1; k < len - 1; k += 1) {
          const midX = (pxArr[k] + pxArr[k + 1]) * 0.5;
          const midY = (pyArr[k] + pyArr[k + 1]) * 0.5;
          ctx.quadraticCurveTo(pxArr[k], pyArr[k], midX, midY);
        }
        ctx.lineTo(pxArr[len - 1], pyArr[len - 1]);

        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = (0.75 + 0.65 * depthNorm) * (0.75 + 0.35 * regLum);
        ctx.stroke();
      }

      // Layer C: Curved Synaptic Axons (Strictly Quadratic Bézier Filaments)
      for (let e = 0; e < edges.length; e += 1) {
        const edge = edges[e];
        const lumA = sim.regionBrightness[nodes[edge.a].colorIndex];
        const lumB = sim.regionBrightness[nodes[edge.b].colorIndex];
        const regLum = Math.max(lumA, lumB) * 0.65 + Math.min(lumA, lumB) * 0.35;

        const exciteBoost = Math.max(
          sim.nodeExcited[edge.a],
          sim.nodeExcited[edge.b],
          sim.nodePulseGlow[edge.a] * 0.55,
          sim.nodePulseGlow[edge.b] * 0.55
        );

        const depthNorm = clamp((sim.edgeZ[e] + 0.95) / 1.9, 0, 1);
        const baseAlpha = edge.isCommissural ? 0.24 : 0.17;
        const alpha = clamp(
          baseAlpha * (0.34 + 0.66 * depthNorm) * regLum + exciteBoost * 0.42,
          0,
          0.85
        );
        if (alpha < 0.014) continue;

        const [cr, cg, cb] = REGION_RGB[edge.colorIndex];
        ctx.beginPath();
        ctx.moveTo(sim.nodeSX[edge.a], sim.nodeSY[edge.a]);
        ctx.quadraticCurveTo(
          sim.edgeCX[e],
          sim.edgeCY[e],
          sim.nodeSX[edge.b],
          sim.nodeSY[edge.b]
        );
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 0.65 + 0.55 * depthNorm + exciteBoost * 0.9;
        ctx.stroke();
      }

      // Layer D: Additive Bioluminescent Synaptic Comets (60/120fps Impulse Trains)
      ctx.globalCompositeOperation = 'lighter';

      for (let p = 0; p < MAX_PULSES; p += 1) {
        const pulse = sim.pulses[p];
        if (!pulse.active) continue;

        const eIdx = pulse.edgeIndex;
        const edge = edges[eIdx];
        const regLum = Math.max(
          sim.regionBrightness[edge.colorIndex],
          pulse.cascadeDepth > 0 ? 0.95 : 0
        );
        if (regLum < 0.22) continue;

        const x1 = pulse.forward ? sim.nodeSX[edge.a] : sim.nodeSX[edge.b];
        const y1 = pulse.forward ? sim.nodeSY[edge.a] : sim.nodeSY[edge.b];
        const x2 = pulse.forward ? sim.nodeSX[edge.b] : sim.nodeSX[edge.a];
        const y2 = pulse.forward ? sim.nodeSY[edge.b] : sim.nodeSY[edge.a];
        const ecx = sim.edgeCX[eIdx];
        const ecy = sim.edgeCY[eIdx];

        const tHead = pulse.t;
        const tMid = Math.max(0, tHead - 0.075);
        const tTail = Math.max(0, tHead - 0.16);

        const [hx, hy] = evalQuadPoint(x1, y1, ecx, ecy, x2, y2, tHead);
        const [mx, my] = evalQuadPoint(x1, y1, ecx, ecy, x2, y2, tMid);
        const [tx, ty] = evalQuadPoint(x1, y1, ecx, ecy, x2, y2, tTail);

        const envFade = Math.sin(Math.PI * clamp(tHead, 0.02, 0.98));
        const cometAlpha = clamp(envFade * regLum * pulse.intensity * 0.92, 0, 1);
        if (cometAlpha < 0.04) continue;

        const [cr, cg, cb] = REGION_RGB[pulse.colorIndex];

        // Outer neon comet tail
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.quadraticCurveTo(mx, my, hx, hy);
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${(cometAlpha * 0.72).toFixed(3)})`;
        ctx.lineWidth = 2.1;
        ctx.stroke();

        // Incandescent white-tinted spark head
        ctx.beginPath();
        ctx.arc(hx, hy, 2.15, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 250, 252, ${(cometAlpha * 0.92).toFixed(3)})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(hx, hy, 4.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${(cometAlpha * 0.32).toFixed(3)})`;
        ctx.fill();
      }

      // Layer E: Depth-Sorted Neural Somas (192 Bioluminescent Nodes)
      for (let idx = 0; idx < sim.sortedNodes.length; idx += 1) {
        const i = sim.sortedNodes[idx];
        const node = nodes[i];
        const sx = sim.nodeSX[i];
        const sy = sim.nodeSY[i];
        const zCam = sim.nodeZ[i];
        const persp = sim.nodePersp[i];

        const excited = sim.nodeExcited[i];
        const pulseGlow = sim.nodePulseGlow[i];
        const energy = clamp(excited + pulseGlow * 0.85, 0, 1.35);

        const regLum = Math.max(sim.regionBrightness[node.colorIndex], energy * 0.9);
        const depthNorm = clamp((zCam + 0.95) / 1.9, 0, 1);
        const breath = sim.reducedMotion
          ? 1
          : 0.9 + 0.1 * Math.sin(now * 0.0024 + node.phase);

        const radius =
          node.baseRadius * persp * breath * (0.85 + 0.25 * regLum + energy * 0.42);
        const somaAlpha = clamp(
          (0.28 + 0.72 * depthNorm) * regLum + energy * 0.45,
          0.05,
          1
        );

        const [cr, cg, cb] = REGION_RGB[node.colorIndex];

        // Soft concentric bioluminescent halo (zero expensive SVG/canvas blur filters)
        if (regLum > 0.32 || energy > 0.08) {
          const haloRadius = radius * (2.6 + energy * 1.9);
          const haloAlpha = clamp(
            (0.08 + energy * 0.22) * regLum * (0.45 + 0.55 * depthNorm),
            0,
            0.42
          );
          if (haloAlpha > 0.015) {
            ctx.beginPath();
            ctx.arc(sx, sy, haloRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${haloAlpha.toFixed(3)})`;
            ctx.fill();
          }
        }

        // Primary pigmented soma body
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${somaAlpha.toFixed(3)})`;
        ctx.fill();

        // Incandescent white-hot nucleus on foreground, active, or excited neurons
        if ((depthNorm > 0.46 && regLum > 0.45) || energy > 0.14) {
          const coreAlpha = clamp((0.35 + energy * 0.65) * regLum, 0, 0.96);
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(0.75, radius * 0.48), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(243, 246, 252, ${coreAlpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = 'source-over';

      if (!isPageHidden) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    const handleVisibilityChange = () => {
      isPageHidden = document.hidden;
      if (isPageHidden) {
        window.cancelAnimationFrame(rafId);
      } else {
        lastTime = performance.now();
        sim.needsStaticDraw = true;
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    rafId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      motionQuery.removeEventListener('change', handleMotionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  /* ============================================================
     POINTER & TOUCH EXCITATION + ELASTIC HORIZONTAL SPIN
     (Never blocks vertical mobile scroll thanks to touch-action: pan-y)
     ============================================================ */

  const exciteNearPointer = (clientX, clientY, radiusCss = 72, cascadeDepth = 1) => {
    const canvas = canvasRef.current;
    const sim = simRef.current;
    if (!canvas || !sim || sim.width <= 0) return;

    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const rSq = radiusCss * radiusCss;
    const now = performance.now();

    const { nodes, edges, adjacency } = BRAIN_TOPOLOGY;

    for (let i = 0; i < nodes.length; i += 1) {
      // Prioritize front-facing & mid-depth neurons near pointer
      if (sim.nodeZ[i] < -0.55) continue;
      const dx = sim.nodeSX[i] - px;
      const dy = sim.nodeSY[i] - py;
      const dSq = dx * dx + dy * dy;
      if (dSq > rSq) continue;

      const proximity = 1 - Math.sqrt(dSq) / radiusCss;
      const strength = clamp(0.45 + proximity * 0.75, 0, 1);
      if (strength > sim.nodeExcited[i]) {
        sim.nodeExcited[i] = strength;
      }

      if (now - sim.nodeCascadeAt[i] > 140 && proximity > 0.28) {
        sim.nodeCascadeAt[i] = now;
        const connected = adjacency[i];
        const count = Math.min(2, connected.length);
        for (let k = 0; k < count; k += 1) {
          const edgeIdx = connected[(i + k) % connected.length];
          const edge = edges[edgeIdx];
          const slot = sim.pulses[sim.pulseCursor];
          sim.pulseCursor = (sim.pulseCursor + 1) % MAX_PULSES;

          slot.active = true;
          slot.edgeIndex = edgeIdx;
          slot.forward = edge.a === i;
          slot.t = 0;
          slot.speed = 1.18 + proximity * 0.35;
          slot.colorIndex = edge.colorIndex;
          slot.intensity = 1.0;
          slot.cascadeDepth = sim.reducedMotion ? 0 : cascadeDepth;
        }
      }
    }
  };

  const handlePointerDown = (e) => {
    const sim = simRef.current;
    sim.pointerDown = true;
    sim.pointerId = e.pointerId;
    sim.startX = e.clientX;
    sim.startY = e.clientY;
    sim.lastX = e.clientX;
    sim.gestureAxis = null;

    exciteNearPointer(e.clientX, e.clientY, 84, 2);
  };

  const handlePointerMove = (e) => {
    const sim = simRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (sim.pointerDown && sim.pointerId === e.pointerId) {
      const totalDx = e.clientX - sim.startX;
      const totalDy = e.clientY - sim.startY;

      if (sim.gestureAxis === null && (Math.abs(totalDx) > 6 || Math.abs(totalDy) > 6)) {
        if (Math.abs(totalDx) > Math.abs(totalDy) * 1.15) {
          sim.gestureAxis = 'x';
          setIsDragging(true);
        } else {
          sim.gestureAxis = 'y';
        }
      }

      if (sim.gestureAxis === 'x') {
        const stepDx = e.clientX - sim.lastX;
        sim.targetDragYaw = clamp(sim.targetDragYaw + stepDx * 0.0052, -0.58, 0.58);
      }

      sim.lastX = e.clientX;
      exciteNearPointer(e.clientX, e.clientY, 76, 1);
      return;
    }

    // Desktop hover micro-parallax + gentle cursor synaptic trail
    if (e.pointerType === 'mouse') {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        sim.targetHoverYaw = clamp(nx * 0.055, -0.06, 0.06);
        sim.targetHoverPitch = clamp(-ny * 0.04, -0.045, 0.045);
      }
      exciteNearPointer(e.clientX, e.clientY, 64, 1);
    }
  };

  const releasePointer = () => {
    const sim = simRef.current;
    sim.pointerDown = false;
    sim.pointerId = null;
    sim.gestureAxis = null;
    sim.targetHoverYaw = 0;
    sim.targetHoverPitch = 0;
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="neural-brain"
      role="img"
      aria-label={statusLabel || 'Interactive 3D synaptic brain'}
    >
      <canvas
        ref={canvasRef}
        className={`neural-brain__canvas${isDragging ? ' neural-brain__canvas--dragging' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={releasePointer}
        onPointerCancel={releasePointer}
        onPointerLeave={releasePointer}
      />
    </div>
  );
});
