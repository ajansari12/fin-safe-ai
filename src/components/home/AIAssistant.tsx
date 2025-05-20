
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Bot, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const AIAssistant = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-secondary/10 text-secondary">
              <Bot className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">AI-Powered Assistant</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-6">
              Expert Guidance at Your Fingertips
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our AI assistant is trained on OSFI guidelines, ISO standards, and best practices in operational risk management to provide instant guidance and help you navigate complex regulatory requirements.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="mr-4 h-8 w-8 flex items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Regulatory Interpretation</h3>
                  <p className="text-muted-foreground">
                    Get clear explanations of OSFI guidelines and how they apply to your organization.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 h-8 w-8 flex items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Framework Development</h3>
                  <p className="text-muted-foreground">
                    Step-by-step guidance to create robust operational risk frameworks tailored to your institution.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 h-8 w-8 flex items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Documentation Support</h3>
                  <p className="text-muted-foreground">
                    Generate documentation templates and audit-ready reports with natural language prompts.
                  </p>
                </div>
              </div>
            </div>
            
            <Button asChild size="lg" className="text-base">
              <Link to="/ai-assistant">
                Try the AI Assistant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute -left-4 -top-4 w-64 h-64 bg-secondary rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-pulse-slow"></div>
            
            <Card className="rounded-lg border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
              <div className="p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center">
                  <Bot className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-medium">ResilientFI Assistant</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                  <div className="ml-4 bg-slate-100 dark:bg-slate-900 p-3 rounded-lg">
                    <p className="text-sm">How do I align our third-party risk management with OSFI B-10?</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="ml-4 bg-primary/10 dark:bg-primary/20 p-3 rounded-lg">
                    <p className="text-sm">
                      OSFI B-10 requires a comprehensive third-party risk management program with four key elements:
                    </p>
                    <ul className="list-disc pl-5 text-sm mt-2">
                      <li>Risk-based assessment of third-party arrangements</li>
                      <li>Formal due diligence process</li>
                      <li>Written contracts with clear service levels</li>
                      <li>Ongoing risk monitoring and oversight</li>
                    </ul>
                    <p className="text-sm mt-2">
                      I can help you implement each of these components. Would you like to start with a risk assessment framework?
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                  <div className="ml-4 bg-slate-100 dark:bg-slate-900 p-3 rounded-lg">
                    <p className="text-sm">Yes, please outline a risk assessment framework for our vendors.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="flex gap-2 items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-2">
                  <input 
                    type="text" 
                    placeholder="Type your question here..."
                    className="flex-grow bg-transparent text-sm border-none focus:outline-none p-1"
                  />
                  <Button size="sm" className="h-8 w-8 p-0">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;
