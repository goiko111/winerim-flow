import { ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/SEOHead';
import winerimLogo from '@/assets/winerim-icon.png';

const BASE = 'https://winerim.wine';
const DEMO_URL = 'https://wa.me/34624402302';

const jsonLd = [
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
      url: DEMO_URL,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '180',
    },
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
          text: 'No. Winerim funciona en la nube. Los clientes acceden a la carta escaneando un QR — sin app, sin registro.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Se integra con mi POS actual?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí. Winerim se integra con los principales POS del mercado (Tevalis, Lightspeed, Revel, Oracle MICROS, entre otros). No sustituye tu sistema — lo complementa.',
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
];

const hreflangEntries = [
  { hreflang: 'es', href: `${BASE}/es/carta-de-vinos-digital-para-restaurante` },
  { hreflang: 'x-default', href: `${BASE}/es/carta-de-vinos-digital-para-restaurante` },
];

const problemRows = [
  ['Carta impresa desactualizada → ventas perdidas', 'Cambios en tiempo real desde tu móvil'],
  ['Sin sommelier → mesa sin orientación de vino', 'Maridajes y descripciones siempre disponibles para cada camarero'],
  ['Stock muerto inmovilizado', 'Control de inventario integrado con la carta'],
  ['Sin datos de qué vinos vende más', 'Analytics de ventas por referencia y por mesa'],
  ['"¿Y si cambiamos de sistema?" → resistencia del equipo', 'Winerim se conecta a tu POS actual — no lo sustituye'],
];

const benefits = [
  {
    title: '+23% ticket medio en vino — sin formación adicional',
    body: 'Las cartas digitales con fotografías, descripciones y maridajes guiados aumentan la venta sugerida. Tus camareros venden como un sommelier desde el primer servicio, aunque no tengas uno.',
  },
  {
    title: 'Cada camarero vende como un sommelier — aunque no tengas uno',
    body: '¿Cómo gestiona tu equipo cuando no hay sommelier? Con Winerim, la carta orienta al cliente sola: maridajes, descripciones y recomendaciones siempre disponibles. Sin depender de una persona.',
  },
  {
    title: 'Cambia precios y referencias en 30 segundos',
    body: 'Adiós a las imprentas y las tachaduras. Actualiza tu carta desde el móvil y el cambio aparece en todas las mesas de forma inmediata.',
  },
  {
    title: 'Recupera 10h/semana y sabe exactamente qué tienes, qué vendes y qué te falta',
    body: 'Conecta tu carta con tu inventario. Cuando una referencia se agota, desaparece de la carta automáticamente. Sin sorpresas ni situaciones incómodas con el cliente.',
  },
  {
    title: 'Instalación en 24 horas, sin hardware adicional',
    body: 'QR en la mesa. Escanea. Funciona. Tu equipo lo domina en una hora — no en una semana.',
  },
];

const steps = [
  {
    n: 1,
    title: 'Configuración',
    body: 'Subimos tu carta actual a la plataforma. Añadimos descripciones, maridajes y fotografías de tus referencias. Tiempo estimado: 4-8 horas con nuestro equipo.',
  },
  {
    n: 2,
    title: 'Activación',
    body: 'Generamos los QR para tus mesas. Tus clientes escanean y acceden a la carta. Sin app. Sin registro. Sin fricción.',
  },
  {
    n: 3,
    title: 'Crecimiento',
    body: 'Recibes datos semanales de qué vinos se consultan más, qué maridajes se recomiendan y qué referencias convierten mejor. Decides qué comprar con información real — no con intuición.',
  },
];

const faqs = [
  {
    q: '¿Cuánto tiempo tarda la instalación?',
    a: 'La configuración básica tarda entre 4 y 8 horas con nuestro equipo de onboarding. Tu carta digital queda operativa ese mismo día.',
  },
  {
    q: '¿Necesito instalar hardware adicional?',
    a: 'No. Winerim funciona en la nube. Los clientes acceden a la carta escaneando un QR — sin app, sin registro.',
  },
  {
    q: '¿Se integra con mi POS actual?',
    a: 'Sí. Nos integramos con los principales sistemas del mercado. Si tu POS no está en la lista, nuestro equipo técnico evalúa la integración sin coste adicional.',
  },
  {
    q: '¿Qué pasa si se corta la conexión durante el servicio?',
    a: 'La carta digital tiene modo offline. Funciona aunque se corte el WiFi y sincroniza cuando se recupera la conexión.',
  },
  {
    q: '¿Winerim cobra comisión por venta de vino?',
    a: 'No. Winerim cobra una cuota fija mensual. Sin comisión por venta, sin coste por referencia añadida, sin exclusividad de bodega. Cancela cuando quieras.',
  },
];

