
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
      <SheetContent side="right" className="w-80 flex flex-col h-full p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 px-6">
            <div className="py-4 space-y-1">
              <h3 className="font-medium text-sm text-muted-foreground mb-3">Modules</h3>
              {modules.map((module) => (
                <Link
                  key={module.href}
                  to={module.href}
                  className="block p-3 rounded-md hover:bg-muted transition-colors"
                  onClick={onClose}
                >
                  <div className="font-medium text-sm">{module.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {module.description}
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
          
          <div className="border-t px-6 py-4 bg-background">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login" onClick={onClose}>Sign In</Link>
              </Button>
              <Button size="sm" asChild>
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
