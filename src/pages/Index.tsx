import { Link } from 'react-router-dom';
import { appConfig } from '@/config/app';
import { plans } from '@/config/plans';
import { Check, ArrowRight, Wine, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import winerimLogo from '@/assets/winerim-icon.png';

const Index = () => {
  const benefits = [
    {
      icon: Wine,
      title: 'Vende más vino',
      description: 'Recomendaciones inteligentes que aumentan el ticket medio',
    },
    {
      icon: TrendingUp,
      title: 'Mejora el margen',
      description: 'Analítica de rentabilidad por botella y proveedor',
    },
    {
      icon: Users,
      title: 'Forma a tu equipo',
      description: 'Fichas y formación para que tu sala venda con confianza',
    },
    {
      icon: BarChart3,
      title: 'Decide con datos',
      description: 'Dashboard de rotación, tendencias y oportunidades',
    },
  ];

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
            <div className="flex items-center gap-4">
              <Link
                to="/sales/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Portal Comercial
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-sm font-medium text-primary bg-primary-light px-4 py-1.5 rounded-full mb-6">
            {appConfig.brandClaim}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-6 text-balance">
            El software que hace que tu restaurante{' '}
            <span className="text-primary">venda más vino</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Analítica, formación de sala y recomendaciones inteligentes para convertir 
            tu carta de vinos en una máquina de generar margen.
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

      {/* Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="card-elevated p-6 hover:scale-[1.02] transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              Planes diseñados para hostelería
            </h2>
            <p className="text-muted-foreground text-lg">
              Sin permanencia. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.planSlug}
                className={cn(
                  'card-elevated p-6 flex flex-col',
                  plan.highlight && 'ring-2 ring-primary relative'
                )}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium text-primary-foreground bg-primary px-3 py-1 rounded-full">
                    Más popular
                  </span>
                )}
                {plan.savings && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium text-success-foreground bg-success px-3 py-1 rounded-full">
                    {plan.savings}
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-display font-bold text-primary">
                      {plan.price}€
                    </span>
                    <span className="text-muted-foreground">
                      /{plan.period === 'monthly' ? 'mes' : 'año'}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.slice(0, 4).map((feature, i) => (
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
                  className={cn(
                    'w-full',
                    plan.highlight ? 'btn-wine' : 'btn-wine-outline'
                  )}
                >
                  <Link to={`/checkout/${plan.planSlug}`}>
                    Elegir plan
                  </Link>
                </Button>
              </div>
            ))}
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
              <a href={appConfig.termsUrl} className="hover:text-foreground transition-colors">
                Condiciones
              </a>
              <a href={appConfig.privacyUrl} className="hover:text-foreground transition-colors">
                Privacidad
              </a>
              <a
                href={`mailto:${appConfig.supportEmail}`}
                className="hover:text-foreground transition-colors"
              >
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
