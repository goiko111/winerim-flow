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
    name: 'Winerim — Software Gestión Bodega Restaurante',
    description:
      'Reduce el stock muerto un 40% y recupera 10h/semana en gestión de bodega. Software de gestión de bodega diseñado para restaurantes. 1.000+ activos.',
    url: `${BASE}/es/software-gestion-bodega-restaurante`,
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
        name: '¿Cuánto tiempo lleva la integración inicial?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'La configuración básica tarda entre 4 y 8 horas con nuestro equipo de onboarding. Volcamos tu carta y tu inventario actual, y el sistema queda operativo ese mismo día.',
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
          text: 'Nos integramos con los principales sistemas del mercado. Si tu POS no está en la lista, nuestro equipo técnico evalúa la integración sin coste adicional.',
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
      {
        '@type': 'HowToStep',
        name: 'Onboarding y configuración',
        text: 'Volcamos tu carta e inventario actual. El sistema queda operativo en 4-8 horas.',
      },
      {
        '@type': 'HowToStep',
        name: 'Activación y sincronización con POS',
        text: 'Winerim se conecta a tu POS. Cada venta actualiza el inventario automáticamente.',
      },
      {
        '@type': 'HowToStep',
        name: 'Control y análisis',
        text: 'Dashboard de ventas, alertas de stock mínimo y propuestas de pedido automáticas.',
      },
    ],
  },
];

const hreflangEntries = [
  { hreflang: 'es', href: `${BASE}/es/software-gestion-bodega-restaurante` },
  { hreflang: 'x-default', href: `${BASE}/es/software-gestion-bodega-restaurante` },
];

const compareRows = [
  ['Tiempo de inventario semanal', '8-15h', '<1h'],
  ['Visibilidad de stock', 'Datos del último conteo', 'Tiempo real'],
  ['Roturas de stock en servicio', 'Habitual', 'Eliminadas'],
  ['Stock muerto sobre compras', '20-35%', '<10%'],
  ['Datos de qué vende más', 'Ninguno', 'Dashboard completo'],
  ['Alertas automáticas de reposición', 'No', 'Sí, configurables'],
];

const features = [
  {
    title: 'Sabe exactamente qué tienes en bodega en cada momento',
    body: 'Cada venta actualiza el stock automáticamente. Cuando una referencia cae por debajo del umbral mínimo que tú defines, recibes una alerta. Nunca más te quedas sin stock en servicio sin saberlo.',
  },
  {
    title: 'La carta se actualiza sola cuando se agota una referencia',
    body: 'Si se vende la última botella de un vino, desaparece de la carta digital de forma automática. Sin intervención manual. Sin situaciones incómodas con el cliente.',
  },
  {
    title: 'Sabe qué vende, cuándo y a qué margen',
    body: 'Dashboard con ventas por referencia, por categoría (blanco, tinto, espumoso), por franja horaria y por precio medio. Decide qué comprar, qué promocionar y qué rotar con datos reales.',
  },
  {
    title: 'Genera órdenes de compra directamente desde la plataforma',
    body: 'Define par stock mínimo y máximo por referencia. Winerim genera la propuesta de pedido automáticamente. Tú la revisas y la envías al proveedor en un clic.',
  },
  {
    title: 'Registra devoluciones, roturas y consumo interno sin fricciones',
    body: 'Ajuste de inventario con motivo y fecha. Trazabilidad completa de cada movimiento de bodega. Imprescindible para auditorías y para entender el coste real de tu carta.',
  },
  {
    title: 'Conecta con tu sistema de cobro sin cambiar nada',
    body: 'Winerim se integra con los principales POS del mercado (Tevalis, Lightspeed, Revel, Oracle MICROS, entre otros). El flujo de ventas alimenta el inventario de forma automática.',
  },
];

const personas = [
  {
    title: 'F&B Manager',
    body: 'Tienes visibilidad completa del inventario, los pedidos y el margen de tu carta de vinos sin abrir un Excel. Reportas a dirección con datos en tiempo real.',
  },
  {
    title: 'Jefe de sala / Sommelier',
    body: 'Sabes en tiempo real qué tienes disponible. Recomiendas con confianza. La carta digital hace que cada miembro de tu equipo pueda vender como un sommelier.',
  },
  {
    title: 'Director / Propietario',
    body: 'Controlas el coste de tu carta de vinos sin depender de que te informen. Ves qué margen da cada referencia y ajustas la selección basándote en datos, no en intuición.',
  },
];

const faqs = [
  {
    q: '¿Cuánto tiempo lleva la integración inicial?',
    a: 'La configuración básica tarda entre 4 y 8 horas con nuestro equipo de onboarding. Volcamos tu carta y tu inventario actual, y el sistema queda operativo ese mismo día.',
  },
  {
    q: '¿Necesito instalar hardware adicional?',
    a: 'No. Winerim funciona en la nube. Accedes desde cualquier dispositivo con navegador: ordenador, tablet o móvil.',
  },
  {
    q: '¿Se integra con mi POS actual?',
    a: 'Nos integramos con los principales sistemas del mercado. Si tu POS no está en la lista, nuestro equipo técnico evalúa la integración sin coste adicional.',
  },
  {
    q: '¿Qué pasa si se va la conexión a internet durante el servicio?',
    a: 'La carta digital tiene modo offline. El inventario se sincroniza en cuanto se recupera la conexión.',
  },
  {
    q: '¿Tiene soporte en español?',
    a: 'Sí. Todo el soporte está disponible en español, con tiempos de respuesta inferiores a 2 horas en horario de oficina.',
  },
];

