
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AuthButtonsProps {
  className?: string;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ className }) => {
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link to="/login">Sign In</Link>
        </Button>
        <Button asChild>
          <Link to="/register">Get Started</Link>
        </Button>
      </div>
    </div>
  );
};

export default AuthButtons;
