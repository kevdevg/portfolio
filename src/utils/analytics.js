/**
 * GA4 Custom Event Tracking
 * Sends events to Google Analytics via gtag()
 */

function sendEvent(eventName, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

// ── Section Views ──
// Fired when a section scrolls into view
export function trackSectionView(sectionName) {
  sendEvent('section_view', {
    section_name: sectionName,
  });
}

// ── Neuron / Skill Clicks ──
export function trackNeuronClick(skillId) {
  sendEvent('neuron_click', {
    skill_id: skillId,
  });
}

// ── Tech Stack Interactions ──
export function trackTechFilter(filterName) {
  sendEvent('tech_filter', {
    filter_name: filterName,
  });
}

export function trackTechHover(techName, category) {
  sendEvent('tech_hover', {
    tech_name: techName,
    tech_category: category,
  });
}

// ── Project Interactions ──
export function trackProjectFilter(filterName) {
  sendEvent('project_filter', {
    filter_name: filterName,
  });
}

// ── Outbound Links ──
export function trackOutboundClick(url, label) {
  sendEvent('outbound_click', {
    link_url: url,
    link_label: label,
  });
}

// ── Contact Form ──
export function trackContactSubmit() {
  sendEvent('contact_submit');
}

// ── Scroll Depth ──
// Call once on page load to track max scroll milestones
export function initScrollDepthTracking() {
  const milestones = [25, 50, 75, 100];
  const reached = new Set();

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const percent = Math.round((scrollTop / docHeight) * 100);

    for (const m of milestones) {
      if (percent >= m && !reached.has(m)) {
        reached.add(m);
        sendEvent('scroll_depth', { depth_percent: m });
      }
    }
  }, { passive: true });
}
