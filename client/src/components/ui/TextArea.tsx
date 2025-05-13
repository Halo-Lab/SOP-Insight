import * as React from "react";
import { cn } from "@/lib/utils";

type TextAreaProps = {
  label?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  name?: string;
  rows?: number;
  ariaLabel?: string;
  tabIndex?: number;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
};

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      required = false,
      placeholder,
      value,
      onChange,
      name,
      rows = 4,
      ariaLabel,
      tabIndex = 0,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const textAreaId = React.useId();
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label
            htmlFor={textAreaId}
            className="text-sm font-medium text-gray-700"
          >
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textAreaId}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={ariaLabel || label}
          aria-invalid={!!error}
          aria-required={required}
          tabIndex={tabIndex}
          onKeyDown={onKeyDown}
          className={cn(
            "px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors resize-none",
            error ? "border-red-500" : "border-gray-300"
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);
TextArea.displayName = "TextArea";
