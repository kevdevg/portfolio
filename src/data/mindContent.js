export const NEURAL_REGIONS = [
  {
    id: 'human-interfaces',
    index: '01',
    colorHex: '#22D3EE',
    colorHsl: 'hsl(190, 95%, 55%)',
    mutedRgba: 'rgba(34, 211, 238, 0.14)',
    glowRgba: 'rgba(34, 211, 238, 0.32)',
    // Target 3D camera orientation (radians) when this lobe is active
    cameraYaw: -0.48,
    cameraPitch: 0.16,
  },
  {
    id: 'core-engines',
    index: '02',
    colorHex: '#A864FD',
    colorHsl: 'hsl(265, 90%, 68%)',
    mutedRgba: 'rgba(168, 100, 253, 0.14)',
    glowRgba: 'rgba(168, 100, 253, 0.32)',
    cameraYaw: 0.36,
    cameraPitch: 0.08,
  },
  {
    id: 'autonomous-ai',
    index: '03',
    colorHex: '#F44E9E',
    colorHsl: 'hsl(330, 85%, 62%)',
    mutedRgba: 'rgba(244, 78, 158, 0.14)',
    glowRgba: 'rgba(244, 78, 158, 0.32)',
    cameraYaw: -0.28,
    cameraPitch: 0.28,
  },
  {
    id: 'sovereign-cloud',
    index: '04',
    colorHex: '#12E299',
    colorHsl: 'hsl(158, 85%, 48%)',
    mutedRgba: 'rgba(18, 226, 153, 0.14)',
    glowRgba: 'rgba(18, 226, 153, 0.32)',
    cameraYaw: 0.54,
    cameraPitch: -0.14,
  },
];

export const STAGE_WINDOWS = [
  { key: 'intro', start: 0.0, end: 0.16, regionIndex: -1 },
  { key: 'cap-0', start: 0.16, end: 0.34, regionIndex: 0 },
  { key: 'cap-1', start: 0.34, end: 0.52, regionIndex: 1 },
  { key: 'cap-2', start: 0.52, end: 0.7, regionIndex: 2 },
  { key: 'cap-3', start: 0.7, end: 0.86, regionIndex: 3 },
  { key: 'contact', start: 0.86, end: 1.0, regionIndex: -2 },
];

