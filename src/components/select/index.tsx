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
        ref={containerRef}
        className={mergeClassnames("flex flex-col gap-2 relative", className)}
        {...props}
      >
        {/* Input custom */}
        <div
          className={mergeClassnames(
            "h-12.5 border border-[#D7DBE4] px-5 pr-5 text-[18px] py-2.5 font-normal bg-white cursor-pointer flex items-center justify-between"
          )}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className="truncate">{selected?.label || initialLabel}</span>
          <svg
            className={mergeClassnames(
              "w-5 h-5 text-gray-700 transition-transform duration-200",
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
          // <ul className="absolute w-full border border-[#D7DBE4] bg-white mt-13 z-10 max-h-60 overflow-auto shadow-md">

          <ul className="absolute min-w-full w-max border border-[#D7DBE4] bg-white mt-13 z-10 max-h-60 overflow-auto shadow-md">
            {options.map((option) => (
              <li
                key={option.value}
                className="px-5 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </li>              
            ))}
          </ul>
        )}

        {/* Erro */}
        {error && (
          <span className="text-red-500 text-[max(12px, 0.78em)]">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
