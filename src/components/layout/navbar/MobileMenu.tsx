
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
      <SheetContent side="right" className="w-80">
        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">Modules</h3>
            {modules.map((module) => (
              <Link
                key={module.href}
                to={module.href}
                className="block p-2 rounded-md hover:bg-muted"
                onClick={onClose}
              >
                <div className="font-medium">{module.title}</div>
                <div className="text-sm text-muted-foreground">{module.description}</div>
              </Link>
            ))}
          </div>
          
          <div className="border-t pt-4">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login" onClick={onClose}>Sign In</Link>
              </Button>
              <Button asChild>
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
