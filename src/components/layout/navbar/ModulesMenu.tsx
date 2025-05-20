
import * as React from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface ModuleItem {
  title: string;
  href: string;
  description: string;
}

interface ModulesMenuProps {
  modules: ModuleItem[];
}

export function ModulesMenu({ modules }: ModulesMenuProps) {
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>Modules</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
          {modules.map((module) => (
            <ListItem
              key={module.title}
              title={module.title}
              href={module.href}
            >
              {module.description}
            </ListItem>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function ListItem({
  className,
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"a"> & {
  title: string;
}) {
  return (
    <li>
      <Link
        to={href || "/"}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          className
        )}
        {...props}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </Link>
    </li>
  );
}
