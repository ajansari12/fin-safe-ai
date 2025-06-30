
import { cn } from "@/lib/utils";

interface DecorativeBgProps {
  variant?: "dots" | "grid" | "gradient";
  className?: string;
}

export const DecorativeBg = ({ variant = "dots", className }: DecorativeBgProps) => {
  const patterns = {
    dots: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 1px, transparent 1px)",
    grid: "linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)",
    gradient: "linear-gradient(45deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)",
  };

  const sizes = {
    dots: "20px 20px",
    grid: "20px 20px",
    gradient: "100% 100%",
  };

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none",
        className
      )}
      style={{
        backgroundImage: patterns[variant],
        backgroundSize: sizes[variant],
      }}
    />
  );
};
