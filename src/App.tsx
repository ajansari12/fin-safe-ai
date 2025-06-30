
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Index from "./pages/Index";
import IntegrationFramework from "./pages/IntegrationFramework";
import PersonalizedDashboard from "./pages/PersonalizedDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/integration-framework" element={<IntegrationFramework />} />
          <Route path="/personalized-dashboard" element={<PersonalizedDashboard />} />
          {navItems.map(({ to, page: PageComponent }) => (
            <Route key={to} path={to} element={<PageComponent />} />
          ))}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
