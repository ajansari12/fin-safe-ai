
import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Logo } from "./navbar/Logo";
import { ModulesMenu } from "./navbar/ModulesMenu";
import { NavLinks } from "./navbar/NavLinks";
import { AuthButtons } from "./navbar/AuthButtons";
import { MobileMenuToggle } from "./navbar/MobileMenuToggle";
import { MobileMenu } from "./navbar/MobileMenu";

const modules = [
  {
    title: "Governance",
    href: "/governance",
    description: "Accountability structures, roles, and risk oversight policies.",
  },
  {
    title: "Self Assessment",
    href: "/self-assessment",
    description: "Identify critical operations and assess current resilience posture.",
  },
  {
    title: "Risk Management",
    href: "/risk-management",
    description: "Identify, assess, and manage operational risks across the organization.",
  },
  {
    title: "Incident Management",
    href: "/incident-management",
    description: "Detect, respond to, and recover from operational disruptions.",
  },
  {
    title: "Third-Party Risk",
    href: "/third-party",
    description: "Manage risks associated with third-party service providers.",
  },
  {
    title: "ICT Risk",
    href: "/ict-risk",
    description: "Manage technology and cyber security risks per OSFI B-13 guidance.",
  },
];

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reports", label: "Reports" },
  { href: "/ai-assistant", label: "AI Assistant" },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              <ModulesMenu modules={modules} />
              <NavLinks links={navLinks} />
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <AuthButtons className="hidden md:block" />
          <MobileMenuToggle isOpen={isMobileMenuOpen} onToggle={toggleMobileMenu} />
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        modules={modules} 
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};

export default Navbar;
