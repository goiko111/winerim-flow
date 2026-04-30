/**
 * Meta Pixel conversion tracking utility
 * Fires fbq Lead event on form submissions for retargeting
 * Pixel ID: 557504139395422 (CD Winerim.wine)
 */

declare global {
    interface Window {
          fbq?: (...args: unknown[]) => void;
    }
}

/**
 * Track a Meta Lead conversion event when a form is submitted.
 * Safe no-op if fbq is not loaded.
 */
export function trackMetaLead(formType?: string): void {
    try {
          if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
                  window.fbq('track', 'Lead', {
                            content_name: formType || 'form',
                            content_category: 'lead',
                  });
                  console.log(`[Meta Pixel] Lead event fired for form: ${formType || 'unknown'}`);
          }
    } catch (error) {
          console.error('[Meta Pixel] Error firing Lead event:', error);
    }
}
