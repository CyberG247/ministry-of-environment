import { FileText, MapPin, Clock, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: FileText,
    number: "01",
    title: "Submit Report",
    description: "Fill out a simple form with details about the environmental issue you've observed.",
  },
  {
    icon: MapPin,
    number: "02",
    title: "Location & Evidence",
    description: "GPS auto-captures your location. Upload photos or videos as evidence.",
  },
  {
    icon: Clock,
    number: "03",
    title: "Track Progress",
    description: "Receive a unique tracking ID and monitor your report status in real-time.",
  },
  {
    icon: CheckCircle,
    number: "04",
    title: "Resolution",
    description: "Field officers address the issue and you receive notification when resolved.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-300 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-200 rounded-full blur-3xl" />
      </div>

      <div className="container-gov relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary-foreground/10 text-primary-foreground text-sm font-semibold rounded-full mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-primary-foreground/80">
            Reporting environmental issues has never been easier. 
            Follow these four simple steps to make a difference.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative animate-fade-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-primary-foreground/20" />
              )}

              <div className="relative bg-primary-foreground/5 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-colors group">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  {step.number}
                </div>

                <div className="w-14 h-14 bg-primary-foreground/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>

                <h3 className="text-xl font-serif font-bold text-primary-foreground mb-2">
                  {step.title}
                </h3>

                <p className="text-primary-foreground/70 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
