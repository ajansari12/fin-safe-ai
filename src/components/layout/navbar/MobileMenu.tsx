
import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  isOpen: boolean;
  modules: {
    title: string;
    href: string;
    description: string;
  }[];
  onClose: () => void;
}

export function MobileMenu({ isOpen, modules, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 top-16 z-50 bg-background pt-4 md:hidden">
      <nav className="container grid gap-6 px-4">
        <Link
          to="/dashboard"
          className="text-lg font-medium"
          onClick={onClose}
        >
          Dashboard
        </Link>
        <div>
          <h3 className="text-lg font-medium mb-2">Modules</h3>
          <div className="grid gap-3">
            {modules.map((module) => (
              <Link
                key={module.title}
                to={module.href}
                className="text-muted-foreground hover:text-foreground"
                onClick={onClose}
              >
                {module.title}
              </Link>
            ))}
          </div>
        </div>
        <Link
          to="/reports"
          className="text-lg font-medium"
          onClick={onClose}
        >
          Reports
        </Link>
        <Link
          to="/ai-assistant"
          className="text-lg font-medium"
          onClick={onClose}
        >
          AI Assistant
        </Link>
        <div className="flex flex-col gap-2 mt-4">
          <Button asChild variant="outline">
            <Link to="/login" onClick={onClose}>Login</Link>
          </Button>
          <Button asChild>
            <Link to="/start" onClick={onClose}>Get Started</Link>
          </Button>
        </div>
      </nav>
    </div>
  );
}
