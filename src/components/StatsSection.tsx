import { TrendingUp, Clock, Users, MapPin } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "2,847",
    label: "Total Reports",
    description: "Environmental complaints received",
  },
  {
    icon: Clock,
    value: "92%",
    label: "Resolution Rate",
    description: "Successfully resolved cases",
  },
  {
    icon: Users,
    value: "15,000+",
    label: "Active Citizens",
    description: "Registered platform users",
  },
  {
    icon: MapPin,
    value: "27",
    label: "LGAs Covered",
    description: "Full state coverage",
  },
];

const StatsSection = () => {
  return (
    <section id="stats" className="py-16 bg-background border-y border-border">
      <div className="container-gov">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center group animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <stat.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <p className="text-4xl md:text-5xl font-serif font-bold text-primary mb-1">
                {stat.value}
              </p>
              <p className="text-lg font-semibold text-foreground mb-1">
                {stat.label}
              </p>
              <p className="text-sm text-muted-foreground">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
