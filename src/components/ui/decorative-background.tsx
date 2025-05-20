
import { cn } from "@/lib/utils";

interface DecorativeBgProps {
  className?: string;
  variant?: "dots" | "grid" | "waves" | "circles";
  color?: string;
  opacity?: number;
}

export function DecorativeBg({ 
  className, 
  variant = "dots", 
  color = "currentColor", 
  opacity = 0.05 
}: DecorativeBgProps) {
  const getPattern = () => {
    switch (variant) {
      case "dots":
        return (
          <pattern id="dots-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill={color} />
          </pattern>
        );
      case "grid":
        return (
          <pattern id="grid-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 0.5H40M0.5 0V40" stroke={color} strokeWidth="0.5" />
          </pattern>
        );
      case "waves":
        return (
          <pattern id="waves-pattern" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
            <path d="M0 10C20 5, 30 15, 50 10S80 5, 100 10" fill="none" stroke={color} strokeWidth="0.5" />
          </pattern>
        );
      case "circles":
        return (
          <pattern id="circles-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="50" cy="50" r="40" stroke={color} strokeWidth="0.5" fill="none" />
          </pattern>
        );
      default:
        return (
          <pattern id="default-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill={color} />
          </pattern>
        );
    }
  };

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity }}
        aria-hidden="true"
      >
        <defs>{getPattern()}</defs>
        <rect width="100%" height="100%" fill={`url(#${variant}-pattern)`} />
      </svg>
    </div>
  );
}
