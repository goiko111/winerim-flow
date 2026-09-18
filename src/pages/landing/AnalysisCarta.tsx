import { type ChangeEvent, type FormEvent, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Check,
  ClipboardCheck,
  FileText,
  LineChart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Upload,
  Wine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/SEOHead';
import winerimLogo from '@/assets/winerim-icon.png';
import { trackMetaLead } from '@/utils/trackMetaConversion';

const BASE = 'https://winerim.wine';
const WHATSAPP_NUMBER = '34624402302';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

type FormState = {
  name: string;
  restaurant: string;
  email: string;
  phone: string;
  references: string;
  timeline: string;
  challenge: string;
};

const initialFormState: FormState = {
  name: '',
  restaurant: '',
  email: '',
  phone: '',
  references: '',
  timeline: '',
  challenge: '',
};

const referencesOptions = [
  { value: 'menos_50', label: 'Menos de 50 referencias' },
  { value: '50_100', label: '50-100 referencias' },
  { value: '100_250', label: '100-250 referencias' },
  { value: 'mas_250', label: 'Mas de 250 referencias' },
];

const timelineOptions = [
  { value: 'esta_semana', label: 'Esta semana' },
  { value: 'este_mes', label: 'Este mes' },
  { value: 'trimestre', label: 'En los proximos 3 meses' },
  { value: 'explorando', label: 'Solo estoy explorando' },
];

const challengeOptions = [
  { value: 'stock_parado', label: 'Tengo referencias paradas o stock inmovilizado' },
  { value: 'margen', label: 'Quiero mejorar margen y precio de venta' },
  { value: 'rotacion', label: 'Quiero vender mejor la carta actual' },
  { value: 'digitalizar', label: 'Quiero digitalizar y medir mi carta' },
];

const faqItems = [
  {
    '@type': 'Question',
    name: 'Que analiza Winerim en una carta de vinos?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'Revisamos estructura de carta, rangos de precio, rotacion potencial, stock parado, margen, oportunidades de venta y puntos donde la carta puede ayudar mejor al equipo de sala.',
    },
  },
  {
    '@type': 'Question',
    name: 'Necesito tener la carta digitalizada?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'No. Puedes enviar una carta en PDF, Excel, enlace web o fotografia legible. El equipo de Winerim prepara el diagnostico inicial con la informacion disponible.',
    },
  },
  {
    '@type': 'Question',
    name: 'Cuanto tarda el analisis?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'El primer diagnostico se puede preparar en 24-48 horas laborables cuando la carta incluye suficientes referencias y precios.',
    },
  },
  {
    '@type': 'Question',
    name: 'El analisis tiene coste?',
    acceptedAnswer: {
      '@type': 'Answer',
      text: 'El primer analisis de carta es gratuito para restaurantes que quieran evaluar oportunidades de venta, margen y gestion de bodega con Winerim.',
    },
  },
];

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Analisis gratuito de carta de vinos para restaurantes',
    description:
      'Winerim analiza cartas de vinos de restaurantes para detectar stock parado, oportunidades de margen, referencias sin rotacion y mejoras de venta.',
    provider: {
      '@type': 'Organization',
      name: 'Winerim',
      url: BASE,
    },
    serviceType: 'Analisis de carta de vinos',
    areaServed: ['ES', 'MX', 'CO', 'CL', 'AR', 'PE'],
    url: `${BASE}/analisis-carta`,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  },
];

const hreflangEntries = [
  { hreflang: 'es', href: `${BASE}/analisis-carta` },
  { hreflang: 'x-default', href: `${BASE}/analisis-carta` },
];

const reportBlocks = [
  {
    icon: BarChart3,
    title: 'Referencias con baja rotacion',
    body: 'Detectamos vinos que ocupan espacio, inmovilizan capital o necesitan mas visibilidad en sala.',
  },
  {
    icon: LineChart,
    title: 'Oportunidades de margen',
    body: 'Revisamos rangos de precio y senalamos donde puede haber desajustes de margen o ticket medio.',
  },
  {
    icon: ClipboardCheck,
    title: 'Acciones para vender mejor',
    body: 'Proponemos cambios concretos: destacar, mover, agrupar, retirar, ajustar precio o impulsar por copa.',
  },
  {
    icon: ShieldCheck,
    title: 'Prioridad por impacto',
    body: 'Ordenamos las oportunidades para que el equipo actue primero sobre lo que mas puede mover resultado.',
  },
];

const analysisSteps = [
  {
    icon: Upload,
    title: 'Envias la carta',
    body: 'PDF, Excel, enlace o foto legible. Si tienes inventario o ventas, tambien lo revisamos.',
  },
  {
    icon: Sparkles,
    title: 'Winerim detecta oportunidades',
    body: 'Analizamos precio, mix, rotacion potencial, referencias sin visibilidad y puntos de fuga.',
  },
  {
    icon: MessageCircle,
    title: 'Te contactamos con el diagnostico',
    body: 'Recibes una lectura clara y accionable. Sin informe eterno, sin consultoria abstracta.',
  },
];

