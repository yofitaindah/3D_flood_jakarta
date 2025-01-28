"use client"; // Menjadikan komponen ini sebagai Client Component

import { Typography, Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { Box, IconButton, Menu, MenuItem, Popover } from "@mui/material";
import React, { useState } from "react";
import Image from "next/image";
import MenuIcon from "@mui/icons-material/Menu";

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [layerAnchorEl, setLayerAnchorEl] = useState(null);
  const [showBuildings, setShowBuildings] = useState(false);
  const [showFloodArea, setShowFloodArea] = useState(false);

  // Handle burger menu open/close
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle layer menu open/close
  const handleLayerMenuOpen = (event) => {
    setLayerAnchorEl(event.currentTarget);
  };
  const handleLayerMenuClose = () => {
    setLayerAnchorEl(null);
  };

  // Handle checkbox changes
  const handleBuildingsChange = (event) => {
    setShowBuildings(event.target.checked);
  };

  const handleFloodAreaChange = (event) => {
    setShowFloodArea(event.target.checked);
  };

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

      {/* Burger Button */}
      <IconButton
        sx={{ marginLeft: "auto" }}
        onClick={handleMenuOpen}
        aria-controls="menu"
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl) ? "true" : undefined}
      >
        <MenuIcon />
      </IconButton>

      {/* Dropdown Menu */}
      <Menu
        id="menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        MenuListProps={{
          "aria-labelledby": "menu-button",
        }}
        sx={{
          mt: "40px",
        }}
      >
        <MenuItem onClick={handleLayerMenuOpen}>Layer</MenuItem>
      </Menu>

      {/* Layer Options */}
      <Popover
        id="layer-menu"
        anchorEl={layerAnchorEl}
        open={Boolean(layerAnchorEl)}
        onClose={handleLayerMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        sx={{
          mt: "10px",
        }}
      >
        <Box sx={{ p: 2, width: 200 }}>
          <Typography variant="subtitle1" gutterBottom>
            Layer Options
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showBuildings}
                  onChange={handleBuildingsChange}
                  name="buildings"
                />
              }
              label="Tampilkan Bangunan"
              sx={{
                color: "brown", // Warna coklat untuk teks
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showFloodArea}
                  onChange={handleFloodAreaChange}
                  name="floodArea"
                />
              }
              label="Tampilkan Area Banjir"
              sx={{
                color: "blue", // Warna biru untuk teks
              }}
            />
          </FormGroup>
        </Box>
      </Popover>
    </Box>
  );
};

export default Header;
