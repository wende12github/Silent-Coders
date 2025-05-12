import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { forwardRef } from "react";

interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  icon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  children,
  placeholder,
  className,
  triggerClassName,
  contentClassName,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleTriggerClick = () => {
    setIsOpen((prev) => !prev);
  };

  const handleItemClick = (itemValue: string) => {
    onValueChange(itemValue);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedItem = React.Children.toArray(children).find(
    (child: any) => child.props.value === value
  );
  const displayedValue = selectedItem
    ? (selectedItem as any).props.children
    : placeholder;

  return (
    <div ref={wrapperRef} className={`relative ${className || ""}`}>
      <button
        type="button"
        className={`flex h-10 cursor-pointer w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1
          border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground
          dark:border-input-dark dark:bg-background-dark dark:text-foreground-dark dark:ring-offset-background-dark dark:placeholder:text-muted-foreground-dark dark:focus-visible:ring-ring-dark dark:hover:bg-accent-dark dark:hover:text-accent-foreground-dark
          ${triggerClassName || ""}`}
        onClick={handleTriggerClick}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex gap-2 items-center">
          {icon && (
            <span className="text-muted-foreground dark:text-muted-foreground-dark">
              {icon}
            </span>
          )}
          <span className="flex justify-center items-center">
            {displayedValue}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 opacity-50 transition-transform duration-200
            text-muted-foreground dark:text-muted-foreground-dark
            ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="select-dropdown"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border shadow-md
                border-border bg-popover text-popover-foreground
                dark:border-border-dark dark:bg-popover-dark dark:text-popover-foreground-dark
                ${contentClassName || ""}`}
            >
              {React.Children.map(children, (child: any) => {
                if (child.type.displayName === "SelectItem") {
                  return React.cloneElement(child, {
                    onClick: () => handleItemClick(child.props.value),
                    isSelected: child.props.value === value,
                  });
                }
                return null;
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, onClick, isSelected, ...props }, ref) => {
    return (
      <div
        role="option"
        aria-selected={isSelected}
        className={`relative flex cursor-pointer w-full select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50
          text-foreground hover:bg-accent focus:bg-accent hover:text-accent-foreground focus:text-accent-foreground
          dark:text-foreground-dark dark:hover:bg-accent-dark dark:focus:bg-accent-dark dark:hover:text-accent-foreground-dark dark:focus:text-accent-foreground-dark
          ${
            isSelected
              ? "bg-accent text-accent-foreground dark:bg-accent-dark dark:text-accent-foreground-dark"
              : ""
          }
          ${className || ""}`}
        onClick={onClick}
        ref={ref}
        {...props}
      >
        {isSelected && (
          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-primary dark:text-primary-dark">
            <Check className="h-4 w-4" />
          </span>
        )}
        {children}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";
