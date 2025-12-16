import { 
  Eye, 
  Shield, 
  BarChart3, 
  Users, 
  MapPinned, 
  Bell,
  FileCheck,
  Smartphone
} from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Full Transparency",
    description: "Track every report from submission to resolution with complete visibility.",
  },
  {
    icon: Shield,
    title: "Anonymous Reporting",
    description: "Submit reports anonymously if you prefer to protect your identity.",
  },
  {
    icon: BarChart3,
    title: "Data-Driven Insights",
    description: "Ministry uses collected data for evidence-based policy decisions.",
  },
  {
    icon: Users,
    title: "Citizen Participation",
    description: "Empower communities to actively participate in environmental protection.",
  },
  {
    icon: MapPinned,
    title: "GIS Mapping",
    description: "View all reports on an interactive map with hotspot identification.",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    description: "Receive SMS, email, and in-app updates on your report status.",
  },
  {
    icon: FileCheck,
    title: "Evidence Upload",
    description: "Attach photos and videos to strengthen your environmental reports.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Access the platform from any device - desktop, tablet, or smartphone.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-secondary/30 section-pattern">
      <div className="container-gov">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Why Use ECSRS?
          </h2>
          <p className="text-lg text-muted-foreground">
            A modern platform designed to make environmental reporting 
            simple, transparent, and effective for all citizens.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-background rounded-xl p-6 border border-border hover:border-primary/30 hover:shadow-gov-lg transition-all duration-300 group animate-fade-up"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>

              <h3 className="text-lg font-serif font-bold text-foreground mb-2">
                {feature.title}
              </h3>

              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
