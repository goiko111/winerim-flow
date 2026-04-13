import { useState } from 'react';
import { Link } from 'react-router-dom';
import { appConfig } from '@/config/app';
import { plans, allPlanFeatures } from '@/config/plans';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import BillingToggle from '@/components/BillingToggle';
import winerimLogo from '@/assets/winerim-icon.png';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { ProductSection } from '@/components/landing/ProductSection';
import { AllFeaturesSection } from '@/components/landing/AllFeaturesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { StatsBar } from '@/components/landing/StatsBar';

const Index = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const monthlyPlan = plans.find(p => p.planSlug === 'mensual')!;
  const annualPlans = plans.filter(p => p.period === 'annual');
  const annualPlan = plans.find(p => p.planSlug === 'anual')!;
  const displayedPlans = isAnnual ? annualPlans : [monthlyPlan];

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
            <Button
              size="sm"
              className="btn-wine"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver planes
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-sm font-medium text-primary bg-primary-light px-4 py-1.5 rounded-full mb-6">
            {appConfig.brandClaim}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-6 text-balance">
            Vende más vino.{' '}
            <span className="text-primary">Mejora márgenes.</span>{' '}
            Controla tu bodega.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Winerim convierte tu carta de vinos en una herramienta de venta, análisis y gestión
            — con IA, sin depender del sommelier.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              className="btn-wine text-base h-12 px-8"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Empezar ahora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button asChild variant="outline" className="btn-wine-outline text-base h-12 px-8">
              <a href="https://wa.me/34624402302" target="_blank" rel="noopener noreferrer">
                Hablar con ventas
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsBar />

      {/* Problem */}
      <ProblemSection />

      {/* Product / 5 tools */}
      <ProductSection />

      {/* All features */}
      <AllFeaturesSection
        title="Todo incluido en cada plan"
        subtitle="Sin módulos extra ni costes ocultos. Acceso completo desde el primer día."
        features={allPlanFeatures}
      />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="section-header text-primary">Precios</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              Planes diseñados para hostelería
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Sin permanencia. Cancela cuando quieras. Todo incluido.
            </p>
            <BillingToggle
              isAnnual={isAnnual}
              onChange={setIsAnnual}
              annualBadge={`Desde ${Math.round(annualPlan.price / 12)}€/mes`}
            />
          </div>

          <div className={cn(
            'grid gap-6 mx-auto',
            displayedPlans.length === 1 ? 'max-w-md' : 'grid-cols-1 md:grid-cols-2 max-w-3xl'
          )}>
            {displayedPlans.map((plan) => {
              const monthlyEquiv = plan.period === 'annual'
                ? Math.round(plan.price / (plan.planSlug === 'semestral' ? 6 : 12))
                : null;

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
                      Más popular
                    </span>
                  )}
                  {plan.savings && !plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium text-success-foreground bg-success px-3 py-1 rounded-full">
                      {plan.savings}
                    </span>
                  )}

                  <div className="mb-6">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-display font-bold text-primary">
                        {plan.price}€
                      </span>
                      <span className="text-muted-foreground">
                        /{plan.period === 'monthly' ? 'mes' : plan.planSlug === 'semestral' ? '6 meses' : 'año'}
                      </span>
                    </div>
                    {monthlyEquiv && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {monthlyEquiv}€/mes facturado {plan.planSlug === 'semestral' ? 'semestral' : 'anualmente'}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
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
                    <Link to={`/checkout/${plan.planSlug}`}>
                      Contratar ahora
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Guarantee */}
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              🔒 Pago seguro · Sin permanencia · Cancela cuando quieras
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
            ¿Tu carta de vinos rinde lo que debería?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Empieza hoy y convierte tu carta en una herramienta de venta desde el primer día.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              className="btn-wine text-base h-12 px-8"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver planes y empezar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button asChild variant="outline" className="btn-wine-outline text-base h-12 px-8">
              <a href="https://wa.me/34624402302" target="_blank" rel="noopener noreferrer">
                Hablar con un asesor
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
              <span className="text-sm text-muted-foreground">
                {appConfig.companyLegalName}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href={appConfig.termsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Condiciones
              </a>
              <a href={appConfig.privacyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Privacidad
              </a>
              <a href={`mailto:${appConfig.supportEmail}`} className="hover:text-foreground transition-colors">
                Contacto
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
