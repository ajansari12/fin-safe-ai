
import React from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export function Logo() {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <Shield className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold">ResilientFI</span>
    </Link>
  );
}
