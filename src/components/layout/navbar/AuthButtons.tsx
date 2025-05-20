
import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface AuthButtonsProps {
  className?: string;
}

export function AuthButtons({ className }: AuthButtonsProps) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className={className}>
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium hidden lg:inline-block">
            {user?.name}
          </span>
          <Button asChild variant="default" size="sm">
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      ) : (
        <>
          <Button asChild variant="outline" className="mr-2">
            <Link to="/auth/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/auth/register">Get Started</Link>
          </Button>
        </>
      )}
    </div>
  );
}
