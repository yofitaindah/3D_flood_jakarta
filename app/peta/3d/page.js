"use client";

import { Box } from "@mui/material";
import React, { useState, useCallback } from "react";
import Header from "./Header";
import MapComponent from "./MapComponent";

const Page = () => {
  const [selectedLayers, setSelectedLayers] = useState({
    buildings: true,
    floodArea1: true, //for 0.4m flood
    floodArea2: true, //for 0.8m flood
  });

  const handleLayerChange = useCallback((layerName, checked) => {
    setSelectedLayers((prevLayers) => ({
      ...prevLayers,
      [layerName]: checked,
    }));
  }, []);

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "0px",
        margin: "0px",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <Header
        onLayerChange={handleLayerChange}
        showBuildings={selectedLayers.buildings}
        showFloodArea1={selectedLayers.floodArea1}
        showFloodArea2={selectedLayers.floodArea2}
      />
      <MapComponent
        showBuildings={selectedLayers.buildings}
        showFloodArea1={selectedLayers.floodArea1}
        showFloodArea2={selectedLayers.floodArea2}
        onLayerChange={handleLayerChange}
      />
    </Box>
  );
};

export default Page;
