import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import Image from "next/image";

const Header = () => {
  return (
    <Box
      sx={{
        width: "90%",
        height: "50px",
        position: "absolute",
        display: "flex",
        zIndex: 999,
        color: "black",
        backgroundColor: "white",
        marginTop: "20px",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Logo */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Image
          src="/logo_js.png"
          alt="Logo"
          layout="intrinsic"
          width={100}
          height={50}
        />
      </Box>

      {/* Title */}
      <Typography
        variant="h6"
        component="div"
        sx={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        3D Flood WebGIS Jakarta
      </Typography>
    </Box>
  );
};

export default Header;
