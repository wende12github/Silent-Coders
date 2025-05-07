import * as React from "react";
import { clsx } from "clsx";

const variantClasses = {
  default:
    "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg dark:bg-primary-dark dark:text-primary-foreground-dark dark:hover:bg-primary-dark/90",
  destructive:
    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 dark:bg-destructive-dark dark:text-destructive-foreground-dark dark:hover:bg-destructive-dark/90",
  outline:
    "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md dark:border-input-dark dark:bg-background-dark dark:hover:bg-accent-dark dark:hover:text-accent-foreground-dark",
  secondary:
    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md dark:bg-secondary-dark dark:text-secondary-foreground-dark dark:hover:bg-secondary-dark/80",
  ghost:
    "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent-dark dark:hover:text-accent-foreground-dark",
  link: "text-primary underline-offset-4 hover:underline dark:text-primary-dark",
  gradient:
    "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md hover:shadow-lg hover:opacity-90 dark:from-primary-dark dark:to-primary-dark/80 dark:text-primary-foreground-dark",
};

const sizeClasses = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8 text-base",
  icon: "h-10 w-10",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "gradient";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] dark:ring-offset-background-dark dark:focus-visible:ring-ring-dark";

    const Comp = asChild ? React.Fragment : "button";

    const combined = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    return <Comp {...props} ref={ref} className={combined} />;
  }
);

export default Button;
