import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { mergeClassnames } from "../../utils/mergeClassnames";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, placeholder, className, ...props }, ref) => {
    return (
      <div
        className={mergeClassnames(
          "flex flex-col gap-1.5",
          props.disabled ? "opacity-60" : "opacity-100"
        )}
      >
        <input
          ref={ref}
          placeholder={placeholder}
          {...props}
          className={mergeClassnames(
            "h-11 rounded-control border px-3.5 text-sm text-ink font-normal bg-surface outline-none transition-colors focus:ring-2 focus:ring-brand/30 placeholder:text-ink-muted",
            props.disabled ? "bg-surface-inset" : "",
            error ? "border-expense" : "border-line focus:border-brand",
            className
          )}
        />
        {error && (
          <span className="text-xs text-expense">{error}</span>
        )}
      </div>
    );
  }
);
