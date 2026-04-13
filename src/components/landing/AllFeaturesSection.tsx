import { Check } from 'lucide-react';

interface AllFeaturesSectionProps {
  title: string;
  subtitle: string;
  features: string[];
}

export const AllFeaturesSection = ({
  title = 'Todo incluido en cada plan',
  subtitle = 'Sin módulos extra ni costes ocultos. Acceso completo desde el primer día.',
  features,
}: AllFeaturesSectionProps) => (
  <section className="py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <p className="section-header text-primary">Funcionalidades</p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
          {title}
        </h2>
        <p className="text-muted-foreground text-lg">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
            <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </span>
            <span className="text-sm text-foreground/80">{f}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);
