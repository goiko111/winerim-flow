import { Plan } from '@/config/plans';
import { Check, Sparkles } from 'lucide-react';

interface PlanSummaryCardProps {
  plan: Plan;
  isCustom?: boolean;
}

export const PlanSummaryCard = ({ plan, isCustom }: PlanSummaryCardProps) => {
  const testimonial = {
    quote: "Con Winerim hemos aumentado un 23% las ventas de vino por mesa. El equipo de sala ahora recomienda con confianza.",
    author: "María González",
    role: "Directora, Restaurante El Bodegón"
  };

  const impacts = [
    "Mayor rotación de carta",
    "Mejor margen por botella",
    "Equipo de sala más preparado",
    "Decisiones basadas en datos"
  ];

  return (
    <div className="space-y-8">
      {/* Plan header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          {isCustom && (
            <span className="text-xs font-medium uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Oferta personalizada
            </span>
          )}
          {!isCustom && plan.highlight && (
            <span className="text-xs font-medium uppercase tracking-wider text-primary bg-primary-light px-3 py-1 rounded-full">
              Más popular
            </span>
          )}
          {!isCustom && plan.savings && (
            <span className="text-xs font-medium uppercase tracking-wider text-success bg-success/10 px-3 py-1 rounded-full">
              {plan.savings}
            </span>
          )}
        </div>
        <h2 className="font-display text-3xl font-semibold text-foreground mb-2">
          {plan.name}
        </h2>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-display font-bold text-primary">
            {plan.price}€
          </span>
          <span className="text-muted-foreground">
            /{plan.period === 'monthly' ? 'mes' : 'año'}
          </span>
        </div>
      </div>

      {/* Features */}
      <div>
        <p className="section-header">Incluye</p>
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="feature-item animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <span className="feature-check">
                <Check className="w-3 h-3" />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Impact */}
      <div className="p-5 rounded-xl gradient-wine-light border border-primary/10">
        <p className="section-header text-primary">Impacto esperado</p>
        <ul className="space-y-2">
          {impacts.map((impact, index) => (
            <li key={index} className="text-sm text-foreground/80 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {impact}
            </li>
          ))}
        </ul>
      </div>

      {/* Testimonial */}
      <div className="border-l-2 border-primary/30 pl-5 py-1">
        <blockquote className="text-sm text-foreground/80 italic mb-3">
          "{testimonial.quote}"
        </blockquote>
        <div className="text-sm">
          <p className="font-medium text-foreground">{testimonial.author}</p>
          <p className="text-muted-foreground">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
};
