
import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";

interface AuthButtonsProps {
  className?: string;
}

export function AuthButtons({ className }: AuthButtonsProps) {
  const { user, profile, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className={className}>
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium hidden lg:inline-block">
            {profile?.full_name || user?.email}
          </span>
          <ThemeToggle />
          <Button asChild variant="default" size="sm">
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline">
            <Link to="/auth/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/auth/register">Get Started</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
