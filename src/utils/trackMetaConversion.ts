/**
 * Meta Pixel conversion tracking utility
 * Fires fbq Lead event on form submissions for retargeting
 * Pixel ID: 557504139395422 (CD Winerim.wine)
 */

declare global {
    interface Window {
          fbq?: (...args: unknown[]) => void;
          dataLayer?: unknown[];
    }
}

/**
 * Track a Meta Lead conversion event when a form is submitted.
 * Also pushes a GTM dataLayer event so the tag can fire from Tag Manager.
 */
export function trackMetaLead(formType?: string, contentCategory = 'lead'): void {
    try {
          if (typeof window !== 'undefined') {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                      event: 'winerim_lead',
                      content_name: formType || 'form',
                      content_category: contentCategory,
                });
          }

          if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
                  window.fbq('track', 'Lead', {
                            content_name: formType || 'form',
                            content_category: contentCategory,
                  });
                  console.log(`[Meta Pixel] Lead event fired for form: ${formType || 'unknown'}`);
          }
    } catch (error) {
          console.error('[Meta Pixel] Error firing Lead event:', error);
    }
}
