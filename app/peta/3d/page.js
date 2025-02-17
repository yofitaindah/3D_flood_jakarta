"use client";

import { Box } from "@mui/material";
import React, { useState, useCallback } from "react";
import Header from "./Header";
import MapComponent from "./MapComponent";
import TimeSlider from "./TimeSlider";

const Page = () => {
  const [selectedLayers, setSelectedLayers] = useState({
    buildings: true,
    floodArea1: true,
    floodArea2: true,
    floodArea3: true,
    floodArea4: true,
    floodArea5: true,
    floodArea6: true,
    floodArea7: true,
  });

  const [tmaValues] = useState([0, 40, 80, 120, 160, 200, 240, 280]);
  const [selectedTMA, setSelectedTMA] = useState(tmaValues[0]);

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
        showFloodArea3={selectedLayers.floodArea3}
        showFloodArea4={selectedLayers.floodArea4}
        showFloodArea5={selectedLayers.floodArea5}
        showFloodArea6={selectedLayers.floodArea6}
        showFloodArea7={selectedLayers.floodArea7}
      />
      <MapComponent
        showBuildings={selectedLayers.buildings}
        showFloodArea1={selectedLayers.floodArea1}
        showFloodArea2={selectedLayers.floodArea2}
        showFloodArea3={selectedLayers.floodArea3}
        showFloodArea4={selectedLayers.floodArea4}
        showFloodArea5={selectedLayers.floodArea5}
        showFloodArea6={selectedLayers.floodArea6}
        showFloodArea7={selectedLayers.floodArea7}
        onLayerChange={handleLayerChange}
      />
      {/* Tambahkan TimeSlider di sini */}
      <Box sx={{ position: "absolute", bottom: 20, width: "80%" }}>
        <TimeSlider tmaValues={tmaValues} onChange={setSelectedTMA} />
      </Box>
    </Box>
  );
};

export default Page;
