import { Plan } from '@/config/plans';
import { Check, Sparkles } from 'lucide-react';
import { CheckoutLang, getCheckoutDict } from '@/config/checkoutI18n';

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€', USD: '$', GBP: '£', BRL: 'R$',
  MXN: '$', ARS: '$', COP: '$', CLP: '$',
};

interface PlanSummaryCardProps {
  plan: Plan;
  isCustom?: boolean;
  isIntl?: boolean;
  billingInterval?: string | null;
  currency?: string | null;
  lang?: CheckoutLang;
}

export const PlanSummaryCard = ({ plan, isCustom, isIntl, billingInterval, currency, lang = 'es' }: PlanSummaryCardProps) => {
  const t = getCheckoutDict(lang);
  const currencySymbol = CURRENCY_SYMBOLS[currency?.toUpperCase() ?? ''] ?? '€';
  const testimonial = {
    quote: t.testimonialQuote,
    author: "María González",
    role: t.testimonialRole,
  };

  const impacts = t.impacts;

  return (
    <div className="space-y-8">
      {/* Plan header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          {isCustom && (
            <span className="text-xs font-medium uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              {t.customOffer}
            </span>
          )}
          {!isCustom && plan.highlight && (
            <span className="text-xs font-medium uppercase tracking-wider text-primary bg-primary-light px-3 py-1 rounded-full">
              {t.mostPopular}
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
            {plan.price}{currencySymbol}
          </span>
          <span className="text-muted-foreground">
            /{t.periods[billingInterval ?? ''] ?? t.periods[plan.period] ?? t.periods.monthly}
          </span>
          {!isIntl && (
            <span className="text-sm text-muted-foreground ml-1">{t.plusTax}</span>
          )}
        </div>
      </div>

      {/* Features */}
      <div>
        <p className="section-header">{t.includes}</p>
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
        <p className="section-header text-primary">{t.expectedImpact}</p>
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
