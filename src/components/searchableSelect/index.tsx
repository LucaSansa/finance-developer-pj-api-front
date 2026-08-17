import { forwardRef, useState, useRef, useEffect } from "react";
import { mergeClassnames } from "../../utils/mergeClassnames";
import type { SelectOption } from "../select";

type SearchableSelectProps = {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
};

export const SearchableSelect = forwardRef<HTMLDivElement, SearchableSelectProps>(
  ({ options, value, onChange, placeholder = "Buscar...", error, className }, ref) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selected = options.find((o) => o.value === value) ?? null;

    // normaliza acentos para comparação (ex: "agua" encontra "Água")
    const normalize = (s: string) =>
      s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // deduplica por label — a API pode retornar nomes iguais com IDs distintos
    const seen = new Set<string>();
    const unique = options.filter((o) => {
      const key = normalize(o.label);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const filtered = query.trim()
      ? unique.filter((o) => normalize(o.label).includes(normalize(query)))
      : unique;

    useEffect(() => {
      if (!isOpen) return;
      function handleClickOutside(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
          setQuery("");
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    function handleOpen() {
      setIsOpen(true);
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }

    function handleSelect(option: SelectOption) {
      onChange?.(String(option.value));
      setIsOpen(false);
      setQuery("");
    }

    function handleClear(e: React.MouseEvent) {
      e.stopPropagation();
      onChange?.("");
    }

    return (
      <div
        ref={(node) => {
          containerRef.current = node!;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={mergeClassnames("relative flex flex-col gap-1", className)}
      >
        {/* Trigger */}
        <div
          onClick={handleOpen}
          className={mergeClassnames(
            "h-10 border rounded-md px-3 bg-white flex items-center justify-between cursor-pointer gap-2 text-sm",
            error ? "border-red-400" : "border-gray-300",
            isOpen && "ring-2 ring-blue-500 border-blue-500"
          )}
        >
          {isOpen ? (
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Buscar tipo..."
              className="flex-1 outline-none text-sm bg-transparent"
            />
          ) : (
            <span className={mergeClassnames("flex-1 truncate", !selected && "text-gray-400")}>
              {selected?.label ?? placeholder}
            </span>
          )}

          <div className="flex items-center gap-1 shrink-0">
            {selected && !isOpen && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 leading-none"
                tabIndex={-1}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <svg
              className={mergeClassnames("w-4 h-4 text-gray-500 transition-transform duration-200", isOpen && "rotate-180")}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <ul className="absolute top-full mt-1 left-0 min-w-full w-max z-20 bg-white border border-gray-200 rounded-md shadow-lg max-h-52 overflow-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">Nenhum resultado</li>
            ) : (
              filtered.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={mergeClassnames(
                    "px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700",
                    option.value === value && "bg-blue-100 text-blue-700 font-medium"
                  )}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        )}

        {error && <span className="text-red-500 text-xs">{error}</span>}
      </div>
    );
  }
);

SearchableSelect.displayName = "SearchableSelect";
