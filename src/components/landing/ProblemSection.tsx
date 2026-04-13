interface ProblemSectionProps {
  title: string;
  problems: string[];
}

export const ProblemSection = ({
  title = 'El vino debería ser tu mayor margen… pero rara vez lo es.',
  problems = [
    'La carta de vinos no vende, solo informa. El vino está infravendido.',
    'El equipo de sala no tiene tiempo ni conocimiento para recomendar vinos.',
    'Hay vinos parados sin rotación y referencias mal posicionadas.',
    'No hay datos claros para tomar decisiones de compra ni pricing.',
  ],
}: Partial<ProblemSectionProps>) => (
  <section className="py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto text-center">
      <p className="section-header text-primary">El problema</p>
      <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mb-10">
        {title}
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
);
