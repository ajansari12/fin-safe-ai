
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/EnhancedAuthContext";

interface AuthButtonsProps {
  className?: string;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ className }) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isAuthenticated) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/app/dashboard">Dashboard</Link>
          </Button>
          <Button onClick={handleLogout} variant="ghost">
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
          <Link to="/auth/login">Login</Link>
        </Button>
        <Button asChild>
          <Link to="/auth/register">Get Started</Link>
        </Button>
      </div>
    </div>
  );
};

export default AuthButtons;
