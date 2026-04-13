interface Testimonial {
  quote: string;
  name: string;
  role: string;
  restaurant: string;
}

interface TestimonialsSectionProps {
  title: string;
  testimonials: Testimonial[];
}

const defaultTestimonials: Testimonial[] = [
  {
    quote: 'Con Winerim no hay que imprimir, permite tener la carta actualizada siempre, me ayuda a gestionar los stocks, compras y ventas, y es muy visual y atractiva.',
    name: 'Álex Pardo',
    role: 'Mejor Sommelier de España 2023',
    restaurant: 'Restaurante Coque',
  },
  {
    quote: 'Lo que antes eran 10/15 minutos para explicar la carta, ahora con Winerim en 3 minutos ya tienen una visión global de los vinos. Me resulta imprescindible.',
    name: 'Nacho Otamendi',
    role: 'Propietario/Sommelier',
    restaurant: 'Travieso Bar',
  },
  {
    quote: 'Gestiono mi carta de manera más eficiente y los clientes quedan sorprendidos visualmente con Winerim, les permite tener más información al instante.',
    name: 'Jason Tong',
    role: 'Chef y Propietario',
    restaurant: 'Singapore Garden',
  },
];

export const TestimonialsSection = ({
  title = 'Lo que dicen nuestros clientes',
  testimonials = defaultTestimonials,
}: Partial<TestimonialsSectionProps>) => (
  <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <p className="section-header text-primary">Testimonios</p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="card-elevated p-6 flex flex-col">
            <blockquote className="text-sm text-foreground/80 italic leading-relaxed flex-1 mb-4">
              "{t.quote}"
            </blockquote>
            <div className="border-t border-border pt-4">
              <p className="font-medium text-foreground text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
              <p className="text-xs text-primary font-medium">{t.restaurant}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
