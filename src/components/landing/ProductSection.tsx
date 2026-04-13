import { Wine, Brain, BarChart3, Package, Lightbulb, GraduationCap } from 'lucide-react';

interface ProductSectionProps {
  title: string;
  subtitle: string;
  tools: { icon: React.ElementType; title: string; description: string }[];
}

const defaultToolsEs = [
  { icon: Wine, title: 'Herramienta de venta', description: 'La carta guía al comensal hacia mejores decisiones y convierte más. Filtros, comparador y navegación multiidioma.' },
  { icon: Brain, title: 'Recomendación con IA', description: 'Maridajes automáticos vino-plato para cada comensal y contexto. Fichas generadas con inteligencia artificial.' },
  { icon: Package, title: 'Gestión de bodega', description: 'Stock, pricing, rotación y disponibilidad desde un solo panel. Alertas automáticas de stock bajo.' },
  { icon: BarChart3, title: 'Analítica avanzada', description: 'KPIs de venta, ticket medio, rotación, margen por referencia. Datos de comportamiento del comensal.' },
  { icon: GraduationCap, title: 'Formación de sala', description: 'El equipo recomienda vino con confianza desde el primer día, sin depender del sumiller.' },
  { icon: Lightbulb, title: 'Decision Center', description: 'Interpreta insights, prioriza acciones y toma decisiones más claras sobre carta, pricing, stock y compras.' },
];

export const ProductSection = ({
  title = 'Tu carta de vinos se convierte en 5 herramientas',
  subtitle = 'Winerim transforma tu carta en una herramienta de venta, recomendación, gestión, análisis y formación.',
  tools = defaultToolsEs,
}: Partial<ProductSectionProps>) => {
  const items = tools.length > 0 ? tools : defaultToolsEs;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-header text-primary">La solución</p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((tool, i) => (
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
  );
};
