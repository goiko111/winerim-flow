interface StatsBarProps {
  stats: { value: string; label: string }[];
}

const defaultStats = [
  { value: '+1.000', label: 'bodegas gestionadas' },
  { value: '15', label: 'países' },
  { value: '+15%', label: 'aumento ticket medio' },
];

export const StatsBar = ({ stats = defaultStats }: Partial<StatsBarProps>) => (
  <div className="py-10 px-4 sm:px-6 lg:px-8 border-y border-border bg-card">
    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
      {stats.map((s, i) => (
        <div key={i} className="text-center">
          <p className="font-display text-3xl font-bold text-primary">{s.value}</p>
          <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  </div>
);
