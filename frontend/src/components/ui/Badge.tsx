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
    "inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variantStyles = {
    default: "border-transparent bg-blue-600 text-white hover:bg-blue-600/80",
    secondary:
      "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100/80",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-600/80",
    outline: "text-gray-900 border-gray-300",
    success: "border-transparent bg-green-500 text-white hover:bg-green-500/80",
    warning:
      "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80",
    info: "border-transparent bg-blue-500 text-white hover:bg-blue-500/80",
    ghost: "border-transparent",
  };
  const sizeVariants = {
    default: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-[0.8px] text-sm",
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${
        sizeVariants[size]
      } ${className || ""}`}
    >
      {children}
    </span>
  );
};
