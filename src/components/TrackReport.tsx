import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";

const TrackReport = () => {
  const [trackingId, setTrackingId] = useState("");

  return (
    <section id="track" className="py-20 bg-background">
      <div className="container-gov">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary to-green-dark rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-300/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <span className="inline-block px-4 py-1.5 bg-primary-foreground/10 text-primary-foreground text-sm font-semibold rounded-full mb-4">
                Track Your Report
              </span>

              <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4">
                Check Your Report Status
              </h2>

              <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Enter your unique tracking ID to see the current status of your environmental complaint.
              </p>

              {/* Search Input */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Enter Tracking ID (e.g., ECSRS-2024-0001)"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-xl bg-background text-foreground placeholder:text-muted-foreground border-0 focus:ring-2 focus:ring-primary-foreground/50 outline-none"
                  />
                </div>
                <Button variant="hero" size="xl">
                  Track
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Status Legend */}
              <div className="flex flex-wrap justify-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <span className="w-3 h-3 bg-yellow-400 rounded-full" />
                  Submitted
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <span className="w-3 h-3 bg-blue-400 rounded-full" />
                  Assigned
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <span className="w-3 h-3 bg-orange-400 rounded-full" />
                  In Progress
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <span className="w-3 h-3 bg-green-400 rounded-full" />
                  Resolved
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrackReport;