export const MIND_COPY = {
  en: {
    nav: {
      cta: "Let's Talk",
      langAria: 'Switch language',
    },
    intro: {
      eyebrow: 'SYSTEMS · AI · HUMAN COGNITION',
      headlineLead: 'I turn complex ideas into',
      headlineAccent: 'complete ecosystems.',
      body:
        'Combining systems engineering, artificial intelligence, and human psychology to design, build, and ship entire products from zero to production.',
      scrollHint: 'Scroll to explore how I build',
      brainLabel: 'NEURAL ARCHITECTURE · LIVE',
    },
    capabilities: [
      {
        index: '01',
        tag: 'FRONTAL CORTEX · INTERFACES & COGNITION',
        title: 'Experiences that feel effortless, online or offline.',
        body:
          'I design fast, intuitive interfaces grounded in how human attention works—running smoothly on web and mobile, even when the connection drops.',
      },
      {
        index: '02',
        tag: 'DEEP CORE · PLATFORMS, DATA & VALUE',
        title: 'The complete engine behind the product.',
        body:
          'From dynamic multi-tenant databases and custom developer SDKs to programmable payment rails where every transaction is exact, auditable, and reliable.',
      },
      {
        index: '03',
        tag: 'ASSOCIATIVE WEB · NATIVE AI & AGENTS',
        title: 'Software that understands, decides, and acts.',
        body:
          'I embed autonomous agents, language models, and real-time voice or vision directly into the architecture—multiplying what a lean team can build.',
      },
      {
        index: '04',
        tag: 'BASAL ROOT · CLOUD & DEEP SECURITY',
        title: 'Total control over where your technology lives.',
        body:
          'Self-hosted cloud automation, instant zero-downtime deployments, real-time networks, and OS-level security without black-box lock-in.',
      },
    ],
    contact: {
      eyebrow: 'FULL SYNTHESIS · DIRECT CONNECTION',
      title: "Have an ambitious idea or a hard problem? Let's talk.",
      body: 'Tell me what you want to bring into the world—from blank canvas to live production.',
      copyIdle: 'kevinguevaradevia@gmail.com',
      copySuccess: 'Email copied to clipboard ✓',
      openMail: 'Open Mail App ↗',
      cvPrompt: 'Need formal credentials?',
      cvAts: 'Resume PDF (1p)',
      cvExtended: 'Extended PDF (2p)',
      brainLabel: 'ALL REGIONS SYNCHRONIZED',
    },
    dock: {
      intro: 'Core',
      contact: 'Talk',
      touchHint: 'Touch or drag the brain',
    },
  },
  es: {
    nav: {
      cta: 'Hablemos',
      langAria: 'Cambiar idioma',
    },
    intro: {
      eyebrow: 'SISTEMAS · IA · COGNICIÓN HUMANA',
      headlineLead: 'Convierto ideas complejas en',
      headlineAccent: 'ecosistemas completos.',
      body:
        'Uno ingeniería de sistemas, inteligencia artificial y psicología humana para diseñar, construir y llevar productos enteros de cero a producción.',
      scrollHint: 'Desliza para recorrer qué construyo',
      brainLabel: 'ARQUITECTURA NEURAL · EN VIVO',
    },
    capabilities: [
      {
        index: '01',
        tag: 'CORTEZA FRONTAL · INTERFACES Y MENTE HUMANA',
        title: 'Experiencias que fluyen natural, con o sin internet.',
        body:
          'Diseño interfaces rápidas e intuitivas basadas en cómo funciona la atención humana, capaces de operar al instante en web y móvil incluso sin conexión.',
      },
      {
        index: '02',
        tag: 'NÚCLEO PROFUNDO · PLATAFORMAS, DATOS Y PAGOS',
        title: 'El motor completo detrás del producto.',
        body:
          'Desde plataformas multi-usuario, bases de datos dinámicas y SDKs propios, hasta flujos de pagos programables donde cada transacción es exacta y segura.',
      },
      {
        index: '03',
        tag: 'RED ASOCIATIVA · IA NATIVA Y AGENTES',
        title: 'Software que entiende, decide y actúa.',
        body:
          'Integro agentes autónomos, modelos de lenguaje y voz o visión en tiempo real dentro de la arquitectura, multiplicando lo que se puede lograr.',
      },
      {
        index: '04',
        tag: 'RAÍZ BASAL · NUBE PROPIA Y SEGURIDAD',
        title: 'Control total sobre dónde y cómo vive tu tecnología.',
        body:
          'Automatización en nube propia, despliegues instantáneos sin caídas, redes en tiempo real y seguridad profunda a nivel de sistema operativo.',
      },
    ],
    contact: {
      eyebrow: 'SÍNTESIS TOTAL · CONEXIÓN DIRECTA',
      title: '¿Tienes una idea ambiciosa o un reto complejo? Hablemos.',
      body: 'Cuéntame qué quieres construir—desde una idea en blanco hasta producción real.',
      copyIdle: 'kevinguevaradevia@gmail.com',
      copySuccess: 'Correo copiado al portapapeles ✓',
      openMail: 'Abrir Correo ↗',
      cvPrompt: '¿Buscas el formato tradicional?',
      cvAts: 'CV PDF (1 pág)',
      cvExtended: 'CV Extendido (2 págs)',
      brainLabel: 'SISTEMA EN SÍNTESIS COMPLETA',
    },
    dock: {
      intro: 'Mente',
      contact: 'Hablar',
      touchHint: 'Toca o gira el cerebro',
    },
  },
};

export const CONTACT_LINKS = {
  email: 'kevinguevaradevia@gmail.com',
  mailtoHref:
    'mailto:kevinguevaradevia@gmail.com?subject=Let%27s%20Build%20Something%20%E2%80%94%20Kevin%20Guevara',
  github: 'https://github.com/kevdevg',
  linkedin: 'https://linkedin.com/in/kev-guevara',
  cvAtsFile: 'Kevin_Guevara_CV.pdf',
  cvExtendedFile: 'Kevin_Guevara_CV_Extended.pdf',
};
