import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Camera } from "lucide-react";
import heroImage from "@/assets/hero-environment.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Clean environment in Jigawa State"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="container-gov relative z-10 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text */}
          <div className="text-background space-y-6">
            <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm px-4 py-2 rounded-full animate-fade-up">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Official Government Portal</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight animate-fade-up animation-delay-100">
              Report Environmental{" "}
              <span className="text-green-300">Issues</span> in{" "}
              <span className="text-green-300">Jigawa State</span>
            </h1>

            <p className="text-lg md:text-xl text-background/90 max-w-xl animate-fade-up animation-delay-200">
              Join us in protecting our environment. Report illegal dumping, blocked drains, 
              noise pollution, and sanitation issues directly to the Ministry.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up animation-delay-300">
              <Button variant="hero" size="xl">
                <MapPin className="w-5 h-5" />
                Report an Issue
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="heroOutline" size="xl">
                <Camera className="w-5 h-5" />
                Track Your Report
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-background/20 animate-fade-up animation-delay-400">
              <div>
                <p className="text-3xl md:text-4xl font-bold text-green-300">2,500+</p>
                <p className="text-sm text-background/70">Issues Resolved</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-green-300">27</p>
                <p className="text-sm text-background/70">LGAs Covered</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-bold text-green-300">24hrs</p>
                <p className="text-sm text-background/70">Avg Response</p>
              </div>
            </div>
          </div>

          {/* Right Column - Visual element placeholder */}
          <div className="hidden lg:block relative animate-fade-up animation-delay-500">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-green-400/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-green-300/20 rounded-full blur-3xl" />
              
              {/* Quick action cards */}
              <div className="relative space-y-4">
                <div className="bg-background/10 backdrop-blur-lg rounded-2xl p-6 border border-background/20 animate-float">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-background">GPS Location</p>
                      <p className="text-sm text-background/70">Auto-detect incident location</p>
                    </div>
                  </div>
                </div>

                <div className="bg-background/10 backdrop-blur-lg rounded-2xl p-6 border border-background/20 ml-8 animate-float" style={{ animationDelay: "0.5s" }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                      <Camera className="w-6 h-6 text-background" />
                    </div>
                    <div>
                      <p className="font-semibold text-background">Photo Evidence</p>
                      <p className="text-sm text-background/70">Upload images & videos</p>
                    </div>
                  </div>
                </div>

                <div className="bg-background/10 backdrop-blur-lg rounded-2xl p-6 border border-background/20 animate-float" style={{ animationDelay: "1s" }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center">
                      <ArrowRight className="w-6 h-6 text-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-background">Real-time Tracking</p>
                      <p className="text-sm text-background/70">Monitor your report status</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 50L48 45.7C96 41.3 192 32.7 288 29.2C384 25.7 480 27.3 576 35.8C672 44.3 768 59.7 864 62.5C960 65.3 1056 55.7 1152 49.2C1248 42.7 1344 39.3 1392 37.7L1440 36V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