const metrics = [
  { label: 'Stock parado detectado', value: '18 refs.' },
  { label: 'Margen revisable', value: '12.400 EUR' },
  { label: 'Oportunidades rapidas', value: '7 acciones' },
];

function getOptionLabel(options: typeof referencesOptions, value: string) {
  return options.find(option => option.value === value)?.label || value || 'No indicado';
}

function trackFunnelEvent(event: string, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });

  const win = window as typeof window & { gtag?: (...args: unknown[]) => void };
  win.gtag?.('event', event, payload);
}

function buildWhatsAppUrl(form: FormState) {
  const references = getOptionLabel(referencesOptions, form.references);
  const timeline = getOptionLabel(timelineOptions, form.timeline);
  const challenge = getOptionLabel(challengeOptions, form.challenge);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `${BASE}/analisis-carta`;

  const message = [
    'Hola Winerim, quiero solicitar un analisis de carta de vinos.',
    '',
    `Nombre: ${form.name}`,
    `Restaurante/empresa: ${form.restaurant}`,
    `Email: ${form.email}`,
    `Telefono: ${form.phone}`,
    `Referencias: ${references}`,
    `Cuando quiere empezar: ${timeline}`,
    `Principal objetivo: ${challenge}`,
    `Origen: ${currentUrl}`,
  ].join('\n');

  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}

