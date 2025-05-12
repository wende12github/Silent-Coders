import clsx from "clsx";
import React from "react";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    const paddingLeftClass = icon ? "pl-10" : "pl-3";

    return (
      <>
        {icon ? (
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground dark:text-muted-foreground-dark">
              {icon}
            </div>
            <input
              type={type}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
                dark:border-input-dark dark:bg-background-dark dark:text-foreground-dark dark:ring-offset-background-dark dark:placeholder:text-muted-foreground-dark dark:focus-visible:ring-ring-dark
                ${className || ""} ${paddingLeftClass}`}
              ref={ref}
              {...props}
            />
          </div>
        ) : (
          <>
            <input
              type={type}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
                dark:border-input-dark dark:bg-background-dark dark:text-foreground-dark dark:ring-offset-background-dark dark:placeholder:text-muted-foreground-dark dark:focus-visible:ring-ring-dark
                ${className || ""} ${paddingLeftClass}`}
              ref={ref}
              {...props}
            />
          </>
        )}
      </>
    );
  }
);

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
          dark:border-input-dark dark:bg-background-dark dark:text-foreground-dark dark:ring-offset-background-dark dark:placeholder:text-muted-foreground-dark dark:focus-visible:ring-ring-dark
          ${className || ""}`}
        ref={ref}
        {...props}
      />
    );
  }
);

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70
          text-foreground dark:text-foreground-dark
          ${className || ""}`}
        ref={ref}
        {...props}
      />
    );
  }
);

export interface RadioButtonProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const RadioButton = React.forwardRef<HTMLInputElement, RadioButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <label
        className={clsx(
          "flex items-center cursor-pointer text-sm font-medium text-foreground dark:text-foreground-dark",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <input
          type="radio"
          className={clsx(
            "peer h-4 w-4 rounded-full border border-input text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "dark:border-input-dark dark:text-primary-dark dark:ring-offset-background-dark dark:focus-visible:ring-ring-dark",
            className
          )}
          ref={ref}
          {...props}
        />

        {children && <span className="ml-2">{children}</span>}
      </label>
    );
  }
);
RadioButton.displayName = "RadioButton";

export { RadioButton };
