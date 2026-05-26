/**
 * Build-time prerender script.
 *
 * Runs after `vite build` as the `postbuild` npm script.
 * For each SEO-critical route it:
 *   1. Copies dist/index.html to dist/{route}/index.html
 *   2. Injects route-specific <title>, <meta name="description">, <link rel="canonical">,
 *      hreflang <link rel="alternate"> tags, and JSON-LD <script> blocks into <head>
 *      BEFORE the React bundle — so crawlers, bot validators, social previews, and LLM
 *      systems see the correct metadata in the initial HTML response.
 *
 * Compatible with Lovable's static hosting (served path-specific index.html when present)
 * and any CDN/static host that honours directory-level index.html (Vercel, Netlify, etc.).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const BASE = 'https://winerim.wine';

// ---------------------------------------------------------------------------
// Route definitions — keep in sync with SEOHead props in each Landing*.tsx
// ---------------------------------------------------------------------------
const ROUTES = [
  // ES-1
  {
    urlPath: '/es/carta-de-vinos-digital-para-restaurante',
    title: 'Carta de Vinos Digital para Restaurante | Winerim',
    description:
      '1.000+ restaurantes confían en Winerim — +23% ticket medio en vino. Digitaliza tu carta, gestiona tu bodega y conecta con tu POS actual. Carta inteligente líder en Europa. Solicita tu demo.',
    canonical: `${BASE}/es/carta-de-vinos-digital-para-restaurante`,
    hreflang: [
      { hreflang: 'es', href: `${BASE}/es/carta-de-vinos-digital-para-restaurante` },
      { hreflang: 'x-default', href: `${BASE}/es/carta-de-vinos-digital-para-restaurante` },
    ],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Winerim — Carta de Vinos Digital para Restaurante',
        description:
          '1.000+ restaurantes confían en Winerim. Digitaliza tu carta de vinos, gestiona tu bodega y conecta con tu POS actual. +23% ticket medio en vino.',
        url: `${BASE}/es/carta-de-vinos-digital-para-restaurante`,
        brand: { '@type': 'Brand', name: 'Winerim' },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '180' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: '¿Cuánto tiempo tarda la instalación?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'La configuración básica tarda entre 4 y 8 horas con nuestro equipo de onboarding. Tu carta digital queda operativa ese mismo día.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Necesito instalar hardware adicional?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Winerim funciona en la nube. Los clientes acceden escaneando un QR — sin app, sin registro.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Se integra con mi POS actual?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sí. Winerim se integra con los principales POS del mercado (Tevalis, Lightspeed, Revel, Oracle MICROS, entre otros).',
            },
          },
          {
            '@type': 'Question',
            name: '¿Qué pasa si se corta la conexión durante el servicio?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'La carta digital tiene modo offline. Funciona aunque se corte el WiFi y sincroniza cuando se recupera la conexión.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Winerim cobra comisión por venta de vino?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Winerim cobra una cuota fija mensual. Sin comisión por venta, sin coste por referencia añadida, sin exclusividad de bodega.',
            },
          },
        ],
      },
    ],
  },

  // ES-2
  {
    urlPath: '/es/software-gestion-bodega-restaurante',
    title: 'Software Gestión Bodega Restaurante | Winerim',
    description:
      'Reduce el stock muerto un 40% y recupera 10h/semana en gestión de bodega. Winerim conecta tu inventario de vinos con tu carta digital. 1.000+ restaurantes activos. Demo gratuita.',
    canonical: `${BASE}/es/software-gestion-bodega-restaurante`,
    hreflang: [
      { hreflang: 'es', href: `${BASE}/es/software-gestion-bodega-restaurante` },
      { hreflang: 'x-default', href: `${BASE}/es/software-gestion-bodega-restaurante` },
    ],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Winerim — Software Gestión Bodega Restaurante',
        description:
          'Reduce el stock muerto un 40% y recupera 10h/semana en gestión de bodega. Software de gestión de bodega diseñado para restaurantes. 1.000+ activos.',
        url: `${BASE}/es/software-gestion-bodega-restaurante`,
        brand: { '@type': 'Brand', name: 'Winerim' },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '180' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: '¿Cuánto tiempo lleva la integración inicial?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'La configuración básica tarda entre 4 y 8 horas. Volcamos tu carta y tu inventario actual, y el sistema queda operativo ese mismo día.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Necesito instalar hardware adicional?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Winerim funciona en la nube. Accedes desde cualquier dispositivo con navegador: ordenador, tablet o móvil.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Se integra con mi POS actual?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Nos integramos con los principales sistemas del mercado. Si tu POS no está en la lista, nuestro equipo evalúa la integración sin coste adicional.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Qué pasa si se va la conexión a internet durante el servicio?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'La carta digital tiene modo offline. El inventario se sincroniza en cuanto se recupera la conexión.',
            },
          },
          {
            '@type': 'Question',
            name: '¿Tiene soporte en español?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sí. Todo el soporte está disponible en español, con tiempos de respuesta inferiores a 2 horas en horario de oficina.',
            },
          },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'Cómo gestionar la bodega de tu restaurante con Winerim',
        step: [
          { '@type': 'HowToStep', name: 'Onboarding y configuración', text: 'Volcamos tu carta e inventario actual. Operativo en 4-8 horas.' },
          { '@type': 'HowToStep', name: 'Activación y sincronización con POS', text: 'Winerim se conecta a tu POS. Cada venta actualiza el inventario automáticamente.' },
          { '@type': 'HowToStep', name: 'Control y análisis', text: 'Dashboard de ventas, alertas de stock mínimo y propuestas de pedido automáticas.' },
        ],
      },
    ],
  },

  // EN-US-1
  {
    urlPath: '/en-us/wine-menu-management-software-restaurant',
    title: 'Wine Menu Management Software for Restaurants | Winerim',
    description:
      "1,000+ restaurants trust Winerim — Europe's #1 intelligent wine list software. Digitize your wine menu, increase check averages 15-30%, and manage your cellar inventory in real time. Book a free demo.",
    canonical: `${BASE}/en-us/wine-menu-management-software-restaurant`,
    hreflang: [
      { hreflang: 'en-us', href: `${BASE}/en-us/wine-menu-management-software-restaurant` },
      { hreflang: 'es', href: `${BASE}/es/carta-de-vinos-digital-para-restaurante` },
      { hreflang: 'x-default', href: `${BASE}/en-us/wine-menu-management-software-restaurant` },
    ],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Winerim — Wine Menu Management Software for Restaurants',
        description:
          "1,000+ restaurants trust Winerim — Europe's #1 intelligent wine list software. Digitize your wine menu, increase check averages, and manage your cellar in real time.",
        url: `${BASE}/en-us/wine-menu-management-software-restaurant`,
        brand: { '@type': 'Brand', name: 'Winerim' },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', reviewCount: '180' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Does Winerim work with my current POS?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: "We integrate with Toast, Square for Restaurants, Lightspeed, Oracle MICROS, Revel, Aloha, and others. If yours isn't on the list, our team will evaluate a custom integration at no extra cost.",
            },
          },
          {
            '@type': 'Question',
            name: 'Do guests need to download an app?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: "No. Guests access the wine list by scanning a QR code — that's it. No app, no account, no friction.",
            },
          },
          {
            '@type': 'Question',
            name: 'What if my internet goes down during service?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The digital menu has an offline mode. Your cellar inventory syncs when the connection is restored.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is pricing in USD?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: "Yes — Winerim's US plans are quoted and billed in USD, with US-based billing and support.",
            },
          },
          {
            '@type': 'Question',
            name: 'How long is the contract?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Month-to-month plans available. Annual plans offer a discount. No lock-in required to get started.',
            },
          },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// HTML injection helpers
// ---------------------------------------------------------------------------

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildHeadTags(route) {
  const lines = [];

  // Title
  lines.push(`  <title>${escapeHtml(route.title)}</title>`);

  // Meta description
  lines.push(`  <meta name="description" content="${escapeHtml(route.description)}" />`);

  // Canonical
  lines.push(`  <link rel="canonical" href="${escapeHtml(route.canonical)}" />`);

  // OG tags
  lines.push(`  <meta property="og:title" content="${escapeHtml(route.title)}" />`);
  lines.push(`  <meta property="og:description" content="${escapeHtml(route.description)}" />`);
  lines.push(`  <meta property="og:url" content="${escapeHtml(route.canonical)}" />`);
  lines.push(`  <meta property="og:type" content="website" />`);

  // Twitter
  lines.push(`  <meta name="twitter:title" content="${escapeHtml(route.title)}" />`);
  lines.push(`  <meta name="twitter:description" content="${escapeHtml(route.description)}" />`);

  // Hreflang
  for (const entry of route.hreflang) {
    lines.push(`  <link rel="alternate" hreflang="${escapeHtml(entry.hreflang)}" href="${escapeHtml(entry.href)}" />`);
  }

  // JSON-LD schemas
  for (const schema of route.jsonLd) {
    lines.push(`  <script type="application/ld+json">${JSON.stringify(schema)}</script>`);
  }

  return lines.join('\n');
}

function injectIntoHtml(baseHtml, route) {
  const headTags = buildHeadTags(route);

  // Replace existing <title> tag
  let html = baseHtml.replace(/<title>[^<]*<\/title>/, '');

  // Remove existing meta description, canonical, og:*, twitter:* from base
  html = html.replace(/<meta\s+name="description"[^>]*>/gi, '');
  html = html.replace(/<link\s+rel="canonical"[^>]*>/gi, '');
  html = html.replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '');
  html = html.replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');

  // Inject all new head tags right after <head>
  html = html.replace(/(<head[^>]*>)/, `$1\n${headTags}`);

  return html;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const baseHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(baseHtmlPath)) {
  console.error('[prerender] dist/index.html not found — run `vite build` first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');
let successCount = 0;

for (const route of ROUTES) {
  const routeHtml = injectIntoHtml(baseHtml, route);
  const outDir = path.join(distDir, ...route.urlPath.split('/').filter(Boolean));
  const outFile = path.join(outDir, 'index.html');

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, routeHtml, 'utf-8');

  console.log(`[prerender] ✓ ${route.urlPath} → dist${route.urlPath}/index.html`);
  console.log(`            title: ${route.title}`);
  console.log(`            canonical: ${route.canonical}`);
  successCount++;
}

console.log(`\n[prerender] Done. ${successCount}/${ROUTES.length} routes pre-rendered.`);
console.log('[prerender] Each route now has a standalone index.html with correct');
console.log('[prerender] title, meta description, canonical, hreflang, OG tags,');
console.log('[prerender] and JSON-LD schema embedded before React JS loads.');
