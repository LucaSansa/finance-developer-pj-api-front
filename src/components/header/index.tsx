import {
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";


import { authLogoutService } from "../../services/auth/logout";
import { useSession } from "../../stores/session";
import { getErrorMessage } from "../../utils/getErrorMessage";

export function Header() {
  const { destroySession, user } = useSession();
  const navigate = useNavigate();

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <header className="border-b border-line-soft bg-canvas">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-18 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-control bg-brand text-white flex items-center justify-center font-bold text-sm shrink-0">
              FD
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold text-ink">Finance Developer</span>
              <span className="text-xs text-ink-faint">Gestão financeira PJ</span>
            </div>
          </div>

          <Box sx={{ flexGrow: 0 }}>
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar
                sx={{ bgcolor: "var(--color-brand)", width: 38, height: 38, fontSize: 15 }}
              >
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </Avatar>
            </IconButton>

            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: "0.75rem",
                    boxShadow: "var(--shadow-panel)",
                    border: "1px solid var(--color-line-soft)",
                  },
                },
              }}
            >
              {user?.name && (
                <MenuItem disabled sx={{ opacity: "1 !important" }}>
                  <Typography sx={{ textAlign: "center", fontWeight: 600, color: "var(--color-ink)" }}>
                    {user.name}
                  </Typography>
                </MenuItem>
              )}
              <MenuItem
                onClick={async () => {
                  try {
                    await authLogoutService.logout();
                  } catch (error) {
                    toast.error(getErrorMessage(error, "Erro ao encerrar sessão."));
                  } finally {
                    destroySession();
                    navigate("/login");
                  }
                }}
              >
                <Typography sx={{ textAlign: "center", color: "var(--color-expense)" }}>Sair</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </div>
      </div>
    </header>
  );
}
