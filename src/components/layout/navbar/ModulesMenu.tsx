
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
        <div className="w-[600px] p-4">
          <div className="mb-4 pb-4 border-b">
            <h3 className="text-lg font-semibold">Explore Our Modules</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive risk management solutions for financial institutions
            </p>
          </div>
          <ul className="grid gap-3 md:grid-cols-2">
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
          <div className="mt-4 pt-4 border-t">
            <Link
              to="/modules"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all modules →
            </Link>
          </div>
        </div>
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
