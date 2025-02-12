"use client"; // Tambahkan ini untuk Next.js

import {
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import { Box, IconButton, Menu, MenuItem, Popover } from "@mui/material";
import React, { useState } from "react";
import Image from "next/image";
import MenuIcon from "@mui/icons-material/Menu";

const Header = ({
  onLayerChange,
  showBuildings,
  showFloodArea1,
  showFloodArea2,
  showFloodArea3,
  showFloodArea4,
  showFloodArea5,
  showFloodArea6,
  showFloodArea7,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [layerAnchorEl, setLayerAnchorEl] = useState(null);

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
    onLayerChange("buildings", event.target.checked);
  };

  const handleFloodArea1Change = (event) => {
    onLayerChange("floodArea1", event.target.checked);
  };

  const handleFloodArea2Change = (event) => {
    onLayerChange("floodArea2", event.target.checked);
  };

  const handleFloodArea3Change = (event) => {
    onLayerChange("floodArea3", event.target.checked);
  };

  const handleFloodArea4Change = (event) => {
    onLayerChange("floodArea4", event.target.checked);
  };

  const handleFloodArea5Change = (event) => {
    onLayerChange("floodArea5", event.target.checked);
  };

  const handleFloodArea6Change = (event) => {
    onLayerChange("floodArea6", event.target.checked);
  };

  const handleFloodArea7Change = (event) => {
    onLayerChange("floodArea7", event.target.checked);
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
          zIndex: 1500,
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
        transformOrigin={{
          vertical: "top",
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
              label="Bangunan"
              sx={{
                color: "brown", // Warna coklat untuk teks
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showFloodArea1}
                  onChange={handleFloodArea1Change}
                  name="floodArea1"
                />
              }
              label="Banjir 0.4m"
              sx={{
                color: "blue", // Warna biru untuk teks
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showFloodArea2}
                  onChange={handleFloodArea2Change}
                  name="floodArea2"
                />
              }
              label="Banjir 0.8m"
              sx={{
                color: "blue", // Warna biru untuk teks
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showFloodArea3}
                  onChange={handleFloodArea3Change}
                  name="floodArea3"
                />
              }
              label="Banjir 1.2m"
              sx={{
                color: "blue", // Warna biru untuk teks
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showFloodArea4}
                  onChange={handleFloodArea4Change}
                  name="floodArea4"
                />
              }
              label="Banjir 1.6m"
              sx={{
                color: "blue", // Warna biru untuk teks
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showFloodArea5}
                  onChange={handleFloodArea5Change}
                  name="floodArea5"
                />
              }
              label="Banjir 2m"
              sx={{
                color: "blue", // Warna biru untuk teks
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showFloodArea6}
                  onChange={handleFloodArea6Change}
                  name="floodArea6"
                />
              }
              label="Banjir 2.4m"
              sx={{
                color: "blue", // Warna biru untuk teks
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showFloodArea7}
                  onChange={handleFloodArea7Change}
                  name="floodArea7"
                />
              }
              label="Banjir >2.4m"
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
