import * as React from "react";
import { Check } from "lucide-react";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", checked, onChange, id, ...props }, ref) => {
    return (
      <div
        className={`inline-flex items-center space-x-2 cursor-pointer ${className}`}
      >
        <input
          type="checkbox"
          id={id}
          ref={ref}
          checked={checked}
          onChange={onChange}
          className="peer hidden"
          {...props}
        />
        <label
          htmlFor={id}
          className={`
            h-4 w-4 flex items-center justify-center border rounded-sm
            border-primary text-primary-foreground peer-checked:bg-primary peer-checked:border-primary
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50
            dark:border-primary-dark dark:text-primary-foreground-dark dark:peer-checked:bg-primary-dark dark:peer-checked:border-primary-dark
            dark:focus-visible:ring-ring-dark dark:focus-visible:ring-offset-background-dark
          `}
        >
          {checked && <Check className="h-3 w-3" />}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
