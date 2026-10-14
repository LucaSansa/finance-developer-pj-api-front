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
            "h-11 rounded-control border px-3.5 bg-surface flex items-center justify-between cursor-pointer gap-2 text-sm transition-colors",
            error ? "border-expense" : "border-line",
            isOpen && "ring-2 ring-brand/30 border-brand"
          )}
        >
          {isOpen ? (
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Buscar tipo..."
              className="flex-1 outline-none text-sm bg-transparent text-ink"
            />
          ) : (
            <span className={mergeClassnames("flex-1 truncate", !selected && "text-ink-muted")}>
              {selected?.label ?? placeholder}
            </span>
          )}

          <div className="flex items-center gap-1 shrink-0">
            {selected && !isOpen && (
              <button
                type="button"
                onClick={handleClear}
                className="text-ink-faint hover:text-ink leading-none"
                tabIndex={-1}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <svg
              className={mergeClassnames("w-4 h-4 text-ink-faint transition-transform duration-200", isOpen && "rotate-180")}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <ul className="absolute top-full mt-1.5 left-0 min-w-full w-max z-20 bg-surface border border-line-soft rounded-control shadow-panel max-h-52 overflow-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3.5 py-2 text-sm text-ink-muted">Nenhum resultado</li>
            ) : (
              filtered.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={mergeClassnames(
                    "px-3.5 py-2 text-sm cursor-pointer hover:bg-brand-soft hover:text-brand transition-colors",
                    option.value === value && "bg-brand-soft text-brand font-medium"
                  )}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        )}

        {error && <span className="text-xs text-expense">{error}</span>}
      </div>
    );
  }
);

SearchableSelect.displayName = "SearchableSelect";