export default function AnalysisCarta() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [hasTrackedStart, setHasTrackedStart] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleFormFocus = () => {
    if (hasTrackedStart) return;
    setHasTrackedStart(true);
    trackFunnelEvent('winerim_form_start', {
      form_name: 'Analisis carta',
      content_category: 'wine_list_analysis',
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackMetaLead('Analisis carta', 'wine_list_analysis');
    trackFunnelEvent('generate_lead', {
      form_name: 'Analisis carta',
      content_category: 'wine_list_analysis',
      references: form.references,
      timeline: form.timeline,
      challenge: form.challenge,
    });
    setSubmitted(true);
    window.open(buildWhatsAppUrl(form), '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <SEOHead
        title="Analisis de Carta de Vinos Gratis | Winerim"
        description="Analizamos gratis tu carta de vinos para detectar stock parado, oportunidades de margen, referencias sin rotacion y acciones para vender mejor en restaurante."
        canonical={`${BASE}/analisis-carta`}
        hreflangEntries={hreflangEntries}
        jsonLd={jsonLd}
      />

      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/90 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 gap-4">
              <a href="/" className="flex items-center gap-2">
                <img src={winerimLogo} alt="Winerim" className="h-8 w-auto" />
                <span className="font-display text-xl font-semibold text-foreground">Winerim</span>
              </a>
              <Button asChild className="btn-wine" size="sm">
                <a href="#analisis-form">Solicitar analisis</a>
              </Button>
            </div>
          </div>
        </header>

        <main>
          <section className="py-14 lg:py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-start">
              <div className="pt-4">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary-light px-4 py-1.5 rounded-full mb-6">
                  <Wine className="w-4 h-4" />
                  Analisis gratuito para restaurantes
                </span>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-6 text-balance">
                  Descubre que vinos no rotan, donde pierdes margen y que cambios harian vender mejor tu carta
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl">
                  Enviamos un diagnostico accionable de tu carta de vinos: referencias paradas, rangos de precio, oportunidades de margen y decisiones concretas para tu equipo de sala.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button asChild className="btn-wine text-base h-12 px-8">
                    <a href="#analisis-form">
                      Pedir analisis gratuito
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="btn-wine-outline text-base h-12 px-8">
                    <a href="#ejemplo-informe">Ver que recibes</a>
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                  {['Telefono obligatorio para contacto rapido', 'Diagnostico en 24-48h laborables', 'Sin cambiar tu carta actual'].map(item => (
                    <span key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      {item}
                    </span>
                  ))}
                </div>

                <div id="ejemplo-informe" className="mt-12 border border-border rounded-lg bg-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Ejemplo de lectura inicial</p>
                      <p className="text-xs text-muted-foreground">Muestra orientativa del output de Winerim</p>
                    </div>
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="grid sm:grid-cols-3 border-b border-border">
                    {metrics.map(metric => (
                      <div key={metric.label} className="p-5 border-b sm:border-b-0 sm:border-r last:border-r-0 border-border">
                        <p className="text-2xl font-display font-semibold text-primary">{metric.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-5 space-y-3 text-sm">
                    {[
                      ['Riesgo', 'Muchas referencias por encima de 100 EUR sin apoyo de maridaje ni descripcion de valor.'],
                      ['Oportunidad', 'Mover 5 referencias con margen alto a posiciones visibles y carta por copas.'],
                      ['Accion', 'Reordenar por estilo/precio y crear bloque de recomendados de temporada.'],
                    ].map(([label, body]) => (
                      <div key={label} className="grid sm:grid-cols-[110px_1fr] gap-2">
                        <span className="font-semibold text-foreground">{label}</span>
                        <span className="text-muted-foreground">{body}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside id="analisis-form" className="card-elevated p-5 sm:p-7 scroll-mt-24">
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Solicita el analisis de tu carta
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Completa los datos y abrimos el contacto por WhatsApp con toda la informacion preparada.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit} onFocus={handleFormFocus}>
                  <div>
                    <label htmlFor="name" className="text-sm font-medium text-foreground">Nombre</label>
                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="input-premium w-full mt-1"
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="restaurant" className="text-sm font-medium text-foreground">Restaurante o empresa</label>
                    <input
                      id="restaurant"
                      name="restaurant"
                      value={form.restaurant}
                      onChange={handleChange}
                      className="input-premium w-full mt-1"
                      autoComplete="organization"
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="input-premium w-full mt-1"
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="text-sm font-medium text-foreground">Telefono</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        className="input-premium w-full mt-1"
                        autoComplete="tel"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="references" className="text-sm font-medium text-foreground">Numero de referencias</label>
                    <select
                      id="references"
                      name="references"
                      value={form.references}
                      onChange={handleChange}
                      className="input-premium w-full mt-1"
                      required
                    >
                      <option value="">Selecciona una opcion</option>
                      {referencesOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="timeline" className="text-sm font-medium text-foreground">Cuando quieres empezar</label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={form.timeline}
                      onChange={handleChange}
                      className="input-premium w-full mt-1"
                      required
                    >
                      <option value="">Selecciona una opcion</option>
                      {timelineOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="challenge" className="text-sm font-medium text-foreground">Principal objetivo</label>
                    <select
                      id="challenge"
                      name="challenge"
                      value={form.challenge}
                      onChange={handleChange}
                      className="input-premium w-full mt-1"
                      required
                    >
                      <option value="">Selecciona una opcion</option>
                      {challengeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <Button type="submit" className="btn-wine w-full text-base h-12">
                    Enviar y abrir WhatsApp
                    <MessageCircle className="w-4 h-4 ml-2" />
                  </Button>

                  {submitted && (
                    <p className="text-sm text-primary font-medium">
                      Perfecto. Se ha abierto WhatsApp con los datos del lead preparados.
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Usaremos tus datos solo para contactarte sobre el analisis de carta solicitado.
                  </p>
                </form>
              </aside>
            </div>
          </section>

          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
            <div className="max-w-6xl mx-auto">
              <div className="max-w-3xl mb-10">
                <span className="section-header">Que recibes</span>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
                  Un diagnostico pensado para decidir, no para decorar una presentacion
                </h2>
                <p className="text-muted-foreground">
                  El objetivo es encontrar acciones claras para vender mejor la carta actual antes de pedir mas stock o cambiarlo todo.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {reportBlocks.map(({ icon: Icon, title, body }) => (
                  <div key={title} className="card-elevated p-5">
                    <Icon className="w-6 h-6 text-primary mb-4" />
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
              <div>
                <span className="section-header">Proceso</span>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
                  De carta enviada a decisiones concretas
                </h2>
                <p className="text-muted-foreground">
                  Lo montamos para que el primer contacto llegue con contexto real: carta, volumen, telefono y problema principal.
                </p>
              </div>
              <div className="space-y-5">
                {analysisSteps.map(({ icon: Icon, title, body }, index) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-semibold text-primary mb-1">Paso {index + 1}</p>
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2">{title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
                Especialmente util si tienes entre 50 y 250+ referencias
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Restaurantes, hoteles, grupos de restauracion y vinotecas que necesitan vender mejor sin depender solo de intuicion o Excel.
              </p>
              <Button asChild className="btn-wine text-base h-12 px-8">
                <a href="#analisis-form">
                  Solicitar analisis gratuito
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </section>

          <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-8 text-center">
                Preguntas habituales
              </h2>
              <div className="space-y-4">
                {faqItems.map(question => (
                  <div key={question.name} className="card-elevated p-5">
                    <h3 className="font-semibold text-foreground mb-2">{question.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{question.acceptedAnswer.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={winerimLogo} alt="Winerim" className="h-6 w-auto" />
              <span className="text-sm text-muted-foreground">Winerim SL</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/es/carta-de-vinos-digital-para-restaurante" className="hover:text-foreground transition-colors">Carta digital</a>
              <a href="/es/software-gestion-bodega-restaurante" className="hover:text-foreground transition-colors">Gestion bodega</a>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}
