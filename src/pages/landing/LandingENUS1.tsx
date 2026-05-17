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
    name: 'Winerim — Wine Menu Management Software for Restaurants',
    description:
      "1,000+ restaurants trust Winerim — Europe's #1 intelligent wine list software. Digitize your wine menu, increase check averages, and manage your cellar in real time.",
    url: `${BASE}/en-us/wine-menu-management-software-restaurant`,
    brand: { '@type': 'Brand', name: 'Winerim' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
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
        name: 'Does Winerim work with my current POS?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We integrate with Toast, Square for Restaurants, Lightspeed, Oracle MICROS, Revel, Aloha, and others. If yours isn\'t on the list, our team will evaluate a custom integration at no extra cost.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do guests need to download an app?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Guests access the wine list by scanning a QR code — that\'s it. No app, no account, no friction.',
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
        name: 'Can I still have a printed menu alongside Winerim?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Many restaurants run both. Winerim typically reduces printing costs by 60–80% within the first year.',
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
];

const hreflangEntries = [
  { hreflang: 'en-us', href: `${BASE}/en-us/wine-menu-management-software-restaurant` },
  { hreflang: 'es', href: `${BASE}/es/carta-de-vinos-digital-para-restaurante` },
  { hreflang: 'x-default', href: `${BASE}/en-us/wine-menu-management-software-restaurant` },
];

const problems = [
  ['Lost sales on every shift', "A guest asks about a pairing. Your server doesn't know. The moment passes."],
  ['Dead stock tying up cash', "20–35% of a typical restaurant's wine inventory sits unrotated. That's capital you can't use."],
  ['Out-of-stocks during service', "You 86 a wine at the table. The guest is disappointed. The check is smaller."],
  ['Zero data on what sells', "You buy what you've always bought, not what your guests actually order."],
  ['8–15 hours a week on manual inventory', "Your F&B manager is counting bottles instead of running the floor."],
];

const features = [
  {
    title: 'A wine list your guests actually use — and your servers actually sell from',
    body: 'Beautiful, searchable, photo-rich digital menus accessible via QR code. No app download. No login. Guests browse by style, variety, price point, or food pairing. Servers have everything they need to upsell — built into the table.',
  },
  {
    title: 'Know what you have. Know when you\'re running low. Know what to buy.',
    body: "Every sale updates your cellar count automatically. Set minimum stock levels per label. When a bottle hits the floor limit, it disappears from the menu — automatically. No more 86'ing wines at the table.",
  },
  {
    title: 'Finally know which wines make you money',
    body: 'Drill into sales by label, category (red, white, sparkling, by-the-glass), price tier, and daypart. See which bottles your guests gravitate toward on a Friday vs. a Tuesday. Buy smarter. List smarter.',
  },
  {
    title: 'Change a price or add a new vintage in 30 seconds',
    body: "Update from your phone. Every table sees the new version instantly. No reprints. No crossed-out prices. No \"oh sorry, that's actually $15 now.\"",
  },
  {
    title: 'Works with the systems you already use',
    body: 'Winerim connects with Toast, Square for Restaurants, Lightspeed, Oracle MICROS, Revel, Aloha, and more. Your POS sales flow straight into cellar inventory. No double entry.',
  },
  {
    title: 'Your whole floor staff sells like a sommelier',
    body: "Every server has pairing suggestions, tasting notes, producer stories, and serving guidance in their pocket. Without any training. Your sommelier spends less time explaining the basics and more time closing premium bottles.",
  },
];

const steps = [
  {
    n: 1,
    title: 'Onboarding call (30 min)',
    body: 'We learn your wine program, your team, and your POS setup. We import your current wine list.',
  },
  {
    n: 2,
    title: 'Configuration (4–8 hours)',
    body: 'Our team builds your digital menu with descriptions, pairings, and photos. You review and approve.',
  },
  {
    n: 3,
    title: 'Go live',
    body: 'QR codes for your tables. Guests scan, browse, order. Your cellar updates in real time.',
  },
  {
    n: 4,
    title: 'Grow',
    body: 'Weekly sales reports. Quarterly business reviews. Your wine program gets smarter over time.',
  },
];

const faqs = [
  {
    q: 'Does Winerim work with my current POS?',
    a: "We integrate with Toast, Square for Restaurants, Lightspeed, Oracle MICROS, Revel, Aloha, and others. If yours isn't on the list, our team will evaluate a custom integration at no extra cost.",
  },
  {
    q: 'Do guests need to download an app?',
    a: "No. Guests access the wine list by scanning a QR code — that's it. No app, no account, no friction.",
  },
  {
    q: 'What if my internet goes down during service?',
    a: 'The digital menu has an offline mode. Your cellar inventory syncs when the connection is restored.',
  },
  {
    q: 'Can I still have a printed menu alongside Winerim?',
    a: 'Yes. Many restaurants run both. Winerim typically reduces printing costs by 60–80% within the first year.',
  },
  {
    q: 'Is pricing in USD?',
    a: "Yes — Winerim's US plans are quoted and billed in USD, with US-based billing and support.",
  },
  {
    q: 'How long is the contract?',
    a: 'Month-to-month plans available. Annual plans offer a discount. No lock-in required to get started.',
  },
];

