import { useState } from "react";
import { Button, Menu, MenuItem } from "@mui/material";

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
      <Button variant="contained" onClick={handleOpen}>
        Ano: {year}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              width: anchorEl?.offsetWidth,
            },
          },
        }}
      >
        {years.map((y) => (
          <MenuItem
            key={y}
            selected={y === year}
            onClick={() => handleSelectYear(y)}
          >
            {y}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
