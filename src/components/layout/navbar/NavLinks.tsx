
import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "./styles";

interface NavLink {
  href: string;
  label: string;
}

interface NavLinksProps {
  links: NavLink[];
}

export function NavLinks({ links }: NavLinksProps) {
  const location = useLocation();

  return (
    <>
      {links.map((link) => (
        <NavigationMenuItem key={link.href}>
          <NavigationMenuLink 
            className={navigationMenuTriggerStyle()} 
            active={location.pathname === link.href}
            asChild
          >
            <Link to={link.href}>{link.label}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      ))}
    </>
  );
}
