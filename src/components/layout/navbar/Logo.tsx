
import React from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Logo() {
  const { isAuthenticated } = useAuth();
  const logoPath = isAuthenticated ? "/app/dashboard" : "/";

  return (
    <Link to={logoPath} className="flex items-center space-x-2">
      <Shield className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold">ResilientFI</span>
    </Link>
  );
}
