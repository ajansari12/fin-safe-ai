
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Module {
  title: string;
  href: string;
  description: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  modules: Module[];
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, modules, onClose }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-[90vw] sm:w-80 md:w-96 lg:w-80 max-w-sm sm:max-w-md flex flex-col h-full p-0"
      >
        <SheetHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0">
          <SheetTitle className="text-base sm:text-lg">Navigation</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6">
            <div className="py-3 sm:py-4 space-y-1">
              <h3 className="font-medium text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                Modules
              </h3>
              {modules.map((module) => (
                <Link
                  key={module.href}
                  to={module.href}
                  className="block p-2.5 sm:p-3 rounded-md hover:bg-muted transition-colors active:bg-muted/70"
                  onClick={onClose}
                >
                  <div className="font-medium text-sm sm:text-base">{module.title}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                    {module.description}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="border-t px-4 sm:px-6 py-3 sm:py-4 bg-background flex-shrink-0">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" size="sm" className="h-9 sm:h-10 text-sm" asChild>
                <Link to="/login" onClick={onClose}>Sign In</Link>
              </Button>
              <Button size="sm" className="h-9 sm:h-10 text-sm" asChild>
                <Link to="/register" onClick={onClose}>Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
