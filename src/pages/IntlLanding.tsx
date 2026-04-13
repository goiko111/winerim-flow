import { useState } from 'react';
import { Link } from 'react-router-dom';
import { appConfig } from '@/config/app';
import { intlPlans, allPlanFeaturesIntl, i18n, langLabels, type IntlLang, type IntlCurrency } from '@/config/plansIntl';
import { Check, ArrowRight, Globe, Wine, Brain, Package, BarChart3, GraduationCap, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import BillingToggle from '@/components/BillingToggle';
import winerimLogo from '@/assets/winerim-icon.png';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { AllFeaturesSection } from '@/components/landing/AllFeaturesSection';
import { StatsBar } from '@/components/landing/StatsBar';

const currencySymbol: Record<IntlCurrency, string> = { EUR: '€', USD: '$' };

const IntlLanding = () => {
  const [lang, setLang] = useState<IntlLang>('en');
  const [currency, setCurrency] = useState<IntlCurrency>('EUR');
  const [isAnnual, setIsAnnual] = useState(true);

  const { convertToUsd } = useExchangeRate();
  const t = i18n[lang];

  const getPrice = (eurPrice: number): number => {
    return currency === 'USD' ? convertToUsd(eurPrice) : eurPrice;
  };

  const monthlyPlan = intlPlans.find(p => p.planSlug === 'monthly')!;
  const annualPlans = intlPlans.filter(p => p.period === 'annual');
  const annualPlan = intlPlans.find(p => p.planSlug === 'annual')!;
  const displayedPlans = isAnnual ? annualPlans : [monthlyPlan];
  const sym = currencySymbol[currency];

  const tools = [
    { icon: Wine, title: t.toolSales, description: t.toolSalesDesc },
    { icon: Brain, title: t.toolAI, description: t.toolAIDesc },
    { icon: Package, title: t.toolCellar, description: t.toolCellarDesc },
    { icon: BarChart3, title: t.toolAnalytics, description: t.toolAnalyticsDesc },
    { icon: GraduationCap, title: t.toolTraining, description: t.toolTrainingDesc },
    { icon: Lightbulb, title: t.toolDecision, description: t.toolDecisionDesc },
  ];

  const problems = [t.problem1, t.problem2, t.problem3, t.problem4];
  const features = allPlanFeaturesIntl[lang] || allPlanFeaturesIntl.en;

  const buildCheckoutUrl = (plan: typeof intlPlans[0]) => {
    const params = new URLSearchParams({ currency, lang, intl: '1' });
    return `/checkout/${plan.planSlug}?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src={winerimLogo} alt={appConfig.brandName} className="h-8 w-auto" />
              <span className="font-display text-xl font-semibold text-foreground">
                {appConfig.brandName}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Language selector */}
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4 text-muted-foreground" />
                {(Object.keys(langLabels) as IntlLang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={cn(
                      'text-xs px-2 py-1 rounded-md transition-colors',
                      lang === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              {/* Currency selector */}
              <div className="flex items-center gap-1 border-l border-border pl-3">
                {(['EUR', 'USD'] as IntlCurrency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={cn(
                      'text-xs px-2 py-1 rounded-md transition-colors',
                      currency === c ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <Button
                size="sm"
                className="btn-wine hidden sm:inline-flex"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t.viewPlans}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-sm font-medium text-primary bg-primary-light px-4 py-1.5 rounded-full mb-6">
            {t.heroTag}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-6 text-balance">
            {t.heroTitle}{' '}
            <span className="text-primary">{t.heroHighlight}</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t.heroDescription}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              className="btn-wine text-base h-12 px-8"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.ctaPrimary}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button asChild variant="outline" className="btn-wine-outline text-base h-12 px-8">
              <a href="https://wa.me/34624402302" target="_blank" rel="noopener noreferrer">
                {t.ctaSecondary}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsBar stats={[
        { value: '+1,000', label: t.statsManaged },
        { value: '15', label: t.statsCountries },
        { value: '+15%', label: t.statsTicket },
      ]} />

      {/* Problem */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="section-header text-primary">
            {lang === 'en' ? 'The problem' : lang === 'it' ? 'Il problema' : 'El problema'}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-10">
            {t.problemTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {problems.map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-5 rounded-xl border border-destructive/20 bg-destructive/5">
                <span className="text-destructive text-lg mt-0.5">✕</span>
                <p className="text-sm text-foreground/80 leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product / 6 tools */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-header text-primary">{t.solutionLabel}</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              {t.solutionTitle}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t.solutionSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, i) => (
              <div key={i} className="card-elevated p-6 hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                  <tool.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{tool.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All features */}
      <AllFeaturesSection
        title={t.featuresTitle}
        subtitle={t.featuresSubtitle}
        features={features}
      />

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-header text-primary">
              {lang === 'en' ? 'Testimonials' : lang === 'it' ? 'Testimonianze' : 'Testimonios'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">
              {t.testimonialsTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: lang === 'en'
                  ? 'With Winerim there\'s no need to print. The wine list is always up to date, it helps me manage stock, purchasing, and sales.'
                  : lang === 'it'
                    ? 'Con Winerim non c\'è bisogno di stampare. La carta è sempre aggiornata, mi aiuta a gestire stock, acquisti e vendite.'
                    : 'Con Winerim no hay que imprimir, permite tener la carta actualizada siempre, me ayuda a gestionar los stocks, compras y ventas.',
                name: 'Álex Pardo',
                role: lang === 'en' ? 'Best Sommelier of Spain 2023' : lang === 'it' ? 'Miglior Sommelier di Spagna 2023' : 'Mejor Sommelier de España 2023',
                restaurant: 'Restaurante Coque',
              },
              {
                quote: lang === 'en'
                  ? 'What used to take 10-15 minutes to explain the wine list, now with Winerim takes 3 minutes. It\'s essential for me.'
                  : lang === 'it'
                    ? 'Quello che prima richiedeva 10-15 minuti per spiegare la carta, ora con Winerim ne bastano 3. È indispensabile.'
                    : 'Lo que antes eran 10/15 minutos para explicar la carta, ahora con Winerim en 3 minutos ya tienen una visión global de los vinos.',
                name: 'Nacho Otamendi',
                role: lang === 'en' ? 'Owner/Sommelier' : lang === 'it' ? 'Proprietario/Sommelier' : 'Propietario/Sommelier',
                restaurant: 'Travieso Bar',
              },
              {
                quote: lang === 'en'
                  ? 'I manage my wine list more efficiently and customers are visually surprised. It gives them instant information about the wines.'
                  : lang === 'it'
                    ? 'Gestisco la mia carta dei vini in modo più efficiente e i clienti restano sorpresi visivamente.'
                    : 'Gestiono mi carta de manera más eficiente y los clientes quedan sorprendidos visualmente con Winerim.',
                name: 'Jason Tong',
                role: lang === 'en' ? 'Chef & Owner' : lang === 'it' ? 'Chef e Proprietario' : 'Chef y Propietario',
                restaurant: 'Singapore Garden',
              },
            ].map((testimonial, i) => (
              <div key={i} className="card-elevated p-6 flex flex-col">
                <blockquote className="text-sm text-foreground/80 italic leading-relaxed flex-1 mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t border-border pt-4">
                  <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-primary font-medium">{testimonial.restaurant}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="section-header text-primary">
              {lang === 'en' ? 'Pricing' : lang === 'it' ? 'Prezzi' : 'Precios'}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              {t.pricingTitle}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">{t.pricingSubtitle}</p>
            <BillingToggle
              isAnnual={isAnnual}
              onChange={setIsAnnual}
              monthlyLabel={t.monthly}
              annualLabel={t.annual}
              annualBadge={`${sym}${Math.round(getPrice(annualPlan.price.EUR) / 12)}${t.perMonth}`}
            />
          </div>

          <div className={cn(
            'grid gap-6 mx-auto',
            displayedPlans.length === 1 ? 'max-w-md' : 'grid-cols-1 md:grid-cols-2 max-w-3xl'
          )}>
            {displayedPlans.map((plan) => {
              const price = getPrice(plan.price.EUR);
              const monthlyEquiv = plan.period === 'annual'
                ? Math.round(price / (plan.planSlug === 'biannual' ? 6 : 12))
                : null;
              const planFeatures = plan.features[lang] || plan.features.en;

              return (
                <div
                  key={plan.planSlug}
                  className={cn(
                    'card-elevated p-8 flex flex-col relative',
                    plan.highlight && 'ring-2 ring-primary'
                  )}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium text-primary-foreground bg-primary px-3 py-1 rounded-full">
                      {t.mostPopular}
                    </span>
                  )}
                  {plan.savings && !plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium text-success-foreground bg-success px-3 py-1 rounded-full">
                      {plan.savings[lang] || plan.savings.en}
                    </span>
                  )}

                  <div className="mb-6">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {plan.name[lang] || plan.name.en}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-display font-bold text-primary">
                        {sym}{price}
                      </span>
                      <span className="text-muted-foreground">
                        {plan.period === 'monthly' ? t.perMonth : plan.planSlug === 'biannual' ? '/6mo' : t.perYear}
                      </span>
                    </div>
                    {monthlyEquiv && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {sym}{monthlyEquiv}{t.equivMonth}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {planFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={cn('w-full', plan.highlight ? 'btn-wine' : 'btn-wine-outline')}
                  >
                    <Link to={buildCheckoutUrl(plan)}>
                      {t.choosePlan}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">{t.guarantee}</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
            {t.ctaTitle}
          </h2>
          <p className="text-muted-foreground text-lg mb-8">{t.ctaSubtitle}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              className="btn-wine text-base h-12 px-8"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.ctaButton}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button asChild variant="outline" className="btn-wine-outline text-base h-12 px-8">
              <a href="https://wa.me/34624402302" target="_blank" rel="noopener noreferrer">
                {t.ctaTalk}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src={winerimLogo} alt={appConfig.brandName} className="h-6 w-auto" />
              <span className="text-sm text-muted-foreground">{appConfig.companyLegalName}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href={appConfig.termsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                {t.terms}
              </a>
              <a href={appConfig.privacyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                {t.privacy}
              </a>
              <a href={`mailto:${appConfig.supportEmail}`} className="hover:text-foreground transition-colors">
                {t.contact}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IntlLanding;
