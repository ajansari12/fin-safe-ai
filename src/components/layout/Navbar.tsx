
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
    href: "/governance-framework",
    description: "Accountability structures, roles, and risk oversight policies.",
  },
  {
    title: "Self Assessment",
    href: "/risk-appetite",
    description: "Identify critical operations and assess current resilience posture.",
  },
  {
    title: "Impact Tolerances",
    href: "/impact-tolerances",
    description: "Define tolerable levels of disruption for critical operations.",
  },
  {
    title: "Business Functions",
    href: "/business-functions",
    description: "Map and manage critical business functions and services.",
  },
  {
    title: "Risk Management",
    href: "/controls-and-kri",
    description: "Identify, assess, and manage operational risks across the organization.",
  },
  {
    title: "Incident Management",
    href: "/incident-log",
    description: "Detect, respond to, and recover from operational disruptions.",
  },
  {
    title: "Third-Party Risk",
    href: "/third-party-risk",
    description: "Manage risks associated with third-party service providers.",
  },
  {
    title: "Compliance",
    href: "/audit-and-compliance",
    description: "Track and manage regulatory compliance requirements.",
  },
];

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/compliance", label: "Compliance" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
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
