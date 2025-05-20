
import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

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
  const { isAuthenticated, logout } = useAuth();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 top-16 z-50 bg-background pt-4 md:hidden">
      <nav className="container grid gap-6 px-4">
        <Link
          to="/features"
          className="text-lg font-medium"
          onClick={onClose}
        >
          Features
        </Link>
        
        <Link
          to="/compliance"
          className="text-lg font-medium"
          onClick={onClose}
        >
          Compliance
        </Link>
        
        <Link
          to="/about"
          className="text-lg font-medium"
          onClick={onClose}
        >
          About
        </Link>
        
        <Link
          to="/contact"
          className="text-lg font-medium"
          onClick={onClose}
        >
          Contact
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
        
        <div className="flex flex-col gap-2 mt-4">
          {isAuthenticated ? (
            <>
              <Button asChild>
                <Link to="/dashboard" onClick={onClose}>Dashboard</Link>
              </Button>
              <Button variant="outline" onClick={() => { logout(); onClose(); }}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link to="/auth/login" onClick={onClose}>Login</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/register" onClick={onClose}>Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
