import { Quote } from "lucide-react";
import commissionerImage from "@/assets/commissioner.png";

const CommissionerSection = () => {
  return (
    <section className="py-20 bg-secondary/30 section-pattern">
      <div className="container-gov">
        <div className="max-w-5xl mx-auto">
          <div className="bg-background rounded-3xl shadow-gov-xl overflow-hidden">
            <div className="grid md:grid-cols-5 gap-0">
              {/* Image Column */}
              <div className="md:col-span-2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-10" />
                <img
                  src={commissionerImage}
                  alt="Dr. Nura Ibrahim Dandoka - Commissioner of Environment & Climate Change"
                  className="w-full h-full object-cover min-h-[400px]"
                />
                {/* Nigerian Flag Accent */}
                <div className="absolute bottom-0 left-0 right-0 h-2 flex z-20">
                  <div className="flex-1 bg-primary" />
                  <div className="flex-1 bg-background" />
                  <div className="flex-1 bg-primary" />
                </div>
              </div>

              {/* Content Column */}
              <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center">
                <div className="space-y-6">
                  <Quote className="w-12 h-12 text-primary/20" />
                  
                  <blockquote className="text-xl md:text-2xl font-serif text-foreground leading-relaxed">
                    "Welcome to the Environmental Complaints & Sanitation Reporting System. 
                    Together, we can protect our environment and ensure a{" "}
                    <span className="text-primary font-semibold">cleaner</span>,{" "}
                    <span className="text-primary font-semibold">healthier</span> Jigawa State. 
                    Your voice matters in building a sustainable future for our communities."
                  </blockquote>

                  <div className="pt-4 border-t border-border">
                    <p className="font-serif font-bold text-lg text-foreground">
                      Dr. Nura Ibrahim Dandoka
                    </p>
                    <p className="text-muted-foreground">
                      Hon. Commissioner, Ministry of Environment & Climate Change
                    </p>
                    <p className="text-sm text-primary font-medium mt-1">
                      Jigawa State Government
                    </p>
                  </div>

                  {/* Trust badges */}
                  <div className="flex items-center gap-4 pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold text-xs">JS</span>
                      </div>
                      <span>Official Portal</span>
                    </div>
                    <div className="w-px h-6 bg-border" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>Active Service</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommissionerSection;
