function gtagEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

export function trackRegionFocus(regionId, source = 'scroll') {
  gtagEvent('neural_region_focus', { region_id: regionId, interaction_source: source });
}

export function trackLanguageSwitch(lang) {
  gtagEvent('language_switch', { language: lang });
}

export function trackOutboundClick(url, label) {
  gtagEvent('outbound_click', { destination_url: url, link_label: label });
}

export function trackEmailCopy() {
  gtagEvent('email_copy', { method: 'clipboard' });
}

export function initScrollDepthTracking() {
  if (typeof window === 'undefined') return () => {};
  const milestones = [25, 50, 75, 100];
  const reached = new Set();

  const onScroll = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const pct = Math.round((window.scrollY / docHeight) * 100);
    for (const m of milestones) {
      if (pct >= m && !reached.has(m)) {
        reached.add(m);
        gtagEvent('scroll_depth', { percent_scrolled: m });
      }
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}
