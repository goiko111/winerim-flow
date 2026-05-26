import { useEffect } from 'react';

interface HreflangEntry {
  hreflang: string;
  href: string;
}

interface SEOHeadProps {
  title: string;
  description: string;
  canonical: string;
  hreflangEntries?: HreflangEntry[];
  jsonLd?: object[];
}

const SEOHead = ({ title, description, canonical, hreflangEntries = [], jsonLd = [] }: SEOHeadProps) => {
  useEffect(() => {
    document.title = title;

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    let canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonical);

    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    hreflangEntries.forEach(({ hreflang, href }) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      link.setAttribute('href', href);
      document.head.appendChild(link);
    });

    document.querySelectorAll('script[data-seo-landing]').forEach(el => el.remove());
    jsonLd.forEach(schema => {
      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo-landing', 'true');
      script.textContent = JSON.stringify(schema, null, 0);
      document.head.appendChild(script);
    });

    return () => {
      document.title = 'Winerim – Carta Inteligente de Vinos para Restaurantes';
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
      document.querySelectorAll('script[data-seo-landing]').forEach(el => el.remove());
    };
  }, [title, description, canonical, hreflangEntries, jsonLd]);

  return null;
};

export default SEOHead;
