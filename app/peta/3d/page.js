"use client";

import { Box } from "@mui/material";
import React, { useState, useCallback } from "react";
import Header from "./Header";
import MapComponent from "./MapComponent";
import TimeSlider from "./Timeslider";

const Page = () => {
  const [selectedLayers, setSelectedLayers] = useState({
    buildings: true,
    floodGate: true,
    genanganAll: true,
    street: true,
  });

  const [selectedTime, setSelectedTime] = useState("15:30"); // Changed to match TIMES array
  const [times, setTimes] = useState([]);
  const [basemap, setBasemap] = useState("google");

  const handleLayerChange = useCallback((layerName, checked) => {
    setSelectedLayers((prevLayers) => ({
      ...prevLayers,
      [layerName]: checked,
    }));
    console.log(`Layer ${layerName} set to ${checked}`); // Debugging layer changes
  }, []);

  const handleBasemapChange = useCallback((newBasemap) => {
    setBasemap(newBasemap);
    console.log("Basemap changed to:", newBasemap); // Debugging
  }, []);

  const handleTimeChange = useCallback((time) => {
    setSelectedTime(time);
    console.log("Selected time:", time); // Debugging
  }, []);

  const handleTimesUpdate = useCallback((newTimes) => {
    setTimes(newTimes);
    console.log("Updated times:", newTimes);
  }, []);

  // Handle layer visibility changes from MapComponent
  const handleMapLayerChange = useCallback((layers) => {
    console.log("Active layers:", layers); // Log active layers for debugging
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
        showFloodGate={selectedLayers.floodGate}
        showFloodAreaAll={selectedLayers.genanganAll}
        showStreet={selectedLayers.street}
        basemap={basemap}
        onBasemapChange={handleBasemapChange}
      />
      <MapComponent
        showBuildings={selectedLayers.buildings}
        showFloodGate={selectedLayers.floodGate}
        showFloodAreaAll={selectedLayers.genanganAll}
        showStreet={selectedLayers.street}
        onLayerChange={handleMapLayerChange} // Updated to use callback
        basemap={basemap}
        onBasemapChange={handleBasemapChange}
        selectedTime={selectedTime}
        onTimesUpdate={handleTimesUpdate}
        onTimeChange={handleTimeChange}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 80, // Moved up to avoid overlap with legend/controls
          left: 70, // Center horizontally
          width: "80%",
          maxWidth: 600, // Limit width for better UX
          zIndex: 1,
        }}
      >
        <TimeSlider onTimeChange={handleTimeChange} times={times} />
      </Box>
    </Box>
  );
};

export default Page;
