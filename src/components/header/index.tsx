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


import { authLogoutService } from "../../services/auth/logout";
import { useSession } from "../../stores/session";

export function Header() {
  const { destroySession } = useSession.getState();
  const navigate = useNavigate();

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <header className="bg-gray-300 shadow-sm ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Finance Developer
            </h1>
          </div>

          <Box sx={{ flexGrow: 0 }}>
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt="Remy Sharp" />
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
            >
              <MenuItem onClick={() => {}}>
                <Typography sx={{ textAlign: "center" }}>Profile</Typography>
              </MenuItem>
              <MenuItem
                onClick={async () => {
                  await authLogoutService.logout();
                  destroySession();
                  navigate("/login");
                }}
              >
                <Typography sx={{ textAlign: "center" }}>Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </div>
      </div>
    </header>
  );
}
