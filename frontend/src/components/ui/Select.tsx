import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { forwardRef } from "react";

// --- Reusable Select Component ---
interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export const Select: React.FC<SelectProps> = ({
    value,
    onValueChange,
    children,
    placeholder,
    className,
    triggerClassName,
    contentClassName,
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
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
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
        className={`flex h-10 w-full items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 ${
          triggerClassName || ""
        }`}
        onClick={handleTriggerClick}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{displayedValue}</span>
        <ChevronDown
          className={`h-4 w-4 opacity-50 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
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
            className={`absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md border border-border bg-white shadow-md ${
              contentClassName || ""
            }`}
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
        className={`relative flex cursor-pointer w-full hover:bg-accent select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${
          isSelected ? "bg-gray-100 text-gray-900" : ""
        } ${className || ""}`}
        onClick={onClick}
        ref={ref}
        {...props}
      >
        {isSelected && (
          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <Check className="h-4 w-4" />
          </span>
        )}
        {children}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";
