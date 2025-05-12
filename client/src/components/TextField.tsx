import * as React from "react";
import { cn } from "@/lib/utils";

type TextFieldProps = {
  label?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  type?: string;
  ariaLabel?: string;
  tabIndex?: number;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
};

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      required = false,
      placeholder,
      value,
      onChange,
      name,
      type = "text",
      ariaLabel,
      tabIndex = 0,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const inputId = React.useId();
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={ariaLabel || label}
          aria-invalid={!!error}
          aria-required={required}
          tabIndex={tabIndex}
          onKeyDown={onKeyDown}
          className={cn(
            "px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors",
            error ? "border-red-500" : "border-gray-300"
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);
TextField.displayName = "TextField";
