
import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Logo } from "./navbar/Logo";
import { ModulesMenu } from "./navbar/ModulesMenu";
import { NavLinks } from "./navbar/NavLinks";
import AuthButtons from "./navbar/AuthButtons";
import { MobileMenuToggle } from "./navbar/MobileMenuToggle";
import MobileMenu from "./navbar/MobileMenu";

const modules = [
  {
    title: "Governance",
    href: "/modules#governance",
    description: "Accountability structures, roles, and risk oversight policies.",
  },
  {
    title: "Risk Appetite",
    href: "/modules#risk-appetite",
    description: "Define and monitor your organization's risk tolerance levels.",
  },
  {
    title: "Impact Tolerances",
    href: "/modules#impact-tolerances",
    description: "Define tolerable levels of disruption for critical operations.",
  },
  {
    title: "Business Functions",
    href: "/modules#business-functions",
    description: "Map and manage critical business functions and services.",
  },
  {
    title: "Controls & KRI",
    href: "/modules#controls-kri",
    description: "Implement and monitor operational controls with Key Risk Indicators.",
  },
  {
    title: "Incident Management",
    href: "/modules#incident-management",
    description: "Detect, respond to, and recover from operational disruptions.",
  },
  {
    title: "Third-Party Risk",
    href: "/modules#third-party-risk",
    description: "Manage risks associated with third-party service providers.",
  },
  {
    title: "Audit & Compliance",
    href: "/modules#audit-compliance",
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
