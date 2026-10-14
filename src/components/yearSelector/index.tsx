import { useState } from "react";
import { Menu, MenuItem } from "@mui/material";

interface YearSelectorProps {
  year: number;
  onChangeYear: (year: number) => void;
}

export function YearSelector({ year, onChangeYear }: YearSelectorProps) {
  const currentYear = new Date().getFullYear();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const years = Array.from(
    { length: currentYear - 2020 + 1 },
    (_, index) => 2020 + index
  ).reverse();

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectYear = (selectedYear: number) => {
    onChangeYear(selectedYear);
    handleClose();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="h-10 px-4 rounded-control border border-line bg-surface text-sm font-medium text-ink flex items-center gap-2 hover:border-line-strong transition-colors"
      >
        Ano: {year}
        <svg
          className={`w-4 h-4 text-ink-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              width: anchorEl?.offsetWidth,
              borderRadius: "0.75rem",
              boxShadow: "var(--shadow-panel)",
              border: "1px solid var(--color-line-soft)",
              mt: "6px",
            },
          },
        }}
      >
        {years.map((y) => (
          <MenuItem
            key={y}
            selected={y === year}
            onClick={() => handleSelectYear(y)}
            sx={{
              fontWeight: y === year ? 600 : 400,
              color: y === year ? "var(--color-brand)" : "var(--color-ink)",
              "&.Mui-selected": { backgroundColor: "var(--color-brand-soft)" },
            }}
          >
            {y}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
