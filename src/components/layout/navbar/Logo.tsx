
import * as React from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Shield className="h-6 w-6 text-primary" />
      <Link to="/" className="text-xl font-bold tracking-tight">
        ResilientFI
      </Link>
    </div>
  );
}
