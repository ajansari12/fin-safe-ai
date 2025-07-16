
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
// TODO: Remove AuthContext.tsx once all files migrated to EnhancedAuthContext
import { useAuth } from "@/contexts/EnhancedAuthContext";

interface AuthButtonsProps {
  className?: string;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ className }) => {
  const { isAuthenticated, logout } = useAuth();
  
  // Reduced logging in production to prevent sensitive information exposure
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 AuthButtons rendering, isAuthenticated:', isAuthenticated);
  }

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
