import { forwardRef, useState, useRef, useEffect } from "react";
import type { HTMLAttributes } from "react";
import { mergeClassnames } from "../../utils/mergeClassnames";

export type SelectOption = {
  value: string | number;
  label: string;
};

export type SelectProps = HTMLAttributes<HTMLDivElement> & {
  error?: string;
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  initialLabel?: string;
};

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    { error, options, value, onChange, initialLabel, className, ...props },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Deriva o valor selecionado da prop value em vez de usar estado
    const selected = (!value || value === "") 
      ? null 
      : options.find((o) => o.value === value) || null;

    // Fecha ao clicar fora
    useEffect(() => {
      if (!isOpen) return;

      function handleClickOutside(event: MouseEvent) {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSelect = (option: SelectOption) => {
      onChange?.(option.value);
      setIsOpen(false);
    };

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={mergeClassnames("flex flex-col gap-1.5 relative", className)}
        {...props}
      >
        {/* Input custom */}
        <div
          className={mergeClassnames(
            "h-11 rounded-control border px-3.5 text-sm font-normal bg-surface cursor-pointer flex items-center justify-between transition-colors",
            error ? "border-expense" : isOpen ? "border-brand ring-2 ring-brand/30" : "border-line"
          )}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className={mergeClassnames("truncate", !selected && "text-ink-muted")}>
            {selected?.label || initialLabel}
          </span>
          <svg
            className={mergeClassnames(
              "w-4 h-4 text-ink-faint transition-transform duration-200 shrink-0",
              isOpen ? "rotate-180" : "rotate-0"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <ul className="absolute top-full mt-1.5 min-w-full w-max border border-line-soft rounded-control bg-surface z-10 max-h-60 overflow-auto shadow-panel py-1">
            {options.map((option) => (
              <li
                key={option.value}
                className={mergeClassnames(
                  "px-3.5 py-2 text-sm cursor-pointer hover:bg-brand-soft hover:text-brand transition-colors",
                  option.value === value && "bg-brand-soft text-brand font-medium"
                )}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </li>              
            ))}
          </ul>
        )}

        {/* Erro */}
        {error && (
          <span className="text-xs text-expense">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
