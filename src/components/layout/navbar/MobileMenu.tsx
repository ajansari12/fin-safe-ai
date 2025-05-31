
import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight, Plus } from "lucide-react";

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
      <div className="h-full overflow-y-auto">
        <nav className="container grid gap-2 px-4">
          {/* Quick Action - One-tap incident log */}
          {isAuthenticated && (
            <div className="mb-6 p-4 bg-destructive/10 rounded-lg">
              <Button asChild className="w-full bg-destructive hover:bg-destructive/90 text-white">
                <Link to="/incident-log?quick=true" onClick={onClose}>
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Log Incident
                </Link>
              </Button>
            </div>
          )}
          
          {/* Main Navigation Links */}
          <Link
            to="/features"
            className="flex items-center justify-between py-3 px-4 text-lg font-medium rounded-lg hover:bg-accent transition-colors"
            onClick={onClose}
          >
            Features
            <ChevronRight className="h-4 w-4" />
          </Link>
          
          <Link
            to="/compliance"
            className="flex items-center justify-between py-3 px-4 text-lg font-medium rounded-lg hover:bg-accent transition-colors"
            onClick={onClose}
          >
            Compliance
            <ChevronRight className="h-4 w-4" />
          </Link>
          
          <Link
            to="/about"
            className="flex items-center justify-between py-3 px-4 text-lg font-medium rounded-lg hover:bg-accent transition-colors"
            onClick={onClose}
          >
            About
            <ChevronRight className="h-4 w-4" />
          </Link>
          
          <Link
            to="/contact"
            className="flex items-center justify-between py-3 px-4 text-lg font-medium rounded-lg hover:bg-accent transition-colors"
            onClick={onClose}
          >
            Contact
            <ChevronRight className="h-4 w-4" />
          </Link>
          
          {/* Modules Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 px-4">Modules</h3>
            <div className="grid gap-1">
              {modules.map((module) => (
                <Link
                  key={module.title}
                  to={module.href}
                  className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-accent transition-colors"
                  onClick={onClose}
                >
                  <div>
                    <div className="font-medium">{module.title}</div>
                    <div className="text-sm text-muted-foreground">{module.description}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
          
          {/* Auth Section */}
          <div className="flex flex-col gap-3 mt-8 px-4 pb-8">
            {isAuthenticated ? (
              <>
                <Button asChild size="lg" className="w-full">
                  <Link to="/dashboard" onClick={onClose}>Dashboard</Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={() => { logout(); onClose(); }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link to="/auth/login" onClick={onClose}>Login</Link>
                </Button>
                <Button asChild size="lg" className="w-full">
                  <Link to="/auth/register" onClick={onClose}>Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
