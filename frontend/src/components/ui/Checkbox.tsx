import React from "react";
import { Check } from "lucide-react";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", checked, onChange, id, ...props }, ref) => {
    return (
      <div className="inline-flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          id={id}
          ref={ref}
          checked={checked}
          onChange={onChange}
          className={`peer hidden ${className}`}
          {...props}
        />
        <label htmlFor={id} className="h-4 w-4 flex items-center justify-center border border-primary rounded-sm peer-checked:bg-primary text-white">
          {checked && <Check className="h-3 w-3" />}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