export default function LandingES2() {
  return (
    <>
      <SEOHead
        title="Software Gestión Bodega Restaurante | Winerim"
        description="Reduce el stock muerto un 40% y recupera 10h/semana en gestión de bodega. Winerim conecta tu inventario de vinos con tu carta digital. 1.000+ restaurantes activos. Demo gratuita."
        canonical={`${BASE}/es/software-gestion-bodega-restaurante`}
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
              Software de gestión de bodega para restaurantes
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-6 text-balance">
              Reduce el stock muerto un{' '}
              <span className="text-primary">40%</span>{' '}
              y recupera{' '}
              <span className="text-primary">10h/semana</span>{' '}
              en gestión de bodega
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              El software de gestión de bodega diseñado para restaurantes. Conecta tu inventario con tu carta digital, automatiza los pedidos y toma decisiones con datos reales — no con hojas de Excel.
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
                  Ver la demo en video
                </a>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {['1.000+ restaurantes activos en 15+ países', 'Integración con los principales POS del mercado', 'Stock en tiempo real, siempre actualizado', 'Sin Excel, sin WhatsApp al sommelier'].map(b => (
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
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-6 text-center">
              Tu bodega sigue gestionándose con el método "carta en papel + Excel + WhatsApp al sommelier"
            </h2>
            <p className="text-center text-muted-foreground mb-10">Y eso tiene un coste real:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['Stock muerto inmovilizado', 'Referencias que no rotan durante meses, capital paralizado.'],
                ['Roturas de stock en servicio', 'El cliente pide un vino que no tienes. Situación incómoda, venta perdida.'],
                ['Horas de inventario manual', 'Tu F&B Manager o jefe de sala dedica entre 8 y 15 horas semanales a contar, anotar y cruzar datos.'],
                ['Cero visibilidad sobre qué vende', 'No sabes qué referencias convierten mejor ni en qué franja horaria se vende más.'],
                ['Pedidos reactivos', 'Compras cuando ya te has quedado sin stock, no cuando la rotación lo indica.'],
              ].map(([title, body]) => (
                <div key={title} className="flex items-start gap-3 p-5 rounded-xl border border-destructive/20 bg-destructive/5">
                  <X className="w-4 h-4 text-destructive flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-sm text-foreground mb-1">{title}</p>
                    <p className="text-sm text-foreground/70">{body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-primary font-semibold mt-8">Con Winerim, todo eso se resuelve desde una sola plataforma.</p>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-12 text-center">
              Todo lo que necesita tu bodega, en un solo lugar
            </h2>
            <div className="space-y-6">
              {features.map((f, i) => (
                <div key={i} className="card-elevated p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparativa */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-10 text-center">
              Winerim vs. el método tradicional
            </h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary">
                    <th className="text-left p-4 font-semibold text-foreground">Métrica</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">Excel + papel</th>
                    <th className="text-left p-4 font-semibold text-primary">Winerim</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map(([metric, before, after]) => (
                    <tr key={metric} className="border-t border-border">
                      <td className="p-4 font-medium text-foreground">{metric}</td>
                      <td className="p-4 text-foreground/60"><span className="flex items-center gap-1.5"><X className="w-3.5 h-3.5 text-destructive" />{before}</span></td>
                      <td className="p-4 text-foreground/80"><span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary" />{after}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-10">
              Lo que consiguen los restaurantes que usan Winerim para su bodega
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { value: '-40%', label: 'de stock muerto en los primeros 6 meses de uso' },
                { value: '+10h/sem', label: 'recuperadas en gestión de inventario' },
                { value: '-85%', label: 'de roturas de stock en servicio durante el primer trimestre' },
              ].map(({ value, label }) => (
                <div key={value} className="card-elevated p-6">
                  <div className="font-display text-3xl font-bold text-primary mb-2">{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Personas */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-10 text-center">
              Diseñado para quienes gestionan la bodega del restaurante
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {personas.map(({ title, body }) => (
                <div key={title} className="card-elevated p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground mb-3">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mid CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              ¿Cuánto te está costando tu bodega sin control?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Agenda una demo de 30 minutos y te mostramos exactamente cómo funcionaría para tu restaurante.
            </p>
            <Button asChild className="btn-wine text-base h-12 px-8">
              <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                Solicitar demo gratuita
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">Sin compromiso. Sin instalación previa. Ves la plataforma en directo con tus propios datos.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-10 text-center">
              Preguntas habituales sobre el software de gestión de bodega
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
              1.000+ restaurantes ya gestionan su bodega con Winerim
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Únete a los restaurantes en 15+ países que han eliminado el Excel de su operativa de bodega.
            </p>
            <Button asChild className="btn-wine text-base h-12 px-8">
              <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                Solicitar demo gratuita
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">Demo en 30 minutos. Tu inventario configurado en 24h.</p>
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
              <a href="/es/carta-de-vinos-digital-para-restaurante" className="hover:text-foreground transition-colors">Carta de vinos digital</a>
              <a href="/" className="hover:text-foreground transition-colors">Inicio</a>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}
