import { useState, forwardRef } from "react";
import React from "react";

interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked: controlledChecked,
      onCheckedChange,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [uncontrolledChecked, setUncontrolledChecked] = useState(false);

    const isChecked =
      controlledChecked !== undefined ? controlledChecked : uncontrolledChecked;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;

      const newCheckedState = !isChecked;

      if (controlledChecked === undefined) {
        setUncontrolledChecked(newCheckedState);
      }

      if (onCheckedChange) {
        onCheckedChange(newCheckedState);
      }

      if (props.onClick) {
        props.onClick(event);
      }
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-disabled={disabled}
        onClick={handleClick}
        ref={ref}
        className={`
            peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center
            rounded-full border-2 border-transparent transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            focus-visible:ring-offset-2 focus-visible:ring-offset-background
            disabled:cursor-not-allowed disabled:opacity-50
            ${
              isChecked
                ? "bg-primary dark:bg-primary-dark"
                : "bg-input dark:bg-input-dark"
            }
            dark:focus-visible:ring-ring-dark dark:focus-visible:ring-offset-background-dark
            ${className || ""}
          `}
        disabled={disabled}
        {...props}
      >
        <span
          className={`
              pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0
              transition-transform
              bg-background dark:bg-background-dark
              ${isChecked ? "translate-x-5" : "translate-x-0"}
            `}
        />
      </button>
    );
  }
);

export default Switch;
