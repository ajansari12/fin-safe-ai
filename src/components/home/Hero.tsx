
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, AlertTriangle, BarChart } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { DecorativeBg } from "@/components/ui/decorative-background";

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Trigger animations after component mounts
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      <DecorativeBg variant="dots" className="opacity-50" />
      
      <div className="container mx-auto px-4 pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div 
              className={`inline-flex items-center px-4 py-2 mb-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 transition-all duration-700 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
            >
              <Shield className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">OSFI E-21 Compliant</span>
            </div>
            
            <h1 
              className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200 transition-all duration-700 delay-150 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
            >
              Operational Resilience, Simplified
            </h1>
            
            <p 
              className={`text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-8 max-w-xl transition-all duration-700 delay-300 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
            >
              AI-powered risk management platform built specifically for Canadian financial institutions to achieve compliance with OSFI guidelines.
            </p>
            
            <div 
              className={`flex flex-wrap gap-4 transition-all duration-700 delay-450 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
            >
              <Button asChild size="lg" className="text-base rounded-xl">
                <Link to="/integration-framework">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base rounded-xl">
                <Link to="/integration-framework">View Integration Framework</Link>
              </Button>
            </div>

            <div 
              className={`mt-12 grid grid-cols-2 gap-6 transition-all duration-700 delay-600 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
              }`}
            >
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h3 className="font-medium">OSFI E-21 Compliant</h3>
                  <p className="text-sm text-muted-foreground">
                    Built to meet all OSFI operational resilience requirements
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h3 className="font-medium">AI-Powered Workflows</h3>
                  <p className="text-sm text-muted-foreground">
                    Intelligent assistance for risk assessment and documentation
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h3 className="font-medium">Integration Framework</h3>
                  <p className="text-sm text-muted-foreground">
                    Seamless connectivity with financial institution systems
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h3 className="font-medium">Third-Party Risk Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage vendors according to B-10 guidelines
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            className={`relative lg:block transition-all duration-1000 delay-300 ${
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="absolute -left-4 -top-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse-slow dark:bg-blue-800 dark:opacity-50"></div>
            <div className="absolute -right-4 -bottom-4 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse-slow dark:bg-teal-800 dark:opacity-50"></div>
            <div className="relative bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden transition-all hover:shadow-2xl duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium">Integration Overview</h3>
                  <p className="text-sm text-muted-foreground">System connectivity status</p>
                </div>
                <BarChart className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Core Banking System</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Connected
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Real-time data synchronization active</p>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">ERP Integration</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Pending
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Configuration in progress</p>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Document Management</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Ready
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Available for configuration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
