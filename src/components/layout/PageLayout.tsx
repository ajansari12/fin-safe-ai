
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { AIAssistantProvider } from "@/components/ai-assistant";
import { AIAssistantButton } from "@/components/ai-assistant";
import { AIAssistantDialog } from "@/components/ai-assistant";
import { TooltipProvider } from "@/components/ui/tooltip";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <AIAssistantProvider>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <AIAssistantButton />
          <AIAssistantDialog />
        </div>
      </TooltipProvider>
    </AIAssistantProvider>
  );
};

export default PageLayout;
