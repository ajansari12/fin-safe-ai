
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface MobileMenuToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileMenuToggle({ isOpen, onToggle }: MobileMenuToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden relative z-50 h-10 w-10"
      onClick={onToggle}
    >
      {isOpen ? (
        <X className="h-5 w-5 transition-transform duration-200" />
      ) : (
        <Menu className="h-5 w-5 transition-transform duration-200" />
      )}
    </Button>
  );
}
