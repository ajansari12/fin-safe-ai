
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface AuthButtonsProps {
  className?: string;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ className }) => {
  const { isAuthenticated, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/app/dashboard">Dashboard</Link>
          </Button>
          <Button onClick={logout} variant="ghost">
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link to="/auth/register">Get Started</Link>
        </Button>
      </div>
    </div>
  );
};

export default AuthButtons;
