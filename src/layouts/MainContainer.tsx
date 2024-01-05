import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { Outlet } from "react-router-dom";
import DrawerHeader from "./DrawerHeader";

const Routing: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 1,
        overflow: "auto",
        minHeight: `calc(100vh - ${theme.spacing(3)})`,
      }}
    >
      <DrawerHeader />
      <Outlet />
      <DrawerHeader />
    </Box>
  );
};

export default Routing;
