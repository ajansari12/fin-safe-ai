
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-24 bg-primary text-white">
      <div className="section-container text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to strengthen your operational resilience?
        </h2>
        <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-8">
          Join leading Canadian financial institutions using ResilientFI to meet regulatory requirements and build robust operational risk management frameworks.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" variant="default" className="bg-white text-primary hover:bg-slate-100 text-base">
            <Link to="/start">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-base">
            <Link to="/demo">Request Demo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
