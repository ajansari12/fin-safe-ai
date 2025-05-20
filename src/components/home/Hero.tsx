
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, AlertTriangle, BarChart } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="section-container pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Shield className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">OSFI E-21 Compliant</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 dark:from-blue-400 dark:to-blue-200">
              Operational Resilience, Simplified
            </h1>
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-8 max-w-xl">
              AI-powered risk management platform built specifically for Canadian financial institutions to achieve compliance with OSFI guidelines.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="text-base">
                <Link to="/start">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link to="/demo">Request Demo</Link>
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-6">
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
                  <h3 className="font-medium">Comprehensive Reporting</h3>
                  <p className="text-sm text-muted-foreground">
                    Audit-ready reports that satisfy regulatory requirements
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
          
          <div className="relative lg:block">
            <div className="absolute -left-4 -top-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse-slow dark:bg-blue-800 dark:opacity-50"></div>
            <div className="absolute -right-4 -bottom-4 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse-slow dark:bg-teal-800 dark:opacity-50"></div>
            <div className="relative bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium">Critical Risk Overview</h3>
                  <p className="text-sm text-muted-foreground">Enterprise-wide risk summary</p>
                </div>
                <BarChart className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Cyber Resilience</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      High Risk
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="mt-2 flex items-center text-xs">
                    <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
                    <span className="text-muted-foreground">4 critical findings require attention</span>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Third Party Vendors</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Medium Risk
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <div className="mt-2 flex items-center text-xs">
                    <AlertTriangle className="h-3 w-3 text-yellow-500 mr-1" />
                    <span className="text-muted-foreground">8 vendors require reassessment</span>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Business Continuity</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Low Risk
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  <div className="mt-2 flex items-center text-xs">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-muted-foreground">Plans updated and tested within last 90 days</span>
                  </div>
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