export default function LandingENUS1() {
  return (
    <>
      <SEOHead
        title="Wine Menu Management Software for Restaurants | Winerim"
        description="1,000+ restaurants trust Winerim — Europe's #1 intelligent wine list software. Digitize your wine menu, increase check averages 15-30%, and manage your cellar inventory in real time. Book a free demo."
        canonical={`${BASE}/en-us/wine-menu-management-software-restaurant`}
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
                  Book a free demo
                </a>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block text-sm font-medium text-primary bg-primary-light px-4 py-1.5 rounded-full mb-6">
              Europe's #1 intelligent wine list software — now in the US
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-6 text-balance">
              1,000+ restaurants trust Winerim —{' '}
              <span className="text-primary">Europe's #1 intelligent wine list software</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Replace your paper wine list with a living, selling, updating digital menu. Your team sells more wine — without extra training. Your cellar runs itself.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Button asChild className="btn-wine text-base h-12 px-8">
                <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                  Book a free demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button asChild variant="outline" className="btn-wine-outline text-base h-12 px-8">
                <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                  Watch 2-min overview
                </a>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {['1,000+ active restaurants across 15+ countries', 'Live in 24 hours — no hardware required', 'No per-bottle commissions. Ever.', 'Integrates with your existing POS'].map(b => (
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
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4 text-center">
              Your wine program is probably running on paper, Excel, and texting the sommelier
            </h2>
            <p className="text-center text-muted-foreground mb-10">That's not a system — it's a liability.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {problems.map(([title, body]) => (
                <div key={title} className="flex items-start gap-3 p-5 rounded-xl border border-destructive/20 bg-destructive/5">
                  <X className="w-4 h-4 text-destructive flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-sm text-foreground mb-1">{title}</p>
                    <p className="text-sm text-foreground/70">{body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-primary font-semibold mt-8">Winerim was built to solve all five — on a single platform.</p>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-12 text-center">
              One platform. Your entire wine program.
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

        {/* ROI Calculator */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              See your return before you commit
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter your details and get an instant estimate of what Winerim means for your bottom line.
            </p>
            <div className="card-elevated p-8 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                {[
                  { label: 'Number of tables', placeholder: 'e.g. 30' },
                  { label: 'Avg wine spend per cover ($)', placeholder: 'e.g. 35' },
                  { label: 'Service nights per week', placeholder: 'e.g. 6' },
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
                Enter your data to see your estimated increase in wine check average and time saved on cellar management. Based on aggregated data from active Winerim clients. Individual results vary.
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-10">
              Real numbers from real restaurants
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {[
                { value: '+15–25%', label: 'increase in wine check average' },
                { value: '10h/week', label: 'saved on cellar management' },
                { value: '-40%', label: 'dead stock in first 6 months' },
              ].map(({ value, label }) => (
                <div key={value} className="card-elevated p-6">
                  <div className="font-display text-3xl font-bold text-primary mb-2">{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground italic">
              Winerim has driven measurable results across 1,000+ restaurants in Spain, Italy, France, the UK, Mexico, and beyond. We're now bringing that same platform to the U.S. market — with USD pricing and U.S.-native support.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-12 text-center">
              Live in 24 hours. Here's how.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map(({ n, title, body }) => (
                <div key={n} className="card-elevated p-6">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-lg mb-4">
                    {n}
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing signal */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-6">
              Straightforward pricing. No hidden fees.
            </h2>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-foreground mb-8">
              {['No commission on wine sales', 'No charge per label added', 'No hardware to buy', 'Cancel anytime'].map(item => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />{item}
                </span>
              ))}
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Pricing is based on restaurant size and features. Book a demo for a custom quote — we don't do one-size pricing.
            </p>
            <Button asChild variant="outline" className="btn-wine-outline">
              <a href="/">See plans →</a>
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-10 text-center">
              Common questions about Winerim
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
              Ready to turn your wine list into a revenue driver?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join 1,000+ restaurants in 15+ countries that run their wine program on Winerim.
            </p>
            <Button asChild className="btn-wine text-base h-12 px-8">
              <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                Book your free demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">30-minute demo. No commitment. Your menu ready in 24 hours.</p>
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
              <a href="/es/carta-de-vinos-digital-para-restaurante" className="hover:text-foreground transition-colors">Carta de vinos digital (ES)</a>
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
            </nav>
          </div>
        </footer>
      </div>
    </>
  );
}
