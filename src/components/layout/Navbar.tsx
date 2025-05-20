
import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Menu, X, Shield } from "lucide-react";

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

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <Link to="/" className="text-xl font-bold tracking-tight">
            ResilientFI
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex">
          <NavigationMenu>
            <NavigationMenuList>
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
              <NavigationMenuItem>
                <Link to="/dashboard" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Dashboard
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/reports" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Reports
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/ai-assistant" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    AI Assistant
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <Button asChild variant="outline" className="mr-2">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/start">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-background pt-4 md:hidden">
          <nav className="container grid gap-6 px-4">
            <Link
              to="/dashboard"
              className="text-lg font-medium"
              onClick={toggleMobileMenu}
            >
              Dashboard
            </Link>
            <div>
              <h3 className="text-lg font-medium mb-2">Modules</h3>
              <div className="grid gap-3">
                {modules.map((module) => (
                  <Link
                    key={module.title}
                    to={module.href}
                    className="text-muted-foreground hover:text-foreground"
                    onClick={toggleMobileMenu}
                  >
                    {module.title}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              to="/reports"
              className="text-lg font-medium"
              onClick={toggleMobileMenu}
            >
              Reports
            </Link>
            <Link
              to="/ai-assistant"
              className="text-lg font-medium"
              onClick={toggleMobileMenu}
            >
              AI Assistant
            </Link>
            <div className="flex flex-col gap-2 mt-4">
              <Button asChild variant="outline">
                <Link to="/login" onClick={toggleMobileMenu}>Login</Link>
              </Button>
              <Button asChild>
                <Link to="/start" onClick={toggleMobileMenu}>Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

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
      <NavigationMenuLink asChild>
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
      </NavigationMenuLink>
    </li>
  );
}

export function navigationMenuTriggerStyle() {
  return cn(
    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
  );
}

export default Navbar;
