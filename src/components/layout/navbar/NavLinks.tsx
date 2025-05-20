
import * as React from "react";
import { Link } from "react-router-dom";
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
  return (
    <>
      {links.map((link) => (
        <NavigationMenuItem key={link.href}>
          <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
            <Link to={link.href}>{link.label}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      ))}
    </>
  );
}
