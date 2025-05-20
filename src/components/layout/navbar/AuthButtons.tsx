
import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AuthButtonsProps {
  className?: string;
}

export function AuthButtons({ className }: AuthButtonsProps) {
  return (
    <div className={className}>
      <Button asChild variant="outline" className="mr-2">
        <Link to="/login">Login</Link>
      </Button>
      <Button asChild>
        <Link to="/start">Get Started</Link>
      </Button>
    </div>
  );
}
