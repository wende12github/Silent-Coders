import React, { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";

interface DropdownMenuProps {
  children: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  let trigger: React.ReactNode = null;
  let content: React.ReactNode = null;

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === DropdownMenuTrigger) {
        trigger = child;
      } else if (child.type === DropdownMenuContent) {
        content = child;
      }
    }
  });

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

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative size-fit" ref={wrapperRef}>
      {trigger && (
        <div onClick={handleTriggerClick}>
          {(trigger as React.ReactElement<any>).props.children}
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={handleClose}></div>

            <motion.div
              className="absolute z-30 origin-top-right right-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {content &&
                React.cloneElement(content as React.ReactElement<any>, {
                  onClose: handleClose,
                })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  asChild = false,
}) => {
  if (asChild && React.isValidElement(children)) {
    return children;
  }

  return <div>{children}</div>;
};

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
  onClose?: () => void;
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  align = "end",
  className,
  onClose,
}) => {
  const alignClass = align === "end" ? "right-0" : "left-0";

  return (
    <div
      className={clsx(
        "absolute z-30 mt-2 w-48 rounded-md border border-border bg-popover text-popover-foreground shadow-lg p-1",
        "dark:border-border-dark dark:bg-popover-dark dark:text-popover-foreground-dark",
        alignClass,
        className
      )}
    >
      {React.Children.map(children, (child: any) => {
        if (React.isValidElement(child) && child.type === DropdownMenuItem) {
          return (
            <DropdownMenuItem {...(child.props as Object)} onClose={onClose} />
          );
        }

        return child;
      })}
    </div>
  );
};

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: () => void;
  onClose?: () => void;
  inset?: boolean;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  className,
  onClick,
  onClose,
  inset,
  ...props
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div
      className={clsx(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "text-foreground hover:bg-accent focus:bg-accent hover:text-accent-foreground focus:text-accent-foreground",
        "dark:text-foreground-dark dark:hover:bg-accent-dark dark:focus:bg-accent-dark dark:hover:text-accent-foreground-dark dark:focus:text-accent-foreground-dark",
        inset && "pl-8",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
};

interface DropdownMenuLabelProps {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
}

export const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({
  children,
  className,
  inset,
}) => (
  <div
    className={clsx(
      "px-2 py-1.5 text-sm font-semibold",
      "text-foreground dark:text-foreground-dark",
      inset && "pl-8",
      className
    )}
  >
    {children}
  </div>
);

interface DropdownMenuSeparatorProps {
  className?: string;
}

export const DropdownMenuSeparator: React.FC<DropdownMenuSeparatorProps> = ({
  className,
}) => (
  <div
    className={clsx("-mx-1 my-1 h-px bg-border dark:bg-border-dark", className)}
  />
);
