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
          "flex flex-col gap-2",
          props.disabled ? "opacity-35" : "opacity-100"
        )}
      >
        <input
          ref={ref}
          placeholder={placeholder}
          {...props}
          className={mergeClassnames(
            "h-12.5 border border-[#D7DBE4] px-2 text-[18px] py-2.5 font-normal",
            className
          )}
        />
        {error && (
          <span className="text-red-500 text-[max(12px, 0.78em)]">{error}</span>
        )}
      </div>
    );
  }
);
