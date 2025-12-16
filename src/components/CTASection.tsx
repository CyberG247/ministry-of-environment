import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mail, MapPin } from "lucide-react";

const CTASection = () => {
  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container-gov">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - CTA */}
          <div className="space-y-6">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full">
              Take Action Today
            </span>

            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              Help Us Build a{" "}
              <span className="text-primary">Cleaner Jigawa</span>
            </h2>

            <p className="text-lg text-muted-foreground">
              Every report matters. Your participation helps us identify environmental 
              hotspots, allocate resources effectively, and create a healthier environment 
              for all Jigawa State citizens.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="xl">
                Submit a Report
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="xl">
                Learn More
              </Button>
            </div>
          </div>

          {/* Right - Contact Info */}
          <div className="bg-secondary/50 rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-serif font-bold text-foreground">
              Contact the Ministry
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Phone</p>
                  <p className="text-muted-foreground">+234 (0) 800 123 4567</p>
                  <p className="text-muted-foreground">+234 (0) 800 765 4321</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Email</p>
                  <p className="text-muted-foreground">environment@jigawastate.gov.ng</p>
                  <p className="text-muted-foreground">complaints@ecsrs.jigawa.gov.ng</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Address</p>
                  <p className="text-muted-foreground">
                    Ministry of Environment & Climate Change<br />
                    Government House, Dutse<br />
                    Jigawa State, Nigeria
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Office Hours:</span>{" "}
                Monday - Friday, 8:00 AM - 4:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