export default function LandingES1() {
  return (
    <>
      <SEOHead
        title="Carta de Vinos Digital para Restaurante | Winerim"
        description="1.000+ restaurantes confían en Winerim — +23% ticket medio en vino. Digitaliza tu carta, gestiona tu bodega y conecta con tu POS actual. Carta inteligente líder en Europa. Solicita tu demo."
        canonical={`${BASE}/es/carta-de-vinos-digital-para-restaurante`}
        hreflangEntries={hreflangEntries}
        jsonLd={jsonLd}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center gap-2">
                <img src={winerimLogo} alt="Winerim" className="h-8 w-auto" />
                <span className="font-display text-xl font-semibold text-foreground">Winerim</span>
              </a>
              <Button asChild className="btn-wine" size="sm">
                <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                  Solicitar demo gratuita
                </a>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block text-sm font-medium text-primary bg-primary-light px-4 py-1.5 rounded-full mb-6">
              Carta inteligente de vinos líder en Europa
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-6 text-balance">
              1.000+ restaurantes confían en Winerim —{' '}
              <span className="text-primary">+23% ticket medio en vino</span>, activos en 15+ países
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              La carta inteligente de vinos líder en Europa. Digitaliza en 24 horas, conecta con tu POS actual y da a tu equipo la herramienta para vender más — aunque no tengas sommelier.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Button asChild className="btn-wine text-base h-12 px-8">
                <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                  Solicitar demo gratuita
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button asChild variant="outline" className="btn-wine-outline text-base h-12 px-8">
                <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                  Ver cómo funciona
                </a>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {['Activo en 15+ países', 'Lista en 24h', 'Sin comisiones por venta', 'Conecta con tu POS actual', 'Modo offline disponible'].map(b => (
                <span key={b} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />{b}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-10 text-center">
              La carta en papel te está costando dinero
            </h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary">
                    <th className="text-left p-4 font-semibold text-foreground">Situación actual</th>
                    <th className="text-left p-4 font-semibold text-primary">Con Winerim</th>
                  </tr>
                </thead>
                <tbody>
                  {problemRows.map(([before, after], i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-4 text-foreground/70">
                        <span className="flex items-start gap-2"><X className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />{before}</span>
                      </td>
                      <td className="p-4 text-foreground/80">
                        <span className="flex items-start gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />{after}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-12 text-center">
              Por qué 1.000+ restaurantes en 15 países eligieron Winerim
            </h2>
            <div className="space-y-8">
              {benefits.map((b, i) => (
                <div key={i} className="card-elevated p-6">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">{b.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* No commissions */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-6">
              Winerim no gana nada cuando vendes más vino — cobras tú, siempre
            </h2>
            <blockquote className="text-lg text-muted-foreground italic mb-8 leading-relaxed">
              "Hay cartas digitales gratuitas. Pero te cobran por cada botella que vendes, o te atan a sus vinos. Winerim cobra una cuota fija mensual. Punto. Tú vendes lo que quieres, al precio que pones, y cada euro de vino es tuyo."
            </blockquote>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-foreground">
              {['Sin comisión por venta de vino', 'Sin coste por referencia añadida', 'Sin exclusividad de bodega', 'Cancela cuando quieras'].map(item => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />{item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ROI Calculator */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              Calcula cuánto puedes ganar con Winerim
            </h2>
            <p className="text-muted-foreground mb-8">
              Introduce tus datos y ve el impacto estimado en tu cuenta de resultados.
            </p>
            <div className="card-elevated p-8 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                {[
                  { label: 'Nº mesas', placeholder: 'Ej. 30' },
                  { label: 'Ticket medio actual en vino (€)', placeholder: 'Ej. 25' },
                  { label: 'Noches de servicio/semana', placeholder: 'Ej. 6' },
                ].map(({ label, placeholder }) => (
                  <label key={label} className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    <input
                      type="number"
                      placeholder={placeholder}
                      className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </label>
                ))}
              </div>
              <div className="bg-primary/5 rounded-lg p-5 border border-primary/20 text-sm text-muted-foreground">
                Introduce tus datos para ver el incremento estimado en ticket de vino y el tiempo ahorrado en gestión. Basado en datos reales de clientes activos.
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-12 text-center">
              Tres pasos para digitalizar tu carta de vinos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {steps.map(({ n, title, body }) => (
                <div key={n} className="card-elevated p-6 relative">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-lg mb-4">
                    {n}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing hint */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-6">
              Precio fijo mensual — sin sorpresas, sin variable de ventas
            </h2>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-foreground mb-8">
              {['Precio fijo mensual (sin comisión por venta de vino)', 'Sin coste por referencia añadida', 'Sin hardware requerido', 'Cancela cuando quieras'].map(item => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />{item}
                </span>
              ))}
            </div>
            <Button asChild variant="outline" className="btn-wine-outline">
              <a href="/">Ver planes →</a>
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-10 text-center">
              Preguntas frecuentes sobre la carta de vinos digital
            </h2>
            <div className="space-y-6">
              {faqs.map(({ q, a }) => (
                <div key={q} className="card-elevated p-6">
                  <h3 className="font-semibold text-foreground mb-2">{q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              ¿Listo para digitalizar tu carta de vinos?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Únete a los 1.000+ restaurantes que ya confían en Winerim en 15+ países — con +23% de ticket medio en vino.
            </p>
            <Button asChild className="btn-wine text-base h-12 px-8">
              <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                Solicitar demo gratuita
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">Demo en 30 minutos. Sin compromiso. Tu carta configurada en 24h.</p>
          </div>
        </section>

        {/* Footer trust */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 border-t border-border bg-card/30">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              {['🔒 Datos seguros — GDPR compliant', '🌍 Soporte en español, inglés, italiano, francés, portugués', '⭐ 4.8/5 valoración media en Google Reviews', '📞 Soporte humano — no bots', '📵 Modo offline disponible'].map(item => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={winerimLogo} alt="Winerim" className="h-6 w-auto" />
              <span className="text-sm text-muted-foreground">Winerim SL</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/es/software-gestion-bodega-restaurante" className="hover:text-foreground transition-colors">Software gestión bodega</a>
              <a href="/" className="hover:text-foreground transition-colors">Inicio</a>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}
