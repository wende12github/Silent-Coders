import { clsx } from "clsx";

interface BadgeProps {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info"
    | "ghost";
  children: React.ReactNode;
  className?: string;
  size?: "default" | "lg";
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "default",
  children,
  className,
}) => {
  const baseStyles =
    "inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-ring-dark dark:focus:ring-offset-background-dark";
  const variantStyles = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 dark:bg-primary-dark dark:text-primary-foreground-dark dark:hover:bg-primary-dark/80",
    secondary:
      "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-secondary-dark dark:text-secondary-foreground-dark dark:hover:bg-secondary-dark/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 dark:bg-destructive-dark dark:text-destructive-foreground-dark dark:hover:bg-destructive-dark/80",
    outline: "text-foreground border-border dark:text-foreground-dark dark:border-border-dark",
    success: "border-transparent bg-green-500 text-white hover:bg-green-500/80 dark:bg-green-600 dark:hover:bg-green-600/80", 
    warning:
      "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80 dark:bg-yellow-600 dark:hover:bg-yellow-600/80",
    info: "border-transparent bg-blue-500 text-white hover:bg-blue-500/80 dark:bg-blue-600 dark:hover:bg-blue-600/80",
    ghost: "border-transparent text-foreground dark:text-foreground-dark",
  };
  const sizeVariants = {
    default: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-[0.8px] text-sm",
  };

  return (
    <span
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeVariants[size],
        className
      )}
    >
      {children}
    </span>
  );
};
