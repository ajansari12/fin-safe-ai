
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { AIAssistantProvider } from "@/components/ai-assistant";
import { AIAssistantButton } from "@/components/ai-assistant";
import { AIAssistantDialog } from "@/components/ai-assistant";

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <AIAssistantProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <AIAssistantButton />
        <AIAssistantDialog />
      </div>
    </AIAssistantProvider>
  );
};

export default PageLayout;
