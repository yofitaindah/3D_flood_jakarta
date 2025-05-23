"use client";

import {
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Box,
  IconButton,
  Menu,
  MenuItem as MenuItemBase,
  Popover,
} from "@mui/material";
import React, { useState } from "react";
import Image from "next/image";
import MenuIcon from "@mui/icons-material/Menu";

const Header = ({
  onLayerChange,
  showBuildings,
  showFloodGate,
  showFloodAreaAll,
  basemap,
  onBasemapChange,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [layerAnchorEl, setLayerAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLayerMenuOpen = (event) => {
    setLayerAnchorEl(anchorEl);
    handleMenuClose();
  };
  const handleLayerMenuClose = () => {
    setLayerAnchorEl(null);
  };

  const handleBuildingsChange = (event) => {
    onLayerChange("buildings", event.target.checked);
  };

  const handleFloodGateChange = (event) => {
    onLayerChange("floodGate", event.target.checked);
  };

  const handleGenanganAllChange = (event) => {
    onLayerChange("genanganAll", event.target.checked);
  };

  return (
    <Box
      sx={{
        width: { xs: "95%", md: "90%" },
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
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Image
          src="/logo_js.png"
          alt="Logo"
          layout="intrinsic"
          width={100}
          height={50}
        />
      </Box>

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

      <IconButton
        sx={{ marginLeft: "auto" }}
        onClick={handleMenuOpen}
        aria-controls="menu"
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl) ? "true" : undefined}
      >
        <MenuIcon />
      </IconButton>

      <Menu
        id="menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        MenuListProps={{
          "aria-labelledby": "menu-button",
        }}
        sx={{
          zIndex: 1500,
        }}
      >
        <MenuItem onClick={handleLayerMenuOpen}>Layer</MenuItem>
      </Menu>

      <Popover
        id="layer-menu"
        anchorEl={layerAnchorEl}
        open={Boolean(layerAnchorEl)}
        onClose={handleLayerMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
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
                color: "brown",
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showFloodAreaAll}
                  onChange={handleGenanganAllChange}
                  name="genanganAll"
                />
              }
              label="Genangan Banjir"
              sx={{
                color: "red",
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showFloodGate}
                  onChange={handleFloodGateChange}
                  name="floodGate"
                />
              }
              label="Titik Pintu Air"
              sx={{
                color: "red",
              }}
            />
          </FormGroup>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
            Basemap
          </Typography>
          <Select
            value={basemap}
            onChange={(e) => onBasemapChange(e.target.value)}
            size="small"
            fullWidth
            sx={{ mt: 1 }}
          >
            <MenuItem value="google">Google Maps</MenuItem>
            <MenuItem value="osm">OpenStreetMap</MenuItem>
          </Select>
        </Box>
      </Popover>
    </Box>
  );
};

export default Header;
